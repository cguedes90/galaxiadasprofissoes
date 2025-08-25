import { NextResponse } from 'next/server'

export async function GET() {
  try {
    return NextResponse.json({
      status: 'ok',
      message: 'API funcionando corretamente',
      timestamp: new Date().toISOString(),
      server: 'Galaxy API'
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro no servidor' },
      { status: 500 }
    )
  }
}