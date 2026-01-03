import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { KPIs, CountUp } from '@/components/KPIs'
import { FinanceCharts } from '@/components/FinanceCharts'
import { ChevronLeft, ChevronRight, Calendar, DollarSign, ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Dashboard() {
    const [transactions, setTransactions] = useState<any[]>([])
    const [allTransactions, setAllTransactions] = useState<any[]>([])
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
    const navigate = useNavigate()

    const filterByMonth = (data: any[], month: number, year: number) => {
        const filtered = data.filter(t => {
            const date = new Date(t.date)
            return date.getMonth() === month && date.getFullYear() === year
        })
        setTransactions(filtered)
    }

    const fetchTransactions = async () => {
        const { data } = await supabase
            .from('transactions')
            .select('*, categories(*)')
            .order('date', { ascending: false })

        if (data) {
            setAllTransactions(data)
            filterByMonth(data, currentMonth, currentYear)
        }
    }

    useEffect(() => {
        supabase.auth.getUser().then(({ data }: { data: { user: any } }) => {
            if (!data.user) {
                navigate('/login')
            } else {
                fetchTransactions()
            }
        })
    }, [navigate])

    useEffect(() => {
        if (allTransactions.length > 0) {
            filterByMonth(allTransactions, currentMonth, currentYear)
        }
    }, [currentMonth, currentYear, allTransactions])

    const nextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0)
            setCurrentYear(currentYear + 1)
        } else {
            setCurrentMonth(currentMonth + 1)
        }
    }

    const prevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11)
            setCurrentYear(currentYear - 1)
        } else {
            setCurrentMonth(currentMonth - 1)
        }
    }

    const monthName = new Date(currentYear, currentMonth).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

    const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0)
    const expense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0)
    const balance = income - expense

    return (
        <div className="space-y-8 pb-12">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-foreground">Dashboard</h1>
                    <p className="text-muted-foreground font-medium text-lg">Seu resumo financeiro.</p>
                </div>

                {/* Month Selector */}
                <div className="flex items-center gap-1 bg-card/50 backdrop-blur-xl p-1.5 rounded-2xl border border-border/50 shadow-xl self-stretch md:self-auto">
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-muted" onClick={prevMonth}>
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <div className="flex items-center gap-3 px-4 min-w-[180px] justify-center">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="text-sm font-black capitalize tracking-tight">{monthName}</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-muted" onClick={nextMonth}>
                        <ChevronRight className="w-5 h-5" />
                    </Button>
                </div>
            </header>

            {/* Premium Balance Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
            >
                <Card className="relative overflow-hidden border-none shadow-2xl bg-gradient-to-br from-primary via-indigo-600 to-violet-700 text-primary-foreground rounded-[2.5rem]">
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-black/20 rounded-full blur-3xl" />

                    <CardContent className="pt-12 pb-14 px-8 md:px-12 relative">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-md">
                                        <DollarSign className="w-6 h-6" />
                                    </div>
                                    <span className="font-black uppercase tracking-[0.2em] text-[10px] text-white/70">Saldo Total</span>
                                </div>
                                <h2 className="text-5xl md:text-7xl font-black tracking-tighter drop-shadow-md">
                                    <CountUp value={balance} prefix="R$ " />
                                </h2>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <motion.div
                                    whileHover={{ y: -5 }}
                                    className="p-6 bg-white/10 backdrop-blur-xl rounded-[2rem] border border-white/10 space-y-2 shadow-inner"
                                >
                                    <div className="flex items-center gap-2 text-emerald-300">
                                        <ArrowUpRight className="w-4 h-4" />
                                        <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Entradas</span>
                                    </div>
                                    <p className="text-xl md:text-2xl font-black truncate">
                                        <CountUp value={income} prefix="R$ " />
                                    </p>
                                </motion.div>

                                <motion.div
                                    whileHover={{ y: -5 }}
                                    className="p-6 bg-black/10 backdrop-blur-xl rounded-[2rem] border border-white/5 space-y-2 shadow-inner"
                                >
                                    <div className="flex items-center gap-2 text-rose-300">
                                        <ArrowDownLeft className="w-4 h-4" />
                                        <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Saídas</span>
                                    </div>
                                    <p className="text-xl md:text-2xl font-black truncate">
                                        <CountUp value={expense} prefix="R$ " />
                                    </p>
                                </motion.div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Advanced KPIs */}
            <KPIs transactions={transactions} />

            {/* Charts Section */}
            <div className="grid grid-cols-1 gap-8">
                <Card className="rounded-[2.5rem] border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden p-6 shadow-xl">
                    <FinanceCharts transactions={transactions} />
                </Card>
            </div>

            {/* Dashboard Footer */}
            <footer className="pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                <p className="opacity-60">Baseado em {transactions.length} lançamentos • {monthName}</p>
                <Button
                    variant="link"
                    onClick={() => navigate('/transactions')}
                    className="font-black text-primary hover:no-underline p-0 h-auto"
                >
                    Ver histórico completo &rarr;
                </Button>
            </footer>
        </div>
    )
}
