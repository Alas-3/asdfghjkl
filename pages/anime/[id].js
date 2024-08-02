import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { scrapeAnimeDetails, scrapeEpisodeVideoUrl } from '../../lib/scrape';
import VideoPlayer from '../../components/VideoPlayer';
import { supabase } from '../../lib/supabase';

export default function AnimeDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [anime, setAnime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedEpisodeUrl, setSelectedEpisodeUrl] = useState(null);
  const [isNavigatingBack, setIsNavigatingBack] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false); // State to track if anime is already a favorite

  useEffect(() => {
    if (id) {
      const url = `https://gogoanime3.co/category/${id}`;
      const fetchAnimeDetails = async () => {
        const data = await scrapeAnimeDetails(url);
        setAnime(data);
        setLoading(false);
      };
      fetchAnimeDetails();
    }
  }, [id]);

  useEffect(() => {
    const checkIfFavorite = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id)
        .eq('title', anime?.title); // Check if the anime is already in favorites

      if (error) {
        console.error('Error checking favorites:', error);
      } else {
        setIsFavorite(data.length > 0); // Update favorite status based on result
      }
    };

    if (anime) {
      checkIfFavorite();
    }
  }, [anime]);

  const handleEpisodeClick = async (episode) => {
    const videoUrl = await scrapeEpisodeVideoUrl(episode.link);
    setSelectedEpisodeUrl(videoUrl);
  };

  const handleBackClick = () => {
    setIsNavigatingBack(true);
    setTimeout(() => {
      router.back();
    }, 100);
  };

  const handleAddFavorite = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('User not authenticated');
      return;
    }

    const { data, error } = await supabase
      .from('favorites')
      .insert([
        {
          user_id: user.id,
          title: anime.title,
          imageUrl: anime.imageUrl,
        }
      ]);

    if (error) {
      console.error('Error adding favorite:', error);
    } else {
      console.log('Favorite added:', data);
      setIsFavorite(true); // Update state to reflect that the anime is now a favorite
    }
  };

  if (loading || isNavigatingBack) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!anime) {
    return <p className="text-center text-xl">Anime not found.</p>;
  }

  return (
    <div className="container mx-auto p-6">
      <button onClick={handleBackClick} className="btn btn-secondary mb-6">Back</button>
      <div className="flex flex-col md:flex-row md:items-start mb-8">
        <img src={anime.imageUrl} alt={anime.title} className="rounded-lg shadow-lg mb-6 md:mb-0 md:w-1/3" />
        <div className="md:ml-8 md:w-2/3">
          <h1 className="text-4xl font-bold mb-4">{anime.title}</h1>
          <p className="text-lg mb-4">{anime.description}</p>
          <p className="font-bold mb-2">Genres: <span className="text-blue-500">{anime.genres.join(', ')}</span></p>
          <p className="font-bold mb-2">Status: <span className="text-blue-500">{anime.status}</span></p>
          <p className="font-bold mb-4">Total Episodes: <span className="text-blue-500">{anime.totalEpisodes}</span></p>
          <button 
            onClick={handleAddFavorite} 
            className={`btn ${isFavorite ? 'btn-secondary' : 'btn-primary'} mt-2`} 
            disabled={isFavorite} // Disable button if already a favorite
          >
            {isFavorite ? 'Added to Favorites' : 'Add to Favorites'}
          </button>
        </div>
      </div>

      <h2 className="text-2xl font-semibold mb-4">Episodes</h2>
      {anime.episodes.length > 0 ? (
        <ul className="grid grid-cols-2 md:grid-cols-10 gap-6">
          {anime.episodes.map((episode, index) => (
            <li key={index} className="my-2">
              <button
                onClick={() => handleEpisodeClick(episode)}
                className="btn btn-primary w-full"
              >
                {episode.title}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No episodes found.</p>
      )}

      {selectedEpisodeUrl && (
        <div className="mt-8">
          <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
            <iframe
              src={selectedEpisodeUrl}
              className="absolute top-0 left-0 w-full h-full rounded-lg shadow-lg"
              frameBorder="0"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
}
