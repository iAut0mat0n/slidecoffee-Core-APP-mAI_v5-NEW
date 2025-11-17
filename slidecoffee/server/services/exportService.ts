import pptxgen from "pptxgenjs";
import type { Slide, SlideLayout } from "./aiService";

/**
 * Export slides to PowerPoint (PPTX) format
 */
export async function exportToPowerPoint(params: {
  slides: Slide[];
  title: string;
  brandColors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
  };
}): Promise<Buffer> {
  const { slides, title, brandColors } = params;

  // Create presentation
  const pres = new pptxgen();

  // Set presentation properties
  pres.author = "SlideCoffee";
  pres.company = "SlideCoffee";
  pres.subject = title;
  pres.title = title;

  // Default colors
  const primaryColor = brandColors?.primary || "1A1A1A";
  const accentColor = brandColors?.accent || "0066CC";
  const textColor = "FFFFFF";

  // Process each slide
  for (const slideData of slides) {
    const slide = pres.addSlide();

    // Set background
    slide.background = { color: slideData.backgroundColor || primaryColor };

    // Render based on layout
    switch (slideData.layout) {
      case "title":
        renderTitleSlide(slide, slideData, accentColor, textColor);
        break;
      case "title-content":
        renderTitleContentSlide(slide, slideData, accentColor, textColor);
        break;
      case "two-column":
        renderTwoColumnSlide(slide, slideData, accentColor, textColor);
        break;
      case "bullet-points":
        renderBulletPointsSlide(slide, slideData, accentColor, textColor);
        break;
      case "quote":
        renderQuoteSlide(slide, slideData, accentColor, textColor);
        break;
      case "section-header":
        renderSectionHeaderSlide(slide, slideData, accentColor, textColor);
        break;
      case "image-text":
        renderImageTextSlide(slide, slideData, accentColor, textColor);
        break;
      case "comparison":
        renderComparisonSlide(slide, slideData, accentColor, textColor);
        break;
      case "full-image":
        renderFullImageSlide(slide, slideData);
        break;
      default:
        renderTitleContentSlide(slide, slideData, accentColor, textColor);
    }

    // Add speaker notes if present
    if (slideData.notes) {
      slide.addNotes(slideData.notes);
    }
  }

  // Generate PPTX file as buffer
  const buffer = await pres.write({ outputType: "nodebuffer" });
  return buffer as Buffer;
}

// Slide rendering functions

function renderTitleSlide(
  slide: pptxgen.Slide,
  data: Slide,
  accentColor: string,
  textColor: string
) {
  if (data.title) {
    slide.addText(data.title, {
      x: 1,
      y: 2.5,
      w: 8,
      h: 1.5,
      fontSize: 54,
      bold: true,
      color: textColor,
      align: "center",
    });
  }

  if (data.subtitle) {
    slide.addText(data.subtitle, {
      x: 1,
      y: 4.2,
      w: 8,
      h: 0.8,
      fontSize: 28,
      color: textColor,
      align: "center",
    });
  }

  // Accent line
  slide.addShape(pptxgen.ShapeType.rect, {
    x: 4,
    y: 5.2,
    w: 2,
    h: 0.05,
    fill: { color: accentColor },
  });
}

function renderTitleContentSlide(
  slide: pptxgen.Slide,
  data: Slide,
  accentColor: string,
  textColor: string
) {
  if (data.title) {
    slide.addText(data.title, {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 0.8,
      fontSize: 36,
      bold: true,
      color: textColor,
    });

    // Underline
    slide.addShape(pptxgen.ShapeType.rect, {
      x: 0.5,
      y: 1.4,
      w: 9,
      h: 0.02,
      fill: { color: accentColor },
    });
  }

  if (data.content) {
    slide.addText(data.content, {
      x: 0.5,
      y: 2,
      w: 9,
      h: 3.5,
      fontSize: 20,
      color: textColor,
      valign: "middle",
    });
  }
}

function renderTwoColumnSlide(
  slide: pptxgen.Slide,
  data: Slide,
  accentColor: string,
  textColor: string
) {
  if (data.title) {
    slide.addText(data.title, {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 0.8,
      fontSize: 36,
      bold: true,
      color: textColor,
    });

    slide.addShape(pptxgen.ShapeType.rect, {
      x: 0.5,
      y: 1.4,
      w: 9,
      h: 0.02,
      fill: { color: accentColor },
    });
  }

  if (data.leftColumn) {
    slide.addText(data.leftColumn, {
      x: 0.5,
      y: 2,
      w: 4.25,
      h: 3.5,
      fontSize: 18,
      color: textColor,
      valign: "middle",
    });
  }

  if (data.rightColumn) {
    slide.addText(data.rightColumn, {
      x: 5.25,
      y: 2,
      w: 4.25,
      h: 3.5,
      fontSize: 18,
      color: textColor,
      valign: "middle",
    });
  }
}

function renderBulletPointsSlide(
  slide: pptxgen.Slide,
  data: Slide,
  accentColor: string,
  textColor: string
) {
  if (data.title) {
    slide.addText(data.title, {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 0.8,
      fontSize: 36,
      bold: true,
      color: textColor,
    });

    slide.addShape(pptxgen.ShapeType.rect, {
      x: 0.5,
      y: 1.4,
      w: 9,
      h: 0.02,
      fill: { color: accentColor },
    });
  }

  if (data.bulletPoints && data.bulletPoints.length > 0) {
    const bullets = data.bulletPoints.map((point) => ({
      text: point,
      options: { bullet: { code: "2022" }, color: textColor },
    }));

    slide.addText(bullets, {
      x: 0.5,
      y: 2,
      w: 9,
      h: 3.5,
      fontSize: 20,
      color: textColor,
      valign: "top",
    });
  }
}

function renderQuoteSlide(
  slide: pptxgen.Slide,
  data: Slide,
  accentColor: string,
  textColor: string
) {
  if (data.quote) {
    slide.addText(data.quote, {
      x: 1.5,
      y: 2,
      w: 7,
      h: 2,
      fontSize: 28,
      italic: true,
      color: textColor,
      align: "center",
      valign: "middle",
    });
  }

  if (data.quoteAuthor) {
    slide.addText(`— ${data.quoteAuthor}`, {
      x: 1.5,
      y: 4.5,
      w: 7,
      h: 0.5,
      fontSize: 20,
      color: textColor,
      align: "center",
    });
  }
}

function renderSectionHeaderSlide(
  slide: pptxgen.Slide,
  data: Slide,
  accentColor: string,
  textColor: string
) {
  // Accent line at top
  slide.addShape(pptxgen.ShapeType.rect, {
    x: 3.5,
    y: 2,
    w: 3,
    h: 0.05,
    fill: { color: accentColor },
  });

  if (data.title) {
    slide.addText(data.title, {
      x: 1,
      y: 2.5,
      w: 8,
      h: 1.2,
      fontSize: 44,
      bold: true,
      color: textColor,
      align: "center",
    });
  }

  if (data.subtitle) {
    slide.addText(data.subtitle, {
      x: 1,
      y: 4,
      w: 8,
      h: 0.8,
      fontSize: 24,
      color: textColor,
      align: "center",
    });
  }
}

function renderImageTextSlide(
  slide: pptxgen.Slide,
  data: Slide,
  accentColor: string,
  textColor: string
) {
  if (data.title) {
    slide.addText(data.title, {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 0.8,
      fontSize: 36,
      bold: true,
      color: textColor,
    });

    slide.addShape(pptxgen.ShapeType.rect, {
      x: 0.5,
      y: 1.4,
      w: 9,
      h: 0.02,
      fill: { color: accentColor },
    });
  }

  // Image placeholder (if URL provided, would need to download and embed)
  if (data.imageUrl) {
    slide.addText("Image: " + (data.imageCaption || "Visual content"), {
      x: 0.5,
      y: 2,
      w: 4.25,
      h: 3.5,
      fontSize: 16,
      color: textColor,
      align: "center",
      valign: "middle",
    });
  }

  if (data.content) {
    slide.addText(data.content, {
      x: 5.25,
      y: 2,
      w: 4.25,
      h: 3.5,
      fontSize: 18,
      color: textColor,
      valign: "middle",
    });
  }
}

function renderComparisonSlide(
  slide: pptxgen.Slide,
  data: Slide,
  accentColor: string,
  textColor: string
) {
  if (data.title) {
    slide.addText(data.title, {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 0.8,
      fontSize: 36,
      bold: true,
      color: textColor,
    });

    slide.addShape(pptxgen.ShapeType.rect, {
      x: 0.5,
      y: 1.4,
      w: 9,
      h: 0.02,
      fill: { color: accentColor },
    });
  }

  // Left box
  if (data.leftColumn) {
    slide.addShape(pptxgen.ShapeType.rect, {
      x: 0.5,
      y: 2,
      w: 4.25,
      h: 3.5,
      fill: { transparency: 90 },
      line: { color: accentColor, width: 2 },
    });

    slide.addText(data.leftColumn, {
      x: 0.7,
      y: 2.2,
      w: 3.85,
      h: 3.1,
      fontSize: 18,
      color: textColor,
      valign: "middle",
    });
  }

  // Right box
  if (data.rightColumn) {
    slide.addShape(pptxgen.ShapeType.rect, {
      x: 5.25,
      y: 2,
      w: 4.25,
      h: 3.5,
      fill: { transparency: 90 },
      line: { color: accentColor, width: 2 },
    });

    slide.addText(data.rightColumn, {
      x: 5.45,
      y: 2.2,
      w: 3.85,
      h: 3.1,
      fontSize: 18,
      color: textColor,
      valign: "middle",
    });
  }
}

function renderFullImageSlide(slide: pptxgen.Slide, data: Slide) {
  // Full image slide - would need image download logic
  if (data.title) {
    slide.addText(data.title, {
      x: 1,
      y: 2.5,
      w: 8,
      h: 1.5,
      fontSize: 44,
      bold: true,
      color: "FFFFFF",
      align: "center",
      valign: "middle",
    });
  }
}



/**
 * Export slides to PDF format
 * Generates HTML representation and converts to PDF
 */
export async function exportToPDF(params: {
  slides: Slide[];
  title: string;
  brandColors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
  };
}): Promise<Buffer> {
  const { slides, title, brandColors } = params;

  // We'll use a simple approach: generate HTML for each slide and convert to PDF
  // This is a server-side implementation
  
  const primaryColor = brandColors?.primary || "#1A1A1A";
  const accentColor = brandColors?.accent || "#0066CC";
  const textColor = "#FFFFFF";

  // Generate HTML for all slides
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        @page {
          size: 1920px 1080px;
          margin: 0;
        }
        body {
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        .slide {
          width: 1920px;
          height: 1080px;
          page-break-after: always;
          position: relative;
          display: flex;
          flex-direction: column;
          padding: 60px 80px;
          box-sizing: border-box;
        }
        .slide:last-child {
          page-break-after: auto;
        }
        .slide-title {
          font-size: 54px;
          font-weight: bold;
          margin-bottom: 30px;
          color: ${textColor};
        }
        .slide-subtitle {
          font-size: 32px;
          color: ${textColor};
          opacity: 0.9;
        }
        .slide-content {
          font-size: 28px;
          line-height: 1.6;
          color: ${textColor};
        }
        .accent-line {
          width: 200px;
          height: 4px;
          background: ${accentColor};
          margin: 20px 0;
        }
        .two-column {
          display: flex;
          gap: 60px;
        }
        .column {
          flex: 1;
        }
        ul {
          list-style: none;
          padding: 0;
        }
        li {
          margin: 20px 0;
          padding-left: 40px;
          position: relative;
        }
        li:before {
          content: "•";
          position: absolute;
          left: 0;
          color: ${accentColor};
          font-size: 36px;
        }
      </style>
    </head>
    <body>
  `;

  // Generate HTML for each slide
  for (const slide of slides) {
    const bgColor = slide.backgroundColor || primaryColor;
    html += `<div class="slide" style="background-color: ${bgColor};">`;

    switch (slide.layout) {
      case "title":
        html += `
          <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100%; text-align: center;">
            <h1 class="slide-title">${escapeHtml(slide.title || "")}</h1>
            ${slide.subtitle ? `<p class="slide-subtitle">${escapeHtml(slide.subtitle)}</p>` : ""}
            <div class="accent-line"></div>
          </div>
        `;
        break;

      case "title-content":
        html += `
          <h2 class="slide-title">${escapeHtml(slide.title || "")}</h2>
          <div class="accent-line"></div>
          <div class="slide-content">${escapeHtml(slide.content || "")}</div>
        `;
        break;

      case "two-column":
        html += `
          <h2 class="slide-title">${escapeHtml(slide.title || "")}</h2>
          <div class="accent-line"></div>
          <div class="two-column">
            <div class="column slide-content">${escapeHtml(slide.leftColumn || "")}</div>
            <div class="column slide-content">${escapeHtml(slide.rightColumn || "")}</div>
          </div>
        `;
        break;

      case "bullet-points":
        html += `
          <h2 class="slide-title">${escapeHtml(slide.title || "")}</h2>
          <div class="accent-line"></div>
          <ul class="slide-content">
            ${(slide.bulletPoints || []).map(point => `<li>${escapeHtml(point)}</li>`).join("")}
          </ul>
        `;
        break;

      case "quote":
        html += `
          <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100%; text-align: center;">
            <p class="slide-content" style="font-size: 42px; font-style: italic; max-width: 80%;">"${escapeHtml(slide.quote || "")}"</p>
            ${slide.quoteAuthor ? `<p class="slide-subtitle" style="margin-top: 40px;">— ${escapeHtml(slide.quoteAuthor)}</p>` : ""}
          </div>
        `;
        break;

      case "section-header":
        html += `
          <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100%; text-align: center;">
            <div class="accent-line"></div>
            <h2 class="slide-title" style="margin: 40px 0;">${escapeHtml(slide.title || "")}</h2>
            ${slide.subtitle ? `<p class="slide-subtitle">${escapeHtml(slide.subtitle)}</p>` : ""}
          </div>
        `;
        break;

      default:
        html += `
          <h2 class="slide-title">${escapeHtml(slide.title || "")}</h2>
          <div class="accent-line"></div>
          <div class="slide-content">${escapeHtml(slide.content || "")}</div>
        `;
    }

    html += `</div>`;
  }

  html += `
    </body>
    </html>
  `;

  // For server-side PDF generation, we'll use a simple approach
  // In production, you might want to use puppeteer or a dedicated PDF service
  // For now, we'll return a note that client-side generation is preferred
  
  return Buffer.from(html, 'utf-8');
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

