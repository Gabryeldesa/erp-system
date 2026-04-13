import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const total = await prisma.purchaseOrder.count()
    const items = await prisma.purchaseOrder.findMany({
      include: {
        supplier: true,
        items: { include: { product: true } },
      },
      orderBy: { orderDate: 'desc' },
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
    const item = await prisma.purchaseOrder.create({
      data: {
        supplierId: body.supplierId,
        total: body.total,
        status: 'PENDING',
      },
      include: { supplier: true },
    })
    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar registro' }, { status: 500 })
  }
}