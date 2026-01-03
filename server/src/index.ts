
import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { swagger } from '@elysiajs/swagger'
import { transactionsRoutes } from './routes/transactions'
import { aiRoutes } from './routes/ai'

const port = process.env.PORT || 3000

const app = new Elysia()
    .use(cors())
    .use(swagger())
    .use(transactionsRoutes)
    .use(aiRoutes)
    .get('/', () => ({ message: 'Finance Manager API is running' }))
    .listen(port)

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)
