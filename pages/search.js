import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { searchAnime } from "../lib/scrape";

const createAnimeUrlSlug = (title) => {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/(\d)\.(\d)/g, "$1-$2")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
};

const SkeletonLoader = () => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
    <div className="h-48 sm:h-64 bg-gray-300"></div>
    <div className="p-4">
      <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-gray-300 rounded w-1/2"></div>
    </div>
  </div>
);

const truncateTitle = (title, maxLength) => {
  return title.length > maxLength ? `${title.slice(0, maxLength)}...` : title;
};

export default function SearchResults() {
  const [animes, setAnimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [clickedAnime, setClickedAnime] = useState(null);
  const router = useRouter();
  const { query } = router.query;

  useEffect(() => {
    const fetchAnimes = async () => {
      if (query) {
        const results = await searchAnime(query);
        setAnimes(results);
        setSearchTerm(query);
      }
      setLoading(false);
    };
    fetchAnimes();
  }, [query]);

  const handleHomeRedirect = () => {
    router.push("/");
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    router.push(`/search?query=${encodeURIComponent(searchTerm)}`);
  };

  const handleAnimeClick = (anime) => {
    setClickedAnime(anime);
    setTimeout(() => {
      const urlSlug = createAnimeUrlSlug(anime.title);
      router.push(`/anime/${urlSlug}`);
    }, 500); // Delay navigation to allow animation to play
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-0 text-center sm:text-left">
          Search Results for "{query}"
        </h1>
        <button
          onClick={handleHomeRedirect}
          className="btn btn-primary flex items-center justify-center px-4 py-2 rounded-full transition-all duration-300 ease-in-out hover:scale-105"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
          Home
        </button>
      </div>

      <form onSubmit={handleSearch} className="mb-8">
        <div className="relative">
          <input
            type="text"
            placeholder="Search Animes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-12 pl-4 pr-12 rounded-full shadow-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ease-in-out"
          />
          <button
            type="submit"
            className="absolute right-0 top-0 h-full px-4 text-gray-600 hover:text-blue-500 transition-colors duration-300 ease-in-out focus:outline-none"
            aria-label="Search"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        </div>
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
              <div
                className={`card bg-base-100 shadow-lg cursor-pointer relative transition-all duration-500 ease-in-out transform hover:scale-105 hover:shadow-xl rounded-lg overflow-hidden ${
                  clickedAnime === anime ? 'scale-150 opacity-0' : ''
                }`}
                style={{ width: "200px" }}
              >
                <figure className="h-64 w-full overflow-hidden relative rounded-t-lg">
                  <img
                    src={anime.imageUrl}
                    alt={`Image of ${anime.title}`}
                    className="object-cover h-full w-full"
                  />
                  <div className="absolute bottom-0 w-full bg-gradient-to-b from-transparent via-black/70 to-black p-2">
                    <h2 className="text-white text-lg font-bold">
                      {truncateTitle(anime.title, 20)}
                    </h2>
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