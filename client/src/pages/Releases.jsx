import React, { useMemo } from 'react'
import BlurCircle from '../components/BlurCircle'
import MovieCard from '../components/MovieCard'
import { useAppContext } from '../context/appContext'

const Releases = () => {
  const { shows } = useAppContext()

  const sortedMovies = useMemo(() => (
    [...shows].sort((a, b) => new Date(b.release_date) - new Date(a.release_date))
  ), [shows])

  const latestRelease = sortedMovies[0]

  return (
    <div className='relative my-32 md:px-16 lg:px-40 xl:px-44 overflow-hidden min-h-[80vh]'>
      <BlurCircle top="130px" left="0px" />
      <BlurCircle bottom="0px" right="40px" />
      <div className='max-w-4xl'>
        <p className='text-primary text-sm font-semibold uppercase tracking-[0.3em]'>Latest Releases</p>
        <h1 className='text-4xl md:text-5xl font-semibold mt-3'>Fresh titles ready for booking</h1>
        <p className='text-gray-400 mt-4'>
          Browse the newest films in MovieMood, sorted by release date so the latest arrivals surface first.
        </p>
      </div>

      {latestRelease && (
        <div className='mt-10 rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start'>
          <div className='flex-1'>
            <p className='text-sm text-primary font-medium'>Newest in the lineup</p>
            <h2 className='text-3xl font-semibold mt-2'>{latestRelease.title}</h2>
            <p className='text-gray-400 mt-3 max-w-2xl'>{latestRelease.overview}</p>
            <p className='mt-4 text-sm text-gray-300'>
              Release date: {new Date(latestRelease.release_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
          </div>
          <MovieCard movie={latestRelease} />
        </div>
      )}

      <div className='mt-12 flex flex-wrap max-sm:justify-center gap-8'>
        {sortedMovies.map((movie) => (
          <MovieCard key={movie._id} movie={movie} />
        ))}
      </div>
    </div>
  )
}

export default Releases
