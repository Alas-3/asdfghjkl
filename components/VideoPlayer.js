// components/VideoPlayer.js
import React from 'react';

const VideoPlayer = ({ videoUrl }) => {
    return (
        <div className="my-4">
            <h3 className="text-2xl mb-2">Now Playing:</h3>
            <iframe
                src={videoUrl}
                allowFullScreen
                frameBorder="0"
                width="100%"
                height="500px"
            />
        </div>
    );
};

export default VideoPlayer;
