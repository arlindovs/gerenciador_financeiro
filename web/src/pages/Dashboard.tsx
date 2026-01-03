
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { KPIs } from '@/components/KPIs'
import { FinanceCharts } from '@/components/FinanceCharts'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'

export default function Dashboard() {
    const [transactions, setTransactions] = useState<any[]>([])
    const [allTransactions, setAllTransactions] = useState<any[]>([])
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
    const navigate = useNavigate()

    useEffect(() => {
        supabase.auth.getUser().then(({ data }: { data: { user: any } }) => {
            if (!data.user) {
                navigate('/login')
            } else {
                fetchTransactions()
            }
        })
    }, [navigate])

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

    const filterByMonth = (data: any[], month: number, year: number) => {
        const filtered = data.filter(t => {
            const date = new Date(t.date)
            return date.getMonth() === month && date.getFullYear() === year
        })
        setTransactions(filtered)
    }

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
        <div className="space-y-6 animate-in fade-in duration-500 pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Dashboard</h1>
                    <p className="text-muted-foreground font-medium">Sua saúde financeira em um relance.</p>
                </div>

                {/* Month Selector */}
                <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm self-stretch md:self-auto">
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg" onClick={prevMonth}>
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <div className="flex items-center gap-2 px-3 min-w-[160px] justify-center">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="text-sm font-bold capitalize">{monthName}</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg" onClick={nextMonth}>
                        <ChevronRight className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* Main Balance Card */}
            <Card className="shadow-2xl bg-gradient-to-br from-indigo-700 via-primary to-indigo-800 text-primary-foreground border-none overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                    <svg width="140" height="140" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                </div>
                <CardContent className="pt-10 pb-12 px-10 relative">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                        <div>
                            <p className="text-indigo-100 font-bold uppercase tracking-widest text-xs mb-2 opacity-80">Saldo no Período</p>
                            <h2 className="text-6xl font-black tracking-tighter drop-shadow-sm">
                                R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </h2>
                        </div>
                        <div className="flex gap-8 w-full md:w-auto">
                            <div className="space-y-1">
                                <p className="text-[10px] text-indigo-100 font-black uppercase tracking-widest opacity-60">Entradas</p>
                                <p className="text-2xl font-black text-emerald-400 leading-none">R$ {income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                            </div>
                            <div className="space-y-1 border-l border-white/10 pl-8">
                                <p className="text-[10px] text-indigo-100 font-black uppercase tracking-widest opacity-60">Saídas</p>
                                <p className="text-2xl font-black text-rose-400 leading-none">R$ {expense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Advanced KPIs - Pass the filtered transactions */}
            <KPIs transactions={transactions} />

            {/* Charts Section - In a real app we might want the chart to show more than just the current month, but for now we follow the period selector or keep it 6 months */}
            <FinanceCharts transactions={transactions} />

            {/* Dashboard Footer / Actions */}
            <div className="pt-6 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                <p>Visão baseada em {transactions.length} lançamentos de {monthName}</p>
                <Button variant="link" onClick={() => navigate('/transactions')} className="font-black text-primary hover:no-underline">Ver histórico completo &rarr;</Button>
            </div>
        </div>
    )
}
