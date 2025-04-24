
import React from 'react';
import { cn } from '@/lib/utils';

const VaultHeader = () => {
  return (
    <header className="w-full max-w-5xl mx-auto text-center space-y-2.5 mb-8">
      <h1 
        className="text-[28px] font-bold tracking-tight bg-gradient-to-r from-white via-white to-white/90 bg-clip-text text-transparent font-inter animate-fade-in"
      >
        Vault Arena
      </h1>
      <p className="text-[16px] text-gray-400 font-medium animate-fade-in">
        Build. Compete. Win.
      </p>
    </header>
  );
};

export default VaultHeader;
