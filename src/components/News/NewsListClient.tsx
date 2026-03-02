'use client';

import React, { useState, useEffect } from 'react';
import { DashboardShell } from '@/components/DashboardShell';
import { Globe, ArrowLeft, ArrowRight, ExternalLink, Menu, Search } from 'lucide-react';
import { Chess } from 'chess.js';
import { ChessBoard } from '@/components/ChessBoard';
import Link from 'next/link';
import Image from 'next/image';
import { ArticleMetadata } from '@/lib/mdx';
import { NewsSidebar } from './NewsSidebar';
import { AdBanner } from '../ads/AdBanner';
import { getAdSlotId } from '@/lib/ads/ad-manager';

// Re-using local components from original file

const NewsBoardThumbnail = ({ fen, caption, thumbnail }: { fen: string | undefined, caption?: string, thumbnail?: string }) => {
    // Memoize the game to prevent re-instantiation on every render
    const game = React.useMemo(() => {
        try {
            if (fen && fen !== 'start') {
                return new Chess(fen);
            }
            return new Chess();
        } catch {
            return new Chess();
        }
    }, [fen]);

    return (
        <div className="w-full aspect-square bg-zinc-800 rounded-lg overflow-hidden border border-zinc-700/50 shadow-sm relative group-hover:border-zinc-500 transition-colors">
             {thumbnail ? (
                 <Image 
                    src={thumbnail}
                    alt={caption || "Article thumbnail"}
                    fill
                    className="object-cover transition-transform duration-700 md:group-hover:scale-105"
                 />
             ) : (
                 <div className="w-full h-full relative pointer-events-none">
                     <div className="absolute inset-0 z-10 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]"></div>
                     <ChessBoard 
                         game={game} 
                         arePiecesDraggable={false} 
                         onMove={() => false}
                         colorScheme="ocean" 
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                 </div>
             )}
        </div>
    );
};

const HeroBoard = ({ fen }: { fen: string | undefined }) => {
    const game = React.useMemo(() => {
        try {
            if (fen && fen !== 'start') {
                return new Chess(fen);
            }
            return new Chess();
        } catch (e) {
            return new Chess();
        }
    }, [fen]);

    return (
        <ChessBoard 
            game={game}
            arePiecesDraggable={false}
            onMove={() => false}
            colorScheme="ocean"
        />
    );
};

import { AuthModal } from '@/components/AuthModal';

export default function NewsListClient({ articles }: { articles: ArticleMetadata[] }) {
  const [activeTab, setActiveTab] = useState<'updates' | 'world' | 'legends'>('world');
  const [searchQuery, setSearchQuery] = useState('');
  const [heroIndex, setHeroIndex] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Filter by category
  // FIX: Make 'world' the default catch-all
  const filteredByCategory = articles.filter(article => {
      // 1. Updates are strict
      if (activeTab === 'updates') {
          return article.category === 'updates';
      }
      
      // 2. Legends match explicit category OR 'Prodigy' tag
      if (activeTab === 'legends') {
          return article.category === 'legends' || (article.tags && article.tags.includes('Prodigy'));
      }
      
      // 3. World catches everything else (including explicit 'world' category, or missing category)
      if (activeTab === 'world') {
           const isLegend = article.category === 'legends' || (article.tags && article.tags.includes('Prodigy'));
           const isUpdate = article.category === 'updates';
           // Include if it matches 'world', OR if it doesn't match the other two strictly
           return article.category === 'world' || (!isLegend && !isUpdate);
      }
      
      return false;
  });
  
  const displayArticles = filteredByCategory.filter(article => {
      const query = searchQuery.toLowerCase();
      const matchesTitle = article.title.toLowerCase().includes(query);
      const matchesExcerpt = article.excerpt?.toLowerCase().includes(query) || false;
      const matchesTags = article.tags?.some(tag => tag.toLowerCase().includes(query)) || false;
      return matchesTitle || matchesExcerpt || matchesTags;
  });

  // Randomize hero on tab change
  useEffect(() => {
      if (displayArticles.length > 0) {
          // Select a random hero from the top 5 articles to keep it somewhat fresh but relevant
          const maxIndex = Math.min(displayArticles.length, 5);
          setHeroIndex(Math.floor(Math.random() * maxIndex));
      } else {
          setHeroIndex(0);
      }
  }, [activeTab]);

  const heroArticle = displayArticles.length > 0 ? displayArticles[heroIndex] || displayArticles[0] : null;
  const gridArticles = displayArticles.length > 0 ? displayArticles.filter((_, i) => (displayArticles[heroIndex] ? i !== heroIndex : i !== 0)) : [];

  return (
    <DashboardShell activeView="news" userProfile={null}>
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8 h-full lg:overflow-y-auto bg-[#0F1219]"> {/* Darker background */}
        
        {/* Header - Compact */}
        <div className="flex flex-col gap-6 mb-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-white/10 pb-6">
                 <div>
                <h1 className="text-5xl md:text-7xl font-black text-white mb-2 font-display tracking-tighter uppercase italic">
                  The 64 Squares
                </h1>
                 </div>

                 {/* Search */}
                 <div className="relative w-full md:w-64">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search size={14} className="text-zinc-500" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search articles..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-colors"
                    />
                </div>
            </div>

            {/* Navigation Tabs - ChessBase Style (Red/Active) */}
            <div className="flex items-center gap-1 bg-zinc-900/50 p-1 rounded-lg w-fit">
                {(['world', 'legends', 'updates'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`
                            px-6 py-2 rounded font-bold text-sm uppercase tracking-wider transition-all
                            ${activeTab === tab 
                                ? 'bg-[#b91c1c] text-white shadow-lg shadow-red-900/20' 
                                : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}
                        `}
                    >
                        {tab === 'world' ? 'World News' : tab}
                    </button>
                ))}
            </div>
        </div>

        {/* Main Layout: Grid -> 9 Columns Content | 3 Columns Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Main Content Column (Left) */}
            <div className="lg:col-span-9 space-y-12">
                
                {/* HERO ARTICLE */}
                {heroArticle ? (
                    <Link href={`/news/${heroArticle.id}`} className="block mb-12 group">
                         <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-zinc-900/20 border border-zinc-800/50 p-6 rounded-2xl hover:bg-zinc-900/40 hover:border-zinc-700 transition-all">
                              
                              {/* Left: Square Visual */}
                              <div className="md:col-span-5 lg:col-span-4 w-full">
                                   <div className="aspect-square w-full relative rounded-xl overflow-hidden border border-zinc-700 shadow-xl group-hover:border-zinc-500 transition-all">
                                       {heroArticle.thumbnail ? (
                                            <Image 
                                                src={heroArticle.thumbnail}
                                                alt={heroArticle.title}
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                       ) : (
                                            <div className="w-full h-full relative pointer-events-none">
                                                <div className="absolute inset-0 z-10 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]"></div>
                                                <HeroBoard fen={heroArticle.heroFen} />
                                            </div>
                                       )}
                                       
                                       {/* Badge */}
                                       <div className="absolute top-3 left-3 z-20">
                                            <span className="bg-red-600 text-white px-2 py-0.5 text-[10px] font-black uppercase tracking-widest shadow-lg rounded-sm">
                                                Featured
                                            </span>
                                       </div>
                                   </div>
                              </div>

                              {/* Right: Content */}
                              <div className="md:col-span-7 lg:col-span-8 flex flex-col justify-center">
                                  <div className="flex items-center gap-3 text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">
                                      <span className={
                                          activeTab === 'updates' ? 'text-indigo-400' : 
                                          activeTab === 'legends' ? 'text-amber-400' : 
                                          'text-sky-400'
                                      }>
                                          {activeTab === 'updates' ? 'Platform Update' : 
                                           activeTab === 'legends' ? 'Prodigy Story' : 
                                           'Game Analysis'}
                                      </span>
                                      <span className="w-1 h-1 rounded-full bg-zinc-700" />
                                      <span>{heroArticle.date}</span>
                                  </div>

                                  <h2 className="text-3xl md:text-5xl font-black text-white mb-6 leading-[0.95] tracking-tighter group-hover:text-blue-400 transition-colors">
                                      {heroArticle.title}
                                  </h2>

                                  <p className="text-zinc-400 text-base md:text-lg leading-relaxed mb-6 line-clamp-3">
                                      {heroArticle.excerpt}
                                  </p>

                                  <div className="flex items-center gap-2 text-white font-bold uppercase tracking-wider text-sm group-hover:underline decoration-2 underline-offset-4 decoration-blue-500 w-fit">
                                      Read Full Story <ArrowRight size={16} />
                                  </div>
                              </div>

                         </div>
                    </Link>
                ) : (
                    <div className="py-20 text-center text-zinc-500">No stories found.</div>
                )}

                {/* ADS BANNER (Horizontal) */}
                <div className="w-full flex items-center justify-center my-12 border-y border-white/5 py-8">
                    <div className="flex flex-col items-center gap-2 w-full max-w-[970px]">
                        <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Advertisement</div>
                        <AdBanner 
                             dataAdSlot={getAdSlotId('article')} 
                             dataAdFormat="auto"
                             dataFullWidthResponsive={true}
                             className="w-full block"
                             style={{ minHeight: '90px' }}
                        />
                    </div>
                </div>

                {/* ARTICLE LIST (Dense) */}
                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                        <h3 className="text-xl font-bold text-white uppercase tracking-tight flex items-center gap-2">
                           <Globe size={18} className="text-red-600" /> Latest Stories
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {gridArticles.map(article => (
                            <Link key={article.id} href={`/news/${article.id}`} className="group flex gap-4 bg-zinc-900/30 p-3 rounded-lg border border-zinc-800/50 hover:bg-zinc-900 hover:border-zinc-700 transition-all">
                                {/* Small Thumbnail */}
                                <div className="w-1/3 shrink-0">
                                    <NewsBoardThumbnail fen={article.heroFen} thumbnail={article.thumbnail} />
                                </div>
                                
                                {/* Content */}
                                <div className="flex-1 flex flex-col">
                                    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                                        {article.date}
                                    </div>
                                    <h4 className="text-base font-bold text-white leading-tight mb-2 group-hover:text-red-500 transition-colors line-clamp-2">
                                        {article.title}
                                    </h4>
                                    <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed">
                                        {article.excerpt}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Sidebar Column (Right) */}
            <div className="lg:col-span-3">
                 <NewsSidebar 
                    activeTab={activeTab} 
                    onJoinClick={() => setShowAuthModal(true)}
                    onUpdateClick={(tab) => setActiveTab(tab)}
                 />

                 {/* Vertical Sidebar Ad on News Index */}
                 <div className="hidden 2xl:flex w-full mt-8 border-t border-white/10 pt-8 flex-col gap-4 min-h-[600px]">
                    <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest text-center">Advertisement</div>
                    <AdBanner 
                        dataAdSlot={getAdSlotId('sidebar')} 
                        dataAdFormat="vertical"
                        className="w-full min-h-[600px]"
                    />
                 </div>
            </div>

        </div>
        
        <AuthModal 
            isOpen={showAuthModal}
            onClose={() => setShowAuthModal(false)}
            onSuccess={() => setShowAuthModal(false)}
        />
      </div>
    </DashboardShell>
  );
}
