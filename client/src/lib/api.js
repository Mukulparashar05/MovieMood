export const getApiBaseUrl = () => {
  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL

  if (configuredBaseUrl) {
    return configuredBaseUrl
  }

  return import.meta.env.DEV ? 'http://localhost:3000' : window.location.origin
}
