import { NavLink } from 'react-router-dom'
import { LayoutDashboard, CheckSquare, Calendar, BarChart3, FileText, Users, X } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/tasks', label: 'Task Harian', icon: CheckSquare },
  { to: '/events', label: 'Events', icon: Calendar },
  { to: '/kpi', label: 'KPI', icon: BarChart3 },
  {
    to: '/reports',
    label: 'Reports',
    icon: FileText,
    children: [
      { to: '/reports', label: 'Riwayat Laporan' },
      { to: '/reports/metrics', label: 'Setup Metrics' },
      { to: '/reports/input-metrics', label: 'Input Metrics' },
      { to: '/reports/monthly', label: 'Monthly Report' },
    ],
  },
]

export function Sidebar({ isOpen, onClose }) {
  const { isAdmin } = useAuth()

  const items = isAdmin ? [...navItems, { to: '/users', label: 'Users', icon: Users }] : navItems

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
          <div>
            <h1 className="text-lg font-bold text-blue-600">AOMS</h1>
            <p className="text-xs text-gray-500">STIFIn Family</p>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 lg:hidden">
            <X size={20} />
          </button>
        </div>
        <nav className="p-4 space-y-1">
          {items.map((item) => (
            item.children ? (
              <div key={item.to} className="space-y-1">
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600">
                  <item.icon size={20} />
                  {item.label}
                </div>
                <div className="ml-6 space-y-0.5 border-l border-gray-200 pl-3">
                  {item.children.map((child) => (
                    <NavLink
                      key={child.to}
                      to={child.to}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                        }`
                      }
                    >
                      {child.label}
                    </NavLink>
                  ))}
                </div>
              </div>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`
                }
              >
                <item.icon size={20} />
                {item.label}
              </NavLink>
            )
          ))}
        </nav>
      </aside>
    </>
  )
}
