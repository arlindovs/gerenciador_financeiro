import { Outlet, Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Receipt, LogOut, Wallet, Plus, BarChart3, Moon, Sun, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import TransactionModal from '@/components/TransactionModal'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from 'next-themes'

/**
 * Modern Layout with Bottom Navigation Bar and Glassmorphism.
 * Layout moderno com Bottom Navigation Bar e efeito Glassmorphism.
 */
export default function Layout() {
    const location = useLocation()
    const navigate = useNavigate()
    const { theme, setTheme } = useTheme()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [user, setUser] = useState<any>(null)
    const [mounted, setMounted] = useState(false)

    // Avoid hydration mismatch
    useEffect(() => setMounted(true), [])

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            if (data.user) setUser(data.user)
        })
    }, [])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        navigate('/login')
    }

    const navItems = [
        { icon: LayoutDashboard, label: 'Início', path: '/' },
        { icon: Receipt, label: 'Transações', path: '/transactions' },
        { icon: null, label: 'Add', path: 'special' }, // Centered button
        { icon: Wallet, label: 'Categorias', path: '/categories' },
        { icon: BarChart3, label: 'Gráficos', path: '/charts' },
    ]

    if (!mounted) return null

    return (
        <div className="min-h-screen bg-background text-foreground font-sans antialiased flex flex-col pb-24 md:pb-0 md:pl-72 transition-colors duration-300">
            {/* Desktop Sidebar (Optional, but kept for desktop usability) */}
            <aside className="hidden md:flex w-72 flex-col border-r border-border bg-card/50 backdrop-blur-xl px-6 py-8 fixed inset-y-0 left-0 z-40">
                <div className="flex items-center gap-3 px-2 font-bold text-2xl mb-10 text-primary">
                    <div className="p-2 bg-primary/10 rounded-xl">
                        <Wallet className="w-8 h-8" />
                    </div>
                    <span className="tracking-tight">Finance.</span>
                </div>

                <nav className="flex flex-col gap-2 flex-1">
                    {navItems.filter(i => i.icon).map((item) => (
                        <Link key={item.path} to={item.path}>
                            <Button
                                variant={location.pathname === item.path ? 'secondary' : 'ghost'}
                                className={`w-full justify-start gap-3 h-12 px-4 rounded-xl transition-all duration-200 ${location.pathname === item.path
                                    ? 'bg-primary/10 text-primary hover:bg-primary/20 font-bold'
                                    : 'hover:bg-muted/50 font-medium text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                {item.icon && <item.icon className="w-5 h-5" />}
                                {item.label}
                            </Button>
                        </Link>
                    ))}
                </nav>

                <div className="mt-auto space-y-4">
                    <div className="flex items-center justify-between p-2 bg-muted/30 rounded-2xl border border-border/50">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setTheme('light')}
                            className={`rounded-xl ${theme === 'light' ? 'bg-background shadow-sm text-primary' : ''}`}
                        >
                            <Sun className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setTheme('dark')}
                            className={`rounded-xl ${theme === 'dark' ? 'bg-background shadow-sm text-primary' : ''}`}
                        >
                            <Moon className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setTheme('pink')}
                            className={`rounded-xl ${theme === 'pink' ? 'bg-background shadow-sm text-primary' : ''}`}
                        >
                            <Heart className="w-4 h-4" />
                        </Button>
                    </div>

                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 h-12 px-4 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors rounded-xl"
                        onClick={handleLogout}
                    >
                        <LogOut className="w-5 h-5" />
                        Sair
                    </Button>
                </div>
            </aside>

            {/* Mobile Header */}
            <header className="md:hidden flex items-center justify-between p-6 bg-background/80 backdrop-blur-md sticky top-0 z-40 border-b border-border/50">
                <div className="flex items-center gap-2 font-bold text-xl text-primary">
                    <Wallet className="w-6 h-6" />
                    <span>Finance.</span>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="secondary"
                        size="icon"
                        className="rounded-full w-10 h-10 shadow-sm"
                        onClick={() => setTheme(theme === 'light' ? 'dark' : theme === 'dark' ? 'pink' : 'light')}
                    >
                        {theme === 'light' ? <Sun className="w-5 h-5" /> : theme === 'dark' ? <Moon className="w-5 h-5" /> : <Heart className="w-5 h-5" />}
                    </Button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-6 md:px-10 md:py-10">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                        <Outlet />
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Bottom Navigation Bar */}
            <nav className="md:hidden fixed bottom-6 left-6 right-6 h-16 bg-card/80 backdrop-blur-2xl border border-border/50 rounded-3xl shadow-2xl z-50 flex items-center justify-around px-2">
                {navItems.map((item) => {
                    if (item.path === 'special') {
                        return (
                            <div key="add-btn" className="relative -top-6">
                                <Button
                                    onClick={() => setIsModalOpen(true)}
                                    className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground shadow-[0_8px_30px_rgb(var(--primary)/0.4)] hover:scale-110 active:scale-95 transition-all duration-300 border-4 border-background"
                                >
                                    <Plus className="w-8 h-8" />
                                </Button>
                            </div>
                        )
                    }

                    const isActive = location.pathname === item.path
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className="relative flex flex-col items-center justify-center p-2 rounded-2xl transition-colors group"
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="nav-glow"
                                    className="absolute inset-0 bg-primary/10 rounded-2xl -z-10"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            {item.icon && (
                                <item.icon
                                    className={`w-6 h-6 transition-all duration-300 ${isActive ? 'text-primary scale-110' : 'text-muted-foreground group-hover:text-foreground'}`}
                                />
                            )}
                            <span className={`text-[10px] mt-1 font-medium transition-all duration-300 ${isActive ? 'text-primary' : 'text-muted-foreground opacity-70'}`}>
                                {item.label}
                            </span>
                        </Link>
                    )
                })}
            </nav>

            {user && (
                <TransactionModal
                    isOpen={isModalOpen}
                    onOpenChange={setIsModalOpen}
                    userId={user.id}
                    onSuccess={() => {
                        window.location.reload()
                    }}
                />
            )}
        </div>
    )
}
