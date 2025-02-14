/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PROJECT_NAME: string
  readonly VITE_BRAND_WIDGET_URL: string
  readonly VITE_PRODUCT_WIDGET_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}