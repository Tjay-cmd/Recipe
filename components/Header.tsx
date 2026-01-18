'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { SignOutButton } from './SignOutButton'

export function Header() {
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    
    // Check auth status
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      
      // Check if user is admin
      if (user?.email) {
        const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',').map(e => e.trim()) || []
        setIsAdmin(adminEmails.includes(user.email))
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
      
      if (session?.user?.email) {
        const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',').map(e => e.trim()) || []
        setIsAdmin(adminEmails.includes(session.user.email))
      } else {
        setIsAdmin(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🍳</span>
            <span className="text-xl font-bold text-gray-900">RecipeHub</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/recipes" className="text-gray-700 hover:text-emerald-600 transition-colors">
              Recipes
            </Link>
            <Link href="/shopping-list" className="text-gray-700 hover:text-emerald-600 transition-colors">
              Shopping List
            </Link>
            <Link href="/pro" className="text-gray-700 hover:text-emerald-600 transition-colors">
              Pro
            </Link>
            {user ? (
              <>
                <Link href="/account" className="text-gray-700 hover:text-emerald-600 transition-colors">
                  Account
                </Link>
                {isAdmin && (
                  <Link href="/admin" className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors">
                    Admin
                  </Link>
                )}
                <SignOutButton />
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-700 hover:text-emerald-600 transition-colors">
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6 text-gray-700"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {mobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-4">
              <Link
                href="/recipes"
                className="text-gray-700 hover:text-emerald-600 transition-colors px-4 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Recipes
              </Link>
              <Link
                href="/shopping-list"
                className="text-gray-700 hover:text-emerald-600 transition-colors px-4 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Shopping List
              </Link>
              <Link
                href="/pro"
                className="text-gray-700 hover:text-emerald-600 transition-colors px-4 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pro
              </Link>
              {user ? (
                <>
                  <Link
                    href="/account"
                    className="text-gray-700 hover:text-emerald-600 transition-colors px-4 py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Account
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors px-4 py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Admin
                    </Link>
                  )}
                  <div className="px-4">
                    <SignOutButton />
                  </div>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-gray-700 hover:text-emerald-600 transition-colors px-4 py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="mx-4 px-4 py-2 bg-emerald-600 text-white text-center rounded-lg hover:bg-emerald-700 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
