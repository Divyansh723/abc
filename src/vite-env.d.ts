/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_APP_NAME: string
  readonly VITE_AI_SERVICE_ENABLED: string
  readonly VITE_AI_FALLBACK_ENABLED: string
  readonly VITE_COMMUNITY_FEATURES_ENABLED: string
  readonly VITE_ANALYTICS_ENABLED: string
  readonly VITE_NOTIFICATIONS_ENABLED: string
  readonly VITE_DEBUG_MODE: string
  readonly VITE_MOCK_API: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}