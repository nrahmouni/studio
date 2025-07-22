
'use client';

// This component wraps parts of the app that need client-side hooks
// to avoid forcing parent layouts into client components.
// It currently does not need any hooks itself, but serves as a boundary.
export function AppProvider({ children }: { children: React.ReactNode }) {
  // If we needed client-side context or effects for the whole app, they would go here.
  return <>{children}</>;
}
