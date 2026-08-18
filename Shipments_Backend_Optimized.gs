/**
 * ============================================================================
 * SHIPMENTS GOOGLE APPS SCRIPT — HIGH-PERFORMANCE PRODUCTION BACKEND
 * ============================================================================
 * 
 * Target: Google Apps Script Web App for Shipments Management
 * Endpoint: SHIPMENTS_API_URL
 * 
 * Features & Optimizations:
 * 1. In-Memory Server-Side CacheService (CacheService.getScriptCache())
 * 2. 1-Trip Bulk Spreadsheet Read (sheet.getDataRange().getDisplayValues())
 * 3. Cache Invalidation upon successful mutations (add, update, delete)
 * 4. Chunked Cache Storage (handles payloads > 100KB)
 * 5. Secure, short-lived Token Verification Caching (reduces cross-script latency)
 * 6. Concurrency Control with LockService
 * 7. Server-Side Execution Timing Diagnostics
 * 8. Preserved 100% API compatibility with React frontend
 */

// ============================================================================
// CONFIGURATION
// ============================================================================
const CONFIG = {
  SPREADSHEET_ID: '12Rssx7zmW42sdmT2nnQGER0gMrn4bvD7KVvr6J5K5vE', // Or Active Spreadsheet
  SHEET_NAME: 'Shipments', // Tab name for shipments
  USERS_API_URL: 'https://script.google.com/macros/s/AKfycbwuIf3kCo6KBe5pVgQXUxF3ZvF_paDzfrGtxCmwmivmNT1NQA4KUF2QCJPBXxKzjB_z/exec',
  CACHE_KEY_PREFIX: 'shipments_data_v1',
  CACHE_TTL_SECONDS: 21600, // 6 hours (auto-invalidated on write)
  TOKEN_CACHE_TTL_SECONDS: 300, // 5 minutes cache for valid session tokens
  CHUNK_SIZE: 90000, // Safe chunk size below CacheService 100KB limit
  ENABLE_TIMING_LOGS: true
};

// ============================================================================
// MAIN HTTP ENTRY POINT (doPost)
// ============================================================================
function doPost(e) {
  const t0 = new Date().getTime();
  let action = 'unknown';

  try {
    if (!e || !e.postData || !e.postData.contents) {
      return createJsonResponse({ success: false, message: 'Invalid or empty request payload' }, 400);
    }

    const payload = JSON.parse(e.postData.contents);
    action = payload.action || 'unknown';
    const token = payload.token;

    logTiming('A. Request start', t0);

    // 1. Mandatory Token Verification (except public ping if any)
    const tAuth0 = new Date().getTime();
    const authResult = verifyAuthToken(token);
    logTiming('B. Token verification', tAuth0);

    if (!authResult.valid) {
      return createJsonResponse({
        success: false,
        message: authResult.message || 'Unauthorized'
      });
    }

    const user = authResult.user || {};
    const isHedy = (user.user_id === 'USR-007' || (user.name && user.name.toLowerCase() === 'hedy'));
    const isEditor = (user.role === 'editor' || user.role === 'admin');

    // 2. Action Routing
    let result;
    switch (action) {
      case 'getShipments':
        result = handleGetShipments(isHedy, t0);
        break;

      case 'getShipment':
        result = handleGetShipment(payload.shipmentId, isHedy);
        break;

      case 'addShipment':
        if (!isEditor) {
          return createJsonResponse({ success: false, message: 'Forbidden: Insufficient permissions to add shipments' });
        }
        result = handleAddShipment(payload.shipment || payload.data || payload);
        break;

      case 'updateShipment':
        if (!isEditor) {
          return createJsonResponse({ success: false, message: 'Forbidden: Insufficient permissions to update shipments' });
        }
        result = handleUpdateShipment(payload.shipmentId, payload.updates || payload.shipment || payload.data);
        break;

      case 'deleteShipment':
        if (!isEditor) {
          return createJsonResponse({ success: false, message: 'Forbidden: Insufficient permissions to delete shipments' });
        }
        result = handleDeleteShipment(payload.shipmentId);
        break;

      default:
        return createJsonResponse({ success: false, message: 'Unknown action: ' + action });
    }

    const totalTime = new Date().getTime() - t0;
    if (CONFIG.ENABLE_TIMING_LOGS) {
      console.log(`[PERF] Action "${action}" completed in ${totalTime}ms`);
    }

    return createJsonResponse(result);

  } catch (err) {
    console.error(`[ERROR] Exception in doPost (${action}):`, err);
    return createJsonResponse({
      success: false,
      message: err.message || 'An internal server error occurred'
    });
  }
}

// ============================================================================
// TOKEN VERIFICATION (With Secure 5-Minute Cache)
// ============================================================================
function verifyAuthToken(token) {
  if (!token || typeof token !== 'string' || token.trim() === '') {
    return { valid: false, message: 'Missing session token' };
  }

  const cleanToken = token.trim();
  const cache = CacheService.getScriptCache();
  const tokenHash = 'tok_' + Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, cleanToken)).substring(0, 16);

  // 1. Check in-memory token cache
  const cachedAuth = cache.get(tokenHash);
  if (cachedAuth) {
    try {
      const parsed = JSON.parse(cachedAuth);
      return { valid: true, user: parsed };
    } catch (e) {
      // Cache parse error, proceed to live verification
    }
  }

  // 2. Query Users API to verify token
  try {
    const options = {
      method: 'post',
      contentType: 'text/plain;charset=utf-8',
      payload: JSON.stringify({
        action: 'verifyToken',
        token: cleanToken
      }),
      muteHttpExceptions: true
    };

    const response = UrlFetchApp.fetch(CONFIG.USERS_API_URL, options);
    const code = response.getResponseCode();
    const body = response.getContentText();

    if (code !== 200) {
      return { valid: false, message: 'Auth service unreachable' };
    }

    const json = JSON.parse(body);
    if (json && (json.success === true || json.valid === true)) {
      const user = json.user || { role: json.role || 'user', user_id: json.user_id || json.userId || '' };
      
      // Store in script cache for 5 minutes (reduces 1.5s cross-script latency)
      cache.put(tokenHash, JSON.stringify(user), CONFIG.TOKEN_CACHE_TTL_SECONDS);

      return { valid: true, user: user };
    }

    return { valid: false, message: json.message || 'Invalid or expired session token' };
  } catch (err) {
    console.error('Token verification error:', err);
    return { valid: false, message: 'Token verification failed' };
  }
}

// ============================================================================
// GET SHIPMENTS (Cached & Bulk-Read Optimized)
// ============================================================================
function handleGetShipments(isHedy, t0) {
  const cache = CacheService.getScriptCache();
  const tCache0 = new Date().getTime();

  // 1. Try reading from CacheService
  const cachedData = getChunkedCache(cache, CONFIG.CACHE_KEY_PREFIX);
  logTiming('Cache read attempt', tCache0);

  let allShipments = null;

  if (cachedData) {
    try {
      allShipments = JSON.parse(cachedData);
      if (CONFIG.ENABLE_TIMING_LOGS) {
        console.log(`[CACHE HIT] Loaded ${allShipments.length} shipments from CacheService`);
      }
    } catch (e) {
      allShipments = null;
    }
  }

  // 2. Cache Miss: Bulk read from Google Sheet with LockService
  if (!allShipments) {
    if (CONFIG.ENABLE_TIMING_LOGS) {
      console.log('[CACHE MISS] Rebuilding cache from Google Sheet');
    }

    const lock = LockService.getScriptLock();
    const hasLock = lock.tryLock(10000); // 10s wait

    try {
      // Recheck cache in case another concurrent request just populated it
      const doubleCheck = getChunkedCache(cache, CONFIG.CACHE_KEY_PREFIX);
      if (doubleCheck) {
        allShipments = JSON.parse(doubleCheck);
      } else {
        const tSheet0 = new Date().getTime();
        const sheet = getShipmentsSheet();
        logTiming('C. Spreadsheet open', tSheet0);

        const tRead0 = new Date().getTime();
        const rawValues = sheet.getDataRange().getDisplayValues();
        logTiming('D. Sheet data read', tRead0);

        const tTransform0 = new Date().getTime();
        allShipments = transformSheetRowsToObjects(rawValues);
        logTiming('E. Data transformation', tTransform0);

        // Store into CacheService
        const jsonStr = JSON.stringify(allShipments);
        setChunkedCache(cache, CONFIG.CACHE_KEY_PREFIX, jsonStr, CONFIG.CACHE_TTL_SECONDS);
      }
    } finally {
      if (hasLock) {
        lock.releaseLock();
      }
    }
  }

  // 3. Filter private 'notes hidy' field if user is not Hedy
  const tFilter0 = new Date().getTime();
  let sanitizedShipments = allShipments;
  if (!isHedy) {
    sanitizedShipments = allShipments.map(item => {
      if (item['notes hidy'] !== undefined) {
        const copy = Object.assign({}, item);
        delete copy['notes hidy'];
        return copy;
      }
      return item;
    });
  }
  logTiming('F. Filtering & privacy enforcement', tFilter0);

  return {
    success: true,
    data: sanitizedShipments,
    shipments: sanitizedShipments
  };
}

// ============================================================================
// GET SINGLE SHIPMENT
// ============================================================================
function handleGetShipment(shipmentId, isHedy) {
  if (!shipmentId) {
    return { success: false, message: 'Missing shipmentId parameter' };
  }

  const allRes = handleGetShipments(isHedy, new Date().getTime());
  const shipments = allRes.shipments || [];
  const found = shipments.find(s => String(s['Shipment ID']).trim() === String(shipmentId).trim());

  if (!found) {
    return { success: false, message: 'Shipment not found: ' + shipmentId };
  }

  return { success: true, shipment: found, data: found };
}

// ============================================================================
// MUTATIONS (Add, Update, Delete with Invalidation)
// ============================================================================
function handleAddShipment(newShipmentData) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);

  try {
    const sheet = getShipmentsSheet();
    const rawValues = sheet.getDataRange().getDisplayValues();
    const headers = rawValues[0];

    // Generate Monotonic Shipment ID (e.g. SHP-1001)
    const newId = generateNextShipmentId(rawValues);
    newShipmentData['Shipment ID'] = newId;

    // Build row array in matching column order
    const row = headers.map(header => {
      const hTrim = header.trim();
      return newShipmentData[hTrim] !== undefined ? newShipmentData[hTrim] : '';
    });

    sheet.appendRow(row);

    // Invalidate Cache after confirmed sheet write
    invalidateServerCache();

    return {
      success: true,
      shipmentId: newId,
      message: 'Shipment created successfully'
    };
  } finally {
    lock.releaseLock();
  }
}

function handleUpdateShipment(shipmentId, updates) {
  if (!shipmentId || !updates) {
    return { success: false, message: 'Missing shipmentId or updates' };
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(15000);

  try {
    const sheet = getShipmentsSheet();
    const rawValues = sheet.getDataRange().getDisplayValues();
    const headers = rawValues[0];
    const idColIndex = headers.findIndex(h => h.trim() === 'Shipment ID');

    if (idColIndex === -1) {
      return { success: false, message: 'Shipment ID column not found in sheet' };
    }

    let targetRowIndex = -1;
    for (let r = 1; r < rawValues.length; r++) {
      if (String(rawValues[r][idColIndex]).trim() === String(shipmentId).trim()) {
        targetRowIndex = r + 1; // 1-based sheet row index
        break;
      }
    }

    if (targetRowIndex === -1) {
      return { success: false, message: 'Shipment not found: ' + shipmentId };
    }

    // Apply updates
    headers.forEach((header, cIndex) => {
      const hTrim = header.trim();
      if (hTrim !== 'Shipment ID' && updates[hTrim] !== undefined) {
        sheet.getRange(targetRowIndex, cIndex + 1).setValue(updates[hTrim]);
      }
    });

    // Invalidate Cache after confirmed sheet write
    invalidateServerCache();

    return {
      success: true,
      message: 'Shipment updated successfully',
      shipmentId: shipmentId
    };
  } finally {
    lock.releaseLock();
  }
}

function handleDeleteShipment(shipmentId) {
  if (!shipmentId) {
    return { success: false, message: 'Missing shipmentId parameter' };
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(15000);

  try {
    const sheet = getShipmentsSheet();
    const rawValues = sheet.getDataRange().getDisplayValues();
    const headers = rawValues[0];
    const idColIndex = headers.findIndex(h => h.trim() === 'Shipment ID');

    if (idColIndex === -1) {
      return { success: false, message: 'Shipment ID column not found in sheet' };
    }

    let targetRowIndex = -1;
    for (let r = 1; r < rawValues.length; r++) {
      if (String(rawValues[r][idColIndex]).trim() === String(shipmentId).trim()) {
        targetRowIndex = r + 1; // 1-based sheet row index
        break;
      }
    }

    if (targetRowIndex === -1) {
      return { success: false, message: 'Shipment not found: ' + shipmentId };
    }

    sheet.deleteRow(targetRowIndex);

    // Invalidate Cache after confirmed sheet write
    invalidateServerCache();

    return {
      success: true,
      message: 'Shipment deleted successfully',
      shipmentId: shipmentId
    };
  } finally {
    lock.releaseLock();
  }
}

// ============================================================================
// HELPER FUNCTIONS & CACHE MANAGEMENT
// ============================================================================

function getShipmentsSheet() {
  let ss;
  if (CONFIG.SPREADSHEET_ID && CONFIG.SPREADSHEET_ID !== 'ACTIVE') {
    ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  } else {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  }

  const sheet = ss.getSheetByName(CONFIG.SHEET_NAME) || ss.getSheets()[0];
  if (!sheet) {
    throw new Error('Target sheet not found: ' + CONFIG.SHEET_NAME);
  }
  return sheet;
}

function transformSheetRowsToObjects(rawValues) {
  if (!rawValues || rawValues.length < 2) return [];

  const headers = rawValues[0].map(h => String(h).trim());
  const rows = [];

  for (let i = 1; i < rawValues.length; i++) {
    const rowData = rawValues[i];
    
    // Skip empty rows
    const hasData = rowData.some(val => val !== null && String(val).trim() !== '');
    if (!hasData) continue;

    const obj = {};
    headers.forEach((header, index) => {
      if (header) {
        obj[header] = rowData[index] !== undefined ? rowData[index] : '';
      }
    });

    rows.push(obj);
  }

  return rows;
}

function generateNextShipmentId(rawValues) {
  let maxIdNum = 1000;
  if (rawValues && rawValues.length > 1) {
    const headers = rawValues[0];
    const idIdx = headers.findIndex(h => h.trim() === 'Shipment ID');
    if (idIdx !== -1) {
      for (let r = 1; r < rawValues.length; r++) {
        const val = String(rawValues[r][idIdx]).trim();
        const match = val.match(/SHP-(\d+)/i);
        if (match) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num > maxIdNum) {
            maxIdNum = num;
          }
        }
      }
    }
  }
  return 'SHP-' + (maxIdNum + 1);
}

function invalidateServerCache() {
  try {
    const cache = CacheService.getScriptCache();
    const countStr = cache.get(CONFIG.CACHE_KEY_PREFIX + '_chunks');
    const count = countStr ? parseInt(countStr, 10) : 1;

    const keysToRemove = [CONFIG.CACHE_KEY_PREFIX, CONFIG.CACHE_KEY_PREFIX + '_chunks'];
    for (let i = 0; i < count; i++) {
      keysToRemove.push(CONFIG.CACHE_KEY_PREFIX + '_' + i);
    }

    cache.removeAll(keysToRemove);
    console.log('[CACHE INVALIDATED] Purged shipments cache');
  } catch (e) {
    console.error('Error invalidating cache:', e);
  }
}

// Chunked cache helpers to handle > 100KB data
function setChunkedCache(cache, baseKey, jsonString, ttl) {
  try {
    const len = jsonString.length;
    const numChunks = Math.ceil(len / CONFIG.CHUNK_SIZE);

    if (numChunks === 1) {
      cache.put(baseKey, jsonString, ttl);
      cache.put(baseKey + '_chunks', '1', ttl);
      return;
    }

    const entries = {};
    entries[baseKey + '_chunks'] = String(numChunks);

    for (let i = 0; i < numChunks; i++) {
      const chunk = jsonString.substring(i * CONFIG.CHUNK_SIZE, (i + 1) * CONFIG.CHUNK_SIZE);
      entries[baseKey + '_' + i] = chunk;
    }

    cache.putAll(entries, ttl);
  } catch (e) {
    console.error('Error setting chunked cache:', e);
  }
}

function getChunkedCache(cache, baseKey) {
  try {
    const countStr = cache.get(baseKey + '_chunks');
    if (!countStr) {
      return cache.get(baseKey);
    }

    const count = parseInt(countStr, 10);
    if (count === 1) {
      return cache.get(baseKey);
    }

    const keys = [];
    for (let i = 0; i < count; i++) {
      keys.push(baseKey + '_' + i);
    }

    const chunks = cache.getAll(keys);
    let fullString = '';
    for (let i = 0; i < count; i++) {
      const chunk = chunks[baseKey + '_' + i];
      if (!chunk) return null; // Incomplete chunk set
      fullString += chunk;
    }

    return fullString;
  } catch (e) {
    console.error('Error getting chunked cache:', e);
    return null;
  }
}

function createJsonResponse(data, statusCode) {
  const output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

function logTiming(stageName, startTime) {
  if (CONFIG.ENABLE_TIMING_LOGS) {
    const duration = new Date().getTime() - startTime;
    console.log(`[TIMING] ${stageName}: ${duration}ms`);
  }
}
