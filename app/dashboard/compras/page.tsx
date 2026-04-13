'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface Product {
  id: string
  name: string
  sku: string
  price: number
  unit: string
  stock: number
  active: boolean
}

interface Supplier {
  id: string
  name: string
  cnpj: string
  email: string | null
  phone: string | null
  active: boolean
}

interface PurchaseOrder {
  id: string
  total: number
  status: string
  orderDate: string
  supplier: Supplier
}

export default function ComprasPage() {
  const { status } = useSession()
  const router = useRouter()
  const [tab, setTab] = useState<'produtos' | 'fornecedores' | 'pedidos'>('produtos')
  const [produtos, setProdutos] = useState<Product[]>([])
  const [fornecedores, setFornecedores] = useState<Supplier[]>([])
  const [pedidos, setPedidos] = useState<PurchaseOrder[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formProduto, setFormProduto] = useState({ name: '', sku: '', price: '', unit: 'UN', description: '' })
  const [formFornecedor, setFormFornecedor] = useState({ name: '', cnpj: '', email: '', phone: '', address: '' })

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  useEffect(() => {
    fetchData()
  }, [tab, search])

  async function fetchData() {
    setLoading(true)
    if (tab === 'produtos') {
      const res = await fetch(`/api/compras/produtos?search=${search}`)
      const data = await res.json()
      setProdutos(data.items || [])
    } else if (tab === 'fornecedores') {
      const res = await fetch(`/api/compras/fornecedores?search=${search}`)
      const data = await res.json()
      setFornecedores(data.items || [])
    } else {
      const res = await fetch('/api/compras/pedidos')
      const data = await res.json()
      setPedidos(data.items || [])
    }
    setLoading(false)
  }

  async function handleSubmitProduto(e: React.FormEvent) {
    e.preventDefault()
    await fetch('/api/compras/produtos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formProduto, price: parseFloat(formProduto.price) }),
    })
    setShowModal(false)
    setFormProduto({ name: '', sku: '', price: '', unit: 'UN', description: '' })
    fetchData()
  }

  async function handleSubmitFornecedor(e: React.FormEvent) {
    e.preventDefault()
    await fetch('/api/compras/fornecedores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formFornecedor),
    })
    setShowModal(false)
    setFormFornecedor({ name: '', cnpj: '', email: '', phone: '', address: '' })
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
      APPROVED: 'bg-blue-100 text-blue-700',
      DELIVERED: 'bg-green-100 text-green-700',
      CANCELLED: 'bg-red-100 text-red-700',
    }
    const labels: Record<string, string> = {
      PENDING: 'Pendente',
      APPROVED: 'Aprovado',
      DELIVERED: 'Entregue',
      CANCELLED: 'Cancelado',
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
        {labels[status] || status}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Topbar */}
      <div className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/dashboard')} className="text-blue-600 hover:text-blue-800 font-medium text-sm">
            ← Dashboard
          </button>
          <span className="text-gray-300">|</span>
          <h1 className="text-lg font-semibold text-gray-800">🛒 Compras e Estoque</h1>
        </div>
        {tab !== 'pedidos' && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            + Novo Registro
          </button>
        )}
      </div>

      <div className="p-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(['produtos', 'fornecedores', 'pedidos'] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setSearch('') }}
              className={`px-5 py-2 rounded-lg font-medium text-sm transition capitalize ${tab === t ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              {t === 'produtos' ? '📦 Produtos' : t === 'fornecedores' ? '🏭 Fornecedores' : '📋 Pedidos'}
            </button>
          ))}
        </div>

        {/* Busca */}
        {tab !== 'pedidos' && (
          <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
            <input
              type="text"
              placeholder={`Buscar ${tab}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {/* Tabela Produtos */}
        {tab === 'produtos' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">SKU</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Produto</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Preço</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Unidade</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan={5} className="text-center py-8 text-gray-400">Carregando...</td></tr>
                ) : produtos.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8 text-gray-400">Nenhum produto encontrado</td></tr>
                ) : (
                  produtos.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-mono text-blue-600">{p.sku}</td>
                      <td className="px-6 py-4 text-sm text-gray-800 font-medium">{p.name}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-800">{formatCurrency(p.price)}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{p.unit}</td>
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
        )}

        {/* Tabela Fornecedores */}
        {tab === 'fornecedores' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Nome</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">CNPJ</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Email</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Telefone</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan={5} className="text-center py-8 text-gray-400">Carregando...</td></tr>
                ) : fornecedores.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8 text-gray-400">Nenhum fornecedor encontrado</td></tr>
                ) : (
                  fornecedores.map((f) => (
                    <tr key={f.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-800 font-medium">{f.name}</td>
                      <td className="px-6 py-4 text-sm font-mono text-gray-600">{f.cnpj}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{f.email || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{f.phone || '-'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${f.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {f.active ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tabela Pedidos */}
        {tab === 'pedidos' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Data</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Fornecedor</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Total</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan={4} className="text-center py-8 text-gray-400">Carregando...</td></tr>
                ) : pedidos.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-8 text-gray-400">Nenhum pedido encontrado</td></tr>
                ) : (
                  pedidos.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-500">{formatDate(p.orderDate)}</td>
                      <td className="px-6 py-4 text-sm text-gray-800 font-medium">{p.supplier.name}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-800">{formatCurrency(p.total)}</td>
                      <td className="px-6 py-4">{getStatusBadge(p.status)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Produto */}
      {showModal && tab === 'produtos' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Novo Produto</h2>
            <form onSubmit={handleSubmitProduto} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input type="text" required value={formProduto.name}
                  onChange={(e) => setFormProduto({ ...formProduto, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                  <input type="text" required value={formProduto.sku}
                    onChange={(e) => setFormProduto({ ...formProduto, sku: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unidade</label>
                  <select value={formProduto.unit}
                    onChange={(e) => setFormProduto({ ...formProduto, unit: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="UN">UN</option>
                    <option value="KG">KG</option>
                    <option value="LT">LT</option>
                    <option value="CX">CX</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$)</label>
                <input type="number" step="0.01" required value={formProduto.price}
                  onChange={(e) => setFormProduto({ ...formProduto, price: e.target.value })}
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
          </div>
        </div>
      )}

      {/* Modal Fornecedor */}
      {showModal && tab === 'fornecedores' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Novo Fornecedor</h2>
            <form onSubmit={handleSubmitFornecedor} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input type="text" required value={formFornecedor.name}
                  onChange={(e) => setFormFornecedor({ ...formFornecedor, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ</label>
                <input type="text" required value={formFornecedor.cnpj}
                  onChange={(e) => setFormFornecedor({ ...formFornecedor, cnpj: e.target.value })}
                  placeholder="00.000.000/0001-00"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={formFornecedor.email}
                  onChange={(e) => setFormFornecedor({ ...formFornecedor, email: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                <input type="text" value={formFornecedor.phone}
                  onChange={(e) => setFormFornecedor({ ...formFornecedor, phone: e.target.value })}
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
          </div>
        </div>
      )}
    </div>
  )
}