// pages/search.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { searchAnime } from '../lib/scrape';

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
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {animes.map((anime) => (
            <div key={anime.title} className="card bg-base-100 shadow-lg">
              <figure>
                <img src={anime.imageUrl} alt={anime.title} />
              </figure>
              <div className="card-body">
                <h2 className="card-title">{anime.title}</h2>
                <h3 className="text-sm text-gray-500">{anime.episode}</h3>
                <a href={`https://gogoanime3.co${anime.link}`} className="btn btn-primary">
                  Watch Now
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
