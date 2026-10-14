import { Edit3, Sparkles, Copy, Wand2 } from 'lucide-react';
import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import Markdown from 'react-markdown';
import { useTheme } from '../context/ThemeContext';
import { usePlan } from '../context/PlanContext';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const HumanizeText = () => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const { theme } = useTheme();
  const { getToken } = useAuth();
  const { openUpgradeModal, refreshPlan } = usePlan();

  const handleInputChange = (e) => {
    const text = e.target.value;
    setInput(text);
    setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      if (wordCount > 1000) {
        return toast.error('Text exceeds 1000 word limit');
      }

      setLoading(true);
      
      const { data } = await axios.post(
        '/api/ai/humanize-text', 
        { text: input }, 
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      );

      if (data.success) {
        setContent(data.content);
        toast.success('Text humanized successfully');
        refreshPlan?.().catch(() => {});
      } else {
        toast.error(data.message);
        if (data.message?.toLowerCase().includes("limit") || data.message?.toLowerCase().includes("upgrade") || data.message?.toLowerCase().includes("premium")) {
          openUpgradeModal();
        }
      }
    } catch (error) {
      toast.error(error.message || 'Failed to humanize text');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!content) return;
    navigator.clipboard.writeText(content)
      .then(() => toast.success('Copied to clipboard!'))
      .catch(() => toast.error('Failed to copy'));
  };

  return (
    <div className={`h-full overflow-y-auto p-6 flex flex-col md:flex-row gap-6 ${
      theme === 'dark' ? 'text-white' : 'text-gray-900'
    }`}>
      {/* Input Section */}
      <form onSubmit={onSubmitHandler} className={`w-full md:w-1/2 p-6 rounded-xl border shadow-lg ${
        theme === 'dark' 
          ? 'bg-zinc-900 border-zinc-700' 
          : 'bg-white border-gray-200'
      }`}>
        <div className='flex items-center gap-3 mb-6'>
          <Sparkles className={`w-6 h-6 ${
            theme === 'dark' ? 'text-[#00AD25]' : 'text-green-600'
          }`} />
          <h1 className='text-xl font-semibold'>Humanize Text</h1>
        </div>

        <div className='space-y-6'>
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>Enter your text</label>
            <textarea
              onChange={handleInputChange}
              value={input}
              rows={8}
              className={`w-full p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                theme === 'dark' 
                  ? 'bg-zinc-800 border-zinc-600 text-white' 
                  : 'bg-gray-50 border-gray-300 text-gray-900'
              }`}
              placeholder='Paste your AI-generated or formal text here to make it sound more natural...'
              required
            />
            <div className='flex justify-between items-center mt-2'>
              <p className={`text-xs ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {wordCount} / 1000 words
              </p>
              {wordCount > 1000 && (
                <p className='text-xs text-red-400'>
                  Exceeds word limit
                </p>
              )}
            </div>
          </div>

          <button
            disabled={loading || wordCount > 1000}
            className={`w-full flex justify-center items-center gap-2 text-white px-4 py-3 text-sm rounded-lg transition-all ${
              wordCount > 1000 
                ? theme === 'dark'
                  ? 'bg-zinc-700 cursor-not-allowed'
                  : 'bg-gray-300 cursor-not-allowed'
                : `bg-gradient-to-r from-[#00AD25] to-[#04FF50] hover:shadow-lg ${
                    theme === 'dark' 
                      ? 'hover:shadow-green-500/20' 
                      : 'hover:shadow-green-400/30'
                  }`
            }`}
          >
            {loading ? (
              <span className='w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin'></span>
            ) : (
              <>
                <Wand2 className='w-5 h-5' />
                Humanize Text
              </>
            )}
          </button>
        </div>
      </form>

      {/* Output Section */}
      <div className={`w-full md:w-1/2 p-6 rounded-xl border shadow-lg flex flex-col h-full min-h-[500px] max-h-[calc(100vh-100px)] ${
        theme === 'dark' 
          ? 'bg-zinc-900 border-zinc-700' 
          : 'bg-white border-gray-200'
      }`}>
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center gap-3'>
            <Edit3 className={`w-6 h-6 ${
              theme === 'dark' ? 'text-[#00AD25]' : 'text-green-600'
            }`} />
            <h1 className='text-xl font-semibold'>Humanized Text</h1>
          </div>
          {content && (
            <button
              onClick={copyToClipboard}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all ${
                theme === 'dark' 
                  ? 'bg-zinc-800 hover:bg-zinc-700 text-gray-300' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
              title="Copy text"
            >
              <Copy className='w-4 h-4' />
              Copy
            </button>
          )}
        </div>

        {!content ? (
          <div className='flex-1 flex flex-col justify-center items-center text-center p-6'>
            <div className={`text-sm flex flex-col items-center gap-4 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <Edit3 className='w-10 h-10 opacity-50' />
              <p>Enter your text and click "Humanize Text" to convert it to natural language</p>
            </div>
          </div>
        ) : (
          <div className='flex-1 overflow-y-auto pr-2'>
            <div className={`reset-tw prose max-w-none ${
              theme === 'dark' ? 'prose-invert' : ''
            }`}>
              <Markdown>{content}</Markdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HumanizeText;