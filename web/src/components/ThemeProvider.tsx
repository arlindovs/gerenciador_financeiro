import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { type ThemeProviderProps } from 'next-themes'

/**
 * ThemeProvider component to manage Light, Dark, and Pink themes.
 * Provedor de temas para gerenciar os temas Light, Dark e Pink.
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
    return (
        <NextThemesProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            themes={['light', 'dark', 'pink']}
            {...props}
        >
            {children}
        </NextThemesProvider>
    )
}
