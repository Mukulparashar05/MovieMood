import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Loading from '../../components/Loading';
import Title from '../../components/admin/Title';
import { CheckIcon, StarIcon ,DeleteIcon, CalendarDaysIcon, Clock3Icon, TicketIcon } from 'lucide-react';
import { KConverter } from '../../lib/KConverter';
import { useAppContext } from '../../context/appContext';
import toast from 'react-hot-toast';

const AddShows = () => {

const { axios, getAuthHeaders, imageBaseUrl, user } = useAppContext();

  const currency = import.meta.env.VITE_CURRENCY

  const [nowPlayingMovies, setNowPlayingMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [dateTimeSelection, setDateTimeSelection] = useState({});
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [showPrice, setShowPrice] = useState("");

const [addingShow,setAddingShow] = useState(false)

  const minDate = new Date().toISOString().split('T')[0]
  const selectedMovieData = useMemo(
    () => nowPlayingMovies.find((movie) => movie.id === selectedMovie) || null,
    [nowPlayingMovies, selectedMovie],
  )
 

  const fetchNowPlayingMovies = useCallback(async () => {
 try{
const { data} =await axios.get('/api/show/now-playing',{
  headers: await getAuthHeaders()}) 
  if(data.success){
  setNowPlayingMovies(data.movies)
} else {
  toast.error(data.message)
}
 }catch(error){
  console.error('Error fetching movies:',error)
  toast.error('Unable to load now playing movies')
 }
  }, [axios, getAuthHeaders]);

const handleDateTimeAdd = () =>{
  if(!selectedDate){
    toast.error('Please select a date')
    return;
  }

  if(!selectedTime){
    toast.error('Please select a time')
    return;
  }

  const selectedDateTime = new Date(`${selectedDate}T${selectedTime}`);

  if (Number.isNaN(selectedDateTime.getTime()) || selectedDateTime <= new Date()) {
    toast.error('Please choose a future date and time')
    return;
  }

setDateTimeSelection((prev)=>{
  const times = prev[selectedDate] || [];
  if(!times.includes(selectedTime)){
    return { ...prev,[selectedDate]: [...times, selectedTime].sort() };
  }

  toast('This show time is already added')
  return prev;
});

setSelectedTime("");
};

const handleRemoveTime = (date,time) =>{
  setDateTimeSelection((prev) => {
    const filteredTimes = prev[date].filter((t)=>t !==time);
    if(filteredTimes.length === 0){
      const { [date]: _, ...rest} =prev;
      return rest;
    }
    return {
      ...prev,
      [date]:filteredTimes,
    };
  });
};
const handleSubmit =async ()=>{
  try{
    if(!selectedMovie){
      toast.error('Please select a movie first');
      return;
    }

    if(!showPrice || Number(showPrice) <= 0){
      toast.error('Please enter a valid show price');
      return;
    }

    if(Object.keys(dateTimeSelection).length===0){
      toast.error('Please add at least one date and time slot');
      return;
    }

    setAddingShow(true)

    const showsInput = Object.entries(dateTimeSelection).map(([date,time])=>({date,time}));
    const payload = {
      movieId:selectedMovie,
      showsInput,
      showPrice:Number(showPrice)
    }
    const {data}= await axios.post('/api/show/add',payload,{headers: await getAuthHeaders()})

    if(data.success){
      toast.success(data.message)
      setSelectedMovie(null)
      setDateTimeSelection({})
      setSelectedDate("")
      setSelectedTime("")
      setShowPrice("")
    }else{
      toast.error(data.message)
    }
  }catch(error){
console.error("Submission error:",error);
toast.error('An error Occured. Please try again.')
  }
  setAddingShow(false)
}


  useEffect(() => {
    if(user){
    fetchNowPlayingMovies();}
  }, [fetchNowPlayingMovies, user]);
  return nowPlayingMovies.length > 0 ? (
    <>
      <Title text1="Add" text2="Shows" />
      <p className='mt-10 text-lg font-medium'>Now Playing Movies</p>
      <div className='overflow-x-auto pb-4'>
        <div className='group flex flex-wrap gap-4 mt-4 w-max'>
          {nowPlayingMovies.map((movie) => (
            <div key={movie.id} className={`relative max-w-40 cursor-pointer transition duration-300 hover:-translate-y-1 ${selectedMovie && selectedMovie !== movie.id ? 'opacity-45' : ''}`} onClick={() => setSelectedMovie(movie.id)}>
              <div>
                <img src={imageBaseUrl + movie.poster_path} alt={movie.title} className={`w-full object-cover ${selectedMovie === movie.id ? 'brightness-100' : 'brightness-90'}`} />
                <div className='text-sm flex items-center justify-between p-2 bg-black/70 w-full absolute bottom-10  left-0'>

                  <p className='flex items-center gap-1 text-gray-400'>
                    <StarIcon className='w-4 h-4 text-primary fill-primary' />
                    {movie.vote_average.toFixed(1)}
                  </p>
                  <p className='text-gray-300'> {KConverter(movie.vote_count)} Votes</p>
                  
                </div>
              </div>
              {selectedMovie === movie.id && (
                <div className='absolute top-2 right-2 flex items-center justify-center bg-primary h-6 w-6 rounded'>
                  <CheckIcon className='w-4 h-4 text-white' strokeWidth={2.5} />
                 
                </div>

                
              )}
               <p className='font-medium truncate'>{movie.title}</p>
              <p className='text-gray-400 text-sm'>{movie.release_date}</p>
            </div>
            
          ))}

        </div>
      </div>
{selectedMovieData && (
  <div className='mt-5 max-w-xl rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 flex items-center gap-3'>
    <TicketIcon className='w-5 h-5 text-primary shrink-0' />
    <div>
      <p className='text-sm text-gray-300'>Selected movie</p>
      <p className='font-medium'>{selectedMovieData.title}</p>
    </div>
  </div>
)}
{/*Show Price Input*/}
<div className="mt-8">
<label className="block text-sm font-medium mb-2">Show Price</label>
<div className='inline-flex items-center gap-2 border border-gray-600 px-3 py-2 rounded-md'>
  <p className='text-gray-400 text-sm'>{currency}</p>
  <input min={0} type="number" value={showPrice} onChange={(e)=>setShowPrice(e.target.value)} placeholder="Enter show price" className='outline-none' />
</div>
</div>

{/* Date & Time Selection */}
<div className='mt-6 max-w-xl'>
<label className='block text-sm font-medium mb-2'>Select Date and Time</label>
<div className='grid gap-3 border border-gray-700 bg-black/30 px-3 py-3 rounded-xl sm:grid-cols-[1fr_1fr_auto]'>
  <div className='flex items-center gap-3 flex-1 rounded-lg border border-gray-700 bg-black/40 px-3 py-2'>
    <CalendarDaysIcon className='w-4 h-4 text-gray-400 shrink-0' />
    <input
      type="date"
      value={selectedDate}
      min={minDate}
      onChange={(e) => setSelectedDate(e.target.value)}
      className='admin-datetime-input w-full min-w-0 bg-transparent text-sm text-white outline-none'
    />
  </div>

  <div className='flex items-center gap-3 flex-1 rounded-lg border border-gray-700 bg-black/40 px-3 py-2'>
    <Clock3Icon className='w-4 h-4 text-gray-400 shrink-0' />
    <input
      type="time"
      value={selectedTime}
      onChange={(e) => setSelectedTime(e.target.value)}
      className='admin-datetime-input w-full min-w-0 bg-transparent text-sm text-white outline-none'
    />
  </div>

  <button onClick={handleDateTimeAdd} className='bg-primary/80 text-white px-4 py-2.5 text-sm rounded-lg hover:bg-primary cursor-pointer whitespace-nowrap'>Add Slot</button>
</div>
</div>
{/* display selected Times*/}
{Object.keys(dateTimeSelection).length > 0 && (
  <div className='mt-6'>
    <h2 className='mb-2'> Selected Date-Time</h2>
    <ul className='space-y-3'>
      {Object.entries(dateTimeSelection).map(([date,times])=>(
        <li key={date}>
          <div className='font-medium'>{new Date(`${date}T00:00`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
          <div className='flex flex-wrap gap-2 mt-1 text-sm'>{times.map((time) => (<div key={time} className='border border-primary px-3 py-1.5 flex items-center rounded-full bg-primary/10'>
            <span>{new Date(`${date}T${time}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
            <DeleteIcon onClick={()=>handleRemoveTime(date,time)} width={15} className="ml-2 text-red-500 hover:text-red-700 cursor-pointer"/>
          </div>
          ))}
          </div>
           </li>
      ))}

    </ul>
  </div>
)}
<button onClick={handleSubmit} disabled={addingShow} className='bg-primary text-white px-8 py-2 mt-6 rounded hover:bg-primary/90 transition-all cursor-pointer'>
Add Show</button>
    </>
  ) : <Loading />
}

export default AddShows
