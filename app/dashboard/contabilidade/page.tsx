'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface AccountPlan {
  id: string
  code: string
  name: string
  type: string
  active: boolean
}

interface AccountingEntry {
  id: string
  description: string
  debit: number
  credit: number
  date: string
  accountPlan: AccountPlan
}

export default function ContabilidadePage() {
  const { status } = useSession()
  const router = useRouter()
  const [tab, setTab] = useState<'plano' | 'lancamentos'>('lancamentos')
  const [planos, setPlanos] = useState<AccountPlan[]>([])
  const [lancamentos, setLancamentos] = useState<AccountingEntry[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    description: '', debit: '', credit: '', date: '', accountPlanId: ''
  })
  const [formPlano, setFormPlano] = useState({
    code: '', name: '', type: 'ATIVO'
  })

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  useEffect(() => {
    fetchData()
  }, [tab, search])

  async function fetchData() {
    setLoading(true)
    if (tab === 'plano') {
      const res = await fetch(`/api/contabilidade/plano-contas?search=${search}`)
      const data = await res.json()
      setPlanos(data.items || [])
    } else {
      const res = await fetch(`/api/contabilidade/lancamentos?search=${search}`)
      const data = await res.json()
      setLancamentos(data.items || [])
      const resPlanos = await fetch('/api/contabilidade/plano-contas')
      const dataPlanos = await resPlanos.json()
      setPlanos(dataPlanos.items || [])
    }
    setLoading(false)
  }

  async function handleSubmitLancamento(e: React.FormEvent) {
    e.preventDefault()
    await fetch('/api/contabilidade/lancamentos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        debit: parseFloat(form.debit || '0'),
        credit: parseFloat(form.credit || '0'),
        date: new Date(form.date).toISOString(),
      }),
    })
    setShowModal(false)
    setForm({ description: '', debit: '', credit: '', date: '', accountPlanId: '' })
    fetchData()
  }

  async function handleSubmitPlano(e: React.FormEvent) {
    e.preventDefault()
    await fetch('/api/contabilidade/plano-contas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formPlano),
    })
    setShowModal(false)
    setFormPlano({ code: '', name: '', type: 'ATIVO' })
    fetchData()
  }

  function formatCurrency(value: number) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString('pt-BR')
  }

  const totalDebito = lancamentos.reduce((sum, l) => sum + l.debit, 0)
  const totalCredito = lancamentos.reduce((sum, l) => sum + l.credit, 0)

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Topbar */}
      <div className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/dashboard')} className="text-blue-600 hover:text-blue-800 font-medium text-sm">
            ← Dashboard
          </button>
          <span className="text-gray-300">|</span>
          <h1 className="text-lg font-semibold text-gray-800">📒 Contabilidade</h1>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          + Novo Registro
        </button>
      </div>

      <div className="p-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('lancamentos')}
            className={`px-5 py-2 rounded-lg font-medium text-sm transition ${tab === 'lancamentos' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            Lançamentos Contábeis
          </button>
          <button
            onClick={() => setTab('plano')}
            className={`px-5 py-2 rounded-lg font-medium text-sm transition ${tab === 'plano' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            Plano de Contas
          </button>
        </div>

        {tab === 'lancamentos' && (
          <>
            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-xl p-5 shadow-sm">
                <p className="text-sm text-gray-500">Total Débitos</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(totalDebito)}</p>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-sm">
                <p className="text-sm text-gray-500">Total Créditos</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalCredito)}</p>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-sm">
                <p className="text-sm text-gray-500">Saldo</p>
                <p className={`text-2xl font-bold ${totalCredito - totalDebito >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  {formatCurrency(totalCredito - totalDebito)}
                </p>
              </div>
            </div>

            {/* Busca */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
              <input
                type="text"
                placeholder="Buscar lançamento..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Tabela Lançamentos */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Data</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Conta</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Descrição</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Débito</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Crédito</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr><td colSpan={5} className="text-center py-8 text-gray-400">Carregando...</td></tr>
                  ) : lancamentos.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-8 text-gray-400">Nenhum lançamento encontrado</td></tr>
                  ) : (
                    lancamentos.map((l) => (
                      <tr key={l.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-500">{formatDate(l.date)}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{l.accountPlan.code}</span>
                          <span className="ml-2">{l.accountPlan.name}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-800 font-medium">{l.description}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-red-600">{l.debit > 0 ? formatCurrency(l.debit) : '-'}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-green-600">{l.credit > 0 ? formatCurrency(l.credit) : '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === 'plano' && (
          <>
            {/* Busca */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
              <input
                type="text"
                placeholder="Buscar conta..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Tabela Plano de Contas */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Código</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Nome</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Tipo</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr><td colSpan={4} className="text-center py-8 text-gray-400">Carregando...</td></tr>
                  ) : planos.length === 0 ? (
                    <tr><td colSpan={4} className="text-center py-8 text-gray-400">Nenhuma conta encontrada</td></tr>
                  ) : (
                    planos.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-mono font-semibold text-blue-600">{p.code}</td>
                        <td className="px-6 py-4 text-sm text-gray-800 font-medium">{p.name}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">{p.type}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {p.active ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              {tab === 'lancamentos' ? 'Novo Lançamento' : 'Nova Conta'}
            </h2>

            {tab === 'lancamentos' ? (
              <form onSubmit={handleSubmitLancamento} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Conta Contábil</label>
                  <select
                    required
                    value={form.accountPlanId}
                    onChange={(e) => setForm({ ...form, accountPlanId: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione...</option>
                    {planos.map((p) => (
                      <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <input type="text" required value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Débito (R$)</label>
                    <input type="number" step="0.01" value={form.debit}
                      onChange={(e) => setForm({ ...form, debit: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Crédito (R$)</label>
                    <input type="number" step="0.01" value={form.credit}
                      onChange={(e) => setForm({ ...form, credit: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                  <input type="date" required value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)}
                    className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
                    Cancelar
                  </button>
                  <button type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
                    Salvar
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSubmitPlano} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Código</label>
                  <input type="text" required value={formPlano.code}
                    onChange={(e) => setFormPlano({ ...formPlano, code: e.target.value })}
                    placeholder="Ex: 1.1.003"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                  <input type="text" required value={formPlano.name}
                    onChange={(e) => setFormPlano({ ...formPlano, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select value={formPlano.type}
                    onChange={(e) => setFormPlano({ ...formPlano, type: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ATIVO">Ativo</option>
                    <option value="PASSIVO">Passivo</option>
                    <option value="RECEITA">Receita</option>
                    <option value="DESPESA">Despesa</option>
                    <option value="PATRIMONIO">Patrimônio</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)}
                    className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
                    Cancelar
                  </button>
                  <button type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
                    Salvar
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}