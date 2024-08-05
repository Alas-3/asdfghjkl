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
    <div className="container mx-auto p-6 relative">
      <div className="sticky top-0 z-20"> {/* Added mt-6 for margin top */}
  <HamburgerMenu menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
  <div className="absolute top-4 right-4 flex items-center">
    <button onClick={() => setSearchVisible(!searchVisible)} className="flex items-center justify-center lg:p-2">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        className="w-7 h-7"
        style={{
          filter: 'drop-shadow(0 1px 3px rgba(0, 0, 0, 0.8))', // Add subtle shadow
        }}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
        />
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
