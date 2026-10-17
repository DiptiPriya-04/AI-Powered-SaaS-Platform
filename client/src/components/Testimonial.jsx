import React, { useEffect, useRef } from 'react'
import { assets, dummyTestimonialData } from "../assets/assets"
import { useTheme } from '../context/ThemeContext'

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
        // Load GSAP
        const script = document.createElement('script')
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js'
        script.onload = () => {
            const { gsap } = window
            
            // Load ScrollTrigger
            const scrollScript = document.createElement('script')
            scrollScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js'
            scrollScript.onload = () => {
                gsap.registerPlugin(window.ScrollTrigger)
                
                // Set initial states - more subtle
                gsap.set([titleRef.current, subtitleRef.current], {
                    opacity: 0,
                    y: 30
                })
                
                gsap.set(testimonialCardsRef.current, {
                    opacity: 0,
                    y: 40,
                    scale: 0.95
                })
                
                // Main entrance animation - smoother and faster
                const mainTL = gsap.timeline({
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: "top 85%",
                        toggleActions: "play none none reverse"
                    }
                })
                
                // Title animation - elegant entrance
                mainTL.to(titleRef.current, {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    ease: "power2.out"
                })
                
                // Subtitle follows quickly
                .to(subtitleRef.current, {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    ease: "power2.out"
                }, "-=0.4")
                
                // Cards animate in sequence - more refined
                .to(testimonialCardsRef.current, {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.6,
                    ease: "power2.out",
                    stagger: {
                        amount: 0.6,
                        from: "start"
                    }
                }, "-=0.2")
                
                // Enhanced but subtle card interactions
                testimonialCardsRef.current.forEach((card) => {
                    if (card) {
                        let hoverTL = gsap.timeline({ paused: true })
                        
                        // Create hover timeline once
                        hoverTL
                            .to(card, {
                                y: -8,
                                scale: 1.02,
                                duration: 0.3,
                                ease: "power2.out"
                            }, 0)
                            .to(card.querySelector('.testimonial-avatar'), {
                                scale: 1.1,
                                duration: 0.3,
                                ease: "back.out(1.7)"
                            }, 0)
                            .to(card.querySelector('.card-glow'), {
                                opacity: 0.08,
                                duration: 0.3,
                                ease: "power2.out"
                            }, 0)
                            .to(card.querySelectorAll('.star-icon'), {
                                scale: 1.1,
                                duration: 0.3,
                                ease: "back.out(1.7)",
                                stagger: 0.05
                            }, 0)
                        
                        // Mouse events
                        card.addEventListener('mouseenter', () => {
                            hoverTL.play()
                        })
                        
                        card.addEventListener('mouseleave', () => {
                            hoverTL.reverse()
                        })
                        
                        // Subtle click feedback
                        card.addEventListener('mousedown', () => {
                            gsap.to(card, {
                                scale: 0.98,
                                duration: 0.1,
                                ease: "power2.out"
                            })
                        })
                        
                        card.addEventListener('mouseup', () => {
                            gsap.to(card, {
                                scale: 1.02,
                                duration: 0.2,
                                ease: "back.out(2)"
                            })
                        })
                    }
                })
                
                // Subtle parallax - much gentler
                gsap.to(testimonialCardsRef.current, {
                    y: -20,
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: "top bottom",
                        end: "bottom top",
                        scrub: 2
                    }
                })
                
                // Background elements gentle animation
                gsap.to(backgroundRef.current.children, {
                    y: -30,
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: "top bottom",
                        end: "bottom top",
                        scrub: 3
                    }
                })
            }
            
            document.head.appendChild(scrollScript)
        }
        
        document.head.appendChild(script)
        
        return () => {
            // Cleanup
            const scripts = document.querySelectorAll('script[src*="gsap"]')
            scripts.forEach(script => {
                if (document.head.contains(script)) {
                    document.head.removeChild(script)
                }
            })
        }
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
                        className={`group relative p-8 rounded-2xl backdrop-blur-sm border cursor-pointer transition-all duration-300 ${
                            theme === 'dark'
                                ? 'bg-zinc-900/80 border-zinc-800/50 hover:border-zinc-700/50'
                                : 'bg-white/90 border-zinc-200/80 hover:border-zinc-300/80'
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