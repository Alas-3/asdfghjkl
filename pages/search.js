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
  <div className="flex justify-center">
    <div className="card bg-base-100 shadow-lg animate-pulse cursor-pointer relative transition-transform transform hover:scale-105 hover:shadow-xl rounded-lg overflow-hidden" style={{ width: '200px' }}>
      <figure className="h-64 w-full overflow-hidden relative rounded-t-lg bg-gray-200">
        {/* Placeholder for image */}
        <div className="h-full w-full bg-gray-300 animate-pulse"></div>
      </figure>
      <div className="card-body">
        <h2 className="h-6 bg-gray-300 rounded w-3/4 mb-2"></h2> {/* Title placeholder */}
        <h3 className="h-4 bg-gray-300 rounded w-1/2"></h3> {/* Episode placeholder */}
      </div>
    </div>
  </div>
);

// Function to truncate title for display
const truncateTitle = (title, maxLength) => {
  return title.length > maxLength ? `${title.slice(0, maxLength)}...` : title;
};

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
        <h1 className="text-2xl mr-12">Search Results for "{query}"</h1>
        <button
          onClick={handleHomeRedirect}
          className="btn btn-primary p-2 flex items-center justify-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
            />
          </svg>
        </button>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex mb-6 space-x-2">
        <input
          type="text"
          placeholder="Search Animes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input input-bordered w-full h-12 px-4 rounded-lg shadow-sm border-gray-300 focus:outline-none focus:ring focus:ring-blue-500"
        />
        <button type="submit" className="btn btn-primary h-12">Search</button>
      </form>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonLoader key={index} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {animes.map((anime) => (
            <div
              key={anime.title}
              className="flex justify-center"
              onClick={() => handleAnimeClick(anime)}
            >
              <div className="card bg-base-100 shadow-lg cursor-pointer relative transition-transform transform hover:scale-105 hover:shadow-xl rounded-lg overflow-hidden" style={{ width: '200px' }}>
                <figure className="h-64 w-full overflow-hidden relative rounded-t-lg">
                  <img src={anime.imageUrl} alt={`Image of ${anime.title}`} className="object-cover h-full w-full" />
                  <div className="absolute bottom-0 w-full bg-gradient-to-b from-transparent via-black/70 to-black p-2">
                    <h2 className="text-white text-lg font-bold">{truncateTitle(anime.title, 20)}</h2>
                    <h3 className="text-sm text-gray-300">{anime.episode}</h3>
                  </div>
                </figure>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
