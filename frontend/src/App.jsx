import { Routes, Route, Navigate } from 'react-router-dom'
import { isConfigured } from './api/client'
import Layout from './components/Layout'
import DashboardPage from './pages/DashboardPage'
import ProfilePage from './pages/ProfilePage'
import PhoneNumbersPage from './pages/PhoneNumbersPage'
import TemplatesPage from './pages/TemplatesPage'
import MessagesPage from './pages/MessagesPage'
import BillingPage from './pages/BillingPage'
import SettingsPage from './pages/SettingsPage'

function RequireConfig({ children }) {
  if (!isConfigured()) return <Navigate to="/settings" replace />
  return children
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/" element={<RequireConfig><DashboardPage /></RequireConfig>} />
        <Route path="/profile" element={<RequireConfig><ProfilePage /></RequireConfig>} />
        <Route path="/phone-numbers" element={<RequireConfig><PhoneNumbersPage /></RequireConfig>} />
        <Route path="/templates" element={<RequireConfig><TemplatesPage /></RequireConfig>} />
        <Route path="/messages" element={<RequireConfig><MessagesPage /></RequireConfig>} />
        <Route path="/billing" element={<RequireConfig><BillingPage /></RequireConfig>} />
      </Routes>
    </Layout>
  )
}
