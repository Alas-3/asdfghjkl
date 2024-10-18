// pages/index.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { scrapePopularAnimes } from '../lib/scrape';
import { supabase } from '../lib/supabase';
import withAuth from '../lib/withAuth';
import HamburgerMenu from '../components/Hamburger';
import AnimeCard, { createAnimeUrlSlug, truncateTitle } from '../components/AnimeCard';
import SkeletonLoader from '../components/SkeletonLoader';
import AnimeCarousel from '../components/AnimeCarousel';
import NewAnimeCarousel from '../components/NewAnimeCarousel';
import HeroBanner from '../components/HeroBanner'; // Import the HeroBanner
import AnimeSchedule from '../components/AnimeSchedule';
import { Search } from 'lucide-react'

function Home() {
  const [animes, setAnimes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchAnimes() {
      setLoading(true);
      const scrapedAnimes = await scrapePopularAnimes();
      setAnimes(scrapedAnimes);
      setLoading(false);
    }
    fetchAnimes();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  const handleProfile = () => {
    router.push('/profile');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    router.push(`/search?query=${encodeURIComponent(searchTerm)}`);
  };

  const toggleSearch = () => {
    setSearchVisible(!searchVisible)
    if (searchVisible) {
      setSearchTerm('')
    }
  }

  const handleAnimeClick = async (anime) => {
    const urlSlug = createAnimeUrlSlug(anime.title);
    setLoading(true);
    await router.push(`/anime/${urlSlug}`);
    setLoading(false);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
      <div className="sticky top-0 z-20 w-full">
        <div className="flex justify-between items-center mt-5 md:mt-0 lg:py-5">
          <HamburgerMenu menuOpen={menuOpen} setMenuOpen={setMenuOpen}/>
          <div className="relative flex items-center ml-2 overflow-x-hidden">
            <div
              className={`flex items-center transition-all duration-300 ease-in-out ${
                searchVisible ? 'w-64 lg:w-72' : 'w-10'
              }`}
            >
              <button
                onClick={toggleSearch}
                className="flex items-center justify-center p-2 rounded-full hover:bg-gray-800 transition-colors duration-200"
                aria-label={searchVisible ? "Close search" : "Open search"}
              >
                <Search size={28} className="text-gray-300" />
              </button>
              <form
                onSubmit={handleSearch}
                className={`transition-all duration-300 ease-in-out ${
                  searchVisible ? 'w-full ml-2 opacity-100' : 'w-0 opacity-0'
                }`}
              >
                <input
                  type="text"
                  placeholder="Search Animes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full py-2 px-4 bg-gray-800 text-gray-100 rounded-full placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ease-in-out"
                  style={{
                    width: searchVisible ? '100%' : '0',
                    opacity: searchVisible ? 1 : 0,
                  }}
                />
              </form>
            </div>
          </div>
        </div>
      </div>

      <HeroBanner animes={animes} /> {/* Add the HeroBanner component here */}

      <div className="mt-5"> {/* Increased margin to move down further */}
        <AnimeCarousel /> {/* Add the AnimeCarousel component here */}
        <NewAnimeCarousel /> {/* Add the NewAnimeCarousel component here */}
        <AnimeSchedule />
      </div>

      <div className="flex justify-between items-center mb-6 mt-16">
        <h1 className="text-4xl">Recent Releases</h1>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {Array.from({ length: 10 }).map((_, index) => (
            <SkeletonLoader key={index} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {animes.map((anime) => (
            <AnimeCard key={anime.title} anime={anime} handleAnimeClick={handleAnimeClick} />
          ))}
        </div>
      )}
    </div>
  );
}

export default withAuth(Home);
