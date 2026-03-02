'use client';

import React from 'react';

const rules = [
  'Use the site respectfully and keep interactions kid-friendly.',
  'Do not attempt to exploit, reverse engineer, or disrupt the service.',
  'Content and training materials are provided as-is without warranty.',
  'We may update these terms; continuing to use the site accepts the latest version.',
];

export default function TermsPage() {
  return (
    <div className="space-y-6 text-white">
      <div className="bg-gradient-to-br from-[#111827] to-[#0b0f1a] border border-white/5 rounded-3xl p-8 shadow-xl">
        <h1 className="text-3xl font-black mb-3 text-white">Terms of Service</h1>
        <p className="text-zinc-300 leading-relaxed max-w-3xl">
          Welcome to ChessBotBuddies. By using the site you agree to follow these simple terms designed to keep play fair and safe.
        </p>
      </div>

      <div className="bg-[#0d1220] border border-white/5 rounded-2xl p-6 space-y-3">
        <h2 className="text-2xl font-bold text-white">Ground rules</h2>
        <ul className="list-disc list-inside text-zinc-300 space-y-2">
          {rules.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      <div className="bg-[#0b0f1a] border border-white/5 rounded-2xl p-6 text-zinc-300 space-y-2">
        <h3 className="text-xl font-bold text-white">Contact</h3>
        <p>Questions or issues? Email admin@chessbotbuddies.org and we will help.</p>
      </div>
    </div>
  );
}
