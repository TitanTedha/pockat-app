import Link from "next/link";

export default function Home() {
  return (
    // Fixed wrapper padding and removed mb-24 on desktop
    <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 mt-8 md:mt-16 mb-24 md:mb-10">
      
      {/* Hero Section */}
      <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-6">
        
        {/* Converted to inline-block so it never warps */}
        <div className="inline-block bg-rose-100 text-rose-500 px-4 py-1.5 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest shadow-sm">
          ✨ Powered by Kitty
        </div>
        
        {/* Scaled text: 4xl on phones, 5xl on tablets, 6xl on desktops */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-amber-900 max-w-3xl leading-tight">
          Feed your wallet. <br className="hidden md:block" />
          <span className="text-amber-500">Save treats.</span> Climb the tower!
        </h1>
        
        <p className="text-amber-800/70 max-w-2xl text-base md:text-lg font-medium leading-relaxed">
          Pockat turns boring budgets into a cozy cat game! Sort spending into cute categories, battle friends on the savings leaderboard, and collect paw badges when you hoard more coins. 🪙
        </p>
        
        {/* Call to Action Buttons - Stacks on mobile, side-by-side on desktop */}
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 w-full sm:w-auto pt-4">
          <Link 
            href="/recording" 
            className="w-full sm:w-auto text-center bg-gradient-to-b from-amber-300 to-amber-500 text-amber-950 font-black py-3.5 px-8 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
          >
            Start Your Quest! 🌟
          </Link>
          <Link 
            href="/leaderboard" 
            className="w-full sm:w-auto text-center bg-white border-2 border-amber-100 text-amber-800 font-bold py-3.5 px-8 rounded-full shadow-sm hover:bg-amber-50 active:bg-amber-100 active:scale-95 transition-all duration-200"
          >
            Cat Tower 🗼
          </Link>
        </div>
      </div>

      {/* Feature Cards Grid - 1 col (phone) -> 2 cols (tablet) -> 4 cols (desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mt-16 md:mt-24 max-w-5xl w-full">
        <FeatureCard icon="🏷️" title="Custom Tags" desc="Shopping, food, travel & more — create your own treat categories!" />
        <FeatureCard icon="📊" title="Kitty Dashboard" desc="See where your coins go and how many treats you're saving!" />
        <FeatureCard icon="🗼" title="Cat Tower Rank" desc="Climb the leaderboard — top savers get the crown! 👑" />
        <FeatureCard icon="🏅" title="Paw Badges" desc="Unlock cute badges from First Step to Golden Cat!" />
      </div>

    </div>
  );
}

// Helper component for the feature cards
function FeatureCard({ icon, title, desc }: { icon: string, title: string, desc: string }) {
  return (
    // Added h-full so cards in the same row stay the exact same height
    <div className="bg-[#FFFDF7] border-2 border-amber-100 p-6 rounded-3xl shadow-sm text-left hover:shadow-md transition-shadow h-full flex flex-col">
      <div className="bg-amber-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-2xl shadow-sm shrink-0">
        {icon}
      </div>
      <h3 className="font-extrabold text-amber-950 mb-2">{title}</h3>
      <p className="text-sm font-medium text-amber-800/70 leading-relaxed flex-1">{desc}</p>
    </div>
  );
}
