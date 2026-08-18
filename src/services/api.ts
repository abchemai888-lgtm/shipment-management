import { ApiResponse, AuthUser, Shipment, AdminUser } from '../types';

/* =========================================================
   API URLS
========================================================= */

// Users API
// Login / Users Management / Passwords / Token verification
const USERS_API_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_USERS_API_URL) ||
  'https://script.google.com/macros/s/AKfycbwuIf3kCo6KBe5pVgQXUxF3ZvF_paDzfrGtxCmwmivmNT1NQA4KUF2QCJPBXxKzjB_z/exec';

const SHIPMENTS_API_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SHIPMENTS_API_URL) ||
  'https://script.google.com/macros/s/AKfycbxMOYWsrJAlILBYJgw2mRsreANCRoTztENsDjd5tXFLem3R6JG8NMH2halwYhkv-deWcQ/exec';

// Audit Log API
// System activity and change history
const AUDIT_LOG_API_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_AUDIT_LOG_API_URL) ||
  'https://script.google.com/macros/s/AKfycbwUp7rXFJYyAJ1I3V4I2fvSclzCcz_Xfmr6ogidLBQ5HWu47H5wMVMjcMCOHOVjRp-bIg/exec';

let onAuthFailureCallback:
  ((message?: string) => void) | null = null;


export function setAuthFailureHandler(
  callback: (message?: string) => void
) {
  onAuthFailureCallback = callback;
}


/* =========================================================
   API ROUTING
========================================================= */

/**
 * Decides which backend should receive the request.
 *
 * USERS API:
 * - login
 * - verifyToken
 * - getUsers
 * - addUser
 * - updateUser
 * - setUserStatus
 * - deleteUser
 * - changePassword
 *
 * AUDIT LOG API:
 * - getLogs
 * - addLog
 *
 * SHIPMENTS API:
 * - getShipments
 * - getShipment
 * - addShipment
 * - updateShipment
 * - deleteShipment
 */
function getApiUrl(action: string): string {

  const usersActions = [
    'login',
    'verifyToken',
    'getUsers',
    'addUser',
    'updateUser',
    'setUserStatus',
    'deleteUser',
    'changePassword',
  ];

  const auditLogActions = [
    'addLog',
  ];

  if (usersActions.includes(action)) {
    return USERS_API_URL;
  }

  if (auditLogActions.includes(action)) {
    return AUDIT_LOG_API_URL;
  }

  return SHIPMENTS_API_URL;
}


/* =========================================================
   CENTRAL API REQUEST
========================================================= */

/**
 * Central API request handler.
 *
 * Automatically routes each action to:
 *
 * Users API
 * OR
 * Shipments API
 */
export async function apiRequest<T = any>(
  action: string,
  payload: Record<string, any> = {},
  token?: string | null,
  options: { suppressAuthFailure?: boolean } = {}
): Promise<T> {

  const resolvedToken =
    token ||
    (typeof sessionStorage !== 'undefined'
      ? sessionStorage.getItem('shipment_app_token')
      : null);

  const requestBody: Record<string, any> = {
    action,
    ...payload,
  };

  if (resolvedToken) {
    requestBody.token = resolvedToken;
  }

  const apiUrl = getApiUrl(action);

  try {

    const response = await fetch(apiUrl, {
      method: 'POST',

      headers: {
        'Content-Type':
          'text/plain;charset=utf-8',
      },

      body: JSON.stringify(requestBody),

      redirect: 'follow',
    });


    if (
      !response.ok &&
      response.status !== 302
    ) {

      throw new Error(
        `HTTP Error ${response.status}: ${response.statusText}`
      );
    }


    const text =
      await response.text();


    let data: any;


    try {

      data = JSON.parse(text);

    } catch {

      throw new Error(
        'Invalid response format received from server.'
      );
    }


    /* =====================================================
       AUTHENTICATION / SESSION FAILURE
       Only trigger global logout for core authentication/session
       actions if explicit token expiration or invalidation occurs.
       NEVER trigger global logout for Audit Log or secondary errors.
    ===================================================== */

    const isAuditAction = action === 'getLogs' || action === 'addLog';
    const shouldCheckAuthFailure =
      !options.suppressAuthFailure &&
      !isAuditAction &&
      action !== 'login';

    if (
      shouldCheckAuthFailure &&
      data &&
      data.success === false
    ) {

      const msg =
        String(
          data.message ||
          data.error ||
          ''
        ).toLowerCase();


      if (
        msg.includes('token expired') ||
        msg.includes('invalid token') ||
        msg.includes('session expired') ||
        msg.includes('token not found')
      ) {

        if (onAuthFailureCallback) {

          onAuthFailureCallback(
            'Your session has expired. Please log in again.'
          );
        }
      }
    }


    return data as T;


  } catch (error: any) {

    if (
      error?.name === 'TypeError' &&
      String(
        error?.message || ''
      ).includes('fetch')
    ) {

      throw new Error(
        'Network connection error. Please check your internet connection.'
      );
    }

    throw error;
  }
}


/* =========================================================
   AUTHENTICATION
========================================================= */

export async function loginApi(
  name: string,
  password: string
): Promise<{
  success: boolean;
  token?: string;
  user?: AuthUser;
  message?: string;
  error?: string;
}> {

  return apiRequest(
    'login',
    {
      name,
      password,
    }
  );
}


/* =========================================================
   SHIPMENTS
========================================================= */


/**
 * Get all shipments.
 *
 * IMPORTANT:
 * notes hidy is controlled by the backend.
 *
 * Hedy receives it.
 * Other users do not.
 */
export async function getShipmentsApi(
  token: string
): Promise<Shipment[]> {

  const res =
    await apiRequest<ApiResponse<Shipment[]>>(
      'getShipments',
      {},
      token
    );


  if (Array.isArray(res)) {
    return res;
  }


  if (
    res &&
    Array.isArray(
      (res as any).shipments
    )
  ) {

    return (res as any).shipments;
  }


  if (
    res &&
    Array.isArray(
      (res as any).data
    )
  ) {

    return (res as any).data;
  }


  if (
    res &&
    (res as any).success === false
  ) {

    throw new Error(
      (res as any).message ||
      (res as any).error ||
      'Failed to fetch shipments'
    );
  }


  return [];
}


/**
 * Get one shipment.
 */
export async function getShipmentApi(
  token: string,
  shipmentId: string
): Promise<Shipment | null> {

  const res =
    await apiRequest<any>(
      'getShipment',
      {
        shipmentId,
      },
      token
    );


  if (
    res &&
    res.success === false
  ) {

    throw new Error(
      res.message ||
      res.error ||
      'Failed to fetch shipment'
    );
  }


  return (
    res?.shipment ||
    res?.data ||
    null
  );
}


/**
 * Add a new shipment.
 *
 * Shipment ID is generated
 * automatically by Apps Script.
 */
export async function addShipmentApi(
  token: string,
  shipment: Omit<Shipment, 'Shipment ID'>
): Promise<
  ApiResponse & {
    shipmentId?: string;
  }
> {

  const response =
    await apiRequest<
      ApiResponse & {
        shipmentId?: string;
      }
    >(
      'addShipment',
      {
        shipment,
      },
      token
    );


  if (
    response?.success === false
  ) {

    throw new Error(
      response.message ||
      response.error ||
      'Failed to add shipment'
    );
  }


  return response;
}


/**
 * Update an existing shipment.
 *
 * Shipment ID identifies the row
 * and can never be changed.
 */
export async function updateShipmentApi(
  token: string,
  shipmentId: string,
  updates: Partial<Shipment>
): Promise<ApiResponse> {

  const response =
    await apiRequest<ApiResponse>(
      'updateShipment',
      {
        shipmentId,
        updates,
      },
      token
    );


  if (
    response?.success === false
  ) {

    throw new Error(
      response.message ||
      response.error ||
      'Failed to update shipment'
    );
  }


  return response;
}


/**
 * Delete an existing shipment.
 *
 * Security: Only users with role "editor" are permitted by the backend API.
 * Identifies the exact row to delete using the Shipment ID.
 */
export async function deleteShipmentApi(
  token: string,
  shipmentId: string
): Promise<
  ApiResponse & {
    shipmentId?: string;
  }
> {

  const response =
    await apiRequest<
      ApiResponse & {
        shipmentId?: string;
      }
    >(
      'deleteShipment',
      {
        shipmentId,
      },
      token
    );


  if (
    response?.success === false
  ) {

    throw new Error(
      response.message ||
      response.error ||
      'Failed to delete shipment'
    );
  }


  return response;
}


/* =========================================================
   USERS / ADMIN
========================================================= */


/**
 * Get users.
 *
 * Admin only is enforced by Users API.
 */
export async function getUsersApi(
  token: string
): Promise<AdminUser[]> {

  const res =
    await apiRequest<ApiResponse<any[]>>(
      'getUsers',
      {},
      token
    );


  let rawUsers: any[] = [];


  if (Array.isArray(res)) {

    rawUsers = res;

  } else if (
    res &&
    Array.isArray(
      (res as any).users
    )
  ) {

    rawUsers =
      (res as any).users;

  } else if (
    res &&
    Array.isArray(
      (res as any).data
    )
  ) {

    rawUsers =
      (res as any).data;

  } else if (
    res &&
    (res as any).success === false
  ) {

    throw new Error(
      (res as any).message ||
      (res as any).error ||
      'Failed to fetch users'
    );
  }


  return rawUsers.map((u) => ({

    user_id:
      u.user_id ||
      u['User ID'] ||
      u.id ||
      u.userId ||
      '',


    name:
      u.name ||
      u['Name'] ||
      u.username ||
      '',


    role:
      (
        u.role ||
        u['Role'] ||
        'user'
      ).toLowerCase() as
        'admin' |
        'user' |
        'editor',


    active:
      normalizeBoolean(
        u.active !== undefined
          ? u.active

          : u['Active'] !== undefined
          ? u['Active']

          : u['Active status'] !== undefined
          ? u['Active status']

          : true
      ),

  }));
}


/**
 * Add user.
 */
export async function addUserApi(
  token: string,
  name: string,
  password: string,
  role: 'user' | 'admin' | 'editor'
): Promise<ApiResponse> {

  return apiRequest(
    'addUser',
    {
      name,
      password,
      role,
    },
    token
  );
}


/**
 * Set user active / disabled.
 */
export async function setUserStatusApi(
  token: string,
  userId: string,
  active: boolean
): Promise<ApiResponse> {

  return apiRequest(
    'setUserStatus',
    {
      userId,
      active,
    },
    token
  );
}


/**
 * Delete user.
 */
export async function deleteUserApi(
  token: string,
  userId: string
): Promise<ApiResponse> {

  return apiRequest(
    'deleteUser',
    {
      userId,
    },
    token
  );
}


/**
 * Change password.
 */
export async function changePasswordApi(
  token: string,
  userId: string,
  newPassword: string
): Promise<ApiResponse> {

  return apiRequest(
    'changePassword',
    {
      userId,
      newPassword,
    },
    token
  );
}


/* =========================================================
   HELPERS
========================================================= */


/**
 * Correctly converts:
 *
 * true
 * false
 * "true"
 * "false"
 * 1
 * 0
 * yes
 * no
 * active
 * disabled
 */
function normalizeBoolean(
  value: any
): boolean {

  if (
    typeof value === 'boolean'
  ) {

    return value;
  }


  if (
    typeof value === 'number'
  ) {

    return value === 1;
  }


  if (
    typeof value === 'string'
  ) {

    const normalized =
      value.trim().toLowerCase();


    if (
      normalized === 'false' ||
      normalized === '0' ||
      normalized === 'no' ||
      normalized === 'disabled'
    ) {

      return false;
    }


    if (
      normalized === 'true' ||
      normalized === '1' ||
      normalized === 'yes' ||
      normalized === 'active'
    ) {

      return true;
    }
  }


  return Boolean(value);
}