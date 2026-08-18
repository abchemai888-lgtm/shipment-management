export type UserRole = 'admin' | 'user' | 'editor';

export interface AuthUser {
  user_id: string;
  name: string;
  role: UserRole;
  active?: boolean;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  user?: AuthUser;
  message?: string;
  error?: string;
}

export interface Shipment {
  'Products'?: string;
  'Acid Number'?: string;
  'Invoice Number'?: string;
  'Total Price'?: string | number;
  'Notes'?: string;
  'Shipping Company'?: string;
  'Departure Date'?: string;
  'bill of lading'?: string;
  'bank document'?: string;
  'Expected Arrival'?: string;
  'Actual Arrival'?: string;
  'Brokers'?: string;
  'shipment type'?: string;
  'importing co.'?: string;
  'تجهيز الورق'?: string;
  'سحب العينات'?: string;
  'المدفوعة'?: string;
  'استلام المخزن'?: string;
  'نتيجة المعمل المركزي'?: string;
  'مطابقة'?: string;
  'notes hidy'?: string;
  'Shipment ID'?: string;
}

export interface AdminUser {
  user_id: string;
  name: string;
  role: UserRole;
  active: boolean;
}

export interface AuditLogEntry {
  'Log ID'?: string;
  'Timestamp'?: string;
  'User ID'?: string;
  'User Name'?: string;
  'Role'?: string;
  'Action'?: string;
  'Entity'?: string;
  'Entity ID'?: string;
  'Field'?: string;
  'Old Value'?: string;
  'New Value'?: string;
  'Description'?: string;
  [key: string]: any;
}

export interface ApiResponse<T = any> {
  success?: boolean;
  message?: string;
  error?: string;
  data?: T;
  shipments?: T;
  users?: T;
  logs?: T;
  records?: T;
  token?: string;
  user?: AuthUser;
  [key: string]: any;
}
