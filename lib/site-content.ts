import { promises as fs } from 'fs';
import path from 'path';
import sanitizeHtml from 'sanitize-html';

const contentPath = path.join(process.cwd(), 'data', 'site-content.json');
const defaultHtml = '<h1>Welcome to Carnival</h1><p>Your editable landing page content.</p>';

export function sanitizePageHtml(html: string) {
  return sanitizeHtml(html, {
    allowedTags: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'strong', 'b', 'em', 'i',
      'u', 's', 'strike', 'del', 'blockquote', 'ul', 'ol', 'li', 'a', 'span', 'pre', 'code',
    ],
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
      span: ['style'],
      p: ['style'],
      h1: ['style'], h2: ['style'], h3: ['style'], h4: ['style'],
    },
    allowedStyles: {
      '*': {
        'font-size': [/^(?:[1-9]|[1-6][0-9]|7[0-2])(?:px|pt|em|rem|%)$/],
        'text-align': [/^(?:left|right|center|justify)$/],
      },
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }, true),
    },
  });
}

export async function readSiteContent() {
  try {
    const parsed = JSON.parse(await fs.readFile(contentPath, 'utf8')) as { html?: unknown };
    return { html: sanitizePageHtml(typeof parsed.html === 'string' ? parsed.html : defaultHtml) };
  } catch {
    return { html: defaultHtml };
  }
}
