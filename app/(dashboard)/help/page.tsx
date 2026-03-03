'use client';

import React from 'react';
import { HelpCircle, Mail, ShieldQuestion, Wrench } from 'lucide-react';

export default function HelpPage() {
  const faqs = [
    { q: 'How do I analyze my games?', a: "After any game, click 'Game Review' to get move-by-move feedback and coach-style commentary." },
    { q: 'What engine powers analysis?', a: 'All computer play and analysis run on Stockfish; we tune difficulty and hints for learning.' },
    { q: 'How do I get help?', a: 'Email admin@chessbotbuddies.org and include your username plus a short description of the issue.' },
    { q: 'Can I customize the board?', a: 'Yes. Go to Settings > Board Customization to switch piece sets and color schemes.' }
  ];

  return (
    <div className="h-full flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto custom-scrollbar pr-2">
      <div className="max-w-4xl">
        <h1 className="text-4xl font-black text-white mb-4">How can we help?</h1>
        <p className="text-zinc-400 text-lg mb-6 font-semibold">We do not have live chat or a docs portal—reach us by email and browse quick answers below.</p>

        <div className="mb-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-3xl bg-redesign-cyan/5 border border-redesign-cyan/10 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-white font-bold text-sm"><Mail size={18} className="text-redesign-cyan" /> Email support</div>
            <p className="text-xs text-zinc-400 leading-relaxed">admin@chessbotbuddies.org — we typically reply within one business day.</p>
          </div>
          <div className="p-5 rounded-3xl bg-redesign-cyan/5 border border-redesign-cyan/10 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-white font-bold text-sm"><HelpCircle size={18} className="text-redesign-cyan" /> Quick tips</div>
            <p className="text-xs text-zinc-400 leading-relaxed">Use Game Review after any match; set bot difficulty from the Play screen.</p>
          </div>
          <div className="p-5 rounded-3xl bg-redesign-cyan/5 border border-redesign-cyan/10 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-white font-bold text-sm"><ShieldQuestion size={18} className="text-redesign-cyan" /> Safety</div>
            <p className="text-xs text-zinc-400 leading-relaxed">Kid-friendly by design: no live chat and ads are screened for appropriateness.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {faqs.map((faq, i) => (
            <div key={i} className="p-6 bg-redesign-glass-bg border border-redesign-glass-border rounded-3xl hover:border-redesign-cyan/20 transition-all cursor-pointer group">
              <h3 className="text-white font-bold mb-2 group-hover:text-redesign-cyan transition-colors">{faq.q}</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-redesign-glass-bg border border-redesign-glass-border flex gap-4 items-start">
             <Mail className="text-redesign-cyan mt-1" size={28} />
             <div>
               <p className="text-white font-bold text-sm mb-1">Email support</p>
               <p className="text-xs text-zinc-400 leading-relaxed">Email admin@chessbotbuddies.org with screenshots and your steps; we answer as fast as we can.</p>
             </div>
          </div>
          <div className="p-6 rounded-3xl bg-redesign-glass-bg border border-redesign-glass-border flex gap-4 items-start">
             <Wrench className="text-redesign-cyan mt-1" size={28} />
             <div>
               <p className="text-white font-bold text-sm mb-1">Troubleshooting quick wins</p>
               <ul className="text-xs text-zinc-400 space-y-1 list-disc list-inside">
                  <li>Refresh the page and re-open your session.</li>
                  <li>Clear cached data if boards or pieces look incorrect.</li>
                  <li>Use a modern browser (Chrome, Edge, Safari, Firefox).</li>
               </ul>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
