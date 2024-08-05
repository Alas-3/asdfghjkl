// AnimeSchedule.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router'; // Import useRouter for navigation
import { getAnimeSchedule } from '../lib/jikan'; // Adjust the import path as necessary
import { format } from 'date-fns';

const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

const createAnimeUrlSlug = (title) => {
  return title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/(\d)\.(\d)/g, '$1-$2')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
};

const AnimeSchedule = () => {
  const [schedule, setSchedule] = useState({});
  const [selectedDay, setSelectedDay] = useState(daysOfWeek[new Date().getDay()]);
  const router = useRouter(); // Initialize useRouter

  const fetchSchedule = async (day) => {
    // Check localStorage for cached data and its timestamp
    const cachedData = JSON.parse(localStorage.getItem(`animeSchedule_${day}`));
    const cacheTimestamp = localStorage.getItem(`animeSchedule_${day}_timestamp`);
    const cacheValidDuration = 60 * 60 * 1000; // 1 hour in milliseconds

    const currentTime = Date.now();

    // If we have cached data and it is still valid, use it
    if (cachedData && cacheTimestamp && (currentTime - cacheTimestamp < cacheValidDuration)) {
      setSchedule(prevSchedule => ({ ...prevSchedule, [day]: cachedData }));
      return; // Use cached data
    }

    try {
      const data = await getAnimeSchedule(day);
      setSchedule(prevSchedule => ({ ...prevSchedule, [day]: data.data }));
      // Store the fetched data and current timestamp in localStorage
      localStorage.setItem(`animeSchedule_${day}`, JSON.stringify(data.data));
      localStorage.setItem(`animeSchedule_${day}_timestamp`, currentTime);
    } catch (error) {
      console.error('Error fetching schedule:', error);
    }
  };

  useEffect(() => {
    fetchSchedule(selectedDay);
  }, [selectedDay]);

  // Filter out animes with a score of "N/A"
  const filteredSchedule = (schedule[selectedDay] || []).filter(anime => anime.score && anime.score !== 'N/A');

  const truncateTitle = (title, maxLength) => {
    if (title.length <= maxLength) return title;

    const words = title.split(' ');
    let truncated = '';

    for (let word of words) {
      if ((truncated + ' ' + word).trim().length <= maxLength) {
        truncated += (truncated ? ' ' : '') + word;
      } else {
        break;
      }
    }

    return truncated;
  };

  const handleAnimeClick = (animeTitle) => {
    const slug = createAnimeUrlSlug(animeTitle);
    router.push(`/anime/${slug}`); // Redirect to the anime details page with the slug
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex overflow-x-auto py-4 space-x-2 scrollbar-hide">
        {daysOfWeek.map((day) => (
          <button
            key={day}
            className={`tab tab-bordered ${selectedDay === day ? 'border-2 border-green-500 text-green-500 rounded-full' : 'border-2 border-transparent text-white'} flex justify-center items-center px-4 transition duration-200`}
            onClick={() => {
              setSelectedDay(day);
              fetchSchedule(day);
            }}
          >
            <span className={`flex items-center justify-center ${selectedDay === day ? 'font-semibold' : ''}`}>
              {day.charAt(0).toUpperCase() + day.slice(1)}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-6 overflow-hidden">
        <h2 className="text-2xl font-bold mb-4">Anime Schedule for {selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1)}</h2>
        {filteredSchedule.length > 0 ? (
          <div className="overflow-x-auto">
            <div className="flex space-x-4"> {/* Flex container for horizontal scroll */}
              {filteredSchedule.map((anime) => (
                <div key={anime.mal_id} className="flex-shrink-0" onClick={() => handleAnimeClick(anime.title)}> {/* Click handler */}
                  <div className="card bg-base-100 shadow-lg cursor-pointer relative transition-transform transform hover:scale-105 hover:shadow-xl rounded-lg overflow-hidden" style={{ width: '200px' }}>
                    <figure className="h-72 w-full overflow-hidden relative rounded-t-lg"> {/* Set fixed height for image container */}
                      <img 
                        src={anime.images.jpg.large_image_url} 
                        alt={`Image of ${anime.title}`} 
                        className="object-cover h-full w-full" 
                      />
                      <div className="absolute bottom-0 w-full bg-gradient-to-b from-transparent via-black/70 to-black p-2">
                        <h2 className="text-white text-lg font-bold">{truncateTitle(anime.title, 20)}</h2>
                      </div>
                    </figure>
                    <figcaption className="p-4 flex flex-col h-20 md:h-28 lg:h-32"> {/* Set fixed height for the figcaption section */}
                      <div className="grid grid-cols-2 gap-1 mb-2 flex-grow"> {/* Flex-grow to ensure proper space distribution */}
                        <p className="text-sm text-gray-600 hidden md:block">Type: {anime.type || 'N/A'}</p>
                        <p className="text-sm text-gray-600">Episodes: {anime.episodes || 'N/A'}</p>
                        <p className="text-sm text-gray-600">Score: {anime.score || 'N/A'}</p>
                        <p className="text-sm text-gray-600 hidden md:block">Source: {anime.source || 'N/A'}</p>
                      </div>
                      <p className="text-sm text-gray-600 hidden md:block overflow-ellipsis overflow-hidden whitespace-nowrap">
                        Genres: {anime.genres.length > 0 ? anime.genres.map(genre => genre.name).join(', ') : 'N/A'}
                      </p>
                    </figcaption>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p>No anime scheduled for today.</p>
        )}
      </div>
    </div>
  );
};

export default AnimeSchedule;
