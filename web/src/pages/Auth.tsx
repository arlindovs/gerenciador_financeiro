
import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useNavigate } from 'react-router-dom'

export default function Auth() {
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLogin, setIsLogin] = useState(true)
    const navigate = useNavigate()

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })
                if (error) throw error
                navigate('/')
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                })
                if (error) throw error
                alert('Cadastro realizado! Verifique seu email ou faça login.')
                setIsLogin(true)
            }
        } catch (error: any) {
            alert(error.error_description || error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-background to-secondary/20 -z-10" />
            <Card className="w-full max-w-md shadow-lg border-muted/40 backdrop-blur-sm bg-card/80">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">{isLogin ? 'Bem-vindo de volta' : 'Crie sua conta'}</CardTitle>
                    <CardDescription className="text-center">
                        {isLogin ? 'Entre para gerenciar suas finanças' : 'Comece a controlar seu dinheiro hoje'}
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleAuth}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="seu@email.com"
                                value={email}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Senha</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="******"
                                value={password}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-2">
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Carregando...' : isLogin ? 'Entrar' : 'Cadastrar'}
                        </Button>
                        <Button
                            variant="link"
                            type="button"
                            className="w-full"
                            onClick={() => setIsLogin(!isLogin)}
                        >
                            {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entre'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
