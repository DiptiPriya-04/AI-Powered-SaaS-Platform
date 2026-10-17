import React, { useEffect, useState } from 'react';
import { Gem, Sparkles, FileText, ChevronRight } from 'lucide-react';
import { Protect, useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import CreationItem from '../components/CreationItem';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL || '';

const Dashboard = () => {
  const [creations, setCreations] = useState([]);
  const [pdfChats, setPdfChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllCreations, setShowAllCreations] = useState(false);
  const [showAllPdfChats, setShowAllPdfChats] = useState(false);
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const getDashboardData = React.useCallback(async () => {
    try {
      setLoading(true);
      const token = await getToken().catch(() => null);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const [creationsRes, pdfChatsRes] = await Promise.all([
        axios.get('/api/user/get-user-creations', { headers }).catch(e => ({ data: { success: false, message: e.message } })),
        axios.get('/api/ai/pdf-chat-history', { headers }).catch(e => ({ data: { success: false, message: e.message } }))
      ]);

      if (creationsRes.data?.success) {
        setCreations(creationsRes.data.creations || []);
      }

      if (pdfChatsRes.data?.success) {
        const files = pdfChatsRes.data.files || [];
        const topFiles = files.slice(0, 6);
        const groupedChats = await Promise.all(topFiles.map(async fileName => {
          const { data } = await axios.get(
            `/api/ai/pdf-chat-history?file_name=${encodeURIComponent(fileName)}`,
            { headers }
          ).catch(() => ({ data: {} }));
          return {
            type: 'pdf-chat',
            fileName,
            lastMessage: data.chatHistory?.[data.chatHistory.length - 1]?.content || 'Chat session active',
            createdAt: new Date().toISOString()
          };
        }));
        
        setPdfChats(groupedChats);
      }
    } catch (error) {
      console.error('Dashboard error:', error);
      toast.error(error.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    getDashboardData();
  }, [getDashboardData]);

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
        
        {/* Stats Cards */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8'>
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
              <p className={`text-sm mb-1 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Active Plan
              </p>
              <h2 className='text-2xl font-semibold'>
                <Protect plan='premium' fallback="Free">Premium</Protect>
              </h2>
            </div>
            <div className='w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF61C5] to-[#9E53EE] text-white flex justify-center items-center shadow-lg'>
              <Gem className='w-5 text-white' />
            </div>
          </div>
        </div>

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
            <div className={`p-6 rounded-xl border text-center ${
              theme === 'dark' 
                ? 'bg-zinc-900 border-zinc-800 text-gray-400' 
                : 'bg-white border-gray-200 text-gray-600'
            }`}>
              <p>No creations found</p>
              <button
                onClick={navigateToCreate}
                className="mt-2 px-4 py-2 bg-[#00DA83] hover:bg-[#00c978] text-white rounded-lg transition-colors"
              >
                Create Your First Content
              </button>
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
            <div className={`p-6 rounded-xl border text-center ${
              theme === 'dark' 
                ? 'bg-zinc-900 border-zinc-800 text-gray-400' 
                : 'bg-white border-gray-200 text-gray-600'
            }`}>
              <p>No PDF chats found</p>
              <button
                onClick={navigateToPdfChat}
                className="mt-2 px-4 py-2 bg-[#00DA83] hover:bg-[#00c978] text-white rounded-lg transition-colors"
              >
                Start New PDF Chat
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;