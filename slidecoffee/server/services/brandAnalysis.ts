import { invokeLLM } from "../_core/llm";

/**
 * Brand Analysis Service
 * Extracts brand elements from uploaded PowerPoint and PDF files
 */

export interface BrandAnalysisResult {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fonts: string[];
  tone?: string;
  description?: string;
  confidence: number;
}

/**
 * Analyze uploaded brand file (PowerPoint or PDF)
 * Uses AI to extract colors, fonts, and brand identity
 */
export async function analyzeBrandFile(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<BrandAnalysisResult> {
  // For now, return mock data
  // TODO: Implement actual file parsing with python-pptx or pdf-parse
  
  const isPowerPoint = mimeType.includes("presentation") || fileName.endsWith(".pptx") || fileName.endsWith(".ppt");
  const isPDF = mimeType === "application/pdf" || fileName.endsWith(".pdf");
  
  if (!isPowerPoint && !isPDF) {
    throw new Error("Unsupported file type. Please upload PowerPoint (.pptx) or PDF files.");
  }
  
  // Mock analysis - in production, this would:
  // 1. Parse PowerPoint slides to extract colors from shapes/backgrounds
  // 2. Extract fonts from text elements
  // 3. Use OCR on PDFs to extract text
  // 4. Use LLM to analyze brand tone and personality
  
  const brandName = fileName.replace(/\.(pptx|pdf|ppt)$/i, "");
  
  return {
    name: brandName,
    primaryColor: "#1E40AF", // Blue
    secondaryColor: "#7C3AED", // Purple
    accentColor: "#059669", // Green
    fonts: ["Helvetica", "Arial", "Georgia"],
    tone: "Professional and authoritative",
    description: `Brand extracted from ${fileName}`,
    confidence: 0.85,
  };
}

/**
 * Use LLM to analyze brand description and suggest colors/fonts
 */
export async function analyzeBrandDescription(
  brandName: string,
  description: string,
  industry?: string
): Promise<BrandAnalysisResult> {
  const prompt = `You are a brand identity expert. Analyze this brand and suggest a color palette and typography.

Brand Name: ${brandName}
Description: ${description}
${industry ? `Industry: ${industry}` : ""}

Provide:
1. Primary color (hex code)
2. Secondary color (hex code)
3. Accent color (hex code)
4. 2-3 font suggestions
5. Brand tone/personality (one sentence)

Format your response as JSON:
{
  "primaryColor": "#XXXXXX",
  "secondaryColor": "#XXXXXX",
  "accentColor": "#XXXXXX",
  "fonts": ["Font1", "Font2"],
  "tone": "Description of brand personality"
}`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "You are a brand identity expert. Always respond with valid JSON." },
        { role: "user", content: prompt }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "brand_analysis",
          strict: true,
          schema: {
            type: "object",
            properties: {
              primaryColor: { type: "string", description: "Hex color code for primary brand color" },
              secondaryColor: { type: "string", description: "Hex color code for secondary brand color" },
              accentColor: { type: "string", description: "Hex color code for accent brand color" },
              fonts: { 
                type: "array", 
                items: { type: "string" },
                description: "List of 2-3 recommended fonts"
              },
              tone: { type: "string", description: "One sentence describing brand personality" }
            },
            required: ["primaryColor", "secondaryColor", "accentColor", "fonts", "tone"],
            additionalProperties: false
          }
        }
      }
    });

    const content = response.choices[0].message.content;
    if (!content || typeof content !== 'string') {
      throw new Error("No response from LLM");
    }

    const analysis = JSON.parse(content);

    return {
      name: brandName,
      primaryColor: analysis.primaryColor,
      secondaryColor: analysis.secondaryColor,
      accentColor: analysis.accentColor,
      fonts: analysis.fonts,
      tone: analysis.tone,
      description,
      confidence: 0.9,
    };
  } catch (error) {
    console.error("[Brand Analysis] LLM analysis failed:", error);
    
    // Fallback to default colors
    return {
      name: brandName,
      primaryColor: "#3B82F6",
      secondaryColor: "#8B5CF6",
      accentColor: "#10B981",
      fonts: ["Inter", "Georgia"],
      tone: "Professional and modern",
      description,
      confidence: 0.5,
    };
  }
}

/**
 * Conversational brand building - AI asks questions and builds brand profile
 */
export async function conversationalBrandBuilding(
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }>,
  userMessage: string
): Promise<{ response: string; brandData?: Partial<BrandAnalysisResult> }> {
  const systemPrompt = `You are a friendly brand consultant helping users create their brand profile for SlideCoffee, an AI presentation tool.

Your goal is to:
1. Ask about their brand name
2. Understand their industry and target audience
3. Learn about their brand personality
4. Suggest appropriate colors and fonts
5. Build a complete brand profile

Be conversational, friendly, and helpful. Ask one question at a time. When you have enough information, provide a brand recommendation.

Keep responses concise (2-3 sentences max).`;

  try {
    const messages = [
      { role: "system" as const, content: systemPrompt },
      ...conversationHistory,
      { role: "user" as const, content: userMessage }
    ];

    const response = await invokeLLM({ messages });

    const content = response.choices[0].message.content;
    const assistantMessage = typeof content === 'string' ? content : "I'm here to help! Tell me about your brand.";

    // Check if we have enough info to suggest a brand
    const hasName = conversationHistory.some(m => m.role === "user" && m.content.length > 0);
    const hasDescription = conversationHistory.length >= 3;

    if (hasName && hasDescription) {
      // Extract brand name from first user message
      const brandName = conversationHistory.find(m => m.role === "user")?.content || "Your Brand";
      const description = conversationHistory.filter(m => m.role === "user").map(m => m.content).join(" ");

      const brandData = await analyzeBrandDescription(brandName, description);

      return {
        response: assistantMessage,
        brandData
      };
    }

    return {
      response: assistantMessage
    };
  } catch (error) {
    console.error("[Brand Analysis] Conversational building failed:", error);
    return {
      response: "I'm having trouble connecting right now. Could you tell me your brand name to get started?"
    };
  }
}

