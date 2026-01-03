
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { Sparkles, Loader2 } from 'lucide-react'

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
            if (data.length > 0 && !categoryId) setCategoryId(data[0].id)
            // If we are editing, ensure the category from initialData is kept if it matches the current type
            if (initialData?.category_id && data.find(c => c.id === initialData.category_id)) {
                setCategoryId(initialData.category_id)
            } else if (data.length > 0 && !categoryId) {
                setCategoryId(data[0].id)
            }
        }
    }

    useEffect(() => {
        fetchCategories()
    }, [type])

    const handleSuggestCategory = async () => {
        if (!description || !amount) {
            alert('Por favor, preencha a descrição e o valor primeiro.')
            return
        }

        setSuggesting(true)
        try {
            const { data: { session } } = await supabase.auth.getSession()
            const res = await fetch('http://localhost:3000/ai/categorize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                },
                body: JSON.stringify({ description, amount: parseFloat(amount) })
            })

            if (!res.ok) throw new Error('Failed to fetch suggestion')
            const data = await res.json()

            // Try to find the suggested category in our list
            const found = categoryList.find(c => c.name.toLowerCase() === data.category.toLowerCase())
            if (found) {
                setCategoryId(found.id)
            } else {
                console.log('Suggested category not found in list:', data.category)
            }
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
                ? `http://localhost:3000/transactions/${initialData.id}`
                : 'http://localhost:3000/transactions'

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

            if (!isEditing) {
                setDescription('')
                setAmount('')
                setInstallments('1')
                setIsRecurring(false)
            }
            onSuccess()
        } catch (err) {
            console.error(err)
            alert('Erro ao salvar transação')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="mb-6 border-2 border-primary/10 shadow-lg">
            <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold">Nova Transação</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex p-1 bg-muted rounded-lg gap-1">
                        <Button
                            type="button"
                            variant={type === 'income' ? 'default' : 'ghost'}
                            onClick={() => setType('income')}
                            className="flex-1 transition-all rounded-md"
                        >
                            Receita
                        </Button>
                        <Button
                            type="button"
                            variant={type === 'expense' ? 'default' : 'ghost'}
                            onClick={() => setType('expense')}
                            className="flex-1 transition-all rounded-md"
                        >
                            Despesa
                        </Button>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="desc">Descrição</Label>
                        <div className="relative">
                            <Input
                                id="desc"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                                placeholder="Ex: Almoço no Madero"
                                className="pr-10"
                            />
                            <button
                                type="button"
                                onClick={handleSuggestCategory}
                                disabled={suggesting}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-primary hover:text-primary/80 disabled:opacity-50 transition-colors"
                                title="Sugerir categoria com IA"
                            >
                                {suggesting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="amount">Valor Total</Label>
                            <Input id="amount" type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required placeholder="0,00" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="date">Data</Label>
                            <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="category">Categoria</Label>
                        <select
                            id="category"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            required
                        >
                            {categoryList.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                        </select>
                    </div>

                    <div className="flex items-center gap-6 pt-2">
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="recurring"
                                checked={isRecurring}
                                onChange={(e) => setIsRecurring(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <Label htmlFor="recurring" className="cursor-pointer">Repetir todo mês</Label>
                        </div>

                        {type === 'expense' && (
                            <div className="flex items-center space-x-2 flex-1">
                                <Label htmlFor="installments">Parcelas:</Label>
                                <Input
                                    id="installments"
                                    type="number"
                                    min="1"
                                    max="48"
                                    value={installments}
                                    onChange={(e) => setInstallments(e.target.value)}
                                    className="w-20 h-8"
                                />
                            </div>
                        )}
                    </div>

                    <Button type="submit" className="w-full mt-4 font-bold h-11" disabled={loading}>
                        {loading ? 'Processando...' : 'Salvar Lançamento'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}

