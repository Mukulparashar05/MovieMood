import React, { useMemo } from 'react'
import { ArrowRight, CalendarIcon, ClockIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/appContext'
import timeFormat from '../lib/timeFormat'

function HeroSection() {
    const navigate =useNavigate()
    const { imageBaseUrl, shows } = useAppContext()
    const featuredMovie = useMemo(() => shows[0], [shows])

    if (!featuredMovie) {
      return (
        <div className='flex flex-col items-start justify-center gap-4 px-6 md:px-16 lg:px-36 h-screen'>
          <h1 className='text-5xl md:text-7xl font-semibold max-w-3xl'>Movie nights feel better here.</h1>
          <p className='max-w-xl text-gray-300'>Add shows from the admin panel to start filling the home page with live movie data.</p>
          <button onClick={()=>navigate('/movies')} className='flex items-center gap-1 px-6 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer'>
            Explore Movies
            <ArrowRight />
          </button>
        </div>
      )
    }

  return (
    <div
      className='relative flex flex-col items-start justify-center gap-4 px-6 md:px-16 lg:px-36 bg-cover bg-center h-screen overflow-hidden'
      style={{ backgroundImage: `linear-gradient(90deg, rgba(9,9,9,0.95) 0%, rgba(9,9,9,0.78) 45%, rgba(9,9,9,0.35) 100%), url(${imageBaseUrl + featuredMovie.backdrop_path})` }}
    >
      <p className='inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-sm font-medium text-primary mt-20'>Featured Tonight</p>
      <h1 className='text-5xl md:text-[70px] md:leading-18 font-semibold max-w-110'>{featuredMovie.title}</h1>

      <div className='flex items-center gap-4 text-gray-300'>
<span>{featuredMovie.genres.slice(0, 3).map((genre) => genre.name).join(' | ')}</span>
<div className='flex items-center gap-1'>
    <CalendarIcon className='w-4.5 h-4.5'/>{new Date(featuredMovie.release_date).getFullYear()}
</div>
<div className='flex items-center gap-1'>
    <ClockIcon className='w-4.5 h-4.5'/> {timeFormat(featuredMovie.runtime)}
</div>
      </div>
      <p className='max-w-md text-gray-300'>{featuredMovie.overview}</p>
      <div className='flex flex-wrap gap-3'>
        <button onClick={()=>navigate(`/movies/${featuredMovie._id}`)} className='flex items-center gap-1 px-6 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer'>
          Book Tickets
          <ArrowRight />
        </button>
        <button onClick={()=>navigate('/releases')} className='flex items-center gap-1 px-6 py-3 text-sm border border-white/20 hover:bg-white/10 transition rounded-full font-medium cursor-pointer'>
          New Releases
        </button>
      </div>
    </div>
  )
}

export default HeroSection
