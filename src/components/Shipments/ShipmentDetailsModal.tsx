import { Shipment } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { displayVal, formatDate, formatPrice } from '../../utils/formatters';
import WorkflowBadge from './WorkflowBadge';
import {
  X,
  Edit2,
  Trash2,
  Package,
  Building2,
  FileText,
  DollarSign,
  Truck,
  Calendar,
  Layers,
  FileSpreadsheet,
  StickyNote,
  Tag,
  Users,
  CheckCircle2,
} from 'lucide-react';

interface ShipmentDetailsModalProps {
  shipment: Shipment | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (shipment: Shipment) => void;
  onDelete?: (shipment: Shipment) => void;
}

export default function ShipmentDetailsModal({
  shipment,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: ShipmentDetailsModalProps) {
  const { user } = useAuth();
  const isHedy = user?.user_id === 'USR-007';
  const canEdit = user?.role === 'editor';

  if (!isOpen || !shipment) return null;

  const hedyNote = shipment['notes hidy'];

  return (
    <div
      id="shipment-details-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/30 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="shipment-details-modal-card"
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#E0E0D5] overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-[#F0F0E5] bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#5A5A40] text-white rounded-lg flex items-center justify-center shadow-xs">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2
                  id="shipment-details-id"
                  className="text-lg font-bold text-[#3D3D2D] tracking-tight font-mono"
                >
                  {displayVal(shipment['Shipment ID'])}
                </h2>
                {shipment['shipment type'] && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F0F0E5] text-[#5A5A40] border border-[#E0E0D5]">
                    {displayVal(shipment['shipment type'])}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#8A8A7A] mt-0.5">
                {displayVal(shipment['importing co.'])}
                {shipment['Brokers'] ? ` • Broker: ${displayVal(shipment['Brokers'])}` : ''}
              </p>
            </div>
          </div>
          <button
            id="btn-close-shipment-details"
            onClick={onClose}
            className="text-[#A0A090] hover:text-[#5A5A40] p-1.5 rounded-lg hover:bg-[#F5F5F0] transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Organized Fields */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Top Section: Commercial & Documents */}
          <div>
            <h3 className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider mb-3">
              Commercial & Documentation
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-3 bg-[#FBFBF8] rounded-xl border border-[#E0E0D5]">
                <div className="flex items-center gap-1.5 text-xs text-[#8A8A7A] mb-1">
                  <Tag className="w-3.5 h-3.5 text-[#A0A090]" />
                  <span className="font-semibold uppercase tracking-wider text-[10px]">Shipment Type</span>
                </div>
                <div className="font-semibold text-[#1A1A1A] text-sm">
                  {displayVal(shipment['shipment type'])}
                </div>
              </div>

              <div className="p-3 bg-[#FBFBF8] rounded-xl border border-[#E0E0D5]">
                <div className="flex items-center gap-1.5 text-xs text-[#8A8A7A] mb-1">
                  <Building2 className="w-3.5 h-3.5 text-[#A0A090]" />
                  <span className="font-semibold uppercase tracking-wider text-[10px]">Importing Co.</span>
                </div>
                <div className="font-semibold text-[#1A1A1A] text-sm">
                  {displayVal(shipment['importing co.'])}
                </div>
              </div>

              <div className="p-3 bg-[#FBFBF8] rounded-xl border border-[#E0E0D5]">
                <div className="flex items-center gap-1.5 text-xs text-[#8A8A7A] mb-1">
                  <Users className="w-3.5 h-3.5 text-[#A0A090]" />
                  <span className="font-semibold uppercase tracking-wider text-[10px]">Brokers</span>
                </div>
                <div className="font-semibold text-[#1A1A1A] text-sm">
                  {displayVal(shipment['Brokers'])}
                </div>
              </div>

              <div className="p-3 bg-[#FBFBF8] rounded-xl border border-[#E0E0D5]">
                <div className="flex items-center gap-1.5 text-xs text-[#8A8A7A] mb-1">
                  <DollarSign className="w-3.5 h-3.5 text-[#A0A090]" />
                  <span className="font-semibold uppercase tracking-wider text-[10px]">Total Price</span>
                </div>
                <div className="font-semibold text-[#1A1A1A] text-sm">
                  {formatPrice(shipment['Total Price'])}
                </div>
              </div>

              <div className="p-3 bg-[#FBFBF8] rounded-xl border border-[#E0E0D5]">
                <div className="flex items-center gap-1.5 text-xs text-[#8A8A7A] mb-1">
                  <FileText className="w-3.5 h-3.5 text-[#A0A090]" />
                  <span className="font-semibold uppercase tracking-wider text-[10px]">Invoice Number</span>
                </div>
                <div className="font-semibold text-[#5A5A40] text-sm font-mono">
                  {displayVal(shipment['Invoice Number'])}
                </div>
              </div>

              <div className="p-3 bg-[#FBFBF8] rounded-xl border border-[#E0E0D5]">
                <div className="flex items-center gap-1.5 text-xs text-[#8A8A7A] mb-1">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-[#A0A090]" />
                  <span className="font-semibold uppercase tracking-wider text-[10px]">Acid Number</span>
                </div>
                <div className="font-semibold text-[#5A5A40] text-sm font-mono">
                  {displayVal(shipment['Acid Number'])}
                </div>
              </div>

              <div className="p-3 bg-[#FBFBF8] rounded-xl border border-[#E0E0D5]">
                <div className="flex items-center gap-1.5 text-xs text-[#8A8A7A] mb-1">
                  <FileText className="w-3.5 h-3.5 text-[#A0A090]" />
                  <span className="font-semibold uppercase tracking-wider text-[10px]">Bill of Lading</span>
                </div>
                <div className="font-semibold text-[#5A5A40] text-sm font-mono">
                  {displayVal(shipment['bill of lading'])}
                </div>
              </div>

              <div className="p-3 bg-[#FBFBF8] rounded-xl border border-[#E0E0D5]">
                <div className="flex items-center gap-1.5 text-xs text-[#8A8A7A] mb-1">
                  <FileText className="w-3.5 h-3.5 text-[#A0A090]" />
                  <span className="font-semibold uppercase tracking-wider text-[10px]">Bank Document</span>
                </div>
                <div className="font-semibold text-[#5A5A40] text-sm font-mono">
                  {displayVal(shipment['bank document'])}
                </div>
              </div>
            </div>
          </div>

          <div className="h-[1px] bg-[#F0F0E5]" />

          {/* Logistics & Transit */}
          <div>
            <h3 className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider mb-3">
              Logistics & Transit
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="sm:col-span-2 p-3 bg-[#FBFBF8] rounded-xl border border-[#E0E0D5]">
                <div className="flex items-center gap-1.5 text-xs text-[#8A8A7A] mb-1">
                  <Truck className="w-3.5 h-3.5 text-[#A0A090]" />
                  <span className="font-semibold uppercase tracking-wider text-[10px]">Shipping Company</span>
                </div>
                <div className="font-semibold text-[#1A1A1A] text-sm">
                  {displayVal(shipment['Shipping Company'])}
                </div>
              </div>

              <div className="p-3 bg-[#FBFBF8] rounded-xl border border-[#E0E0D5]">
                <div className="flex items-center gap-1.5 text-xs text-[#8A8A7A] mb-1">
                  <Calendar className="w-3.5 h-3.5 text-[#A0A090]" />
                  <span className="font-semibold uppercase tracking-wider text-[10px]">Departure Date</span>
                </div>
                <div className="font-medium text-[#4A4A40] text-sm">
                  {formatDate(shipment['Departure Date'])}
                </div>
              </div>

              <div className="p-3 bg-[#FBFBF8] rounded-xl border border-[#E0E0D5]">
                <div className="flex items-center gap-1.5 text-xs text-[#8A8A7A] mb-1">
                  <Calendar className="w-3.5 h-3.5 text-[#A0A090]" />
                  <span className="font-semibold uppercase tracking-wider text-[10px]">Expected Arrival</span>
                </div>
                <div className="font-medium text-[#4A4A40] text-sm">
                  {formatDate(shipment['Expected Arrival'])}
                </div>
              </div>

              <div className="p-3 bg-[#FBFBF8] rounded-xl border border-[#E0E0D5] sm:col-span-2">
                <div className="flex items-center gap-1.5 text-xs text-[#8A8A7A] mb-1">
                  <Calendar className="w-3.5 h-3.5 text-[#A0A090]" />
                  <span className="font-semibold uppercase tracking-wider text-[10px]">Actual Arrival</span>
                </div>
                <div className="font-medium text-[#4A4A40] text-sm">
                  {formatDate(shipment['Actual Arrival'])}
                </div>
              </div>
            </div>
          </div>

          <div className="h-[1px] bg-[#F0F0E5]" />

          {/* Workflow Steps (Arabic fields preserved) */}
          <div>
            <h3 className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#5A5A40]" />
              <span>Workflow & Procedures (الإجراءات)</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <WorkflowBadge label="تجهيز الورق" value={shipment['تجهيز الورق']} />
              <WorkflowBadge label="سحب العينات" value={shipment['سحب العينات']} />
              <WorkflowBadge label="المدفوعة" value={shipment['المدفوعة']} />
              <WorkflowBadge label="استلام المخزن" value={shipment['استلام المخزن']} />
              <WorkflowBadge label="نتيجة المعمل المركزي" value={shipment['نتيجة المعمل المركزي']} />
              <WorkflowBadge label="مطابقة" value={shipment['مطابقة']} />
            </div>
          </div>

          <div className="h-[1px] bg-[#F0F0E5]" />

          {/* Products */}
          <div>
            <h3 className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#A0A090]" />
              <span>Products</span>
            </h3>
            <div className="p-3.5 bg-[#FBFBF8] rounded-xl border border-[#E0E0D5] text-[#1A1A1A] text-sm whitespace-pre-wrap">
              {displayVal(shipment['Products'])}
            </div>
          </div>

          {/* Notes Section */}
          <div>
            <h3 className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <StickyNote className="w-3.5 h-3.5 text-[#A0A090]" />
              <span>Notes</span>
            </h3>
            <div className="p-3.5 bg-[#FBFBF8] rounded-xl border border-[#E0E0D5] text-[#4A4A40] text-sm whitespace-pre-wrap">
              {displayVal(shipment['Notes'])}
            </div>
          </div>

          {/* Notes Hedy Section (Only for Hedy USR-007) */}
          {isHedy && (
            <div>
              <div className="h-[1px] bg-[#F0F0E5] mb-4" />
              <h3 className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <StickyNote className="w-3.5 h-3.5 text-[#5A5A40]" />
                <span>Notes Hedy</span>
              </h3>
              <div className="p-3.5 bg-[#FDFBF7] rounded-xl border border-[#E5DFCE] text-[#3D3D2D] text-sm whitespace-pre-wrap">
                {displayVal(hedyNote)}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between gap-3 px-6 sm:px-8 py-5 border-t border-[#F0F0E5] bg-[#FBFBF8]">
          <div>
            {canEdit && onDelete && (
              <button
                id="btn-details-delete"
                type="button"
                onClick={() => {
                  onClose();
                  onDelete(shipment);
                }}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-[#8C3A35] hover:bg-[#F9ECEB] rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Shipment</span>
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              id="btn-details-close"
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-sm font-medium text-[#5A5A40] hover:bg-[#F0F0E5] rounded-lg transition-colors"
            >
              Close
            </button>
            {canEdit && (
              <button
                id="btn-details-edit"
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(shipment);
                }}
                className="flex items-center gap-2 px-6 py-2 bg-[#5A5A40] hover:bg-[#4A4A35] text-white text-sm font-medium rounded-lg transition-colors shadow-xs"
              >
                <Edit2 className="w-4 h-4" />
                <span>Edit Shipment</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
