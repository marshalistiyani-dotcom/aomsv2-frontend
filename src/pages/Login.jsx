import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardBody } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { LogIn } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardBody className="p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-blue-600">AOMS</h1>
          <p className="text-sm text-gray-500 mt-1">Operations Management System</p>
          <p className="text-xs text-gray-400">STIFIn Family</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            <LogIn size={18} className="mr-2" />
            {loading ? 'Memproses...' : 'Masuk'}
          </Button>
        </form>
      </CardBody>
    </Card>
  )
}
