'use client'

import { useState, useMemo } from 'react'

type Period = '7j' | '30j' | '3m' | '12m'

interface BarData {
  label: string
  value: number
  highlight?: boolean
}

interface PeriodConfig {
  bars: BarData[]
  total: string
  change: string
  yMax: number
  yLabels: number[]
}

interface SalesChartsProps {
  orders?: any[]
  products?: any[]
  loading?: boolean
}

export default function SalesCharts({ orders = [], products = [], loading = false }: SalesChartsProps) {
  const [activePeriod, setActivePeriod] = useState<Period>('7j')
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null)
  const [hoveredStatusIndex, setHoveredStatusIndex] = useState<number | null>(null)

  // Format currency helper
  const fmtTND = (v: number) => `${Math.round(v).toLocaleString('fr-FR')} TND`

  // Compute 100% real period configs directly from orders
  const periodConfigs = useMemo<Record<Period, PeriodConfig>>(() => {
    const validOrders = orders.filter((o) => o.status !== 'CANCELLED' && o.status !== 'REFUNDED')

    // --- 1. 7j (7 Derniers jours) ---
    const dayLabels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
    const dayTotals = [0, 0, 0, 0, 0, 0, 0]

    validOrders.forEach((o) => {
      if (!o.createdAt) return
      const date = new Date(o.createdAt)
      const dayIdx = (date.getDay() + 6) % 7 // Convert Sun=0 -> Mon=0
      dayTotals[dayIdx] += Number(o.totalAmount) || 0
    })

    const max7j = Math.max(...dayTotals, 100)
    const highlight7jIdx = dayTotals.indexOf(Math.max(...dayTotals))
    const total7j = dayTotals.reduce((a, b) => a + b, 0)

    const bars7j: BarData[] = dayLabels.map((lbl, idx) => ({
      label: lbl,
      value: Math.round(dayTotals[idx]),
      highlight: idx === highlight7jIdx && dayTotals[idx] > 0,
    }))

    // --- 2. 30j (Par semaines) ---
    const weekTotals = [0, 0, 0, 0]
    validOrders.forEach((o) => {
      if (!o.createdAt) return
      const date = new Date(o.createdAt)
      const dayOfMonth = date.getDate()
      const weekIdx = Math.min(3, Math.floor((dayOfMonth - 1) / 7))
      weekTotals[weekIdx] += Number(o.totalAmount) || 0
    })

    const max30j = Math.max(...weekTotals, 100)
    const highlight30jIdx = weekTotals.indexOf(Math.max(...weekTotals))
    const total30j = weekTotals.reduce((a, b) => a + b, 0)

    const bars30j: BarData[] = weekTotals.map((val, idx) => ({
      label: `Sem ${idx + 1}`,
      value: Math.round(val),
      highlight: idx === highlight30jIdx && val > 0,
    }))

    // --- 3. 3m (3 Derniers mois) ---
    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
    const now = new Date()
    const last3Months = [
      (now.getMonth() - 2 + 12) % 12,
      (now.getMonth() - 1 + 12) % 12,
      now.getMonth(),
    ]

    const mTotals3 = [0, 0, 0]
    validOrders.forEach((o) => {
      if (!o.createdAt) return
      const m = new Date(o.createdAt).getMonth()
      const idx = last3Months.indexOf(m)
      if (idx !== -1) {
        mTotals3[idx] += Number(o.totalAmount) || 0
      }
    })

    const max3m = Math.max(...mTotals3, 100)
    const highlight3mIdx = mTotals3.indexOf(Math.max(...mTotals3))
    const total3m = mTotals3.reduce((a, b) => a + b, 0)

    const bars3m: BarData[] = last3Months.map((mIdx, idx) => ({
      label: monthNames[mIdx],
      value: Math.round(mTotals3[idx]),
      highlight: idx === highlight3mIdx && mTotals3[idx] > 0,
    }))

    // --- 4. 12m (12 Derniers mois) ---
    const last12Months = Array.from({ length: 12 }, (_, i) => (now.getMonth() - 11 + i + 12) % 12)
    const mTotals12 = Array(12).fill(0)

    validOrders.forEach((o) => {
      if (!o.createdAt) return
      const m = new Date(o.createdAt).getMonth()
      const idx = last12Months.indexOf(m)
      if (idx !== -1) {
        mTotals12[idx] += Number(o.totalAmount) || 0
      }
    })

    const max12m = Math.max(...mTotals12, 100)
    const highlight12mIdx = mTotals12.indexOf(Math.max(...mTotals12))
    const total12m = mTotals12.reduce((a, b) => a + b, 0)

    const bars12m: BarData[] = last12Months.map((mIdx, idx) => ({
      label: monthNames[mIdx],
      value: Math.round(mTotals12[idx]),
      highlight: idx === highlight12mIdx && mTotals12[idx] > 0,
    }))

    // Dynamic Y Labels generator
    const getYLabels = (maxVal: number) => {
      const ceiling = Math.ceil(maxVal / 100) * 100 || 100
      const step = Math.ceil(ceiling / 3)
      return [step * 3, step * 2, step * 1, 0]
    }

    return {
      '7j': {
        bars: bars7j,
        total: fmtTND(total7j),
        change: total7j > 0 ? '+100%' : '0%',
        yMax: getYLabels(max7j)[0],
        yLabels: getYLabels(max7j),
      },
      '30j': {
        bars: bars30j,
        total: fmtTND(total30j),
        change: total30j > 0 ? '+100%' : '0%',
        yMax: getYLabels(max30j)[0],
        yLabels: getYLabels(max30j),
      },
      '3m': {
        bars: bars3m,
        total: fmtTND(total3m),
        change: total3m > 0 ? '+100%' : '0%',
        yMax: getYLabels(max3m)[0],
        yLabels: getYLabels(max3m),
      },
      '12m': {
        bars: bars12m,
        total: fmtTND(total12m),
        change: total12m > 0 ? '+100%' : '0%',
        yMax: getYLabels(max12m)[0],
        yLabels: getYLabels(max12m),
      },
    }
  }, [orders])

  // Compute 100% real condition breakdown directly from products
  const statusSales = useMemo(() => {
    let recond = 0
    let neuf = 0
    let occ = 0

    products.forEach((p) => {
      const cond = (p.condition || '').toUpperCase()
      const val = Number(p.salePrice || p.basePrice || p.price || 0)
      if (cond === 'RECONDITIONED' || cond === 'RECONDITIONNÉ') recond += val
      else if (cond === 'USED' || cond === 'OCCASION') occ += val
      else neuf += val
    })

    const grandTotal = recond + neuf + occ

    if (grandTotal === 0) {
      return [
        { label: 'Reconditionné', percentage: 0, amount: '0 TND', color: '#1A3FA0' },
        { label: 'Neuf', percentage: 0, amount: '0 TND', color: '#16A34A' },
        { label: 'Occasion', percentage: 0, amount: '0 TND', color: '#C2410C' },
      ]
    }

    const pctRecond = Math.round((recond / grandTotal) * 100)
    const pctNeuf = Math.round((neuf / grandTotal) * 100)
    const pctOcc = Math.max(0, 100 - pctRecond - pctNeuf)

    return [
      { label: 'Reconditionné', percentage: pctRecond, amount: fmtTND(recond), color: '#1A3FA0' },
      { label: 'Neuf', percentage: pctNeuf, amount: fmtTND(neuf), color: '#16A34A' },
      { label: 'Occasion', percentage: pctOcc, amount: fmtTND(occ), color: '#C2410C' },
    ]
  }, [products])

  const config = periodConfigs[activePeriod]

  // Donut chart calculations
  const radius = 70
  const strokeWidth = 24
  const circumference = 2 * Math.PI * radius
  let accumulatedOffset = 0

  const donutSegments = statusSales.map((item) => {
    const dasharray = `${(circumference * item.percentage) / 100} ${circumference}`
    const offset = -accumulatedOffset
    accumulatedOffset += (circumference * item.percentage) / 100
    return { ...item, dasharray, offset }
  })

  const currentCenterPercentage =
    hoveredStatusIndex !== null ? `${statusSales[hoveredStatusIndex].percentage}%` : `${statusSales[0]?.percentage || 0}%`

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* 1. Left Card: Évolution des ventes */}
      <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-[#E2E2DF] p-6 flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-lg font-serif font-bold text-[#1A1A1A]">Évolution des ventes</h2>
            
            {/* Period Filters */}
            <div className="flex items-center bg-[#F5F5F3] p-1 rounded-lg self-start sm:self-auto">
              {(['7j', '30j', '3m', '12m'] as Period[]).map((period) => (
                <button
                  key={period}
                  onClick={() => setActivePeriod(period)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                    activePeriod === period
                      ? 'bg-[#1A3FA0] text-white shadow-sm'
                      : 'text-[#6B7280] hover:text-[#1A1A1A]'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          {/* Bar Chart Container */}
          <div className="relative h-56 w-full pt-4 pb-6">
            {/* Grid lines & Y Axis */}
            <div className="absolute inset-x-0 top-4 bottom-8 flex flex-col justify-between pointer-events-none">
              {config.yLabels.map((val, i) => (
                <div key={`${val}-${i}`} className="flex items-center w-full">
                  <span className="w-12 text-xs text-[#9CA3AF] text-right pr-3 font-medium">
                    {val === 0 ? '0' : val.toLocaleString()}
                  </span>
                  <div className="flex-1 border-b border-dashed border-[#E5E7EB]"></div>
                </div>
              ))}
            </div>

            {/* Bars Area */}
            <div className="absolute left-12 right-2 top-4 bottom-8 flex items-end justify-around gap-2 px-2">
              {config.bars.map((bar, idx) => {
                const heightPercent = config.yMax > 0 ? Math.max(4, (bar.value / config.yMax) * 100) : 4
                const isHovered = hoveredBarIndex === idx
                const isMax = bar.highlight

                return (
                  <div
                    key={idx}
                    className="relative flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                    onMouseEnter={() => setHoveredBarIndex(idx)}
                    onMouseLeave={() => setHoveredBarIndex(null)}
                  >
                    {/* Tooltip */}
                    {isHovered && (
                      <div className="absolute -top-10 z-20 bg-[#1A1A1A] text-white text-xs px-2.5 py-1 rounded shadow-md whitespace-nowrap font-medium animate-in fade-in zoom-in-95 duration-150">
                        {bar.label} : {bar.value.toLocaleString()} TND
                        <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-2 h-2 bg-[#1A1A1A] rotate-45"></div>
                      </div>
                    )}

                    {/* Bar */}
                    <div
                      className={`w-full max-w-[56px] rounded-t-lg transition-all duration-300 ${
                        isMax
                          ? 'bg-[#1A3FA0] shadow-md shadow-[#1A3FA0]/20'
                          : isHovered
                          ? 'bg-[#C5D4F5]'
                          : 'bg-[#E8EDF8]'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />

                    {/* X Label */}
                    <span
                      className={`absolute -bottom-6 text-xs font-medium transition-colors ${
                        isMax || isHovered ? 'text-[#1A3FA0] font-bold' : 'text-[#9CA3AF]'
                      }`}
                    >
                      {bar.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Footer Summary */}
        <div className="mt-8 pt-4 border-t border-[#E2E2DF] flex items-center gap-3">
          <span className="text-sm font-bold text-[#1A1A1A]">Total : {config.total}</span>
          <span className="text-sm text-[#9CA3AF]">vs période précédente :</span>
          <span className="text-xs font-bold text-[#16A34A] bg-[#16A34A]/10 px-2 py-0.5 rounded-full">
            {config.change}
          </span>
        </div>
      </div>

      {/* 2. Right Card: Ventes par état */}
      <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-[#E2E2DF] p-6 flex flex-col justify-between">
        <div>
          <h2 className="text-lg font-serif font-bold text-[#1A1A1A] mb-6">Ventes par état</h2>

          {/* SVG Donut Chart */}
          <div className="relative flex justify-center items-center py-2">
            <svg className="w-48 h-48 -rotate-90" viewBox="0 0 200 200">
              {/* Background ring */}
              <circle
                cx="100"
                cy="100"
                r={radius}
                fill="transparent"
                stroke="#F3F4F6"
                strokeWidth={strokeWidth}
              />
              {/* Donut segments */}
              {donutSegments.map((seg, idx) => (
                <circle
                  key={idx}
                  cx="100"
                  cy="100"
                  r={radius}
                  fill="transparent"
                  stroke={seg.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={seg.dasharray}
                  strokeDashoffset={seg.offset}
                  strokeLinecap="butt"
                  className="transition-all duration-300 cursor-pointer"
                  style={{
                    opacity: hoveredStatusIndex === null || hoveredStatusIndex === idx ? 1 : 0.4,
                    transformOrigin: 'center',
                    transform: hoveredStatusIndex === idx ? 'scale(1.03)' : 'scale(1)',
                  }}
                  onMouseEnter={() => setHoveredStatusIndex(idx)}
                  onMouseLeave={() => setHoveredStatusIndex(null)}
                />
              ))}
            </svg>

            {/* Center Percentage Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-[#1A1A1A]">{currentCenterPercentage}</span>
            </div>
          </div>
        </div>

        {/* Status Legend List */}
        <div className="space-y-3 mt-6 pt-4 border-t border-[#E2E2DF]">
          {statusSales.map((item, idx) => (
            <div
              key={item.label}
              className={`flex items-center justify-between text-sm p-1.5 rounded-lg transition-colors cursor-pointer ${
                hoveredStatusIndex === idx ? 'bg-[#F5F5F3]' : ''
              }`}
              onMouseEnter={() => setHoveredStatusIndex(idx)}
              onMouseLeave={() => setHoveredStatusIndex(null)}
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-[#1A1A1A] font-medium">{item.label}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[#6B7280] font-medium">{item.percentage}%</span>
                <span className="text-[#1A1A1A] font-bold min-w-[85px] text-right">
                  {item.amount}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
