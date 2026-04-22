import React from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Movies from './pages/Movies'
import MovieDetails from './pages/MovieDetails'
import SeatLayout from './pages/SeatLayout'
import MyBookings from './pages/MyBookings'
import Favorite from './pages/Favorite'
import Theaters from './pages/Theaters'
import Releases from './pages/Releases'
import { Toaster } from 'react-hot-toast'
import Dashboard from './pages/admin/Dashboard'
import AddShows from './pages/admin/AddShows'
import ListShows from './pages/admin/ListShows'
import ListBooking from './pages/admin/ListBooking'
import  Layout  from './pages/admin/Layout'
import { useAppContext } from './context/appContext'
import { SignIn } from '@clerk/clerk-react'
import Loading from './components/Loading'
import BrowseOnlyNotice from './components/BrowseOnlyNotice'

const App = () => {
  const isAdminRoute = useLocation().pathname.startsWith('/admin');
const { authFeaturesEnabled, user } =useAppContext()
  return (
    <>
      <Toaster />
      {!isAdminRoute && <Navbar />}
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/movies' element={<Movies />} />
        <Route path='/theaters' element={<Theaters />} />
        <Route path='/releases' element={<Releases />} />
        <Route path='/movies/:id' element={<MovieDetails />} />
        <Route path='/movies/:id/:date' element={<SeatLayout />} />
        <Route
          path='/my-bookings'
          element={authFeaturesEnabled ? <MyBookings /> : (
            <BrowseOnlyNotice
              title='Bookings Are Available Locally'
              description='This public demo is set up for browsing movies and showtimes only. Signed-in booking history is available in local development.'
            />
          )}
        />
        <Route path='/loading/:nextUrl' element={<Loading />} />
        <Route
          path='/favorite'
          element={authFeaturesEnabled ? <Favorite /> : (
            <BrowseOnlyNotice
              title='Favorites Are Disabled On This Demo'
              description='The hosted demo focuses on browsing. Favorites are available in local development where signed-in features are fully enabled.'
            />
          )}
        />


        <Route path='/admin/*' element = {!authFeaturesEnabled ? (
          <BrowseOnlyNotice
            title='Admin Tools Run Locally'
            description='The public demo is browse-only. Admin management is intentionally disabled here and remains available in your local environment.'
          />
        ) : user?<Layout />:(
          <div className='min-h-screen flex justify-center items-center'>
            <SignIn fallbackRedirectUrl={'/admin'}/>
          </div>
        )}>
        <Route index element={<Dashboard/>} />
        <Route path='add-shows' element={<AddShows/>} />
        <Route path='list-shows' element={<ListShows/>} />
        <Route path='list-bookings' element={<ListBooking/>} />

        </Route>
      </Routes>
      {!isAdminRoute && <Footer />}
    </>
  )
}

export default App
