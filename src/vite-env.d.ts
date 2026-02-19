/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APPWRITE_ENDPOINT: string;
  readonly VITE_APPWRITE_PROJECT_ID: string;
  readonly VITE_APPWRITE_DATABASE_ID: string;
  readonly VITE_APPWRITE_FEEDBACK_COLLECTION_ID?: string;
    readonly VITE_JOB_VIEWS_ENDPOINT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
