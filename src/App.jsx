import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { MainLayout } from './components/layout/MainLayout'
import { AuthLayout } from './components/layout/AuthLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import TaskList from './pages/tasks/TaskList'
import TaskForm from './pages/tasks/TaskForm'
import TaskDetail from './pages/tasks/TaskDetail'
import EventList from './pages/events/EventList'
import EventForm from './pages/events/EventForm'
import EventDetail from './pages/events/EventDetail'
import KPIList from './pages/kpi/KPIList'
import KPIProgress from './pages/kpi/KPIProgress'
import KPIFarm from './pages/kpi/KPIFarm'
import DailyReport from './pages/reports/DailyReport'
import ReportHistory from './pages/reports/ReportHistory'
import MetricsManagement from './pages/reports/MetricsManagement'
import DailyMetricsInput from './pages/reports/DailyMetricsInput'
import DailyLeads from './pages/leads/DailyLeads'
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
            <Route path="/tasks" element={<TaskList />} />
            <Route path="/tasks/new" element={<TaskForm />} />
            <Route path="/tasks/:id" element={<TaskDetail />} />
            <Route path="/tasks/:id/edit" element={<TaskForm />} />
            <Route path="/events" element={<EventList />} />
            <Route path="/events/new" element={<EventForm />} />
            <Route path="/events/:id" element={<EventDetail />} />
            <Route path="/events/:id/edit" element={<EventForm />} />
            <Route path="/kpi" element={<KPIList />} />
            <Route path="/kpi/new" element={<KPIFarm />} />
            <Route path="/kpi/:id" element={<KPIProgress />} />
            <Route path="/kpi/:id/edit" element={<KPIFarm />} />
            <Route path="/reports" element={<ReportHistory />} />
            <Route path="/reports/daily" element={<DailyReport />} />
            <Route path="/reports/metrics" element={<MetricsManagement />} />
            <Route path="/reports/input-metrics" element={<DailyMetricsInput />} />
            <Route path="/reports/leads" element={<DailyLeads />} />
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
