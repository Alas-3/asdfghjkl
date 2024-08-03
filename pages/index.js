import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { scrapePopularAnimes } from '../lib/scrape';
import { supabase } from '../lib/supabase';
import withAuth from '../lib/withAuth';
import HamburgerMenu from '../components/Hamburger'; // Import HamburgerMenu

// Function to convert title to URL slug
const createAnimeUrlSlug = (title) => {
  return title
    .normalize('NFD') // Normalize to decompose accented characters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritical marks
    .toLowerCase()
    .replace(/(\d)\.(\d)/g, '$1-$2') // Replace periods in numeric sequences with hyphens
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric characters with hyphens
    .replace(/^-|-$/g, ''); // Remove leading and trailing hyphens
};

// Function to truncate title
const truncateTitle = (title, maxLength) => {
  if (title.length > maxLength) {
    return title.slice(0, maxLength) + '...'; // Truncate and add ellipsis
  }
  return title; // Return full title if it's short enough
};

// Skeleton loader component
const SkeletonLoader = () => (
  <div className="card bg-base-100 shadow-lg animate-pulse">
    <figure className="h-64 w-full bg-gray-200"></figure>
    <div className="card-body">
      <h2 className="h-6 bg-gray-200 rounded w-3/4"></h2>
      <h3 className="h-4 bg-gray-200 rounded w-1/2 mt-2"></h3>
    </div>
  </div>
);

function Home() {
  const [animes, setAnimes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false); // State for the hamburger menu
  const [searchVisible, setSearchVisible] = useState(false); // State for search bar visibility
  const router = useRouter();

  useEffect(() => {
    async function fetchAnimes() {
      setLoading(true); // Set loading to true
      const scrapedAnimes = await scrapePopularAnimes();
      setAnimes(scrapedAnimes);
      setLoading(false); // Reset loading after fetching
    }
    fetchAnimes();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  const handleProfile = () => {
    router.push('/profile'); // Navigate to the profile page
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Navigate to the search page with the search term as a query parameter
    router.push(`/search?query=${encodeURIComponent(searchTerm)}`);
  };

  // Function to navigate to the anime details page
  const handleAnimeClick = async (anime) => {
    const urlSlug = createAnimeUrlSlug(anime.title);
    setLoading(true); // Set loading to true
    await router.push(`/anime/${urlSlug}`);
    setLoading(false); // Reset loading after navigating
  };

  return (
    <div className="container mx-auto p-6 relative">
    {/* Hamburger Menu */}
    <HamburgerMenu menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

    {/* Search Bar */}
    <div className="absolute top-4 right-4 z-19 flex items-center">
      <button onClick={() => setSearchVisible(!searchVisible)} className="btn btn-primary">
        {/* SVG Search Icon */}
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

      <div className="flex justify-between items-center mb-6 mt-16"> {/* Added mt-16 for spacing */}
        <h1 className="text-4xl">Recent Releases</h1>
      </div>

      {/* Display Loading Skeletons */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonLoader key={index} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {animes.map((anime) => (
            <div
              key={anime.title}
              className="card bg-base-100 shadow-lg cursor-pointer"
              onClick={() => handleAnimeClick(anime)}
            >
              <figure className="h-64 w-full overflow-hidden">
                <img src={anime.imageUrl} alt={anime.title} className="object-cover h-full w-full" />
              </figure>
              <div className="card-body">
                <h2 className="card-title">{truncateTitle(anime.title, 30)}</h2> {/* Use truncation function */}
                <h3 className="text-sm text-gray-500">{anime.episode}</h3>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Wrap the Home component with the withAuth HOC
export default withAuth(Home);
