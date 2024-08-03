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

    // Save current episode and position in state to pass to AnimeDetails component
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
        className="btn btn-primary absolute top-6 left-8 z-10 p-2 flex items-center justify-center" // Added flex for centering the SVG
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="w-6 h-6" // Set width and height of the SVG
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
          />
        </svg>
      </button>
      <div className="flex-grow container mx-auto p-6">
        <h1 className="text-3xl font-semibold mb-6 text-center mt-12">Your Watchlist</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {favorites.map((anime) => (
            <div
              key={anime.id}
              className="bg-base-200 rounded-lg shadow-lg cursor-pointer transition-transform transform hover:scale-105 w-64 h-90 mx-auto" // Set width and height for cards
              onClick={() => handleAnimeClick(anime)}
            >
              <img
                src={anime.imageUrl}
                alt={anime.title}
                className="rounded-t-lg w-full h-3/4 object-cover" // Use object-cover to fill the image area
              />
              <div className="p-4 flex flex-col justify-between h-1/4"> {/* Flexbox for title and buttons */}
                <h2 className="text-xl font-bold mb-2 overflow-hidden text-ellipsis whitespace-nowrap">
                  {truncateTitle(anime.title)}
                </h2>
                {anime.current_episode !== null && (
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                      Last Watched: Episode {anime.current_episode}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleResumeClick(anime);
                      }}
                      className="btn btn-secondary btn-sm"
                    >
                      Resume
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default withAuth(Profile);
