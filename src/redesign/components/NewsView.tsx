'use client';

import React from 'react';
import { Newspaper, MessageSquare, Heart, Share2, TrendingUp, Users, Search } from 'lucide-react';
import { ArticleMetadata } from '../lib/mdx';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';
import { getDailyQuote } from '../../lib/quotes';
import { useState, useEffect } from 'react';

interface NewsViewProps {
  articles: ArticleMetadata[];
}

export function NewsView({ articles }: NewsViewProps) {
   // Generate a random likes count for each article on the client only
   const [likesMap, setLikesMap] = useState<{ [id: string]: number }>({});

   useEffect(() => {
      // Only generate likes once per mount
      if (articles && articles.length > 0) {
         const newLikes: { [id: string]: number } = {};
         articles.forEach(a => {
            newLikes[a.id] = Math.floor(Math.random() * 1000) + 10;
         });
         setLikesMap(newLikes);
      }
   }, [articles]);
  // Use the first article as the featured one, and the rest for the feed list.
  const featuredArticle = articles?.[0] || null;
  const feedArticles = articles?.slice(1) || [];

  const [playerCount, setPlayerCount] = useState<number | null>(null);
  const [gamesPlayed, setGamesPlayed] = useState<number | null>(null);
  const [puzzlesSolved, setPuzzlesSolved] = useState<number | null>(null);
  const [dailyQuote, setDailyQuote] = useState({ quote: "", author: "" });
  const [searchQuery, setSearchQuery] = useState('');

  // Filter feed articles by search query
  const filteredFeed = searchQuery.trim()
    ? feedArticles.filter(a => {
        const q = searchQuery.toLowerCase();
        return a.title.toLowerCase().includes(q) ||
               (a.excerpt || '').toLowerCase().includes(q) ||
               (a.category || '').toLowerCase().includes(q);
      })
    : feedArticles;

  useEffect(() => {
    async function fetchCommunityStats() {
      if (!supabase) return;
      
      try {
        console.log('[News] Fetching community stats...');
        const { count: usersCount, error: countError } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
        if (countError) throw countError;
        if (usersCount !== null) setPlayerCount(usersCount);

        const { data: profiles, error: dataError } = await supabase.from('profiles').select('games_played, puzzles_solved');
        if (dataError) {
          // If columns are missing, this will fail gracefully
          if (dataError.message.includes('column') || dataError.code === 'PGRST204') {
             console.warn('[News] Missing columns for community stats. Run migrations to fix.');
          } else {
             throw dataError;
          }
        }
        
        if (profiles) {
           const sumGames = profiles.reduce((acc, curr: any) => acc + (curr.games_played || 0), 0);
           setGamesPlayed(sumGames);
           const sumPuzzles = profiles.reduce((acc: number, curr: any) => acc + (curr.puzzles_solved || 0), 0);
           setPuzzlesSolved(sumPuzzles);
        }
      } catch (err) {
        console.error('[News] Failed to fetch community stats:', err);
      }
    }
    fetchCommunityStats();
    setDailyQuote(getDailyQuote());
  }, []);

  const dailyQuoteValue = dailyQuote.quote ? dailyQuote : getDailyQuote();

  return (
    <div className="h-full flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto custom-scrollbar pr-2">
      {/* Featured Header */}
      {featuredArticle && (
        <Link href={`/news/${featuredArticle.slug}`} className="block">
           <section className="relative h-64 md:h-80 rounded-3xl overflow-hidden border border-redesign-glass-border group cursor-pointer">
              <img 
                 src={featuredArticle.thumbnail || "https://images.unsplash.com/photo-1610633030088-2df992793b8f?auto=format&fit=crop&q=80&w=1200"} 
                 className="w-full h-full object-cover brightness-50 group-hover:scale-105 transition-transform duration-700"
                 alt="Feature"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f1a] via-[#0b0f1a]/50 to-transparent" />
              <div className="absolute bottom-0 left-0 p-8 md:p-10 max-w-2xl">
                 <span className="px-3 py-1 bg-redesign-cyan text-[#0b0f1a] rounded-lg text-[10px] font-black uppercase tracking-widest mb-4 inline-block">{featuredArticle.category || 'Trending'}</span>
                 <h2 className="text-3xl md:text-4xl font-black text-white leading-tight mb-4 group-hover:text-redesign-cyan transition-colors">{featuredArticle.title}</h2>
                 <div className="flex items-center gap-4 text-xs font-bold text-zinc-400">
                    <span className="flex items-center gap-1.5"><Newspaper size={14} /> Global Chess Feed</span>
                    <span>•</span>
                    <span>{new Date(featuredArticle.date).toLocaleDateString()}</span>
                 </div>
              </div>
           </section>
        </Link>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         {/* Main Feed */}
         <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between mb-4">
               <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <TrendingUp size={20} className="text-redesign-cyan" />
                  Trending Stories
               </h3>
               <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Search articles..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-zinc-500 w-56 focus:outline-none focus:border-redesign-cyan/40 transition-colors"
                  />
               </div>
            </div>
            {filteredFeed.length === 0 && searchQuery.trim() && (
              <div className="text-center py-12 text-zinc-500">
                <Search size={32} className="mx-auto mb-3 opacity-50" />
                <p className="font-bold">No articles found</p>
                <p className="text-sm">Try a different search term</p>
              </div>
            )}
            {filteredFeed.map(item => (
               <Link href={`/news/${item.slug}`} key={item.id} className="bg-redesign-glass-bg border border-redesign-glass-border rounded-3xl overflow-hidden flex flex-col sm:flex-row hover:border-redesign-cyan/20 transition-all group cursor-pointer">
                  <div className="w-full sm:w-64 h-48 sm:h-auto overflow-hidden shrink-0">
                     <img src={item.thumbnail || "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&q=80"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={item.title} />
                  </div>
                  <div className="p-6 flex flex-col justify-between flex-1">
                     <div>
                        <span className="text-[10px] text-redesign-cyan font-bold uppercase tracking-widest mb-2 block">{item.category || 'Article'}</span>
                        <h4 className="text-xl font-bold text-white mb-2 group-hover:text-redesign-cyan transition-colors line-clamp-2">{item.title}</h4>
                        <p className="text-sm text-zinc-500 leading-relaxed mb-4 line-clamp-2">{item.excerpt}</p>
                     </div>
                     <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-4">
                           <button className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 hover:text-red-400 transition-colors">
                              <Heart size={16} /> {likesMap[item.id] ?? 0}
                           </button>
                        </div>
                        <span className="text-[10px] text-zinc-600 font-bold uppercase">{new Date(item.date).toLocaleDateString()}</span>
                     </div>
                  </div>
               </Link>
            ))}
         </div>

         {/* Sidebar Hub */}
         <div className="lg:col-span-4 space-y-8">
            {/* Community Stats */}
            <div className="bg-redesign-glass-bg border border-redesign-glass-border rounded-3xl p-6">
               <h3 className="text-md font-bold text-white mb-6 flex items-center gap-2 underline decoration-redesign-cyan/30 underline-offset-8">
                  <Users size={18} className="text-zinc-500" />
                  Community Hub
               </h3>
               <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                     <div>
                        <p className="text-xs text-zinc-500 font-bold uppercase mb-1">Active Players</p>
                        <p className="text-2xl font-black text-white">{playerCount !== null ? playerCount.toLocaleString() : '...'}</p>
                     </div>
                     <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                   <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                      <div>
                         <p className="text-xs text-zinc-500 font-bold uppercase mb-1">Total Games Played</p>
                         <p className="text-2xl font-black text-white">{gamesPlayed !== null ? gamesPlayed.toLocaleString() : '...'}</p>
                      </div>
                      <TrendingUp className="text-redesign-cyan" size={20} />
                   </div>
                   <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                      <div>
                         <p className="text-xs text-zinc-500 font-bold uppercase mb-1">Puzzles Solved</p>
                         <p className="text-2xl font-black text-white">{puzzlesSolved !== null ? puzzlesSolved.toLocaleString() : '...'}</p>
                      </div>
                      <TrendingUp className="text-amber-400" size={20} />
                   </div>
               </div>
               <a 
                  href="https://facebook.com/chessbotbuddies" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block text-center w-full mt-6 py-3 bg-redesign-cyan/10 border border-redesign-cyan/20 text-redesign-cyan rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-redesign-cyan hover:text-[#0b0f1a] transition-all"
               >
                  Join the Forum
               </a>
            </div>

            {/* Quote of the Day */}
            <div className="p-8 rounded-3xl bg-gradient-to-br from-redesign-cyan/20 to-transparent border border-redesign-cyan/20 relative overflow-hidden group">
               <div className="relative z-10">
                  <MessageSquare className="text-redesign-cyan mb-4" size={32} />
                  <p className="text-lg font-bold text-white italic leading-relaxed mb-4">
                     "{dailyQuoteValue.quote}"
                  </p>
                  <p className="text-xs text-zinc-400 font-bold">— {dailyQuoteValue.author}</p>
               </div>
               <div className="absolute top-0 right-0 w-32 h-32 bg-redesign-cyan/5 blur-3xl rounded-full" />
            </div>
         </div>
      </div>
    </div>
  );
}
