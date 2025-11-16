import { Handler } from '@netlify/functions'

const MANUS_API_URL = process.env.BUILT_IN_FORGE_API_URL || ''
const MANUS_API_KEY = process.env.BUILT_IN_FORGE_API_KEY || ''

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  try {
    const { plan, brand } = JSON.parse(event.body || '{}')

    if (!plan) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Presentation plan is required' })
      }
    }

    // Generate slides using Manus LLM API
    const response = await fetch(`${MANUS_API_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MANUS_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gemini-2.0-flash-exp',
        messages: [
          {
            role: 'system',
            content: `You are a professional presentation designer. Generate detailed slide content based on the provided plan.

For each slide, provide:
- Title
- Content (bullet points, paragraphs, or structured data)
- Layout type (title, content, two-column, image-text, etc.)
- Design notes

${brand ? `Apply these brand guidelines:\n- Primary Color: ${brand.primary_color}\n- Secondary Color: ${brand.secondary_color}\n- Font Heading: ${brand.font_heading}\n- Font Body: ${brand.font_body}` : ''}

Return the slides as a JSON array.`
          },
          {
            role: 'user',
            content: `Generate slides for this presentation plan:\n\n${JSON.stringify(plan, null, 2)}`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: 'json_object' }
      })
    })

    if (!response.ok) {
      throw new Error(`Manus API error: ${response.statusText}`)
    }

    const data = await response.json()
    const slidesContent = data.choices[0]?.message?.content || '{}'
    const slides = JSON.parse(slidesContent)

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        slides: slides.slides || [],
        usage: data.usage
      })
    }
  } catch (error) {
    console.error('Slide Generation Error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to generate slides',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
}

