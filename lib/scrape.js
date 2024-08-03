import axios from 'axios';
import cheerio from 'cheerio';

// Function to scrape popular animes
export async function scrapePopularAnimes() {
    try {
        const { data } = await axios.get('https://gogoanime3.co/');
        const $ = cheerio.load(data);

        const animes = [];
        $('.items li').each((index, element) => {
            // Get the title from the text inside the <a> tag
            const title = $(element).find('.name a').text().trim();
            const imageUrl = $(element).find('.img a img').attr('src');
            const link = $(element).find('.img a').attr('href');
            const episode = $(element).find('.episode').text().trim();
            animes.push({ title, imageUrl, episode, link });
        });

        return animes;
    } catch (error) {
        console.error('Error scraping popular animes:', error);
        return [];
    }
}

// New function to scrape anime by search query
export async function searchAnime(query) {
    try {
        const { data } = await axios.get(`https://gogoanime3.co/search.html?keyword=${encodeURIComponent(query)}`);
        const $ = cheerio.load(data);

        const animes = [];
        $('.items li').each((index, element) => {
            // Get the title from the text inside the <a> tag
            const title = $(element).find('.name a').text().trim();
            const imageUrl = $(element).find('.img a img').attr('src');
            const link = $(element).find('.img a').attr('href');
            const episode = $(element).find('.episode').text().trim();
            animes.push({ title, imageUrl, episode, link });
        });

        return animes;
    } catch (error) {
        console.error('Error searching anime:', error);
        return [];
    }
}

// Function to scrape anime details including episodes
export async function scrapeAnimeDetails(url) {
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        const title = $('.anime_info_body_bg h1').text().trim();
        const imageUrl = $('.anime_info_body_bg img').attr('src');
        const description = $('.description').text().trim();
        const genres = [];
        $('.anime_info_body_bg .type').each((index, element) => {
            const genre = $(element).text().trim().split(':')[1];
            if (genre) genres.push(genre);
        });

        const status = $('.anime_info_body_bg .type:contains("Status")').text().trim().split(':')[1].trim();

        const episodes = [];
        const episodeEnd = $('#episode_page a.active').attr('ep_end');
        const totalEpisodes = episodeEnd ? parseInt(episodeEnd) : 0;

        // Function to format the title for the URL
        const formatTitleForUrl = (title) => {
            return title
                .toLowerCase() // Convert to lowercase
                .normalize('NFD') // Normalize to decompose accented characters
                .replace(/[\u0300-\u036f]/g, '') // Remove diacritical marks
                .replace(/(\d)\.(\d)/g, '$1-$2') // Replace periods in numeric sequences with hyphens
                .replace(/[:]/g, '') // Remove colons
                .replace(/\s+/g, '-') // Replace spaces with hyphens
                .replace(/--+/g, '-') // Remove duplicate hyphens
                .replace(/-+$/, ''); // Remove trailing hyphens
        };

        for (let episodeNumber = 1; episodeNumber <= totalEpisodes; episodeNumber++) {
            const formattedTitle = formatTitleForUrl(title); // Format the title
            const episodeLink = `https://gogoanime3.co/${formattedTitle}-episode-${episodeNumber}`; // Adjusted format
            const episodeTitle = `Episode ${episodeNumber}`;
            episodes.push({ title: episodeTitle, link: episodeLink });
        }

        return {
            title,
            imageUrl,
            description,
            genres,
            status,
            totalEpisodes,
            episodes,
        };
    } catch (error) {
        console.error('Error scraping anime details:', error);
        return null;
    }
}

// Function to scrape the video URL for a specific episode
export async function scrapeEpisodeVideoUrl(episodeLink) {
    try {
        const { data } = await axios.get(episodeLink);
        const $ = cheerio.load(data);

        // Extract the video URL from the iframe or the relevant element
        const videoUrl = $('.anime_video_body iframe').attr('src'); // Adjusted selector to grab the correct iframe

        return videoUrl || null;
    } catch (error) {
        console.error('Error scraping episode video URL:', error);
        return null;
    }
}

// Function to scrape popular airing animes
export async function scrapePopularAiringAnimes() {
    try {
        const { data } = await axios.get('https://gogoanime3.co/popular.html'); // Change the URL to the popular anime page
        const $ = cheerio.load(data);

        const animes = [];
        $('.last_episodes .items li').each((index, element) => {
            const title = $(element).find('.name a').attr('title').trim(); // Extract title
            const imageUrl = $(element).find('.img img').attr('src'); // Extract image URL

            // Check if title and image URL are valid
            if (title && imageUrl) {
                const urlSlug = createAnimeUrlSlug(title); // Create the slug
                animes.push({ title, imageUrl, urlSlug });
            }
        });

        return animes;
    } catch (error) {
        console.error('Error scraping popular airing animes:', error);
        return [];
    }
}

// Function to scrape new anime from the current season
export async function scrapeNewAnimeThisSeason() {
    try {
        const { data } = await axios.get('https://gogoanime3.co/new-season.html');
        const $ = cheerio.load(data);

        const newAnimes = [];
        $('.last_episodes .items li').each((index, element) => {
            const title = $(element).find('.name a').attr('title').trim();
            const imageUrl = $(element).find('.img img').attr('src');
            const link = `https://gogoanime3.co${$(element).find('.name a').attr('href')}`;

            if (title && imageUrl) {
                const urlSlug = createAnimeUrlSlug(title); // Create the slug here
                newAnimes.push({ title, imageUrl, urlSlug }); // Include urlSlug in the pushed object
            }
        });

        return newAnimes;
    } catch (error) {
        console.error('Error scraping new anime this season:', error);
        return [];
    }
}




// Function to create a URL slug for the anime title
export const createAnimeUrlSlug = (title) => {
    return title
        .toLowerCase() // Convert to lowercase
        .normalize('NFD') // Normalize to decompose accented characters
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritical marks
        .replace(/[^a-z0-9]+/g, '-') // Replace spaces and special characters with hyphens
        .replace(/-+$/, ''); // Remove trailing hyphens
};
