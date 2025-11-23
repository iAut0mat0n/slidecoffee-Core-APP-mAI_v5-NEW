import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { aiChatRouter } from './routes/ai-chat.js';
import { aiChatStreamRouter } from './routes/ai-chat-stream.js';
import { generateSlidesRouter } from './routes/generate-slides.js';
import { healthRouter } from './routes/health.js';
import { systemSettingsRouter } from './routes/system-settings.js';
import { brandsRouter } from './routes/brands.js';
import { projectsRouter } from './routes/projects.js';
import { templatesWorkspacesRouter } from './routes/templates-workspaces.js';
import { authRouter } from './routes/auth.js';
import stripeRouter from './routes/stripe.js';
import stripeWebhookRouter from './routes/stripe-webhook.js';
import { adminRouter } from './routes/admin.js';
import { presentationsRouter } from './routes/presentations.js';
import { userContextRouter } from './routes/user-context.js';
import supportTicketsRouter from './routes/support-tickets.js';
import usageRouter from './routes/usage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.BACKEND_PORT || '3001', 10);

// CORS configuration
const allowedOrigins = [
  'http://localhost:5000',
  'http://0.0.0.0:5000',
  'https://app.slidecoffee.ai',
  /\.replit\.dev$/,
  /\.repl\.co$/,
  /\.netlify\.app$/,
  /\.onrender\.com$/,
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') {
        return origin === allowed;
      }
      return allowed.test(origin);
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Stripe webhook MUST use raw body for signature verification
app.use('/api', stripeWebhookRouter);

// Regular JSON parsing for all other routes
app.use(express.json());

// API routes (matching Netlify Functions paths)
app.use('/api', stripeRouter);
app.use('/api', aiChatRouter);
app.use('/api', aiChatStreamRouter);
app.use('/api', generateSlidesRouter);
app.use('/api', healthRouter);
app.use('/api', systemSettingsRouter);
app.use('/api', brandsRouter);
app.use('/api', projectsRouter);
app.use('/api', templatesWorkspacesRouter);
app.use('/api', authRouter);
app.use('/api', adminRouter);
app.use('/api', presentationsRouter);
app.use('/api', userContextRouter);
app.use('/api/support-tickets', supportTicketsRouter);
app.use('/api/usage', usageRouter);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const publicPath = path.resolve(__dirname, '../dist');
  app.use(express.static(publicPath));
  
  // SPA fallback - serve index.html for all non-API routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
  });
}

app.listen(PORT, 'localhost', () => {
  console.log(`🚀 Server running on localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});

