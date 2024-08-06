import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createAnimeUrlSlug } from './AnimeCard';
import { useSwipeable } from 'react-swipeable';

const HeroBanner = ({ animes }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % animes.length);
    }, 10000); // Change image every 10 seconds
    return () => clearInterval(interval);
  }, [animes.length]);

  const handleClick = () => {
    const anime = animes[currentIndex];
    const urlSlug = createAnimeUrlSlug(anime.title);
    router.push(`/anime/${urlSlug}`);
  };

  const handleSwipedLeft = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % animes.length);
  };

  const handleSwipedRight = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + animes.length) % animes.length);
  };

  const handlers = useSwipeable({
    onSwipedLeft: handleSwipedLeft,
    onSwipedRight: handleSwipedRight,
  });

  if (animes.length === 0) {
    return null;
  }

  const { title, imageUrl } = animes[currentIndex];

  return (
    <div className="relative w-full cursor-pointer lg:rounded-t-lg" onClick={handleClick} {...handlers}>
      <div className="hero-banner h-[calc(90vh-3rem)] md:h-[32rem] lg:h-[40rem] w-[calc(100%+3rem)] lg:w-full relative overflow-hidden lg:rounded-t-lg -mx-8 lg:mx-0 -mt-16 lg:mt-0">
        <img
          src={imageUrl}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover object-center transform transition-transform duration-500 ease-in-out hover:scale-105 lg:rounded-t-lg"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent lg:rounded-t-lg"></div>
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-8 lg:p-12 text-white">
          <h1 className="text-2xl pl-2 md:text-3xl lg:text-4xl font-bold">{title}</h1>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
