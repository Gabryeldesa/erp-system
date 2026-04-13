import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''

    const where: any = {}
    if (search) where.name = { contains: search, mode: 'insensitive' }

    const items = await prisma.accountPlan.findMany({
      where,
      orderBy: { code: 'asc' },
    })

    return NextResponse.json({ items })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar dados' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const item = await prisma.accountPlan.create({ data: body })
    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar registro' }, { status: 500 })
  }
}