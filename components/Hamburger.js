'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Menu, X, User, LogOut } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleProfile = () => {
    router.push('/profile')
  }

  const toggleMenu = () => setIsOpen(!isOpen)

  return (
    <div className="relative z-50">
      <button
        onClick={toggleMenu}
        aria-expanded={isOpen}
        aria-label="Toggle menu"
        className="p-2 text-gray-200 hover:bg-gray-700 focus:ring-2 focus:ring-gray-400 rounded-md transition-colors"
      >
        <Menu className="h-6 w-6" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            aria-hidden="true"
            onClick={toggleMenu}
          />

          <div 
            className={`fixed inset-y-0 left-0 w-64 md:w-80 bg-gray-900 p-6 shadow-lg transition-transform duration-300 ease-in-out transform ${
              isOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <div className="flex flex-col h-full">
              <div className="flex justify-end">
                <button
                  onClick={toggleMenu}
                  aria-label="Close menu"
                  className="p-2 text-gray-400 hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 rounded-md transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <nav className="flex flex-col space-y-4 mt-8">
                <button
                  onClick={handleProfile}
                  className="flex items-center justify-start px-4 py-2 text-sm font-medium text-gray-200 bg-gray-800 hover:bg-gray-700 rounded-md transition-colors"
                >
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-start px-4 py-2 text-sm font-medium text-gray-200 bg-gray-800 hover:bg-gray-700 rounded-md transition-colors"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </button>
              </nav>
            </div>
          </div>
        </>
      )}
    </div>
  )
}