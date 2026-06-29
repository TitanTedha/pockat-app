import Link from "next/link";

export default function Home() {
  return (
    // We use your exact flex classes, but add a max-width limit, fluid padding, and a bottom margin for the mobile nav!
    <div className="flex flex-col items-center text-center mt-10 md:mt-16 mb-24 md:mb-12 px-4 sm:px-6 md:px-8 gap-6 max-w-5xl mx-auto w-full animate-fadeIn">
      
      {/* Hero Section */}
      <span className="inline-block bg-rose-100 text-rose-500 px-4 py-1.5 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest shadow-sm">
        ✨ Powered by Kitty
      </span>
      
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-amber-900 max-w-3xl leading-tight">
        Feed your wallet. <br className="hidden md:block" /><span className="text-amber-500">Save treats.</span> Climb the tower!
      </h1>
      
      <p className="text-amber-800/70 max-w-2xl text-base md:text-lg font-medium">
        Pockat turns boring budgeting into a cozy cat game! Sort spending into cute categories, battle friends on the savings leaderboard, and collect paw badges when you hoard more coins. 🪙
      </p>
      
      {/* Call to Action Buttons */}
      {/* Buttons stack full-width on mobile (flex-col), sit side-by-side on desktop (sm:flex-row) */}
      <div className="flex flex-col sm:flex-row gap-4 mt-2 w-full sm:w-auto">
        <Link 
          href="/recording" 
          className="bg-gradient-to-b from-amber-300 to-amber-500 text-amber-950 font-black py-3.5 px-8 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all w-full sm:w-auto"
        >
          Start Your Quest! 🌟
        </Link>
        <Link 
          href="/leaderboard" 
          className="bg-white border-2 border-amber-100 text-amber-800 font-bold py-3.5 px-8 rounded-full shadow-sm hover:bg-amber-50 active:scale-95 transition-all w-full sm:w-auto"
        >
          Cat Tower 🗼
        </Link>
      </div>

      {/* Feature Cards */}
      {/* Even though the page is centered, the cards keep their text aligned left for readability */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mt-10 md:mt-12 w-full text-left">
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
    <div className="bg-[#FFFDF7] border-2 border-amber-100 p-5 md:p-6 rounded-3xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
      <div className="bg-amber-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-2xl shadow-sm">
        {icon}
      </div>
      <h3 className="font-extrabold text-amber-950 mb-2">{title}</h3>
      <p className="text-sm font-medium text-amber-800/70 leading-relaxed">{desc}</p>
    </div>
  );
}
