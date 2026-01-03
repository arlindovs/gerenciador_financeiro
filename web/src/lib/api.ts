/**
 * API Configuration
 * Configures the base URL for API requests based on environment.
 * Uses VITE_API_URL in production, defaults to localhost:3000 in development.
 */

// API base URL from environment variable or fallback to localhost for development
// Em produção, VITE_API_URL deve apontar para o backend (ex: https://gerenciador-financeiro-steel.vercel.app)
// In production, VITE_API_URL should point to the backend (ex: https://gerenciador-financeiro-steel.vercel.app)
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

/**
 * Helper function to build API endpoints
 * @param path - The API path (e.g., '/transactions', '/categories')
 * @returns Full API URL
 */
export const apiUrl = (path: string): string => {
    const cleanPath = path.startsWith('/') ? path : `/${path}`
    return `${API_BASE_URL}${cleanPath}`
}
