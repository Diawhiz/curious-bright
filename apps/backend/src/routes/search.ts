import { Router, Request, Response } from 'express';
import { typesenseClient } from '../lib/typesense';
import { searchLimiter } from '../middleware/rateLimiter';

const router = Router();

// GET /search?q=foo&type=submission
router.get('/', searchLimiter, async (req: Request, res: Response) => {

  const { q, type } = req.query;
  
  if (!q) {
    return res.status(400).json({ error: 'Query parameter "q" is required' });
  }

  try {
    let results: any = {};
    const searchQuery = q as string;

    // Search specifically one type or multi-search all
    if (type === 'submission' || !type) {
      const submissions = await typesenseClient.collections('submissions').documents().search({
        q: searchQuery,
        query_by: 'title,description',
      });
      results.submissions = submissions.hits?.map(h => h.document) || [];
    }
    
    if (type === 'room' || !type) {
      const rooms = await typesenseClient.collections('rooms').documents().search({
        q: searchQuery,
        query_by: 'name,topic',
      });
      results.rooms = rooms.hits?.map(h => h.document) || [];
    }
    
    if (type === 'user' || !type) {
      const users = await typesenseClient.collections('users').documents().search({
        q: searchQuery,
        query_by: 'name,email',
      });
      results.users = users.hits?.map(h => h.document) || [];
    }

    res.json(results);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to execute search' });
  }
});

export default router;
