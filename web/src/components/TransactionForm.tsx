import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase'
import { apiUrl } from '@/lib/api'
import { Sparkles, Loader2, Calendar as CalendarIcon, Wallet, Layers, Repeat } from 'lucide-react'

interface TransactionFormProps {
    onSuccess: () => void
    user_id: string
    initialData?: any
}

export default function TransactionForm({ onSuccess, user_id, initialData }: TransactionFormProps) {
    const [description, setDescription] = useState(initialData?.description || '')
    const [amount, setAmount] = useState(initialData?.amount?.toString() || '')
    const [type, setType] = useState<'income' | 'expense'>(initialData?.type || 'expense')
    const [loading, setLoading] = useState(false)
    const [suggesting, setSuggesting] = useState(false)
    const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0])
    const [categoryList, setCategoryList] = useState<any[]>([])
    const [categoryId, setCategoryId] = useState(initialData?.category_id || '')

    // Advanced features
    const [isRecurring, setIsRecurring] = useState(initialData?.is_recurring || false)
    const [installments, setInstallments] = useState(initialData?.total_installments?.toString() || '1')

    const fetchCategories = async () => {
        const { data } = await supabase.from('categories').select('*').eq('type', type)
        if (data) {
            setCategoryList(data)
            if (initialData?.category_id && data.find(c => c.id === initialData.category_id)) {
                setCategoryId(initialData.category_id)
            } else if (data.length > 0) {
                setCategoryId(data[0].id)
            }
        }
    }

    useEffect(() => {
        fetchCategories()
    }, [type])

    const handleSuggestCategory = async () => {
        if (!description || !amount) return
        setSuggesting(true)
        try {
            const { data: { session } } = await supabase.auth.getSession()
            const res = await fetch(apiUrl('/ai/categorize'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                },
                body: JSON.stringify({ description, amount: parseFloat(amount) })
            })

            const data = await res.json()
            const found = categoryList.find(c => c.name.toLowerCase() === data.category.toLowerCase())
            if (found) setCategoryId(found.id)
        } catch (err) {
            console.error('AI Suggestion error:', err)
        } finally {
            setSuggesting(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const { data: { session } } = await supabase.auth.getSession()
            const isEditing = !!initialData?.id
            const url = isEditing
                ? apiUrl(`/transactions/${initialData.id}`)
                : apiUrl('/transactions')

            const res = await fetch(url, {
                method: isEditing ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                },
                body: JSON.stringify({
                    description,
                    amount: parseFloat(amount),
                    type,
                    date,
                    category_id: categoryId,
                    user_id,
                    total_installments: parseInt(installments),
                    is_recurring: isRecurring
                })
            })

            if (!res.ok) throw new Error('Failed to save')
            onSuccess()
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Type Toggle */}
            <div className="flex p-1.5 bg-muted/50 backdrop-blur-md rounded-[2rem] gap-1 border border-border/50">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setType('income')}
                    className={`flex-1 h-12 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all duration-300 ${type === 'income' ? 'bg-revenue text-white shadow-xl scale-100' : 'text-muted-foreground opacity-50 scale-95'
                        }`}
                >
                    Receita
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setType('expense')}
                    className={`flex-1 h-12 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all duration-300 ${type === 'expense' ? 'bg-expense text-white shadow-xl scale-100' : 'text-muted-foreground opacity-50 scale-95'
                        }`}
                >
                    Despesa
                </Button>
            </div>

            <div className="space-y-6">
                {/* Description */}
                <div className="space-y-3">
                    <Label htmlFor="desc" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">O que foi?</Label>
                    <div className="relative group">
                        <Input
                            id="desc"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            placeholder="Aluguel, Madero, Salário..."
                            className="h-16 px-6 bg-background/50 border-border/50 rounded-[1.5rem] text-xl font-bold focus-visible:ring-primary/20 transition-all"
                        />
                        <button
                            type="button"
                            onClick={handleSuggestCategory}
                            disabled={suggesting}
                            className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-50 transition-all ${suggesting ? 'animate-pulse' : ''}`}
                            title="Sugerir categoria com IA"
                        >
                            {suggesting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                {/* Amount & Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <Label htmlFor="amount" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Quanto?</Label>
                        <div className="relative">
                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground font-black text-lg">R$</span>
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                                className="h-16 pl-14 pr-6 bg-background/50 border-border/50 rounded-[1.5rem] text-2xl font-black focus-visible:ring-primary/20"
                            />
                        </div>
                    </div>
                    <div className="space-y-3">
                        <Label htmlFor="date" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Quando?</Label>
                        <div className="relative">
                            <CalendarIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5 pointer-events-none" />
                            <Input
                                id="date"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                                className="h-16 pl-14 pr-6 bg-background/50 border-border/50 rounded-[1.5rem] font-bold focus-visible:ring-primary/20"
                            />
                        </div>
                    </div>
                </div>

                {/* Category Selection - Custom styled select */}
                <div className="space-y-3">
                    <Label htmlFor="category" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Categoria</Label>
                    <div className="relative">
                        <Wallet className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5 pointer-events-none" />
                        <select
                            id="category"
                            className="flex h-16 w-full rounded-[1.5rem] border border-border/50 bg-background/50 pl-16 pr-6 py-2 text-lg font-bold ring-offset-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer"
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            required
                        >
                            {categoryList.map(c => <option key={c.id} value={c.id} className="text-foreground">{c.icon} {c.name}</option>)}
                        </select>
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                            <Layers className="w-4 h-4" />
                        </div>
                    </div>
                </div>

                {/* Advanced: Recurrence & Installments */}
                <div className="p-6 bg-muted/30 rounded-[2rem] border border-border/50 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl transition-colors ${isRecurring ? 'bg-primary/20 text-primary' : 'bg-background/50 text-muted-foreground'}`}>
                                <Repeat className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm font-black">Repetir todo mês</p>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Lançamento fixo</p>
                            </div>
                        </div>
                        <input
                            type="checkbox"
                            checked={isRecurring}
                            onChange={(e) => setIsRecurring(e.target.checked)}
                            className="h-6 w-6 rounded-lg border-border bg-background checked:bg-primary transition-all cursor-pointer"
                        />
                    </div>

                    {type === 'expense' && !isRecurring && (
                        <div className="pt-4 border-t border-border/50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-background/50 text-muted-foreground">
                                    <Layers className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-black">Parcelamento</p>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Dividir em vezes</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-muted-foreground uppercase italic px-2">x</span>
                                <Input
                                    type="number"
                                    min="1"
                                    max="48"
                                    value={installments}
                                    onChange={(e) => setInstallments(e.target.value)}
                                    className="w-20 h-10 rounded-xl bg-background border-border/50 text-center font-black"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Button
                type="submit"
                className="w-full h-16 rounded-[1.5rem] font-black text-lg shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                disabled={loading}
            >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Confirmar Lançamento'}
            </Button>
        </form>
    )
}

