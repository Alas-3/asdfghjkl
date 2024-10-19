import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { createAnimeUrlSlug } from "./AnimeCard";
import { useSwipeable } from "react-swipeable";

const HeroBanner = ({ animes }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % (animes.length || 1));
    }, 10000);
    return () => clearInterval(interval);
  }, [animes.length]);

  const handleClick = () => {
    const anime = animes[currentIndex];
    const urlSlug = createAnimeUrlSlug(anime.title);
    router.push(`/anime/${urlSlug}`);
  };

  const handleSwipedLeft = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % (animes.length || 1));
  };

  const handleSwipedRight = () => {
    setCurrentIndex(
      (prevIndex) =>
        (prevIndex - 1 + (animes.length || 1)) % (animes.length || 1)
    );
  };

  const handlers = useSwipeable({
    onSwipedLeft: handleSwipedLeft,
    onSwipedRight: handleSwipedRight,
  });

  if (!animes || animes.length === 0) {
    return null;
  }

  const { title, imageUrl } = animes[currentIndex] || {};

  return (
    <div
      className="relative w-full h-[calc(90vh-5rem)] md:h-[32rem] lg:h-[40rem] overflow-hidden"
      {...handlers}
    >
      <div className="absolute inset-0 bg-gray-900 opacity-50"></div>
      <img
        src={imageUrl}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover object-center transform transition-transform duration-500 ease-in-out scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/70 to-transparent"></div>
      <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8 lg:p-12">
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight">
          {title}
        </h1>
        <button
          onClick={handleClick}
          className="bg-transparent border-2 border-red-600 text-red-600 font-semibold py-3 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 hover:bg-red-600 hover:text-white backdrop-filter backdrop-blur-lg bg-opacity-20"
        >
          Watch Now
        </button>
      </div>
    </div>
  );
};

export default HeroBanner;
