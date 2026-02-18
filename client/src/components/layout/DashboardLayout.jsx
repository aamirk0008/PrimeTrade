import Sidebar from './Sidebar'
import { Toaster } from 'react-hot-toast'

export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-surface-950 noise">
      <Sidebar />
      <main className="flex-1 min-w-0 lg:ml-0 pt-14 lg:pt-0">
        <div className="p-6 lg:p-8 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#1c1c2e',
            color: '#e8e8f5',
            border: '1px solid #2a2a40',
            borderRadius: '10px',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '13px',
          },
          success: { iconTheme: { primary: '#c8f135', secondary: '#0e0e1a' } },
          error:   { iconTheme: { primary: '#f87171', secondary: '#0e0e1a' } },
        }}
      />
    </div>
  )
}
