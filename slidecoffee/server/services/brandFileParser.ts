import PizZip from "pizzip";
import { Buffer } from "buffer";

/**
 * Brand File Parser Service
 * Extracts colors, fonts, and logos from PowerPoint and PDF files
 */

interface ExtractedBrand {
  colors: string[];
  fonts: string[];
  logos: string[];
  textContent: string;
}

/**
 * Extract brand elements from PowerPoint file
 */
export async function extractFromPowerPoint(fileBuffer: Buffer): Promise<ExtractedBrand> {
  try {
    const zip = new PizZip(fileBuffer);
    const colors: string[] = [];
    const fonts: string[] = [];
    const logos: string[] = [];
    let textContent = "";

    // Extract XML files from PPTX
    const slideFiles = Object.keys(zip.files).filter((name) =>
      name.startsWith("ppt/slides/slide") && name.endsWith(".xml")
    );

    // Extract theme colors from theme XML
    const themeFile = zip.files["ppt/theme/theme1.xml"];
    if (themeFile) {
      const themeXml = themeFile.asText();
      
      // Extract color scheme (simplified regex approach)
      const colorMatches = Array.from(themeXml.matchAll(/<a:srgbClr val="([A-F0-9]{6})"/gi));
      for (const match of colorMatches) {
        const color = `#${match[1]}`;
        if (!colors.includes(color)) {
          colors.push(color);
        }
      }
    }

    // Extract fonts from theme
    const fontText = themeFile?.asText() || "";
    const fontMatches = Array.from(fontText.matchAll(/<a:latin typeface="([^"]+)"/gi));
    if (fontMatches.length > 0) {
      for (const match of fontMatches) {
        const font = match[1];
        if (!fonts.includes(font) && font !== "+mn-lt" && font !== "+mj-lt") {
          fonts.push(font);
        }
      }
    }

    // Extract text content from slides
    for (const slideFile of slideFiles) {
      const slideXml = zip.files[slideFile].asText();
      
      // Extract text (simplified - removes XML tags)
      const textMatches = Array.from(slideXml.matchAll(/<a:t>([^<]+)<\/a:t>/gi));
      for (const match of textMatches) {
        textContent += match[1] + " ";
      }
    }

    // Extract images (logos) - get image file names
    const imageFiles = Object.keys(zip.files).filter((name) =>
      name.startsWith("ppt/media/") && /\.(png|jpg|jpeg|svg)$/i.test(name)
    );
    
    for (const imageFile of imageFiles) {
      logos.push(imageFile);
    }

    return {
      colors: colors.slice(0, 10), // Limit to top 10 colors
      fonts: fonts.slice(0, 5), // Limit to top 5 fonts
      logos: logos.slice(0, 3), // Limit to top 3 images
      textContent: textContent.trim().substring(0, 1000), // First 1000 chars
    };
  } catch (error) {
    console.error("Error extracting from PowerPoint:", error);
    throw new Error("Failed to parse PowerPoint file");
  }
}

/**
 * Extract brand elements from PDF file
 */
export async function extractFromPDF(fileBuffer: Buffer): Promise<ExtractedBrand> {
  try {
    // Dynamic import for CommonJS module
    const pdfParseModule = await import("pdf-parse") as any;
    const pdfParse = pdfParseModule.default || pdfParseModule;
    const data = await pdfParse(fileBuffer);
    
    const colors: string[] = [];
    const fonts: string[] = [];
    const logos: string[] = [];
    
    // Extract text content
    const textContent = data.text.substring(0, 1000);

    // Extract font information (if available in metadata)
    if (data.info && data.info.Producer) {
      // Some PDFs include font info in metadata
      const fontMatch = data.info.Producer.match(/([A-Za-z\s]+)/);
      if (fontMatch) {
        fonts.push(fontMatch[1].trim());
      }
    }

    // Common brand document fonts to look for in text
    const commonBrandFonts = [
      "Arial", "Helvetica", "Times New Roman", "Calibri", "Roboto",
      "Open Sans", "Lato", "Montserrat", "Raleway", "Poppins"
    ];
    
    // Check if any common fonts are mentioned in the text
    for (const font of commonBrandFonts) {
      if (textContent.toLowerCase().includes(font.toLowerCase())) {
        if (!fonts.includes(font)) {
          fonts.push(font);
        }
      }
    }

    // Extract hex color codes from text (if brand guidelines mention them)
    const colorMatches = textContent.matchAll(/#([A-F0-9]{6})/gi);
    for (const match of colorMatches) {
      const color = `#${match[1].toUpperCase()}`;
      if (!colors.includes(color)) {
        colors.push(color);
      }
    }

    // Extract RGB color mentions
    const rgbMatches = textContent.matchAll(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/gi);
    for (const match of rgbMatches) {
      const r = parseInt(match[1]);
      const g = parseInt(match[2]);
      const b = parseInt(match[3]);
      const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
      if (!colors.includes(hex)) {
        colors.push(hex);
      }
    }

    return {
      colors: colors.slice(0, 10),
      fonts: fonts.slice(0, 5),
      logos, // PDFs don't easily expose embedded images
      textContent,
    };
  } catch (error) {
    console.error("Error extracting from PDF:", error);
    throw new Error("Failed to parse PDF file");
  }
}

/**
 * Main parser function - detects file type and extracts brand elements
 */
export async function parseBrandFile(
  fileBuffer: Buffer,
  mimeType: string
): Promise<ExtractedBrand> {
  if (
    mimeType === "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
    mimeType === "application/vnd.ms-powerpoint"
  ) {
    return extractFromPowerPoint(fileBuffer);
  } else if (mimeType === "application/pdf") {
    return extractFromPDF(fileBuffer);
  } else {
    throw new Error("Unsupported file type. Please upload PowerPoint (.pptx) or PDF files.");
  }
}

/**
 * Analyze extracted brand data and generate suggestions
 */
export function analyzeBrandData(extracted: ExtractedBrand): {
  primaryColor: string | null;
  secondaryColors: string[];
  suggestedFonts: string[];
  brandTone: string;
} {
  // Determine primary color (first extracted color, or most common)
  const primaryColor = extracted.colors.length > 0 ? extracted.colors[0] : null;
  
  // Secondary colors (next 2-3 colors)
  const secondaryColors = extracted.colors.slice(1, 4);

  // Suggested fonts (use extracted fonts or defaults)
  const suggestedFonts = extracted.fonts.length > 0
    ? extracted.fonts
    : ["Inter", "Roboto", "Open Sans"];

  // Analyze brand tone from text content
  let brandTone = "professional";
  const text = extracted.textContent.toLowerCase();
  
  if (text.includes("innovative") || text.includes("cutting-edge") || text.includes("modern")) {
    brandTone = "innovative and modern";
  } else if (text.includes("trust") || text.includes("reliable") || text.includes("established")) {
    brandTone = "trustworthy and established";
  } else if (text.includes("friendly") || text.includes("approachable") || text.includes("warm")) {
    brandTone = "friendly and approachable";
  } else if (text.includes("luxury") || text.includes("premium") || text.includes("exclusive")) {
    brandTone = "premium and exclusive";
  }

  return {
    primaryColor,
    secondaryColors,
    suggestedFonts,
    brandTone,
  };
}

