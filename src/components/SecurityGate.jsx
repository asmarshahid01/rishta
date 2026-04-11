import React, { useState } from 'react';
import { Lock, ArrowRight, ShieldAlert } from 'lucide-react';
import { ACCESS_CODE as LOCAL_CODE } from '../config'; // Import directly from config

const SecurityGate = ({ children }) => {
  const MASTER_CODE = import.meta.env?.REACT_APP_ACCESS_CODE || LOCAL_CODE;
  const [accessCode, setAccessCode] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(localStorage.getItem('app_access_granted') === 'true');
  const [error, setError] = useState(false);

  const handleVerify = (e) => {
    e.preventDefault();
    
    // Using the imported ACCESS_CODE directly
    if (accessCode === ACCESS_CODE) {
      localStorage.setItem('app_access_granted', 'true');
      setIsAuthorized(true);
      setError(false);
    } else {
      setError(true);
      setAccessCode('');
    }
  };

  if (isAuthorized) return children;

  return (
    <div className="fixed inset-0 bg-black z-[100] flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-3xl flex items-center justify-center text-white">
            <Lock size={24} className={error ? "text-red-500 animate-pulse" : "text-zinc-400"} />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-bold tracking-tight text-white">Private Access</h1>
            <p className="text-zinc-500 text-xs tracking-widest uppercase font-mono">Restricted Area</p>
          </div>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <input
            type="password"
            autoFocus
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value)}
            placeholder="Enter Access Code"
            className={`w-full bg-zinc-900 border ${error ? 'border-red-900/50' : 'border-zinc-800'} p-4 rounded-2xl text-center text-sm outline-none focus:border-white transition-all text-white`}
          />
          <button 
            type="submit"
            className="w-full bg-white text-black p-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all active:scale-95"
          >
            Verify Identity <ArrowRight size={16} />
          </button>
        </form>

        {error && (
          <div className="flex items-center justify-center gap-2 text-red-500 text-[10px] uppercase font-bold tracking-tighter">
            <ShieldAlert size={12} /> Access Denied
          </div>
        )}
      </div>
    </div>
  );
};

export default SecurityGate;