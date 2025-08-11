import React from 'react'
import { ArrowRight } from 'lucide-react'
import { useNavigate} from 'react-router-dom'
import BlurCircle from './BlurCircle'
const FeaturedSection = () => {
  const navigate = useNavigate()
  return (
    <div className='px-6 md:px-16 lg:px-24 xl:px-44 overflow-hidden'>
      <div className='relative flex items-center justify-between pt-20 pb-10'>
        <BlurCircle top='0' right='-80px'/>
<p className='text-gray-300 font-medium text-lg'>Now Showing</p>
<button onClick={()=> navigate('/movies') } className='group flex items-center gap-2 text-sm text-gray-300 ' > View All<ArrowRight className=" group-hover:translate-x-0.5 transition w-4.5 h-4.5"/></button>
      </div>

      <div></div>

      <div></div>
    </div>
  )
}

export default FeaturedSection
