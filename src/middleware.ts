import createMiddleware from 'next-intl/middleware';
import {locales, localePrefix} from './navigation';
 
export default createMiddleware({
  // A list of all locales that are supported
  locales,
  localePrefix,
 
  // Used when no locale matches
  defaultLocale: 'es'
});
 
export const config = {
  // Match only internationalized pathnames
  // The matcher is configured to run on all paths except for static assets.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};
