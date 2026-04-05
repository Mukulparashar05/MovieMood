import React, { useMemo } from 'react'
import BlurCircle from '../components/BlurCircle'
import { useAppContext } from '../context/appContext'
import { groupShowsByTheater } from '../lib/theaters'
import isoTimeFormat from '../lib/isoTimeFormat'
import { dateFormat } from '../lib/DateFormat'
import { MapPinIcon, MonitorPlayIcon } from 'lucide-react'

const Theaters = () => {
  const { imageBaseUrl, showSchedule } = useAppContext()

  const theaters = useMemo(() => groupShowsByTheater(showSchedule), [showSchedule])

  return (
    <div className='relative my-32 md:px-16 lg:px-40 xl:px-44 overflow-hidden min-h-[80vh]'>
      <BlurCircle top="120px" left="0px" />
      <BlurCircle bottom="20px" right="40px" />
      <div className='max-w-4xl'>
        <p className='text-primary text-sm font-semibold uppercase tracking-[0.3em]'>Theaters</p>
        <h1 className='text-4xl md:text-5xl font-semibold mt-3'>Find your best screen and showtime</h1>
        <p className='text-gray-400 mt-4'>
          Browse MovieMood partner theaters and see what is playing at each venue right now.
        </p>
      </div>

      <div className='mt-12 grid gap-8'>
        {theaters.map((theater) => (
          <section key={theater.name} className='rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8'>
            <div className='flex flex-col md:flex-row md:items-start md:justify-between gap-4'>
              <div>
                <h2 className='text-2xl font-semibold'>{theater.name}</h2>
                <p className='mt-2 text-sm text-gray-400 flex items-center gap-2'>
                  <MapPinIcon className='w-4 h-4 text-primary' />
                  {theater.location}
                </p>
              </div>
              <div className='flex flex-wrap gap-2'>
                {theater.amenities.map((amenity) => (
                  <span key={amenity} className='rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary'>
                    {amenity}
                  </span>
                ))}
              </div>
            </div>

            <div className='mt-8 grid gap-4'>
              {theater.shows.map((show) => (
                <div key={show._id} className='rounded-2xl border border-white/10 bg-black/30 p-4 flex flex-col md:flex-row gap-4 md:items-center md:justify-between'>
                  <div className='flex gap-4'>
                    <img src={imageBaseUrl + show.movie.poster_path} alt={show.movie.title} className='w-20 h-24 rounded-xl object-cover' />
                    <div>
                      <p className='text-lg font-semibold'>{show.movie.title}</p>
                      <p className='text-sm text-gray-400 mt-1'>{dateFormat(show.showDateTime)}</p>
                      <p className='text-sm text-gray-400 mt-1 flex items-center gap-2'>
                        <MonitorPlayIcon className='w-4 h-4 text-primary' />
                        {theater.screen}
                      </p>
                    </div>
                  </div>

                  <div className='flex flex-wrap items-center gap-3'>
                    <span className='rounded-full bg-primary/10 px-4 py-2 text-sm text-primary font-medium'>
                      {isoTimeFormat(show.showDateTime)}
                    </span>
                    <a href={`/movies/${show.movie._id}`} className='rounded-full border border-white/15 px-4 py-2 text-sm hover:bg-white/10 transition'>
                      View movie
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

export default Theaters
