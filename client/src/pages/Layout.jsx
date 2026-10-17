import React, { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import { SignIn, useUser } from '@clerk/clerk-react'
import { useTheme } from '../context/ThemeContext'

const Layout = () => {
  const navigate = useNavigate()
  const [sidebar, setSidebar] = useState(false)
  const { isLoaded, isSignedIn, user } = useUser()
  const { theme } = useTheme()

  if (!isLoaded) {
    return (
      <div className={`fixed inset-0 flex items-center justify-center ${
        theme === 'dark' ? 'bg-zinc-950' : 'bg-white'
      }`}>
        <div className={`w-10 h-10 border-4 rounded-full animate-spin ${
          theme === 'dark' ? 'border-[#4f6cff] border-t-transparent' : 'border-blue-600 border-t-transparent'
        }`}></div>
      </div>
    )
  }

  return (isSignedIn && user) ? (
    <div className={`fixed inset-0 flex flex-col overflow-hidden ${
      theme === 'dark' ? 'bg-zinc-950' : 'bg-white'
    }`}>
      {/* Navbar - fixed height */}
      <nav className={`w-full h-16 px-8 flex items-center justify-between flex-shrink-0 ${
        theme === 'dark' 
          ? 'border-b border-gray-800 bg-zinc-950' 
          : 'border-b border-gray-200 bg-white'
      }`}>
        <div 
          onClick={() => navigate('/')}
          className="cursor-pointer hover:opacity-90 transition-opacity"
        >
          <h1 className={`text-2xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-500 bg-clip-text text-transparent ${
            theme === 'light' ? 'from-blue-700 to-purple-600' : ''
          }`}>
            Creation<span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Suite</span>
            <span className={`text-xs align-top ml-1 px-2 py-1 rounded-full ${
              theme === 'dark' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-blue-600 text-white'
            }`}>.ai</span>
          </h1>
        </div>
        {sidebar ? (
          <X 
            onClick={() => setSidebar(false)} 
            className={`w-6 h-6 sm:hidden cursor-pointer ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}
          />
        ) : (
          <Menu 
            onClick={() => setSidebar(true)} 
            className={`w-6 h-6 sm:hidden cursor-pointer ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}
          />
        )}
      </nav>

      {/* Main content area*/}
      <div className='flex-1 flex overflow-hidden'>
        <Sidebar sidebar={sidebar} setSidebar={setSidebar} />
        {/* Content container with scroll */}
        <div className={`flex-1 overflow-auto ${
          theme === 'dark' ? 'bg-zinc-950 text-gray-400' : 'bg-white text-gray-600'
        }`}>
          <Outlet />
        </div>
      </div>
    </div>
  ) : (
    <div className={`fixed inset-0 flex items-center justify-center overflow-auto ${
      theme === 'dark' ? 'bg-zinc-950' : 'bg-white'
    }`}>
      <div className={`p-8 rounded-lg m-4 ${
        theme === 'dark' ? 'bg-zinc-900' : 'bg-gray-50'
      }`}>
        <SignIn appearance={{
          baseTheme: theme === 'dark' ? 'dark' : 'light',
          variables: {
            colorBackground: theme === 'dark' ? '#09090b' : '#ffffff',
            colorText: theme === 'dark' ? 'white' : '#111827',
            colorPrimary: '#4f46e5'
          },
          elements: {
            card: {
              backgroundColor: theme === 'dark' ? '#18181b' : '#f9fafb',
              boxShadow: theme === 'dark' 
                ? '0 0 0 1px rgba(255, 255, 255, 0.1)' 
                : '0 0 0 1px rgba(0, 0, 0, 0.1)'
            },
            footer: {
              '& + div': {
                borderTopColor: theme === 'dark' ? '#27272a' : '#e5e7eb'
              }
            }
          }
        }} />
      </div>
    </div>
  )
}

export default Layout