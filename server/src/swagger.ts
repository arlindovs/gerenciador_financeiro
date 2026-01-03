/**
 * Swagger/OpenAPI Configuration
 * Configuração do Swagger/OpenAPI
 */
import swaggerJSDoc from 'swagger-jsdoc'

const options: swaggerJSDoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Finance Manager API',
            version: '1.0.0',
            description: 'A modern finance management API with AI-powered categorization',
        },
        servers: [
            {
                url: process.env.API_URL || 'http://localhost:3000',
                description: 'API Server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [{ bearerAuth: [] }],
    },
    apis: ['./src/routes/*.ts'],
}

export const swaggerSpec = swaggerJSDoc(options)
