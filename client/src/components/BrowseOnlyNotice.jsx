import React from 'react'
import { Link } from 'react-router-dom'

const BrowseOnlyNotice = ({ title, description }) => (
  <div className='min-h-[80vh] px-6 md:px-16 lg:px-40 pt-32 md:pt-40 flex items-center justify-center'>
    <div className='max-w-xl w-full rounded-2xl border border-white/10 bg-black/40 backdrop-blur px-8 py-10 text-center'>
      <p className='text-primary text-sm font-medium uppercase tracking-[0.2em]'>Public Demo</p>
      <h1 className='mt-4 text-3xl md:text-4xl font-semibold text-balance'>{title}</h1>
      <p className='mt-4 text-gray-300 leading-7'>{description}</p>
      <div className='mt-8 flex justify-center'>
        <Link
          to='/movies'
          className='px-8 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-full font-medium'
        >
          Browse Movies
        </Link>
      </div>
    </div>
  </div>
)

export default BrowseOnlyNotice
