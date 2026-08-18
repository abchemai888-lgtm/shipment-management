import React, { useState, useEffect } from 'react';
import { Shipment } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { addShipmentApi, updateShipmentApi } from '../../services/api';
import { formatDateToDMY, formatDateForSheet } from '../../utils/formatters';
import DatePicker from '../Common/DatePicker';
import { X, Loader2, Plus, Edit2 } from 'lucide-react';

interface ShipmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingShipment?: Shipment | null;
}

const INITIAL_FORM: Shipment = {
  'Shipment ID': '',
  'shipment type': '',
  'importing co.': '',
  'Brokers': '',
  'Shipping Company': '',
  'bill of lading': '',
  'bank document': '',
  'Invoice Number': '',
  'Acid Number': '',
  'Total Price': '',
  'Departure Date': '',
  'Expected Arrival': '',
  'Actual Arrival': '',
  'Products': '',
  'Notes': '',
  'تجهيز الورق': '',
  'سحب العينات': '',
  'المدفوعة': '',
  'استلام المخزن': '',
  'نتيجة المعمل المركزي': '',
  'مطابقة': '',
  'notes hidy': '',
};

export default function ShipmentFormModal({
  isOpen,
  onClose,
  onSuccess,
  editingShipment,
}: ShipmentFormModalProps) {
  const { token, user } = useAuth();
  const isHedy = user?.user_id === 'USR-007';
  const { showSuccess, showError } = useToast();
  const [formData, setFormData] = useState<Shipment>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isEditMode = Boolean(editingShipment);

  useEffect(() => {
    if (editingShipment) {
      setFormData({
        'Shipment ID': editingShipment['Shipment ID'] || '',
        'shipment type': editingShipment['shipment type'] || '',
        'importing co.': editingShipment['importing co.'] || '',
        'Brokers': editingShipment['Brokers'] || '',
        'Shipping Company': editingShipment['Shipping Company'] || '',
        'bill of lading': editingShipment['bill of lading'] || '',
        'bank document': editingShipment['bank document'] || '',
        'Invoice Number': editingShipment['Invoice Number'] || '',
        'Acid Number': editingShipment['Acid Number'] || '',
        'Total Price':
          editingShipment['Total Price'] !== undefined && editingShipment['Total Price'] !== null
            ? String(editingShipment['Total Price'])
            : '',
        'Departure Date': formatDateToDMY(editingShipment['Departure Date']),
        'Expected Arrival': formatDateToDMY(editingShipment['Expected Arrival']),
        'Actual Arrival': formatDateToDMY(editingShipment['Actual Arrival']),
        'Products': editingShipment['Products'] || '',
        'Notes': editingShipment['Notes'] || '',
        'تجهيز الورق': editingShipment['تجهيز الورق'] || '',
        'سحب العينات': editingShipment['سحب العينات'] || '',
        'المدفوعة': editingShipment['المدفوعة'] || '',
        'استلام المخزن': editingShipment['استلام المخزن'] || '',
        'نتيجة المعمل المركزي': editingShipment['نتيجة المعمل المركزي'] || '',
        'مطابقة': editingShipment['مطابقة'] || '',
        'notes hidy': editingShipment['notes hidy'] || '',
      });
    } else {
      setFormData(INITIAL_FORM);
    }
    setErrorMessage(null);
  }, [editingShipment, isOpen]);

  if (!isOpen) return null;

  const handleChange = (
    field: keyof Shipment,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const isDateField = (field: keyof Shipment) => {
    return (
      field === 'Departure Date' ||
      field === 'Expected Arrival' ||
      field === 'Actual Arrival'
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!token) {
      showError('Authentication session missing. Please log in.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditMode && editingShipment) {
        const shipmentId = editingShipment['Shipment ID'] || formData['Shipment ID'];
        if (!shipmentId) {
          throw new Error('Shipment ID is missing for update.');
        }

        // Only send the fields that actually changed (excluding Shipment ID)
        const updates: Partial<Shipment> = {};
        const fields = Object.keys(formData) as (keyof Shipment)[];

        for (const field of fields) {
          if (field === 'Shipment ID') continue;
          if (field === 'notes hidy' && !isHedy) continue;

          let currentVal =
            formData[field] !== undefined && formData[field] !== null
              ? String(formData[field]).trim()
              : '';
          let originalVal =
            editingShipment[field] !== undefined && editingShipment[field] !== null
              ? String(editingShipment[field]).trim()
              : '';

          if (isDateField(field)) {
            const formattedCurrent = formatDateForSheet(currentVal);
            const formattedOriginal = formatDateForSheet(originalVal);
            if (formattedCurrent !== formattedOriginal) {
              updates[field] = formattedCurrent;
            }
          } else if (currentVal !== originalVal) {
            // Clean value - never send placeholder "--"
            updates[field] = (formData[field] !== undefined && formData[field] !== null)
              ? String(formData[field])
              : '';
          }
        }

        if (Object.keys(updates).length === 0) {
          showSuccess('No changes detected.');
          onClose();
          setIsSubmitting(false);
          return;
        }

        const res = await updateShipmentApi(token, shipmentId, updates);
        if (res && res.success === false) {
          throw new Error(res.message || res.error || 'Failed to update shipment');
        }

        showSuccess('Shipment updated successfully.');
        onSuccess();
        onClose();
      } else {
        // Add new shipment - all fields are optional, Shipment ID is excluded
        const payloadShipment: any = {
          ...formData,
        };
        delete payloadShipment['Shipment ID'];

        if (!isHedy) {
          delete payloadShipment['notes hidy'];
        }

        // Format dates as dd/mm/yyyy and ensure clean values
        for (const key of Object.keys(payloadShipment)) {
          if (payloadShipment[key] === undefined || payloadShipment[key] === null) {
            payloadShipment[key] = '';
          } else if (isDateField(key as keyof Shipment)) {
            payloadShipment[key] = formatDateForSheet(payloadShipment[key]);
          } else {
            payloadShipment[key] = String(payloadShipment[key]);
          }
        }

        const res = await addShipmentApi(token, payloadShipment);
        if (res && res.success === false) {
          throw new Error(res.message || res.error || 'Failed to add shipment');
        }

        showSuccess('Shipment added successfully.');
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit shipment.');
      showError(err.message || 'Action failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="shipment-form-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/30 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="shipment-form-modal-card"
        className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-[#E0E0D5] overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-[#F0F0E5] bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#5A5A40] text-white rounded-lg flex items-center justify-center shadow-xs">
              {isEditMode ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </div>
            <div>
              <h2
                id="shipment-form-title"
                className="text-lg font-bold text-[#3D3D2D] tracking-tight"
              >
                {isEditMode ? `Edit Shipment: ${formData['Shipment ID'] || ''}` : 'Add New Shipment'}
              </h2>
              <p className="text-xs text-[#8A8A7A]">
                {isEditMode
                  ? 'Update shipment fields and workflow records'
                  : 'Enter the shipment details (all fields are optional)'}
              </p>
            </div>
          </div>
          <button
            id="btn-close-shipment-form"
            onClick={onClose}
            className="text-[#A0A090] hover:text-[#5A5A40] p-1.5 rounded-lg hover:bg-[#F5F5F0] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 sm:p-8 space-y-6 max-h-[72vh] overflow-y-auto">
            {errorMessage && (
              <div
                id="shipment-form-error-alert"
                className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium rounded-lg"
              >
                {errorMessage}
              </div>
            )}

            {/* Section 1: Identification & Commercial Info */}
            <div>
              <h3 className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider mb-3">
                General & Commercial Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Shipment ID (Auto-generated / Read-only) */}
                <div>
                  <label
                    htmlFor="field-shipment-id"
                    className="block text-xs font-semibold text-[#5A5A40] uppercase tracking-wider mb-1.5"
                  >
                    Shipment ID <span className="text-[#8A8A7A] font-normal">({isEditMode ? 'Read-only' : 'Auto-generated'})</span>
                  </label>
                  <input
                    id="field-shipment-id"
                    type="text"
                    value={isEditMode ? formData['Shipment ID'] || '' : 'Auto-generated by backend'}
                    readOnly
                    disabled
                    className="w-full px-3.5 py-2 bg-[#F5F5F0] border border-[#E0E0D5] text-[#8A8A7A] font-mono text-sm rounded-lg cursor-not-allowed select-none"
                  />
                </div>

                {/* Shipment Type */}
                <div>
                  <label
                    htmlFor="field-shipment-type"
                    className="block text-xs font-semibold text-[#5A5A40] uppercase tracking-wider mb-1.5"
                  >
                    Shipment Type
                  </label>
                  <input
                    id="field-shipment-type"
                    type="text"
                    value={formData['shipment type'] || ''}
                    onChange={(e) => handleChange('shipment type', e.target.value)}
                    placeholder="e.g. Sea Freight, Air Cargo"
                    className="w-full px-3.5 py-2 bg-white border border-[#E0E0D5] rounded-lg text-[#1A1A1A] placeholder:text-[#B0B0A0] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#5A5A40]"
                  />
                </div>

                {/* Importing Co. */}
                <div>
                  <label
                    htmlFor="field-importing-co"
                    className="block text-xs font-semibold text-[#5A5A40] uppercase tracking-wider mb-1.5"
                  >
                    Importing Co.
                  </label>
                  <input
                    id="field-importing-co"
                    type="text"
                    value={formData['importing co.'] || ''}
                    onChange={(e) => handleChange('importing co.', e.target.value)}
                    placeholder="e.g. ABC Trading Co."
                    className="w-full px-3.5 py-2 bg-white border border-[#E0E0D5] rounded-lg text-[#1A1A1A] placeholder:text-[#B0B0A0] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#5A5A40]"
                  />
                </div>

                {/* Brokers */}
                <div>
                  <label
                    htmlFor="field-brokers"
                    className="block text-xs font-semibold text-[#5A5A40] uppercase tracking-wider mb-1.5"
                  >
                    Brokers
                  </label>
                  <input
                    id="field-brokers"
                    type="text"
                    value={formData['Brokers'] || ''}
                    onChange={(e) => handleChange('Brokers', e.target.value)}
                    placeholder="e.g. Delta Customs Brokerage"
                    className="w-full px-3.5 py-2 bg-white border border-[#E0E0D5] rounded-lg text-[#1A1A1A] placeholder:text-[#B0B0A0] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#5A5A40]"
                  />
                </div>

                {/* Total Price */}
                <div>
                  <label
                    htmlFor="field-total-price"
                    className="block text-xs font-semibold text-[#5A5A40] uppercase tracking-wider mb-1.5"
                  >
                    Total Price
                  </label>
                  <input
                    id="field-total-price"
                    type="text"
                    value={
                      formData['Total Price'] !== undefined && formData['Total Price'] !== null
                        ? String(formData['Total Price'])
                        : ''
                    }
                    onChange={(e) => handleChange('Total Price', e.target.value)}
                    placeholder="e.g. 15000"
                    className="w-full px-3.5 py-2 bg-white border border-[#E0E0D5] rounded-lg text-[#1A1A1A] placeholder:text-[#B0B0A0] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#5A5A40]"
                  />
                </div>

                {/* Invoice Number */}
                <div>
                  <label
                    htmlFor="field-invoice-number"
                    className="block text-xs font-semibold text-[#5A5A40] uppercase tracking-wider mb-1.5"
                  >
                    Invoice Number
                  </label>
                  <input
                    id="field-invoice-number"
                    type="text"
                    value={formData['Invoice Number'] || ''}
                    onChange={(e) => handleChange('Invoice Number', e.target.value)}
                    placeholder="e.g. INV-2024-001"
                    className="w-full px-3.5 py-2 bg-white border border-[#E0E0D5] rounded-lg text-[#1A1A1A] placeholder:text-[#B0B0A0] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#5A5A40]"
                  />
                </div>

                {/* Acid Number */}
                <div>
                  <label
                    htmlFor="field-acid-number"
                    className="block text-xs font-semibold text-[#5A5A40] uppercase tracking-wider mb-1.5"
                  >
                    Acid Number
                  </label>
                  <input
                    id="field-acid-number"
                    type="text"
                    value={formData['Acid Number'] || ''}
                    onChange={(e) => handleChange('Acid Number', e.target.value)}
                    placeholder="e.g. ACID-9981"
                    className="w-full px-3.5 py-2 bg-white border border-[#E0E0D5] rounded-lg text-[#1A1A1A] placeholder:text-[#B0B0A0] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#5A5A40]"
                  />
                </div>

                {/* Bill of Lading */}
                <div>
                  <label
                    htmlFor="field-bill-of-lading"
                    className="block text-xs font-semibold text-[#5A5A40] uppercase tracking-wider mb-1.5"
                  >
                    Bill of Lading
                  </label>
                  <input
                    id="field-bill-of-lading"
                    type="text"
                    value={formData['bill of lading'] || ''}
                    onChange={(e) => handleChange('bill of lading', e.target.value)}
                    placeholder="e.g. BL-77625"
                    className="w-full px-3.5 py-2 bg-white border border-[#E0E0D5] rounded-lg text-[#1A1A1A] placeholder:text-[#B0B0A0] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#5A5A40]"
                  />
                </div>

                {/* Bank Document */}
                <div className="sm:col-span-2">
                  <label
                    htmlFor="field-bank-document"
                    className="block text-xs font-semibold text-[#5A5A40] uppercase tracking-wider mb-1.5"
                  >
                    Bank Document
                  </label>
                  <input
                    id="field-bank-document"
                    type="text"
                    value={formData['bank document'] || ''}
                    onChange={(e) => handleChange('bank document', e.target.value)}
                    placeholder="e.g. DOC-BK-9182"
                    className="w-full px-3.5 py-2 bg-white border border-[#E0E0D5] rounded-lg text-[#1A1A1A] placeholder:text-[#B0B0A0] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#5A5A40]"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Logistics & Schedule */}
            <div>
              <h3 className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider mb-3">
                Logistics & Schedule
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Shipping Company */}
                <div className="sm:col-span-2">
                  <label
                    htmlFor="field-shipping-company"
                    className="block text-xs font-semibold text-[#5A5A40] uppercase tracking-wider mb-1.5"
                  >
                    Shipping Company
                  </label>
                  <input
                    id="field-shipping-company"
                    type="text"
                    value={formData['Shipping Company'] || ''}
                    onChange={(e) => handleChange('Shipping Company', e.target.value)}
                    placeholder="e.g. Maersk, DHL, Hapag-Lloyd"
                    className="w-full px-3.5 py-2 bg-white border border-[#E0E0D5] rounded-lg text-[#1A1A1A] placeholder:text-[#B0B0A0] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#5A5A40]"
                  />
                </div>

                {/* Departure Date */}
                <DatePicker
                  id="field-departure-date"
                  name="Departure Date"
                  label="Departure Date"
                  value={formData['Departure Date']}
                  onChange={(val) => handleChange('Departure Date', val)}
                  placeholder="dd/mm/yyyy"
                />

                {/* Expected Arrival */}
                <DatePicker
                  id="field-expected-arrival"
                  name="Expected Arrival"
                  label="Expected Arrival"
                  value={formData['Expected Arrival']}
                  onChange={(val) => handleChange('Expected Arrival', val)}
                  placeholder="dd/mm/yyyy"
                />

                {/* Actual Arrival */}
                <div className="sm:col-span-2">
                  <DatePicker
                    id="field-actual-arrival"
                    name="Actual Arrival"
                    label="Actual Arrival"
                    value={formData['Actual Arrival']}
                    onChange={(val) => handleChange('Actual Arrival', val)}
                    placeholder="dd/mm/yyyy"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Workflow Fields (Exact Google Sheet dropdown values) */}
            <div>
              <h3 className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider mb-3">
                Workflow & Procedures (الإجراءات)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* تجهيز الورق: pending / done */}
                <div>
                  <label
                    htmlFor="field-workflow-paperwork"
                    className="block text-xs font-semibold text-[#5A5A40] uppercase tracking-wider mb-1.5"
                  >
                    تجهيز الورق
                  </label>
                  <select
                    id="field-workflow-paperwork"
                    value={formData['تجهيز الورق'] || ''}
                    onChange={(e) => handleChange('تجهيز الورق', e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-[#E0E0D5] rounded-lg text-[#1A1A1A] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#5A5A40] cursor-pointer"
                  >
                    <option value="">-- (empty) --</option>
                    <option value="pending">pending</option>
                    <option value="done">done</option>
                  </select>
                </div>

                {/* سحب العينات: pending / done */}
                <div>
                  <label
                    htmlFor="field-workflow-sampling"
                    className="block text-xs font-semibold text-[#5A5A40] uppercase tracking-wider mb-1.5"
                  >
                    سحب العينات
                  </label>
                  <select
                    id="field-workflow-sampling"
                    value={formData['سحب العينات'] || ''}
                    onChange={(e) => handleChange('سحب العينات', e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-[#E0E0D5] rounded-lg text-[#1A1A1A] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#5A5A40] cursor-pointer"
                  >
                    <option value="">-- (empty) --</option>
                    <option value="pending">pending</option>
                    <option value="done">done</option>
                  </select>
                </div>

                {/* المدفوعة: pending / done */}
                <div>
                  <label
                    htmlFor="field-workflow-paid"
                    className="block text-xs font-semibold text-[#5A5A40] uppercase tracking-wider mb-1.5"
                  >
                    المدفوعة
                  </label>
                  <select
                    id="field-workflow-paid"
                    value={formData['المدفوعة'] || ''}
                    onChange={(e) => handleChange('المدفوعة', e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-[#E0E0D5] rounded-lg text-[#1A1A1A] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#5A5A40] cursor-pointer"
                  >
                    <option value="">-- (empty) --</option>
                    <option value="pending">pending</option>
                    <option value="done">done</option>
                  </select>
                </div>

                {/* استلام المخزن: pending / done */}
                <div>
                  <label
                    htmlFor="field-workflow-warehouse"
                    className="block text-xs font-semibold text-[#5A5A40] uppercase tracking-wider mb-1.5"
                  >
                    استلام المخزن
                  </label>
                  <select
                    id="field-workflow-warehouse"
                    value={formData['استلام المخزن'] || ''}
                    onChange={(e) => handleChange('استلام المخزن', e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-[#E0E0D5] rounded-lg text-[#1A1A1A] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#5A5A40] cursor-pointer"
                  >
                    <option value="">-- (empty) --</option>
                    <option value="pending">pending</option>
                    <option value="done">done</option>
                  </select>
                </div>

                {/* نتيجة المعمل المركزي: approved / non approved */}
                <div>
                  <label
                    htmlFor="field-workflow-lab"
                    className="block text-xs font-semibold text-[#5A5A40] uppercase tracking-wider mb-1.5"
                  >
                    نتيجة المعمل المركزي
                  </label>
                  <select
                    id="field-workflow-lab"
                    value={formData['نتيجة المعمل المركزي'] || ''}
                    onChange={(e) => handleChange('نتيجة المعمل المركزي', e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-[#E0E0D5] rounded-lg text-[#1A1A1A] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#5A5A40] cursor-pointer"
                  >
                    <option value="">-- (empty) --</option>
                    <option value="approved">approved</option>
                    <option value="non approved">non approved</option>
                  </select>
                </div>

                {/* مطابقة: approved / non approved */}
                <div>
                  <label
                    htmlFor="field-workflow-conformity"
                    className="block text-xs font-semibold text-[#5A5A40] uppercase tracking-wider mb-1.5"
                  >
                    مطابقة
                  </label>
                  <select
                    id="field-workflow-conformity"
                    value={formData['مطابقة'] || ''}
                    onChange={(e) => handleChange('مطابقة', e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-[#E0E0D5] rounded-lg text-[#1A1A1A] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#5A5A40] cursor-pointer"
                  >
                    <option value="">-- (empty) --</option>
                    <option value="approved">approved</option>
                    <option value="non approved">non approved</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 4: Cargo & Notes */}
            <div>
              <h3 className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider mb-3">
                Cargo & Notes
              </h3>
              <div className="space-y-4">
                {/* Products (Full Width) */}
                <div>
                  <label
                    htmlFor="field-products"
                    className="block text-xs font-semibold text-[#5A5A40] uppercase tracking-wider mb-1.5"
                  >
                    Products
                  </label>
                  <textarea
                    id="field-products"
                    rows={3}
                    value={formData['Products'] || ''}
                    onChange={(e) => handleChange('Products', e.target.value)}
                    placeholder="e.g. Industrial Chemicals, Raw Polymers (multiline supported)"
                    className="w-full px-3.5 py-2 bg-white border border-[#E0E0D5] rounded-lg text-[#1A1A1A] placeholder:text-[#B0B0A0] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#5A5A40]"
                  />
                </div>

                {/* Notes (Full Width) */}
                <div>
                  <label
                    htmlFor="field-notes"
                    className="block text-xs font-semibold text-[#5A5A40] uppercase tracking-wider mb-1.5"
                  >
                    Notes
                  </label>
                  <textarea
                    id="field-notes"
                    rows={2}
                    value={formData['Notes'] || ''}
                    onChange={(e) => handleChange('Notes', e.target.value)}
                    placeholder="General shipment instructions or customs remarks"
                    className="w-full px-3.5 py-2 bg-white border border-[#E0E0D5] rounded-lg text-[#1A1A1A] placeholder:text-[#B0B0A0] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#5A5A40]"
                  />
                </div>

                {/* Notes Hedy (Full Width - ONLY visible to Hedy USR-007) */}
                {isHedy && (
                  <div className="p-3.5 bg-[#FDFBF7] rounded-xl border border-[#E5DFCE]">
                    <label
                      htmlFor="field-notes-hidy"
                      className="block text-xs font-bold text-[#5A5A40] uppercase tracking-wider mb-1.5"
                    >
                      Notes Hedy <span className="text-[#8A8A7A] font-normal">(Private — Visible only to Hedy)</span>
                    </label>
                    <textarea
                      id="field-notes-hidy"
                      rows={2}
                      value={formData['notes hidy'] || ''}
                      onChange={(e) => handleChange('notes hidy', e.target.value)}
                      placeholder="Private notes (visible only to Hedy)"
                      className="w-full px-3.5 py-2 bg-white border border-[#E0E0D5] rounded-lg text-[#1A1A1A] placeholder:text-[#B0B0A0] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#5A5A40]"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 sm:px-8 py-5 border-t border-[#F0F0E5] bg-[#FBFBF8]">
            <button
              id="btn-cancel-shipment-form"
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-sm font-medium text-[#5A5A40] hover:bg-[#F0F0E5] rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              id="btn-submit-shipment-form"
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2 bg-[#5A5A40] hover:bg-[#4A4A35] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60 shadow-xs"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isEditMode ? 'Save Changes' : 'Create Shipment'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
