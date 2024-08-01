import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { scrapeAnimeDetails, scrapeEpisodeVideoUrl } from '../../lib/scrape';
import VideoPlayer from '../../components/VideoPlayer';

export default function AnimeDetails() {
    const router = useRouter();
    const { id } = router.query; 
    const [anime, setAnime] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedEpisodeUrl, setSelectedEpisodeUrl] = useState(null);

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

    const handleEpisodeClick = async (episode) => {
        const videoUrl = await scrapeEpisodeVideoUrl(episode.link); // Get the video URL
        setSelectedEpisodeUrl(videoUrl);
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    if (!anime) {
        return <p>Anime not found.</p>;
    }

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-4xl mb-4">{anime.title}</h1>
            <img src={anime.imageUrl} alt={anime.title} className="mb-4" />
            <p className="text-lg">{anime.description}</p>
            <p className="font-bold">Genres: {anime.genres.join(', ')}</p>
            <p className="font-bold">Status: {anime.status}</p>
            <p className="font-bold">Total Episodes: {anime.totalEpisodes}</p>
            <h2 className="text-2xl mb-2">Episodes</h2>
            {anime.episodes.length > 0 ? (
                <ul>
                    {anime.episodes.map((episode, index) => (
                        <li key={index} className="my-2">
                            <button onClick={() => handleEpisodeClick(episode)} className="text-blue-500">
                                {episode.title}
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No episodes found.</p>
            )}
            <button onClick={() => router.back()} className="btn btn-secondary mt-4">Back</button>

            {/* Display Video Player */}
            {selectedEpisodeUrl && (
                <div className="mt-4">
                    <iframe 
                        src={selectedEpisodeUrl} 
                        className="w-full h-[600px]" 
                        frameBorder="0" 
                        allowFullScreen 
                    ></iframe>
                </div>
            )}
        </div>
    );
}
