'use client';

import { useState } from 'react';
import { User, RefreshCw, Check, ArrowRight, Map, BookOpen, Swords } from 'lucide-react';
import { generateUniqueUsername, updateUserProfile } from '@/lib/user-profile';
import { Mascot } from './Mascot';
import { ChessPieceCharacter } from './ChessPieceCharacter';

interface WelcomeModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onComplete?: (username: string) => void;
  username?: string;
}

type WizardStep = 'welcome' | 'username' | 'tour' | 'ready';

export function WelcomeModal({ isOpen = true, onClose, onComplete, username: initialUsername }: WelcomeModalProps) {
  const [step, setStep] = useState<WizardStep>('welcome');
  const [username, setUsername] = useState(initialUsername || generateUniqueUsername());
  const [isGenerating, setIsGenerating] = useState(false);

  // If not open, don't render anything
  if (!isOpen) return null;

  function handleRegenerate() {
    setIsGenerating(true);
    setTimeout(() => {
      setUsername(generateUniqueUsername());
      setIsGenerating(false);
    }, 300);
  }

  function handleComplete() {
    updateUserProfile({ username, displayName: username });
    if (onComplete) {
        onComplete(username);
    } else if (onClose) {
        onClose();
    }
  }

  const renderWelcomeStep = () => (
    <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-center mb-6">
        <Mascot size={160} />
      </div>
      <h2 className="text-4xl font-display font-black text-deep-navy mb-4">
        Hi! I'm <span className="text-sky-blue">Knighty!</span>
      </h2>
      <p className="text-xl text-zinc-600 font-sans mb-8">
        Welcome to <span className="font-bold text-deep-navy">ChessBotBuddies</span>!
        <br />
        We're going to have so much fun learning chess together!
      </p>
      <button
        onClick={() => setStep('username')}
        className="w-full px-6 py-4 bg-sky-blue hover:bg-sky-400 text-white font-black text-xl rounded-2xl transition-all flex items-center justify-center gap-2 shadow-[0_6px_0_0_rgba(14,165,233,0.3)] hover:translate-y-[-2px] active:translate-y-[2px] active:shadow-none"
      >
        Let's Get Started!
        <ArrowRight size={28} />
      </button>
    </div>
  );

  const renderUsernameStep = () => (
    <div className="animate-in fade-in slide-in-from-right-8 duration-300">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-display font-black text-deep-navy mb-2">What's your Secret Agent Name?</h2>
        <p className="text-zinc-500 font-sans">Every chess hero needs a cool codename!</p>
      </div>

      <div className="bg-[#243354] rounded-2xl border-4 border-[#3a4a6e] p-6 mb-8 shadow-inner relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <User size={120} />
        </div>
        <div className="text-sm text-zinc-400 mb-2 font-medium font-sans uppercase tracking-wider">Your Codename</div>
        <div className="text-3xl font-black text-deep-navy mb-6 flex items-center justify-center gap-2 font-display bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm relative group/edit">
          {isGenerating ? (
            <div className="flex items-center gap-2 text-zinc-500">
              <RefreshCw size={24} className="animate-spin" />
              Generating...
            </div>
          ) : (
             <input 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)}
                className="w-full text-center bg-transparent border-none focus:ring-0 focus:outline-none placeholder:text-zinc-500 text-black font-bold"
                maxLength={20}
             />
          )}
          {/* Edit Icon hint */}
           {!isGenerating && (
               <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-300 pointer-events-none group-hover/edit:text-sky-400 transition-colors">
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
               </div>
           )}
        </div>
        
        <button
          onClick={handleRegenerate}
          disabled={isGenerating}
          className="w-full px-4 py-3 bg-clean-gray hover:bg-zinc-200 disabled:bg-neutral-100 text-deep-navy font-bold rounded-xl transition-all flex items-center justify-center gap-2 border-b-4 border-zinc-300 active:border-b-0 active:translate-y-[4px]"
        >
          <RefreshCw size={20} />
          Spin for a New Name!
        </button>
      </div>

      <button
        onClick={() => setStep('tour')}
        className="w-full px-6 py-4 bg-sunny-yellow hover:bg-yellow-400 text-deep-navy font-black text-xl rounded-2xl transition-all flex items-center justify-center gap-2 shadow-[0_6px_0_0_rgba(234,179,8,0.3)] hover:translate-y-[-2px] active:translate-y-[2px] active:shadow-none"
      >
        I Love It!
        <Check size={28} />
      </button>
    </div>
  );

  const renderTourStep = () => (
    <div className="animate-in fade-in slide-in-from-right-8 duration-300">
        <h2 className="text-3xl font-display font-black text-deep-navy mb-6 text-center">Your Adventure Awaits!</h2>
        
        <div className="grid grid-cols-1 gap-4 mb-8">
            <div className="bg-sky-50 rounded-2xl p-4 flex items-center gap-4 border-2 border-sky-100">
                <div className="w-16 h-16 shrink-0 relative">
                     <ChessPieceCharacter piece="pawn" size={60} />
                </div>
                <div>
                    <h3 className="font-black text-deep-navy text-lg">Adventure Map</h3>
                    <p className="text-sm text-zinc-600 leading-tight">Travel through the kingdom and learn chess secrets with bite-sized lessons!</p>
                </div>
            </div>

            <div className="bg-emerald-50 rounded-2xl p-4 flex items-center gap-4 border-2 border-emerald-100">
                <div className="w-16 h-16 shrink-0 relative flex items-center justify-center">
                    <Swords className="text-emerald-500 w-10 h-10" />
                </div>
                <div>
                    <h3 className="font-black text-deep-navy text-lg">Bot Battles</h3>
                    <p className="text-sm text-zinc-600 leading-tight">Practice what you learned against friendly robot coaches!</p>
                </div>
            </div>
        </div>

      <button
        onClick={() => setStep('ready')}
        className="w-full px-6 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xl rounded-2xl transition-all flex items-center justify-center gap-2 shadow-[0_6px_0_0_rgba(16,185,129,0.3)] hover:translate-y-[-2px] active:translate-y-[2px] active:shadow-none"
      >
        Cool!
        <ArrowRight size={28} />
      </button>
    </div>
  );

  const renderReadyStep = () => (
    <div className="text-center animate-in fade-in zoom-in duration-500">
       <div className="flex justify-center mb-6 relative">
          <div className="absolute inset-0 bg-yellow-400/20 blur-3xl rounded-full animate-pulse"></div>
          <Mascot size={180} className="relative z-10" />
       </div>
      <h2 className="text-4xl font-display font-black text-deep-navy mb-4">
        Ready, Set, Chess!
      </h2>
      <p className="text-xl text-zinc-600 font-sans mb-8">
        Good luck, <span className="font-black text-sky-600 bg-sky-100 px-2 py-1 rounded-lg">{username}</span>!
        <br/>
        Show them what you've got!
      </p>

      <button
        onClick={handleComplete}
        className="w-full px-6 py-4 bg-gradient-to-r from-sky-400 to-indigo-500 hover:from-sky-300 hover:to-indigo-400 text-white font-black text-2xl rounded-2xl transition-all flex items-center justify-center gap-3 shadow-[0_6px_0_0_rgba(79,70,229,0.3)] hover:scale-[1.02] hover:translate-y-[-2px] active:translate-y-[2px] active:shadow-none"
      >
        Play Chess!
        <div className="bg-[#243354]/20 p-2 rounded-full">
            <ArrowRight size={24} />
        </div>
      </button>
    </div>
  );

  return (
    <div 
        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 transition-all duration-500"
    >
      <div className="bg-soft-white rounded-[2rem] border-4 border-white max-w-lg w-full p-8 shadow-2xl relative overflow-hidden">
        {/* Background blobs for fun */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-200/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

        {/* Progress Dots (only if not final step) */}
        {step !== 'ready' && step !== 'welcome' && (
            <div className="flex justify-center gap-2 mb-8">
                <div className={`w-3 h-3 rounded-full transition-colors ${step === 'username' ? 'bg-sky-500' : 'bg-slate-200'}`}></div>
                <div className={`w-3 h-3 rounded-full transition-colors ${step === 'tour' ? 'bg-sky-500' : 'bg-slate-200'}`}></div>
            </div>
        )}

        <div className="relative z-10">
            {step === 'welcome' && renderWelcomeStep()}
            {step === 'username' && renderUsernameStep()}
            {step === 'tour' && renderTourStep()}
            {step === 'ready' && renderReadyStep()}
        </div>
      </div>
    </div>
  );
}
