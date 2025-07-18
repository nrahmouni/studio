
import {
  createLocalizedPathnamesNavigation
} from 'next-intl/navigation';
 
export const locales = ['en', 'es', 'fr'] as const;
export const localePrefix = 'as-needed';
 
export const { Link, redirect, usePathname, useRouter } =
  createLocalizedPathnamesNavigation({ locales, localePrefix });
