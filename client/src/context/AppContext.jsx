import { useCallback, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { useAuth, useUser } from '@clerk/clerk-react'
import { useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { AppContext } from './appContext'
import { getApiBaseUrl } from '../lib/api'

const axiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
})

export const AppProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false)
  const [shows, setShows] = useState([])
  const [showSchedule, setShowSchedule] = useState([])
  const [trailers, setTrailers] = useState([])
  const [favoriteMovies, setFavoriteMovies] = useState([])

  const imageBaseUrl = import.meta.env.VITE_TMDB_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p/w500'

  const { user } = useUser()
  const { getToken } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const getAuthHeaders = useCallback(async () => {
    const token = await getToken()
    return token ? { Authorization: `Bearer ${token}` } : {}
  }, [getToken])

  const fetchIsAdmin = useCallback(async () => {
    if (!user) {
      setIsAdmin(false)
      return false
    }

    try {
      const { data } = await axiosInstance.get('/api/admin/is-admin', {
        headers: await getAuthHeaders(),
      })

      const allowed = Boolean(data.success && data.isAdmin)
      setIsAdmin(allowed)

      if (!allowed && location.pathname.startsWith('/admin')) {
        navigate('/')
        toast.error('You are not authorized to access admin dashboard')
      }

      return allowed
    } catch (error) {
      setIsAdmin(false)

      if (location.pathname.startsWith('/admin')) {
        navigate('/')
        toast.error('Unable to verify admin access right now')
      }

      console.error(error)
      return false
    }
  }, [getAuthHeaders, location.pathname, navigate, user])

  const fetchShows = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get('/api/show/all')

      if (data.success) {
        setShows(data.shows)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.error(error)
      toast.error('Unable to load shows')
    }
  }, [])

  const fetchShowSchedule = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get('/api/show/schedule')

      if (data.success) {
        setShowSchedule(data.shows)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.error(error)
      toast.error('Unable to load show schedule')
    }
  }, [])

  const fetchTrailers = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get('/api/show/trailers')

      if (data.success) {
        setTrailers(data.trailers)
      }
    } catch (error) {
      console.error(error)
    }
  }, [])

  const fetchFavoriteMovies = useCallback(async () => {
    if (!user) {
      setFavoriteMovies([])
      return
    }

    try {
      const { data } = await axiosInstance.get('/api/user/favorites', {
        headers: await getAuthHeaders(),
      })

      if (data.success) {
        setFavoriteMovies(data.movies)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.error(error)
      toast.error('Unable to load favorite movies')
    }
  }, [getAuthHeaders, user])

  const refreshMovieTrailers = useCallback(async () => {
    try {
      const { data } = await axiosInstance.post('/api/show/refresh-trailers', {}, {
        headers: await getAuthHeaders(),
      })

      if (data.success && data.updated > 0) {
        await Promise.all([fetchShows(), fetchShowSchedule(), fetchTrailers()])
      }
    } catch (error) {
      console.error(error)
    }
  }, [fetchShowSchedule, fetchShows, fetchTrailers, getAuthHeaders])

  useEffect(() => {
    fetchShows()
    fetchShowSchedule()
    fetchTrailers()
  }, [fetchShowSchedule, fetchShows, fetchTrailers])

  useEffect(() => {
    if (user) {
      fetchIsAdmin()
      fetchFavoriteMovies()
      return
    }

    setIsAdmin(false)
    setFavoriteMovies([])
  }, [fetchFavoriteMovies, fetchIsAdmin, user])

  useEffect(() => {
    if (!user || !isAdmin || shows.length === 0) {
      return
    }

    const hasTrailer = shows.some((movie) => movie.trailerUrl)

    if (!hasTrailer) {
      refreshMovieTrailers()
    }
  }, [isAdmin, refreshMovieTrailers, shows, user])

  const value = useMemo(() => ({
    axios: axiosInstance,
    favoriteMovies,
    fetchFavoriteMovies,
    fetchIsAdmin,
    fetchShowSchedule,
    fetchTrailers,
    refreshMovieTrailers,
    getAuthHeaders,
    getToken,
    imageBaseUrl,
    isAdmin,
    navigate,
    showSchedule,
    trailers,
    shows,
    user,
  }), [
    favoriteMovies,
    fetchFavoriteMovies,
    fetchIsAdmin,
    fetchShowSchedule,
    fetchTrailers,
    refreshMovieTrailers,
    getAuthHeaders,
    getToken,
    imageBaseUrl,
    isAdmin,
    navigate,
    showSchedule,
    trailers,
    shows,
    user,
  ])

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}
