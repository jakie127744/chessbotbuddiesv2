import { 
  Target, Book, Brain, CheckCircle, AlertCircle, X,
  Crown, Shield, Castle, Swords, Flame, Snowflake, Anchor, Gem, Feather, Wind, Zap, Skull, Ghost, Landmark, Box, Hash, Search,
  Scale as ScaleIcon, Axe as AxeIcon, Hand as HandIcon, Tornado as TornadoIcon, Gift as GiftIcon, Scroll as ScrollIcon
} from 'lucide-react';

export interface OpeningWiki {
    history: string;
    style: string;
    description_long: string;
    famous_players: string[];
}

export interface OpeningMeta {
    name: string;
    icon: React.ReactNode;
    description: string;
    color: 'w' | 'b';
    wiki?: OpeningWiki;
}

export const OPENING_METADATA: Record<string, OpeningMeta> = {
  // White Repertoire - Open Games
  'ruy-lopez': { 
      name: 'Ruy Lopez', 
      icon: <Castle className="text-amber-500" />, 
      description: 'The Spanish Game', 
      color: 'w',
      wiki: {
          history: "The Ruy Lopez is named after 16th-century Spanish priest Ruy López de Segura. It is one of the oldest and most analyzed chess openings. In his 1561 book, Libro de la invención liberal y arte del juego del axedrez, López described this as a 'game of strategic justice'. It has been a staple of World Championship matches for centuries.",
          style: "Strategic, positional, and rich in possibilities. White focuses on long-term pressure on Black's center and kingside, often preparing a slow buildup before breaking open the position.",
          description_long: "The Ruy Lopez (1.e4 e5 2.Nf3 Nc6 3.Bb5) characterizes classical chess. By developing the bishop to b5, White puts indirect pressure on e5 and prepares to castle. Black has numerous defenses, ranging from the solid Berlin to the sharp Marshall Attack.",
          famous_players: ["Bobby Fischer", "Anatoly Karpov", "Garry Kasparov", "Magnus Carlsen"]
      } 
  },
  'italian-game': { 
      name: 'Italian Game', 
      icon: <Landmark className="text-amber-500" />, 
      description: 'Giuoco Piano lines', 
      color: 'w',
      wiki: {
          history: "The Italian Game (1.e4 e5 2.Nf3 Nc6 3.Bc4) is perhaps the oldest recorded chess opening. Developed by Italian masters in the 16th century like Greco and Polerio, it was the weapon of choice for Romantics who sought quick tactical kills.",
          style: "Traditionally tactical and open, modern interpretations (Giuoco Piano) are slower and more maneuvering, focusing on central control with c3 and d3.",
          description_long: "The Italian Game places the bishop on c4 to eye the weak f7 square. Unlike the Ruy Lopez, it does not immediately pressure the knight, allowing for more fluid piece play. It is a favorite of both beginners for its logic and super-GMs for its subtle nuances.",
          famous_players: ["Gioachino Greco", "Paul Morphy", "Wesley So"]
      }
  },
  'scotch-game': { 
      name: 'Scotch Game', 
      icon: <Swords className="text-amber-500" />, 
      description: 'Open center play', 
      color: 'w',
      wiki: {
          history: "The Scotch Game (1.e4 e5 2.Nf3 Nc6 3.d4) gets its name from a correspondence match between Edinburgh and London in 1824. It was revived in the 20th century by Garry Kasparov, who used it to surprise Karpov in their World Championship matches.",
          style: "Tactical and open. White immediately blasts open the center, avoiding the slow maneuvering of the Ruy Lopez or Italian. It leads to improved endgames for White if Black isn't careful.",
          description_long: "By playing 3.d4, White forces immediate action. Black must release the center, often leading to positions where White has a space advantage and active piece play.",
          famous_players: ["Garry Kasparov", "Magnus Carlsen", "Jan Nepomniachtchi"]
      } 
  },
  'vienna-game': { 
      name: 'Vienna Game', 
      icon: <Gem className="text-amber-500" />, 
      description: 'Positional & sharp', 
      color: 'w',
      wiki: {
          history: "The Vienna Game (1.e4 e5 2.Nc3) was popularized in the late 19th century by masters like Carl Hamppe in Vienna. It was designed as an improved King's Gambit.",
          style: "Flexible. Can be quiet and positional (like the Four Knights) or exceedingly sharp (Vienna Gambit). White keeps the f-pawn unblocked to attack the Kingside later.",
          description_long: "Instead of the immediate 2.Nf3, White plays 2.Nc3 to defend e4 and control d5, while reserving the option to push f4. It is a favorite of club players for its surprise value.",
          famous_players: ["Wilhelm Steinitz", "Bent Larsen", "Hikaru Nakamura"]
      }
  },
  'kings-gambit': { 
      name: "King's Gambit", 
      icon: <Crown className="text-red-500" />, 
      description: 'Romantic & aggressive', 
      color: 'w',
      wiki: {
          history: "The King's Gambit (1.e4 e5 2.f4) was the dominant opening of the Romantic Era (19th century). The 'Immortal Game' Anderssen vs. Kieseritsky features this opening.",
          style: "Hyper-aggressive. White sacrifices the f-pawn to deflect Black's e-pawn, aiming to build a massive center and attack the weak f7 square.",
          description_long: "Risky but rewarding. If Black accepts the gambit, White gets rapid development. Modern engines have shown it's playable but objectively equal/slight disadvantage, yet it remains a deadly weapon in human play.",
          famous_players: ["Adolf Anderssen", "Paul Morphy", "Boris Spassky", "Ian Nepomniachtchi"]
      }
  },
  
  // White Repertoire - Closed & Flank
  'queens-gambit': { 
      name: "Queen's Gambit", 
      icon: <Crown className="text-emerald-500" />, 
      description: 'Classic d4 control', 
      color: 'w',
      wiki: {
          history: "The Queen's Gambit (1.d4 d5 2.c4) is one of the oldest known openings, mentioned in the Göttingen manuscript of 1490. It became the dominant opening in the 1927 World Championship between Alekhine and Capablanca (playing 32/34 games!).",
          style: "Ideally, White sacrifices a wing pawn to gain better control of the center. It leads to solid, strategic positions where White often enjoys a space advantage.",
          description_long: "By playing c4, White attacks d5 from the flank. It is not a true gambit since Black cannot hold the pawn easily. It is the gold standard of positional chess.",
          famous_players: ["Alexander Alekhine", "Tigran Petrosian", "Levon Aronian"]
      }
  },
  'london': { 
      name: 'London System', 
      icon: <Gem className="text-emerald-500" />, 
      description: 'Solid system for White', 
      color: 'w',
      wiki: {
          history: "The London System (1.d4 and 2.Bf4) was once considered 'old-fashioned', played in the London 1922 tournament. It saw a massive resurgence in the 2010s thanks to World Champion Magnus Carlsen and Kamsky.",
          style: "Solid, system-based, and low-theory. White sets up a pyramid pawn structure (d4-e3-c3) and develops pieces to natural squares, ignoring Black's setup initially.",
          description_long: "The London is known as 'the system for busy people' because you can play the same first 5-6 moves against almost anything. However, playing it well requires deep positional understanding to convert small advantages.",
          famous_players: ["Gata Kamsky", "Magnus Carlsen", "Ding Liren"]
      } 
  },
  'catalan': { 
      name: 'Catalan', 
      icon: <Feather className="text-emerald-500" />, 
      description: 'Positional squeeze', 
      color: 'w',
      wiki: {
          history: "Named after the region of Catalonia, specifically from the 1929 Barcelona tournament. It became a favorite of World Champions like Smyslov, Karpov, and Kramnik.",
          style: "Positional squeeze. White combines the Queen's Gambit (d4+c4) with a King's Fianchetto (g3+Bg2), exerting immense pressure on the long diagonal.",
          description_long: "The Catalan is considered one of the most 'professional' openings. White aims for a tiny, lasting advantage. It is incredibly hard for Black to equalize completely without precise knowledge.",
          famous_players: ["Vladimir Kramnik", "Anatoly Karpov", "Ding Liren"]
      }
  },
  'english': { 
      name: 'English', 
      icon: <Wind className="text-blue-500" />, 
      description: 'Flank opening 1.c4', 
      color: 'w',
      wiki: {
          history: "Named after the English unofficial World Champion Howard Staunton, who played it in his 1843 match against Saint-Amant.",
          style: "Flexible and transpositional. White controls the center from the flank (c4) and often fianchettoes the king's bishop. It can transpose into d4 openings or remain independent.",
          description_long: "A hypermodern approach where White delays occupying the center with pawns. The game often resembles a 'Reserved Sicilian' structure. It appeals to players who prefer understanding plans over memorizing lines.",
          famous_players: ["Howard Staunton", "Botvinnik", "Garry Kasparov"]
      }
  },
  'reti': { 
      name: 'Reti', 
      icon: <Zap className="text-blue-500" />, 
      description: 'Hypermodern 1.Nf3', 
      color: 'w',
      wiki: {
          history: "Named after Richard Réti, a founder of Hypermodernism. He famously used it to defeat Capablanca in New York 1924, ending Capablanca's 8-year undefeated streak.",
          style: "Hypermodern control. White controls the center with pieces (Nf3) rather than pawns, often followed by g3 and b3 fianchettos.",
          description_long: "If you like flexibility, the Reti is perfect. It can transpose into the English, Catalan, or King's Indian Attack. White asks Black to commit to a central setup before deciding how to attack it.",
          famous_players: ["Richard Réti", "Vladimir Kramnik", "Levon Aronian"]
      }
  },

  // Black Repertoire - Semi-Open
  'sicilian': { 
      name: 'Sicilian Defense', 
      icon: <Swords className="text-purple-500" />, 
      description: 'Fighting response to 1.e4', 
      color: 'b',
      wiki: {
          history: "The Sicilian Defense (1.e4 c5) dates back to the late 16th century. It was initially considered inferior until the mid-20th century when players like Boleslavsky and Tal showed its dynamic potential.",
          style: "Asymmetrical and combative. Black immediately imbalances the position, trading a flank pawn (c-pawn) for White's central d-pawn, often leading to sharp tactical battles.",
          description_long: "The Sicilian is the most popular and best-scoring response to 1.e4. It prevents White from easily establishing a dual pawn center and offers Black long-term chances on the queenside.",
          famous_players: ["Mikhail Tal", "Garry Kasparov", "Maxime Vachier-Lagrave"]
      }
  },
  'french': { 
      name: 'French Defense', 
      icon: <Shield className="text-blue-500" />, 
      description: 'Solid & resilient', 
      color: 'b',
      wiki: {
          history: "Named after a match between Paris and London in 1834. The French Defense (1.e4 e6) has a reputation for solidity and resilience, favored by positional masters like Botvinnik and Petrosian.",
          style: "Counter-attacking from a solid base. Black locks the center early (usually d5 vs e5) and attacks White's pawn chain at the base (with c5) and the front (with f6).",
          description_long: "The French is tough to crack. Black accepts a cramped position and a 'bad' light-squared bishop in exchange for a super-solid structure. The game often revolves around whether White's attack on the kingside crashes through before Black's queenside counterplay arrives.",
          famous_players: ["Mikhail Botvinnik", "Tigran Petrosian", "Viktor Korchnoi"]
      }
  },
  'caro-kann': { 
      name: 'Caro-Kann', 
      icon: <Box className="text-blue-500" />, 
      description: 'Solid structure c6-d5', 
      color: 'b',
      wiki: {
          history: "Named after Horatio Caro and Marcus Kann who analyzed it in 1886. It rose to prominence when Capablanca used it as his main weapon, proving its rock-solid nature.",
          style: "Extremely solid and logical. Similar to the French but the light-squared bishop is not trapped. Black aims for a safe, healthy endgame structure.",
          description_long: "The Caro-Kann (1.e4 c6) is arguably the most solid response to e4. Black supports the d5 advance with a flank pawn. It frustrates attacking players because it offers few weaknesses to target.",
          famous_players: ["Anatoly Karpov", "José Raúl Capablanca", "Viswanathan Anand"]
      }
  },
  'pirc': { 
      name: 'Pirc Defense', 
      icon: <Ghost className="text-purple-500" />, 
      description: 'Modern counterattack', 
      color: 'b',
      wiki: {
          history: "Named after Slovenian Grandmaster Vasja Pirc. It was considered incorrect in the classical era but gained acceptance as a 'Hypermodern' defense.",
          style: "Provocative. Black allows White to occupy the center with e4 and d4, intending to undermine it piece play and flank breaks.",
          description_long: "The Pirc (1.e4 d6 2.d4 Nf6) is for players who want to win with Black and avoid drawish simplifications. It leads to sharp, double-edged positions where one slip can be fatal for either side.",
          famous_players: ["Vasja Pirc", "Veselin Topalov", "Alexander Grischuk"]
      }
  },
  'modern': { 
      name: 'Modern Defense', 
      icon: <Hash className="text-purple-500" />, 
      description: 'Flexible & dynamic', 
      color: 'b',
      wiki: {
          history: "A close cousin of the Pirc, often called the Robatsch Defense. It gained traction in the 1960s/70s as players sought to avoid theory.",
          style: "Hyper-flexible. Black plays 1...g6 and fianchettoes the bishop without committing the knight to f6 early. This allows Black to strike at the center with e5, c5, or even d5 later.",
          description_long: "The Modern is a 'wait-and-give' opening. Black gives White the full center and waits for White to overextend. It is tricky and perfect for players who like offbeat positions.",
          famous_players: ["Duncan Suttles", "Tiger Hillarp Persson"]
      }
  },
  'scandinavian': { 
      name: 'Scandinavian', 
      icon: <Snowflake className="text-blue-500" />, 
      description: 'Immediate center challenge', 
      color: 'b',
      wiki: {
          history: "Found in a manuscript from 1475, making it potentially the oldest opening. It was analyzed by Scandinavian masters in the late 19th century.",
          style: "Direct and forcing. Black plays 1...d5 immediately, forcing a trade or a reaction. It simplifies the position early but leaves White with a slight space advantage.",
          description_long: "If you hate memorizing e4 theory, play the 'Scandi'. You force the game into your territory immediately. It is solid, though White gets time to develop attacking pieces while chasing Black's Queen.",
          famous_players: ["Bent Larsen", "Magnus Carlsen"]
      }
  },
  'alehkine': { 
      name: "Alekhine's", 
      icon: <TornadoIcon className="text-purple-500" />, 
      description: 'Provocative knight play', 
      color: 'b',
      wiki: {
          history: "Introduced by Alexander Alekhine in Budapest 1921. It stunned the chess world by defying the classical rule 'don't move the same piece twice in the opening'.",
          style: "Provocative lure. Black plays 1...Nf6 to tempt White's pawns forward (e5, c4, d4). The goal is to prove these advanced pawns are weak, not strong.",
          description_long: "Alekhine's Defense is high-risk, high-reward. If White plays carefully, they keep a space advantage. If they overextend, their center collapses. It's excellent for psychological warfare.",
          famous_players: ["Alexander Alekhine", "Vassily Ivanchuk", "Hikaru Nakamura"]
      }
  },

  // Black Repertoire - Closed
  'kings-indian': { 
      name: "King's Indian", 
      icon: <AxeIcon className="text-orange-500" />, 
      description: 'Aggressive counterattack', 
      color: 'b',
      wiki: {
          history: "The King's Indian Defense (KID) became popular in the 1950s thanks to Soviet giants like Bronstein and Geller. Fischer and Kasparov later turned it into a fearsome weapon.",
          style: "Hypermodern and tactical. Black allows White to build a massive center, only to attack it later with pawn breaks (e5 or c5) and direct pieces at the White king.",
          description_long: "In the KID, Black fianchettoes the king's bishop and castles short. It is risky but offers excellent winning chances for Black against 1.d4, avoiding drawish simplifications.",
          famous_players: ["Bobby Fischer", "Garry Kasparov", "Hikaru Nakamura"]
      }
  },
  'nimzo-indian': { 
      name: 'Nimzo-Indian', 
      icon: <HandIcon className="text-orange-500" />, 
      description: 'Control over e4', 
      color: 'b',
      wiki: {
          history: "Developed by Aaron Nimzowitsch, who introduced the concept of controlling the center with pieces instead of pawns. It revolutionized chess strategy in the 1920s.",
          style: "Hyper-solid and strategic. Black pins the c3 knight (1.d4 Nf6 2.c4 e6 3.Nc3 Bb4), preventing White from playing e4 freely.",
          description_long: "The Nimzo-Indian is statistically one of the best scoring defenses against 1.d4. It unbalances the position (doubled pawns for White) without taking excessive risks. It often leads to nuanced positional battles.",
          famous_players: ["Aron Nimzowitsch", "Anatoly Karpov", "Viswanathan Anand"]
      }
   },
  'grunfeld': { 
      name: 'Grünfeld', 
      icon: <Target className="text-green-500" />, 
      description: 'Active piece play', 
      color: 'b',
      wiki: {
          history: "Introduced by Ernst Grünfeld in the 1920s. It became a favorite of World Champions who liked sharp, theoretical battles, like Kasparov and Svidler.",
          style: "Dynamic. Black allows White a huge pawn center (d4+c4+e4) and then attacks it immediately with moves like ...d5 and ...c5.",
          description_long: "The Grünfeld requires precise knowledge. If Black does not know the theory, they get crushed by White's center. If they do, they get amazing active piece play. It is a very 'modern' opening.",
          famous_players: ["Garry Kasparov", "Peter Svidler", "Maxime Vachier-Lagrave"]
      }
  },
  'benoni': { 
      name: 'Benoni', 
      icon: <TornadoIcon className="text-red-500" />, 
      description: 'Chaos & imbalance', 
      color: 'b',
      wiki: {
          history: "Benoni means 'Son of Sorrow' in Hebrew. The Modern Benoni surfaced in the mid-20th century as a way to unbalance the game instantly against d4.",
          style: "Sharp and unbalanced. Black creates a Queenside pawn majority and uses the fianchettoed bishop to pressure the long diagonal, while White attacks in the center.",
          description_long: "The Benoni (1.d4 Nf6 2.c4 c5 3.d5) is for players who want to fight. White has a space advantage, but Black has active piece play and clear plans. It is risky but avoids boring draws.",
          famous_players: ["Mikhail Tal", "Vugar Gashimov", "Levon Aronian"]
      } 
  },
  'benko': { 
      name: 'Benko Gambit', 
      icon: <GiftIcon className="text-pink-500" />, 
      description: 'Long-term pressure', 
      color: 'b',
      wiki: {
          history: "Popularized by Pal Benko in the 1960s/70s. It is a rare 'positional gambit' where Black sacrifices a pawn not for an attack, but for long-term pressure.",
          style: "Positional pressure. Black gives up the b-pawn to open the a and b files for their rooks. Even in the endgame, Black's activity often compensates for the material.",
          description_long: "In the Benko (1.d4 Nf6 2.c4 c5 3.d5 b5), Black bets that files are worth more than pawns. It is annoying for White to play against because the pressure on the queenside never stops.",
          famous_players: ["Pal Benko", "Veselin Topalov"]
      }
  },
  'dutch': { 
      name: 'Dutch Defense', 
      icon: <Anchor className="text-cyan-500" />, 
      description: 'Aggressive f5', 
      color: 'b',
      wiki: {
          history: "Recommended by Elias Stein in 1789 as a way to combat 1.d4. It gained a reputation for being risky but was occasionally used by Botvinnik and Carlsen.",
          style: "Asymmetrical. By playing 1...f5, Black prevents e4 and looks to attack on the kingside. It leads to blocked, complicated positions.",
          description_long: "The Dutch is the mirror image of the Sicilian, but against d4 and with higher risk (weakening the king). The 'Leningrad' variation is particularly sharp, while the 'Stonewall' is a tough nut to crack.",
          famous_players: ["Mikhail Botvinnik", "Hikaru Nakamura", "Magnus Carlsen"]
      }
  },
  'bogo-indian': { 
      name: 'Bogo-Indian', 
      icon: <ScrollIcon className="text-orange-500" />, 
      description: 'Solid Indian line', 
      color: 'b',
      wiki: {
          history: "Named after Efim Bogoljubov. It serves as a solid alternative to the King's Indian or Queen's Indian defenses.",
          style: "Solid and simplifying. Black plays 3...Bb4+ to force piece exchanges and relieve pressure. It is less ambitious than the Nimzo but safer.",
          description_long: "The Bogo-Indian is a pragmatic choice. Black solves the problem of their development quickly. It is often used when a draw is a satisfactory result or to avoid heavy theory.",
          famous_players: ["Efim Bogoljubov", "Andersson", "Rustam Kasimdzhanov"]
      }
  },
};
