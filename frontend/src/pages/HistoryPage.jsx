import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts'
import {
  History, ArrowRight, Download, Trash2, RotateCcw,
  TrendingUp, Award, Calendar, CheckCircle2, AlertCircle
} from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } }
const fadeUp  = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } }

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div
      style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--card-border)',
        borderRadius: 10,
        padding: '10px 14px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
      }}
    >
      <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '0 0 4px 0' }}>{d.timestamp}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
          {d.productivity_score}
        </span>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>/ 100</span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            padding: '2px 8px',
            borderRadius: 6,
            background: d.productivity_score >= 75 ? 'rgba(34,197,94,0.15)' : d.productivity_score >= 45 ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)',
            color: d.productivity_score >= 75 ? '#22c55e' : d.productivity_score >= 45 ? '#f59e0b' : '#ef4444',
          }}
        >
          {d.category}
        </span>
      </div>
    </div>
  )
}

export default function HistoryPage() {
  const navigate = useNavigate()
  const [history, setHistory] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [confirmClear, setConfirmClear] = useState(false)

  const fetchHistory = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_URL}/history?limit=100`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setHistory(data.records || [])
      setStats(data.stats || null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [])

  const handleClearHistory = async () => {
    try {
      const res = await fetch(`${API_URL}/history`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Clear failed')
      setHistory([])
      setStats(null)
      setConfirmClear(false)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(history, null, 2))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute('href', dataStr)
    downloadAnchor.setAttribute('download', `productivai_history_${new Date().toISOString().slice(0, 10)}.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
  }

  const handleLoadRoutine = (record) => {
    const routineData = {
      sleep_hours: record.sleep_hours,
      study_hours: record.study_hours,
      exercise_minutes: record.exercise_minutes,
      screen_time_hours: record.screen_time_hours,
      social_media_hours: record.social_media_hours,
      breaks_taken: record.breaks_taken,
      mood_level: record.mood_level,
    }
    localStorage.setItem('lastInput', JSON.stringify(routineData))
    navigate('/')
  }

  // Reverse chronological list for the trend graph (oldest -> newest)
  const trendData = [...history].reverse().map((r, i) => ({
    ...r,
    label: `#${i + 1}`,
  }))

  const getScoreColor = (score) => {
    if (score >= 75) return '#22c55e'
    if (score >= 45) return '#f59e0b'
    return '#ef4444'
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: 40 }}>
      {/* ── Top Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 16,
          marginBottom: 28,
        }}
      >
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
            Productivity History & Trends
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 6, fontSize: 14, lineHeight: 1.5 }}>
            Longitudinal record of evaluated daily routines, score progression, and behavioral patterns.
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <button
            onClick={fetchHistory}
            disabled={loading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 500,
              background: 'var(--input-bg)',
              border: '1px solid var(--card-border)',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            title="Refresh history"
          >
            <RotateCcw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>

          {history.length > 0 && (
            <>
              <button
                onClick={handleExportJSON}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 14px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 500,
                  background: 'var(--input-bg)',
                  border: '1px solid var(--card-border)',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                title="Export history records as JSON"
              >
                <Download size={14} />
                Export JSON
              </button>

              {!confirmClear ? (
                <button
                  onClick={() => setConfirmClear(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 14px',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 500,
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    color: '#ef4444',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <Trash2 size={14} />
                  Clear History
                </button>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button
                    onClick={handleClearHistory}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 600,
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    Confirm Delete
                  </button>
                  <button
                    onClick={() => setConfirmClear(false)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 8,
                      fontSize: 12,
                      background: 'var(--input-bg)',
                      border: '1px solid var(--card-border)',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>

      {/* ── Error Banner ── */}
      {error && (
        <div
          className="glass-card"
          style={{
            padding: '14px 18px',
            borderColor: 'rgba(239, 68, 68, 0.35)',
            color: '#f87171',
            fontSize: 13,
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <AlertCircle size={16} />
          Failed to fetch history: {error}. Check backend server connection.
        </div>
      )}

      {/* ── Loading Skeleton ── */}
      {loading && !history.length && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{ height: 90 }} className="skeleton-pulse" />
            ))}
          </div>
          <div style={{ height: 260 }} className="skeleton-pulse" />
        </div>
      )}

      {/* ── Empty State ── */}
      {!loading && history.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card"
          style={{ padding: '48px 24px', textAlign: 'center' }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: 'rgba(59, 130, 246, 0.1)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 18,
            }}
          >
            <History size={26} color="#3b82f6" />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 8px 0' }}>
            No History Recorded Yet
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, maxWidth: 480, margin: '0 auto 24px auto', lineHeight: 1.6 }}>
            Each routine evaluation you run on the dashboard will be automatically logged to your timeline with score metrics and factor breakdowns.
          </p>
          <button
            onClick={() => navigate('/')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 22px',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 600,
              background: 'var(--primary)',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(59,130,246,0.3)',
            }}
          >
            Go to Dashboard <ArrowRight size={15} />
          </button>
        </motion.div>
      )}

      {/* ── Main Content: Stats, Trendline, and Records ── */}
      {!loading && history.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* KPI Stat Cards */}
          {stats && (
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 14,
              }}
            >
              <motion.div variants={fadeUp} className="glass-card" style={{ padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', marginBottom: 6 }}>
                  <TrendingUp size={16} color="#3b82f6" />
                  <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Average Score
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span style={{ fontSize: 26, fontWeight: 700, color: getScoreColor(stats.average_score) }}>
                    {stats.average_score}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--text-subtle)' }}>/ 100</span>
                </div>
              </motion.div>

              <motion.div variants={fadeUp} className="glass-card" style={{ padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', marginBottom: 6 }}>
                  <Calendar size={16} color="#8b5cf6" />
                  <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Sessions Logged
                  </span>
                </div>
                <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {stats.total_records}
                </div>
              </motion.div>

              <motion.div variants={fadeUp} className="glass-card" style={{ padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', marginBottom: 6 }}>
                  <Award size={16} color="#22c55e" />
                  <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Peak Score
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span style={{ fontSize: 26, fontWeight: 700, color: getScoreColor(stats.highest_score) }}>
                    {stats.highest_score}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--text-subtle)' }}>/ 100</span>
                </div>
              </motion.div>

              <motion.div variants={fadeUp} className="glass-card" style={{ padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', marginBottom: 6 }}>
                  <CheckCircle2 size={16} color="#06b6d4" />
                  <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    High Productivity Rate
                  </span>
                </div>
                <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {stats.high_rate}%
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Longitudinal Trend Chart */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass-card"
            style={{ padding: '24px 20px 16px 20px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                  Productivity Score Progression
                </h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                  Trend line across historical evaluations with benchmark thresholds.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 11, color: 'var(--text-muted)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
                  High Target (≥75)
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} />
                  Moderate (≥45)
                </div>
              </div>
            </div>

            <div style={{ height: 240, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 12, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="scoreAreaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="label" stroke="var(--text-subtle)" fontSize={11} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="var(--text-subtle)" fontSize={11} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <ReferenceLine y={75} stroke="#22c55e" strokeDasharray="3 3" opacity={0.6} />
                  <ReferenceLine y={45} stroke="#f59e0b" strokeDasharray="3 3" opacity={0.6} />
                  <Area
                    type="monotone"
                    dataKey="productivity_score"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#scoreAreaGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Historical Log Cards */}
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 14 }}>
              Evaluation Log ({history.length})
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <AnimatePresence>
                {history.map((record) => {
                  const scoreColor = getScoreColor(record.productivity_score)
                  return (
                    <motion.div
                      key={record.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass-card"
                      style={{
                        padding: '16px 20px',
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 16,
                      }}
                    >
                      {/* Left: Score Badge + Timestamp */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div
                          style={{
                            width: 52,
                            height: 52,
                            borderRadius: 12,
                            background: `${scoreColor}14`,
                            border: `1px solid ${scoreColor}40`,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <span style={{ fontSize: 18, fontWeight: 700, color: scoreColor, lineHeight: 1 }}>
                            {record.productivity_score}
                          </span>
                          <span style={{ fontSize: 9, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 3 }}>
                            Score
                          </span>
                        </div>

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 600,
                                padding: '2px 8px',
                                borderRadius: 6,
                                background: `${scoreColor}18`,
                                color: scoreColor,
                              }}
                            >
                              {record.category}
                            </span>
                            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                              {record.timestamp}
                            </span>
                          </div>

                          {/* Routine Badges */}
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--input-bg)', padding: '3px 8px', borderRadius: 6 }}>
                              Sleep: <strong>{record.sleep_hours}h</strong>
                            </span>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--input-bg)', padding: '3px 8px', borderRadius: 6 }}>
                              Study: <strong>{record.study_hours}h</strong>
                            </span>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--input-bg)', padding: '3px 8px', borderRadius: 6 }}>
                              Exercise: <strong>{record.exercise_minutes}m</strong>
                            </span>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--input-bg)', padding: '3px 8px', borderRadius: 6 }}>
                              Screen: <strong>{record.screen_time_hours}h</strong>
                            </span>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--input-bg)', padding: '3px 8px', borderRadius: 6 }}>
                              Mood: <strong>{record.mood_level}/10</strong>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Load Button */}
                      <button
                        onClick={() => handleLoadRoutine(record)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '8px 14px',
                          borderRadius: 8,
                          fontSize: 12,
                          fontWeight: 500,
                          background: 'var(--input-bg)',
                          border: '1px solid var(--card-border)',
                          color: 'var(--text-primary)',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'var(--primary)'
                          e.currentTarget.style.color = '#60a5fa'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'var(--card-border)'
                          e.currentTarget.style.color = 'var(--text-primary)'
                        }}
                        title="Load this routine's values into the Dashboard"
                      >
                        Load into Dashboard <ArrowRight size={13} />
                      </button>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

