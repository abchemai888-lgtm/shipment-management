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
  FileText,
  Calendar,
  Layers,
  StickyNote,
  DollarSign,
  Users as UsersIcon,
  Tag,
  CheckCircle2,
} from 'lucide-react';

interface ShipmentsTableProps {
  shipments: Shipment[];
  onView: (shipment: Shipment) => void;
  onEdit: (shipment: Shipment) => void;
  onDelete: (shipment: Shipment) => void;
}

export default function ShipmentsTable({
  shipments,
  onView,
  onEdit,
  onDelete,
}: ShipmentsTableProps) {
  const { user } = useAuth();
  const isHedy = user?.user_id === 'USR-007';
  const canEdit = user?.role === 'editor';

  // Track expanded row IDs
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const colSpan = isHedy ? 14 : 13;

  return (
    <div
      id="shipments-table-wrapper"
      className="bg-white border border-[#E0E0D5] rounded-xl shadow-xs overflow-hidden flex flex-col"
    >
      <div className="overflow-x-auto">
        <table id="shipments-data-table" className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#FBFBF8] border-b border-[#E0E0D5] text-[11px] font-bold uppercase tracking-wider text-[#8A8A7A]">
              <th className="py-2.5 px-3 w-10 text-center"></th>
              <th className="py-2.5 px-3 font-semibold">Shipment ID</th>
              <th className="py-2.5 px-3 font-semibold">Type</th>
              <th className="py-2.5 px-3 font-semibold">Importing Co.</th>
              <th className="py-2.5 px-3 font-semibold">Broker</th>
              <th className="py-2.5 px-3 font-semibold">Carrier</th>
              <th className="py-2.5 px-3 font-semibold">Invoice #</th>
              <th className="py-2.5 px-3 font-semibold">Bill of Lading</th>
              <th className="py-2.5 px-3 font-semibold min-w-[140px] max-w-[200px]">Products</th>
              <th className="py-2.5 px-3 font-semibold">Total Price</th>
              <th className="py-2.5 px-3 font-semibold">Exp. Arrival</th>
              <th className="py-2.5 px-3 font-semibold">Workflow</th>
              {isHedy && <th className="py-2.5 px-3 font-semibold">Notes Hedy</th>}
              <th className="py-2.5 px-4 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0F0E5] text-[#4A4A40]">
            {shipments.map((shipment, index) => {
              const shipmentId = shipment['Shipment ID'] || `row-${index}`;
              const isExpanded = expandedIds.has(shipmentId);
              const hedyNote = shipment['notes hidy'];

              // Single line preview for products
              const rawProducts = String(shipment['Products'] || '').trim();
              const productsPreview = rawProducts ? rawProducts.replace(/[\r\n]+/g, ' ') : '--';

              return (
                <React.Fragment key={shipmentId}>
                  {/* Main compact row */}
                  <tr
                    id={`shipment-row-${shipmentId}`}
                    onClick={() => toggleExpand(shipmentId)}
                    className={`hover:bg-[#F9F9F4] transition-colors cursor-pointer group ${
                      isExpanded
                        ? 'bg-[#F5F5EC]'
                        : index % 2 === 1
                        ? 'bg-[#FDFDFB]'
                        : 'bg-white'
                    }`}
                  >
                    {/* Expand/Collapse Button Column */}
                    <td
                      className="py-2 px-2 text-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(shipmentId);
                      }}
                    >
                      <button
                        id={`btn-expand-row-${shipmentId}`}
                        type="button"
                        className={`w-6 h-6 rounded-md flex items-center justify-center transition-all ${
                          isExpanded
                            ? 'bg-[#5A5A40] text-white'
                            : 'bg-[#F0F0E5] text-[#5A5A40] hover:bg-[#E0E0D5]'
                        }`}
                        title={isExpanded ? 'Collapse row' : 'Expand row details'}
                        aria-label={isExpanded ? 'Collapse row' : 'Expand row'}
                      >
                        {isExpanded ? (
                          <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                        ) : (
                          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        )}
                      </button>
                    </td>

                    {/* Shipment ID */}
                    <td className="py-2 px-3 font-mono font-bold text-[#5A5A40] whitespace-nowrap">
                      {displayVal(shipment['Shipment ID'])}
                    </td>

                    {/* Type */}
                    <td className="py-2 px-3 font-medium text-[#1A1A1A] whitespace-nowrap">
                      {shipment['shipment type'] ? (
                        <span className="inline-block px-2 py-0.5 bg-[#F0F0E5] text-[#5A5A40] rounded text-[11px] font-medium">
                          {shipment['shipment type']}
                        </span>
                      ) : (
                        <span className="text-[#B0B0A0]">--</span>
                      )}
                    </td>

                    {/* Importing Co. */}
                    <td className="py-2 px-3 text-[#3D3D2D]">
                      <span
                        className="truncate block max-w-[130px]"
                        title={shipment['importing co.'] || ''}
                      >
                        {displayVal(shipment['importing co.'])}
                      </span>
                    </td>

                    {/* Broker */}
                    <td className="py-2 px-3 text-[#5A5A40]">
                      <span
                        className="truncate block max-w-[110px]"
                        title={shipment['Brokers'] || ''}
                      >
                        {displayVal(shipment['Brokers'])}
                      </span>
                    </td>

                    {/* Carrier */}
                    <td className="py-2 px-3 text-[#4A4A40]">
                      <span
                        className="truncate block max-w-[110px]"
                        title={shipment['Shipping Company'] || ''}
                      >
                        {displayVal(shipment['Shipping Company'])}
                      </span>
                    </td>

                    {/* Invoice Number */}
                    <td className="py-2 px-3 font-mono text-[#5A5A40] whitespace-nowrap">
                      {displayVal(shipment['Invoice Number'])}
                    </td>

                    {/* Bill of Lading */}
                    <td className="py-2 px-3 font-mono text-[#5A5A40] whitespace-nowrap">
                      <span
                        className="truncate block max-w-[100px]"
                        title={shipment['bill of lading'] || ''}
                      >
                        {displayVal(shipment['bill of lading'])}
                      </span>
                    </td>

                    {/* Products (Single-line truncated preview) */}
                    <td className="py-2 px-3 text-[#6A6A5A]">
                      <span
                        className="truncate block max-w-[180px]"
                        title={rawProducts}
                      >
                        {productsPreview}
                      </span>
                    </td>

                    {/* Total Price */}
                    <td className="py-2 px-3 font-semibold text-[#1A1A1A] whitespace-nowrap">
                      {formatPrice(shipment['Total Price'])}
                    </td>

                    {/* Expected Arrival */}
                    <td className="py-2 px-3 text-[#6A6A5A] whitespace-nowrap">
                      {formatDate(shipment['Expected Arrival'])}
                    </td>

                    {/* Workflow */}
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-1 max-w-[160px] overflow-hidden">
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
                        {!shipment['تجهيز الورق'] &&
                          !shipment['سحب العينات'] &&
                          !shipment['المدفوعة'] &&
                          !shipment['استلام المخزن'] &&
                          !shipment['نتيجة المعمل المركزي'] &&
                          !shipment['مطابقة'] && (
                            <span className="text-[#B0B0A0] text-xs">--</span>
                          )}
                      </div>
                    </td>

                    {/* Notes Hedy */}
                    {isHedy && (
                      <td className="py-2 px-3 text-[#3D3D2D]">
                        <span
                          className="truncate block max-w-[110px]"
                          title={hedyNote || ''}
                        >
                          {displayVal(hedyNote)}
                        </span>
                      </td>
                    )}

                    {/* Actions */}
                    <td
                      className="py-2 px-4 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1">
                        <button
                          id={`btn-table-view-${shipmentId}`}
                          type="button"
                          onClick={() => onView(shipment)}
                          className="p-1 text-[#8A8A7A] hover:text-[#5A5A40] hover:bg-[#EAEAE0] rounded transition-colors"
                          title="Open Details Modal"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {canEdit && (
                          <>
                            <button
                              id={`btn-table-edit-${shipmentId}`}
                              type="button"
                              onClick={() => onEdit(shipment)}
                              className="p-1 text-[#8A8A7A] hover:text-[#5A5A40] hover:bg-[#EAEAE0] rounded transition-colors"
                              title="Edit Shipment"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              id={`btn-table-delete-${shipmentId}`}
                              type="button"
                              onClick={() => onDelete(shipment)}
                              className="p-1 text-[#8A8A7A] hover:text-[#8C3A35] hover:bg-[#F9ECEB] rounded transition-colors"
                              title="Delete Shipment"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Accordion Panel */}
                  {isExpanded && (
                    <tr
                      id={`shipment-expanded-${shipmentId}`}
                      className="bg-[#F8F8F4] border-b border-[#E0E0D5]"
                    >
                      <td colSpan={colSpan} className="p-4 sm:p-5">
                        <div className="bg-white border border-[#E0E0D5] rounded-xl p-4 sm:p-5 shadow-2xs space-y-4 animate-in fade-in duration-150">
                          {/* Header of expanded section */}
                          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#F0F0E5]">
                            <div className="flex items-center gap-3">
                              <span className="font-mono font-bold text-sm text-[#5A5A40] bg-[#F5F5F0] px-2.5 py-1 rounded-md border border-[#E0E0D5]">
                                {displayVal(shipment['Shipment ID'])}
                              </span>
                              {shipment['shipment type'] && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#F0F0E5] text-[#5A5A40] text-xs font-semibold rounded-md">
                                  <Tag className="w-3 h-3" />
                                  {shipment['shipment type']}
                                </span>
                              )}
                              <span className="text-xs text-[#8A8A7A]">
                                Complete Shipment Record
                              </span>
                            </div>

                            {/* Quick action buttons in expanded view */}
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => onView(shipment)}
                                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#5A5A40] bg-[#F5F5F0] hover:bg-[#EAEAE0] rounded-lg transition-colors border border-[#E0E0D5]"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Full Modal</span>
                              </button>
                              {canEdit && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => onEdit(shipment)}
                                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-[#5A5A40] hover:bg-[#4A4A35] rounded-lg transition-colors shadow-2xs"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                    <span>Edit</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => onDelete(shipment)}
                                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#8C3A35] hover:bg-[#F9ECEB] rounded-lg transition-colors border border-transparent hover:border-[#ECDCDC]"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Delete</span>
                                  </button>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Key/Value Data Grid (3 columns on wide screens) */}
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
                            <div className="bg-[#FAFBF8] p-2.5 rounded-lg border border-[#F0F0E5]">
                              <span className="text-[10px] uppercase font-bold text-[#8A8A7A] block mb-0.5">
                                Importing Company
                              </span>
                              <span className="font-semibold text-[#1A1A1A] flex items-center gap-1">
                                <Building2 className="w-3.5 h-3.5 text-[#8A8A7A] shrink-0" />
                                {displayVal(shipment['importing co.'])}
                              </span>
                            </div>

                            <div className="bg-[#FAFBF8] p-2.5 rounded-lg border border-[#F0F0E5]">
                              <span className="text-[10px] uppercase font-bold text-[#8A8A7A] block mb-0.5">
                                Broker
                              </span>
                              <span className="font-semibold text-[#1A1A1A] flex items-center gap-1">
                                <UsersIcon className="w-3.5 h-3.5 text-[#8A8A7A] shrink-0" />
                                {displayVal(shipment['Brokers'])}
                              </span>
                            </div>

                            <div className="bg-[#FAFBF8] p-2.5 rounded-lg border border-[#F0F0E5]">
                              <span className="text-[10px] uppercase font-bold text-[#8A8A7A] block mb-0.5">
                                Shipping Carrier
                              </span>
                              <span className="font-semibold text-[#1A1A1A] flex items-center gap-1">
                                <Truck className="w-3.5 h-3.5 text-[#8A8A7A] shrink-0" />
                                {displayVal(shipment['Shipping Company'])}
                              </span>
                            </div>

                            <div className="bg-[#FAFBF8] p-2.5 rounded-lg border border-[#F0F0E5]">
                              <span className="text-[10px] uppercase font-bold text-[#8A8A7A] block mb-0.5">
                                Total Price
                              </span>
                              <span className="font-bold text-[#1A1A1A] text-sm flex items-center gap-0.5">
                                <DollarSign className="w-3.5 h-3.5 text-[#8A8A7A]" />
                                {formatPrice(shipment['Total Price'])}
                              </span>
                            </div>

                            <div className="bg-[#FAFBF8] p-2.5 rounded-lg border border-[#F0F0E5]">
                              <span className="text-[10px] uppercase font-bold text-[#8A8A7A] block mb-0.5">
                                Invoice Number
                              </span>
                              <span className="font-mono font-semibold text-[#5A5A40] flex items-center gap-1">
                                <FileText className="w-3.5 h-3.5 text-[#8A8A7A] shrink-0" />
                                {displayVal(shipment['Invoice Number'])}
                              </span>
                            </div>

                            <div className="bg-[#FAFBF8] p-2.5 rounded-lg border border-[#F0F0E5]">
                              <span className="text-[10px] uppercase font-bold text-[#8A8A7A] block mb-0.5">
                                ACID Number
                              </span>
                              <span className="font-mono font-semibold text-[#5A5A40] flex items-center gap-1">
                                <FileText className="w-3.5 h-3.5 text-[#8A8A7A] shrink-0" />
                                {displayVal(shipment['Acid Number'])}
                              </span>
                            </div>

                            <div className="bg-[#FAFBF8] p-2.5 rounded-lg border border-[#F0F0E5]">
                              <span className="text-[10px] uppercase font-bold text-[#8A8A7A] block mb-0.5">
                                Bill of Lading
                              </span>
                              <span className="font-mono font-semibold text-[#5A5A40] flex items-center gap-1">
                                <FileText className="w-3.5 h-3.5 text-[#8A8A7A] shrink-0" />
                                {displayVal(shipment['bill of lading'])}
                              </span>
                            </div>

                            <div className="bg-[#FAFBF8] p-2.5 rounded-lg border border-[#F0F0E5]">
                              <span className="text-[10px] uppercase font-bold text-[#8A8A7A] block mb-0.5">
                                Bank Document
                              </span>
                              <span className="font-mono font-semibold text-[#5A5A40] flex items-center gap-1">
                                <FileText className="w-3.5 h-3.5 text-[#8A8A7A] shrink-0" />
                                {displayVal(shipment['bank document'])}
                              </span>
                            </div>

                            <div className="bg-[#FAFBF8] p-2.5 rounded-lg border border-[#F0F0E5]">
                              <span className="text-[10px] uppercase font-bold text-[#8A8A7A] block mb-0.5">
                                Departure Date
                              </span>
                              <span className="font-medium text-[#4A4A40] flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-[#8A8A7A] shrink-0" />
                                {formatDate(shipment['Departure Date'])}
                              </span>
                            </div>

                            <div className="bg-[#FAFBF8] p-2.5 rounded-lg border border-[#F0F0E5]">
                              <span className="text-[10px] uppercase font-bold text-[#8A8A7A] block mb-0.5">
                                Expected Arrival
                              </span>
                              <span className="font-medium text-[#4A4A40] flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-[#8A8A7A] shrink-0" />
                                {formatDate(shipment['Expected Arrival'])}
                              </span>
                            </div>

                            <div className="bg-[#FAFBF8] p-2.5 rounded-lg border border-[#F0F0E5]">
                              <span className="text-[10px] uppercase font-bold text-[#8A8A7A] block mb-0.5">
                                Actual Arrival
                              </span>
                              <span className="font-medium text-[#4A4A40] flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-[#8A8A7A] shrink-0" />
                                {formatDate(shipment['Actual Arrival'])}
                              </span>
                            </div>
                          </div>

                          {/* Full Products Description */}
                          <div className="bg-[#FAFBF8] p-3 rounded-lg border border-[#F0F0E5]">
                            <span className="text-[10px] uppercase font-bold text-[#8A8A7A] flex items-center gap-1 mb-1">
                              <Layers className="w-3 h-3 text-[#8A8A7A]" />
                              Complete Products Description
                            </span>
                            <p className="text-xs text-[#2D2D20] whitespace-pre-wrap leading-relaxed font-sans font-medium">
                              {displayVal(shipment['Products'])}
                            </p>
                          </div>

                          {/* Full Workflow Procedures Grid */}
                          <div className="space-y-1.5">
                            <span className="text-[10px] uppercase font-bold text-[#8A8A7A] block">
                              Workflow Procedures (الإجراءات)
                            </span>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
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

                          {/* Notes */}
                          {shipment['Notes'] && (
                            <div className="bg-[#FAFBF8] p-3 rounded-lg border border-[#F0F0E5]">
                              <span className="text-[10px] uppercase font-bold text-[#8A8A7A] flex items-center gap-1 mb-1">
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
                            <div className="bg-[#FBF8F0] p-3 rounded-lg border border-[#E8DFC5]">
                              <span className="text-[10px] uppercase font-bold text-[#785412] flex items-center gap-1 mb-1">
                                <StickyNote className="w-3 h-3 text-[#785412]" />
                                Private Notes (Hedy)
                              </span>
                              <p className="text-xs text-[#4E3506] whitespace-pre-wrap leading-relaxed font-medium">
                                {displayVal(hedyNote)}
                              </p>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="border-t border-[#F0F0E5] bg-[#FBFBF8] px-4 sm:px-6 py-2.5 flex items-center justify-between text-xs text-[#8A8A7A]">
        <div>Showing {shipments.length} shipment{shipments.length === 1 ? '' : 's'}</div>
        <div className="flex items-center gap-2 font-medium">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block" />
          <span>Google Sheets Synchronized</span>
        </div>
      </div>
    </div>
  );
}
