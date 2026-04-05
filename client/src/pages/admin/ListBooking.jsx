import React, { useCallback, useEffect, useState } from 'react'
import Loading from '../../components/Loading';
import Title from '../../components/admin/Title';
import { dateFormat } from '../../lib/DateFormat';
import { useAppContext } from '../../context/appContext';
import toast from 'react-hot-toast';

const ListBooking = () => {
  const currency = import.meta.env.VITE_CURRENCY

  const { axios, getAuthHeaders, user } = useAppContext();

  const [bookings,setBookings] = useState([]);
  const[isLoading,setIsLoading] = useState(true);

  const getAllBookings = useCallback(async () => {
 try{
const { data } = await axios.get("/api/admin/all-bookings",{
  headers: await getAuthHeaders()
});
if (data.success) {
  setBookings(data.bookings)
} else {
  toast.error(data.message)
}
 }catch(error){
   console.error(error);
   toast.error('Unable to load bookings')
 } finally {
  setIsLoading(false)
 }
  }, [axios, getAuthHeaders]);

useEffect(()=>{
  if(user){
getAllBookings();}
},[getAllBookings, user]);

  return !isLoading ?(
    <>
     <Title text1="List" text2="Bookings" />
     <div className='max-w-4xl mt-6 overflow-x-auto'>

<table className='w-full border-collapse rounded-md overflow-hidden text-nowrap'>
  <thead>
    <tr className='bg-primary/20 text-left text-white'>
      <th className='p-2 font-medium pl-5 '>User Name</th>
      <th className='p-2 font-medium '>Movie Name</th>
      <th className='p-2 font-medium '>Show Time</th>
      <th className='p-2 font-medium '>Seats</th>
      <th className='p-2 font-medium '>Amount</th>
    </tr>
  </thead>
  <tbody className='text-sm font-light'> 
{bookings.map((item,index) =>(
  <tr key= {index} className='border-b border-primary/20 bg-primary/5 even:bg-primary/10'>
    <td className='p-2 min-w-45 pl-5'>{item.user?.name || 'Unknown User'}</td>
    <td className='p-2'>{item.show?.movie?.title || 'Show unavailable'}</td>
    <td className='p-2'>{item.show?.showDateTime ? dateFormat(item.show.showDateTime) : 'Time unavailable'}</td>
    <td className='p-2'>{Array.isArray(item.bookedSeats) ? item.bookedSeats.join(", ") : 'N/A'}</td>
    <td className='p-2'>{currency} {item.amount ?? 0}</td>
  </tr>
))}
  </tbody>
</table>

     </div>
    </>
  ) : <Loading />
}

export default ListBooking
