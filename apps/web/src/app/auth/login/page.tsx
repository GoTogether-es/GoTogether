'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { requestMagicLink } from '@/services/api'
import { Mail, Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

function LoginForm() {
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect')

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [emailError, setEmailError] = useState('')

  const validateEmail = (value: string) => {
    if (!value) { setEmailError(''); return true }
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    setEmailError(valid ? '' : 'Introduce un email válido')
    return valid
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateEmail(email)) return
    setLoading(true)
    setMessage('')
    setIsSuccess(false)

    try {
      if (redirect) {
        document.cookie = `gotogether-auth-redirect=${encodeURIComponent(redirect)}; path=/; max-age=600; SameSite=Lax`
      }
      await requestMagicLink(email, redirect || undefined)
      setMessage('Te hemos enviado un enlace de acceso. Revisa tu bandeja de entrada.')
      setIsSuccess(true)
    } catch (error: unknown) {
      const err = error as any
      if (err?.message?.includes('network') || err?.message?.includes('fetch')) {
        setMessage('Error de conexión. Revisa tu internet e inténtalo de nuevo.')
      } else {
        setMessage(err?.message || 'No se pudo enviar el enlace. Inténtalo de nuevo.')
      }
      setIsSuccess(false)
    }
    setLoading(false)
  }

  return (
    <>
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors mb-8">
        <ArrowLeft className="w-4 h-4" />
        Volver al inicio
      </Link>

      <div className="p-10 bg-white shadow-2xl shadow-blue-900/5 rounded-3xl border border-gray-100 text-center">
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mx-auto mb-6">
          <Mail className="w-8 h-8" />
        </div>

        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Crea o accede a tu cuenta</h1>
        <p className="text-gray-500 mb-8">Te enviaremos un enlace de acceso a tu correo para entrar de forma segura.</p>

        <form onSubmit={handleLogin} className="space-y-6 text-left">
          <div>
            <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">
              Tu correo electrónico
            </label>
            <input
              id="email"
              type="email"
              placeholder="nombre@ejemplo.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
              onBlur={() => validateEmail(email)}
              className="gt-input h-14"
              required
              aria-describedby={emailError ? "email-error" : undefined}
            />
            {emailError && <p id="email-error" className="text-red-500 text-xs mt-1" role="alert">{emailError}</p>}
          </div>
          <button
            type="submit"
            disabled={loading || isSuccess}
            className="w-full h-14 flex items-center justify-center py-2 px-4 border border-transparent rounded-2xl shadow-lg shadow-blue-600/20 text-lg font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Enviando...
              </>
            ) : isSuccess ? 'Enviado correctamente' : 'Enviar enlace de acceso'}
          </button>
        </form>

        {message && (
          <div className={`mt-6 p-4 rounded-xl text-sm font-medium ${isSuccess ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message}
          </div>
        )}
      </div>

      <p className="mt-8 text-center text-sm text-gray-400">
        Al continuar, aceptas nuestros <Link href="/legal/terms" className="underline">Términos de Servicio</Link> y <Link href="/legal/privacy" className="underline">Política de Privacidad</Link>.
      </p>
    </>
  )
}

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="w-full max-w-md">
        <Suspense fallback={<div className="p-10 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
