'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function DebugAuthPage() {
  const [clientUser, setClientUser] = useState<any>(null)
  const [serverUser, setServerUser] = useState<any>(null)
  const [cookies, setCookies] = useState<string>('')

  useEffect(() => {
    const supabase = createClient()
    
    // Check client-side user
    supabase.auth.getUser().then(({ data, error }) => {
      setClientUser({ data, error })
    })

    // Get cookies
    setCookies(document.cookie)

    // Check server-side (via API)
    fetch('/api/debug-auth')
      .then((res) => res.json())
      .then((data) => setServerUser(data))
  }, [])

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Auth Debug Page</h1>
      
      <div className="space-y-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="font-semibold mb-2">Client-Side User:</h2>
          <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
            {JSON.stringify(clientUser, null, 2)}
          </pre>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="font-semibold mb-2">Server-Side User:</h2>
          <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
            {JSON.stringify(serverUser, null, 2)}
          </pre>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="font-semibold mb-2">Cookies:</h2>
          <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
            {cookies || 'No cookies found'}
          </pre>
        </div>
      </div>
    </div>
  )
}
