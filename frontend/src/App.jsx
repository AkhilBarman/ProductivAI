import { useState, useEffect, lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu } from 'lucide-react'
import Sidebar from './components/Sidebar'
import ThemeToggle from './components/ThemeToggle'

const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const AnalysisPage = lazy(() => import('./pages/AnalysisPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))

function RouteFallback() {
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ width: 180, height: 32 }} className="skeleton-pulse" />
      <div style={{ width: 340, height: 16 }} className="skeleton-pulse" />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 16,
          marginTop: 12,
        }}
      >
        {[1, 2, 3, 4, 5, 6, 7].map((n) => (
          <div key={n} style={{ height: 130 }} className="skeleton-pulse" />
        ))}
      </div>
    </div>
  )
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark')

  // Apply theme to <html>
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)', transition: 'background 0.35s' }}>
      {/* Animated Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{ position: 'fixed', left: 0, top: 0, height: '100vh', width: 260, zIndex: 50 }}
            >
              <Sidebar onClose={() => setSidebarOpen(false)} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }}
            />
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main
        style={{
          marginLeft: sidebarOpen ? 260 : 0,
          width: sidebarOpen ? 'calc(100% - 260px)' : '100%',
          minHeight: '100vh',
          transition: 'margin-left 0.35s cubic-bezier(0.4,0,0.2,1), width 0.35s cubic-bezier(0.4,0,0.2,1)',
          padding: '24px 40px 40px 40px',
        }}
      >
        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          {!sidebarOpen && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => setSidebarOpen(true)}
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: 'var(--card-bg)',
                border: '1px solid var(--card-border)',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                flexShrink: 0,
              }}
            >
              <Menu size={18} />
            </motion.button>
          )}
          <div style={{ flex: 1 }} />
          <ThemeToggle theme={theme} setTheme={setTheme} />
        </div>

        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/analysis" element={<AnalysisPage />} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  )
}
