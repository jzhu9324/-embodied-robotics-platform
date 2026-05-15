'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const result = await signIn('credentials', {
      email: data.get('email'),
      password: data.get('password'),
      redirect: false,
    })
    if (result?.error) {
      setError('邮箱或密码错误')
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm bg-white rounded-xl border border-gray-200 p-8">
        <h1 className="text-xl font-bold mb-1">具身机器人技术交流平台</h1>
        <p className="text-sm text-gray-500 mb-6">请登录以继续</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">邮箱</Label>
            <Input id="email" name="email" type="email" required className="mt-1" />
          </div>
          <div>
            <Label htmlFor="password">密码</Label>
            <Input id="password" name="password" type="password" required className="mt-1" />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full">登录</Button>
        </form>
      </div>
    </div>
  )
}
