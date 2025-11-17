/**
 * AI Personality System
 * Adds warmth, encouragement, and personality to AI interactions
 */

export interface PersonalityMessage {
  content: string;
  tone: "encouraging" | "celebratory" | "thoughtful" | "friendly";
  emoji?: string;
}

/**
 * Get a personality-driven message for different stages of slide creation
 */
export function getPersonalityMessage(stage: string, context?: any): PersonalityMessage {
  const messages = {
    // Initial greeting
    greeting: [
      {
        content: "Hey there! 👋 I'm excited to help you create an amazing presentation. Tell me what you're working on, and I'll craft something that'll wow your audience!",
        tone: "friendly" as const,
        emoji: "👋",
      },
      {
        content: "Welcome! ✨ Ready to build something great together? Share your vision, and I'll help bring it to life with professional, impactful slides.",
        tone: "friendly" as const,
        emoji: "✨",
      },
    ],

    // Starting to work
    startingWork: [
      {
        content: "Perfect! ☕ Grab a coffee (or tea, I don't judge), and I'll get to work on this. I'm analyzing your requirements and crafting a strategic plan...",
        tone: "friendly" as const,
        emoji: "☕",
      },
      {
        content: "Love it! 🎯 Take a quick break while I work my magic. I'm thinking through the best way to structure this presentation...",
        tone: "friendly" as const,
        emoji: "🎯",
      },
      {
        content: "On it! 🚀 Go grab a latte, I'll have a strategic plan ready for you in just a moment. Thinking about the story we want to tell...",
        tone: "friendly" as const,
        emoji: "🚀",
      },
    ],

    // Analyzing and planning
    analyzing: [
      {
        content: "🤔 Hmm, interesting challenge... I'm thinking about the best narrative structure for your audience. This is going to be good!",
        tone: "thoughtful" as const,
        emoji: "🤔",
      },
      {
        content: "💭 Working through the strategy here... Considering what will resonate most with your audience and drive your message home.",
        tone: "thoughtful" as const,
        emoji: "💭",
      },
    ],

    // Plan ready
    planReady: [
      {
        content: "✅ Alright, I've got a solid plan! Take a look at the structure I've outlined. I've thought carefully about the flow and messaging to make sure it hits all the right notes.",
        tone: "encouraging" as const,
        emoji: "✅",
      },
      {
        content: "🎨 Plan's ready! I've crafted a strategic outline that tells a compelling story. Review it and let me know if you want any tweaks before I start building the slides.",
        tone: "encouraging" as const,
        emoji: "🎨",
      },
    ],

    // Generating slides
    generatingSlides: [
      {
        content: "🎬 Here we go! I'm now creating your slides with professional layouts and compelling content. This is the fun part...",
        tone: "encouraging" as const,
        emoji: "🎬",
      },
      {
        content: "✨ Bringing your presentation to life! I'm designing each slide to look sharp and communicate clearly. Almost there...",
        tone: "encouraging" as const,
        emoji: "✨",
      },
      {
        content: "🎯 Crafting your slides now... Each one is designed to make an impact. Your audience is going to love this!",
        tone: "encouraging" as const,
        emoji: "🎯",
      },
    ],

    // Slides complete
    slidesComplete: [
      {
        content: "🎉 Done! Your presentation is ready and looking fantastic. Check out the slides on the right – I think you're going to love them. Feel free to ask for any changes!",
        tone: "celebratory" as const,
        emoji: "🎉",
      },
      {
        content: "✨ Boom! Your slides are complete and ready to impress. Take a look at what we've created together. Want to tweak anything? Just let me know!",
        tone: "celebratory" as const,
        emoji: "✨",
      },
      {
        content: "🚀 All set! I've created a professional, polished presentation for you. Review the slides and let me know if you want any refinements. You've got this!",
        tone: "celebratory" as const,
        emoji: "🚀",
      },
    ],

    // Making edits
    makingEdits: [
      {
        content: "👍 Got it! I'm updating the slides based on your feedback. This is going to make it even better...",
        tone: "friendly" as const,
        emoji: "👍",
      },
      {
        content: "🔧 On it! Making those changes now. I love how we're refining this together...",
        tone: "friendly" as const,
        emoji: "🔧",
      },
    ],

    // Edits complete
    editsComplete: [
      {
        content: "✅ Changes applied! Check out the updated slides. Looking even better now, right?",
        tone: "encouraging" as const,
        emoji: "✅",
      },
      {
        content: "🎨 Updated! I've made those changes. Take a look and let me know if you want anything else adjusted.",
        tone: "encouraging" as const,
        emoji: "🎨",
      },
    ],

    // Encouragement during process
    encouragement: [
      {
        content: "💪 You're doing great! This presentation is shaping up to be really impactful.",
        tone: "encouraging" as const,
        emoji: "💪",
      },
      {
        content: "🌟 Love the direction we're taking this. Your audience is going to be impressed!",
        tone: "encouraging" as const,
        emoji: "🌟",
      },
      {
        content: "🎯 This is coming together beautifully. You have a clear vision, and I'm here to make it shine!",
        tone: "encouraging" as const,
        emoji: "🎯",
      },
    ],
  };

  const stageMessages = messages[stage as keyof typeof messages];
  if (!stageMessages || stageMessages.length === 0) {
    return {
      content: "Working on it...",
      tone: "friendly",
    };
  }

  // Return a random message from the stage
  const randomIndex = Math.floor(Math.random() * stageMessages.length);
  return stageMessages[randomIndex];
}

/**
 * Wrap AI-generated content with personality
 */
export function addPersonalityToMessage(content: string, stage: string): string {
  const personality = getPersonalityMessage(stage);
  return `${personality.emoji || ""} ${content}`;
}

/**
 * Get progress message based on current step
 */
export function getProgressMessage(step: "analyzing" | "planning" | "generating" | "finalizing"): string {
  const messages = {
    analyzing: [
      "🔍 Analyzing your requirements...",
      "🤔 Understanding your goals...",
      "💭 Thinking through the strategy...",
    ],
    planning: [
      "📋 Creating your presentation outline...",
      "🎯 Structuring the narrative...",
      "✏️ Planning the slide flow...",
    ],
    generating: [
      "🎨 Designing your slides...",
      "✨ Crafting compelling content...",
      "🎬 Bringing your presentation to life...",
    ],
    finalizing: [
      "🎉 Putting the finishing touches...",
      "✅ Almost there...",
      "🚀 Finalizing your presentation...",
    ],
  };

  const stepMessages = messages[step];
  const randomIndex = Math.floor(Math.random() * stepMessages.length);
  return stepMessages[randomIndex];
}

