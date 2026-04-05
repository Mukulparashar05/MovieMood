import React, { useCallback, useEffect, useState } from 'react'
import Loading from '../components/Loading'
import BlurCircle from '../components/BlurCircle'
import timeFormat from '../lib/timeFormat'
import { dateFormat } from '../lib/DateFormat'
import { useAppContext } from '../context/appContext'
import toast from 'react-hot-toast'

const MyBookings = () => {
  const currency = import.meta.env.VITE_CURRENCY

const { axios, getAuthHeaders, imageBaseUrl, user } = useAppContext()

  const [bookings, setbookings] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const getMyBooking = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/user/bookings', {
        headers: await getAuthHeaders(),
      })

      if (data.success) {
        setbookings(data.bookings)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.error(error)
      toast.error('Unable to load your bookings')
    } finally {
      setIsLoading(false)
    }
  }, [axios, getAuthHeaders])

  useEffect(() => {
    if (user) {
      getMyBooking()
      return
    }

    setbookings([])
    setIsLoading(false)
  }, [getMyBooking, user])
  return !isLoading ? (
    <div className='relative px-6 md:px-16 lg:px-40 pt-30 md:pt-40 min-h-[80vh]'>
      <BlurCircle top="100px" left="100px" />
      <div>
        <BlurCircle bottom='0px' left="600px" />
      </div>
      <h1 className='text-lg font-semibold mb-4'>My Bookings</h1>


      {bookings.map((item) => (
        <div key={item._id} className='flex flex-col md:flex-row justify-between bg-primary/8 border border-primary/20 rounded-lg mt-4 p-2 max-w-3xl'>
          <div className='flex flex-col md:flex-row'>
            <img src={imageBaseUrl + item.show.movie.poster_path} alt={item.show.movie.title} className='md:max-w-45 aspect-video h-auto object-cover object-bottom rounded' />
            <div className='flex flex-col p-4'>
              <p className='text-lg font-semibold'>{item.show.movie.title}</p>
              <p className='text-gray-400 text-sm'>{timeFormat(item.show.movie.runtime)}</p>
              <p className='text-gray-400 text-sm mt-auto'>{dateFormat(item.show.showDateTime)}</p>
            </div>
          </div>
          <div className='flex flex-col md:items-end md:text-right justify-between p-4'>
            <div className='flex items-center gap-4'>
              <p className='text-2xl font-semibold mb-3'>{currency}{item.amount}</p>
              {!item.isPaid && item.paymentLink && <a href={item.paymentLink} className='bg-primary px-4 py-1.5 mb-3 text-sm rounded-full font-medium cursor-pointer'>Pay Now</a>}
            </div>
            <div className='text-sm'>
              <p><span className='text-gray-400'>Total Ticket:</span>{item.bookedSeats.length}</p>
              <p><span className='text-gray-400'>Seat Number:</span>{item.bookedSeats.join(", ")}</p>
            </div>
          </div>
        </div>
      ))}

    </div>
  ) : <Loading />

}

export default MyBookings
