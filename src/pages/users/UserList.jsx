import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Card, CardBody } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Input } from '../../components/ui/Input'
import { Table, Thead, Th, Tbody, Td } from '../../components/ui/Table'
import * as userService from '../../services/userService'
import { formatDateShort } from '../../utils/helpers'
import { Plus, Trash2, Edit } from 'lucide-react'

const roleColors = {
  admin: 'bg-purple-100 text-purple-700',
  manager: 'bg-blue-100 text-blue-700',
  staff: 'bg-gray-100 text-gray-700',
}

export default function UserList() {
  const location = useLocation()
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const loadUsers = useCallback(async () => {
    setLoading(true)
    try {
      const data = await userService.getUsers()
      setUsers(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  useEffect(() => {
    loadUsers()
  }, [location.key, loadUsers])

  const deleteUser = useCallback(async (id) => {
    await userService.deleteUser(id)
    setUsers((prev) => prev.filter((u) => u.id !== id))
  }, [])

  const filtered = users.filter((u) => {
    return u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  })

  const handleDelete = (id) => {
    if (confirm('Hapus user ini?')) deleteUser(id)
  }

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola pengguna sistem</p>
        </div>
        <Button onClick={() => navigate('/users/new')}>
          <Plus size={18} className="mr-1" /> Tambah User
        </Button>
      </div>

      <Card>
        <CardBody>
          <Input placeholder="Cari user..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </CardBody>
      </Card>

      <Card>
        <Table>
          <Thead>
            <Th>User</Th>
            <Th>Email</Th>
            <Th>Role</Th>
            <Th>Department</Th>
            <Th>Bergabung</Th>
            <Th className="text-right">Aksi</Th>
          </Thead>
          <Tbody>
            {filtered.length === 0 ? (
              <tr>
                <Td colSpan={6} className="text-center text-gray-400 py-8">Belum ada user.</Td>
              </tr>
            ) : (
              filtered.map((u) => (
                <tr key={u.id}>
                  <Td>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {u.name.charAt(0)}
                      </div>
                      <span className="font-medium text-gray-900">{u.name}</span>
                    </div>
                  </Td>
                  <Td className="text-gray-500">{u.email}</Td>
                  <Td>
                    <Badge className={roleColors[u.role] || ''}>
                      {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                    </Badge>
                  </Td>
                  <Td>{u.department}</Td>
                  <Td className="text-gray-500">{formatDateShort(u.createdAt)}</Td>
                  <Td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => navigate(`/users/${u.id}/edit`)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(u.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </Td>
                </tr>
              ))
            )}
          </Tbody>
        </Table>
      </Card>
    </div>
  )
}
