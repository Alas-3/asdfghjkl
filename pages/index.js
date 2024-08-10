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

  const handleAnimeClick = async (anime) => {
    const urlSlug = createAnimeUrlSlug(anime.title);
    setLoading(true);
    await router.push(`/anime/${urlSlug}`);
    setLoading(false);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
      <div className="sticky top-0 z-20 w-full"> {/* Ensure it's sticky and full width */}
        <div className="flex justify-between items-center pt-4 lg:pt-5">
          <HamburgerMenu menuOpen={menuOpen} setMenuOpen={setMenuOpen}/>
          <div className="relative flex items-center ml-2 overflow-x-hidden"> {/* Adjusted margin for alignment */}
            <div
              className={`flex items-center transition-all duration-300 ease-in-out transform ${
                searchVisible ? 'translate-x-0 opacity-100 w-64 lg:w-72 lg:pb-1' : 'translate-x-0 opacity-100 w-7.5'
              }`}
            >
              <button
                onClick={() => setSearchVisible(!searchVisible)}
                className="flex items-center justify-center lg:p-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-7 h-7"
                  style={{
                    filter: 'drop-shadow(0 3px 3px rgba(0, 0, 0, 100))', // Darker shadow with full opacity
                  }}
                  
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                  />
                </svg>
              </button>
              <form
                onSubmit={handleSearch}
                className={`transition-all duration-300 ease-in-out ${
                  searchVisible ? 'w-full ml-1 opacity-100' : 'w-0 opacity-0'
                }`}
              >
                <input
                  type="text"
                  placeholder="Search Animes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input input-bordered transition-all duration-300 ease-in-out" // Keep the transition for input
                  style={{
                    width: searchVisible ? '100%' : '0',
                    opacity: searchVisible ? 1 : 0,
                    transition: 'width 0.3s ease-in-out, opacity 0.3s ease-in-out',
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
