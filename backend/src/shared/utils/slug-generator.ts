/**
 * Generate a URL-safe slug from a text string.
 *
 * Rules:
 * - Convert to lowercase
 * - Normalize unicode (NFKD, strip combining marks)
 * - Replace non-alphanumeric characters with hyphens
 * - Collapse multiple hyphens into one
 * - Trim leading/trailing hyphens
 *
 * Examples:
 *   "Premium Wireless Headphones!" → "premium-wireless-headphones"
 *   "  Hello   World  "           → "hello-world"
 *   "Café & Bar"                  → "cafe-bar"
 *
 * Note: Does NOT check database uniqueness — that is a business/service concern.
 */
export const generateSlug = (text: string): string => {
  return text
    .normalize('NFKD')                        // Decompose unicode (e.g. é → e + combining)
    .replace(/[\u0300-\u036f]/g, '')          // Remove combining diacritical marks
    .toLowerCase()                             // Lowercase
    .replace(/[^a-z0-9\s-]/g, '')            // Remove non-alphanumeric (except spaces & hyphens)
    .replace(/[\s_]+/g, '-')                  // Replace whitespace and underscores with hyphens
    .replace(/-+/g, '-')                      // Collapse multiple hyphens
    .replace(/^-+|-+$/g, '');                 // Trim leading/trailing hyphens
};

export default generateSlug;
