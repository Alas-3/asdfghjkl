import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { scrapePopularAnimes } from '../lib/scrape';
import { supabase } from '../lib/supabase';

// Function to convert title to URL slug
const createAnimeUrlSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric characters with hyphens
    .replace(/^-|-$/g, ''); // Remove leading and trailing hyphens
};

export default function Home() {
  const [animes, setAnimes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchAnimes() {
      const scrapedAnimes = await scrapePopularAnimes();
      setAnimes(scrapedAnimes);
    }
    fetchAnimes();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Navigate to the search page with the search term as a query parameter
    router.push(`/search?query=${encodeURIComponent(searchTerm)}`);
  };

  // Function to navigate to the anime details page
  const handleAnimeClick = (anime) => {
    const urlSlug = createAnimeUrlSlug(anime.title);
    router.push(`/anime/${urlSlug}`);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl">Recent Releases</h1>
        <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
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

      {/* Display Popular Animes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {animes.map((anime) => (
          <div
            key={anime.title}
            className="card bg-base-100 shadow-lg cursor-pointer" // Add cursor pointer
            onClick={() => handleAnimeClick(anime)} // Call the click handler
          >
            <figure>
              <img src={anime.imageUrl} alt={anime.title} />
            </figure>
            <div className="card-body">
              <h2 className="card-title">{anime.title}</h2>
              <h3 className="text-sm text-gray-500">{anime.episode}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
