export const getApiBaseUrl = () => {
  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL

  if (configuredBaseUrl) {
    return configuredBaseUrl.replace(/\/+$/, '') // strip trailing slash
  }

  // In dev mode, default to local server; in production, this MUST be set via env var
  if (import.meta.env.DEV) {
    return 'http://localhost:3000'
  }

  console.warn('VITE_API_BASE_URL is not set. API calls may fail in production.')
  return ''
}
