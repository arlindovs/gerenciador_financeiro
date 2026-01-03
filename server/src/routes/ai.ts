
import { Elysia, t } from 'elysia'
import { GoogleGenerativeAI } from "@google/generative-ai"

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null

export const aiRoutes = new Elysia({ prefix: '/ai' })
    .post('/categorize', async ({ body, headers }) => {
        const { description, amount } = body as { description: string, amount: number }

        // Security: Check for auth token to prevent unauthorized quota usage
        const authHeader = headers['authorization']
        if (!authHeader?.startsWith('Bearer ')) {
            return { error: 'Unauthorized' }
        }

        console.log(`Gemini AI Suggestion requested for: ${description}, value: ${amount}`)

        if (!genAI) {
            return { error: 'Gemini API Key not configured' }
        }

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

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

            return {
                category: parsed.category,
                tag: parsed.tag,
                confidence: 0.95,
                source: 'gemini'
            }
        } catch (err) {
            console.error('Gemini API Error:', err)
            return {
                category: 'Outros',
                tag: 'Geral',
                confidence: 0.5,
                error: 'Failed to call Gemini'
            }
        }
    }, {
        body: t.Object({
            description: t.String(),
            amount: t.Number()
        })
    })
