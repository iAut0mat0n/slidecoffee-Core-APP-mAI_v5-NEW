import PptxGenJSModule from 'pptxgenjs';
import fs from 'fs';
import path from 'path';

const PptxGenJS = PptxGenJSModule.default || PptxGenJSModule;

interface SlideContent {
  title: string;
  subtitle?: string;
  points?: string[];
  type: 'title' | 'content' | 'two-column' | 'image' | 'quote' | 'conclusion';
}

interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

interface TemplateConfig {
  name: string;
  category: string;
  description: string;
  colors: ThemeColors;
  slides: SlideContent[];
}

function createPresentation(config: TemplateConfig): any {
  const pptx = new PptxGenJS();
  
  pptx.author = 'SlideCoffee';
  pptx.title = config.name;
  pptx.subject = config.description;
  pptx.company = 'SlideCoffee';
  
  pptx.defineSlideMaster({
    title: 'MASTER_SLIDE',
    background: { color: config.colors.background },
    objects: [
      { rect: { x: 0, y: 5, w: 10, h: 0.3, fill: { color: config.colors.primary } } }
    ]
  });

  for (const slideContent of config.slides) {
    const slide = pptx.addSlide({ masterName: 'MASTER_SLIDE' });

    switch (slideContent.type) {
      case 'title':
        slide.addText(slideContent.title, {
          x: 0.5,
          y: 2,
          w: 9,
          h: 1.5,
          fontSize: 44,
          fontFace: 'Arial',
          color: config.colors.primary,
          bold: true,
          align: 'center'
        });
        if (slideContent.subtitle) {
          slide.addText(slideContent.subtitle, {
            x: 0.5,
            y: 3.5,
            w: 9,
            h: 0.8,
            fontSize: 24,
            fontFace: 'Arial',
            color: config.colors.text,
            align: 'center'
          });
        }
        break;

      case 'content':
        slide.addText(slideContent.title, {
          x: 0.5,
          y: 0.3,
          w: 9,
          h: 0.8,
          fontSize: 32,
          fontFace: 'Arial',
          color: config.colors.primary,
          bold: true
        });
        if (slideContent.points) {
          const bulletPoints = slideContent.points.map(point => ({
            text: point,
            options: { bullet: true, fontSize: 18, color: config.colors.text }
          }));
          slide.addText(bulletPoints, {
            x: 0.5,
            y: 1.3,
            w: 9,
            h: 3.5,
            fontFace: 'Arial',
            valign: 'top'
          });
        }
        break;

      case 'two-column':
        slide.addText(slideContent.title, {
          x: 0.5,
          y: 0.3,
          w: 9,
          h: 0.8,
          fontSize: 32,
          fontFace: 'Arial',
          color: config.colors.primary,
          bold: true
        });
        if (slideContent.points && slideContent.points.length >= 2) {
          const leftPoints = slideContent.points.filter((_, i) => i % 2 === 0);
          const rightPoints = slideContent.points.filter((_, i) => i % 2 === 1);
          
          slide.addText(leftPoints.map(p => ({ text: p, options: { bullet: true, fontSize: 16, color: config.colors.text } })), {
            x: 0.5,
            y: 1.3,
            w: 4.25,
            h: 3.5,
            fontFace: 'Arial',
            valign: 'top'
          });
          slide.addText(rightPoints.map(p => ({ text: p, options: { bullet: true, fontSize: 16, color: config.colors.text } })), {
            x: 5.25,
            y: 1.3,
            w: 4.25,
            h: 3.5,
            fontFace: 'Arial',
            valign: 'top'
          });
        }
        break;

      case 'quote':
        slide.addShape('rect', {
          x: 1,
          y: 1.5,
          w: 8,
          h: 2.5,
          fill: { color: config.colors.secondary },
          line: { color: config.colors.primary, width: 2 }
        });
        slide.addText(`"${slideContent.title}"`, {
          x: 1.5,
          y: 1.8,
          w: 7,
          h: 1.8,
          fontSize: 24,
          fontFace: 'Arial',
          color: config.colors.text,
          italic: true,
          align: 'center',
          valign: 'middle'
        });
        if (slideContent.subtitle) {
          slide.addText(`— ${slideContent.subtitle}`, {
            x: 1.5,
            y: 3.8,
            w: 7,
            h: 0.5,
            fontSize: 16,
            fontFace: 'Arial',
            color: config.colors.primary,
            align: 'right'
          });
        }
        break;

      case 'conclusion':
        slide.addText(slideContent.title, {
          x: 0.5,
          y: 0.3,
          w: 9,
          h: 0.8,
          fontSize: 32,
          fontFace: 'Arial',
          color: config.colors.primary,
          bold: true,
          align: 'center'
        });
        if (slideContent.points) {
          const summaryPoints = slideContent.points.map(point => ({
            text: point,
            options: { bullet: { type: 'number' as const }, fontSize: 20, color: config.colors.text }
          }));
          slide.addText(summaryPoints, {
            x: 1,
            y: 1.5,
            w: 8,
            h: 3,
            fontFace: 'Arial',
            valign: 'top'
          });
        }
        if (slideContent.subtitle) {
          slide.addText(slideContent.subtitle, {
            x: 0.5,
            y: 4.5,
            w: 9,
            h: 0.5,
            fontSize: 18,
            fontFace: 'Arial',
            color: config.colors.accent,
            bold: true,
            align: 'center'
          });
        }
        break;

      default:
        slide.addText(slideContent.title, {
          x: 0.5,
          y: 0.3,
          w: 9,
          h: 0.8,
          fontSize: 32,
          fontFace: 'Arial',
          color: config.colors.primary,
          bold: true
        });
    }
  }

  return pptx;
}

const TEMPLATE_CONFIGS: TemplateConfig[] = [
  {
    name: 'Startup Pitch Deck',
    category: 'Pitch Decks',
    description: 'Professional pitch deck for startup fundraising',
    colors: { primary: '7C3AED', secondary: 'EDE9FE', accent: '8B5CF6', background: 'FFFFFF', text: '1F2937' },
    slides: [
      { type: 'title', title: 'Company Name', subtitle: 'Transforming [Industry] with Innovation' },
      { type: 'content', title: 'The Problem', points: ['Pain point 1 that your target market faces', 'Pain point 2 that creates opportunity', 'Current solutions are inadequate because...', 'Market is ready for disruption'] },
      { type: 'content', title: 'Our Solution', points: ['How we solve the problem uniquely', 'Key differentiators from competitors', 'Technology or approach advantages', 'Why now is the right time'] },
      { type: 'two-column', title: 'Market Opportunity', points: ['TAM: $X Billion', 'SAM: $X Billion', 'SOM: $X Million', 'Growth Rate: X% CAGR', 'Target Segment 1', 'Target Segment 2'] },
      { type: 'content', title: 'Business Model', points: ['Revenue stream 1', 'Revenue stream 2', 'Pricing strategy', 'Unit economics'] },
      { type: 'content', title: 'Traction & Milestones', points: ['Key metric 1: Growth percentage', 'Key metric 2: User/customer count', 'Recent achievements', 'Partnerships secured'] },
      { type: 'conclusion', title: 'The Ask', points: ['Funding amount requested', 'Use of funds breakdown', 'Timeline to next milestone'], subtitle: 'Contact: email@company.com' }
    ]
  },
  {
    name: 'Investor Update',
    category: 'Pitch Decks',
    description: 'Monthly/quarterly investor update template',
    colors: { primary: '059669', secondary: 'D1FAE5', accent: '10B981', background: 'FFFFFF', text: '1F2937' },
    slides: [
      { type: 'title', title: 'Investor Update', subtitle: 'Q4 2024 Quarterly Report' },
      { type: 'content', title: 'Executive Summary', points: ['Key highlight 1', 'Key highlight 2', 'Key challenge addressed', 'Looking ahead'] },
      { type: 'two-column', title: 'Key Metrics', points: ['MRR: $XXX,XXX', 'Growth: +XX%', 'Churn: X.X%', 'CAC: $XXX', 'LTV: $X,XXX', 'Runway: XX months'] },
      { type: 'content', title: 'Product Updates', points: ['Feature launch 1', 'Feature launch 2', 'Customer feedback insights', 'Roadmap progress'] },
      { type: 'content', title: 'Team & Operations', points: ['New hires and roles', 'Team size update', 'Key operational improvements', 'Culture initiatives'] },
      { type: 'conclusion', title: 'Looking Ahead', points: ['Priority 1 for next quarter', 'Priority 2 for next quarter', 'Support needed from investors'], subtitle: 'Questions? Reach out anytime.' }
    ]
  },
  {
    name: 'Quarterly Business Review',
    category: 'Business Reviews',
    description: 'Comprehensive quarterly business performance review',
    colors: { primary: '2563EB', secondary: 'DBEAFE', accent: '3B82F6', background: 'FFFFFF', text: '1F2937' },
    slides: [
      { type: 'title', title: 'Q4 Business Review', subtitle: 'Performance Analysis & Strategic Outlook' },
      { type: 'content', title: 'Quarter Highlights', points: ['Revenue achievement vs target', 'Major wins and accomplishments', 'Key challenges overcome', 'Market position changes'] },
      { type: 'two-column', title: 'Financial Performance', points: ['Revenue: $X.XM', 'vs Target: +X%', 'Gross Margin: XX%', 'EBITDA: $XXX,XXX', 'Operating Expenses', 'YoY Comparison'] },
      { type: 'content', title: 'Customer Metrics', points: ['New customers acquired', 'Customer retention rate', 'Net Promoter Score', 'Support ticket resolution'] },
      { type: 'content', title: 'Team Performance', points: ['Headcount changes', 'Employee satisfaction', 'Training completed', 'Productivity metrics'] },
      { type: 'content', title: 'Challenges & Learnings', points: ['Challenge 1 and how addressed', 'Challenge 2 and learnings', 'Process improvements made', 'Risk mitigation steps'] },
      { type: 'conclusion', title: 'Q1 Priorities', points: ['Strategic priority 1', 'Strategic priority 2', 'Resource requirements', 'Success metrics'], subtitle: 'Building on momentum' }
    ]
  },
  {
    name: 'Sales Proposal',
    category: 'Sales Presentations',
    description: 'Professional sales proposal template',
    colors: { primary: 'DC2626', secondary: 'FEE2E2', accent: 'EF4444', background: 'FFFFFF', text: '1F2937' },
    slides: [
      { type: 'title', title: 'Proposal for [Client Name]', subtitle: 'Prepared by [Your Company]' },
      { type: 'content', title: 'Understanding Your Needs', points: ['Challenge 1 you mentioned', 'Challenge 2 we identified', 'Business impact of these issues', 'Desired outcomes'] },
      { type: 'content', title: 'Our Solution', points: ['How we address challenge 1', 'How we address challenge 2', 'Unique value we provide', 'Implementation approach'] },
      { type: 'content', title: 'Case Studies', points: ['Similar client success story', 'Results achieved', 'Timeline to value', 'Client testimonial'] },
      { type: 'two-column', title: 'Investment & ROI', points: ['Solution cost', 'Implementation', 'Expected savings', 'Revenue increase', 'ROI timeline', 'Total value'] },
      { type: 'content', title: 'Implementation Timeline', points: ['Phase 1: Discovery & Setup', 'Phase 2: Implementation', 'Phase 3: Training & Adoption', 'Phase 4: Optimization'] },
      { type: 'conclusion', title: 'Next Steps', points: ['Review this proposal', 'Schedule follow-up call', 'Begin onboarding process'], subtitle: "Let's get started!" }
    ]
  },
  {
    name: 'Marketing Campaign',
    category: 'Marketing',
    description: 'Marketing campaign strategy presentation',
    colors: { primary: 'D946EF', secondary: 'FAE8FF', accent: 'E879F9', background: 'FFFFFF', text: '1F2937' },
    slides: [
      { type: 'title', title: 'Campaign Strategy', subtitle: '[Campaign Name] - Q1 2025' },
      { type: 'content', title: 'Campaign Objectives', points: ['Primary goal and KPI', 'Secondary goal and KPI', 'Target audience definition', 'Success criteria'] },
      { type: 'content', title: 'Target Audience', points: ['Demographics overview', 'Psychographics and behaviors', 'Pain points to address', 'Preferred channels'] },
      { type: 'two-column', title: 'Channel Strategy', points: ['Social Media', 'Email Marketing', 'Content Marketing', 'Paid Advertising', 'SEO/SEM', 'Events'] },
      { type: 'content', title: 'Creative Approach', points: ['Core messaging theme', 'Visual identity guidelines', 'Content types and formats', 'Call-to-action strategy'] },
      { type: 'content', title: 'Budget Allocation', points: ['Total campaign budget', 'Channel-by-channel breakdown', 'Production costs', 'Contingency reserve'] },
      { type: 'conclusion', title: 'Timeline & Milestones', points: ['Week 1-2: Creative development', 'Week 3-4: Launch phase', 'Week 5-8: Optimization', 'Week 9-12: Scale & measure'], subtitle: 'Ready for approval' }
    ]
  },
  {
    name: 'Course Overview',
    category: 'Education',
    description: 'Educational course or training overview',
    colors: { primary: 'F59E0B', secondary: 'FEF3C7', accent: 'FBBF24', background: 'FFFFFF', text: '1F2937' },
    slides: [
      { type: 'title', title: 'Course Title', subtitle: 'Instructor Name | Duration: X Hours' },
      { type: 'content', title: 'Course Objectives', points: ['What you will learn', 'Skills you will develop', 'Knowledge areas covered', 'Practical applications'] },
      { type: 'content', title: 'Who Should Attend', points: ['Target audience description', 'Prerequisites if any', 'Experience level recommended', 'Career relevance'] },
      { type: 'content', title: 'Course Outline', points: ['Module 1: Introduction', 'Module 2: Core Concepts', 'Module 3: Practical Application', 'Module 4: Advanced Topics', 'Module 5: Assessment'] },
      { type: 'two-column', title: 'Learning Methods', points: ['Video lectures', 'Interactive exercises', 'Reading materials', 'Quizzes', 'Group discussions', 'Hands-on projects'] },
      { type: 'quote', title: 'This course transformed how I approach my work', subtitle: 'Previous Student' },
      { type: 'conclusion', title: 'Getting Started', points: ['Enrollment process', 'Required materials', 'First session preparation'], subtitle: 'Questions? Contact us!' }
    ]
  },
  {
    name: 'Monthly Report',
    category: 'Reports',
    description: 'Monthly progress and metrics report',
    colors: { primary: '0891B2', secondary: 'CFFAFE', accent: '06B6D4', background: 'FFFFFF', text: '1F2937' },
    slides: [
      { type: 'title', title: 'Monthly Report', subtitle: 'November 2024' },
      { type: 'content', title: 'Executive Summary', points: ['Key achievement 1', 'Key achievement 2', 'Challenges faced', 'Outlook for next month'] },
      { type: 'two-column', title: 'Key Metrics', points: ['Metric 1: Value', 'vs Target: X%', 'Metric 2: Value', 'vs Target: X%', 'Trend analysis', 'Comparative data'] },
      { type: 'content', title: 'Accomplishments', points: ['Major project completion', 'Process improvement', 'Team milestone', 'Customer success'] },
      { type: 'content', title: 'Challenges & Solutions', points: ['Challenge identified', 'Root cause analysis', 'Solution implemented', 'Results achieved'] },
      { type: 'content', title: 'Resource Utilization', points: ['Budget spend vs allocated', 'Team capacity', 'Tool utilization', 'Efficiency metrics'] },
      { type: 'conclusion', title: 'Next Month Focus', points: ['Priority 1', 'Priority 2', 'Priority 3'], subtitle: 'On track for quarterly goals' }
    ]
  }
];

export async function generateAllTemplates(outputDir: string): Promise<string[]> {
  const generatedFiles: string[] = [];
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (const config of TEMPLATE_CONFIGS) {
    try {
      const pptx = createPresentation(config);
      const fileName = config.name.toLowerCase().replace(/\s+/g, '-') + '.pptx';
      const filePath = path.join(outputDir, fileName);
      
      await pptx.writeFile({ fileName: filePath });
      generatedFiles.push(fileName);
      console.log(`✅ Generated: ${fileName}`);
    } catch (error) {
      console.error(`❌ Failed to generate ${config.name}:`, error);
    }
  }

  return generatedFiles;
}

export async function generateTemplate(config: TemplateConfig, outputPath: string): Promise<void> {
  const pptx = createPresentation(config);
  await pptx.writeFile({ fileName: outputPath });
}

export { TEMPLATE_CONFIGS, TemplateConfig, SlideContent, ThemeColors };
