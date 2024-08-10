import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { scrapeAnimeDetails, scrapeEpisodeVideoUrl } from '../../lib/scrape';
import { getMalId, getJikanAnimeDetails } from '../../lib/jikan'; // Import the functions from jikan.js
import { supabase } from '../../lib/supabase';

const createAnimeUrlSlug = (title) => {
  return title
    .normalize('NFD') // Normalize to decompose accented characters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritical marks
    .toLowerCase()
    .replace(/[()]/g, '') // Remove parentheses but keep their content
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
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [showEpisodes, setShowEpisodes] = useState(false); // Add this line to define the showEpisodes state

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
    if (anime && lastWatchedEpisode === null) {
      fetchLastWatchedEpisode(); // Fetch the last watched episode only if it's not already fetched
      checkIfFavorite();
      fetchJikanAnimeDetails(anime.title); // Fetch Jikan details
    }
  }, [anime, lastWatchedEpisode]);

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
  
    // Removed error logging
    if (error) {
      // Handle error silently if needed (e.g., show a notification)
    } else {
      if (data) {
        setLastWatchedEpisode(data);
      } else {
        setLastWatchedEpisode(null); // Set to null to prevent further fetching
      }
    }
  };

  const fetchJikanAnimeDetails = async (animeTitle) => {
    const malId = await getMalId(animeTitle); // Get the mal_id using the anime title
    if (malId) {
      const details = await getJikanAnimeDetails(malId); // Fetch anime details from Jikan API
      if (details) {
        setAnime((prev) => ({
          ...prev,
          description: details.synopsis,
          genres: details.genres.map(genre => genre.name),
          status: details.status,
          duration: details.duration,
          score: details.score,
          type: details.type,
          title_english: details.title_english,
          parental_rating: details.rating,
          season: details.season,
          year: details.year,
          studios: details.studios.map(studio => studio.name).join(', '),
        }));
      }
    }
  };

  const handleEpisodeClick = async (episode) => {
    try {
      // Create the episode slug
      const episodeSlug = createAnimeUrlSlug(episode.title);
  
      // Construct the URL using the anime title and episode slug
      const animeSlug = createAnimeUrlSlug(anime.title);
      const videoUrl = `https://gogoanime3.co/${animeSlug}-${episodeSlug}`;
  
      const fetchedVideoUrl = await scrapeEpisodeVideoUrl(videoUrl);
      if (!fetchedVideoUrl) {
        throw new Error('Failed to fetch video URL');
      }
      setSelectedEpisodeUrl(fetchedVideoUrl);
  
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
    router.back(); // Navigate back immediately
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

  const toggleDescription = () => {
    setIsDescriptionExpanded((prev) => !prev);
  };
  
  const EpisodeList = ({ anime, lastWatchedEpisode, handleEpisodeClick }) => {
    const [showEpisodes, setShowEpisodes] = useState(false);
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
    <div className="flex flex-col min-h-screen"> 
      <div className="container mx-auto p-6">
        <button
          onClick={handleBackClick}
          className="btn btn-outline text-white md:mb-6 lg:mb-6 z-10 relative md:shadow-none"
          style={{
            filter: 'drop-shadow(0 3px 3px rgba(0, 0, 0, 1))', // Darker shadow with full opacity
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
          </svg>
        </button>

        <div className="flex flex-col md:flex-row md:items-start mb-8 relative">
          {/* Mobile title overlay */}
          <div className="hero-banner h-[calc(90vh-3rem)] md:h-[32rem] lg:h-[40rem] w-[calc(100vw + 3rem)] lg:w-full relative overflow-hidden lg:rounded-t-lg -mx-6 lg:mx-0 -mt-18 lg:mt-0 block md:hidden">
            <img
              src={anime.imageUrl}
              alt={anime.title}
              className="absolute inset-0 w-full h-full object-cover object-center transform transition-transform duration-500 ease-in-out hover:scale-105 lg:rounded-t-lg"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
            <div className="absolute bottom-0 left-0 w-full p-6 text-white">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">{anime.title}</h1>
              <p className="text-gray-300 text-sm">{anime.title_english}</p>
            </div>
          </div>

          {/* Anime details for larger screens */}
          <img src={anime.imageUrl} alt={anime.title} className="rounded-lg shadow-lg mb-6 md:mb-0 md:w-1/3 hidden md:block" />
          <div className="md:ml-8 md:w-2/3">
            <h1 className="text-4xl font-bold mb-1 hidden md:block">{anime.title}</h1>
            <p className="text-gray-500 text-sm mb-4 hidden md:block">{anime.title_english}</p>

            <p className="font-bold mb-4">
              {`Score: ${anime.score} | ${anime.season ? anime.season.charAt(0).toUpperCase() + anime.season.slice(1) : 'N/A'} ${anime.year || ''}`}
            </p>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <p className="font-semibold">Genres:</p>
              <p>{anime.genres.join(', ')}</p>
              <p className="font-semibold">Type:</p>
              <p>{anime.type}</p>
              <p className="font-semibold">Parental Rating:</p>
              <p>{anime.parental_rating}</p>
              <p className="font-semibold">Status:</p>
              <p>{anime.status}</p>
            </div>

            {/* Collapsible Description */}
            <div className="mb-4 w-full">
              <button onClick={toggleDescription} className="btn btn-outline mb-2">
                {isDescriptionExpanded ? 'Show Less' : 'Show Description'}
              </button>
              {isDescriptionExpanded && (
                <p className="text-gray-700">{anime.description}</p>
              )}
            </div>

            <div className="flex items-center mt-2">
            <button 
              onClick={handleToggleFavorite} 
              className={`btn ${isFavorite ? 'btn-secondary' : 'btn-primary'} mr-2`} 
            >
              {isFavorite ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m3 3 1.664 1.664M21 21l-1.5-1.5m-5.485-1.242L12 17.25 4.5 21V8.742m.164-4.078a2.15 2.15 0 0 1 1.743-1.342 48.507 48.507 0 0 1 11.186 0c1.1.128 1.907 1.077 1.907 2.185V19.5M4.664 4.664 19.5 19.5" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                </svg>
              )}
            </button>

            <button onClick={handleResumeClick} className="btn btn-accent" disabled={!lastWatchedEpisode}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6 inline-block mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
              </svg>
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

        {/* Show Episodes Button for Mobile */}
        <div className="md:hidden mb-4">
          <button
            onClick={() => setShowEpisodes(!showEpisodes)}
            className="btn btn-outline"
          >
            {showEpisodes ? 'Hide Episodes' : 'Show Episodes'}
          </button>
        </div>

        {/* Episode List */}
        <div className={`flex overflow-x-auto space-x-2 py-4 ${showEpisodes ? '' : 'hidden md:flex'}`}>
          {anime.episodes.map((episode, index) => {
            const isLastWatched = lastWatchedEpisode && lastWatchedEpisode.episode_title === episode.title;

            return (
              <button 
                key={index} 
                onClick={() => handleEpisodeClick(episode)} 
                className={`btn btn-outline ${isLastWatched ? 'border-2 border-green-500' : ''}`} // Apply green border if it's the last watched episode
              >
                <span className="text-base md:hidden">{episode.title.replace(/Episode\s+/i, '')}</span>
                <span className="hidden md:block">{episode.title}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}