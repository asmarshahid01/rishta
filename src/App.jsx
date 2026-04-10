import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import AddProfile from './components/AddProfile';
import EditProfile from './components/EditProfile';
import { Heart, LayoutGrid, UserPlus } from 'lucide-react';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-black text-zinc-100 selection:bg-zinc-800">
        
        {/* Navigation Bar */}
        <nav className="border-b border-zinc-900 sticky top-0 bg-black/60 backdrop-blur-xl z-50">
          {/* Reduced padding and height for mobile (px-4 and h-16) */}
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-zinc-900 rounded-lg sm:rounded-xl flex items-center justify-center border border-zinc-800 group-hover:border-zinc-600 transition-all">
                <Heart className="text-orange-800 fill-orange-800 group-hover:scale-110 transition-transform" size={18} />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm sm:text-lg tracking-tight leading-none">Asia's</span>
                <span className="text-[8px] sm:text-[10px] text-zinc-500 uppercase tracking-[0.1em] sm:tracking-[0.2em]">Rishta Management</span>
              </div>
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center gap-2 sm:gap-4">
              <Link 
                to="/" 
                className="flex items-center gap-2 px-3 py-2 sm:px-4 rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all"
              >
                <LayoutGrid size={16} />
                {/* Text only shows on tablets and up to save space */}
                <span className="hidden md:inline">Browse</span>
              </Link>
              
              <Link 
                to="/add" 
                className="flex items-center gap-2 bg-white text-black px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold hover:bg-zinc-200 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]"
              >
                <UserPlus size={16} />
                {/* Hides 'Profile' text on small mobile screens */}
                <span>Add <span className="hidden xs:inline">Profile</span></span>
              </Link>
            </div>
          </div>
        </nav>

        {/* Main Content Area - Reduced vertical padding for mobile */}
        <main className="py-6 sm:py-12 animate-in fade-in duration-700">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/add" element={<AddProfile />} />
            <Route path="/edit/:id" element={<EditProfile />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="py-10 sm:py-16 border-t border-zinc-900 mt-10 sm:mt-20">
          <div className="max-w-6xl mx-auto px-6 flex flex-col items-center gap-4 text-center">
            <p className="text-[10px] sm:text-[11px] text-zinc-600 font-mono italic">
              Asia Shahid • Rishta Platform • 2026
            </p>
          </div>
        </footer>

      </div>
    </Router>
  );
}

export default App;