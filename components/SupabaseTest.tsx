'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function SupabaseTest() {
  const [testResult, setTestResult] = useState<string>('')

  const testConnection = async () => {
    try {
      setTestResult('Testing Supabase connection...')
      
      // Test basic connection
      const { data, error } = await supabase
        .from('posts')
        .select('count')
        .limit(1)

      if (error) {
        setTestResult(`Connection failed: ${error.message}`)
        console.error('Supabase test error:', error)
      } else {
        setTestResult('✅ Supabase connection successful! Table exists.')
        console.log('Supabase test successful:', data)
      }
    } catch (error) {
      setTestResult(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      console.error('Unexpected error:', error)
    }
  }

  return (
    <div className="bg-yellow-100 border border-yellow-400 p-4 mb-4 rounded">
      <h3 className="font-bold text-yellow-800 mb-2">Supabase Connection Test</h3>
      <button 
        onClick={testConnection}
        className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded mr-2"
      >
        Test Connection
      </button>
      {testResult && (
        <div className="mt-2 text-sm">
          {testResult}
        </div>
      )}
    </div>
  )
} 