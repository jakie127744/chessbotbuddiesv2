import React from 'react';
import { NewsView } from '@/redesign/components/NewsView';
import { getAllArticles } from '@/redesign/lib/mdx';
import { deterministicShuffle } from '@/lib/shuffle-utils';

export default function NewsPage() {
  const articles = getAllArticles();
  
  // Create a stable seed based on the date (YYYY-MM-DD)
  const today = new Date().toISOString().split('T')[0];
  const shuffledArticles = deterministicShuffle(articles, today);
  
  return <NewsView articles={shuffledArticles} />;
}
