'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { SitePage } from '@/lib/types';

/**
 * Pages are rendered in an iframe with an opaque origin.
 *
 * The sanitiser on the server is the first boundary; this is the second. The
 * frame is sandboxed without `allow-same-origin`, so even a sanitiser bypass
 * cannot reach this window's DOM, storage or cookies. The only script allowed
 * to run is the bridge below, pinned by a CSP nonce. Its whole job is to
 * measure the document and hand link clicks back up as addresses.
 */
const FRAME_STYLES = `
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    background: #fffdf8;
    color: #1c2a34;
    font-family: "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif;
    font-size: 18px;
    line-height: 1.72;
    padding: 38px 46px 54px;
    overflow-wrap: break-word;
  }
  @media (max-width: 640px) { body { padding: 26px 22px 38px; font-size: 17px; } }
  h1, h2, h3, h4 { font-family: "Space Grotesk", "Segoe UI", system-ui, sans-serif; line-height: 1.15; letter-spacing: -0.01em; }
  h1 { font-size: 34px; margin: 0 0 20px; font-weight: 600; }
  h2 { font-size: 23px; margin: 34px 0 12px; font-weight: 600; }
  h3 { font-size: 18px; margin: 26px 0 10px; font-weight: 600; }
  p { margin: 0 0 16px; }
  a { color: #1f5fa8; text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 3px; }
  a:hover { color: #14406f; }
  a[data-dead] { color: #8b7c66; text-decoration: line-through; cursor: not-allowed; }
  strong, b { font-weight: 700; }
  blockquote {
    margin: 22px 0; padding: 2px 0 2px 20px;
    border-left: 3px solid #d9cbb3; color: #43535f;
    font-style: italic;
  }
  blockquote p { margin: 0 0 8px; }
  blockquote p:last-child { margin-bottom: 0; }
  ul, ol { margin: 0 0 18px; padding-left: 24px; }
  li { margin: 0 0 7px; }
  code, pre { font-family: "IBM Plex Mono", ui-monospace, Consolas, monospace; font-size: 0.86em; }
  pre { background: #f2efe7; border: 1px solid #e1dbcd; border-radius: 8px; padding: 14px 16px; overflow-x: auto; }
  hr { border: 0; border-top: 1px solid #e3ddd1; margin: 28px 0; }
  table { border-collapse: collapse; width: 100%; margin: 18px 0; font-size: 0.92em; }
  th, td { border-bottom: 1px solid #e3ddd1; padding: 8px 10px; text-align: left; vertical-align: top; }
  th { font-family: "Space Grotesk", system-ui, sans-serif; font-size: 0.82em; letter-spacing: 0.06em; text-transform: uppercase; color: #6d7a84; }
  figure { margin: 22px 0; }
  figcaption { font-size: 0.82em; color: #6d7a84; font-style: italic; }
  mark { background: #f8e3bd; }
  small { font-size: 0.82em; color: #6d7a84; }
`;

function randomToken(): string {
  const bytes = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function bridgeScript(channel: string): string {
  return `
(function () {
  var channel = "${channel}";
  function send(message) {
    message.channel = channel;
    if (parent) parent.postMessage(message, "*");
  }
  function measure() {
    var doc = document.documentElement;
    var body = document.body;
    send({ type: "height", height: Math.max(doc ? doc.scrollHeight : 0, body ? body.scrollHeight : 0) });
  }
  document.addEventListener("click", function (event) {
    var node = event.target;
    while (node && node.nodeName !== "A") node = node.parentNode;
    if (!node) return;
    event.preventDefault();
    var address = node.getAttribute("data-address");
    var href = node.getAttribute("href") || "";
    if (address) {
      send({ type: "navigate", address: address });
    } else if (href.charAt(0) === "#") {
      var target = document.getElementById(href.slice(1));
      if (target && target.scrollIntoView) target.scrollIntoView();
    } else {
      send({ type: "dead" });
    }
  });
  window.addEventListener("load", measure);
  if (window.ResizeObserver) new ResizeObserver(measure).observe(document.documentElement);
  setTimeout(measure, 80);
  measure();
})();
`;
}

export function buildSrcDoc(page: SitePage, channel: string): string {
  const nonce = channel;
  const csp = [
    "default-src 'none'",
    `script-src 'nonce-${nonce}'`,
    "style-src 'unsafe-inline'",
    'img-src data:',
    'font-src data:',
    "base-uri 'none'",
    "form-action 'none'",
  ].join('; ');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="${csp}">
<title>${(page.title ?? page.address).replace(/[<>&"]/g, ' ')}</title>
<style>${FRAME_STYLES}</style>
</head>
<body>
${page.html ?? ''}
<script nonce="${nonce}">${bridgeScript(channel)}</script>
</body>
</html>`;
}

export function PageFrame({
  page,
  onNavigate,
  onDeadLink,
  onHeight,
}: {
  page: SitePage;
  onNavigate: (address: string) => void;
  onDeadLink: () => void;
  onHeight?: (height: number) => void;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(560);
  const channel = useMemo(() => randomToken(), [page.html, page.address]);
  const srcDoc = useMemo(() => buildSrcDoc(page, channel), [page, channel]);

  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow) return;
      const data = event.data as { channel?: string; type?: string; address?: unknown; height?: unknown };
      if (!data || data.channel !== channel) return;

      if (data.type === 'height' && typeof data.height === 'number') {
        const next = Math.max(240, Math.min(30_000, Math.round(data.height)));
        setHeight(next);
        onHeight?.(next);
      }
      if (data.type === 'navigate' && typeof data.address === 'string') {
        onNavigate(data.address);
      }
      if (data.type === 'dead') onDeadLink();
    };

    window.addEventListener('message', receive);
    return () => window.removeEventListener('message', receive);
  }, [channel, onNavigate, onDeadLink, onHeight]);

  return (
    <iframe
      ref={iframeRef}
      className="page-frame"
      title={page.title ?? page.address}
      srcDoc={srcDoc}
      sandbox="allow-scripts"
      referrerPolicy="no-referrer"
      style={{ height }}
    />
  );
}
