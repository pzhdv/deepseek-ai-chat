import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex flex-col items-center justify-center h-64 p-4">
            <div className="text-red-500 text-xl mb-4">出现了一些问题</div>
            <div className="text-gray-600 dark:text-gray-400 text-center mb-4">
              {this.state.error?.message || '未知错误'}
            </div>
            <button
              onClick={() =>
                this.setState({ hasError: false, error: undefined })
              }
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              重试
            </button>
          </div>
        )
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
