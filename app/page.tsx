import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center text-center mt-16 px-6 gap-6">
      
      {/* Hero Section */}
      <span className="bg-rose-100 text-rose-500 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-sm">
        ✨ Kitty Quest Mode
      </span>
      
      <h1 className="text-5xl md:text-6xl font-extrabold text-amber-900 max-w-3xl leading-tight">
        Feed your wallet. <span className="text-amber-500">Save treats.</span> Climb the tower!
      </h1>
      
      <p className="text-amber-800/70 max-w-2xl text-lg font-medium">
        Pockat turns boring budgets into a cozy cat game! Sort spending into cute categories, battle friends on the savings leaderboard, and collect paw badges when you hoard more coins. 🪙
      </p>
      
      {/* Call to Action Buttons */}
      <div className="flex gap-4 mt-4">
        <Link 
          href="/recording" 
          className="bg-gradient-to-b from-amber-300 to-amber-500 text-amber-950 font-black py-3 px-8 rounded-full shadow-lg hover:scale-105 transition-transform"
        >
          Start Your Quest! 🌟
        </Link>
        <Link 
          href="/leaderboard" 
          className="bg-white border-2 border-amber-100 text-amber-800 font-bold py-3 px-8 rounded-full shadow-sm hover:bg-amber-50 transition-colors"
        >
          Cat Tower 🗼
        </Link>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-16 max-w-5xl w-full">
        <FeatureCard icon="🏷️" title="Custom Tags" desc="Shopping, snacks, travel & more — create your own treat categories!" />
        <FeatureCard icon="📊" title="Kitty Dashboard" desc="See where your coins go and how many treats you're saving!" />
        <FeatureCard icon="🗼" title="Cat Tower Rank" desc="Climb the leaderboard — top savers get the crown! 👑" />
        <FeatureCard icon="🏅" title="Paw Badges" desc="Unlock cute badges from Kitten Saver to Legend Cat!" />
      </div>

    </div>
  );
}

// Helper component for the feature cards
function FeatureCard({ icon, title, desc }: { icon: string, title: string, desc: string }) {
  return (
    <div className="bg-[#FFFDF7] border-2 border-amber-100 p-6 rounded-3xl shadow-sm text-left hover:shadow-md transition-shadow">
      <div className="bg-amber-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-2xl shadow-sm">
        {icon}
      </div>
      <h3 className="font-extrabold text-amber-950 mb-2">{title}</h3>
      <p className="text-sm font-medium text-amber-800/70 leading-relaxed">{desc}</p>
    </div>
  );
}