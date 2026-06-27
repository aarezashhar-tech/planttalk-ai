import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../contexts/LanguageContext';

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'tip', label: 'Tips' },
  { id: 'question', label: 'Questions' },
  { id: 'disease', label: 'Diseases' },
  { id: 'success', label: 'Success' },
];

const CATEGORY_BADGE = {
  tip: { icon: 'lightbulb', label: 'Tip', cls: 'bg-primary-container/40 text-primary border-primary/20' },
  question: { icon: 'help', label: 'Question', cls: 'bg-tertiary-container/40 text-tertiary border-tertiary/20' },
  disease: { icon: 'coronavirus', label: 'Disease Alert', cls: 'bg-error-container/40 text-error border-error/20' },
  success: { icon: 'emoji_events', label: 'Success Story', cls: 'bg-secondary-container/40 text-secondary border-secondary/20' },
};

const SAMPLE_POSTS = [
  {
    id: 1001, farmerName: 'Ramu', location: 'Vaniyambadi, Tamil Nadu', crop: 'Tomato', category: 'tip',
    text: 'Used neem oil mixed with garlic spray for whitefly control and it worked amazingly! Cost only ₹50 per acre. Mix 5ml neem oil + 10 crushed garlic cloves in 1L water. Spray in evening. Try this!',
    image: null, likes: 24, likedBy: ['system'], replies: [
      { id: 1, farmerName: 'Lakshmi', location: 'Vellore, TN', text: 'This worked for my brinjal too! Thank you 🙏', createdAt: Date.now() - 3600000 },
      { id: 2, farmerName: 'Suresh', location: 'Dharmapuri, TN', text: 'How many days gap between sprays?', createdAt: Date.now() - 7200000 },
    ],
    createdAt: Date.now() - 7200000,
  },
  {
    id: 1002, farmerName: 'Lakshmi Devi', location: 'Gudiyatham, Tamil Nadu', crop: 'Rice', category: 'question',
    text: 'My rice leaves have brown spots with yellow edges. Is this Blast disease or just nutrient issue? First time growing rice this season. Any experienced rice farmers here who can help?',
    image: null, likes: 8, likedBy: [], replies: [
      { id: 1, farmerName: 'Pandian', location: 'Thanjavur, TN', text: 'Send a photo. If spots are diamond shaped, it\'s blast. Apply Tricyclazole immediately.', createdAt: Date.now() - 1800000 },
    ],
    createdAt: Date.now() - 14400000,
  },
  {
    id: 1003, farmerName: 'Rajesh Kumar', location: 'Sirsa, Haryana', crop: 'Wheat', category: 'success',
    text: 'Got 22 quintal/acre yield this season using zero-till farming method! Saved ₹3000 on plowing + diesel. Also used HD-3086 variety with 3 irrigations only. Very happy with the result! 🌾',
    image: null, likes: 45, likedBy: ['system'], replies: [
      { id: 1, farmerName: 'Harpreet', location: 'Fatehabad, Haryana', text: 'Congratulations bhai! Which fertilizer schedule did you follow?', createdAt: Date.now() - 3600000 },
      { id: 2, farmerName: 'Rajesh Kumar', location: 'Sirsa, Haryana', text: 'DAP at sowing, then Urea split in 3 doses. Also used Potash at flowering.', createdAt: Date.now() - 1800000 },
    ],
    createdAt: Date.now() - 28800000,
  },
  {
    id: 1004, farmerName: 'Meena', location: 'Tenkasi, Tamil Nadu', crop: 'Banana', category: 'disease',
    text: 'Disease Alert: Panama Wilt detected in my banana farm! Leaves turning yellow from edges. Lost 20 plants already. AI Doctor says its Fusarium fungus. Using Trichoderma now. Anyone faced this?',
    image: null, likes: 12, likedBy: [], replies: [
      { id: 1, farmerName: 'Murugan', location: 'Theni, TN', text: 'Don\'t plant banana in same field next season. This fungus stays in soil for years!', createdAt: Date.now() - 7200000 },
    ],
    createdAt: Date.now() - 43200000,
  }
];

export const Community = ({ userProfile }) => {
  const { t } = useTranslation();
  const [posts, setPosts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [composeText, setComposeText] = useState('');
  const [composeCategory, setComposeCategory] = useState('tip');
  const [expandedReplies, setExpandedReplies] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('communityPosts');
      if (stored) {
        const userPosts = JSON.parse(stored);
        const allIds = new Set(userPosts.map(p => p.id));
        const merged = [...userPosts, ...SAMPLE_POSTS.filter(p => !allIds.has(p.id))];
        merged.sort((a, b) => b.createdAt - a.createdAt);
        setPosts(merged);
      } else {
        setPosts([...SAMPLE_POSTS]);
      }
    } catch (e) {
      setPosts([...SAMPLE_POSTS]);
    }
  }, []);

  const savePosts = (allPosts) => {
    setPosts(allPosts);
    const userPosts = allPosts.filter(p => !SAMPLE_POSTS.find(sp => sp.id === p.id));
    const modifiedSamples = allPosts.filter(p => SAMPLE_POSTS.find(sp => sp.id === p.id));
    localStorage.setItem('communityPosts', JSON.stringify([...userPosts, ...modifiedSamples]));
  };

  const handleCreatePost = () => {
    if (!composeText.trim()) return;
    const newPost = {
      id: Date.now(),
      farmerName: userProfile?.farmerName || 'Farmer',
      location: `${userProfile?.location || 'India'}${userProfile?.state ? ', ' + userProfile.state : ''}`,
      crop: userProfile?.crop || 'Crop',
      category: composeCategory,
      text: composeText.trim(),
      image: null,
      likes: 0,
      likedBy: [],
      replies: [],
      createdAt: Date.now(),
    };
    const updated = [newPost, ...posts];
    savePosts(updated);
    setComposeText('');
  };

  const handleLike = (postId) => {
    const myId = userProfile?.user_id || 'me';
    const updated = posts.map(p => {
      if (p.id !== postId) return p;
      const alreadyLiked = (p.likedBy || []).includes(myId);
      return {
        ...p,
        likes: alreadyLiked ? p.likes - 1 : p.likes + 1,
        likedBy: alreadyLiked
          ? p.likedBy.filter(id => id !== myId)
          : [...(p.likedBy || []), myId],
      };
    });
    savePosts(updated);
  };

  const handleReply = (postId) => {
    if (!replyText.trim()) return;
    const updated = posts.map(p => {
      if (p.id !== postId) return p;
      return {
        ...p,
        replies: [...(p.replies || []), {
          id: Date.now(),
          farmerName: userProfile?.farmerName || 'Farmer',
          location: `${userProfile?.location || 'India'}${userProfile?.state ? ', ' + userProfile.state.substring(0, 2).toUpperCase() : ''}`,
          text: replyText.trim(),
          createdAt: Date.now(),
        }],
      };
    });
    savePosts(updated);
    setReplyText('');
    setReplyingTo(null);
  };

  const filteredPosts = activeCategory === 'all'
    ? posts
    : posts.filter(p => p.category === activeCategory);

  const trendingPosts = [...posts].sort((a, b) => b.likes - a.likes).slice(0, 3);

  const timeAgo = (ts) => {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return `${Math.floor(days / 7)}w ago`;
  };

  const isLiked = (post) => {
    const myId = userProfile?.user_id || 'me';
    return (post.likedBy || []).includes(myId);
  };

  return (
    <div className="antialiased min-h-screen font-body-md text-body-md text-white bg-[#0F1C14]">
      {/* Background Mesh */}
      <div className="fixed top-0 left-0 w-screen h-screen -z-10 bg-[#0F1C14] pointer-events-none" style={{
        background: `radial-gradient(circle at 15% 50%, rgba(26, 71, 49, 0.4), transparent 50%),
                     radial-gradient(circle at 85% 30%, rgba(16, 185, 129, 0.15), transparent 50%),
                     radial-gradient(circle at 50% 80%, rgba(0, 165, 114, 0.2), transparent 50%)`,
        animation: 'mesh-flow 20s ease-in-out infinite alternate'
      }}></div>

      {/* SideNavBar */}
      <nav className="fixed left-0 top-0 h-full w-64 rounded-r-xl bg-gradient-to-b from-primary-container to-surface-container-lowest backdrop-blur-xl border-r border-white/10 shadow-[0_0_20px_rgba(16,185,129,0.1)] flex flex-col p-6 z-50 hidden md:flex">
        <div className="mb-10">
          <h1 className="font-headline-lg text-headline-lg font-bold text-secondary tracking-tight">PLANTTALK AI</h1>
          <p className="font-label-mono text-label-mono text-gray-100 mt-1">Living Intelligence</p>
        </div>
        <div className="flex flex-col gap-2 flex-grow">
          <a className="flex items-center gap-3 px-4 py-3 text-gray-100 hover:text-white hover:bg-white/5 hover:backdrop-blur-md transition-all duration-300 rounded-lg" href="/">
            <span className="material-icons" style={{fontVariationSettings: "'FILL' 0"}}>home</span>
            <span className="font-label-mono text-label-mono">Home</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-gray-100 hover:text-white hover:bg-white/5 hover:backdrop-blur-md transition-all duration-300 rounded-lg" href="/doctor">
            <span className="material-icons" style={{fontVariationSettings: "'FILL' 0"}}>medical_services</span>
            <span className="font-label-mono text-label-mono">Doctor</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-gray-100 hover:text-white hover:bg-white/5 hover:backdrop-blur-md transition-all duration-300 rounded-lg" href="/india">
            <span className="material-icons" style={{fontVariationSettings: "'FILL' 0"}}>location_on</span>
            <span className="font-label-mono text-label-mono">India</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-secondary bg-white/10 rounded-lg border-l-2 border-secondary scale-95 transition-transform duration-200" href="/community">
            <span className="material-icons" style={{fontVariationSettings: "'FILL' 1"}}>groups</span>
            <span className="font-label-mono text-label-mono">Community</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-gray-100 hover:text-white hover:bg-white/5 hover:backdrop-blur-md transition-all duration-300 rounded-lg" href="/settings">
            <span className="material-icons" style={{fontVariationSettings: "'FILL' 0"}}>settings</span>
            <span className="font-label-mono text-label-mono">Settings</span>
          </a>
        </div>
        
      </nav>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#0a1a10]/80 backdrop-blur-md border-b border-white/5 flex justify-between items-center px-4 z-40">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-secondary/20 flex items-center justify-center border border-secondary/50">
            <span className="material-icons text-secondary text-sm" style={{fontVariationSettings: "'FILL' 1"}}>eco</span>
          </div>
          <span className="font-bold text-secondary text-base tracking-tight">PlantTalk AI</span>
        </div>
        <div className="flex items-center gap-1">
          <button className="text-gray-100 hover:text-secondary min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full">
            <span className="material-icons text-xl">notifications</span>
          </button>
          <button className="text-gray-100 hover:text-secondary min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full">
            <span className="material-icons text-xl">account_circle</span>
          </button>
        </div>
      </header>

      {/* Desktop TopAppBar */}
      <header className="fixed top-0 right-0 w-full md:w-[calc(100%-16rem)] h-20 backdrop-blur-md border-b border-white/5 justify-between items-center px-5 md:px-8 z-40 hidden md:flex">
        <div className="flex items-center gap-4">
          <h2 className="font-headline-lg-mobile md:font-headline-lg text-xl font-black text-secondary md:hidden">PlantTalk AI</h2>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative hidden sm:block">
            <input className="bg-black/20 border-b border-white/10 focus:border-secondary transition-colors outline-none pl-10 pr-4 py-2 rounded-full w-64 text-white font-body-md text-sm placeholder-on-surface-variant focus:shadow-[0_4px_15px_rgba(16,185,129,0.1)]" placeholder="Search community..." type="text"/>
            <span className="material-icons absolute left-3 top-2.5 text-gray-100 text-sm">search</span>
          </div>
          <div className="flex items-center gap-4 text-gray-100">
            <button className="hover:text-secondary hover:translate-y-[-1px] transition-transform">
              <span className="material-icons">notifications</span>
            </button>
            <button className="hover:text-secondary hover:translate-y-[-1px] transition-transform">
              <span className="material-icons">account_circle</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 md:pt-24 pb-24 md:pb-10 px-4 md:px-8 md:ml-64 min-h-screen">
        <div className="mb-10 animate-slide-up" style={{animationDelay: '0.1s', animationFillMode: 'both'}}>
          <h1 className="font-display-lg text-2xl md:text-4xl font-bold text-white flex items-center gap-3 md:gap-4">
            👨‍🌾 {t('Farmer Community')}
          </h1>
          <p className="font-body-md text-gray-100 mt-1 md:mt-2 max-w-2xl text-sm md:text-base">
            {t('Share tips, ask questions, help each other grow. Connect with thousands of precision agriculture experts globally.')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Center Feed Column */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Composer */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 border-t-white/15 border-l-white/15 rounded-xl p-4 md:p-6 animate-slide-up" style={{animationDelay: '0.2s', animationFillMode: 'both'}}>
              <div className="flex gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-secondary flex items-center justify-center text-lg md:text-xl bg-white/10 flex-shrink-0">
                  👨‍🌾
                </div>
                <div className="flex-grow flex flex-col gap-3">
                  <div className="flex items-center bg-surface-container-low rounded-lg border border-white/5 pr-2 focus-within:border-secondary focus-within:shadow-[0_0_10px_rgba(16,185,129,0.2)] transition-all">
                    <input 
                      value={composeText}
                      onChange={(e) => setComposeText(e.target.value)}
                      className="w-full bg-transparent border-none text-white px-4 py-3 focus:ring-0 font-body-md placeholder-on-surface-variant outline-none" 
                      placeholder="Share your farming experience..." 
                      type="text"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <select 
                      value={composeCategory}
                      onChange={(e) => setComposeCategory(e.target.value)}
                      className="bg-black/20 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:border-secondary"
                    >
                      <option value="tip">🌟 Tip</option>
                      <option value="question">❓ Question</option>
                      <option value="disease">🦠 Disease Alert</option>
                      <option value="success">🏆 Success Story</option>
                    </select>
                    <button 
                      onClick={handleCreatePost}
                      disabled={!composeText.trim()}
                      className="px-4 py-2 rounded-full bg-secondary text-on-secondary font-bold text-sm disabled:opacity-90 hover:bg-secondary-fixed transition-colors min-h-[44px]"
                    >
                      Post
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex overflow-x-auto pb-2 gap-3 hide-scrollbar animate-slide-up" style={{scrollbarWidth: 'none', animationDelay: '0.3s', animationFillMode: 'both'}}>
              {CATEGORIES.map(cat => (
                <button 
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`whitespace-nowrap px-6 py-2 rounded-full font-label-mono text-xs transition-colors border ${
                    activeCategory === cat.id 
                      ? 'bg-primary-container text-primary border-primary/30' 
                      : 'bg-white/5 text-gray-100 border-white/10 hover:text-white'
                  }`}
                >
                  {t(cat.label)}
                </button>
              ))}
            </div>

            {/* Feed Cards */}
            <div className="flex flex-col gap-6">
              {filteredPosts.map((post, idx) => {
                const badge = CATEGORY_BADGE[post.category];
                const showReplies = expandedReplies[post.id];
                
                return (
                  <div key={post.id} className="bg-white/5 backdrop-blur-xl border border-white/10 border-t-white/15 border-l-white/15 rounded-xl p-6 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5),0_0_20px_rgba(16,185,129,0.1)] hover:bg-white/10 transition-all duration-300 animate-slide-up" style={{animationDelay: `${0.4 + (idx * 0.1)}s`, animationFillMode: 'both'}}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-3 items-center">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-lg">
                          👨‍🌾
                        </div>
                        <div>
                          <h4 className="font-label-mono text-sm font-bold">{post.farmerName}</h4>
                          <div className="flex items-center gap-2 text-gray-100 text-xs opacity-90 mt-0.5">
                            <span className="material-icons text-[14px]">location_on</span>
                            <span>{post.location}</span>
                            <span>•</span>
                            <span>{timeAgo(post.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      {badge && (
                        <span className={`px-3 py-1 rounded-full ${badge.cls} border font-label-mono text-[10px] uppercase tracking-wider flex items-center gap-1`}>
                          <span className="material-icons text-[14px]">{badge.icon}</span> {t(badge.label)}
                        </span>
                      )}
                    </div>
                    
                    <p className="font-body-md text-white mb-4 whitespace-pre-line">
                      {post.text}
                    </p>
                    
                    <div className="flex items-center gap-4 text-gray-100 border-t border-white/5 pt-4 mt-2">
                      <button 
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center gap-1.5 transition-colors text-sm min-h-[44px] px-2 rounded-lg ${isLiked(post) ? 'text-secondary' : 'hover:text-secondary'}`}
                      >
                        <span className="material-icons" style={{fontVariationSettings: isLiked(post) ? "'FILL' 1" : "'FILL' 0"}}>thumb_up</span> {post.likes}
                      </button>
                      <button 
                        onClick={() => {
                          setExpandedReplies({ ...expandedReplies, [post.id]: !showReplies });
                          if (!showReplies) setReplyingTo(post.id);
                        }}
                        className="flex items-center gap-1.5 hover:text-secondary transition-colors text-sm min-h-[44px] px-2 rounded-lg"
                      >
                        <span className="material-icons" style={{fontVariationSettings: "'FILL' 0"}}>chat_bubble</span> {(post.replies || []).length}
                      </button>
                      <span className="ml-auto font-label-mono text-xs px-2 py-1 bg-black/20 rounded text-primary">Crop: {post.crop}</span>
                    </div>

                    {showReplies && (
                      <div className="mt-4 pt-4 border-t border-white/10 space-y-4">
                        {(post.replies || []).map(reply => (
                          <div key={reply.id} className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-white/5 flex flex-shrink-0 items-center justify-center text-xs">👨‍🌾</div>
                            <div className="flex-1 bg-black/20 rounded-lg p-3 border border-white/5">
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-sm">{reply.farmerName}</span>
                                <span className="text-xs text-gray-100">{timeAgo(reply.createdAt)}</span>
                              </div>
                              <p className="text-sm text-gray-100">{reply.text}</p>
                            </div>
                          </div>
                        ))}

                        {replyingTo === post.id && (
                          <div className="flex gap-2 items-center pt-2">
                            <input 
                              type="text" 
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Write a reply..."
                              className="flex-1 bg-black/20 border border-white/10 rounded-full px-4 py-2 text-sm focus:border-secondary outline-none transition-colors"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleReply(post.id);
                              }}
                            />
                            <button 
                              onClick={() => handleReply(post.id)}
                              disabled={!replyText.trim()}
                              className="w-10 h-10 rounded-full bg-secondary text-on-secondary flex items-center justify-center disabled:opacity-90"
                            >
                              <span className="material-icons text-sm">send</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Sidebar / Trending Column */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 border-t-white/15 border-l-white/15 rounded-xl p-6 animate-slide-up" style={{animationDelay: '0.4s', animationFillMode: 'both'}}>
              <h3 className="font-headline-lg-mobile text-lg text-white mb-6 flex items-center gap-2">
                <span className="material-icons text-tertiary animate-[pulse-op_2s_infinite]" style={{fontVariationSettings: "'FILL' 1"}}>local_fire_department</span>
                TRENDING IN YOUR REGION
              </h3>
              
              <div className="flex flex-col gap-5">
                {trendingPosts.map((tp, idx) => (
                  <div key={`trend-${tp.id}`} className={`group cursor-pointer ${idx !== 0 ? 'border-t border-white/5 pt-4' : ''}`}>
                    <div className="flex gap-3">
                      <div className="mt-1">
                        <span className={`material-icons text-lg ${CATEGORY_BADGE[tp.category]?.cls.split(' ')[1]}`} style={{fontVariationSettings: "'FILL' 1"}}>
                          {CATEGORY_BADGE[tp.category]?.icon || 'lightbulb'}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-body-md text-sm font-semibold text-white group-hover:text-secondary transition-colors line-clamp-2">
                          {tp.text}
                        </h4>
                        <div className="flex items-center gap-3 mt-1.5 text-gray-100 text-xs font-label-mono">
                          <span className="flex items-center gap-1"><span className="material-icons text-[12px]">thumb_up</span> {tp.likes}</span>
                          <span>•</span>
                          <span>{t(CATEGORY_BADGE[tp.category]?.label || 'Post')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes mesh-flow {
            0% { transform: scale(1) translate(0, 0); }
            50% { transform: scale(1.1) translate(-2%, 2%); }
            100% { transform: scale(1) translate(2%, -2%); }
        }
        @keyframes pulse-op {
            0% { opacity: 0.7; }
            50% { opacity: 1; text-shadow: 0 0 10px rgba(255, 185, 95, 0.8); }
            100% { opacity: 0.7; }
        }
      `}} />
    </div>
  );
};
