import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { MainLayout } from './components/layout/MainLayout'
import { AuthLayout } from './components/layout/AuthLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import DailySheets from './pages/tasks/DailySheets'
import DailySheetForm from './pages/tasks/DailySheetForm'
import DailySheetDetail from './pages/tasks/DailySheetDetail'
import EventList from './pages/events/EventList'
import EventForm from './pages/events/EventForm'
import EventDetail from './pages/events/EventDetail'
import KPIList from './pages/kpi/KPIList'
import KPIProgress from './pages/kpi/KPIProgress'
import KPIFarm from './pages/kpi/KPIFarm'
import ReportHistory from './pages/reports/ReportHistory'
import MetricsManagement from './pages/reports/MetricsManagement'
import DailyMetricsInput from './pages/reports/DailyMetricsInput'
import MonthlyReport from './pages/reports/MonthlyReport'
import UserList from './pages/users/UserList'
import UserForm from './pages/users/UserForm'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<AuthLayout />}>
            <Route index element={<Login />} />
          </Route>

          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Dashboard />} />
            <Route path="/tasks" element={<DailySheets />} />
            <Route path="/tasks/new" element={<DailySheetForm />} />
            <Route path="/tasks/:id" element={<DailySheetDetail />} />
            <Route path="/tasks/:id/edit" element={<DailySheetForm />} />
            <Route path="/events" element={<EventList />} />
            <Route path="/events/new" element={<EventForm />} />
            <Route path="/events/:id" element={<EventDetail />} />
            <Route path="/events/:id/edit" element={<EventForm />} />
            <Route path="/kpi" element={<KPIList />} />
            <Route path="/kpi/new" element={<KPIFarm />} />
            <Route path="/kpi/:id" element={<KPIProgress />} />
            <Route path="/kpi/:id/edit" element={<KPIFarm />} />
            <Route path="/reports" element={<ReportHistory />} />
            <Route path="/reports/metrics" element={<MetricsManagement />} />
            <Route path="/reports/input-metrics" element={<DailyMetricsInput />} />
            <Route path="/reports/monthly" element={<MonthlyReport />} />
            <Route path="/users" element={<UserList />} />
            <Route path="/users/new" element={<UserForm />} />
            <Route path="/users/:id/edit" element={<UserForm />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
