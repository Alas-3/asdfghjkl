// pages/api/scrapeAnimeDetails.js

import { scrapeAnimeDetails } from '../../lib/scrape'; // Adjust the path accordingly

export default async function handler(req, res) {
    const { url } = req.query;

    if (!url) {
        return res.status(400).json({ error: 'No URL provided' });
    }

    try {
        const details = await scrapeAnimeDetails(url);
        return res.status(200).json(details);
    } catch (error) {
        console.error('Error in API route:', error);
        return res.status(500).json({ error: 'Failed to scrape anime details' });
    }
}
