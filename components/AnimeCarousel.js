// components/AnimeCarousel.js
import { useEffect, useState } from 'react';
import { scrapePopularAiringAnimes } from '../lib/scrape'; // Adjust the path accordingly
import AnimeCard from './AnimeCard'; // Import your AnimeCard component
import { useRouter } from 'next/router'; // Import Next.js router

const AnimeCarousel = () => {
    const [popularAnimes, setPopularAnimes] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter(); // Initialize router

    useEffect(() => {
        const fetchPopularAnimes = async () => {
            const animes = await scrapePopularAiringAnimes();
            setPopularAnimes(animes);
            setLoading(false);
        };

        fetchPopularAnimes();
    }, []);

    // Define the handleAnimeClick function
    const handleAnimeClick = (anime) => {
        console.log('Anime clicked:', anime);
        const urlSlug = anime.urlSlug; // Use the slug you created
        router.push(`/anime/${urlSlug}`); // Navigate to the anime details page
    };

    return (
        <div className="mb-6">
            <h2 className="text-2xl mb-4">Popular Airing Animes</h2>
            {loading ? (
                <div className="flex justify-center items-center">
                    <p>Loading...</p>
                </div>
            ) : (
                <div className="flex overflow-x-auto space-x-4 scrollbar-hide py-4">
                    {popularAnimes.map((anime) => (
                        // Pass handleAnimeClick as a prop to AnimeCard
                        <div key={anime.urlSlug} className="flex-shrink-0">
                            <AnimeCard anime={anime} handleAnimeClick={handleAnimeClick} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AnimeCarousel;
