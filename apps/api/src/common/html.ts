import { decodeHTML } from 'entities';
import sanitizeHtml from 'sanitize-html';
import { canonicalizeAddress, isValidAddress } from './address';

/**
 * The containment line.
 *
 * Author HTML is never trusted and never rendered by React. It goes through one
 * allowlist here: no scripts, no event handlers, no frames, no forms, no
 * external assets, no `javascript:` URLs. Every surviving link is rewritten to
 * a canonical address so the browser chrome, not the page, decides where a
 * click goes.
 *
 * The result is still rendered inside a sandboxed, opaque-origin iframe with a
 * nonce-based CSP; this sanitiser is the first boundary, not the only one.
 */
const ALLOWED_TAGS = [
  'a',
  'abbr',
  'article',
  'aside',
  'b',
  'blockquote',
  'br',
  'caption',
  'cite',
  'code',
  'dd',
  'div',
  'dl',
  'dt',
  'em',
  'figcaption',
  'figure',
  'footer',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'header',
  'hr',
  'i',
  'li',
  'main',
  'mark',
  'nav',
  'ol',
  'p',
  'pre',
  'q',
  's',
  'section',
  'small',
  'span',
  'strong',
  'sub',
  'sup',
  'table',
  'tbody',
  'td',
  'tfoot',
  'th',
  'thead',
  'tr',
  'u',
  'ul',
];

const LENGTH = /^\d{1,3}(?:\.\d{1,2})?(?:px|em|rem|%)?$/;
const COLOR = /^(?:#[0-9a-f]{3,8}|[a-z]{3,20}|rgba?\([\d\s.,%]+\))$/i;

const ALLOWED_STYLES: sanitizeHtml.IOptions['allowedStyles'] = {
  '*': {
    color: [COLOR],
    'background-color': [COLOR],
    'text-align': [/^(?:left|right|center|justify)$/],
    'font-style': [/^(?:italic|normal)$/],
    'font-weight': [/^(?:normal|bold|[1-9]00)$/],
    'text-decoration': [/^(?:none|underline|line-through)$/],
    'margin-left': [LENGTH],
    'padding-left': [LENGTH],
  },
};

const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ALLOWED_TAGS,
  allowedAttributes: {
    a: ['href', 'title', 'rel', 'data-address', 'data-dead'],
    '*': ['style', 'class'],
    td: ['colspan', 'rowspan'],
    th: ['colspan', 'rowspan', 'scope'],
    ol: ['start'],
    li: ['value'],
  },
  allowedStyles: ALLOWED_STYLES,
  allowedSchemes: ['http', 'https'],
  allowProtocolRelative: false,
  disallowedTagsMode: 'discard',
  // These are dropped with their contents, not just their tags.
  nonTextTags: ['script', 'style', 'textarea', 'option', 'noscript', 'iframe', 'object', 'embed', 'template'],
  transformTags: {
    a: (tagName, attribs) => {
      const href = (attribs.href ?? '').trim();
      const next: Record<string, string> = { ...attribs };

      if (href.startsWith('#')) {
        return { tagName, attribs: next };
      }

      const address = canonicalizeAddress(href);
      if (href && isValidAddress(address)) {
        // `/?go=` is a real, no-bridge fallback; the frame's bridge normally
        // intercepts the click and hands the address to the browser chrome.
        next.href = `/?go=${encodeURIComponent(address)}`;
        next['data-address'] = address;
        next.rel = 'nofollow noopener noreferrer';
        delete next['data-dead'];
        return { tagName, attribs: next };
      }

      // Not an address: keep the words, lose the link.
      delete next.href;
      delete next['data-address'];
      next['data-dead'] = 'true';
      return { tagName, attribs: next };
    },
  },
};

export interface RenderedHtml {
  html: string;
  text: string;
}

/** Sanitiser output is the only author markup that ever reaches a screen. */
export function renderAuthorHtml(source: unknown): RenderedHtml {
  const html = typeof source === 'string' ? source : '';
  const safe = sanitizeHtml(html, OPTIONS);
  return { html: safe, text: htmlToText(safe) };
}

export function htmlToText(html: string): string {
  if (!html) return '';
  const spaced = html
    .replace(/<\/(?:p|div|li|h[1-6]|tr|blockquote|pre|dd|dt|figcaption|section|article|header|footer)>/gi, ' $&')
    .replace(/<br\s*\/?>/gi, ' ');
  // sanitize-html re-encodes entities in text output, so decode them here: the
  // plain text is what search indexes and snippets quote.
  const text = decodeHTML(sanitizeHtml(spaced, { allowedTags: [], allowedAttributes: {} }));
  return text.replace(/\s+/g, ' ').trim();
}

/** A window of prose around the first query term, for search results. */
export function makeSnippet(text: string, query: string, radius = 170): string {
  if (!text) return '';
  const terms = query
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((term) => term.length > 1);

  const lower = text.toLowerCase();
  let at = -1;
  for (const term of terms) {
    const index = lower.indexOf(term);
    if (index !== -1 && (at === -1 || index < at)) at = index;
  }
  if (at === -1) at = 0;

  const start = Math.max(0, at - 40);
  const end = Math.min(text.length, start + radius);
  return `${start > 0 ? '…' : ''}${text.slice(start, end).trim()}${end < text.length ? '…' : ''}`;
}
