/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_USERS_API_URL?: string;
  readonly VITE_SHIPMENTS_API_URL?: string;
  readonly VITE_AUDIT_LOG_API_URL?: string;
  readonly VITE_BASE_PATH?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
