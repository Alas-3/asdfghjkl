import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { scrapeAnimeDetails, scrapeEpisodeVideoUrl } from '../../lib/scrape';
import { supabase } from '../../lib/supabase';
import { FiPlay } from 'react-icons/fi';

const createAnimeUrlSlug = (title) => {
  return title
    .normalize('NFD') // Normalize to decompose accented characters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritical marks
    .toLowerCase()
    .replace(/(\d)\.(\d)/g, '$1-$2') // Replace periods in numeric sequences with hyphens
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric characters with hyphens
    .replace(/^-|-$/g, ''); // Remove leading and trailing hyphens
};

export default function AnimeDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [anime, setAnime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedEpisodeUrl, setSelectedEpisodeUrl] = useState(null);
  const [isNavigatingBack, setIsNavigatingBack] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [lastWatchedEpisode, setLastWatchedEpisode] = useState(null);

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
    const fetchFavorites = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('Error fetching user:', userError);
        return;
      }

      if (!user) return;

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

  const checkIfFavorite = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', user.id)
      .eq('title', anime?.title);

    if (error) {
      console.error('Error checking favorites:', error);
    } else {
      setIsFavorite(data.length > 0);
    }
  };

  useEffect(() => {
    if (anime) {
      checkIfFavorite();
      fetchLastWatchedEpisode(); // Fetch the last watched episode when anime details are available
    }
  }, [anime]);

  const fetchLastWatchedEpisode = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('watched_episodes')
      .select('*')
      .eq('user_id', user.id)
      .eq('anime_id', anime.title)
      .order('created_at', { ascending: false }) // Order by created_at descending
      .limit(1)
      .single();

    if (error) {
      console.error('Error fetching last watched episode:', error);
    } else {
      if (data) {
        setLastWatchedEpisode(data);
      }
    }
  };

  const handleEpisodeClick = async (episode) => {
    try {
      const videoUrl = await scrapeEpisodeVideoUrl(episode.link);
      if (!videoUrl) {
        throw new Error('Failed to fetch video URL');
      }
      setSelectedEpisodeUrl(videoUrl);

      // Save the episode to watched_episodes
      await saveWatchedEpisode(episode);
    } catch (error) {
      console.error('Error fetching video URL:', error);
    }
  };

  const saveWatchedEpisode = async (episode) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('watched_episodes')
      .insert([
        {
          user_id: user.id,
          anime_id: anime.title,
          episode_title: episode.title,
          episode_number: episode.number,
          created_at: new Date().toISOString(), // Add the created_at timestamp
        },
      ]);

    if (error) {
      console.error('Error saving watched episode:', error);
    } else {
      console.log('Watched episode saved:', {
        anime_id: anime.id,
        episode_title: episode.title,
      });
    }
  };

  const handleBackClick = () => {
    setIsNavigatingBack(true);
    setTimeout(() => {
      router.back();
    }, 100);
  };

  const handleToggleFavorite = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('User not authenticated');
      return;
    }

    if (isFavorite) {
      // Remove from favorites
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('title', anime.title);

      if (error) {
        console.error('Error removing favorite:', error);
      } else {
        setIsFavorite(false);
        console.log('Favorite removed');
      }
    } else {
      // Add to favorites
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
        setIsFavorite(true);
        console.log('Favorite added:', data);
      }
    }
  };

  const handleResumeClick = async () => {
    if (!lastWatchedEpisode) {
      console.error('No last watched episode available');
      return;
    }

    // Debugging log
    console.log('Last Watched Episode:', lastWatchedEpisode);

    // Create the anime and episode slugs
    const episodeSlug = createAnimeUrlSlug(lastWatchedEpisode.episode_title.toLowerCase());
    const animeSlug = createAnimeUrlSlug(anime.title);

    // Construct the video URL
    const videoUrl = `https://gogoanime3.co/${animeSlug}-${episodeSlug}`;

    // Fetch the video URL using scrapeEpisodeVideoUrl
    const videoPlayerUrl = await scrapeEpisodeVideoUrl(videoUrl);

    // If a video player URL is successfully retrieved, set it to state
    if (videoPlayerUrl) {
      setSelectedEpisodeUrl(videoPlayerUrl);
    } else {
      console.error('Failed to retrieve video player URL');
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
          <div className="flex items-center mt-2">
            <button 
              onClick={handleToggleFavorite} 
              className={`btn ${isFavorite ? 'btn-secondary' : 'btn-primary'} mr-2`} 
            >
              {isFavorite ? 'Remove from Watching' : 'Add to Watchlist'}
            </button>
            <button onClick={handleResumeClick} className="btn btn-accent" disabled={!lastWatchedEpisode}>
              <FiPlay className="inline-block mr-2" />
              Resume
            </button>
          </div>
          {lastWatchedEpisode && (
            <p className="mt-2">Last watched episode: <span className="text-blue-500">{lastWatchedEpisode.episode_title}</span></p>
          )}
        </div>
      </div>

      {/* Video Player */}
      {selectedEpisodeUrl && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Now Playing</h2>
          <div className="relative w-full h-0 pb-[68%] md:pb-[56.25%]"> {/* 68% for mobile, 56.25% for larger screens */}
            <iframe
              src={selectedEpisodeUrl}
              title="Anime Episode"
              className="absolute top-0 left-0 w-full h-full rounded-lg" // Added rounded corners
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}


      {/* Episode List */}
      <div className="flex overflow-x-auto space-x-2 py-4">
        {anime.episodes.map((episode, index) => {
          // Check if the current episode is the last watched episode
          const isLastWatched = lastWatchedEpisode && lastWatchedEpisode.episode_title === episode.title;

          return (
            <button 
              key={index} 
              onClick={() => handleEpisodeClick(episode)} 
              className={`btn btn-outline ${isLastWatched ? 'border-2 border-green-500' : ''}`} // Apply green border if it's the last watched episode
            >
              {/* Display only the episode number on mobile */}
              <span className="text-base md:hidden">{episode.title.replace(/Episode\s+/i, '')}</span>
              {/* Full episode title for larger screens */}
              <span className="hidden md:block">{episode.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
