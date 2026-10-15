import React, { useEffect, useRef } from 'react'
import { AiToolsData } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import { useTheme } from '../context/ThemeContext'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const AiTools = () => {
  const navigate = useNavigate()
  const { user } = useUser()
  const { theme } = useTheme()
  
  // Animation refs
  const containerRef = useRef(null)
  const titleRef = useRef(null)
  const subtitleRef = useRef(null)
  const toolsGridRef = useRef(null)
  const toolCardsRef = useRef([])
  const backgroundRef = useRef(null)
  
  useEffect(() => {
    // Component mounted cleanly
  }, [])

  return (
    <div id="AiTools"
      ref={containerRef} 
      className={`px-4 sm:px-20 xl:px-32 relative overflow-hidden py-16 ${
        theme === 'dark' ? 'bg-zinc-950' : 'bg-white'
      }`}
    >
      {/* Background decorative elements - improved positioning */}
      <div ref={backgroundRef} className='absolute inset-0 pointer-events-none overflow-hidden'>
        <div className={`absolute top-20 left-10 w-64 h-64 rounded-full blur-3xl ${
          theme === 'dark' 
            ? 'bg-gradient-to-r from-blue-500/5 to-cyan-500/5' 
            : 'bg-gradient-to-r from-blue-100/50 to-cyan-100/50'
        }`}></div>
        <div className={`absolute top-32 right-16 w-80 h-80 rounded-full blur-3xl ${
          theme === 'dark' 
            ? 'bg-gradient-to-r from-purple-500/5 to-pink-500/5' 
            : 'bg-gradient-to-r from-purple-100/50 to-pink-100/50'
        }`}></div>
        <div className={`absolute bottom-32 left-1/3 w-56 h-56 rounded-full blur-3xl ${
          theme === 'dark' 
            ? 'bg-gradient-to-r from-indigo-500/5 to-blue-500/5' 
            : 'bg-gradient-to-r from-indigo-100/50 to-blue-100/50'
        }`}></div>
      </div>
      
      {/* Content section */}
      <div className='text-center relative z-10 mb-16'>
        <h2 
          ref={titleRef} 
          className={`text-4xl md:text-5xl font-bold mb-6 ${
            theme === 'dark' 
              ? 'text-white bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text' 
              : 'text-zinc-900 bg-gradient-to-r from-zinc-900 via-blue-800 to-zinc-900 bg-clip-text'
          }`}
        >
          AI-Powered Creation Suite
        </h2>
        <p 
          ref={subtitleRef} 
          className={`text-lg max-w-2xl mx-auto leading-relaxed ${
            theme === 'dark' ? 'text-gray-400' : 'text-zinc-600'
          }`}
        >
          Transform your ideas into reality with our comprehensive AI-powered toolkit designed for modern creators
        </p>
      </div>

      {/* Tools grid - 3 columns layout */}
      <div ref={toolsGridRef} className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto relative z-10'>
        {AiToolsData.map((tool, index) => (
          <div 
            key={index} 
            ref={el => toolCardsRef.current[index] = el}
            className={`group relative p-6 rounded-2xl backdrop-blur-sm border cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl ${
              theme === 'dark'
                ? 'bg-zinc-900/90 border-zinc-800/80 hover:border-indigo-500/40 hover:bg-zinc-900'
                : 'bg-white/95 border-zinc-200/90 hover:border-indigo-500/40 hover:bg-white'
            }`}
            onClick={() => navigate(tool.path)}
          >
            {/* Background glow effect */}
            <div className={`card-glow absolute inset-0 rounded-2xl opacity-0 transition-all duration-300 ${
              theme === 'dark'
                ? 'bg-gradient-to-br from-blue-500/0 via-purple-500/0 to-pink-500/0'
                : 'bg-gradient-to-br from-blue-100/0 via-purple-100/0 to-pink-100/0'
            }`}></div>
            
            {/* Card content */}
            <div className='relative z-10'>
              {/* Icon container */}
              <div className='mb-6'>
                <tool.Icon 
                  className='tool-icon w-12 h-12 p-3 text-white rounded-xl shadow-lg transition-all duration-300' 
                  style={{
                    background: `linear-gradient(135deg, ${tool.bg.from}, ${tool.bg.to})`
                  }}
                />
              </div>
              
              {/* Content */}
              <h3 className={`text-xl font-semibold mb-3 transition-colors duration-300 ${
                theme === 'dark'
                  ? 'text-white group-hover:text-blue-300'
                  : 'text-zinc-800 group-hover:text-blue-600'
              }`}>
                {tool.title}
              </h3>
              <p className={`text-sm leading-relaxed transition-colors duration-300 ${
                theme === 'dark'
                  ? 'text-gray-400 group-hover:text-gray-300'
                  : 'text-zinc-600 group-hover:text-zinc-800'
              }`}>
                {tool.description}
              </p>
            </div>
            
            {/* Subtle border highlight on hover */}
            <div className={`absolute inset-0 rounded-2xl border border-transparent transition-all duration-300 ${
              theme === 'dark'
                ? 'group-hover:border-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20'
                : 'group-hover:border-gradient-to-r from-blue-300/30 via-purple-300/30 to-pink-300/30'
            }`}></div>
            
            {/* Corner accent */}
            <div className={`absolute top-0 right-0 w-20 h-20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
              theme === 'dark'
                ? 'bg-gradient-to-br from-white/5 to-transparent'
                : 'bg-gradient-to-br from-zinc-100/50 to-transparent'
            }`}></div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AiTools