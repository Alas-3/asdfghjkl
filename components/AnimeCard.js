import React from 'react';

export const createAnimeUrlSlug = (title) => {
  return title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/(\d)\.(\d)/g, '$1-$2')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
};

export const truncateTitle = (title, maxLength) => {
  return title.length > maxLength ? title.slice(0, maxLength) + '...' : title;
};

const AnimeCard = ({ anime, handleAnimeClick }) => {
  const { imageUrl, title, episode } = anime; // Destructure anime properties

  return (
    <div
      className="flex justify-center"
      onClick={() => handleAnimeClick(anime)}
    >
      <div className="card bg-base-100 shadow-lg cursor-pointer relative transition-transform transform hover:scale-105 hover:shadow-xl rounded-lg overflow-hidden" style={{ width: '200px' }}>
        <figure className="h-64 w-full overflow-hidden relative rounded-t-lg">
          <img src={imageUrl} alt={`Image of ${title}`} className="object-cover h-full w-full" />
          <div className="absolute bottom-0 w-full bg-gradient-to-b from-transparent via-black/70 to-black p-2">
            <h2 className="text-white text-lg font-bold">{truncateTitle(title, 20)}</h2>
            <h3 className="text-sm text-gray-300">{episode}</h3>
          </div>
        </figure>
      </div>
    </div>
  );
};

export default AnimeCard;
