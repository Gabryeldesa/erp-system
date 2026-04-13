'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-500 text-lg">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Topbar */}
      <div className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">ERP</span>
          </div>
          <h1 className="text-lg font-semibold text-gray-800">ERP Corporativo</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            Olá, <strong>{session?.user?.name}</strong>
          </span>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
            {(session?.user as any)?.role}
          </span>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="text-sm text-red-500 hover:text-red-700 font-medium"
          >
            Sair
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 min-h-screen bg-white shadow-sm p-4">
          <nav className="space-y-1">
            {[
              { name: 'Dashboard', icon: '📊' },
              { name: 'Financeiro', icon: '💰' },
              { name: 'Controladoria', icon: '📈' },
              { name: 'Contabilidade', icon: '📒' },
              { name: 'Contratos', icon: '📄' },
              { name: 'RH', icon: '👥' },
              { name: 'Dep. Pessoal', icon: '🗂️' },
              { name: 'Compras', icon: '🛒' },
              { name: 'Fiscal', icon: '🧾' },
              { name: 'Jurídico', icon: '⚖️' },
            ].map((item) => (
              <button
                key={item.name}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition text-sm font-medium"
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h2>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { title: 'Receita do Mês', value: 'R$ 49.500', color: 'bg-green-500', icon: '📈' },
              { title: 'Despesas do Mês', value: 'R$ 35.500', color: 'bg-red-500', icon: '📉' },
              { title: 'Saldo', value: 'R$ 14.000', color: 'bg-blue-500', icon: '💰' },
              { title: 'Funcionários', value: '3 ativos', color: 'bg-purple-500', icon: '👥' },
            ].map((card) => (
              <div key={card.title} className="bg-white rounded-xl shadow-sm p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-500 font-medium">{card.title}</span>
                  <span className="text-xl">{card.icon}</span>
                </div>
                <div className="text-2xl font-bold text-gray-800">{card.value}</div>
                <div className={`h-1 rounded-full mt-3 ${card.color}`}></div>
              </div>
            ))}
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h3 className="font-semibold text-gray-700 mb-3">⚠️ Contas a Vencer</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex justify-between"><span>Aluguel escritório</span><span className="text-red-500 font-medium">R$ 4.500</span></li>
                <li className="flex justify-between"><span>Conta de energia</span><span className="text-orange-500 font-medium">R$ 850</span></li>
                <li className="flex justify-between"><span>Material escritório</span><span className="text-orange-500 font-medium">R$ 350</span></li>
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-5">
              <h3 className="font-semibold text-gray-700 mb-3">✅ Recebimentos Previstos</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex justify-between"><span>Consultoria Cliente A</span><span className="text-green-500 font-medium">R$ 12.000</span></li>
                <li className="flex justify-between"><span>Mensalidade Cliente C</span><span className="text-green-500 font-medium">R$ 2.500</span></li>
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-5">
              <h3 className="font-semibold text-gray-700 mb-3">📋 Contratos Ativos</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex justify-between"><span>Manutenção TI</span><span className="text-blue-500 font-medium">R$ 24.000</span></li>
                <li className="flex justify-between"><span>Fornec. Material</span><span className="text-blue-500 font-medium">R$ 6.000</span></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}