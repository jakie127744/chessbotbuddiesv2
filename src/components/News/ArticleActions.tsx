'use client';

import React, { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, Twitter, Facebook } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export const ArticleActions = ({ articleId, title }: { articleId: string, title?: string }) => {
    const [reaction, setReaction] = useState<'like' | 'dislike' | null>(null);
    const [counts, setCounts] = useState({ likes: 0, dislikes: 0 });
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        // Load local user state
        const stored = localStorage.getItem(`news-reaction-${articleId}`);
        if (stored === 'like' || stored === 'dislike') {
            setReaction(stored);
        }

        // Fetch global counts
        fetchCounts();
    }, [articleId]);

    const fetchCounts = async () => {
        if (!supabase) return;
        
        // Try to verify if table exists by selecting (soft fail if not)
        const { data, error } = await supabase
            .from('article_reactions')
            .select('likes, dislikes')
            .eq('article_id', articleId)
            .single();

        if (data) {
            // @ts-ignore - Supabase types are not updated for this new table
            setCounts({ likes: data.likes || 0, dislikes: data.dislikes || 0 });
        } else if (error && error.code !== 'PGRST116') { // PGRST116 is "Row not found" (which is fine, means 0)
            console.warn("Supabase fetch error (table might be missing):", error.message);
        }
    };

    const handleReaction = async (type: 'like' | 'dislike') => {
        if (!supabase) {
             // Fallback for local-only if no supabase
            if (reaction === type) {
                setReaction(null);
                localStorage.removeItem(`news-reaction-${articleId}`);
                setCounts(prev => ({ ...prev, [type === 'like' ? 'likes' : 'dislikes']: Math.max(0, prev[type === 'like' ? 'likes' : 'dislikes'] - 1) }));
            } else {
                setReaction(type);
                localStorage.setItem(`news-reaction-${articleId}`, type);
                setCounts(prev => ({ ...prev, [type === 'like' ? 'likes' : 'dislikes']: prev[type === 'like' ? 'likes' : 'dislikes'] + 1 }));
            }
            return;
        }

        const previousReaction = reaction;
        
        // Optimistic UI update
        if (reaction === type) {
            setReaction(null);
            localStorage.removeItem(`news-reaction-${articleId}`);
            setCounts(prev => ({ ...prev, [type === 'like' ? 'likes' : 'dislikes']: Math.max(0, prev[type === 'like' ? 'likes' : 'dislikes'] - 1) }));
        } else {
            setReaction(type);
            localStorage.setItem(`news-reaction-${articleId}`, type);
            setCounts(prev => {
                const newCounts = { ...prev };
                if (previousReaction) {
                     // Decrement previous
                     const prevKey = previousReaction === 'like' ? 'likes' : 'dislikes';
                     newCounts[prevKey] = Math.max(0, newCounts[prevKey] - 1);
                }
                // Increment new
                const newKey = type === 'like' ? 'likes' : 'dislikes';
                newCounts[newKey] = newCounts[newKey] + 1;
                return newCounts;
            });
        }

        // RPC call (safest for counters) or direct upsert
        
        try {
            // @ts-ignore - RPC not typed
            const { error } = await supabase.rpc('handle_article_reaction', { 
                p_article_id: articleId, 
                p_reaction: type 
            }); 

            if (error) {
                console.warn("Failed to persist vote:", error.message);
            }
        } catch (e) {
            console.error("Vote error", e);
        }
    };

    const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/news/${articleId}` : `https://www.chessbotbuddies.org/news/${articleId}`;
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(title || 'Chess News');

    const shareSocial = (platform: 'twitter' | 'facebook') => {
        let url = '';
        if (platform === 'twitter') {
            url = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
        } else {
            url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        }
        window.open(url, '_blank', 'width=600,height=400');
    };

    if (!isClient) return <div className="h-10" />; // Prevent hydration mismatch

    return (
        <div className="flex flex-wrap items-center justify-between gap-4 pt-6 mt-8 border-t border-white/10">
            <div className="flex items-center gap-2">
                <button 
                    onClick={() => handleReaction('like')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all font-bold text-sm ${
                        reaction === 'like' 
                            ? 'bg-green-500/20 text-green-400 border border-green-500/50' 
                            : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white border border-transparent'
                    }`}
                >
                    <ThumbsUp size={16} className={reaction === 'like' ? 'fill-current' : ''} />
                    Helpful {counts.likes > 0 && <span className="ml-1 text-xs opacity-80">({counts.likes})</span>}
                </button>
                <button 
                    onClick={() => handleReaction('dislike')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all font-bold text-sm ${
                        reaction === 'dislike' 
                            ? 'bg-red-500/20 text-red-400 border border-red-500/50' 
                            : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white border border-transparent'
                    }`}
                >
                    <ThumbsDown size={16} className={reaction === 'dislike' ? 'fill-current' : ''} />
                </button>
            </div>

            <div className="flex items-center gap-3">
                <span className="text-zinc-500 text-sm font-bold uppercase tracking-wider hidden sm:block">Share:</span>
                <button 
                    onClick={() => shareSocial('twitter')}
                    className="p-2 rounded-full bg-zinc-800 text-zinc-400 hover:bg-[#1DA1F2] hover:text-white transition-all shadow-lg hover:shadow-[#1DA1F2]/20"
                    title="Share on X (Twitter)"
                >
                    <Twitter size={18} />
                </button>
                <button 
                    onClick={() => shareSocial('facebook')}
                    className="p-2 rounded-full bg-zinc-800 text-zinc-400 hover:bg-[#4267B2] hover:text-white transition-all shadow-lg hover:shadow-[#4267B2]/20"
                    title="Share on Facebook"
                >
                    <Facebook size={18} />
                </button>
            </div>
        </div>
    );
};
