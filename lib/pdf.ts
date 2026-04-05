import { marked } from 'marked';
import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';

/**
 * Convert markdown to HTML with styling
 */
export function convertMarkdownToHTML(markdown: string): string {
  const html = marked(markdown);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page {
      margin: 0.75in;
    }
    body {
      font-family: 'Helvetica', 'Arial', sans-serif;
      font-size: 11pt;
      line-height: 1.4;
      color: #333;
      max-width: 100%;
    }
    h1 {
      font-size: 24pt;
      margin-bottom: 8pt;
      color: #1a1a1a;
      border-bottom: 2px solid #333;
      padding-bottom: 4pt;
    }
    h2 {
      font-size: 14pt;
      margin-top: 16pt;
      margin-bottom: 8pt;
      color: #1a1a1a;
      border-bottom: 1px solid #ccc;
      padding-bottom: 2pt;
    }
    h3 {
      font-size: 12pt;
      margin-top: 12pt;
      margin-bottom: 6pt;
      color: #1a1a1a;
    }
    p {
      margin: 6pt 0;
    }
    ul, ol {
      margin: 6pt 0;
      padding-left: 20pt;
    }
    li {
      margin: 3pt 0;
    }
    strong {
      font-weight: 600;
      color: #1a1a1a;
    }
    a {
      color: #0066cc;
      text-decoration: none;
    }
    code {
      background: #f4f4f4;
      padding: 2px 4px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
      font-size: 10pt;
    }
    pre {
      background: #f4f4f4;
      padding: 8pt;
      border-radius: 4px;
      overflow-x: auto;
    }
    pre code {
      background: none;
      padding: 0;
    }
  </style>
</head>
<body>
  ${html}
</body>
</html>
  `;
}

/**
 * Export resume markdown to PDF
 */
export async function exportResumeToPDF(
  markdown: string,
  outputPath: string
): Promise<string> {
  // Ensure output directory exists
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Convert markdown to HTML
  const html = convertMarkdownToHTML(markdown);

  // Launch browser and generate PDF
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    await page.pdf({
      path: outputPath,
      format: 'Letter',
      margin: {
        top: '0.75in',
        right: '0.75in',
        bottom: '0.75in',
        left: '0.75in',
      },
      printBackground: true,
    });

    return outputPath;
  } finally {
    await browser.close();
  }
}

/**
 * Generate PDF filename for a job
 */
export function generatePDFFilename(company: string, role: string): string {
  const sanitized = `${company}_${role}`
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .toLowerCase();

  const timestamp = new Date().toISOString().split('T')[0];
  return `resume_${sanitized}_${timestamp}.pdf`;
}
