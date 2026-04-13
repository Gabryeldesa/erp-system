'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface ContaPagar {
  id: string
  description: string
  amount: number
  dueDate: string
  status: string
  category: string | null
  supplier?: { name: string } | null
}

interface ContaReceber {
  id: string
  description: string
  amount: number
  dueDate: string
  status: string
  category: string | null
}

export default function FinanceiroPage() {
  const { status } = useSession()
  const router = useRouter()
  const [tab, setTab] = useState<'pagar' | 'receber'>('pagar')
  const [contasPagar, setContasPagar] = useState<ContaPagar[]>([])
  const [contasReceber, setContasReceber] = useState<ContaReceber[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ description: '', amount: '', dueDate: '', category: '' })

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  useEffect(() => {
    fetchData()
  }, [tab, search, statusFilter])

  async function fetchData() {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (statusFilter) params.set('status', statusFilter)

    if (tab === 'pagar') {
      const res = await fetch(`/api/financeiro/contas-pagar?${params}`)
      const data = await res.json()
      setContasPagar(data.items || [])
    } else {
      const res = await fetch(`/api/financeiro/contas-receber?${params}`)
      const data = await res.json()
      setContasReceber(data.items || [])
    }
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const endpoint = tab === 'pagar' ? '/api/financeiro/contas-pagar' : '/api/financeiro/contas-receber'
    await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        amount: parseFloat(form.amount),
        dueDate: new Date(form.dueDate).toISOString(),
      }),
    })
    setShowModal(false)
    setForm({ description: '', amount: '', dueDate: '', category: '' })
    fetchData()
  }

  function formatCurrency(value: number) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString('pt-BR')
  }

  function getStatusBadge(status: string) {
    const styles: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-700',
      PAID: 'bg-green-100 text-green-700',
      RECEIVED: 'bg-green-100 text-green-700',
      OVERDUE: 'bg-red-100 text-red-700',
    }
    const labels: Record<string, string> = {
      PENDING: 'Pendente',
      PAID: 'Pago',
      RECEIVED: 'Recebido',
      OVERDUE: 'Vencido',
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
        {labels[status] || status}
      </span>
    )
  }

  const items = tab === 'pagar' ? contasPagar : contasReceber
  const total = items.reduce((sum, item) => sum + item.amount, 0)
  const pendentes = items.filter(i => i.status === 'PENDING').reduce((sum, i) => sum + i.amount, 0)

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Topbar */}
      <div className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/dashboard')} className="text-blue-600 hover:text-blue-800 font-medium text-sm">
            ← Dashboard
          </button>
          <span className="text-gray-300">|</span>
          <h1 className="text-lg font-semibold text-gray-800">💰 Financeiro</h1>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          + Novo Lançamento
        </button>
      </div>

      <div className="p-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('pagar')}
            className={`px-5 py-2 rounded-lg font-medium text-sm transition ${tab === 'pagar' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            Contas a Pagar
          </button>
          <button
            onClick={() => setTab('receber')}
            className={`px-5 py-2 rounded-lg font-medium text-sm transition ${tab === 'receber' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            Contas a Receber
          </button>
        </div>

        {/* Cards resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-2xl font-bold text-gray-800">{formatCurrency(total)}</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <p className="text-sm text-gray-500">Pendente</p>
            <p className="text-2xl font-bold text-yellow-600">{formatCurrency(pendentes)}</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <p className="text-sm text-gray-500">Registros</p>
            <p className="text-2xl font-bold text-blue-600">{items.length}</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4 flex gap-3">
          <input
            type="text"
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos os status</option>
            <option value="PENDING">Pendente</option>
            <option value="PAID">Pago</option>
            <option value="RECEIVED">Recebido</option>
            <option value="OVERDUE">Vencido</option>
          </select>
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Descrição</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Categoria</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Vencimento</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Valor</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-400">Carregando...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-400">Nenhum registro encontrado</td></tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm text-gray-800 font-medium">{item.description}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.category || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatDate(item.dueDate)}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-800">{formatCurrency(item.amount)}</td>
                    <td className="px-6 py-4">{getStatusBadge(item.status)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              {tab === 'pagar' ? 'Nova Conta a Pagar' : 'Nova Conta a Receber'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <input
                  type="text"
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vencimento</label>
                <input
                  type="date"
                  required
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                <input
                  type="text"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}