import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { setupAuth } from './replitAuth.js';
import { aiChatRouter } from './routes/ai-chat.js';
import { aiChatStreamRouter } from './routes/ai-chat-stream.js';
import { generateSlidesRouter } from './routes/generate-slides.js';
import { generateSlidesStreamRouter } from './routes/generate-slides-stream.js';
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
import { commentsRouter } from './routes/comments.js';
import brewsRouter from './routes/brews.js';
import { dbTestRouter } from './routes/db-test.js';
import { usersRouter } from './routes/users.js';
import templatesRouter from './routes/templates.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || process.env.BACKEND_PORT || '5000', 10);

// Setup Replit Auth (must be early, before other middleware)
await setupAuth(app);

// CORS configuration
const allowedOrigins = [
  'http://localhost:5000',
  'http://127.0.0.1:5000',
  'http://0.0.0.0:5000',
  'https://app.slidecoffee.ai',
  /\.replit\.dev$/,
  /\.repl\.co$/,
  /--5000\.id\.repl\.co$/, 
  /\.replit\.app$/,
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
      console.error('🚫 CORS rejected origin:', origin);
      console.error('📋 Allowed origins:', allowedOrigins.map(o => o.toString()));
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
app.use('/api', generateSlidesStreamRouter);
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
app.use('/api', commentsRouter);
app.use('/api', brewsRouter);
app.use('/api', dbTestRouter);
app.use('/api', usersRouter);
app.use('/api', templatesRouter);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  // Find dist folder - it's at the root of the project
  const publicPath = path.join(process.cwd(), 'dist');
  
  console.log(`📁 Serving static files from: ${publicPath}`);
  
  // Serve static files with correct MIME types
  app.use(express.static(publicPath, {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript');
      } else if (filePath.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css');
      } else if (filePath.endsWith('.png')) {
        res.setHeader('Content-Type', 'image/png');
      } else if (filePath.endsWith('.svg')) {
        res.setHeader('Content-Type', 'image/svg+xml');
      } else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
        res.setHeader('Content-Type', 'image/jpeg');
      }
    }
  }));
  
  // SPA fallback - serve index.html ONLY for routes that don't match files
  // This prevents /logo.png from being caught by the catch-all
  app.get('*', (req, res, next) => {
    // If the request is for a static file that doesn't exist, let it 404
    // Only serve index.html for actual page routes
    if (req.path.match(/\.(png|jpg|jpeg|gif|svg|css|js|ico|webp)$/)) {
      return res.status(404).send('File not found');
    }
    res.sendFile(path.join(publicPath, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on 0.0.0.0:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});

