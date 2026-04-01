import React, { useState } from 'react';
import { LogOut, Loader2 } from 'lucide-react';
import { globalCopy } from '@/data/es/global';
import { supabase } from '@/lib/supabase';

export function LogoutButton() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Force hard redirect to clear all local state and hit the server auth check
      window.location.href = '/login';
    } catch (error) {
      console.error('Error logging out:', error);
      setIsLoggingOut(false);
    }
  };

  return (
    <button 
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={`w-full mt-2 flex items-center gap-3 px-3 py-2.5 rounded-2xl text-red-500 hover:bg-red-50 transition-all ${isLoggingOut ? 'opacity-70 cursor-not-allowed' : 'active:scale-95'}`}
      aria-label={globalCopy.layout.profesorNav.salir}
    >
      {isLoggingOut ? (
        <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
      ) : (
        <LogOut className="w-5 h-5" aria-hidden="true" />
      )}
      <span className="text-sm font-bold uppercase tracking-wide">
        {isLoggingOut ? 'Saliendo...' : globalCopy.layout.profesorNav.salir}
      </span>
    </button>
  );
}
