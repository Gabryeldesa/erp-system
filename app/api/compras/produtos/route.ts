import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''

    const where: any = {}
    if (search) where.name = { contains: search, mode: 'insensitive' }

    const items = await prisma.product.findMany({
      where,
      include: {
        inventory: {
          orderBy: { date: 'desc' },
          take: 1,
        },
      },
      orderBy: { name: 'asc' },
    })

    const itemsWithStock = items.map((item) => {
      const totalIn = item.inventory
        .filter((i) => i.type === 'IN')
        .reduce((sum, i) => sum + i.quantity, 0)
      const totalOut = item.inventory
        .filter((i) => i.type === 'OUT')
        .reduce((sum, i) => sum + i.quantity, 0)
      return { ...item, stock: totalIn - totalOut }
    })

    return NextResponse.json({ items: itemsWithStock })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar dados' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const item = await prisma.product.create({ data: body })
    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar registro' }, { status: 500 })
  }
}