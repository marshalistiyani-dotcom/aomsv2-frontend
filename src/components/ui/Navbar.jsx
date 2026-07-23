import { Menu, Bell, LogOut } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

export function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-4 lg:px-6 h-16">
        <button onClick={onMenuClick} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg lg:hidden">
          <Menu size={22} />
        </button>

        <div className="flex-1" />

        <div className="flex items-center gap-3">
          <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg relative">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-700">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
          <button onClick={logout} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg" title="Logout">
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  )
}
