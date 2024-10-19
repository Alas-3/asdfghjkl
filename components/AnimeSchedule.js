import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { getAnimeSchedule } from '../lib/jikan';
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
  const [hasMounted, setHasMounted] = useState(false);
  const router = useRouter();
  const buttonContainerRef = useRef(null);

  const fetchSchedule = async (day) => {
    const cachedData = JSON.parse(localStorage.getItem(`animeSchedule_${day}`));
    const cacheTimestamp = localStorage.getItem(`animeSchedule_${day}_timestamp`);
    const cacheValidDuration = 60 * 60 * 1000; // 1 hour in milliseconds

    const currentTime = Date.now();

    if (cachedData && cacheTimestamp && currentTime - cacheTimestamp < cacheValidDuration) {
      setSchedule((prevSchedule) => ({ ...prevSchedule, [day]: cachedData }));
      return;
    }

    try {
      const data = await getAnimeSchedule(day);
      setSchedule((prevSchedule) => ({ ...prevSchedule, [day]: data.data }));
      localStorage.setItem(`animeSchedule_${day}`, JSON.stringify(data.data));
      localStorage.setItem(`animeSchedule_${day}_timestamp`, currentTime);
    } catch (error) {
      console.error('Error fetching schedule:', error);
    }
  };

  useEffect(() => {
    fetchSchedule(selectedDay);
    setHasMounted(true);
  }, [selectedDay]);

  useEffect(() => {
    if (hasMounted && buttonContainerRef.current) {
      const activeButton = buttonContainerRef.current.querySelector(`button[data-day="${selectedDay}"]`);
      if (activeButton) {
        const containerRect = buttonContainerRef.current.getBoundingClientRect();
        const buttonRect = activeButton.getBoundingClientRect();

        buttonContainerRef.current.scrollTo({
          left: buttonRect.left - containerRect.left - containerRect.width / 2 + buttonRect.width / 2,
          behavior: 'smooth',
        });
      }
    }
  }, [hasMounted, selectedDay]);

  const filteredSchedule = (schedule[selectedDay] || []).filter((anime) => anime.score && anime.score !== 'N/A');

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
    router.push(`/anime/${slug}`);
  };

  return (
    <div className="text-white py-2"> {/* Removed min-h-screen */}
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6 text-center">Anime Schedule</h1>
        <div ref={buttonContainerRef} className="flex overflow-x-auto py-4 mb-6 space-x-2 scrollbar-hide">
          {daysOfWeek.map((day) => (
            <button
              key={day}
              data-day={day}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                selectedDay === day
                  ? 'border-2 border-green-500 text-green-500'
                  : 'border-2 border-transparent text-white hover:border-gray-300'
              }`}
              onClick={() => {
                setSelectedDay(day);
                fetchSchedule(day);
              }}
            >
              {day.charAt(0).toUpperCase() + day.slice(1)}
            </button>
          ))}
        </div>

        <h2 className="text-2xl font-semibold mb-6 text-green-400">
          {selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1)}'s Lineup
        </h2>

        {filteredSchedule.length > 0 ? (
          <div className="overflow-x-auto mb-4"> {/* Adjusted margin for better spacing */}
            <div className="flex space-x-4 pb-4"> {/* Reduced bottom padding */}
              {filteredSchedule.map((anime) => (
                <div
                  key={anime.mal_id}
                  className="flex-shrink-0 w-36 sm:w-44 md:w-48 bg-gray-800 rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 cursor-pointer"
                  onClick={() => handleAnimeClick(anime.title)}
                >
                  <div className="relative pb-[140%]">
                    <img
                      src={anime.images.jpg.large_image_url}
                      alt={`Cover of ${anime.title}`}
                      className="absolute top-0 left-0 w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                      <h3 className="text-sm font-bold leading-tight">{truncateTitle(anime.title, 30)}</h3>
                    </div>
                  </div>
                  <div className="p-2 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400">{anime.type || 'N/A'}</span>
                      <span className="text-xs font-semibold text-yellow-400">★ {anime.score || 'N/A'}</span>
                    </div>
                    <p className="text-xs text-gray-300">Ep: {anime.episodes || 'TBA'}</p>
                    <p className="text-xs text-gray-400 truncate">
                      {anime.genres.slice(0, 2).map((genre) => genre.name).join(', ')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-400 text-lg">No anime scheduled for today.</p>
        )}
      </div>
    </div>
  );
};

export default AnimeSchedule;
