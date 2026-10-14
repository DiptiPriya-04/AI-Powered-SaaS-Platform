import { useClerk, useUser } from '@clerk/clerk-react'
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
import { usePlan } from '../context/PlanContext'

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
    const { isPremium, freeUsage, openUpgradeModal } = usePlan()

    return (
        <div className={`w-60 flex flex-col justify-between items-center max-sm:absolute top-14 bottom-0 z-50 ${
            sidebar ? 'translate-x-0' : 'max-sm:-translate-x-full'
        } transition-all duration-300 ease-in-out ${
            theme === 'dark' 
                ? 'bg-zinc-950 border-r border-zinc-800' 
                : 'bg-white border-r border-gray-200'
        }`}>
            <div className='my-7 w-full overflow-y-auto flex-1'>
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
                    {navItems.map(({to, label, Icon, premium}) => (
                        <NavLink 
                            key={to} 
                            to={to} 
                            end={to === '/ai'} 
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
                                    <Icon className={`w-4 h-4 ${
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
                                        {label}
                                    </span>
                                    {premium && (
                                        <span className="flex items-center gap-1 text-xs bg-gradient-to-r from-amber-500 to-amber-600 text-white px-2 py-0.5 rounded-full">
                                            <Crown className="w-2.5 h-2.5" />
                                        </span>
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                </div>
            </div>

            {/* Upgrade Card for Free Users */}
            {!isPremium && (
                <div className="w-full px-4 mb-2">
                    <div className={`p-3 rounded-xl border transition-all ${
                        theme === 'dark' 
                            ? 'bg-gradient-to-br from-indigo-950/60 to-purple-950/40 border-indigo-500/30' 
                            : 'bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200'
                    }`}>
                        <div className="flex items-center gap-1.5 mb-1">
                            <Crown className="w-3.5 h-3.5 text-amber-500" />
                            <span className={`text-xs font-bold ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
                                Upgrade to Pro
                            </span>
                        </div>
                        <p className={`text-[11px] leading-tight mb-2 ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}>
                            Unlimited AI creations & visual tools.
                        </p>
                        <button
                            onClick={openUpgradeModal}
                            className="w-full py-1.5 px-3 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-sm transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                            Upgrade Plan
                        </button>
                    </div>
                </div>
            )}

            <div className={`w-full border-t p-4 px-6 flex items-center justify-between ${
                theme === 'dark' ? 'border-zinc-800' : 'border-gray-200'
            }`}>
                <div onClick={openUserProfile} className='flex gap-2 items-center cursor-pointer'>
                    <img 
                        src={user.imageUrl} 
                        className={`w-8 h-8 rounded-full border ${
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
                        <p className={`text-xs flex items-center gap-1 ${
                            theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'
                        }`}>
                            {isPremium ? (
                                <span className="text-amber-500 font-semibold flex items-center gap-1">
                                    <Crown className="w-3 h-3" /> Pro Plan
                                </span>
                            ) : (
                                <span>Free Plan ({freeUsage}/30)</span>
                            )}
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