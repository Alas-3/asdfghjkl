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
