import './globals.css'
import Link from 'next/link'
import { authOptions } from "/api/auth/[...nextauth]/route";

export const metadata = {
  title: 'Pockat ✨',
  description: 'Feed your wallet. Save treats.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="text-amber-950 font-sans min-h-screen flex flex-col">
        
        {/* Top Navigation Bar */}
        <nav className="bg-[#FFFDF7] border-b border-amber-100 px-8 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-2 font-black text-xl text-amber-600">
            🐱 Pockat ✨
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-amber-800/60">
            <Link href="/" className="hover:text-amber-500 transition-colors">🏠 Home</Link>
            <Link href="/dashboard" className="hover:text-amber-500 transition-colors">📊 Dashboard</Link>
            <Link href="/recording" className="hover:text-amber-500 transition-colors">📝 Recording</Link>
            <Link href="/categories" className="hover:text-amber-500 transition-colors">🏷️ Tags</Link>
            <Link href="/leaderboard" className="hover:text-amber-500 transition-colors">🗼 Tower</Link>
            <Link href="/profile" className="hover:text-amber-500 transition-colors">🐱 Profile</Link>
          </div>

          <div>
            <button className="text-sm font-bold text-amber-700/60 hover:text-amber-900 transition-colors">
              <Link href="/api/auth/signout" className="bg-red-100 hover:bg-red-200 text-red-800 font-bold py-2 px-6 rounded-full shadow-sm transition-colors text-sm">
                🚪 Bye! 👋
              </Link>
            </button>
          </div>
        </nav>

        {/* Page Content Container */}
        <main className="flex-1 w-full mx-auto">
          {children}
        </main>

      </body>
    </html>
  )
}
