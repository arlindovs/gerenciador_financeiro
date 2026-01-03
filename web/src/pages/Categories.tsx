import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Trash2, Edit2, X, Check, ArrowUpCircle, ArrowDownCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Category {
    id: string
    name: string
    type: 'income' | 'expense'
    icon?: string
    user_id: string | null
}

export default function Categories() {
    const [categories, setCategories] = useState<Category[]>([])
    const [user, setUser] = useState<any>(null)
    const [isAdding, setIsAdding] = useState(false)

    // Form state
    const [newName, setNewName] = useState('')
    const [newType, setNewType] = useState<'income' | 'expense'>('expense')
    const [newIcon, setNewIcon] = useState('📦')

    const fetchCategories = async () => {
        const { data } = await supabase
            .from('categories')
            .select('*')
            .order('name')

        if (data) setCategories(data)
    }

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            if (data.user) {
                setUser(data.user)
                fetchCategories()
            }
        })
    }, [])

    const handleAdd = async () => {
        if (!newName.trim()) return

        const { error } = await supabase
            .from('categories')
            .insert([{
                name: newName,
                type: newType,
                icon: newIcon,
                user_id: user.id
            }])

        if (!error) {
            setNewName('')
            setIsAdding(false)
            fetchCategories()
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir esta categoria?')) return

        const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', id)

        if (!error) fetchCategories()
    }

    const handleUpdate = async (id: string, name: string, icon: string) => {
        const { error } = await supabase
            .from('categories')
            .update({ name, icon })
            .eq('id', id)

        if (!error) {
            fetchCategories()
        }
    }

    const incomeCategories = categories.filter(c => c.type === 'income')
    const expenseCategories = categories.filter(c => c.type === 'expense')

    return (
        <div className="space-y-8 pb-32">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter">Categorias</h1>
                    <p className="text-muted-foreground font-medium text-lg">Personalize seu controle financeiro.</p>
                </div>
                {/* Loader removed as it was unused */}
                <Button
                    onClick={() => setIsAdding(true)}
                    className="shadow-2xl shadow-primary/20 gap-2 h-12 px-8 font-black rounded-2xl hover:scale-105 transition-all"
                >
                    <Plus className="w-5 h-5" />
                    Nova Categoria
                </Button>
            </header>

            <AnimatePresence>
                {isAdding && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <Card className="p-6 border-primary/20 bg-primary/5 rounded-[2rem]">
                            <div className="flex flex-col md:flex-row gap-4 items-end">
                                <div className="space-y-2 flex-1 w-full">
                                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Nome</label>
                                    <Input
                                        value={newName}
                                        onChange={e => setNewName(e.target.value)}
                                        placeholder="Ex: Assinaturas, Freelance..."
                                        className="h-12 rounded-xl bg-background border-border/50"
                                    />
                                </div>
                                <div className="space-y-2 w-full md:w-32">
                                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Ícone</label>
                                    <Input
                                        value={newIcon}
                                        onChange={e => setNewIcon(e.target.value)}
                                        className="h-12 rounded-xl bg-background border-border/50 text-center text-xl"
                                    />
                                </div>
                                <div className="space-y-2 w-full md:w-48">
                                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Tipo</label>
                                    <div className="flex bg-background rounded-xl p-1 border border-border/50 h-12">
                                        <button
                                            onClick={() => setNewType('income')}
                                            className={`flex-1 rounded-lg text-[10px] font-black uppercase transition-all ${newType === 'income' ? 'bg-revenue text-white' : 'text-muted-foreground'}`}
                                        >
                                            Receita
                                        </button>
                                        <button
                                            onClick={() => setNewType('expense')}
                                            className={`flex-1 rounded-lg text-[10px] font-black uppercase transition-all ${newType === 'expense' ? 'bg-expense text-white' : 'text-muted-foreground'}`}
                                        >
                                            Despesa
                                        </button>
                                    </div>
                                </div>
                                <div className="flex gap-2 w-full md:w-auto">
                                    <Button onClick={handleAdd} className="h-12 rounded-xl px-6 flex-1 md:flex-none">Salvar</Button>
                                    <Button variant="ghost" onClick={() => setIsAdding(false)} className="h-12 rounded-xl px-4"><X className="w-5 h-5" /></Button>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Income Categories */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 px-2">
                        <ArrowUpCircle className="w-5 h-5 text-revenue" />
                        <h2 className="text-xl font-black tracking-tight">Receitas</h2>
                    </div>
                    <Card className="border-border/50 bg-card/30 backdrop-blur-xl rounded-[2.5rem] p-4">
                        <div className="space-y-2">
                            {incomeCategories.map(cat => (
                                <CategoryItem
                                    key={cat.id}
                                    category={cat}
                                    onDelete={handleDelete}
                                    onUpdate={handleUpdate}
                                />
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Expense Categories */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 px-2">
                        <ArrowDownCircle className="w-5 h-5 text-expense" />
                        <h2 className="text-xl font-black tracking-tight">Despesas</h2>
                    </div>
                    <Card className="border-border/50 bg-card/30 backdrop-blur-xl rounded-[2.5rem] p-4">
                        <div className="space-y-2">
                            {expenseCategories.map(cat => (
                                <CategoryItem
                                    key={cat.id}
                                    category={cat}
                                    onDelete={handleDelete}
                                    onUpdate={handleUpdate}
                                />
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}

function CategoryItem({ category, onDelete, onUpdate }: {
    category: Category,
    onDelete: (id: string) => void,
    onUpdate: (id: string, name: string, icon: string) => void
}) {
    const [isEditing, setIsEditing] = useState(false)
    const [editName, setEditName] = useState(category.name)
    const [editIcon, setEditIcon] = useState(category.icon || '📦')

    if (isEditing) {
        return (
            <div className="flex items-center gap-2 p-3 bg-muted/20 rounded-2xl border border-primary/20">
                <Input
                    value={editIcon}
                    onChange={e => setEditIcon(e.target.value)}
                    className="w-12 h-10 text-center rounded-xl bg-background"
                />
                <Input
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="flex-1 h-10 rounded-xl bg-background"
                />
                <Button size="icon" variant="ghost" onClick={() => onUpdate(category.id, editName, editIcon)} className="text-revenue hover:bg-revenue/10 rounded-xl">
                    <Check className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => setIsEditing(false)} className="text-muted-foreground rounded-xl">
                    <X className="w-4 h-4" />
                </Button>
            </div>
        )
    }

    return (
        <div className="flex items-center justify-between p-4 hover:bg-muted/30 rounded-2xl transition-all group border border-transparent hover:border-border/50">
            <div className="flex items-center gap-4">
                <span className="text-2xl w-10 h-10 flex items-center justify-center bg-background/50 rounded-xl shadow-inner">{category.icon || '📦'}</span>
                <div>
                    <p className="font-bold text-lg">{category.name}</p>
                    <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60">
                        {category.user_id ? 'Personalizada' : 'Sistema'}
                    </p>
                </div>
            </div>
            {category.user_id && (
                <div className="flex items-center gap-1 transition-all">
                    <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)} className="w-10 h-10 rounded-xl hover:bg-primary/10 hover:text-primary">
                        <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(category.id)} className="w-10 h-10 rounded-xl hover:bg-destructive/10 hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            )}
        </div>
    )
}
