/**
 * Coffee-themed AI personality for SlideCoffee
 * Makes the experience delightful and encouraging
 */

export const coffeeMessages = {
  welcome: [
    "Hey! ☕ I'm here to help you create an amazing presentation. What would you like to build today?",
    "Welcome! ☕ Ready to brew something amazing? Tell me about your presentation idea!",
    "Hi there! ☕ Let's create something incredible together. What's your topic?",
  ],

  thinking: [
    "Let me think about that... ☕",
    "Hmm, interesting! Give me a moment... ☕",
    "Processing that... ☕",
    "One sec while I brew up some ideas... ☕",
  ],

  generating: [
    "Brewing your presentation... ☕",
    "Steaming fresh slides coming up! ☕",
    "Let's espresso your ideas! ☕",
    "Percolating your content... ☕",
    "Crafting your slides with care... ☕",
  ],

  progress: {
    25: [
      "☕ Brewing slide content...",
      "☕ Adding that perfect blend...",
      "☕ Warming up the slides...",
    ],
    50: [
      "🎨 Applying your brand style...",
      "🎨 Making it look beautiful...",
      "🎨 Adding visual polish...",
    ],
    75: [
      "✨ Adding final touches...",
      "✨ Almost done, this is looking great!",
      "✨ Putting on the finishing touches...",
    ],
    100: [
      "🎉 All done! Your presentation is ready!",
      "✅ Complete! That turned out amazing!",
      "🌟 Finished! This looks fantastic!",
    ]
  },

  encouragement: [
    "That's a great topic!",
    "I love where this is going!",
    "Excellent choice!",
    "This is going to be amazing!",
    "Perfect! Let's make this happen!",
  ],

  planReady: [
    "I've created a presentation plan for you!",
    "Here's what I'm thinking for your slides!",
    "Check out this structure I've put together!",
    "I've brewed up a plan for your presentation!",
  ],

  editPlan: [
    "What would you like to change about the plan?",
    "No problem! What adjustments should we make?",
    "Sure thing! How should we modify this?",
    "Let's refine this together. What needs changing?",
  ],

  complete: [
    "All done! Your presentation is ready. You can view it in the preview panel on the right. ✨",
    "Finished! Your slides are looking great. Check them out in the preview! ✨",
    "Complete! I think you're going to love how this turned out. ✨",
    "That's a wrap! Your presentation is ready to impress. ✨",
  ],

  error: [
    "Oops! Something went wrong. Let's try that again. ☕",
    "Hmm, hit a snag there. Mind if we give it another shot? ☕",
    "Sorry about that! Let's brew this again. ☕",
  ],

  tooManySlides: [
    "That's a latte slides! 😄 Are you sure you need that many?",
    "Whoa, that's quite a presentation! Maybe we could condense it a bit?",
    "That's a lot to cover! Want to focus on the key points?",
  ],

  suggestions: {
    addSpeakerNotes: "Want me to add speaker notes to help with your delivery?",
    findImages: "I can find relevant images for your slides. Interested?",
    addNextSteps: "Most people add a 'Next Steps' slide here. Want me to include one?",
    addQA: "Should we add a Q&A slide at the end?",
    addTeamSlide: "Want to include a slide about your team?",
  }
};

export function getRandomMessage(messages: string[]): string {
  return messages[Math.floor(Math.random() * messages.length)];
}

export function getProgressMessage(progress: number): string {
  if (progress < 25) return "";
  if (progress < 50) return getRandomMessage(coffeeMessages.progress[25]);
  if (progress < 75) return getRandomMessage(coffeeMessages.progress[50]);
  if (progress < 100) return getRandomMessage(coffeeMessages.progress[75]);
  return getRandomMessage(coffeeMessages.progress[100]);
}

export function getCelebrationLevel(slideCount: number): "small" | "medium" | "large" {
  if (slideCount <= 5) return "small";
  if (slideCount <= 15) return "medium";
  return "large";
}

export function triggerCelebration(level: "small" | "medium" | "large" = "medium") {
  const confetti = (window as any).confetti;
  if (!confetti) return;

  switch (level) {
    case "small":
      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.6 }
      });
      break;

    case "medium":
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      break;

    case "large":
      // Multiple bursts for large celebrations
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);
      break;
  }
}

