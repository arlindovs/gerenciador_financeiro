/**
 * API Configuration
 * Configures the base URL for API requests.
 * Uses relative paths (/api) which work with both:
 * - Local dev: Vite proxy forwards /api to localhost:3000
 * - Production: Vercel rewrites /api to the serverless function
 */

// API base URL - uses relative path to avoid CORS issues
// Em produção e desenvolvimento, sempre usa /api (relativo)
// In production and development, always uses /api (relative)
export const API_BASE_URL = '/api'

/**
 * Helper function to build API endpoints
 * @param path - The API path (e.g., '/transactions', '/categories')
 * @returns Full API URL
 */
export const apiUrl = (path: string): string => {
    const cleanPath = path.startsWith('/') ? path : `/${path}`
    return `${API_BASE_URL}${cleanPath}`
}

