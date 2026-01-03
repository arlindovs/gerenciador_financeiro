/**
 * Example Data Route - Fetches sample data from Supabase
 * Rota de Dados de Exemplo - Busca dados de amostra do Supabase
 */
import { Router, Request, Response } from 'express'
import { supabase } from '../lib/supabase'

const router = Router()

/**
 * @swagger
 * /api/dados:
 *   get:
 *     summary: Get sample data from Supabase
 *     description: Returns a limited set of transactions as sample data
 *     responses:
 *       200:
 *         description: Sample data retrieved successfully
 *       500:
 *         description: Internal server error
 */
router.get('/', async (_req: Request, res: Response) => {
    try {
        const { data, error } = await supabase
            .from('transactions')
            .select('id, description, amount, type, created_at')
            .order('created_at', { ascending: false })
            .limit(5)

        if (error) {
            console.error('Supabase error:', error.message)
            return res.status(500).json({ error: 'Failed to fetch data from database' })
        }

        return res.json({
            success: true,
            message: 'Sample data from Supabase',
            data: data || []
        })
    } catch (err) {
        console.error('Unexpected error:', err)
        return res.status(500).json({ error: 'Internal server error' })
    }
})

export { router as dadosRouter }
