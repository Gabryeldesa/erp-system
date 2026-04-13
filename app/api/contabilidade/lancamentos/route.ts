import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''

    const where: any = {}
    if (search) where.description = { contains: search, mode: 'insensitive' }

    const total = await prisma.accountingEntry.count({ where })
    const items = await prisma.accountingEntry.findMany({
      where,
      include: { accountPlan: true },
      orderBy: { date: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    })

    return NextResponse.json({ items, total, page, limit })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar dados' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const item = await prisma.accountingEntry.create({
      data: {
        ...body,
        date: new Date(body.date),
      },
      include: { accountPlan: true },
    })
    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar registro' }, { status: 500 })
  }
}