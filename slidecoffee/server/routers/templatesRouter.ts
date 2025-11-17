import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";

/**
 * Templates Router
 * Manages sample presentation templates
 */

// Sample templates data (in production, this would come from database)
const SAMPLE_TEMPLATES = [
  {
    id: 1,
    name: "Modern Pitch Deck",
    description: "Clean, professional design for startup pitches",
    category: "business",
    thumbnailUrl: "/templates/modern-pitch.jpg",
    colors: JSON.stringify(["#2563EB", "#1E40AF", "#FFFFFF", "#F3F4F6", "#111827"]),
    primaryFont: "Inter",
    secondaryFont: "Inter",
  },
  {
    id: 2,
    name: "Creative Portfolio",
    description: "Bold, visual-first design for creative work",
    category: "creative",
    thumbnailUrl: "/templates/creative-portfolio.jpg",
    colors: JSON.stringify(["#EC4899", "#8B5CF6", "#FFFFFF", "#FEF3C7", "#1F2937"]),
    primaryFont: "Poppins",
    secondaryFont: "Poppins",
  },
  {
    id: 3,
    name: "Corporate Report",
    description: "Professional, data-focused design for reports",
    category: "business",
    thumbnailUrl: "/templates/corporate-report.jpg",
    colors: JSON.stringify(["#059669", "#047857", "#FFFFFF", "#F0FDF4", "#064E3B"]),
    primaryFont: "Roboto",
    secondaryFont: "Roboto",
  },
  {
    id: 4,
    name: "Startup Launch",
    description: "Energetic design for product launches",
    category: "startup",
    thumbnailUrl: "/templates/startup-launch.jpg",
    colors: JSON.stringify(["#F59E0B", "#D97706", "#FFFFFF", "#FEF3C7", "#78350F"]),
    primaryFont: "Montserrat",
    secondaryFont: "Open Sans",
  },
  {
    id: 5,
    name: "Tech Presentation",
    description: "Modern, tech-focused design with gradients",
    category: "technology",
    thumbnailUrl: "/templates/tech-presentation.jpg",
    colors: JSON.stringify(["#6366F1", "#4F46E5", "#FFFFFF", "#EEF2FF", "#312E81"]),
    primaryFont: "Space Grotesk",
    secondaryFont: "Inter",
  },
  {
    id: 6,
    name: "Minimalist",
    description: "Clean, simple design with lots of whitespace",
    category: "minimal",
    thumbnailUrl: "/templates/minimalist.jpg",
    colors: JSON.stringify(["#000000", "#FFFFFF", "#F3F4F6", "#9CA3AF", "#1F2937"]),
    primaryFont: "Helvetica",
    secondaryFont: "Arial",
  },
];

export const templatesRouter = router({
  /**
   * List all available templates
   */
  list: publicProcedure.query(async () => {
    return SAMPLE_TEMPLATES;
  }),

  /**
   * Get template by ID
   */
  get: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const template = SAMPLE_TEMPLATES.find((t) => t.id === input.id);
      if (!template) {
        throw new Error("Template not found");
      }
      return template;
    }),

  /**
   * Get templates by category
   */
  byCategory: publicProcedure
    .input(z.object({ category: z.string() }))
    .query(async ({ input }) => {
      return SAMPLE_TEMPLATES.filter((t) => t.category === input.category);
    }),
});

