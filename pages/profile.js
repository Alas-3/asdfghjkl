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
    <div className="container mx-auto p-6">
      <button onClick={handleHomeClick} className="btn btn-primary mb-6">
        Home
      </button>
      <h1 className="text-3xl font-semibold mb-6">Your Favorites</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {favorites.map((anime) => (
          <div
            key={anime.id}
            className="bg-base-200 p-4 rounded-lg shadow-lg cursor-pointer"
            onClick={() => handleAnimeClick(anime)}
          >
            <img
              src={anime.imageUrl}
              alt={anime.title}
              className="rounded-lg mb-4"
            />
            <h2 className="text-xl font-bold mb-2">
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
        ))}
      </div>
    </div>
  );
}

export default withAuth(Profile);
