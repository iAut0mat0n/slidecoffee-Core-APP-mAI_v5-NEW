# API Configuration Guide

## Required Environment Variables

To enable AI-powered slide generation, you need to configure the following environment variables:

### AI API Configuration

Add these to your environment configuration:

```bash
# AI API Endpoint (default: https://api.manus.ai)
AI_API_URL=https://api.manus.ai

# AI API Key (required)
# Get your API key from: https://manus.im/settings/api
AI_API_KEY=your_api_key_here
```

## How to Get Your API Key

1. Visit [https://manus.im/settings/api](https://manus.im/settings/api)
2. Generate a new API key
3. Copy the key and add it to your environment variables

## Testing the Integration

Once configured, the AI agent will:

1. **Research & Analysis**: Conduct thorough research on the presentation topic
2. **Create a Plan**: Generate a detailed outline with slide structure
3. **Human-in-the-Loop**: Present the plan for user approval
4. **Generate Slides**: Create professional, strategic slides based on approved plan
5. **Iterative Editing**: Allow users to request changes via chat

## API Features Used

- **Task Creation**: POST /v1/tasks
- **Agent Mode**: Full autonomous agent with research capabilities
- **Quality Profile**: High-quality output suitable for executive presentations
- **Multi-turn Conversations**: Continue conversations with taskId parameter
- **Webhooks**: (Optional) Real-time updates on task progress

## Cost Considerations

- Each presentation generation creates a new task
- Continuing conversations reuse the same task
- Monitor your API usage at: https://manus.im/settings/billing

## Alternative: Mock Mode for Development

If you want to test without API keys, you can implement a mock mode:

1. Set `AI_API_KEY=mock` in your environment
2. Update `server/aiAgent.ts` to return mock responses when in mock mode
3. This allows frontend development without API costs

## Troubleshooting

### Error: "AI_API_KEY not configured"
- Make sure you've added the API key to your environment variables
- Restart the development server after adding environment variables

### Error: "AI API error: 401 Unauthorized"
- Your API key is invalid or expired
- Generate a new API key from the settings page

### Error: "AI API error: 429 Too Many Requests"
- You've exceeded your API rate limit
- Wait a few minutes or upgrade your plan

## Security Notes

- **Never commit API keys to version control**
- Use environment variables for all sensitive credentials
- Rotate API keys regularly
- Use different keys for development and production

