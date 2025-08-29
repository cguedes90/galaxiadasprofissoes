import { NextRequest, NextResponse } from 'next/server'
import swaggerSpec from '@/lib/swagger'

/**
 * @swagger
 * /api/docs:
 *   get:
 *     summary: Retorna a documentação da API em formato JSON
 *     tags: [Documentation]
 *     responses:
 *       200:
 *         description: Documentação da API em formato OpenAPI 3.0
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
export async function GET(request: NextRequest) {
  return NextResponse.json(swaggerSpec)
}