import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/router';
import withAuth from '../lib/withAuth';

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
const SkeletonLoader = () => {
  return (
    <div className="card bg-base-100 shadow-lg animate-pulse">
      <figure className="h-64 w-full bg-gray-200"></figure>
      <div className="card-body">
        <h2 className="h-6 bg-gray-200 rounded w-3/4"></h2>
      </div>
    </div>
  );
};

function Profile() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true); // New loading state
  const [showModal, setShowModal] = useState(false); // State for modal
  const [selectedAnime, setSelectedAnime] = useState(null); // Selected anime for removal
  const router = useRouter();

  useEffect(() => {
    const fetchFavorites = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('Error fetching user:', userError);
        return;
      }

      if (!user) {
        router.replace('/login');
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

      setLoading(false); // Stop loading after fetching data
    };

    fetchFavorites();
  }, [router]);

  const handleHomeClick = () => {
    router.push('/'); // Navigate to the home page
  };

  // Function to navigate to the anime details page
  const handleAnimeClick = (anime) => {
    const urlSlug = createAnimeUrlSlug(anime.title);
    router.push(`/anime/${urlSlug}`); // Navigate to the anime details page
  };

  const handleRemoveClick = (anime) => {
    setSelectedAnime(anime); // Set selected anime
    setShowModal(true); // Show the confirmation modal
  };

  const handleConfirmRemove = async () => {
    if (!selectedAnime) return; // Ensure selectedAnime is set

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('id', selectedAnime.id); // Remove from favorites

    if (error) {
      console.error('Error removing favorite:', error);
    } else {
      // Update the state to reflect the change
      setFavorites(favorites.filter((fav) => fav.id !== selectedAnime.id));
    }
    setShowModal(false); // Close modal
  };

  const handleCancelRemove = () => {
    setShowModal(false); // Close modal
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl">My Favorites</h1>
        <button 
          onClick={handleHomeClick} 
          className="btn btn-primary"
        >
          Home
        </button>
      </div>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* Show skeleton loaders */}
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonLoader key={index} />
          ))}
        </div>
      ) : (
        <>
          {favorites.length === 0 ? (
            <p className="text-center text-xl">No favorites added.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {favorites.map((anime) => (
                <div 
                  key={anime.id} 
                  className="card bg-base-100 shadow-lg cursor-pointer relative" 
                  onClick={() => handleAnimeClick(anime)} // Click handler
                >
                  <figure className="h-64 w-full overflow-hidden">
                    <img src={anime.imageUrl} alt={anime.title} className="object-cover h-full w-full" />
                  </figure>
                  <div className="card-body">
                    <h2 className="card-title">{truncateTitle(anime.title, 30)}</h2> {/* Use truncation function */}
                    <button 
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700" 
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent click from triggering the card click
                        handleRemoveClick(anime);
                      }}
                    >
                      X
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 p-6 rounded shadow-lg max-w-sm w-full">
            <h2 className="text-lg font-bold mb-4">Remove from Favorites</h2>
            <p className="mb-4">Are you sure you want to remove "{selectedAnime.title}" from your favorites?</p>
            <div className="flex justify-between">
              <button 
                onClick={handleConfirmRemove} 
                className="btn btn-danger"
              >
                Yes
              </button>
              <button 
                onClick={handleCancelRemove} 
                className="btn btn-secondary"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default withAuth(Profile);
