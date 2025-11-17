import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/**
 * Export slides to PDF using client-side rendering
 * This captures the actual rendered slides for high-quality output
 */
export async function exportSlidesToPDF(
  slideElements: HTMLElement[],
  filename: string
): Promise<void> {
  // Create PDF in landscape 16:9 format
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "px",
    format: [1920, 1080], // 16:9 ratio
  });

  for (let i = 0; i < slideElements.length; i++) {
    const slideElement = slideElements[i];

    // Capture slide as canvas
    const canvas = await html2canvas(slideElement, {
      scale: 2, // Higher quality
      useCORS: true,
      logging: false,
      backgroundColor: null,
    });

    // Convert canvas to image
    const imgData = canvas.toDataURL("image/png");

    // Add page if not first slide
    if (i > 0) {
      pdf.addPage([1920, 1080], "landscape");
    }

    // Add image to PDF
    pdf.addImage(imgData, "PNG", 0, 0, 1920, 1080);
  }

  // Save PDF
  pdf.save(filename);
}

/**
 * Simple text-based PDF export (fallback)
 */
export function exportSlidesAsTextPDF(
  slides: any[],
  title: string,
  brandColors?: { primary?: string; accent?: string }
): void {
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "px",
    format: [1920, 1080],
  });

  const primaryColor = brandColors?.primary || "#1A1A1A";
  const accentColor = brandColors?.accent || "#0066CC";

  slides.forEach((slide, index) => {
    if (index > 0) {
      pdf.addPage([1920, 1080], "landscape");
    }

    // Set background color
    const bgColor = slide.backgroundColor || primaryColor;
    pdf.setFillColor(bgColor);
    pdf.rect(0, 0, 1920, 1080, "F");

    // Set text color to white
    pdf.setTextColor(255, 255, 255);

    // Render based on layout
    switch (slide.layout) {
      case "title":
        pdf.setFontSize(54);
        pdf.setFont("helvetica", "bold");
        pdf.text(slide.title || "", 960, 500, { align: "center" });
        
        if (slide.subtitle) {
          pdf.setFontSize(32);
          pdf.setFont("helvetica", "normal");
          pdf.text(slide.subtitle, 960, 600, { align: "center" });
        }
        break;

      case "title-content":
        pdf.setFontSize(36);
        pdf.setFont("helvetica", "bold");
        pdf.text(slide.title || "", 80, 120);

        pdf.setFontSize(24);
        pdf.setFont("helvetica", "normal");
        const contentLines = pdf.splitTextToSize(slide.content || "", 1760);
        pdf.text(contentLines, 80, 220);
        break;

      case "two-column":
        pdf.setFontSize(36);
        pdf.setFont("helvetica", "bold");
        pdf.text(slide.title || "", 80, 120);

        pdf.setFontSize(22);
        pdf.setFont("helvetica", "normal");
        
        const leftLines = pdf.splitTextToSize(slide.leftColumn || "", 800);
        pdf.text(leftLines, 80, 220);

        const rightLines = pdf.splitTextToSize(slide.rightColumn || "", 800);
        pdf.text(rightLines, 1000, 220);
        break;

      case "bullet-points":
        pdf.setFontSize(36);
        pdf.setFont("helvetica", "bold");
        pdf.text(slide.title || "", 80, 120);

        pdf.setFontSize(24);
        pdf.setFont("helvetica", "normal");
        
        let yPos = 220;
        (slide.bulletPoints || []).forEach((point: string) => {
          pdf.text("•", 80, yPos);
          const bulletLines = pdf.splitTextToSize(point, 1700);
          pdf.text(bulletLines, 120, yPos);
          yPos += 60;
        });
        break;

      case "quote":
        pdf.setFontSize(38);
        pdf.setFont("helvetica", "italic");
        const quoteLines = pdf.splitTextToSize(`"${slide.quote || ""}"`, 1400);
        pdf.text(quoteLines, 960, 500, { align: "center" });

        if (slide.quoteAuthor) {
          pdf.setFontSize(28);
          pdf.setFont("helvetica", "normal");
          pdf.text(`— ${slide.quoteAuthor}`, 960, 650, { align: "center" });
        }
        break;

      default:
        pdf.setFontSize(36);
        pdf.setFont("helvetica", "bold");
        pdf.text(slide.title || "", 80, 120);

        pdf.setFontSize(24);
        pdf.setFont("helvetica", "normal");
        const defaultLines = pdf.splitTextToSize(slide.content || "", 1760);
        pdf.text(defaultLines, 80, 220);
    }
  });

  pdf.save(`${title.replace(/[^a-z0-9]/gi, '_')}.pdf`);
}

