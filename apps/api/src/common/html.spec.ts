import { htmlToText, makeSnippet, renderAuthorHtml } from './html';

describe('renderAuthorHtml', () => {
  it('keeps the ordinary furniture of a page', () => {
    const { html } = renderAuthorHtml(
      '<h1>Title</h1><p>Some <strong>prose</strong> and <em>emphasis</em>.</p><ul><li>one</li></ul>',
    );
    expect(html).toContain('<h1>Title</h1>');
    expect(html).toContain('<strong>prose</strong>');
    expect(html).toContain('<li>one</li>');
  });

  it('removes scripts together with their contents', () => {
    const { html, text } = renderAuthorHtml(
      '<p>before</p><script>alert("x")</script><p>after</p>',
    );
    expect(html).not.toContain('<script');
    expect(html).not.toContain('alert');
    expect(text).toBe('before after');
  });

  it('removes event handlers and every javascript: URL', () => {
    const { html } = renderAuthorHtml(
      '<img src=x onerror="alert(1)"><a href="javascript:alert(1)">trap</a>' +
        '<p onclick="steal()" style="background:url(javascript:alert(1))">text</p>',
    );
    expect(html).not.toMatch(/onerror|onclick/i);
    expect(html).not.toMatch(/javascript:/i);
    expect(html).not.toContain('<img');
    expect(html).toContain('trap');
  });

  it('drops frames, forms, objects and embeds', () => {
    const { html } = renderAuthorHtml(
      '<iframe src="https://example.test"></iframe>' +
        '<form action="https://example.test"><input name="x"><button>go</button></form>' +
        '<object data="x"></object><embed src="x">',
    );
    expect(html).not.toMatch(/<(iframe|form|input|button|object|embed)/i);
  });

  it('removes style and link elements that could fetch remote assets', () => {
    const { html } = renderAuthorHtml(
      '<link rel="stylesheet" href="https://example.test/a.css"><style>body{background:url(https://example.test/x)}</style><p>safe</p>',
    );
    expect(html).not.toContain('<link');
    expect(html).not.toContain('<style');
    expect(html).not.toContain('example.test');
    expect(html).toBe('<p>safe</p>');
  });

  it('rewrites real links to canonical addresses and marks them for the bridge', () => {
    const { html } = renderAuthorHtml(
      '<a href="HTTPS://Tidepool.zz/notes">tides</a><a href="harbour.zz">harbour</a>',
    );
    expect(html).toContain('data-address="tidepool.zz"');
    expect(html).toContain('data-address="harbour.zz"');
    expect(html).toContain('href="/?go=tidepool.zz"');
    expect(html).toContain('rel="nofollow noopener noreferrer"');
  });

  it('marks a link to a non-address dead and removes its href', () => {
    const { html } = renderAuthorHtml('<a href="tidepool">elsewhere</a>');
    expect(html).toContain('data-dead="true"');
    expect(html).not.toContain('href=');
    expect(html).toContain('elsewhere');
  });

  it('keeps in-page fragment links, because they go nowhere on the network', () => {
    const { html } = renderAuthorHtml('<a href="#notes">notes</a>');
    expect(html).toContain('href="#notes"');
    expect(html).not.toContain('data-dead');
  });

  it('allows a small set of styles and rejects the rest', () => {
    const { html } = renderAuthorHtml(
      '<p style="text-align:center;color:#a8452a;position:fixed;background:url(x)">centred</p>',
    );
    expect(html).toContain('text-align:center');
    expect(html).toContain('color:#a8452a');
    expect(html).not.toContain('position');
    expect(html).not.toContain('url(');
  });

  it('is safe on missing or non-string input', () => {
    expect(renderAuthorHtml(undefined)).toEqual({ html: '', text: '' });
    expect(renderAuthorHtml(12)).toEqual({ html: '', text: '' });
  });
});

describe('htmlToText', () => {
  it('separates blocks with spaces instead of gluing words together', () => {
    expect(htmlToText('<h1>One</h1><p>two</p><p>three</p>')).toBe('One two three');
    expect(htmlToText('a<br>b')).toBe('a b');
  });

  it('decodes entities and collapses whitespace', () => {
    expect(htmlToText('<p>fish &amp; chips</p>')).toBe('fish & chips');
  });
});

describe('makeSnippet', () => {
  const text = `${'x'.repeat(200)} lighthouse keeper ${'y'.repeat(200)}`;

  it('windows the text around the first matching term', () => {
    const snippet = makeSnippet(text, 'lighthouse');
    expect(snippet).toContain('lighthouse keeper');
    expect(snippet.startsWith('…')).toBe(true);
    expect(snippet.length).toBeLessThan(240);
  });

  it('falls back to the start when the term is not present', () => {
    expect(makeSnippet('short text', 'absent')).toBe('short text');
    expect(makeSnippet('', 'anything')).toBe('');
  });
});
