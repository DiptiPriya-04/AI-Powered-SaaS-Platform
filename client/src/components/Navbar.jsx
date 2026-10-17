import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Moon, Sun } from 'lucide-react';
import { useClerk, UserButton, useUser, useAuth } from "@clerk/clerk-react";
import { useTheme } from '../context/ThemeContext';
import { flushSync } from 'react-dom';
import axios from 'axios';

const Navbar = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { getToken } = useAuth();
  const { openSignIn } = useClerk();
  const { theme, toggleTheme } = useTheme();
  const themeButtonRef = useRef(null);
  const [freeUsage, setFreeUsage] = useState(0);
  const [userPlan, setUserPlan] = useState('free');
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const navLinks = [
    { text: 'Dashboard', href: '/ai', isAnchor: false },
    { text: 'Features', href: '#AiTools', isAnchor: true },
    { text: 'Pricing', href: '#Plan', isAnchor: true },
  ];

  const handleNavigation = (link) => {
    if (link.isAnchor) {
      if (window.location.pathname !== '/') {
        navigate('/');
        setTimeout(() => {
          const element = document.querySelector(link.href);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      } else {
        const element = document.querySelector(link.href);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    } else {
      navigate(link.href);
    }
  };

  const advancedToggleTheme = async () => {
    const audio = new Audio('/sounds/light-switch.mp3');
    audio.volume = 1.0;
    audio.play().catch(() => {});

    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    if (!themeButtonRef.current || !('startViewTransition' in document)) {
      toggleTheme();
      return;
    }

    const { top, left, width, height } = themeButtonRef.current.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;
    const maxRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    await document.startViewTransition?.(() => {
      flushSync(() => {
        toggleTheme(nextTheme);
      });
    })?.ready;

    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${maxRadius}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration: 800,
        easing: 'ease-in-out',
        pseudoElement: '::view-transition-new(root)',
      }
    );
  };

  useEffect(() => {
    setMounted(true);
    
    // Load user metadata when user changes
    if (user) {
      const metadata = user.publicMetadata || {};
      setFreeUsage(metadata.free_usage ?? 0);
      setUserPlan(metadata.plan || 'free');

      // Also sync live user data from backend
      getToken().then(token => {
        if (!token) return;
        axios.get('/api/user/get-user-data', {
          headers: { Authorization: `Bearer ${token}` }
        }).then(res => {
          if (res.data?.success) {
            setFreeUsage(res.data.free_usage ?? 0);
            setUserPlan(res.data.plan || 'free');
          }
        }).catch(() => {});
      }).catch(() => {});
    }
  }, [user, getToken]);

  return (
    <nav className="fixed w-full max-w-7xl mx-auto py-2 px-4 rounded-full top-5 z-50 backdrop-blur-4xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-700 left-1/2 transform -translate-x-1/2 transition-colors">
      <div className="flex items-center justify-between">
        
        {/* Logo */}
        <div 
          onClick={() => navigate('/')}
          className="flex items-center cursor-pointer hover:opacity-90 transition-opacity"
        >
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-500 bg-clip-text text-transparent">
            Creation<span className="text-black dark:text-white">Suite</span>
            <span className="text-xs align-top ml-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full">.ai</span>
          </h1>
        </div>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link, index) => {
            if ((link.text === 'Dashboard') && !user) return null;
            return (
              <span
                key={index}
                onClick={() => handleNavigation(link)}
                className="text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white cursor-pointer transition-colors"
              >
                {link.text}
              </span>
            );
          })}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          
          {/* Theme toggle */}
          {!mounted ? (
            <button
              className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              disabled
            >
              <Sun className="w-5 h-5" />
            </button>
          ) : theme === 'dark' ? (
            <button
              ref={themeButtonRef}
              onClick={advancedToggleTheme}
              className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Switch to light mode"
            >
              <Sun className="w-5 h-5 text-yellow-300" />
            </button>
          ) : (
            <button
              ref={themeButtonRef}
              onClick={advancedToggleTheme}
              className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Switch to dark mode"
            >
              <Moon className="w-5 h-5 text-zinc-700" />
            </button>
          )}

          {/* Clerk Auth */}
          {user ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-block text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-500 font-medium border border-blue-500/20">
                {userPlan === 'premium' ? '👑 Premium' : `${Math.max(0, 30 - freeUsage)} credits`}
              </span>
              <div className="bg-zinc-100 dark:bg-zinc-800 p-1 rounded-full border border-zinc-200 dark:border-zinc-700">
                <UserButton 
                  afterSignOutUrl="/" 
                  appearance={{
                    baseTheme: theme === 'dark' ? 'dark' : 'light',
                    elements: {
                      avatarBox: "h-8 w-8",
                    }
                  }} 
                />
              </div>
            </div>
          ) : (
            <button
              onClick={openSignIn}
              className="flex items-center gap-2 rounded-full text-sm bg-gradient-to-r from-blue-600 to-indigo-600 
              text-white px-5 py-2 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-blue-500/20"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;