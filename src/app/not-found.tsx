"use client"

import { ArrowLeft, Search, Home } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col">


      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          {/* 404 */}
          <h1 className="text-8xl font-bold text-gray-200 mb-4">404</h1>
          
          {/* Main Message */}
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Page not found
          </h2>
          
          <p className="text-gray-600 mb-8">
            Sorry, we couldn't find the page you're looking for.
          </p>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button 
              onClick={() => window.history.back()}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Go back
            </button>
            
            <div className="flex gap-3">
              <button 
                onClick={() => window.location.href = '/'}
                className="flex-1 flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Home className="w-4 h-4" />
                Home
              </button>
              
              <button 
                onClick={() => window.location.href = '/dashboard'}
                className="flex-1 flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Search className="w-4 h-4" />
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="p-6 border-t border-gray-200">
        <div className="text-center text-sm text-gray-500">
          <p>Need help? <a href="/contact" className="text-blue-600 hover:underline">Contact support</a></p>
        </div>
      </footer>
    </div>
  )
}