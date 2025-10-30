// ============================================
// FILE 7: pages/api/pending.js
// ============================================
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const pending = await kv.get('pending-submissions') || [];
      res.status(200).json(pending);
    } catch (error) {
      console.error('Error fetching pending submissions:', error);
      res.status(500).json({ error: 'Failed to fetch pending submissions' });
    }
  } else if (req.method === 'POST') {
    try {
      const { pending } = req.body;
      await kv.set('pending-submissions', pending);
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error saving pending submissions:', error);
      res.status(500).json({ error: 'Failed to save pending submissions' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}