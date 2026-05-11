"use client";

import React, { useState, useEffect } from 'react';
import { Wallet, Shield, Zap, Globe, MessageSquare } from 'lucide-react';

// Kader mesajları listesi
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
  const [isConnecting, setIsConnecting] = useState(false);
  const [fate, setFate] = useState("");
  const [isConsulting, setIsConsulting] = useState(false);

  // Cüzdan Bağlama Fonksiyonu
  const connectWallet = async () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        setIsConnecting(true);
        const accounts = await (window as any).ethereum.request({
          method: 'eth_requestAccounts',
        });
        setAccount(accounts[0]);
      } catch (error) {
        console.error("User rejected connection");
      } finally {
        setIsConnecting(false);
      }
    } else {
      alert("Please install MetaMask or another Web3 wallet!");
    }
  };

  // Kaderi Danışma Fonksiyonu (Buton Aktifleşecek)
  const consultFate = () => {
    if (!account) {
      alert("First, connect your wallet to the Base network!");
      return;
    }
    setIsConsulting(true);
    
    // Kısa bir yükleme simülasyonu
    setTimeout(() => {
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      setFate(randomQuote);
      setIsConsulting(false);
    }, 800);
  };

  return (
    <main className="min-h-screen bg-blue-600 text-white font-sans selection:bg-white selection:text-blue-600">
      {/* Header */}
      <nav className="flex justify-between items-center p-6 border-b border-blue-400/30">
        <div className="text-4xl font-black tracking-tighter italic">BASED.ORACLE</div>
        <button 
          onClick={connectWallet}
          className="bg-white text-blue-600 px-6 py-2 rounded-full font-bold hover:bg-blue-50 transition-all flex items-center gap-2 shadow-xl"
        >
          <Wallet size={20} />
          {account ? `${account.substring(0, 6)}...${account.substring(account.length - 4)}` : "CONNECT WALLET"}
        </button>
      </nav>

      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center pt-20 px-4 text-center">
        <h1 className="text-8xl md:text-9xl font-black tracking-tighter mb-4 opacity-90 italic">
          ALWAYS HAS BEEN.
        </h1>
        <p className="text-xl font-medium tracking-wide max-w-2xl opacity-80 mb-12">
          DECRYPT YOUR ON-CHAIN DESTINY ON THE MOST BASED NETWORK.
        </p>

        {/* Oracle Box */}
        <div className="bg-white text-blue-600 p-8 rounded-2xl shadow-2xl w-full max-w-lg border-4 border-blue-400 transform hover:scale-[1.02] transition-transform">
          <div className="flex items-center gap-3 mb-6 border-b-2 border-blue-100 pb-4">
            <Shield className="text-blue-600" size={28} />
            <span className="font-black text-xl tracking-tight">ORACLE STATUS: ACTIVE</span>
          </div>
          
          <div className="min-h-[100px] flex items-center justify-center mb-8">
            <p className="text-2xl font-bold italic leading-tight">
              {fate || "READY TO DECRYPT YOUR FUTURE..."}
            </p>
          </div>

          <button 
            onClick={consultFate}
            disabled={isConsulting}
            className={`w-full py-4 rounded-xl font-black text-2xl tracking-widest transition-all shadow-lg ${
              isConsulting ? "bg-gray-200 text-gray-400" : "bg-blue-600 text-white hover:bg-blue-700 active:transform active:scale-95"
            }`}
          >
            {isConsulting ? "DECRYPTING..." : "CONSULT FATE"}
          </button>
        </div>
      </div>

      {/* Footer Info Panels */}
      <div className="fixed bottom-0 w-full p-8 flex justify-between items-end pointer-events-none">
        {/* Left Side: Protocols */}
        <div className="bg-blue-700/40 backdrop-blur-md p-6 rounded-xl border border-blue-400/30 pointer-events-auto">
          <h3 className="font-black mb-3 flex items-center gap-2 tracking-wider uppercase text-sm">
            <Zap size={16} /> Weekend Protocol
          </h3>
          <ul className="space-y-1 text-xs font-bold opacity-80 uppercase tracking-widest">
            <li>• Liquidity Provision</li>
            <li>• Strategic Yield</li>
            <li>• Risk Management</li>
            <li>• Oracle Integration</li>
          </ul>
        </div>

        {/* Right Side: Social & Contact */}
        <div className="flex flex-col items-end gap-4 pointer-events-auto">
          <div className="bg-white text-blue-600 p-4 rounded-xl shadow-lg flex items-center gap-4">
            <a href="https://x.com/np0int" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform">
              <span className="font-black text-lg">@np0int</span>
            </a>
            <div className="h-6 w-[2px] bg-blue-100"></div>
            <a href="https://x.com" target="_blank" rel="noopener noreferrer">
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          </div>
          <div className="flex gap-2">
            <div className="bg-blue-500/30 p-2 rounded-lg backdrop-blur-sm"><Globe size={20} /></div>
            <div className="bg-blue-500/30 p-2 rounded-lg backdrop-blur-sm"><MessageSquare size={20} /></div>
          </div>
        </div>
      </div>
    </main>
  );
}