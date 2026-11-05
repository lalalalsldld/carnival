import sanitizeHtml from 'sanitize-html';
import { readAppData } from '@/lib/db';

const defaultHtml = '<h1>Welcome to Carnival</h1><p>Your editable landing page content.</p>';

export function sanitizePageHtml(html: string) {
  return sanitizeHtml(html, {
    allowedTags: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'del', 'blockquote', 'ul', 'ol', 'li', 'a', 'span', 'pre', 'code'],
    allowedAttributes: { a: ['href', 'target', 'rel'], span: ['style'], p: ['style'], h1: ['style'], h2: ['style'], h3: ['style'], h4: ['style'] },
    allowedStyles: { '*': { 'font-size': [/^(?:[1-9]|[1-6][0-9]|7[0-2])(?:px|pt|em|rem|%)$/], 'text-align': [/^(?:left|right|center|justify)$/] } },
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: { a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }, true) },
  });
}

export async function readSiteContent() {
  try {
    const content = await readAppData<{ html?: unknown }>('site-content', { html: defaultHtml });
    return { html: sanitizePageHtml(typeof content.html === 'string' ? content.html : defaultHtml) };
  } catch (error) {
    console.error('Unable to read persistent page content:', error);
    return { html: defaultHtml };
  }
}
