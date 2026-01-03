import { Outlet, Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Receipt, LogOut, Wallet, Menu, X, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import TransactionModal from '@/components/TransactionModal'

export default function Layout() {
    const location = useLocation()
    const navigate = useNavigate()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [user, setUser] = useState<any>(null)

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
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: Receipt, label: 'Transações', path: '/transactions' },
    ]

    const NavContent = () => (
        <>
            <div className="flex items-center gap-2 px-2 font-bold text-xl mb-8">
                <Wallet className="w-8 h-8 text-primary shadow-sm" />
                <span className="tracking-tight">Finance.app</span>
            </div>

            <nav className="flex flex-col gap-2 flex-1">
                {navItems.map((item) => (
                    <Link key={item.path} to={item.path} onClick={() => setIsMobileMenuOpen(false)}>
                        <Button
                            variant={location.pathname === item.path ? 'secondary' : 'ghost'}
                            className={`w-full justify-start gap-3 h-11 px-4 transition-all ${location.pathname === item.path
                                ? 'bg-primary/10 text-primary hover:bg-primary/20 font-bold'
                                : 'hover:bg-muted font-medium'
                                }`}
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </Button>
                    </Link>
                ))}

                <div className="mt-4 pt-4 border-t border-border/50">
                    <Button
                        onClick={() => {
                            setIsModalOpen(true)
                            setIsMobileMenuOpen(false)
                        }}
                        className="w-full justify-start gap-3 h-11 px-4 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 font-bold transition-all hover:scale-[1.02]"
                    >
                        <Plus className="w-5 h-5" />
                        Nova Transação
                    </Button>
                </div>
            </nav>

            <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-11 px-4 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors mt-auto"
                onClick={handleLogout}
            >
                <LogOut className="w-5 h-5" />
                Sair
            </Button>
        </>
    )

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans antialiased flex flex-col md:flex-row relative">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-72 flex-col border-r border-border/50 bg-white px-6 py-8 h-screen sticky top-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
                <NavContent />
            </aside>

            {/* Mobile Header */}
            <header className="md:hidden flex items-center justify-between p-4 border-b border-border/50 bg-white sticky top-0 z-50 shadow-sm backdrop-blur-md bg-white/80">
                <div className="flex items-center gap-2 font-bold text-lg">
                    <Wallet className="w-6 h-6 text-primary" />
                    <span>Finance.app</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="rounded-full">
                    {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </Button>
            </header>

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-all duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Sidebar Drawer */}
            <aside className={`md:hidden fixed top-0 left-0 bottom-0 w-[80%] max-w-[300px] bg-white z-50 p-6 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <NavContent />
            </aside>

            {/* Main Content */}
            <main className="flex-1 w-full flex flex-col">
                <div className="flex-1 p-5 md:p-10 max-w-6xl mx-auto w-full">
                    <Outlet />
                </div>
            </main>

            {user && (
                <TransactionModal
                    isOpen={isModalOpen}
                    onOpenChange={setIsModalOpen}
                    userId={user.id}
                    onSuccess={() => {
                        // We need a way to refresh the current page's data
                        // This is usually done with a global store (Zustand/Redux) or a context
                        // For MVP, we'll just window.location.reload() or let the user navigate
                        window.location.reload()
                    }}
                />
            )}
        </div>
    )
}
