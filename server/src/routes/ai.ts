/**
 * AI Routes - Express Router
 * Rotas de IA - Express Router
 */
import { Router, Request, Response } from 'express'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { categorizeSchema } from '../lib/schemas'
import { ZodError } from 'zod'

export const aiRouter = Router()

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null

/**
 * Format Zod errors for API response
 * Formata erros do Zod para resposta da API
 */
function formatZodError(error: ZodError) {
    return {
        error: 'Validation failed',
        details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
        }))
    }
}

/**
 * @swagger
 * /ai/categorize:
 *   post:
 *     summary: Get AI-suggested category for a transaction
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [description, amount]
 *             properties:
 *               description:
 *                 type: string
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Category suggestion
 *       401:
 *         description: Unauthorized
 */
aiRouter.post('/categorize', async (req: Request, res: Response) => {
    try {
        // Security: Check for auth token to prevent unauthorized quota usage
        // Segurança: Verifica token para prevenir uso não autorizado de cota
        const authHeader = req.headers.authorization
        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        // Validate request body with Zod
        // Valida corpo da requisição com Zod
        const validatedData = categorizeSchema.parse(req.body)
        const { description, amount } = validatedData

        if (!genAI) {
            return res.status(503).json({ error: 'Gemini API Key not configured' })
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

        const prompt = `
      Aja como um assistante financeiro. O usuário fez um lançamento: "${description}" no valor de R$ ${amount}.
      Sugira a categoria mais adequada entre estas: ('Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Saúde', 'Educação', 'Investimentos', 'Salário', 'Outros').
      Sugira também uma tag curta (ex: 'Lazer', 'Fixo', 'Trabalho').
      Responda APENAS em formato JSON puro, sem markdown, como este: {"category": "Nome da Categoria", "tag": "Tag"}
    `

        const result = await model.generateContent(prompt)
        const response = result.response
        const text = response.text()

        const cleanJson = text.replace(/```json|```/g, '').trim()
        const parsed = JSON.parse(cleanJson)

        return res.json({
            category: parsed.category,
            tag: parsed.tag,
            confidence: 0.95,
            source: 'gemini'
        })

    } catch (err) {
        if (err instanceof ZodError) {
            return res.status(400).json(formatZodError(err))
        }
        console.error('Gemini API Error:', err)
        return res.json({
            category: 'Outros',
            tag: 'Geral',
            confidence: 0.5,
            error: 'Failed to call Gemini'
        })
    }
})
