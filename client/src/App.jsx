import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { CallsPage } from './pages/CallsPage'
import { CommissionsPage } from './pages/CommissionsPage'
import { DashboardPage } from './pages/DashboardPage'
import { DealDetailPage } from './pages/DealDetailPage'
import { DealsPage } from './pages/DealsPage'
import { FollowUpsPage } from './pages/FollowUpsPage'
import { LandingPage } from './pages/LandingPage'
import { LeadDetailPage } from './pages/LeadDetailPage'
import { LeadsPage } from './pages/LeadsPage'
import { PipelinePage } from './pages/PipelinePage'
import { ReportsPage } from './pages/ReportsPage'
import { SettingsPage } from './pages/SettingsPage'
import { TeamPage } from './pages/TeamPage'
import { AcceptInvitePage } from './pages/auth/AcceptInvitePage'
import { AuthLayout } from './pages/auth/AuthLayout'
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage'

export const App = () => (
  <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route element={<AuthLayout />}>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/accept-invite" element={<AcceptInvitePage />} />
    </Route>

    <Route element={<ProtectedRoute />}>
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/leads" element={<LeadsPage />} />
        <Route path="/leads/:id" element={<LeadDetailPage />} />
        <Route path="/pipeline" element={<PipelinePage />} />
        <Route path="/calls" element={<CallsPage />} />
        <Route path="/follow-ups" element={<FollowUpsPage />} />
        <Route path="/deals" element={<DealsPage />} />
        <Route path="/deals/:id" element={<DealDetailPage />} />
        <Route path="/commissions" element={<CommissionsPage />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Route>

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
)
