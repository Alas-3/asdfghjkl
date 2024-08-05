// components/NewAnimeCarousel.js
import { useEffect, useState } from 'react';
import { scrapeNewAnimeThisSeason } from '../lib/scrape'; // Adjust the path accordingly
import AnimeCard from './AnimeCard'; // Import your AnimeCard component
import { useRouter } from 'next/router'; // Import Next.js router

const NewAnimeCarousel = () => {
    const [newAnimes, setNewAnimes] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter(); // Initialize router

    const cacheKey = 'newAnimeCarousel';
    const cacheTimestampKey = 'newAnimeCarousel_timestamp';
    const cacheValidDuration = 60 * 60 * 1000; // 1 hour in milliseconds

    useEffect(() => {
        const fetchNewAnimes = async () => {
            // Check localStorage for cached data and its timestamp
            const cachedData = JSON.parse(localStorage.getItem(cacheKey));
            const cacheTimestamp = localStorage.getItem(cacheTimestampKey);
            const currentTime = Date.now();

            // If we have cached data and it is still valid, use it
            if (cachedData && cacheTimestamp && (currentTime - cacheTimestamp < cacheValidDuration)) {
                setNewAnimes(cachedData);
                setLoading(false);
                return; // Use cached data
            }

            try {
                const animes = await scrapeNewAnimeThisSeason(); // Scrape new anime
                setNewAnimes(animes);
                // Store the fetched data and current timestamp in localStorage
                localStorage.setItem(cacheKey, JSON.stringify(animes));
                localStorage.setItem(cacheTimestampKey, currentTime);
            } catch (error) {
                console.error('Error fetching new anime:', error);
            } finally {
                setLoading(false); // Ensure loading state is updated
            }
        };

        fetchNewAnimes();
    }, []);

    // Define the handleAnimeClick function
    const handleAnimeClick = (anime) => {
        console.log('Anime clicked:', anime);
        const urlSlug = anime.urlSlug; // Use the slug you created
        router.push(`/anime/${urlSlug}`); // Navigate to the anime details page
    };

    return (
        <div className="mb-6">
            <h2 className="text-2xl mb-4">New Anime This Season</h2>
            {loading ? (
                <div className="flex justify-center items-center">
                    <p>Loading...</p>
                </div>
            ) : (
                <div className="flex overflow-x-auto space-x-4 scrollbar-hide py-4">
                    {newAnimes.map((anime, index) => (
                        <div key={`${anime.title}-${index}`} className="flex-shrink-0">
                            <AnimeCard anime={anime} handleAnimeClick={handleAnimeClick} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default NewAnimeCarousel;
