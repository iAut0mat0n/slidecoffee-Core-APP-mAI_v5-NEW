/**
 * Context-aware AI suggestions based on presentation content
 */

export interface Suggestion {
  id: string;
  type: "add_slide" | "improve_content" | "change_layout" | "add_section";
  title: string;
  description: string;
  action: string;
  priority: "high" | "medium" | "low";
}

/**
 * Analyze presentation and generate smart suggestions
 */
export function generateSuggestions(params: {
  slides: any[];
  projectTitle: string;
  projectDescription?: string;
}): Suggestion[] {
  const { slides, projectTitle, projectDescription } = params;
  const suggestions: Suggestion[] = [];

  // Detect presentation type
  const presentationType = detectPresentationType(projectTitle, projectDescription);

  // Check for missing common slides based on type
  if (presentationType === "pitch_deck") {
    suggestions.push(...getPitchDeckSuggestions(slides));
  } else if (presentationType === "business_review") {
    suggestions.push(...getBusinessReviewSuggestions(slides));
  } else if (presentationType === "sales_presentation") {
    suggestions.push(...getSalesPresentationSuggestions(slides));
  }

  // General suggestions
  suggestions.push(...getGeneralSuggestions(slides));

  // Sort by priority
  return suggestions.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

/**
 * Detect presentation type from title and description
 */
function detectPresentationType(
  title: string,
  description?: string
): "pitch_deck" | "business_review" | "sales_presentation" | "general" {
  const text = `${title} ${description || ""}`.toLowerCase();

  if (
    text.includes("pitch") ||
    text.includes("investor") ||
    text.includes("funding") ||
    text.includes("startup")
  ) {
    return "pitch_deck";
  }

  if (
    text.includes("review") ||
    text.includes("qbr") ||
    text.includes("quarterly") ||
    text.includes("performance")
  ) {
    return "business_review";
  }

  if (
    text.includes("sales") ||
    text.includes("proposal") ||
    text.includes("demo") ||
    text.includes("product")
  ) {
    return "sales_presentation";
  }

  return "general";
}

/**
 * Suggestions for pitch decks
 */
function getPitchDeckSuggestions(slides: any[]): Suggestion[] {
  const suggestions: Suggestion[] = [];
  const slideTitles = slides.map((s) => s.title?.toLowerCase() || "");

  // Check for essential pitch deck slides
  if (!slideTitles.some((t) => t.includes("problem"))) {
    suggestions.push({
      id: "pitch_problem",
      type: "add_slide",
      title: "Add Problem Slide",
      description: "Pitch decks should clearly define the problem you're solving",
      action: "Add a slide explaining the problem your product addresses",
      priority: "high",
    });
  }

  if (!slideTitles.some((t) => t.includes("solution"))) {
    suggestions.push({
      id: "pitch_solution",
      type: "add_slide",
      title: "Add Solution Slide",
      description: "Show how your product solves the problem",
      action: "Add a slide showcasing your solution",
      priority: "high",
    });
  }

  if (!slideTitles.some((t) => t.includes("market") || t.includes("opportunity"))) {
    suggestions.push({
      id: "pitch_market",
      type: "add_slide",
      title: "Add Market Opportunity",
      description: "Investors want to see market size and potential",
      action: "Add a slide showing market size and opportunity",
      priority: "high",
    });
  }

  if (!slideTitles.some((t) => t.includes("traction") || t.includes("growth"))) {
    suggestions.push({
      id: "pitch_traction",
      type: "add_slide",
      title: "Add Traction Slide",
      description: "Show your progress and momentum",
      action: "Add a slide highlighting key metrics and traction",
      priority: "medium",
    });
  }

  if (!slideTitles.some((t) => t.includes("team"))) {
    suggestions.push({
      id: "pitch_team",
      type: "add_slide",
      title: "Add Team Slide",
      description: "Investors invest in people as much as ideas",
      action: "Add a slide introducing your team",
      priority: "medium",
    });
  }

  return suggestions;
}

/**
 * Suggestions for business reviews
 */
function getBusinessReviewSuggestions(slides: any[]): Suggestion[] {
  const suggestions: Suggestion[] = [];
  const slideTitles = slides.map((s) => s.title?.toLowerCase() || "");

  if (!slideTitles.some((t) => t.includes("executive") || t.includes("summary"))) {
    suggestions.push({
      id: "review_executive",
      type: "add_slide",
      title: "Add Executive Summary",
      description: "Start with a high-level overview",
      action: "Add an executive summary slide at the beginning",
      priority: "high",
    });
  }

  if (!slideTitles.some((t) => t.includes("kpi") || t.includes("metrics"))) {
    suggestions.push({
      id: "review_kpis",
      type: "add_slide",
      title: "Add KPIs & Metrics",
      description: "Show key performance indicators",
      action: "Add a slide with your key metrics",
      priority: "high",
    });
  }

  if (!slideTitles.some((t) => t.includes("next") || t.includes("action"))) {
    suggestions.push({
      id: "review_next_steps",
      type: "add_slide",
      title: "Add Next Steps",
      description: "End with clear action items",
      action: "Add a slide outlining next steps and actions",
      priority: "medium",
    });
  }

  return suggestions;
}

/**
 * Suggestions for sales presentations
 */
function getSalesPresentationSuggestions(slides: any[]): Suggestion[] {
  const suggestions: Suggestion[] = [];
  const slideTitles = slides.map((s) => s.title?.toLowerCase() || "");

  if (!slideTitles.some((t) => t.includes("benefit") || t.includes("value"))) {
    suggestions.push({
      id: "sales_benefits",
      type: "add_slide",
      title: "Add Benefits Slide",
      description: "Highlight the value proposition",
      action: "Add a slide showing key benefits and value",
      priority: "high",
    });
  }

  if (!slideTitles.some((t) => t.includes("case") || t.includes("customer"))) {
    suggestions.push({
      id: "sales_case_study",
      type: "add_slide",
      title: "Add Customer Success Story",
      description: "Social proof builds trust",
      action: "Add a case study or customer testimonial",
      priority: "medium",
    });
  }

  if (!slideTitles.some((t) => t.includes("pricing") || t.includes("investment"))) {
    suggestions.push({
      id: "sales_pricing",
      type: "add_slide",
      title: "Add Pricing Slide",
      description: "Be transparent about costs",
      action: "Add a slide with pricing information",
      priority: "medium",
    });
  }

  return suggestions;
}

/**
 * General suggestions for all presentations
 */
function getGeneralSuggestions(slides: any[]): Suggestion[] {
  const suggestions: Suggestion[] = [];

  // Check slide count
  if (slides.length > 20) {
    suggestions.push({
      id: "general_too_long",
      type: "improve_content",
      title: "Consider Reducing Slide Count",
      description: "Presentations over 20 slides can lose audience attention",
      action: "Try to consolidate or remove less critical slides",
      priority: "low",
    });
  }

  // Check for variety in layouts
  const layouts = slides.map((s) => s.layout);
  const uniqueLayouts = new Set(layouts);
  if (uniqueLayouts.size < 3 && slides.length > 5) {
    suggestions.push({
      id: "general_layout_variety",
      type: "change_layout",
      title: "Add Layout Variety",
      description: "Using different layouts keeps presentations engaging",
      action: "Consider varying slide layouts for visual interest",
      priority: "low",
    });
  }

  return suggestions;
}

/**
 * Get suggestion message for chat
 */
export function getSuggestionMessage(suggestions: Suggestion[]): string | null {
  if (suggestions.length === 0) return null;

  const highPriority = suggestions.filter((s) => s.priority === "high");

  if (highPriority.length > 0) {
    const suggestion = highPriority[0];
    return `💡 **Smart Suggestion**: ${suggestion.title}\n\n${suggestion.description}\n\nWould you like me to ${suggestion.action.toLowerCase()}?`;
  }

  return null;
}

