"use client";

import React, { useState } from 'react';
import { Wallet, Shield, Zap, Globe, MessageSquare } from 'lucide-react';

const quotes = [
  "Based vibes only. Your wallet shows a legendary path ahead.",
  "Fortune favors the Based. Expect a green candle in your near future.",
  "The Oracle sees a massive bridge to success in your next transaction.",
  "Patience is a virtue, but being Based is a lifestyle. Stay on chain.",
  "Your digital footprint is glowing. The ecosystem rewards your loyalty.",
  "A surprise airdrop of luck is heading towards your connected wallet.",
  "The smart contract of your life is executing perfectly today."
];

export default function BasedOracle() {
  const [account, setAccount] = useState<string | null>(null);
  const [fate, setFate] = useState("");
  const [isConsulting, setIsConsulting] = useState(false);

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({
          method: 'eth_requestAccounts',
        });
        setAccount(accounts[0]);
      } catch (error) {
        console.error("Connection rejected");
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  const consultFate = () => {
    if (!account) {
      alert("Connect your wallet first!");
      return;
    }
    setIsConsulting(true);
    setTimeout(() => {
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      setFate(randomQuote);
      setIsConsulting(false);
    }, 1000);
  };

  return (
    <main className="min-h-screen bg-[#0052FF] text-white font-sans overflow-hidden relative">
      {/* Background Text Decor */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none select-none">
        <h1 className="text-[25vw] font-black italic tracking-tighter leading-none">BASED</h1>
      </div>

      {/* Header */}
      <nav className="relative z-10 flex justify-between items-center p-8">
        <div className="text-5xl font-black italic tracking-tighter">BASED.ORACLE</div>
        <button 
          onClick={connectWallet}
          className="bg-white text-[#0052FF] px-8 py-3 rounded-full font-black tracking-tight hover:bg-blue-50 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]"
        >
          {account ? `${account.substring(0, 6)}...${account.substring(account.length - 4)}` : "CONNECT WALLET"}
        </button>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center pt-12 px-6">
        <div className="text-center mb-12">
          <h2 className="text-[12vw] font-black italic leading-[0.8] tracking-tighter mb-4">
            ALWAYS HAS BEEN.
          </h2>
          <p className="text-2xl font-bold tracking-[0.2em] opacity-90">
            DECRYPT YOUR ON-CHAIN DESTINY
          </p>
        </div>

        {/* Oracle Box - Original Style */}
        <div className="w-full max-w-2xl bg-black/20 backdrop-blur-xl border-4 border-white p-10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.3)]">
          <div className="flex items-center gap-4 mb-8 border-b-2 border-white/20 pb-6">
            <Shield size={32} className="text-white" />
            <span className="text-2xl font-black italic tracking-widest uppercase">Oracle Terminal</span>
          </div>

          <div className="min-h-[120px] flex items-center justify-center mb-10">
            <p className="text-3xl md:text-4xl font-black italic text-center leading-tight tracking-tight">
              {fate || "WAITING FOR INPUT..."}
            </p>
          </div>

          <button 
            onClick={consultFate}
            disabled={isConsulting}
            className="w-full bg-white text-[#0052FF] py-6 rounded-2xl font-black text-3xl tracking-[0.1em] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-2xl"
          >
            {isConsulting ? "DECRYPTING..." : "CONSULT FATE"}
          </button>
        </div>
      </div>

      {/* Footer - Fixed Corners */}
      <div className="fixed bottom-0 w-full p-10 flex justify-between items-end pointer-events-none">
        {/* Left Side: Weekend Protocol */}
        <div className="pointer-events-auto bg-black/10 backdrop-blur-md p-6 border-l-4 border-white">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={20} fill="white" />
            <span className="font-black italic tracking-[0.2em] text-sm uppercase">Weekend Protocol</span>
          </div>
          <ul className="space-y-1 font-bold text-[10px] tracking-[0.3em] uppercase opacity-70">
            <li>• Liquidity Provision</li>
            <li>• Strategic Yield</li>
            <li>• Risk Management</li>
            <li>• Oracle Integration</li>
          </ul>
        </div>

        {/* Right Side: @np0int Signature */}
        <div className="flex flex-col items-end gap-6 pointer-events-auto">
          <div className="flex items-center gap-6 bg-white text-[#0052FF] py-4 px-8 rounded-2xl shadow-2xl transform rotate-[-2deg]">
            <a href="https://x.com/np0int" target="_blank" rel="noopener noreferrer" className="text-2xl font-black italic tracking-tighter hover:scale-105 transition-transform">
              @np0int
            </a>
            <div className="w-[2px] h-8 bg-[#0052FF]/20"></div>
            <a href="https://x.com/np0int" target="_blank" rel="noopener noreferrer">
              <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/20"><Globe size={24} /></div>
            <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/20"><MessageSquare size={24} /></div>
          </div>
        </div>
      </div>
    </main>
  );
}