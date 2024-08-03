// components/NewAnimeCarousel.js
import { useEffect, useState } from 'react';
import { scrapeNewAnimeThisSeason } from '../lib/scrape'; // Adjust the path accordingly
import AnimeCard from './AnimeCard'; // Import your AnimeCard component
import { useRouter } from 'next/router'; // Import Next.js router

const NewAnimeCarousel = () => {
    const [newAnimes, setNewAnimes] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter(); // Initialize router

    useEffect(() => {
        const fetchNewAnimes = async () => {
            const animes = await scrapeNewAnimeThisSeason(); // Scrape new anime
            setNewAnimes(animes);
            setLoading(false);
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
