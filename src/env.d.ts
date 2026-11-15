/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the FastAPI inspection service, e.g. https://inspect.example.com */
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
