// jikan.js
import axios from 'axios';

const JIKAN_API_BASE_URL = 'https://api.jikan.moe/v4';

export const getAnimeSchedule = async (day) => {
  try {
    const response = await axios.get(`${JIKAN_API_BASE_URL}/schedules/${day}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching anime schedule:', error);
    throw error;
  }
};

export const getMalId = async (title) => {
  try {
    const response = await axios.get(`${JIKAN_API_BASE_URL}/anime?q=${encodeURIComponent(title)}&limit=1`);
    if (response.data && response.data.data && response.data.data.length > 0) {
      return response.data.data[0].mal_id;
    }
    return null;
  } catch (error) {
    console.error('Error fetching mal_id:', error);
    return null;
  }
};

export const getJikanAnimeDetails = async (malId) => {
  try {
    const response = await axios.get(`${JIKAN_API_BASE_URL}/anime/${malId}/full`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching anime details:', error);
    return null;
  }
};