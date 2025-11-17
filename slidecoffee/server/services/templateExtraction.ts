import { storagePut } from "../storage";

export interface ExtractedTemplate {
  text: string[];
  images: { url: string; description?: string }[];
  colors: string[];
  fonts: string[];
  metadata: {
    slideCount?: number;
    pageCount?: number;
    title?: string;
  };
}

/**
 * Extract content from PowerPoint files (.pptx, .ppt)
 * Uses command-line tools to parse PowerPoint files
 */
export async function extractPowerPoint(
  fileBuffer: Buffer,
  fileName: string
): Promise<ExtractedTemplate> {
  try {
    // For now, return a placeholder structure
    // TODO: Implement actual PowerPoint parsing using libraries like:
    // - pptxgenjs for reading .pptx files
    // - or convert to PDF first and extract from there
    
    return {
      text: [
        "Placeholder: PowerPoint extraction not yet implemented",
        `File: ${fileName}`,
      ],
      images: [],
      colors: [],
      fonts: [],
      metadata: {
        title: fileName.replace(/\.pptx?$/i, ""),
      },
    };
  } catch (error) {
    console.error("PowerPoint extraction error:", error);
    throw new Error("Failed to extract PowerPoint content");
  }
}

/**
 * Extract content from PDF files
 * Uses pdf-parse or similar library
 */
export async function extractPDF(
  fileBuffer: Buffer,
  fileName: string
): Promise<ExtractedTemplate> {
  try {
    // For now, return a placeholder structure
    // TODO: Implement actual PDF parsing using:
    // - pdf-parse npm package
    // - or pdfjs-dist for more advanced extraction
    
    return {
      text: [
        "Placeholder: PDF extraction not yet implemented",
        `File: ${fileName}`,
      ],
      images: [],
      colors: [],
      fonts: [],
      metadata: {
        title: fileName.replace(/\.pdf$/i, ""),
      },
    };
  } catch (error) {
    console.error("PDF extraction error:", error);
    throw new Error("Failed to extract PDF content");
  }
}

/**
 * Main extraction function that routes to the appropriate extractor
 */
export async function extractTemplateContent(
  fileData: string, // base64 encoded
  fileName: string,
  fileType: string
): Promise<ExtractedTemplate> {
  // Convert base64 to buffer
  const base64Data = fileData.replace(/^data:[^;]+;base64,/, "");
  const fileBuffer = Buffer.from(base64Data, "base64");

  // Route to appropriate extractor based on file type
  if (
    fileType === "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
    fileType === "application/vnd.ms-powerpoint" ||
    fileName.match(/\.pptx?$/i)
  ) {
    return extractPowerPoint(fileBuffer, fileName);
  } else if (fileType === "application/pdf" || fileName.match(/\.pdf$/i)) {
    return extractPDF(fileBuffer, fileName);
  } else {
    throw new Error(`Unsupported file type: ${fileType}`);
  }
}

/**
 * Store extracted images to S3 and return URLs
 */
export async function storeExtractedImages(
  images: Buffer[],
  templateId: number
): Promise<string[]> {
  const urls: string[] = [];
  
  for (let i = 0; i < images.length; i++) {
    const { url } = await storagePut(
      `templates/${templateId}/image-${i}.png`,
      images[i],
      "image/png"
    );
    urls.push(url);
  }
  
  return urls;
}

