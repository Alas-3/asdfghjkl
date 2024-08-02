import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { searchAnime } from '../lib/scrape';

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

export default function SearchResults() {
  const [animes, setAnimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const { query } = router.query; // Get the query parameter from the URL

  useEffect(() => {
    const fetchAnimes = async () => {
      if (query) {
        const results = await searchAnime(query);
        setAnimes(results);
        setSearchTerm(query); // Set the search term for the input field
      }
      setLoading(false);
    };
    fetchAnimes();
  }, [query]);

  const handleHomeRedirect = () => {
    router.push('/');
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    // Navigate to the search page with the new search term
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
        <h1 className="text-4xl">Search Results for "{query}"</h1>
        <button onClick={handleHomeRedirect} className="btn btn-secondary">Home</button>
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
                <h2 className="card-title">{anime.title}</h2>
                <h3 className="text-sm text-gray-500">{anime.episode}</h3>
                <button 
                  onClick={() => handleAnimeClick(anime)} 
                  className="btn btn-primary mt-2"
                >
                  Watch Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
