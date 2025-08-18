'use client'

import React from 'react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 React Error Boundary caught an error:')
    console.error('Error:', error)
    console.error('Error Info:', errorInfo)
    console.error('Stack Trace:', error.stack)
    
    this.setState({
      error,
      errorInfo,
    })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error!} reset={this.handleReset} />
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="text-6xl mb-4">💥</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Oops! Something went wrong
            </h1>
            <p className="text-gray-600 mb-6">
              The app encountered an unexpected error. This has been logged for our team to investigate.
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left bg-gray-100 rounded-lg p-4 mb-6">
                <summary className="font-semibold text-red-600 cursor-pointer">
                  Error Details (Development Only)
                </summary>
                <div className="mt-2 text-sm text-gray-700">
                  <p><strong>Error:</strong> {this.state.error.message}</p>
                  {this.state.error.stack && (
                    <pre className="mt-2 whitespace-pre-wrap text-xs bg-gray-200 p-2 rounded">
                      {this.state.error.stack}
                    </pre>
                  )}
                </div>
              </details>
            )}
            
            <div className="space-y-3">
              <button
                onClick={this.handleReset}
                className="w-full bg-primary-500 text-white py-3 px-6 rounded-lg hover:bg-primary-600 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-gray-500 text-white py-3 px-6 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
