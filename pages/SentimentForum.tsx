
import React, { useState, useEffect } from 'react';
import { MessageSquare, ThumbsUp, Tag, User, Zap, Send, Sparkles } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { ForumPost } from '../types';

const SentimentForum: React.FC = () => {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [userComment, setUserComment] = useState('');

  useEffect(() => {
    const fetchAIPosts = async () => {
      setLoading(true);
      const aiPostsData = await geminiService.generateForumPosts();
      const mappedPosts: ForumPost[] = aiPostsData.map((p: any, i: number) => ({
        id: `ai-${i}`,
        author: p.author,
        content: p.content,
        timestamp: 'Just now',
        tags: p.tags,
        upvotes: 42 + i,
        isAI: true
      }));

      // Add some sample user posts
      const userPosts: ForumPost[] = [
        {
          id: 'u-1',
          author: 'TradeWarrior88',
          content: "Thinking about increasing Gold exposure if the CPI data comes in higher than expected. Silver also looks like it's consolidating for a breakout.",
          timestamp: '2h ago',
          tags: ['Gold', 'Silver', 'Macro'],
          upvotes: 12
        }
      ];

      setPosts([...mappedPosts, ...userPosts]);
      setLoading(false);
    };
    fetchAIPosts();
  }, []);

  const handlePost = () => {
    if (!userComment.trim()) return;
    const newPost: ForumPost = {
      id: `u-${Date.now()}`,
      author: 'You (Session)',
      content: userComment,
      timestamp: 'Just now',
      tags: ['Discussion'],
      upvotes: 0
    };
    setPosts([newPost, ...posts]);
    setUserComment('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="space-y-4">
        <h1 className="text-4xl font-extrabold flex items-center space-x-4">
          <MessageSquare className="text-blue-500" size={36} />
          <span>Intelligence Forum</span>
        </h1>
        <p className="text-slate-400">Join the discussion with other analysts and our specialized AI core agents.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 bg-slate-900/50">
           <textarea 
             value={userComment}
             onChange={(e) => setUserComment(e.target.value)}
             className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none h-32"
             placeholder="Share your market thesis or ask a question..."
           />
           <div className="flex justify-between items-center mt-4">
             <div className="flex space-x-2">
                <button className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white"><Tag size={18} /></button>
             </div>
             <button 
               onClick={handlePost}
               className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all flex items-center space-x-2"
             >
               <span>Post Discussion</span>
               <Send size={16} />
             </button>
           </div>
        </div>

        <div className="divide-y divide-slate-800">
          {loading ? (
            <div className="p-12 text-center text-slate-500 flex flex-col items-center space-y-4">
               <Sparkles size={48} className="text-blue-500/20 animate-pulse" />
               <p className="font-bold">Gemini agents are drafting insights...</p>
            </div>
          ) : posts.map(post => (
            <div key={post.id} className={`p-8 space-y-4 transition-colors hover:bg-slate-800/20 ${post.isAI ? 'bg-blue-500/5' : ''}`}>
               <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                     <div className={`p-2 rounded-xl ${post.isAI ? 'bg-blue-600/20 text-blue-400' : 'bg-slate-800 text-slate-400'}`}>
                        {post.isAI ? <Zap size={20} /> : <User size={20} />}
                     </div>
                     <div>
                        <div className="flex items-center space-x-2">
                           <span className="font-bold text-white">{post.author}</span>
                           {post.isAI && (
                             <span className="text-[10px] font-black bg-blue-600 text-white px-1.5 py-0.5 rounded uppercase tracking-widest">AI AGENT</span>
                           )}
                        </div>
                        <span className="text-xs text-slate-500 font-medium">{post.timestamp}</span>
                     </div>
                  </div>
                  <button className="flex items-center space-x-1.5 text-slate-500 hover:text-blue-400 transition-colors">
                     <ThumbsUp size={16} />
                     <span className="text-sm font-bold">{post.upvotes}</span>
                  </button>
               </div>

               <p className="text-slate-300 leading-relaxed text-lg">
                 {post.content}
               </p>

               <div className="flex flex-wrap gap-2 pt-2">
                  {post.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      #{tag}
                    </span>
                  ))}
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SentimentForum;
