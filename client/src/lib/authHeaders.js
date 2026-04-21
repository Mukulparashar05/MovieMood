export const getAuthHeaders = async ({ getToken, isAuthLoaded }) => {
  if (!isAuthLoaded) {
    return null
  }

  let token = await getToken()

  if (!token) {
    token = await getToken({ skipCache: true })
  }

  return token ? { Authorization: `Bearer ${token}` } : null
}
