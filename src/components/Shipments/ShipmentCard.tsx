import React, { useState } from 'react';
import { Shipment } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { displayVal, formatDate, formatPrice } from '../../utils/formatters';
import WorkflowBadge from './WorkflowBadge';
import {
  Eye,
  Edit2,
  Trash2,
  Plus,
  Minus,
  Building2,
  Truck,
  Calendar,
  DollarSign,
  StickyNote,
  Tag,
  FileText,
  Layers,
  Users as UsersIcon,
} from 'lucide-react';

interface ShipmentCardProps {
  key?: React.Key;
  shipment: Shipment;
  onView: (shipment: Shipment) => void;
  onEdit: (shipment: Shipment) => void;
  onDelete: (shipment: Shipment) => void;
}

export default function ShipmentCard({
  shipment,
  onView,
  onEdit,
  onDelete,
}: ShipmentCardProps) {
  const { user } = useAuth();
  const isHedy = user?.user_id === 'USR-007';
  const canEdit = user?.role === 'editor';

  const [isExpanded, setIsExpanded] = useState(false);

  const shipmentId = shipment['Shipment ID'] || 'No ID';
  const hedyNote = shipment['notes hidy'];

  const hasWorkflow =
    shipment['تجهيز الورق'] ||
    shipment['سحب العينات'] ||
    shipment['المدفوعة'] ||
    shipment['استلام المخزن'] ||
    shipment['نتيجة المعمل المركزي'] ||
    shipment['مطابقة'];

  // Formatted products preview
  const rawProducts = String(shipment['Products'] || '').trim();
  const productsPreview = rawProducts ? rawProducts.replace(/[\r\n]+/g, ' ') : '';

  return (
    <div
      id={`shipment-card-${shipmentId}`}
      className={`bg-white border rounded-xl shadow-xs transition-all duration-200 flex flex-col justify-between overflow-hidden ${
        isExpanded
          ? 'border-[#5A5A40] ring-1 ring-[#5A5A40]/20'
          : 'border-[#E0E0D5] hover:border-[#5A5A40]/40'
      }`}
    >
      <div className="p-3.5 sm:p-4">
        {/* Card Top Header: ID, Type Badge, and Expand Toggle Button */}
        <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[#F0F0E5]">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <span className="font-mono text-xs sm:text-sm font-bold text-[#5A5A40] bg-[#F5F5F0] px-2 py-0.5 rounded-md border border-[#E0E0D5]">
              {displayVal(shipment['Shipment ID'])}
            </span>
            {shipment['shipment type'] && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#F0F0E5] text-[#5A5A40] text-[11px] font-medium rounded-md">
                <Tag className="w-2.5 h-2.5 text-[#8A8A7A]" />
                <span className="truncate max-w-[120px]">{displayVal(shipment['shipment type'])}</span>
              </span>
            )}
          </div>

          {/* Touch-friendly + / - Expand Button */}
          <button
            id={`btn-card-expand-${shipmentId}`}
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className={`min-w-[40px] min-h-[36px] px-2.5 py-1 rounded-lg flex items-center justify-center gap-1 text-xs font-semibold transition-colors cursor-pointer select-none ${
              isExpanded
                ? 'bg-[#5A5A40] text-white'
                : 'bg-[#F0F0E5] text-[#5A5A40] hover:bg-[#E0E0D5]'
            }`}
            title={isExpanded ? 'Collapse card' : 'Expand full details'}
            aria-label={isExpanded ? 'Collapse card' : 'Expand card'}
          >
            {isExpanded ? (
              <>
                <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span className="text-[11px]">Less</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span className="text-[11px]">More</span>
              </>
            )}
          </button>
        </div>

        {/* Collapsed Summary View */}
        <div className="pt-2.5 space-y-2 text-xs">
          {/* Key Summary Rows */}
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
            {/* Invoice */}
            <div>
              <span className="text-[10px] uppercase font-bold text-[#8A8A7A] block">
                Invoice #
              </span>
              <span className="font-mono font-medium text-[#5A5A40] truncate block">
                {displayVal(shipment['Invoice Number'])}
              </span>
            </div>

            {/* Carrier */}
            <div>
              <span className="text-[10px] uppercase font-bold text-[#8A8A7A] block">
                Carrier
              </span>
              <span className="font-medium text-[#1A1A1A] truncate block flex items-center gap-1">
                <Truck className="w-3 h-3 text-[#8A8A7A] shrink-0" />
                {displayVal(shipment['Shipping Company'])}
              </span>
            </div>

            {/* Importing Company */}
            <div>
              <span className="text-[10px] uppercase font-bold text-[#8A8A7A] block">
                Importing Co.
              </span>
              <span className="font-medium text-[#1A1A1A] truncate block flex items-center gap-1">
                <Building2 className="w-3 h-3 text-[#8A8A7A] shrink-0" />
                {displayVal(shipment['importing co.'])}
              </span>
            </div>

            {/* Broker */}
            <div>
              <span className="text-[10px] uppercase font-bold text-[#8A8A7A] block">
                Broker
              </span>
              <span className="font-medium text-[#5A5A40] truncate block flex items-center gap-1">
                <UsersIcon className="w-3 h-3 text-[#8A8A7A] shrink-0" />
                {displayVal(shipment['Brokers'])}
              </span>
            </div>

            {/* Total Price */}
            <div>
              <span className="text-[10px] uppercase font-bold text-[#8A8A7A] block">
                Total Price
              </span>
              <span className="font-bold text-[#1A1A1A] flex items-center gap-0.5">
                <DollarSign className="w-3 h-3 text-[#8A8A7A]" />
                {formatPrice(shipment['Total Price'])}
              </span>
            </div>

            {/* Expected Arrival */}
            <div>
              <span className="text-[10px] uppercase font-bold text-[#8A8A7A] block">
                Exp. Arrival
              </span>
              <span className="font-medium text-[#4A4A40] flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#8A8A7A] shrink-0" />
                {formatDate(shipment['Expected Arrival'])}
              </span>
            </div>
          </div>

          {/* Products Short Preview */}
          {productsPreview && (
            <div className="bg-[#FAFBF8] border border-[#F0F0E5] p-2 rounded-lg mt-1">
              <span className="text-[10px] uppercase font-bold text-[#8A8A7A] flex items-center gap-1 mb-0.5">
                <Layers className="w-2.5 h-2.5 text-[#8A8A7A]" />
                Products
              </span>
              <p className="text-xs text-[#2D2D20] line-clamp-2 leading-relaxed">
                {productsPreview}
              </p>
            </div>
          )}

          {/* Compact Workflow Badges Strip */}
          {hasWorkflow && (
            <div className="pt-1.5 flex flex-wrap gap-1">
              {shipment['تجهيز الورق'] && (
                <WorkflowBadge label="ورق" value={shipment['تجهيز الورق']} compact />
              )}
              {shipment['سحب العينات'] && (
                <WorkflowBadge label="عينات" value={shipment['سحب العينات']} compact />
              )}
              {shipment['المدفوعة'] && (
                <WorkflowBadge label="دفع" value={shipment['المدفوعة']} compact />
              )}
              {shipment['استلام المخزن'] && (
                <WorkflowBadge label="مخزن" value={shipment['استلام المخزن']} compact />
              )}
              {shipment['نتيجة المعمل المركزي'] && (
                <WorkflowBadge label="معمل" value={shipment['نتيجة المعمل المركزي']} compact />
              )}
              {shipment['مطابقة'] && (
                <WorkflowBadge label="مطابقة" value={shipment['مطابقة']} compact />
              )}
            </div>
          )}
        </div>

        {/* EXPANDED SECTION: Complete Shipment Details */}
        {isExpanded && (
          <div className="mt-3.5 pt-3.5 border-t border-[#E0E0D5] space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="text-[10px] uppercase font-bold text-[#5A5A40] tracking-wider">
              Complete Shipment Information
            </div>

            {/* Clean Key-Value Grid (2-column on tablet/larger mobile, 1-col on tiny screens) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="bg-[#FAFBF8] p-2 rounded-lg border border-[#F0F0E5]">
                <span className="text-[10px] uppercase font-bold text-[#8A8A7A] block">
                  Shipment ID
                </span>
                <span className="font-mono font-bold text-[#5A5A40]">
                  {displayVal(shipment['Shipment ID'])}
                </span>
              </div>

              <div className="bg-[#FAFBF8] p-2 rounded-lg border border-[#F0F0E5]">
                <span className="text-[10px] uppercase font-bold text-[#8A8A7A] block">
                  Shipment Type
                </span>
                <span className="font-semibold text-[#1A1A1A]">
                  {displayVal(shipment['shipment type'])}
                </span>
              </div>

              <div className="bg-[#FAFBF8] p-2 rounded-lg border border-[#F0F0E5]">
                <span className="text-[10px] uppercase font-bold text-[#8A8A7A] block">
                  Importing Company
                </span>
                <span className="font-semibold text-[#1A1A1A]">
                  {displayVal(shipment['importing co.'])}
                </span>
              </div>

              <div className="bg-[#FAFBF8] p-2 rounded-lg border border-[#F0F0E5]">
                <span className="text-[10px] uppercase font-bold text-[#8A8A7A] block">
                  Broker
                </span>
                <span className="font-semibold text-[#1A1A1A]">
                  {displayVal(shipment['Brokers'])}
                </span>
              </div>

              <div className="bg-[#FAFBF8] p-2 rounded-lg border border-[#F0F0E5]">
                <span className="text-[10px] uppercase font-bold text-[#8A8A7A] block">
                  Carrier / Shipping Co.
                </span>
                <span className="font-semibold text-[#1A1A1A]">
                  {displayVal(shipment['Shipping Company'])}
                </span>
              </div>

              <div className="bg-[#FAFBF8] p-2 rounded-lg border border-[#F0F0E5]">
                <span className="text-[10px] uppercase font-bold text-[#8A8A7A] block">
                  Total Price
                </span>
                <span className="font-bold text-[#1A1A1A]">
                  {formatPrice(shipment['Total Price'])}
                </span>
              </div>

              <div className="bg-[#FAFBF8] p-2 rounded-lg border border-[#F0F0E5]">
                <span className="text-[10px] uppercase font-bold text-[#8A8A7A] block">
                  Bill of Lading
                </span>
                <span className="font-mono font-medium text-[#5A5A40]">
                  {displayVal(shipment['bill of lading'])}
                </span>
              </div>

              <div className="bg-[#FAFBF8] p-2 rounded-lg border border-[#F0F0E5]">
                <span className="text-[10px] uppercase font-bold text-[#8A8A7A] block">
                  Bank Document
                </span>
                <span className="font-mono font-medium text-[#5A5A40]">
                  {displayVal(shipment['bank document'])}
                </span>
              </div>

              <div className="bg-[#FAFBF8] p-2 rounded-lg border border-[#F0F0E5]">
                <span className="text-[10px] uppercase font-bold text-[#8A8A7A] block">
                  Invoice Number
                </span>
                <span className="font-mono font-medium text-[#5A5A40]">
                  {displayVal(shipment['Invoice Number'])}
                </span>
              </div>

              <div className="bg-[#FAFBF8] p-2 rounded-lg border border-[#F0F0E5]">
                <span className="text-[10px] uppercase font-bold text-[#8A8A7A] block">
                  ACID Number
                </span>
                <span className="font-mono font-medium text-[#5A5A40]">
                  {displayVal(shipment['Acid Number'])}
                </span>
              </div>

              <div className="bg-[#FAFBF8] p-2 rounded-lg border border-[#F0F0E5]">
                <span className="text-[10px] uppercase font-bold text-[#8A8A7A] block">
                  Departure Date
                </span>
                <span className="font-medium text-[#4A4A40]">
                  {formatDate(shipment['Departure Date'])}
                </span>
              </div>

              <div className="bg-[#FAFBF8] p-2 rounded-lg border border-[#F0F0E5]">
                <span className="text-[10px] uppercase font-bold text-[#8A8A7A] block">
                  Expected Arrival
                </span>
                <span className="font-medium text-[#4A4A40]">
                  {formatDate(shipment['Expected Arrival'])}
                </span>
              </div>

              <div className="bg-[#FAFBF8] p-2 rounded-lg border border-[#F0F0E5] sm:col-span-2">
                <span className="text-[10px] uppercase font-bold text-[#8A8A7A] block">
                  Actual Arrival Date
                </span>
                <span className="font-medium text-[#4A4A40]">
                  {formatDate(shipment['Actual Arrival'])}
                </span>
              </div>
            </div>

            {/* Complete Products Multiline */}
            <div className="bg-[#FAFBF8] p-2.5 rounded-lg border border-[#F0F0E5]">
              <span className="text-[10px] uppercase font-bold text-[#8A8A7A] flex items-center gap-1 mb-1">
                <Layers className="w-3 h-3 text-[#8A8A7A]" />
                Full Products Details
              </span>
              <p className="text-xs text-[#2D2D20] whitespace-pre-wrap leading-relaxed">
                {displayVal(shipment['Products'])}
              </p>
            </div>

            {/* Full Workflow Procedures Grid */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-[#8A8A7A] block">
                Workflow Procedures (الإجراءات)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                <WorkflowBadge
                  label="تجهيز الورق"
                  value={shipment['تجهيز الورق']}
                />
                <WorkflowBadge
                  label="سحب العينات"
                  value={shipment['سحب العينات']}
                />
                <WorkflowBadge
                  label="المدفوعة"
                  value={shipment['المدفوعة']}
                />
                <WorkflowBadge
                  label="استلام المخزن"
                  value={shipment['استلام المخزن']}
                />
                <WorkflowBadge
                  label="نتيجة المعمل المركزي"
                  value={shipment['نتيجة المعمل المركزي']}
                />
                <WorkflowBadge
                  label="مطابقة"
                  value={shipment['مطابقة']}
                />
              </div>
            </div>

            {/* General Notes */}
            {shipment['Notes'] && (
              <div className="bg-[#FAFBF8] p-2.5 rounded-lg border border-[#F0F0E5]">
                <span className="text-[10px] uppercase font-bold text-[#8A8A7A] flex items-center gap-1 mb-0.5">
                  <StickyNote className="w-3 h-3 text-[#8A8A7A]" />
                  General Notes
                </span>
                <p className="text-xs text-[#3D3D2D] whitespace-pre-wrap leading-relaxed">
                  {displayVal(shipment['Notes'])}
                </p>
              </div>
            )}

            {/* Notes Hedy */}
            {isHedy && hedyNote && (
              <div className="bg-[#FBF8F0] p-2.5 rounded-lg border border-[#E8DFC5]">
                <span className="text-[10px] uppercase font-bold text-[#785412] flex items-center gap-1 mb-0.5">
                  <StickyNote className="w-3 h-3 text-[#785412]" />
                  Private Notes (Hedy)
                </span>
                <p className="text-xs text-[#4E3506] whitespace-pre-wrap leading-relaxed font-medium">
                  {displayVal(hedyNote)}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Card Footer Actions */}
      <div className="flex items-center justify-between gap-2 px-3.5 sm:px-4 py-2.5 bg-[#FAFBF8] border-t border-[#F0F0E5]">
        <button
          id={`btn-view-${shipmentId}`}
          type="button"
          onClick={() => onView(shipment)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#5A5A40] hover:bg-[#EAEAE0] rounded-lg transition-colors border border-[#E0E0D5]"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Details Modal</span>
        </button>

        <div className="flex items-center gap-1.5">
          {canEdit && (
            <>
              <button
                id={`btn-edit-${shipmentId}`}
                type="button"
                onClick={() => onEdit(shipment)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-[#5A5A40] hover:bg-[#4A4A35] rounded-lg transition-colors shadow-2xs"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
              <button
                id={`btn-delete-${shipmentId}`}
                type="button"
                onClick={() => onDelete(shipment)}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-[#8C3A35] hover:bg-[#F9ECEB] rounded-lg transition-colors"
                title="Delete Shipment"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
