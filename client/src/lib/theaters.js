const THEATERS = [
  {
    name: 'MovieMood Downtown',
    location: 'MG Road, Bengaluru',
    amenities: ['Dolby Atmos', 'Recliner Seats', 'Food Court'],
  },
  {
    name: 'MovieMood Grand',
    location: 'Indiranagar, Bengaluru',
    amenities: ['4K Laser', 'Family Lounge', 'Premium Snacks'],
  },
  {
    name: 'MovieMood Skyline',
    location: 'Whitefield, Bengaluru',
    amenities: ['IMAX-style Screen', 'Parking', 'Late Night Shows'],
  },
]

const SCREENS = ['Screen 1', 'Screen 2', 'Screen 3', 'Screen 4']

const hashString = (value = '') => {
  return value.split('').reduce((total, char) => total + char.charCodeAt(0), 0)
}

export const getTheaterForShow = (show) => {
  const hash = hashString(show?._id || show?.movie?._id || '')
  const theater = THEATERS[hash % THEATERS.length]
  const screen = SCREENS[hash % SCREENS.length]

  return {
    ...theater,
    screen,
  }
}

export const groupShowsByTheater = (shows = []) => {
  const grouped = new Map()

  shows.forEach((show) => {
    const theater = getTheaterForShow(show)
    const key = theater.name
    const existing = grouped.get(key)

    if (existing) {
      existing.shows.push(show)
      return
    }

    grouped.set(key, {
      ...theater,
      shows: [show],
    })
  })

  return Array.from(grouped.values())
}
