'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: string
  message: string
  type: ToastType
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast: Toast = { id, message, type }
    
    setToasts((prev) => [...prev, newToast])
    
    // Auto remove after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 4000)
  }, [])

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-3 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto animate-slide-in transform transition-all duration-300"
          >
            <div
              className={`min-w-[320px] max-w-md rounded-xl shadow-2xl border-2 p-4 flex items-start gap-3 ${
                toast.type === 'success'
                  ? 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-400'
                  : toast.type === 'error'
                  ? 'bg-gradient-to-br from-red-50 to-red-100 border-red-400'
                  : toast.type === 'warning'
                  ? 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-400'
                  : 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-400'
              }`}
            >
              {/* Icon */}
              <div className="flex-shrink-0">
                {toast.type === 'success' && (
                  <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                {toast.type === 'error' && (
                  <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                )}
                {toast.type === 'warning' && (
                  <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                )}
                {toast.type === 'info' && (
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Message */}
              <div className="flex-1 pt-0.5">
                <p className={`text-sm font-semibold ${
                  toast.type === 'success'
                    ? 'text-emerald-900'
                    : toast.type === 'error'
                    ? 'text-red-900'
                    : toast.type === 'warning'
                    ? 'text-orange-900'
                    : 'text-blue-900'
                }`}>
                  {toast.message}
                </p>
              </div>

              {/* Close button */}
              <button
                onClick={() => removeToast(toast.id)}
                className={`flex-shrink-0 rounded-lg p-1 transition-colors ${
                  toast.type === 'success'
                    ? 'hover:bg-emerald-200 text-emerald-700'
                    : toast.type === 'error'
                    ? 'hover:bg-red-200 text-red-700'
                    : toast.type === 'warning'
                    ? 'hover:bg-orange-200 text-orange-700'
                    : 'hover:bg-blue-200 text-blue-700'
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
