import { useState, useEffect, useMemo, useCallback } from 'react';
import { Shipment } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getShipmentsApi, deleteShipmentApi } from '../../services/api';
import ShipmentsTable from './ShipmentsTable';
import ShipmentCard from './ShipmentCard';
import ShipmentDetailsModal from './ShipmentDetailsModal';
import ShipmentFormModal from './ShipmentFormModal';
import ConfirmDialog from '../Common/ConfirmDialog';
import {
  Search,
  RotateCw,
  Plus,
  Package,
  X,
  AlertCircle,
  Filter,
} from 'lucide-react';

export default function ShipmentsView() {
  const { token, user: currentUser } = useAuth();
  const { showSuccess, showError } = useToast();

  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('All Types');

  // Modals state
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingShipment, setEditingShipment] = useState<Shipment | null>(null);

  // Delete confirmation state
  const [shipmentToDelete, setShipmentToDelete] = useState<Shipment | null>(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isHedy = currentUser?.user_id === 'USR-007';
  const canEdit = currentUser?.role === 'editor';

  const fetchShipments = useCallback(
    async (isManualRefresh = false) => {
      if (!token) return;

      if (isManualRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setFetchError(null);

      try {
        const data = await getShipmentsApi(token);
        setShipments(data);
        setLastRefreshed(new Date());
      } catch (err: any) {
        const msg = err.message || 'Failed to load shipments.';
        setFetchError(msg);
        showError(msg);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [token, showError]
  );

  useEffect(() => {
    fetchShipments();
  }, [fetchShipments]);

  // Unique shipment types for quick filter
  const uniqueTypes = useMemo(() => {
    const set = new Set<string>();
    for (const shp of shipments) {
      const t = String(shp['shipment type'] || '').trim();
      if (t) set.add(t);
    }
    return ['All Types', ...Array.from(set)];
  }, [shipments]);

  // Filtered & Searched shipments
  const filteredShipments = useMemo(() => {
    return shipments.filter((item) => {
      // Type filter
      if (typeFilter !== 'All Types') {
        const itemType = String(item['shipment type'] || '').trim().toLowerCase();
        if (itemType !== typeFilter.toLowerCase()) {
          return false;
        }
      }

      // Search query across all relevant fields
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const idMatch = String(item['Shipment ID'] || '').toLowerCase().includes(q);
        const typeMatch = String(item['shipment type'] || '').toLowerCase().includes(q);
        const importCoMatch = String(item['importing co.'] || '').toLowerCase().includes(q);
        const brokersMatch = String(item['Brokers'] || '').toLowerCase().includes(q);
        const shippingCompMatch = String(item['Shipping Company'] || '').toLowerCase().includes(q);
        const blMatch = String(item['bill of lading'] || '').toLowerCase().includes(q);
        const bankDocMatch = String(item['bank document'] || '').toLowerCase().includes(q);
        const productsMatch = String(item['Products'] || '').toLowerCase().includes(q);
        const invoiceMatch = String(item['Invoice Number'] || '').toLowerCase().includes(q);
        const acidMatch = String(item['Acid Number'] || '').toLowerCase().includes(q);
        const notesMatch = String(item['Notes'] || '').toLowerCase().includes(q);
        const workflow1Match = String(item['تجهيز الورق'] || '').toLowerCase().includes(q);
        const workflow2Match = String(item['سحب العينات'] || '').toLowerCase().includes(q);
        const workflow3Match = String(item['المدفوعة'] || '').toLowerCase().includes(q);
        const workflow4Match = String(item['استلام المخزن'] || '').toLowerCase().includes(q);
        const workflow5Match = String(item['نتيجة المعمل المركزي'] || '').toLowerCase().includes(q);
        const workflow6Match = String(item['مطابقة'] || '').toLowerCase().includes(q);

        const hedyNotesMatch =
          isHedy &&
          String(item['notes hidy'] || '')
            .toLowerCase()
            .includes(q);

        return (
          idMatch ||
          typeMatch ||
          importCoMatch ||
          brokersMatch ||
          shippingCompMatch ||
          blMatch ||
          bankDocMatch ||
          productsMatch ||
          invoiceMatch ||
          acidMatch ||
          notesMatch ||
          workflow1Match ||
          workflow2Match ||
          workflow3Match ||
          workflow4Match ||
          workflow5Match ||
          workflow6Match ||
          hedyNotesMatch
        );
      }

      return true;
    });
  }, [shipments, searchQuery, typeFilter, isHedy]);

  // Actions
  const handleViewDetails = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setIsDetailsOpen(true);
  };

  const handleOpenAdd = () => {
    if (!canEdit) return;
    setEditingShipment(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (shipment: Shipment) => {
    if (!canEdit) return;
    setEditingShipment(shipment);
    setIsFormOpen(true);
  };

  const handleOpenDelete = (shipment: Shipment) => {
    if (!canEdit) return;
    setShipmentToDelete(shipment);
    setIsConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!shipmentToDelete || !token) return;

    const shipmentId = shipmentToDelete['Shipment ID'];
    if (!shipmentId) {
      showError('Shipment ID is missing.');
      return;
    }

    setIsDeleting(true);
    try {
      const res = await deleteShipmentApi(token, shipmentId);
      if (res && res.success === false) {
        throw new Error(res.message || res.error || 'Failed to delete shipment');
      }

      // Remove the shipment from the current UI immediately
      setShipments((prev) => prev.filter((s) => s['Shipment ID'] !== shipmentId));

      // Show existing success notification/toast
      showSuccess(res.message || `Shipment ${shipmentId} deleted successfully.`);

      // Close modals
      setIsConfirmDeleteOpen(false);
      setShipmentToDelete(null);

      if (selectedShipment && selectedShipment['Shipment ID'] === shipmentId) {
        setIsDetailsOpen(false);
        setSelectedShipment(null);
      }
    } catch (err: any) {
      // Do NOT remove the shipment from UI, show returned error message, keep shipment visible
      const msg = err.message || 'Failed to delete shipment';
      showError(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFormSuccess = () => {
    fetchShipments(true);
  };

  return (
    <div id="shipments-view-container" className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            id="shipments-view-heading"
            className="text-xl sm:text-2xl font-bold text-[#3D3D2D] tracking-tight"
          >
            Shipments Management
          </h1>
          <div className="flex items-center gap-3 text-xs text-[#8A8A7A] mt-1">
            <span>
              {shipments.length} total shipment{shipments.length === 1 ? '' : 's'}
            </span>
            {lastRefreshed && (
              <>
                <span>•</span>
                <span id="last-refreshed-time" className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block" />
                  Last synced: {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Right Buttons: Refresh & Add Shipment (only if editor) */}
        <div className="flex items-center gap-3">
          <button
            id="btn-refresh-shipments"
            type="button"
            onClick={() => fetchShipments(true)}
            disabled={isRefreshing || isLoading}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#5A5A40] bg-white hover:bg-[#F0F0E5] border border-[#E0E0D5] rounded-lg transition-colors disabled:opacity-50 shadow-xs"
            title="Refresh shipments from Google Sheet"
          >
            <RotateCw
              className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#5A5A40]' : 'text-[#5A5A40]'}`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {canEdit && (
            <button
              id="btn-add-shipment"
              type="button"
              onClick={handleOpenAdd}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#5A5A40] hover:bg-[#4A4A35] rounded-lg transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Shipment</span>
            </button>
          )}
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div
        id="shipments-filter-toolbar"
        className="bg-white border border-[#E0E0D5] rounded-xl p-2 shadow-xs flex flex-col sm:flex-row gap-2 items-center"
      >
        {/* Search Field */}
        <div className="relative flex-1 w-full flex items-center">
          <div className="pl-3 text-[#A0A090]">
            <Search className="w-4 h-4" />
          </div>
          <input
            id="input-shipment-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID, Company, Broker, Product, Invoice, Bill of Lading, Workflow..."
            className="w-full pl-3 pr-8 py-2 bg-transparent border-none text-sm text-[#1A1A1A] placeholder:text-[#B0B0A0] focus:outline-hidden"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#A0A090] hover:text-[#5A5A40]"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Type Filter Dropdown if types exist */}
        {uniqueTypes.length > 1 && (
          <div className="w-full sm:w-auto flex items-center gap-1.5 bg-[#F5F5F0] rounded-lg px-2">
            <Filter className="w-3.5 h-3.5 text-[#8A8A7A]" />
            <select
              id="select-type-filter"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full sm:w-auto bg-transparent text-sm border-none outline-hidden py-2 pr-2 text-[#5A5A40] font-medium cursor-pointer"
            >
              {uniqueTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {fetchError && shipments.length === 0 ? (
        <div
          id="shipments-error-state"
          className="bg-white border border-rose-200 rounded-xl p-8 text-center"
        >
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-[#3D3D2D] mb-1">
            Unable to load shipments
          </h3>
          <p className="text-sm text-[#8A8A7A] mb-4 max-w-md mx-auto">{fetchError}</p>
          <button
            id="btn-retry-shipments"
            onClick={() => fetchShipments()}
            className="px-4 py-2 bg-[#5A5A40] text-white text-sm font-medium rounded-lg hover:bg-[#4A4A35] transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : isLoading && shipments.length === 0 ? (
        <div
          id="shipments-loading-state"
          className="bg-white border border-[#E0E0D5] rounded-xl p-12 text-center"
        >
          <div className="w-8 h-8 border-2 border-[#5A5A40] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-[#5A5A40]">Loading shipments...</p>
        </div>
      ) : filteredShipments.length === 0 ? (
        <div
          id="shipments-empty-state"
          className="bg-white border border-[#E0E0D5] rounded-xl p-12 text-center"
        >
          <Package className="w-12 h-12 text-[#B0B0A0] mx-auto mb-3" />
          <h3 className="text-base font-semibold text-[#3D3D2D] mb-1">
            {shipments.length === 0
              ? 'No shipments found'
              : 'No matching shipments'}
          </h3>
          <p className="text-sm text-[#8A8A7A] mb-4 max-w-sm mx-auto">
            {shipments.length === 0
              ? 'No shipments exist in the system yet.'
              : 'Try clearing your search query or filter.'}
          </p>
          {shipments.length === 0 && canEdit ? (
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#5A5A40] text-white text-sm font-medium rounded-lg hover:bg-[#4A4A35] transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Shipment</span>
            </button>
          ) : shipments.length > 0 ? (
            <button
              onClick={() => {
                setSearchQuery('');
                setTypeFilter('All Types');
              }}
              className="px-3.5 py-1.5 text-xs font-medium text-[#5A5A40] bg-[#EBEBE0] hover:bg-[#E0E0D5] rounded-lg transition-colors"
            >
              Reset Filters
            </button>
          ) : null}
        </div>
      ) : (
        <>
          {/* Desktop Table View (>= 1200px) */}
          <div className="hidden xl:block">
            <ShipmentsTable
              shipments={filteredShipments}
              onView={handleViewDetails}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
            />
          </div>

          {/* Mobile & Tablet Card Grid (< 1200px) */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:hidden gap-3.5">
            {filteredShipments.map((shp, idx) => (
              <ShipmentCard
                key={shp['Shipment ID'] || idx}
                shipment={shp}
                onView={handleViewDetails}
                onEdit={handleOpenEdit}
                onDelete={handleOpenDelete}
              />
            ))}
          </div>
        </>
      )}

      {/* Shipment Details Modal */}
      <ShipmentDetailsModal
        shipment={selectedShipment}
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedShipment(null);
        }}
        onEdit={(shp) => {
          handleOpenEdit(shp);
        }}
        onDelete={(shp) => {
          handleOpenDelete(shp);
        }}
      />

      {/* Shipment Form Modal (Add / Edit) */}
      {canEdit && (
        <ShipmentFormModal
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingShipment(null);
          }}
          onSuccess={handleFormSuccess}
          editingShipment={editingShipment}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {canEdit && (
        <ConfirmDialog
          isOpen={isConfirmDeleteOpen}
          title={`Delete shipment ${shipmentToDelete?.['Shipment ID'] || ''}?`}
          message={`Are you sure you want to delete this shipment? This will permanently delete shipment "${shipmentToDelete?.['Shipment ID'] || ''}" and its entire row from the Google Sheet.`}
          confirmLabel="Delete"
          confirmVariant="danger"
          isLoading={isDeleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            if (!isDeleting) {
              setIsConfirmDeleteOpen(false);
              setShipmentToDelete(null);
            }
          }}
        />
      )}
    </div>
  );
}
