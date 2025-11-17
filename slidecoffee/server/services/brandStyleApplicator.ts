/**
 * Brand Style Applicator Service
 * Automatically applies extracted brand styles to presentations
 */

interface BrandStyle {
  colors: {
    primary?: string;
    secondary?: string;
    accent?: string;
    background?: string;
    text?: string;
  };
  fonts: {
    heading?: string;
    body?: string;
  };
  logo?: {
    url: string;
    position: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";
    size: "small" | "medium" | "large";
  };
}

interface PresentationSlide {
  id: number;
  content: any; // JSON content of the slide
  order: number;
}

/**
 * Apply brand colors to a presentation
 */
export function applyBrandColors(
  slides: PresentationSlide[],
  colors: BrandStyle["colors"]
): PresentationSlide[] {
  return slides.map((slide) => {
    const content = typeof slide.content === "string" ? JSON.parse(slide.content) : slide.content;

    // Apply background color
    if (colors.background) {
      content.backgroundColor = colors.background;
    }

    // Apply text color
    if (colors.text) {
      content.textColor = colors.text;
    }

    // Apply accent colors to highlights, buttons, etc.
    if (colors.accent && content.elements) {
      content.elements = content.elements.map((el: any) => {
        if (el.type === "button" || el.type === "highlight") {
          return { ...el, color: colors.accent };
        }
        return el;
      });
    }

    return {
      ...slide,
      content: JSON.stringify(content),
    };
  });
}

/**
 * Apply brand fonts to a presentation
 */
export function applyBrandFonts(
  slides: PresentationSlide[],
  fonts: BrandStyle["fonts"]
): PresentationSlide[] {
  return slides.map((slide) => {
    const content = typeof slide.content === "string" ? JSON.parse(slide.content) : slide.content;

    // Apply heading font
    if (fonts.heading && content.elements) {
      content.elements = content.elements.map((el: any) => {
        if (el.type === "heading" || el.type === "title") {
          return { ...el, fontFamily: fonts.heading };
        }
        return el;
      });
    }

    // Apply body font
    if (fonts.body && content.elements) {
      content.elements = content.elements.map((el: any) => {
        if (el.type === "text" || el.type === "paragraph") {
          return { ...el, fontFamily: fonts.body };
        }
        return el;
      });
    }

    return {
      ...slide,
      content: JSON.stringify(content),
    };
  });
}

/**
 * Apply brand logo to presentation slides
 */
export function applyBrandLogo(
  slides: PresentationSlide[],
  logo: BrandStyle["logo"]
): PresentationSlide[] {
  if (!logo) return slides;

  const positionStyles: Record<string, { top?: string; bottom?: string; left?: string; right?: string }> = {
    "top-left": { top: "20px", left: "20px" },
    "top-right": { top: "20px", right: "20px" },
    "bottom-left": { bottom: "20px", left: "20px" },
    "bottom-right": { bottom: "20px", right: "20px" },
    center: { top: "50%", left: "50%" },
  };

  const sizeMap: Record<string, string> = {
    small: "60px",
    medium: "100px",
    large: "150px",
  };

  return slides.map((slide) => {
    const content = typeof slide.content === "string" ? JSON.parse(slide.content) : slide.content;

    if (!content.elements) {
      content.elements = [];
    }

    // Add logo element
    content.elements.push({
      type: "logo",
      url: logo.url,
      position: positionStyles[logo.position],
      width: sizeMap[logo.size],
      height: "auto",
    });

    return {
      ...slide,
      content: JSON.stringify(content),
    };
  });
}

/**
 * Apply complete brand style to presentation
 */
export function applyBrandStyle(slides: PresentationSlide[], brandStyle: BrandStyle): PresentationSlide[] {
  let styledSlides = slides;

  // Apply colors
  if (brandStyle.colors) {
    styledSlides = applyBrandColors(styledSlides, brandStyle.colors);
  }

  // Apply fonts
  if (brandStyle.fonts) {
    styledSlides = applyBrandFonts(styledSlides, brandStyle.fonts);
  }

  // Apply logo
  if (brandStyle.logo) {
    styledSlides = applyBrandLogo(styledSlides, brandStyle.logo);
  }

  return styledSlides;
}

/**
 * Generate presentation template from brand
 */
export function generatePresentationTemplate(brandStyle: BrandStyle): any {
  return {
    name: "Brand Template",
    slides: [
      {
        type: "title",
        backgroundColor: brandStyle.colors.background || "#FFFFFF",
        elements: [
          {
            type: "title",
            text: "{{TITLE}}",
            fontFamily: brandStyle.fonts.heading || "Arial",
            color: brandStyle.colors.primary || "#000000",
            fontSize: "48px",
            position: { top: "40%", left: "50%", transform: "translate(-50%, -50%)" },
          },
          {
            type: "subtitle",
            text: "{{SUBTITLE}}",
            fontFamily: brandStyle.fonts.body || "Arial",
            color: brandStyle.colors.text || "#666666",
            fontSize: "24px",
            position: { top: "55%", left: "50%", transform: "translate(-50%, -50%)" },
          },
        ],
      },
      {
        type: "content",
        backgroundColor: brandStyle.colors.background || "#FFFFFF",
        elements: [
          {
            type: "heading",
            text: "{{HEADING}}",
            fontFamily: brandStyle.fonts.heading || "Arial",
            color: brandStyle.colors.primary || "#000000",
            fontSize: "36px",
            position: { top: "10%", left: "5%" },
          },
          {
            type: "text",
            text: "{{CONTENT}}",
            fontFamily: brandStyle.fonts.body || "Arial",
            color: brandStyle.colors.text || "#333333",
            fontSize: "18px",
            position: { top: "25%", left: "5%", right: "5%" },
          },
        ],
      },
    ],
  };
}

/**
 * Preview brand application (returns CSS styles)
 */
export function generateBrandPreviewCSS(brandStyle: BrandStyle): string {
  const css = `
    :root {
      --brand-primary: ${brandStyle.colors.primary || "#000000"};
      --brand-secondary: ${brandStyle.colors.secondary || "#666666"};
      --brand-accent: ${brandStyle.colors.accent || "#0066CC"};
      --brand-background: ${brandStyle.colors.background || "#FFFFFF"};
      --brand-text: ${brandStyle.colors.text || "#333333"};
      --brand-font-heading: ${brandStyle.fonts.heading || "Arial, sans-serif"};
      --brand-font-body: ${brandStyle.fonts.body || "Arial, sans-serif"};
    }

    .brand-preview {
      background-color: var(--brand-background);
      color: var(--brand-text);
      font-family: var(--brand-font-body);
    }

    .brand-preview h1,
    .brand-preview h2,
    .brand-preview h3 {
      color: var(--brand-primary);
      font-family: var(--brand-font-heading);
    }

    .brand-preview .accent {
      color: var(--brand-accent);
    }

    .brand-preview .secondary {
      color: var(--brand-secondary);
    }
  `;

  return css;
}

