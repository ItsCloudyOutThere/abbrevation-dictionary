import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const abbreviations = await kv.get('abbreviations') || [];
      res.status(200).json(abbreviations);
    } catch (error) {
      console.error('Error fetching abbreviations:', error);
      res.status(500).json({ error: 'Failed to fetch abbreviations' });
    }
  } else if (req.method === 'POST') {
    try {
      const { abbreviations } = req.body;
      await kv.set('abbreviations', abbreviations);
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error saving abbreviations:', error);
      res.status(500).json({ error: 'Failed to save abbreviations' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}