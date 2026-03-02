
import React from 'react';
import DOMPurify from 'dompurify';
import { 
  MessageCircle, Lightbulb, BookOpen, Target, GraduationCap, Sparkles, User, Crown, Swords, Trophy, AlertTriangle, TrendingDown 
} from 'lucide-react';
import { CommentaryMeta, CommentaryIntent } from '@/lib/commentary-pipeline';

// Union of legacy local types and the pipeline's CommentaryIntent
export interface Commentary {
  type: CommentaryIntent | 'opening' | 'tactics' | 'positional' | 'endgame' | 'general' | 'praise' | 'novelty' | 'intro' | 'castling' | 'mate' | 'gameEnd';
  text: string;
  timestamp: string;
  meta?: CommentaryMeta;
}

interface CoachMessageDisplayProps {
  comment: Commentary | null;
  isThinking: boolean;
  coachName: string;
  variant?: 'default' | 'bubble';
}

export function CoachMessageDisplay({ comment, isThinking, coachName, variant = 'default' }: CoachMessageDisplayProps) {
  
  const getIcon = (type: Commentary['type']) => {
    switch (type) {
      // Legacy & Shared
      case 'opening': 
      case 'OpeningTheory':
        return <BookOpen size={20} className="text-blue-400" />;
        
      case 'tactics': 
      case 'WinningTactic':
        return <Target size={20} className="text-red-400" />;
        
      case 'positional': 
      case 'GoodMove':
        return <Lightbulb size={20} className="text-yellow-400" />;
        
      case 'endgame': 
        return <GraduationCap size={20} className="text-purple-400" />;
        
      case 'novelty': 
      case 'Novelty':
        return <Sparkles size={20} className="text-orange-400" />;
        
      case 'praise': 
        return <Sparkles size={20} className="text-emerald-400" />;
        
      case 'intro': 
        return <User size={20} className="text-cyan-400" />;
        
      case 'castling': 
      case 'KingSafety':
        return <Swords size={20} className="text-sky-400" />;
        
      case 'mate': 
      case 'CheckmateThreat':
        return <Crown size={20} className="text-amber-400" />;
        
      case 'gameEnd': 
      case 'GameEnd':
        return <Trophy size={20} className="text-yellow-400" />;

      // New Intents
      case 'Blunder':
      case 'HangingPiece':
      case 'MissedTactic':
        return <AlertTriangle size={20} className="text-red-500" />;
        
      case 'OpeningMistake':
      case 'EndgameMistake':
      case 'StrategicMistake':
        return <TrendingDown size={20} className="text-orange-400" />;
      
      case 'EducationalTip':
        return <GraduationCap size={20} className="text-blue-300" />;

      default: return <MessageCircle size={20} className="text-green-400" />;
    }
  };

  const getTypeLabel = (type: Commentary['type']) => {
    switch(type) {
        case 'general': 
        case 'Neutral': return 'Coach says...';
        case 'novelty': 
        case 'Novelty': return 'Novelty!';
        case 'praise': 
        case 'GoodMove': return 'Well done!';
        case 'intro': return 'Hello!';
        case 'castling': 
        case 'KingSafety': return 'King Safety!';
        case 'mate': 
        case 'CheckmateThreat': return 'Checkmate Alert!';
        case 'gameEnd': 
        case 'GameEnd': return 'Game Over!';
        case 'Blunder': return 'Blunder Alert';
        case 'HangingPiece': return 'Hanging Piece';
        case 'MissedTactic': return 'Missed Opportunity';
        case 'WinningTactic': return 'Tactic Found';
        case 'OpeningMistake': return 'Opening Mistake';
        case 'OpeningTheory': return 'Theory';
        case 'EducationalTip': return 'Lesson';
        default: return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  const getBorderColor = (type: Commentary['type']) => {
    switch (type) {
      case 'opening': 
      case 'OpeningTheory': return 'border-blue-500/50';
      
      case 'tactics': 
      case 'WinningTactic': return 'border-red-500/50';
      
      case 'positional': 
      case 'GoodMove': return 'border-yellow-500/50';
      
      case 'endgame': return 'border-purple-500/50';
      
      case 'novelty': 
      case 'Novelty': return 'border-orange-500/50';
      
      case 'praise': return 'border-emerald-500/50';
      
      case 'intro': return 'border-cyan-500/50';
      
      case 'castling': 
      case 'KingSafety': return 'border-sky-500/50';
      
      case 'mate': 
      case 'CheckmateThreat': return 'border-amber-500/50';
      
      case 'gameEnd': 
      case 'GameEnd': return 'border-yellow-500/50';
      
      case 'Blunder':
      case 'HangingPiece':
      case 'MissedTactic': return 'border-red-600/70';

      case 'OpeningMistake':
      case 'EndgameMistake':
      case 'StrategicMistake': return 'border-orange-500/50';
      
      case 'EducationalTip': return 'border-blue-400/50';

      default: return 'border-slate-600/50';
    }
  };

  if (variant === 'bubble') {
      return (
         <div className="relative animate-in fade-in zoom-in-95 duration-300">
             {/* Speech Bubble Tail */}
             <div className="absolute top-4 -left-2 w-4 h-4 bg-white transform rotate-45 border-l border-b border-gray-200"></div>

             <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4 text-slate-800">
                 {comment ? (
                     <div>
                         <div className="flex items-center justify-between mb-1">
                             <div className="flex items-center gap-2">
                                 {getIcon(comment.type)}
                                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                     {getTypeLabel(comment.type)}
                                 </span>
                             </div>
                         </div>
                         <p className="text-sm font-medium leading-relaxed"
                            dangerouslySetInnerHTML={{ 
                                __html: DOMPurify.sanitize(comment.text.replace(/\*\*(.*?)\*\*/g, '<span class="font-bold text-black">$1</span>')) 
                            }}
                         />
                     </div>
                 ) : (
                     <div className="flex items-center gap-2 text-slate-400 text-sm italic">
                         <span className="animate-pulse">Analyzing...</span>
                     </div>
                 )}
             </div>
         </div>
      );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800/50">
      
      {/* Background Decoration */}
      <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
         <MessageCircle size={120} />
      </div>

      {comment ? (
        <div className={`relative w-full bg-slate-800/90 rounded-2xl p-5 border-2 ${getBorderColor(comment.type)} shadow-2xl animate-in zoom-in-95 fade-in duration-300`}>
          {/* Speech Bubble Tail */}
          <div className="absolute -top-3 left-8 w-4 h-4 bg-slate-800 border-t-2 border-l-2 border-inherit transform rotate-45"></div>

          <div className="flex items-center gap-2 mb-3 border-b border-slate-700/50 pb-2">
            {getIcon(comment.type)}
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {getTypeLabel(comment.type)}
            </span>
          </div>
          
          <p className="text-base text-slate-100 font-medium leading-relaxed"
            dangerouslySetInnerHTML={{ 
              __html: DOMPurify.sanitize(comment.text.replace(/\*\*(.*?)\*\*/g, '<span class="text-white font-bold">$1</span>')) 
            }}
          />
          
          <div className="mt-3 text-right">
            <span className="text-[10px] text-slate-600 font-mono opacity-70">
              {comment.timestamp}
            </span>
          </div>
        </div>
      ) : isThinking ? (
         <div className="text-center opacity-80 animate-pulse">
           <div className="flex flex-col items-center gap-2">
             <span className="text-sm font-medium text-slate-300">{coachName} is thinking...</span>
             <div className="flex gap-1">
               <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
               <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
               <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
             </div>
           </div>
         </div>
      ) : (
        <div className="text-center opacity-40">
          <div className="animate-pulse flex flex-col items-center gap-3">
            <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
            <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
            <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
          </div>
          <p className="mt-4 text-xs font-mono text-slate-500">Watching game...</p>
        </div>
      )}
    </div>
  );
}
