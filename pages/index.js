// pages/index.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { scrapePopularAnimes } from '../lib/scrape';
import { supabase } from '../lib/supabase';
import withAuth from '../lib/withAuth'; // Import the withAuth HOC

// Function to convert title to URL slug
const createAnimeUrlSlug = (title) => {
  return title
    .toLowerCase()
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
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl">Recent Releases</h1>
        <div className="flex items-center">
          <button onClick={handleProfile} className="btn btn-primary mr-4">Profile</button> {/* Profile button */}
          <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
        </div>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-6">
        <input
          type="text"
          placeholder="Search Animes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input input-bordered w-full"
        />
        <button type="submit" className="btn btn-primary mt-2">Search</button>
      </form>

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
