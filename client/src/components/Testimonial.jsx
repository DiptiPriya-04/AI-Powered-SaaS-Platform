import React, { useEffect, useRef } from 'react'
import { assets, dummyTestimonialData } from "../assets/assets"
import { useTheme } from '../context/ThemeContext'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const Testimonial = () => {
    const { theme } = useTheme()
    const containerRef = useRef(null)
    const titleRef = useRef(null)
    const subtitleRef = useRef(null)
    const testimonialCardsRef = useRef([])
    const backgroundRef = useRef(null)

    const handleInstagramRedirect = (link) => {
        if (link) {
            window.open(link, '_blank', 'noopener,noreferrer');
        }
    }

    useEffect(() => {
        // Component mounted cleanly
    }, [])

    return (
        <div 
            ref={containerRef} 
            className={`px-4 sm:px-20 xl:px-32 py-24 relative overflow-hidden ${
                theme === 'dark' ? 'bg-zinc-950' : 'bg-white'
            }`}
        >
            {/* Background decorative elements - improved positioning */}
            <div ref={backgroundRef} className='absolute inset-0 pointer-events-none overflow-hidden'>
                <div className={`absolute top-20 left-10 w-64 h-64 rounded-full blur-3xl ${
                    theme === 'dark'
                        ? 'bg-gradient-to-r from-yellow-500/5 to-orange-500/5'
                        : 'bg-gradient-to-r from-yellow-100/50 to-orange-100/50'
                }`}></div>
                <div className={`absolute top-32 right-16 w-80 h-80 rounded-full blur-3xl ${
                    theme === 'dark'
                        ? 'bg-gradient-to-r from-orange-500/5 to-red-500/5'
                        : 'bg-gradient-to-r from-orange-100/50 to-red-100/50'
                }`}></div>
                <div className={`absolute bottom-32 left-1/3 w-56 h-56 rounded-full blur-3xl ${
                    theme === 'dark'
                        ? 'bg-gradient-to-r from-amber-500/5 to-yellow-500/5'
                        : 'bg-gradient-to-r from-amber-100/50 to-yellow-100/50'
                }`}></div>
            </div>
            
            {/* Content section */}
            <div className='text-center relative z-10 mb-16'>
                <h2 
                    ref={titleRef} 
                    className={`text-4xl md:text-5xl font-bold mb-6 ${
                        theme === 'dark'
                            ? 'text-white bg-gradient-to-r from-white via-yellow-100 to-white bg-clip-text'
                            : 'text-zinc-900 bg-gradient-to-r from-zinc-900 via-yellow-800 to-zinc-900 bg-clip-text'
                    }`}
                >
                    Loved by Creators
                </h2>
                <p 
                    ref={subtitleRef} 
                    className={`text-lg max-w-2xl mx-auto leading-relaxed ${
                        theme === 'dark' ? 'text-gray-400' : 'text-zinc-600'
                    }`}
                >
                    Don't just take our word for it. Here's what our community of creators are saying about their experience
                </p>
            </div>

            {/* Testimonials grid - optimized for 3 cards */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto relative z-10'>
                {dummyTestimonialData.map((testimonial, index) => (
                    <div 
                        key={index} 
                        ref={el => testimonialCardsRef.current[index] = el}
                        className={`group relative p-8 rounded-2xl backdrop-blur-sm border cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl ${
                            theme === 'dark'
                                ? 'bg-zinc-900/90 border-zinc-800/80 hover:border-amber-500/40 hover:bg-zinc-900'
                                : 'bg-white/95 border-zinc-200/90 hover:border-amber-500/40 hover:bg-white'
                        }`}
                    >
                        {/* Background glow effect */}
                        <div className={`card-glow absolute inset-0 rounded-2xl opacity-0 transition-all duration-300 ${
                            theme === 'dark'
                                ? 'bg-gradient-to-br from-yellow-500/0 via-orange-500/0 to-red-500/0'
                                : 'bg-gradient-to-br from-yellow-100/0 via-orange-100/0 to-red-100/0'
                        }`}></div>
                        
                        {/* Card content */}
                        <div className='relative z-10'>
                            {/* Rating stars */}
                            <div className="flex items-center gap-1 mb-6">
                                {Array(5).fill(0).map((_, i) => (
                                    <img 
                                        key={i} 
                                        src={i < testimonial.rating ? assets.star_icon : assets.star_dull_icon} 
                                        className='star-icon w-5 h-5 transition-all duration-300' 
                                        alt="star"
                                    />
                                ))}
                            </div>
                            
                            {/* Testimonial content */}
                            <blockquote className={`text-base leading-relaxed mb-6 transition-colors duration-300 ${
                                theme === 'dark'
                                    ? 'text-gray-300 group-hover:text-gray-200'
                                    : 'text-zinc-600 group-hover:text-zinc-800'
                            }`}>
                                "{testimonial.content}"
                            </blockquote>
                            
                            {/* Divider */}
                            <hr className={`mb-6 transition-colors duration-300 ${
                                theme === 'dark'
                                    ? 'border-zinc-700 group-hover:border-zinc-600'
                                    : 'border-zinc-200 group-hover:border-zinc-300'
                            }`} />
                            
                            {/* User info */}
                            <div className='flex items-center gap-4'>
                                <img 
                                    src={testimonial.image} 
                                    className={`testimonial-avatar w-14 h-14 object-cover rounded-full border-2 transition-all duration-300 cursor-pointer ${
                                        theme === 'dark'
                                            ? 'border-zinc-700 group-hover:border-yellow-400/50'
                                            : 'border-zinc-300 group-hover:border-yellow-500/50'
                                    }`} 
                                    alt={testimonial.name} 
                                    onClick={() => handleInstagramRedirect(testimonial.link)}
                                />
                                <div className='flex-1'>
                                    <h3 
                                        onClick={() => handleInstagramRedirect(testimonial.link)} 
                                        className={`font-semibold text-lg transition-colors duration-300 cursor-pointer ${
                                            theme === 'dark'
                                                ? 'text-white group-hover:text-yellow-400'
                                                : 'text-zinc-800 group-hover:text-yellow-600'
                                        }`}
                                    >
                                        {testimonial.name}
                                    </h3>
                                    <p className={`text-sm transition-colors duration-300 ${
                                        theme === 'dark'
                                            ? 'text-gray-400 group-hover:text-gray-300'
                                            : 'text-zinc-500 group-hover:text-zinc-700'
                                    }`}>
                                        {testimonial.title}
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Subtle border highlight on hover */}
                        <div className={`absolute inset-0 rounded-2xl border border-transparent transition-all duration-300 ${
                            theme === 'dark'
                                ? 'group-hover:border-gradient-to-r from-yellow-500/20 via-orange-500/20 to-red-500/20'
                                : 'group-hover:border-gradient-to-r from-yellow-300/20 via-orange-300/20 to-red-300/20'
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

export default Testimonial