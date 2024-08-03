// pages/index.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { scrapePopularAnimes } from '../lib/scrape';
import { supabase } from '../lib/supabase';
import withAuth from '../lib/withAuth';
import HamburgerMenu from '../components/Hamburger';
import AnimeCard, { createAnimeUrlSlug, truncateTitle } from '../components/AnimeCard';
import SkeletonLoader from '../components/SkeletonLoader';
import AnimeCarousel from '../components/AnimeCarousel'; // Import the AnimeCarousel
import NewAnimeCarousel from '../components/NewAnimeCarousel'; // Import the NewAnimeCarousel

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
    <div className="container mx-auto p-6 relative">
      <HamburgerMenu menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <div className="absolute top-4 right-4 z-19 flex items-center">
        <button onClick={() => setSearchVisible(!searchVisible)} className="btn btn-primary">
          <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="20" height="20" viewBox="0 0 50 50">
            <path d="M 21 3 C 11.621094 3 4 10.621094 4 20 C 4 29.378906 11.621094 37 21 37 C 24.710938 37 28.140625 35.804688 30.9375 33.78125 L 44.09375 46.90625 L 46.90625 44.09375 L 33.90625 31.0625 C 36.460938 28.085938 38 24.222656 38 20 C 38 10.621094 30.378906 3 21 3 Z M 21 5 C 29.296875 5 36 11.703125 36 20 C 36 28.296875 29.296875 35 21 35 C 12.703125 35 6 28.296875 6 20 C 6 11.703125 12.703125 5 21 5 Z"></path>
          </svg>
        </button>
        {searchVisible && (
          <form onSubmit={handleSearch} className="ml-2">
            <input
              type="text"
              placeholder="Search Animes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input input-bordered w-full md:w-64 transition-all duration-300"
            />
          </form>
        )}
      </div>

      <div className="mt-16"> {/* Increased margin to move down further */}
        <AnimeCarousel /> {/* Add the AnimeCarousel component here */}
        <NewAnimeCarousel /> {/* Add the NewAnimeCarousel component here */}
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
