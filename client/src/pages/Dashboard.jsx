import React, { useEffect, useState } from 'react';
import { Gem, Sparkles, FileText, ChevronRight, Crown, ArrowUpRight, Zap } from 'lucide-react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import CreationItem from '../components/CreationItem';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import { usePlan } from '../context/PlanContext';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL || '';

const Dashboard = () => {
  const [creations, setCreations] = useState([]);
  const [pdfChats, setPdfChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllCreations, setShowAllCreations] = useState(false);
  const [showAllPdfChats, setShowAllPdfChats] = useState(false);
  const { getToken } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const { isPremium, plan, freeUsage, openUpgradeModal, refreshPlan } = usePlan();

  const getDashboardData = async () => {
    try {
      setLoading(true);
      refreshPlan().catch(() => {});
      
      const [creationsRes, pdfChatsRes] = await Promise.all([
        axios.get('/api/user/get-user-creations', {
          headers: { Authorization: `Bearer ${await getToken()}` }
        }),
        axios.get('/api/ai/pdf-chat-history', {
          headers: { Authorization: `Bearer ${await getToken()}` }
        })
      ]);

      if (creationsRes.data.success) {
        setCreations(creationsRes.data.creations);
      } else {
        toast.error(creationsRes.data.message);
      }

      if (pdfChatsRes.data.success) {
        const groupedChats = pdfChatsRes.data.files ? 
          await Promise.all(pdfChatsRes.data.files.map(async fileName => {
            const { data } = await axios.get(
              `/api/ai/pdf-chat-history?file_name=${encodeURIComponent(fileName)}`,
              { headers: { Authorization: `Bearer ${await getToken()}` } }
            );
            return {
              type: 'pdf-chat',
              fileName,
              lastMessage: data.chatHistory?.[data.chatHistory.length - 1]?.content || '',
              createdAt: new Date().toISOString()
            };
          })) : [];
        
        setPdfChats(groupedChats);
      }
    } catch (error) {
      console.error('Dashboard error:', error);
      toast.error(error.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getDashboardData();
  }, []);

  const toggleAllCreations = () => {
    setShowAllCreations(!showAllCreations);
  };

  const toggleAllPdfChats = () => {
    setShowAllPdfChats(!showAllPdfChats);
  };

  const navigateToCreate = () => {
    navigate('/ai/write-article');
  };

  const navigateToPdfChat = () => {
    navigate('/ai/chat-with-pdf');
  };

  return (
    <div className={`h-full overflow-y-auto p-4 md:p-6 ${
      theme === 'dark' ? 'bg-zinc-950' : 'bg-gray-50'
    }`}>
      <div className='max-w-6xl mx-auto'>
        {/* Header */}
        <div className='flex items-center justify-between mb-6'>
          <h1 className={`text-2xl md:text-3xl font-bold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Dashboard
          </h1>
          <div className="flex items-center gap-2">
            {!isPremium && (
              <button
                onClick={openUpgradeModal}
                className="text-xs px-3 py-1.5 rounded-md font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 flex items-center gap-1 shadow-sm transition-all"
              >
                <Crown className="w-3.5 h-3.5 text-amber-300" />
                Upgrade
              </button>
            )}
            <button 
              onClick={getDashboardData}
              className={`text-xs px-3 py-1.5 rounded-md transition-colors flex items-center gap-1 ${
                theme === 'dark' 
                  ? 'bg-zinc-800 hover:bg-zinc-700 text-gray-300' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              Refresh
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-rotate-cw">
                <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/>
                <path d="M21 3v5h-5"/>
              </svg>
            </button>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6'>
          {/* Total Creation Card */}
          <div className={`flex justify-between items-center p-5 rounded-xl border transition-all ${
            theme === 'dark' 
              ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700' 
              : 'bg-white border-gray-200 hover:border-gray-300'
          }`}>
            <div className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
              <p className={`text-sm mb-1 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Total Creations
              </p>
              <h2 className='text-2xl font-semibold'>
                {creations.length + pdfChats.length}
              </h2>
            </div>
            <div className='w-12 h-12 rounded-xl bg-gradient-to-br from-[#3588F2] to-[#0BB0D7] text-white flex justify-center items-center shadow-lg'>
              <Sparkles className='w-5 text-white'/>
            </div>
          </div>

          {/* AI Chats Card */}
          <div className={`flex justify-between items-center p-5 rounded-xl border transition-all ${
            theme === 'dark' 
              ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700' 
              : 'bg-white border-gray-200 hover:border-gray-300'
          }`}>
            <div className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
              <p className={`text-sm mb-1 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                PDF Chats
              </p>
              <h2 className='text-2xl font-semibold'>
                {pdfChats.length}
              </h2>
            </div>
            <div className='w-12 h-12 rounded-xl bg-gradient-to-br from-[#00DA83] to-[#009BB3] text-white flex justify-center items-center shadow-lg'>
              <FileText className='w-5 text-white' />
            </div>
          </div>

          {/* Active Plan Card */}
          <div className={`flex justify-between items-center p-5 rounded-xl border transition-all ${
            theme === 'dark' 
              ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700' 
              : 'bg-white border-gray-200 hover:border-gray-300'
          }`}>
            <div className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
              <div className="flex items-center gap-1.5 mb-1">
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Active Plan
                </p>
                {isPremium ? (
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-purple-600 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Crown className="w-2.5 h-2.5" /> PRO
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded-full">
                    {freeUsage}/30 Used
                  </span>
                )}
              </div>
              <h2 className='text-2xl font-semibold flex items-center gap-2'>
                {isPremium ? 'Premium' : 'Free Starter'}
              </h2>
            </div>
            <div 
              onClick={!isPremium ? openUpgradeModal : undefined}
              title={!isPremium ? "Click to upgrade to Pro" : "Pro Plan Active"}
              className={`w-12 h-12 rounded-xl flex justify-center items-center shadow-lg text-white ${
                !isPremium ? 'cursor-pointer hover:scale-105 transition-transform' : ''
              } ${
                isPremium
                  ? 'bg-gradient-to-br from-amber-500 via-pink-500 to-purple-600'
                  : 'bg-gradient-to-br from-[#FF61C5] to-[#9E53EE]'
              }`}
            >
              {isPremium ? <Crown className='w-6 text-white' /> : <Gem className='w-5 text-white' />}
            </div>
          </div>
        </div>

        {/* Upgrade Banner for Free Users */}
        {!isPremium && (
          <div className={`mb-8 p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 transition-all shadow-md ${
            theme === 'dark' 
              ? 'bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-zinc-900 border-indigo-500/30' 
              : 'bg-gradient-to-r from-indigo-50 via-purple-50 to-white border-indigo-200'
          }`}>
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className={`font-bold text-sm sm:text-base ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
                    Upgrade to CreationSuite Pro
                  </h3>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    Unlimited
                  </span>
                </div>
                <p className={`text-xs mt-0.5 ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  Unlock unlimited creations, high-res visual generators, PDF conversation memory, and zero rate limits.
                </p>
              </div>
            </div>
            <button
              onClick={openUpgradeModal}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-1.5 flex-shrink-0 cursor-pointer"
            >
              <Crown className="w-4 h-4 text-amber-300" />
              Upgrade to Pro
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Recent Creations Section */}
        <div className='mb-8'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className={`text-xl font-semibold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Recent Creations
            </h2>
            {creations.length > 4 && (
              <button 
                onClick={toggleAllCreations}
                className={`text-xs px-3 py-1.5 rounded-md transition-colors flex items-center gap-1 ${
                  theme === 'dark' 
                    ? 'bg-zinc-800 hover:bg-zinc-700 text-gray-300' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                {showAllCreations ? 'Show less' : 'View all'} 
                <ChevronRight className={`w-3 h-3 transition-transform ${
                  showAllCreations ? 'rotate-90' : ''
                }`} />
              </button>
            )}
          </div>
          
          {loading ? (
            <div className="grid place-items-center py-10">
              <div className={`w-8 h-8 rounded-full border-4 ${
                theme === 'dark' ? 'border-[#00DA83]' : 'border-green-500'
              } border-t-transparent animate-spin`}></div>
            </div>
          ) : creations.length > 0 ? (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {creations.slice(0, showAllCreations ? creations.length : 4).map((item) => (
                <CreationItem key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className={`p-6 sm:p-8 rounded-2xl border text-center transition-all ${
              theme === 'dark' 
                ? 'bg-zinc-900/60 border-zinc-800' 
                : 'bg-white border-gray-200 shadow-sm'
            }`}>
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className={`text-lg sm:text-xl font-bold mb-1 ${
                theme === 'dark' ? 'text-white' : 'text-zinc-900'
              }`}>
                Welcome to your AI workspace, {user?.firstName || 'Creator'}! ✨
              </h3>
              <p className={`text-xs sm:text-sm max-w-md mx-auto mb-6 ${
                theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'
              }`}>
                You have not created any content yet. Select an AI tool below to make your first creation:
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-left">
                <button
                  type="button"
                  onClick={() => navigate('/ai/write-article')}
                  className={`p-4 rounded-xl border transition-all hover:scale-[1.02] cursor-pointer ${
                    theme === 'dark' 
                      ? 'bg-zinc-800/80 border-zinc-700 hover:border-blue-500/50' 
                      : 'bg-zinc-50 border-zinc-200 hover:border-blue-500/50 hover:bg-white'
                  }`}
                >
                  <p className="font-semibold text-xs text-blue-500 flex items-center gap-1.5 mb-1">
                    ✍️ Write Article
                  </p>
                  <p className={`text-[11px] leading-snug ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}>
                    Generate full-length authoritative articles on any topic.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/ai/blog-titles')}
                  className={`p-4 rounded-xl border transition-all hover:scale-[1.02] cursor-pointer ${
                    theme === 'dark' 
                      ? 'bg-zinc-800/80 border-zinc-700 hover:border-purple-500/50' 
                      : 'bg-zinc-50 border-zinc-200 hover:border-purple-500/50 hover:bg-white'
                  }`}
                >
                  <p className="font-semibold text-xs text-purple-500 flex items-center gap-1.5 mb-1">
                    💡 Title Suggester
                  </p>
                  <p className={`text-[11px] leading-snug ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}>
                    Catchy, viral headlines for your articles and blogs.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/ai/humanize-text')}
                  className={`p-4 rounded-xl border transition-all hover:scale-[1.02] cursor-pointer ${
                    theme === 'dark' 
                      ? 'bg-zinc-800/80 border-zinc-700 hover:border-amber-500/50' 
                      : 'bg-zinc-50 border-zinc-200 hover:border-amber-500/50 hover:bg-white'
                  }`}
                >
                  <p className="font-semibold text-xs text-amber-500 flex items-center gap-1.5 mb-1">
                    ⚡ Humanize Text
                  </p>
                  <p className={`text-[11px] leading-snug ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}>
                    Convert AI prose into organic, natural writing.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/ai/calculate-ats-score')}
                  className={`p-4 rounded-xl border transition-all hover:scale-[1.02] cursor-pointer ${
                    theme === 'dark' 
                      ? 'bg-zinc-800/80 border-zinc-700 hover:border-emerald-500/50' 
                      : 'bg-zinc-50 border-zinc-200 hover:border-emerald-500/50 hover:bg-white'
                  }`}
                >
                  <p className="font-semibold text-xs text-emerald-500 flex items-center gap-1.5 mb-1">
                    📊 ATS Resume Check
                  </p>
                  <p className={`text-[11px] leading-snug ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}>
                    Score and optimize your resume for recruiters.
                  </p>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* PDF Chats Section */}
        <div>
          <div className='flex items-center justify-between mb-4'>
            <h2 className={`text-xl font-semibold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Recent PDF Chats
            </h2>
            {pdfChats.length > 3 && (
              <button 
                onClick={toggleAllPdfChats}
                className={`text-xs px-3 py-1.5 rounded-md transition-colors flex items-center gap-1 ${
                  theme === 'dark' 
                    ? 'bg-zinc-800 hover:bg-zinc-700 text-gray-300' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                {showAllPdfChats ? 'Show less' : 'View all'} 
                <ChevronRight className={`w-3 h-3 transition-transform ${
                  showAllPdfChats ? 'rotate-90' : ''
                }`} />
              </button>
            )}
          </div>
          
          {loading ? (
            <div className="grid place-items-center py-10">
              <div className={`w-8 h-8 rounded-full border-4 ${
                theme === 'dark' ? 'border-[#00DA83]' : 'border-green-500'
              } border-t-transparent animate-spin`}></div>
            </div>
          ) : pdfChats.length > 0 ? (
            <div className='space-y-3'>
              {pdfChats.slice(0, showAllPdfChats ? pdfChats.length : 3).map((chat, index) => (
                <div 
                  key={index} 
                  className={`group p-4 rounded-xl border transition-all cursor-pointer ${
                    theme === 'dark' 
                      ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-white' 
                      : 'bg-white border-gray-200 hover:border-gray-300 text-gray-900'
                  }`}
                  onClick={() => navigate('/ai/chat-with-pdf')}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-100'
                    }`}>
                      <FileText className="w-5 text-[#00DA83]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm md:text-base truncate">{chat.fileName}</h3>
                      <p className={`text-xs md:text-sm truncate ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {chat.lastMessage || 'No messages yet'}
                      </p>
                    </div>
                    <ChevronRight className={`w-4 h-4 transition-colors ${
                      theme === 'dark' 
                        ? 'text-gray-400 group-hover:text-white' 
                        : 'text-gray-500 group-hover:text-gray-700'
                    }`} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={`p-6 sm:p-8 rounded-2xl border text-center transition-all ${
              theme === 'dark' 
                ? 'bg-zinc-900/60 border-zinc-800' 
                : 'bg-white border-gray-200 shadow-sm'
            }`}>
              <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-[#00DA83]/15 border border-[#00DA83]/30 flex items-center justify-center text-[#00DA83]">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className={`text-base sm:text-lg font-bold mb-1 ${
                theme === 'dark' ? 'text-white' : 'text-zinc-900'
              }`}>
                No PDF Documents Analyzed Yet
              </h3>
              <p className={`text-xs sm:text-sm max-w-sm mx-auto mb-4 ${
                theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'
              }`}>
                Upload any PDF to ask questions, extract key summaries, and interact directly with your documents.
              </p>
              <button
                type="button"
                onClick={navigateToPdfChat}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold rounded-xl shadow-md transition-all cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                Upload PDF & Start Chat
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;