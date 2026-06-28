import './globals.css'
import Link from 'next/link'

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
      <body className="text-amber-950 font-sans min-h-screen flex flex-col bg-gray-50/30">
        
        {/* Top Navigation Bar (Shared) */}
        <nav className="bg-[#FFFDF7] border-b border-amber-100 px-4 md:px-8 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
          <div className="flex items-center gap-2 font-black text-xl text-amber-600">
            🐱 Pockat ✨
          </div>
          
          {/* Desktop Links (Hidden on Mobile) */}
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-amber-800/60">
            <Link href="/" className="hover:text-amber-500 transition-colors">🏠 Home</Link>
            <Link href="/dashboard" className="hover:text-amber-500 transition-colors">📊 Dashboard</Link>
            <Link href="/recording" className="hover:text-amber-500 transition-colors">📝 Recording</Link>
            <Link href="/categories" className="hover:text-amber-500 transition-colors">🏷️ Tags</Link>
            <Link href="/leaderboard" className="hover:text-amber-500 transition-colors">🗼 Tower</Link>
            <Link href="/profile" className="hover:text-amber-500 transition-colors">🐱 Profile</Link>
          </div>

          {/* Sign Out (Visible on Both) */}
          <div>
            <Link href="/api/auth/signout" className="bg-red-100 hover:bg-red-200 text-red-800 font-bold py-2 px-4 md:px-6 rounded-full shadow-sm transition-colors text-xs md:text-sm whitespace-nowrap">
              🚪 Bye! 👋
            </Link>
          </div>
        </nav>

        {/* Page Content Container */}
        <main className="flex-1 w-full mx-auto pb-24 md:pb-0">
          {children}
        </main>

        {/* Mobile Bottom Navigation Bar (Hidden on Desktop) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#FFFDF7] border-t-2 border-amber-100 flex justify-around items-center px-2 py-3 z-50 shadow-[0_-4px_10px_-2px_rgba(0,0,0,0.05)]">
          <Link href="/" className="group flex flex-col items-center gap-1 text-[10px] font-bold text-amber-800/60 transition-all duration-200 active:scale-90 active:text-amber-500">
            <span className="text-xl group-active:-translate-y-1 transition-transform duration-200">🏠</span>
            Home
          </Link>
          
          <Link href="/dashboard" className="group flex flex-col items-center gap-1 text-[10px] font-bold text-amber-800/60 transition-all duration-200 active:scale-90 active:text-amber-500">
            <span className="text-xl group-active:-translate-y-1 transition-transform duration-200">📊</span>
            Dash
          </Link>

          {/* Record button updated to match the rest of the menu */}
          <Link href="/recording" className="group flex flex-col items-center gap-1 text-[10px] font-bold text-amber-800/60 transition-all duration-200 active:scale-90 active:text-amber-500">
            <span className="text-xl group-active:-translate-y-1 transition-transform duration-200">📝</span>
            Record
          </Link>

          <Link href="/categories" className="group flex flex-col items-center gap-1 text-[10px] font-bold text-amber-800/60 transition-all duration-200 active:scale-90 active:text-amber-500">
            <span className="text-xl group-active:-translate-y-1 transition-transform duration-200">🏷️</span>
            Tags
          </Link>

          <Link href="/leaderboard" className="group flex flex-col items-center gap-1 text-[10px] font-bold text-amber-800/60 transition-all duration-200 active:scale-90 active:text-amber-500">
            <span className="text-xl group-active:-translate-y-1 transition-transform duration-200">🗼</span>
            Tower
          </Link>
          
          <Link href="/profile" className="group flex flex-col items-center gap-1 text-[10px] font-bold text-amber-800/60 transition-all duration-200 active:scale-90 active:text-amber-500">
            <span className="text-xl group-active:-translate-y-1 transition-transform duration-200">🐱</span>
            Profile
          </Link>
        </nav>

      </body>
    </html>
  )
}
