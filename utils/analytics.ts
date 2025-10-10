/**
 * Utility functions for analytics and PostHog integration
 */

/**
 * Normalizes a pathname from expo-router to a readable screen name for PostHog
 * Examples:
 * - "/" -> "Home"
 * - "/onboarding/welcome" -> "Onboarding - Welcome"
 * - "/settings/notifications" -> "Settings - Notifications"
 * - "/categories/custom-quotes" -> "Categories - Custom Quotes"
 */
export function normalizeScreenName(pathname: string): string {
  // Remove leading and trailing slashes
  const cleanPath = pathname.replace(/^\/|\/$/g, '');

  // Handle root path
  if (cleanPath === '' || cleanPath === 'index') {
    return 'Home';
  }

  // Split into segments
  const segments = cleanPath.split('/');

  // Capitalize and format each segment
  const formattedSegments = segments.map(segment => {
    // Convert kebab-case to Title Case (e.g., "custom-quotes" -> "Custom Quotes")
    return segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  });

  // Join with " - " separator
  return formattedSegments.join(' - ');
}
