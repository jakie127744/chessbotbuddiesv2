import { Inter, Lexend } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const lexend = Lexend({ subsets: ['latin'], variable: '--font-lexend' });

export const metadata = {
  title: 'ChessBotBuddies',
  description: 'A simpler, more uniform chess experience.',
};

export default function RedesignLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${lexend.variable}`}>
      <body className="font-sans antialiased text-[var(--text-secondary)] bg-[var(--background)]">
        {children}
      </body>
    </html>
  );
}
