// API client for Netlify functions

export async function sendChatMessage(messages: Array<{ role: string; content: string }>, presentationContext?: any) {
  const response = await fetch('/.netlify/functions/ai-chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messages,
      presentationContext
    })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to send message')
  }

  return response.json()
}

export async function generateSlides(plan: any, brand?: any) {
  const response = await fetch('/.netlify/functions/generate-slides', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      plan,
      brand
    })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to generate slides')
  }

  return response.json()
}

