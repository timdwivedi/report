"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Eye, EyeOff } from 'lucide-react'
import { BrandMark } from '@/components/shared/BrandMark'
import { motion } from 'motion/react'

export default function SignupPage() {
  const [fullName, setFullName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!agreeToTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy')
      setLoading(false)
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
          data: {
            full_name: fullName,
            company_name: companyName,
          },
        },
      })

      if (error) throw error

      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Failed to sign up')
    } finally {
      setLoading(false)
    }
  }

  const [notification, setNotification] = useState<string | null>(null)

  const handleGoogleSignUp = () => {
    setNotification('Google sign-up will be connected during setup')
    setTimeout(() => setNotification(null), 4000)
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md text-center">
          <div className="mb-6 w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-3">Check your email</h1>
          <p className="text-slate-600 mb-8">
            We've sent you a confirmation link to <strong>{email}</strong>. Please check your inbox and click the link to verify your account.
          </p>
          <Link
            href="/login"
            className="inline-block bg-blue-500 text-white px-7 py-3 rounded-[10px] font-semibold text-base shadow-[0_4px_14px_rgba(59,130,246,0.3)] hover:bg-blue-600 hover:-translate-y-0.5 transition-all duration-200"
          >
            Back to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Gradient with testimonial */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-900 p-12 flex-col justify-between">
        <div>
          <div className="flex items-center mb-12">
            <BrandMark size={40} showText={true} textClassName="text-2xl font-heading font-bold text-white ml-2" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Run Your Merch Empire</h2>
          <p className="text-blue-100 text-lg">
            From spreadsheets to instant quoting in minutes. Stop losing deals to competitors who quote faster.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
          <p className="text-white text-lg leading-relaxed mb-4">
            "$131K in 9 days — all manually through spreadsheets. If I'd had BrandOps, I would've hit $300K.
            The quoting engine alone saves me 15 hours a week."
          </p>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white font-semibold">
              TS
            </div>
            <div>
              <p className="text-white font-semibold">Trevor Sarver</p>
              <p className="text-blue-200 text-sm">CEO, 85 Supply</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Signup Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: {
              transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
              }
            }
          }}
          className="w-full max-w-md"
        >
          {/* Logo (mobile only) */}
          <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }} className="lg:hidden flex items-center mb-8">
            <BrandMark size={40} showText={true} textClassName="text-xl font-heading font-bold text-slate-900 ml-2" />
          </motion.div>

          <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }} className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Create an account</h1>
            <p className="text-slate-500">Get started with your free account</p>
          </motion.div>

          {error && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </motion.div>
          )}

          {/* Google Sign Up */}
          <motion.button
            variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={handleGoogleSignUp}
            className="w-full mb-4 flex items-center justify-center gap-3 px-4 py-3 border border-slate-200 shadow-sm rounded-lg hover:bg-slate-50 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M19.6 10.227c0-.709-.064-1.39-.182-2.045H10v3.868h5.382a4.6 4.6 0 01-1.996 3.018v2.51h3.232c1.891-1.742 2.982-4.305 2.982-7.35z" fill="#4285F4" />
              <path d="M10 20c2.7 0 4.964-.895 6.618-2.423l-3.232-2.509c-.895.6-2.04.955-3.386.955-2.605 0-4.81-1.76-5.595-4.123H1.064v2.59A9.996 9.996 0 0010 20z" fill="#34A853" />
              <path d="M4.405 11.9c-.2-.6-.314-1.24-.314-1.9 0-.66.114-1.3.314-1.9V5.51H1.064A9.996 9.996 0 000 10c0 1.614.386 3.14 1.064 4.49l3.34-2.59z" fill="#FBBC05" />
              <path d="M10 3.977c1.468 0 2.786.505 3.823 1.496l2.868-2.868C14.959.99 12.695 0 10 0 6.09 0 2.71 2.24 1.064 5.51l3.34 2.59C5.19 5.736 7.395 3.977 10 3.977z" fill="#EA4335" />
            </svg>
            <span className="font-medium text-slate-700">Continue with Google</span>
          </motion.button>

          {notification && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-2 p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-sm"
            >
              {notification}
            </motion.div>
          )}

          <motion.div variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }} className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-slate-500 font-medium">or continue with email</span>
            </div>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
              <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-2">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                autoComplete="name"
                className="w-full h-11 border border-slate-200 shadow-sm rounded-lg px-4 text-base bg-white focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all duration-200"
                placeholder="Trevor Sarver"
              />
            </motion.div>

            <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
              <label htmlFor="companyName" className="block text-sm font-medium text-slate-700 mb-2">
                Company Name
              </label>
              <input
                id="companyName"
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
                autoComplete="organization"
                className="w-full h-11 border border-slate-200 shadow-sm rounded-lg px-4 text-base bg-white focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all duration-200"
                placeholder="85 Supply"
              />
            </motion.div>

            <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full h-11 border border-slate-200 shadow-sm rounded-lg px-4 text-base bg-white focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all duration-200"
                placeholder="you@example.com"
              />
            </motion.div>

            <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className="w-full h-11 border border-slate-200 shadow-sm rounded-lg px-4 pr-11 text-base bg-white focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all duration-200"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </motion.div>

            <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-slate-300 text-primary-500 focus:ring-primary-500 cursor-pointer"
                />
                <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
                  I agree to the{' '}
                  <Link href="/terms" className="text-primary-600 hover:text-primary-700 font-medium">
                    Terms of Service
                  </Link>
                  {' '}and{' '}
                  <Link href="/privacy" className="text-primary-600 hover:text-primary-700 font-medium">
                    Privacy Policy
                  </Link>
                </span>
              </label>
            </motion.div>

            <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full bg-primary-500 text-white px-7 py-3 rounded-[10px] font-semibold text-base shadow-[0_4px_14px_rgba(59,130,246,0.3)] hover:bg-primary-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </motion.button>
            </motion.div>
          </form>

          <motion.p variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }} className="text-center text-sm text-slate-600 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
              Sign in
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  )
}
