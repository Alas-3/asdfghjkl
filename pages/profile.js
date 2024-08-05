import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/router';
import withAuth from '../lib/withAuth';

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
const truncateTitle = (title, maxLength = 50) => {
  if (title.length <= maxLength) {
    return title;
  }
  return title.slice(0, maxLength) + '...';
};

function Profile() {
  const [favorites, setFavorites] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchFavorites = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('User not authenticated');
        return;
      }

      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching favorites:', error);
      } else {
        setFavorites(data);
      }
    };

    fetchFavorites();
  }, []);

  const handleAnimeClick = (anime) => {
    const slug = createAnimeUrlSlug(anime.title);
    router.push(`/anime/${slug}`);
  };

  const handleResumeClick = async (anime) => {
    const slug = createAnimeUrlSlug(anime.title);
    router.push(`/anime/${slug}`);

    setTimeout(() => {
      const currentEpisodeUrl = `/anime/${slug}/episode-${anime.current_episode}`;
      router.push(currentEpisodeUrl);
    }, 500); // Delay navigation to ensure correct URL structure
  };

  const handleHomeClick = () => {
    router.push('/'); // Redirect to home page
  };

  return (
    <div className="flex flex-col min-h-screen relative">
      <button
        onClick={handleHomeClick}
        className="btn btn-primary absolute top-6 right-8 z-10 p-2 flex items-center justify-center" // Moved to the right
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

      {/* Bubble-like Title */}
      <div className="flex justify-start p-6">
        <h1 className="bg-blue-500 text-white px-4 py-2 rounded-full text-2xl font-semibold shadow-lg">
          Your Watchlist
        </h1>
      </div>

      <div className="flex-grow container mx-auto p-6">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favorites.map((anime) => (
            <div className="flex justify-center" key={anime.id} onClick={() => handleAnimeClick(anime)}>
              <div className="card bg-base-100 shadow-lg cursor-pointer relative transition-transform transform hover:scale-105 hover:shadow-xl rounded-lg overflow-hidden" 
                style={{ width: '250px', height: 'auto' }}>
                <figure className="h-64 lg:h-80 w-full overflow-hidden relative rounded-t-lg"> {/* Changed height for desktop */}
                  <img
                    src={anime.imageUrl}
                    alt={`Image of ${anime.title}`}
                    className="object-cover h-full w-full"
                  />
                  <div className="absolute bottom-0 w-full bg-gradient-to-b from-transparent via-black/70 to-black p-2">
                    <h2 className="text-white text-lg font-bold">{truncateTitle(anime.title, 20)}</h2>
                    {anime.current_episode !== null && (
                      <h3 className="text-sm text-gray-300">Episode {anime.current_episode}</h3>
                    )}
                  </div>
                </figure>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default withAuth(Profile);
