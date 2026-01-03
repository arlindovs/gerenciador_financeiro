/**
 * Transactions Routes - Express Router
 * Rotas de Transações - Express Router
 */
import { Router, Request, Response } from 'express'
import { getAuthenticatedClient } from '../lib/supabase'
import { createTransactionSchema, updateTransactionSchema } from '../lib/schemas'
import { ZodError } from 'zod'

export const transactionsRouter = Router()

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
 * /transactions:
 *   get:
 *     summary: Get all transactions
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of transactions
 */
transactionsRouter.get('/', async (req: Request, res: Response) => {
    try {
        const client = getAuthenticatedClient(req.headers.authorization)

        const { data, error } = await client
            .from('transactions')
            .select('*, categories(*)')
            .order('date', { ascending: false })

        if (error) {
            return res.status(500).json({ error: error.message })
        }

        return res.json(data)
    } catch (err) {
        console.error('Error fetching transactions:', err)
        return res.status(500).json({ error: 'Internal server error' })
    }
})

/**
 * @swagger
 * /transactions:
 *   post:
 *     summary: Create a new transaction
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [description, amount, type, date, user_id]
 *             properties:
 *               description:
 *                 type: string
 *               amount:
 *                 type: number
 *               type:
 *                 type: string
 *                 enum: [income, expense]
 *               category_id:
 *                 type: string
 *               date:
 *                 type: string
 *               user_id:
 *                 type: string
 *               total_installments:
 *                 type: number
 *               is_recurring:
 *                 type: boolean
 *               recurrence_period:
 *                 type: string
 *     responses:
 *       201:
 *         description: Transaction created
 *       400:
 *         description: Validation error
 */
transactionsRouter.post('/', async (req: Request, res: Response) => {
    try {
        // Validate request body with Zod
        // Valida corpo da requisição com Zod
        const validatedData = createTransactionSchema.parse(req.body)
        const {
            description, amount, type, category_id, date, user_id,
            total_installments, is_recurring, recurrence_period
        } = validatedData

        const client = getAuthenticatedClient(req.headers.authorization)
        const installmentsToCreate = total_installments && total_installments > 1 ? total_installments : 1

        // Single transaction (no installments)
        // Transação única (sem parcelamento)
        if (installmentsToCreate === 1) {
            const { data, error } = await client
                .from('transactions')
                .insert([{
                    description,
                    amount,
                    type,
                    category_id,
                    date,
                    user_id,
                    is_recurring: !!is_recurring,
                    recurrence_period: recurrence_period || 'monthly'
                }])
                .select()

            if (error) {
                return res.status(500).json({ error: error.message })
            }
            return res.status(201).json(data[0])
        }

        // Installments logic
        // Lógica de parcelamento
        const firstInstallmentDate = new Date(date)
        const amountPerInstallment = amount / installmentsToCreate

        const { data: parentData, error: parentError } = await client
            .from('transactions')
            .insert([{
                description: `${description} (1/${installmentsToCreate})`,
                amount: amountPerInstallment,
                type,
                category_id,
                date,
                user_id,
                installment_number: 1,
                total_installments: installmentsToCreate
            }])
            .select()

        if (parentError) {
            return res.status(500).json({ error: parentError.message })
        }

        const parentId = parentData[0].id
        const results = [parentData[0]]

        // Create remaining installments
        // Cria parcelas restantes
        const otherInstallments = []
        for (let i = 2; i <= installmentsToCreate; i++) {
            const nextDate = new Date(firstInstallmentDate)
            nextDate.setMonth(nextDate.getMonth() + (i - 1))

            otherInstallments.push({
                description: `${description} (${i}/${installmentsToCreate})`,
                amount: amountPerInstallment,
                type,
                category_id,
                date: nextDate.toISOString().split('T')[0],
                user_id,
                installment_number: i,
                total_installments: installmentsToCreate,
                parent_transaction_id: parentId
            })
        }

        const { data: childrenData, error: childrenError } = await client
            .from('transactions')
            .insert(otherInstallments)
            .select()

        if (childrenError) {
            return res.status(500).json({ error: childrenError.message })
        }

        results.push(...childrenData)
        return res.status(201).json(results[0])

    } catch (err) {
        if (err instanceof ZodError) {
            return res.status(400).json(formatZodError(err))
        }
        console.error('Error creating transaction:', err)
        return res.status(500).json({ error: 'Internal server error' })
    }
})

/**
 * @swagger
 * /transactions/{id}:
 *   put:
 *     summary: Update a transaction
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Transaction updated
 */
transactionsRouter.put('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const validatedData = updateTransactionSchema.parse(req.body)
        const { description, amount, type, category_id, date } = validatedData

        const client = getAuthenticatedClient(req.headers.authorization)

        const { data, error } = await client
            .from('transactions')
            .update({ description, amount, type, category_id, date })
            .eq('id', id)
            .select()

        if (error) {
            return res.status(500).json({ error: error.message })
        }

        return res.json(data[0])
    } catch (err) {
        if (err instanceof ZodError) {
            return res.status(400).json(formatZodError(err))
        }
        console.error('Error updating transaction:', err)
        return res.status(500).json({ error: 'Internal server error' })
    }
})

/**
 * @swagger
 * /transactions/{id}:
 *   delete:
 *     summary: Delete a transaction
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Transaction deleted
 */
transactionsRouter.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const client = getAuthenticatedClient(req.headers.authorization)

        const { error } = await client
            .from('transactions')
            .delete()
            .eq('id', id)

        if (error) {
            return res.status(500).json({ error: error.message })
        }

        return res.json({ success: true })
    } catch (err) {
        console.error('Error deleting transaction:', err)
        return res.status(500).json({ error: 'Internal server error' })
    }
})
