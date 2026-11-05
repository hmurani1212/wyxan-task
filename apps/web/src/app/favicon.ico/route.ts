/**
 * Browsers still ask for /favicon.ico even when a modern icon is advertised.
 * Point it at the real icon instead of answering 404.
 */
export function GET(request: Request): Response {
  return Response.redirect(new URL('/icon.svg', request.url), 307);
}
