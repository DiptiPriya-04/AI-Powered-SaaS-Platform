import { useAuth } from '@clerk/clerk-react';
import { Hash, Sparkles, Copy, RotateCw, Check, Edit, Layers, FileText } from 'lucide-react';
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import { usePlan } from '../context/PlanContext';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const BlogTitles = () => {
  const navigate = useNavigate();
  const blogCategories = ['General', 'Technology', 'Business', 'Health', 'Lifestyle', 'Education', 'Travel', 'Food'];

  const categorySuggestions = {
    General: ['Artificial Intelligence', 'Content Creation', 'Remote Work Productivity', 'Modern Leadership', 'Personal Branding'],
    Technology: ['React 19', 'Next.js App Router', 'AI Agents Architecture', 'Python for Data Science', 'Cloud Security'],
    Business: ['SaaS Growth Strategies', 'Customer Churn Prevention', 'B2B Sales Funnels', 'Product-Led Growth', 'Angel Investing'],
    Health: ['Intermittent Fasting', 'Sleep Architecture', 'Zone 2 Cardio', 'Mindful Stress Management', 'High-Protein Meal Prep'],
    Lifestyle: ['Digital Minimalism', 'Morning Routine Design', 'Habit Stacking', 'Intentional Living', 'Work-Life Harmony'],
    Education: ['Active Recall Learning', 'Language Fluency in 6 Months', 'Deep Work for Students', 'Exam Anxiety Mastery', 'Speed Reading'],
    Travel: ['Solo Backpacking Japan', 'Budget Travel in Europe', 'Off-Grid Vanlife', 'Packing Minimalist Style', 'Hidden Coastal Towns'],
    Food: ['Artisan Sourdough Baking', 'Authentic Italian Pasta', 'Vegan Weeknight Dinners', 'Specialty Coffee Brewing', 'Meal Prep on a Budget']
  };

  const [selectedCategory, setSelectedCategory] = useState('General');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'markdown'
  const { theme } = useTheme();
  const { getToken } = useAuth();
  const { openUpgradeModal, refreshPlan } = usePlan();

  const currentSuggestions = categorySuggestions[selectedCategory] || categorySuggestions.General;

  const onSubmitHandler = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim()) {
      toast.error('Please enter a keyword or topic');
      return;
    }

    try {
      setLoading(true);
      const prompt = `Generate 10 catchy, viral blog titles for the keyword ${input.trim()} in the category ${selectedCategory}.`;

      const { data } = await axios.post(
        '/api/ai/generate-blog-title',
        { prompt, keyword: input.trim(), category: selectedCategory, seed: Date.now() },
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      );

      if (data.success) {
        setContent(data.content);
        toast.success('10 Fresh Titles Generated!');
        refreshPlan?.().catch(() => {});
      } else {
        toast.error(data.message || 'Failed to generate titles');
        if (data.message?.toLowerCase().includes('limit') || data.message?.toLowerCase().includes('premium')) {
          openUpgradeModal();
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!content) return;
    navigator.clipboard.writeText(content)
      .then(() => {
        toast.success('All titles copied to clipboard!');
      })
      .catch(() => {
        toast.error('Failed to copy titles');
      });
  };

  const copySingleTitle = (title, id) => {
    if (!title) return;
    navigator.clipboard.writeText(title)
      .then(() => {
        setCopiedId(id);
        toast.success(`Title #${id} copied!`);
        setTimeout(() => setCopiedId(null), 2000);
      })
      .catch(() => {
        toast.error('Failed to copy title');
      });
  };

  const handleWriteArticle = (title) => {
    toast.success('Opening in Article Writer...');
    navigate('/ai/write-article', { state: { topic: title } });
  };

  // Parse markdown content into structured title cards
  const parsedTitles = useMemo(() => {
    if (!content) return [];
    const lines = content.split('\n');
    const items = [];
    let current = null;

    const angleTags = [
      'Masterclass Blueprint',
      'High-Impact Listicle',
      'Costly Mistakes to Avoid',
      'Contrarian Reality Check',
      'Step-by-Step Roadmap',
      '2026 Future Trends',
      'Insider Secrets',
      'Proven Case Study',
      'Mindset & Psychology',
      'Fast Actionable Wins'
    ];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Matches: 1. Title, 1) Title, ## 1. Title, - Title, * Title, etc.
      const numMatch = line.match(/^(?:#{1,4}\s*)?(?:(\d+)[\.\)]|[-*•])\s+(.*)$/);
      if (numMatch && !line.startsWith('### 10')) {
        if (current) items.push(current);
        let rawTitle = numMatch[2].trim();
        // Remove markdown bold / italics from title
        rawTitle = rawTitle.replace(/^\*\*|\*\*$/g, '').replace(/^[*_]+|[*_]+$/g, '').trim();
        const index = items.length;
        current = {
          number: numMatch[1] ? parseInt(numMatch[1]) : (items.length + 1),
          title: rawTitle,
          hook: '',
          angle: angleTags[index % angleTags.length]
        };
      } else if (current && (line.startsWith('*') || line.startsWith('_')) && !line.startsWith('**')) {
        current.hook = line.replace(/^[*_]+|[*_]+$/g, '').trim();
      } else if (current && line.length > 0 && !current.hook && !line.startsWith('#')) {
        current.hook = line.replace(/^[*_]+|[*_]+$/g, '').trim();
      }
    }
    if (current) items.push(current);
    return items;
  }, [content]);

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
            theme === 'dark' ? 'text-[#8E37EB]' : 'text-purple-600'
          }`}/>
          <div>
            <h1 className='text-xl font-semibold'>AI Title Generator</h1>
            <p className={`text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Craft high-converting, viral blog post titles tuned to your category
            </p>
          </div>
        </div>

        <div className='space-y-6'>
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>Keyword or Topic</label>
            <input
              onChange={(e) => setInput(e.target.value)}
              value={input}
              type="text"
              className={`w-full p-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                theme === 'dark'
                  ? 'bg-zinc-800 border-zinc-600 text-white placeholder-zinc-500'
                  : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-zinc-400'
              }`}
              placeholder='e.g. Cricket, Vegan Pasta, React 19, Solo Travel...'
              required
            />
            {/* Quick Inspiration Pills */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
              <span className={`text-[11px] font-medium ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}`}>
                {selectedCategory} Ideas:
              </span>
              {currentSuggestions.map((topic) => (
                <button
                  key={topic}
                  type="button"
                  onClick={() => setInput(topic)}
                  className={`text-[11px] px-2 py-0.5 rounded-md transition-colors cursor-pointer border ${
                    input === topic
                      ? 'bg-purple-500/20 text-purple-400 border-purple-500/40'
                      : theme === 'dark'
                        ? 'bg-zinc-800/80 text-zinc-400 border-zinc-700 hover:text-white hover:border-zinc-500'
                        : 'bg-zinc-100 text-zinc-600 border-zinc-200 hover:text-zinc-900 hover:border-zinc-300'
                  }`}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>Category</label>
            <div className='flex flex-wrap gap-2'>
              {blogCategories.map((item) => (
                <button
                  type="button"
                  onClick={() => setSelectedCategory(item)}
                  className={`px-4 py-2 text-sm rounded-full transition-all border font-medium ${
                    selectedCategory === item
                      ? theme === 'dark'
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/60 shadow-sm shadow-purple-500/10'
                        : 'bg-purple-100 text-purple-700 border-purple-300 shadow-sm shadow-purple-500/10'
                      : theme === 'dark'
                        ? 'bg-zinc-800 text-gray-300 border-zinc-700 hover:border-zinc-500'
                        : 'bg-gray-100 text-gray-700 border-gray-300 hover:border-gray-400'
                  }`}
                  key={item}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <button
            disabled={loading}
            className={`w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#C341F6] to-[#8E37EB] text-white px-4 py-3 text-sm font-semibold rounded-lg transition-all hover:shadow-lg cursor-pointer ${
              theme === 'dark'
                ? 'hover:shadow-purple-500/20'
                : 'hover:shadow-purple-400/30'
            } ${
              loading ? 'opacity-80 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                Crafting fresh titles...
              </>
            ) : (
              <>
                <Hash className='w-5 h-5'/>
                Generate 10 Viral Titles
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
        <div className='flex items-center justify-between mb-4 pb-3 border-b border-zinc-200 dark:border-zinc-800'>
          <div className='flex items-center gap-3'>
            <Hash className={`w-6 h-6 ${
              theme === 'dark' ? 'text-[#8E37EB]' : 'text-purple-600'
            }`} />
            <div>
              <h1 className='text-xl font-semibold'>Generated Titles</h1>
              {content && (
                <span className="text-xs text-purple-500 font-medium">
                  {selectedCategory} • 10 Diverse Angles
                </span>
              )}
            </div>
          </div>

          {content && (
            <div className="flex items-center gap-2">
              {/* View Toggle */}
              <div className={`flex items-center p-0.5 rounded-lg border ${
                theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : 'bg-gray-100 border-gray-300'
              }`}>
                <button
                  type="button"
                  onClick={() => setViewMode('cards')}
                  className={`p-1.5 rounded-md text-xs transition-colors ${
                    viewMode === 'cards'
                      ? theme === 'dark' ? 'bg-purple-600 text-white' : 'bg-purple-600 text-white'
                      : theme === 'dark' ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                  title="Card View"
                >
                  <Layers className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('markdown')}
                  className={`p-1.5 rounded-md text-xs transition-colors ${
                    viewMode === 'markdown'
                      ? theme === 'dark' ? 'bg-purple-600 text-white' : 'bg-purple-600 text-white'
                      : theme === 'dark' ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                  title="Markdown View"
                >
                  <FileText className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={onSubmitHandler}
                disabled={loading}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-purple-900/40 text-purple-300 hover:bg-purple-900/60 border border-purple-500/30'
                    : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
                }`}
                title="Generate another fresh batch"
              >
                <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                Regenerate
              </button>

              <button
                onClick={copyToClipboard}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-zinc-800 hover:bg-zinc-700 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
                title="Copy all titles"
              >
                <Copy className='w-3.5 h-3.5' />
                Copy All
              </button>
            </div>
          )}
        </div>

        {!content ? (
          <div className='flex-1 flex flex-col justify-center items-center text-center p-6'>
            <div className={`text-sm flex flex-col items-center gap-4 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center">
                <Hash className='w-8 h-8 text-purple-500 opacity-80' />
              </div>
              <div>
                <p className="font-medium text-base mb-1">No titles generated yet</p>
                <p className="text-xs max-w-sm">
                  Select a category, enter your topic above, and click &ldquo;Generate 10 Viral Titles&rdquo; to craft high-impact headlines.
                </p>
              </div>
            </div>
          </div>
        ) : viewMode === 'cards' && parsedTitles.length > 0 ? (
          /* Cards View */
          <div className='flex-1 overflow-y-auto pr-2 space-y-3.5'>
            {parsedTitles.map((item) => {
              const isCopied = copiedId === item.number;
              const charCount = item.title.length;

              return (
                <div
                  key={item.number}
                  className={`p-4 rounded-xl border transition-all duration-200 group ${
                    theme === 'dark'
                      ? 'bg-zinc-800/60 border-zinc-700/80 hover:bg-zinc-800 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/5'
                      : 'bg-zinc-50/80 border-zinc-200 hover:bg-white hover:border-purple-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-xs font-bold ${
                        theme === 'dark'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'bg-purple-100 text-purple-700 border border-purple-200'
                      }`}>
                        #{item.number}
                      </span>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        theme === 'dark'
                          ? 'bg-zinc-700/60 text-zinc-300'
                          : 'bg-zinc-200 text-zinc-700'
                      }`}>
                        {item.angle}
                      </span>
                    </div>

                    <span className={`text-[11px] ${
                      charCount >= 50 && charCount <= 70
                        ? 'text-emerald-500 font-medium'
                        : theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'
                    }`}>
                      {charCount} chars {charCount >= 50 && charCount <= 70 ? '• Optimal SEO' : ''}
                    </span>
                  </div>

                  <h3 className={`text-sm sm:text-base font-semibold leading-snug mb-1.5 ${
                    theme === 'dark' ? 'text-white' : 'text-zinc-900'
                  }`}>
                    {item.title}
                  </h3>

                  {item.hook && (
                    <p className={`text-xs italic leading-relaxed mb-3 ${
                      theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'
                    }`}>
                      {item.hook}
                    </p>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-700/40 dark:border-zinc-700/40">
                    <button
                      type="button"
                      onClick={() => handleWriteArticle(item.title)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        theme === 'dark'
                          ? 'bg-zinc-700/60 hover:bg-zinc-700 text-zinc-200'
                          : 'bg-zinc-200/80 hover:bg-zinc-200 text-zinc-800'
                      }`}
                      title="Write full article using this title"
                    >
                      <Edit className="w-3 h-3 text-purple-400" />
                      Write Article
                    </button>

                    <button
                      type="button"
                      onClick={() => copySingleTitle(item.title, item.number)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        isCopied
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : theme === 'dark'
                            ? 'bg-purple-900/30 hover:bg-purple-900/50 text-purple-300 border border-purple-500/20'
                            : 'bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200'
                      }`}
                      title="Copy title"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Raw Markdown View / Fallback */
          <div className='flex-1 overflow-y-auto pr-2'>
            <div className={`reset-tw max-w-none ${
              theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'
            }`}>
              <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogTitles;
