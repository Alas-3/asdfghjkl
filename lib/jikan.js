import axios from 'axios';

const JIKAN_API_BASE_URL = 'https://api.jikan.moe/v4';

// Helper function for delay (throttling)
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Function to get anime schedule for a specific day
export const getAnimeSchedule = async (day) => {
  try {
    const response = await axios.get(`${JIKAN_API_BASE_URL}/schedules/${day}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching anime schedule:', error);
    throw error;
  }
};

// Function to get MAL ID based on anime title with retry logic
export const getMalId = async (title, retryCount = 3) => {
  try {
    // Implement a delay to prevent hitting rate limits
    await delay(1000); // 1 second delay before making the request

    const response = await axios.get(`${JIKAN_API_BASE_URL}/anime?q=${encodeURIComponent(title)}&limit=1`);
    if (response.data && response.data.data && response.data.data.length > 0) {
      return response.data.data[0].mal_id;
    }
    return null;
  } catch (error) {
    if (error.response && error.response.status === 429 && retryCount > 0) {
      console.warn('Rate limit exceeded, retrying...');
      await delay(2000); // Wait 2 seconds before retrying
      return getMalId(title, retryCount - 1); // Retry the request
    }
    console.error('Error fetching mal_id:', error);
    return null;
  }
};

// Function to get full anime details by MAL ID
export const getJikanAnimeDetails = async (malId) => {
  try {
    // Implement a delay to prevent hitting rate limits
    await delay(1000); // 1 second delay before making the request

    const response = await axios.get(`${JIKAN_API_BASE_URL}/anime/${malId}/full`);
    return response.data.data;
  } catch (error) {
    if (error.response && error.response.status === 429) {
      console.warn('Rate limit exceeded while fetching anime details.');
      await delay(2000); // Wait 2 seconds before retrying
      return getJikanAnimeDetails(malId); // Retry the request
    }
    console.error('Error fetching anime details:', error);
    return null;
  }
};
