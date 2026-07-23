import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardBody } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Button } from '../../components/ui/Button'
import { useUsers } from '../../hooks/useUsers'
import { ROLES, DEPARTMENTS } from '../../utils/constants'
import { ArrowLeft, Save } from 'lucide-react'

export default function UserForm() {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()
  const { createUser, updateUser, getUserById } = useUsers()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'staff',
    department: '',
  })

  useEffect(() => {
    if (isEdit) {
      const user = getUserById(id)
      if (user) {
        setForm({
          name: user.name,
          email: user.email,
          password: '',
          role: user.role,
          department: user.department,
        })
      }
    }
  }, [id, isEdit, getUserById])

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isEdit) {
        const data = { ...form }
        if (!data.password) delete data.password
        await updateUser(id, data)
      } else {
        await createUser(form)
      }
      navigate('/users')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/users')} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit User' : 'Tambah User Baru'}</h1>
          <p className="text-sm text-gray-500 mt-1">{isEdit ? 'Perbarui data pengguna' : 'Buat akun pengguna baru'}</p>
        </div>
      </div>

      <Card>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Nama Lengkap" name="name" value={form.name} onChange={handleChange} required />
            <Input label="Email" type="email" name="email" value={form.email} onChange={handleChange} required />

            <Input
              label={isEdit ? 'Password (kosongkan jika tidak diubah)' : 'Password'}
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required={!isEdit}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Role"
                name="role"
                value={form.role}
                onChange={handleChange}
                options={Object.entries(ROLES).map(([, v]) => ({ value: v, label: v.charAt(0).toUpperCase() + v.slice(1) }))}
              />
              <Select
                label="Department"
                name="department"
                value={form.department}
                onChange={handleChange}
                options={DEPARTMENTS.map((d) => ({ value: d, label: d }))}
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex items-center gap-3 pt-4">
              <Button type="submit" disabled={loading}>
                <Save size={18} className="mr-1" /> {loading ? 'Menyimpan...' : 'Simpan'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/users')}>Batal</Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}
