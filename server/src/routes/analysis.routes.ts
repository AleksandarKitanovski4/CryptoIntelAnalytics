import { Router } from 'express';
import { AnalysisService } from '../services/analysis.service';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const analysisService = new AnalysisService();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Get market analysis for a specific coin and timeframe
router.get('/analyze/:coinSymbol/:timeframe', async (req, res) => {
  try {
    const { coinSymbol, timeframe } = req.params;
    
    // Validate inputs
    if (!coinSymbol || !timeframe) {
      return res.status(400).json({ error: 'Coin symbol and timeframe are required' });
    }

    // Get analysis
    const analysis = await analysisService.analyzeMarket(coinSymbol, timeframe);
    
    res.json(analysis);
  } catch (error) {
    console.error('Analysis route error:', error);
    res.status(500).json({ error: 'Failed to analyze market data' });
  }
});

// Get historical analysis accuracy
router.get('/accuracy', async (req, res) => {
  try {
    const { coinSymbol, timeframe, startDate, endDate } = req.query;
    
    // TODO: Implement historical accuracy tracking
    res.json({
      totalPredictions: 0,
      correctPredictions: 0,
      accuracy: 0,
      byTimeframe: {},
      byCoin: {}
    });
  } catch (error) {
    console.error('Accuracy route error:', error);
    res.status(500).json({ error: 'Failed to fetch accuracy data' });
  }
});

export default router; 