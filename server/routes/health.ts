import { Router } from 'express';

const router = Router();

router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'SlideCoffee API',
    version: '2.0.0'
  });
});

export { router as healthRouter };

