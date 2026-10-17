import { Protect, useClerk, useUser } from '@clerk/clerk-react'
import { 
    Eraser, 
    FileText, 
    Hash, 
    House, 
    Image, 
    LogOut, 
    Scissors, 
    SquarePen, 
    Users,
    Sparkles, 
    BarChart2, 
    MessageSquare,
    Crown
} from 'lucide-react';
import React from 'react'
import { NavLink } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

const navItems = [
    {to: '/ai', label: 'Dashboard', Icon: House},
    {to: '/ai/write-article', label: 'Write Article', Icon: SquarePen},
    {to: '/ai/blog-titles', label: 'Title Generator', Icon: Hash},
    {to: '/ai/humanize-text', label: 'Humanize Text', Icon: Sparkles}, 
    {to: '/ai/review-resume', label: 'Review Resume', Icon: FileText},
    {to: '/ai/calculate-ats-score', label: 'Calculate ATS Score', Icon: BarChart2},
    {to: '/ai/generate-images', label: 'Generate Images', Icon: Image, premium: true},
    {to: '/ai/remove-background', label: 'Remove Background', Icon: Eraser, premium: true},
    {to: '/ai/remove-object', label: 'Remove Object', Icon: Scissors, premium: true},
    {to: '/ai/chat-with-pdf', label: 'Chat With PDF', Icon: MessageSquare, premium: true},
    {to: '/ai/community', label: 'Community', Icon: Users},
]

const Sidebar = ({ sidebar, setSidebar }) => {
    const { user } = useUser()
    const { signOut, openUserProfile } = useClerk()
    const { theme } = useTheme()

    return (
        <div className={`w-60 flex flex-col justify-between items-center max-sm:absolute top-14 bottom-0 z-50 ${
            sidebar ? 'translate-x-0' : 'max-sm:-translate-x-full'
        } transition-all duration-300 ease-in-out ${
            theme === 'dark' 
                ? 'bg-zinc-950 border-r border-zinc-800' 
                : 'bg-white border-r border-gray-200'
        }`}>
            <div className='my-7 w-full'>
                <img 
                    src={user.imageUrl} 
                    alt="User avatar" 
                    className={`w-13 rounded-full mx-auto cursor-pointer border-2 ${
                        theme === 'dark' 
                            ? 'border-zinc-700 hover:border-zinc-600' 
                            : 'border-gray-300 hover:border-gray-400'
                    } transition-colors`} 
                    onClick={openUserProfile}
                />
                <h1 
                    className={`mt-1 text-center cursor-pointer font-semibold ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`} 
                    onClick={openUserProfile}
                >
                    {user.fullName}
                </h1>
                <div className='px-6 mt-5 text-sm font-medium'>
                    {navItems.map((item) => {
                        const NavIcon = item.Icon;
                        return (
                        <NavLink 
                            key={item.to} 
                            to={item.to} 
                            end={item.to === '/ai'} 
                            onClick={() => setSidebar(false)} 
                            className={({isActive}) => `px-3.5 py-2.5 flex items-center gap-3 rounded transition-colors ${
                                isActive 
                                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                                    : theme === 'dark' 
                                        ? 'hover:bg-zinc-800' 
                                        : 'hover:bg-gray-100'
                            }`}
                        >
                            {({ isActive }) => (
                                <>
                                    <NavIcon className={`w-4 h-4 ${
                                        isActive 
                                            ? 'text-white' 
                                            : theme === 'dark' 
                                                ? 'text-gray-400' 
                                                : 'text-gray-500'
                                    }`} />
                                    <span className={`flex-1 ${
                                        isActive 
                                            ? 'text-white' 
                                            : theme === 'dark' 
                                                ? 'text-gray-300' 
                                                : 'text-gray-700'
                                    }`}>
                                        {item.label}
                                    </span>
                                    {item.premium && (
                                        <span className="flex items-center gap-1 text-xs bg-gradient-to-r from-amber-500 to-amber-600 text-white px-2 py-0.5 rounded-full">
                                            <Crown className="w-2 h-3" />
                                        </span>
                                    )}
                                </>
                            )}
                        </NavLink>
                        );
                    })}
                </div>
            </div>

            <div className={`w-full border-t p-4 px-7 flex items-center justify-between ${
                theme === 'dark' ? 'border-zinc-800' : 'border-gray-200'
            }`}>
                <div onClick={openUserProfile} className='flex gap-2 items-center cursor-pointer'>
                    <img 
                        src={user.imageUrl} 
                        className={`w-8 rounded-full border ${
                            theme === 'dark' ? 'border-zinc-700' : 'border-gray-300'
                        }`} 
                        alt="" 
                    />
                    <div>
                        <h1 className={`text-sm font-medium ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                            {user.fullName}
                        </h1>
                        <p className={`text-xs ${
                            theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'
                        }`}>
                            <Protect plan='premium' fallback="Free">Premium</Protect> Plan
                        </p>
                    </div>
                </div>
                <LogOut 
                    onClick={signOut} 
                    className={`w-4.5 transition-colors cursor-pointer ${
                        theme === 'dark' 
                            ? 'text-zinc-400 hover:text-white' 
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                />
            </div>
        </div>
    )
}

export default Sidebar