import React, { useState } from 'react';
import Markdown from 'react-markdown';
import { useTheme } from '../context/ThemeContext';

const CreationItem = ({ item }) => {
  const [expanded, setExpanded] = useState(false);
  const { theme } = useTheme();

  // Helper to parse ATS score if JSON
  let atsData = null;
  if (item.type === 'ats-score') {
    try {
      atsData = typeof item.content === 'string' ? JSON.parse(item.content) : item.content;
    } catch {
      atsData = null;
    }
  }

  return (
    <div 
      onClick={() => setExpanded(!expanded)} 
      className={`p-4 max-w-5xl text-sm rounded-xl cursor-pointer transition-colors border ${
        theme === 'dark' 
          ? 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800/80 hover:border-zinc-700' 
          : 'bg-white border-gray-200 hover:bg-gray-50'
      }`}
    >
      <div className='flex justify-between items-center gap-4'>
        <div>
          <h2 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {item.prompt}
          </h2>
          <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`}>
            {item.type} • {new Date(item.created_at).toLocaleDateString()}
          </p>
        </div>
        <button 
          type="button"
          className={`px-3 py-1 text-xs rounded-full capitalize font-medium ${
            theme === 'dark'
              ? 'bg-zinc-800 border border-zinc-700 text-blue-400'
              : 'bg-blue-50 border border-blue-100 text-blue-600'
          }`}
        >
          {item.type.replace('-', ' ')}
        </button>
      </div>

      {expanded && (
        <div className="mt-4 pt-3 border-t border-zinc-800">
          {item.type === 'image' ? (
            <div>
              <img 
                src={item.content} 
                alt="Generated content" 
                className={`max-w-md w-full rounded-lg border ${
                  theme === 'dark' ? 'border-zinc-700' : 'border-gray-200'
                }`}
              />
            </div>
          ) : atsData ? (
            <div className={`p-4 rounded-lg space-y-3 ${
              theme === 'dark' ? 'bg-zinc-950/80 border border-zinc-800' : 'bg-gray-50 border border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm">ATS Match Score:</span>
                <span className={`text-lg font-bold ${
                  Number(atsData.score) >= 70 ? 'text-green-500' : 'text-yellow-500'
                }`}>
                  {atsData.score}/100
                </span>
              </div>
              {atsData.feedback && (
                <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-600'}`}>
                  {atsData.feedback}
                </p>
              )}
              {Array.isArray(atsData.suggestions) && atsData.suggestions.length > 0 && (
                <div className="text-xs space-y-1">
                  <span className="font-semibold text-zinc-400">Suggestions:</span>
                  <ul className="list-disc list-inside space-y-1 text-zinc-400">
                    {atsData.suggestions.slice(0, 3).map((sug, i) => (
                      <li key={i}>{sug}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className={`max-h-96 overflow-y-auto text-sm ${
              theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
            }`}>
              <div className='reset-tw prose dark:prose-invert max-w-none text-xs sm:text-sm'>
                <Markdown>{item.content}</Markdown>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CreationItem;