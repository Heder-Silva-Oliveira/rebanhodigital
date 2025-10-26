
import React, { useState, useMemo } from 'react'
import {Download, TrendingUp, BarChart3, PieChart, Calendar, Filter} from 'lucide-react'
import { useCRUD } from '../hooks/useCRUD'
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart as RechartsPieChart, Pie, Cell, Area, AreaChart
} from 'recharts'

const Reports: React.FC = () => {
  const { data: animals } = useCRUD({ entityName: 'animals' })
  const { data: transactions } = useCRUD({ entityName: 'financial_transactions' })
  const { data: pastures } = useCRUD({ entityName: 'pastures' })

  const [selectedPeriod, setSelectedPeriod] = useState('6months')
  const [selectedReport, setSelectedReport] = useState('overview')

  // Filtros de período
  const getPeriodData = useMemo(() => {
    const now = new Date()
    let startDate: Date

    switch (selectedPeriod) {
      case '1month':
        startDate = subMonths(now, 1)
        break
      case '3months':
        startDate = subMonths(now, 3)
        break
      case '6months':
        startDate = subMonths(now, 6)
        break
      case '1year':
        startDate = subMonths(now, 12)
        break
      default:
        startDate = subMonths(now, 6)
    }

    const filteredTransactions = transactions.filter(t => 
      new Date(t.date) >= startDate
    )

    const filteredAnimals = animals.filter(a => 
      new Date(a.createdAt) >= startDate
    )

    return { filteredTransactions, filteredAnimals, startDate }
  }, [selectedPeriod, transactions, animals])

  // Dados financeiros
  const financialData = useMemo(() => {
    const { filteredTransactions } = getPeriodData
    
    const monthlyStats: Record<string, { receitas: number; despesas: number; count: number }> = {}
    
    filteredTransactions.forEach(transaction => {
      const month = transaction.date.substring(0, 7) // YYYY-MM
      if (!monthlyStats[month]) {
        monthlyStats[month] = { receitas: 0, despesas: 0, count: 0 }
      }
      
      if (transaction.type === 'receita') {
        monthlyStats[month].receitas += transaction.amount
      } else {
        monthlyStats[month].despesas += transaction.amount
      }
      monthlyStats[month].count++
    })
    
    const chartData = Object.entries(monthlyStats)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month: format(new Date(month + '-01'), 'MMM/yy', { locale: ptBR }),
        receitas: data.receitas,
        despesas: data.despesas,
        saldo: data.receitas - data.despesas,
        transacoes: data.count
      }))

    const totalReceitas = filteredTransactions
      .filter(t => t.type === 'receita')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const totalDespesas = filteredTransactions
      .filter(t => t.type === 'despesa')
      .reduce((sum, t) => sum + t.amount, 0)

    return {
      chartData,
      totalReceitas,
      totalDespesas,
      saldo: totalReceitas - totalDespesas,
      totalTransacoes: filteredTransactions.length
    }
  }, [getPeriodData])

  // Dados do rebanho
  const livestockData = useMemo(() => {
    const speciesCount = animals.reduce((acc, animal) => {
      acc[animal.species] = (acc[animal.species] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const statusCount = animals.reduce((acc, animal) => {
      acc[animal.status] = (acc[animal.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const healthCount = animals.reduce((acc, animal) => {
      const health = animal.healthStatus || 'não informado'
      acc[health] = (acc[health] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const speciesData = Object.entries(speciesCount).map(([species, count]) => ({
      name: species,
      value: count
    }))

    const statusData = Object.entries(statusCount).map(([status, count]) => ({
      name: status,
      value: count
    }))

    const healthData = Object.entries(healthCount).map(([health, count]) => ({
      name: health,
      value: count
    }))

    // Análise de crescimento do rebanho
    const { filteredAnimals } = getPeriodData
    const growthData: Record<string, number> = {}
    
    filteredAnimals.forEach(animal => {
      const month = animal.createdAt.substring(0, 7)
      growthData[month] = (growthData[month] || 0) + 1
    })

    const growthChartData = Object.entries(growthData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({
        month: format(new Date(month + '-01'), 'MMM/yy', { locale: ptBR }),
        novos: count
      }))

    return {
      speciesData,
      statusData,
      healthData,
      growthChartData,
      totalAnimals: animals.length,
      activeAnimals: animals.filter(a => a.status === 'ativo').length,
      healthyAnimals: animals.filter(a => a.healthStatus === 'saudavel').length
    }
  }, [animals, getPeriodData])

  // Dados das pastagens
  const pastureData = useMemo(() => {
    const totalArea = pastures.reduce((sum, p) => sum + p.area, 0)
    const totalCapacity = pastures.reduce((sum, p) => sum + p.capacity, 0)
    const totalAnimals = pastures.reduce((sum, p) => sum + (p.currentAnimals || 0), 0)
    
    const utilizationData = pastures.map(pasture => ({
      name: pasture.name,
      capacidade: pasture.capacity,
      ocupacao: pasture.currentAnimals || 0,
      utilizacao: pasture.capacity > 0 ? ((pasture.currentAnimals || 0) / pasture.capacity) * 100 : 0
    }))

    const statusDistribution = pastures.reduce((acc, pasture) => {
      acc[pasture.status] = (acc[pasture.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const statusData = Object.entries(statusDistribution).map(([status, count]) => ({
      name: status,
      value: count
    }))

    return {
      totalArea,
      totalCapacity,
      totalAnimals,
      utilizationRate: totalCapacity > 0 ? (totalAnimals / totalCapacity) * 100 : 0,
      utilizationData,
      statusData,
      totalPastures: pastures.length
    }
  }, [pastures])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#84cc16']

  const exportData = () => {
    // Simular exportação de dados
    const reportData = {
      periodo: selectedPeriod,
      dataGeracao: new Date().toISOString(),
      financeiro: financialData,
      rebanho: livestockData,
      pastagens: pastureData
    }
    
    const dataStr = JSON.stringify(reportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `relatorio-pecuaria-${format(new Date(), 'yyyy-MM-dd')}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Relatórios e Análises</h1>
            <p className="text-gray-600">Insights completos sobre sua propriedade</p>
          </div>
          <div className="flex space-x-4 mt-4 sm:mt-0">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="1month">Último mês</option>
              <option value="3months">Últimos 3 meses</option>
              <option value="6months">Últimos 6 meses</option>
              <option value="1year">Último ano</option>
            </select>
            <button
              onClick={exportData}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <Download size={20} />
              <span>Exportar</span>
            </button>
          </div>
        </div>

        {/* Navegação de Relatórios */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', name: 'Visão Geral', icon: BarChart3 },
                { id: 'financial', name: 'Financeiro', icon: TrendingUp },
                { id: 'livestock', name: 'Rebanho', icon: PieChart },
                { id: 'pastures', name: 'Pastagens', icon: Calendar }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedReport(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm ${
                    selectedReport === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon size={18} />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Conteúdo dos Relatórios */}
        {selectedReport === 'overview' && (
          <div className="space-y-8">
            {/* KPIs Principais */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Saldo Total</h3>
                    <p className={`text-2xl font-bold mt-2 ${financialData.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(financialData.saldo)}
                    </p>
                  </div>
                  <TrendingUp className={financialData.saldo >= 0 ? 'text-green-600' : 'text-red-600'} size={24} />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Total de Animais</h3>
                    <p className="text-2xl font-bold text-blue-600 mt-2">{livestockData.totalAnimals}</p>
                  </div>
                  <BarChart3 className="text-blue-600" size={24} />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Taxa de Utilização</h3>
                    <p className="text-2xl font-bold text-purple-600 mt-2">{pastureData.utilizationRate.toFixed(1)}%</p>
                  </div>
                  <PieChart className="text-purple-600" size={24} />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Área Total</h3>
                    <p className="text-2xl font-bold text-orange-600 mt-2">{pastureData.totalArea} ha</p>
                  </div>
                  <Calendar className="text-orange-600" size={24} />
                </div>
              </div>
            </div>

            {/* Gráficos de Resumo */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Evolução Financeira</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={financialData.chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Area type="monotone" dataKey="saldo" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribuição do Rebanho</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={livestockData.speciesData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {livestockData.speciesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {selectedReport === 'financial' && (
          <div className="space-y-8">
            {/* Métricas Financeiras */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-sm font-medium text-gray-500">Total de Receitas</h3>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {formatCurrency(financialData.totalReceitas)}
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-sm font-medium text-gray-500">Total de Despesas</h3>
                <p className="text-3xl font-bold text-red-600 mt-2">
                  {formatCurrency(financialData.totalDespesas)}
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-sm font-medium text-gray-500">Número de Transações</h3>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  {financialData.totalTransacoes}
                </p>
              </div>
            </div>

            {/* Gráfico Financeiro Detalhado */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Análise Financeira Mensal</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={financialData.chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                  <Bar dataKey="receitas" fill="#10b981" name="Receitas" />
                  <Bar dataKey="despesas" fill="#ef4444" name="Despesas" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Linha de Saldo */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Evolução do Saldo</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={financialData.chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Line type="monotone" dataKey="saldo" stroke="#8b5cf6" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {selectedReport === 'livestock' && (
          <div className="space-y-8">
            {/* Métricas do Rebanho */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-sm font-medium text-gray-500">Total de Animais</h3>
                <p className="text-3xl font-bold text-blue-600 mt-2">{livestockData.totalAnimals}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-sm font-medium text-gray-500">Animais Ativos</h3>
                <p className="text-3xl font-bold text-green-600 mt-2">{livestockData.activeAnimals}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-sm font-medium text-gray-500">Animais Saudáveis</h3>
                <p className="text-3xl font-bold text-emerald-600 mt-2">{livestockData.healthyAnimals}</p>
              </div>
            </div>

            {/* Gráficos do Rebanho */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribuição por Espécie</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={livestockData.speciesData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {livestockData.speciesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Status dos Animais</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={livestockData.statusData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Status de Saúde</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={livestockData.healthData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {livestockData.healthData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Crescimento do Rebanho</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={livestockData.growthChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="novos" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {selectedReport === 'pastures' && (
          <div className="space-y-8">
            {/* Métricas das Pastagens */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-sm font-medium text-gray-500">Total de Pastos</h3>
                <p className="text-3xl font-bold text-blue-600 mt-2">{pastureData.totalPastures}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-sm font-medium text-gray-500">Área Total</h3>
                <p className="text-3xl font-bold text-green-600 mt-2">{pastureData.totalArea} ha</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-sm font-medium text-gray-500">Capacidade Total</h3>
                <p className="text-3xl font-bold text-purple-600 mt-2">{pastureData.totalCapacity}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-sm font-medium text-gray-500">Taxa de Utilização</h3>
                <p className="text-3xl font-bold text-orange-600 mt-2">{pastureData.utilizationRate.toFixed(1)}%</p>
              </div>
            </div>

            {/* Gráficos das Pastagens */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Utilização por Pasto</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={pastureData.utilizationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="utilizacao" fill="#10b981" name="Utilização %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Status dos Pastos</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={pastureData.statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pastureData.statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Tabela de Utilização Detalhada */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Detalhes por Pasto</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pasto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Capacidade
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ocupação
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Utilização
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pastureData.utilizationData.map((pasture, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {pasture.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {pasture.capacidade}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {pasture.ocupacao}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="bg-green-600 h-2 rounded-full" 
                                style={{ width: `${Math.min(pasture.utilizacao, 100)}%` }}
                              ></div>
                            </div>
                            <span>{pasture.utilizacao.toFixed(1)}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            pasture.utilizacao > 90 ? 'bg-red-100 text-red-800' :
                            pasture.utilizacao > 70 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {pasture.utilizacao > 90 ? 'Superlotado' :
                             pasture.utilizacao > 70 ? 'Alto' : 'Normal'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Reports
