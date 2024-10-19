'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/router'
import withAuth from '../lib/withAuth'

// Function to convert title to URL slug
const createAnimeUrlSlug = (title) => {
  return title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/(\d)\.(\d)/g, '$1-$2')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// Function to truncate title
const truncateTitle = (title, maxLength = 50) => {
  if (title.length <= maxLength) {
    return title
  }
  return title.slice(0, maxLength) + '...'
}

function Profile() {
  const [favorites, setFavorites] = useState([])
  const router = useRouter()

  useEffect(() => {
    const fetchFavorites = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.error('User not authenticated')
        return
      }

      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id)

      if (error) {
        console.error('Error fetching favorites:', error)
      } else {
        setFavorites(data)
      }
    }

    fetchFavorites()
  }, [])

  const handleAnimeClick = (anime) => {
    const slug = createAnimeUrlSlug(anime.title)
    router.push(`/anime/${slug}`)
  }

  const handleResumeClick = async (anime) => {
    const slug = createAnimeUrlSlug(anime.title)
    router.push(`/anime/${slug}`)

    setTimeout(() => {
      const currentEpisodeUrl = `/anime/${slug}/episode-${anime.current_episode}`
      router.push(currentEpisodeUrl)
    }, 500)
  }

  const handleHomeClick = () => {
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text">
            Your Watchlist
          </h1>
          <button
            onClick={handleHomeClick}
            className="text-gray-300 hover:text-white transition-colors duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {favorites.map((anime) => (
            <div
              key={anime.id}
              className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 cursor-pointer"
              onClick={() => handleAnimeClick(anime)}
            >
              <div className="relative pb-[150%]">
                <img
                  src={anime.imageUrl}
                  alt={`Cover of ${anime.title}`}
                  className="absolute top-0 left-0 w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 to-transparent p-4">
                  <h2 className="font-semibold text-lg text-white mb-1">
                    {truncateTitle(anime.title, 20)}
                  </h2>
                  {anime.current_episode !== null && (
                    <p className="text-sm text-gray-300">Episode {anime.current_episode}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default withAuth(Profile)