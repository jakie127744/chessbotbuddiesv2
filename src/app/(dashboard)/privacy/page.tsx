'use client';

import React from 'react';

const points = [
  'We do not sell your personal data.',
  'Guest play is available without creating an account.',
  'Analytics are anonymized and used to improve training quality.',
  'You can request profile deletion at any time by emailing admin@chessbotbuddies.org.',
];

export default function PrivacyPage() {
  return (
    <div className="space-y-6 text-white">
      <div className="bg-gradient-to-br from-[#111827] to-[#0b0f1a] border border-white/5 rounded-3xl p-8 shadow-xl">
        <h1 className="text-3xl font-black mb-3 text-white">Privacy Policy</h1>
        <p className="text-zinc-300 leading-relaxed max-w-3xl">
          We keep your experience kid-friendly and respectful of your data. This summary covers how ChessBotBuddies handles information.
        </p>
      </div>

      <div className="bg-[#0d1220] border border-white/5 rounded-2xl p-6 space-y-3">
        <h2 className="text-2xl font-bold text-white">Core principles</h2>
        <ul className="list-disc list-inside text-zinc-300 space-y-2">
          {points.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      <div className="bg-[#0b0f1a] border border-white/5 rounded-2xl p-6 space-y-2 text-zinc-300">
        <h3 className="text-xl font-bold text-white">Data we collect</h3>
        <p>Basic profile info (if you create an account), gameplay stats, and anonymized usage analytics.</p>
        <h3 className="text-xl font-bold text-white mt-4">Data retention</h3>
        <p>We retain profile data while your account is active. You can request deletion via email, and we will confirm once removed.</p>
      </div>
    </div>
  );
}
