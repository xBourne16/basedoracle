"use client";
import { useState, useEffect } from "react";
import Image from "next/image"; 
import { quotes } from "./quotes";
import "./globals.css"; 

export default function Home() {
  const [quote, setQuote] = useState(""); 
  const [isAnimating, setIsAnimating] = useState(false);
  const [glowIntensity, setGlowIntensity] = useState("opacity-20");
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [greeting, setGreeting] = useState("GM");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeProvider, setActiveProvider] = useState<any>(null);

  const CONTRACT_ADDRESS = "0xd556B65ed18a45C3FB7C50AB51F8A14E62Ba245b";

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setGreeting("The Great Awakening");
    else if (hour >= 12 && hour < 18) setGreeting("The High Noon Cycle");
    else if (hour >= 18 && hour < 22) setGreeting("The Twilight Shift");
    else setGreeting("The Midnight Watch");
  }, []);

  const getUniqueQuoteIndex = (address: string, hash: string) => {
    const combinedSeed = address + hash;
    const charSum = combinedSeed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return charSum % quotes.length;
  };

  const connectWallet = async (walletType: 'metamask' | 'rabby') => {
    if (typeof window === "undefined") return;
    
    const eth = (window as any).ethereum;
    if (!eth) {
      alert("No crypto wallet detected.");
      return;
    }

    let provider: any = null;

    if (eth.providers?.length) {
      if (walletType === 'rabby') {
        provider = eth.providers.find((p: any) => p.isRabby);
      } else {
        provider = eth.providers.find((p: any) => p.isMetaMask && !p.isRabby);
      }
    } else {
      if (walletType === 'rabby' && eth.isRabby) provider = eth;
      else if (walletType === 'metamask' && !eth.isRabby) provider = eth;
      else provider = eth; 
    }

    if (provider) {
      try {
        const accounts = await provider.request({ method: "eth_requestAccounts" });
        setWalletAddress(accounts[0]);
        setActiveProvider(provider);
        setIsModalOpen(false);
      } catch (err) {
        console.error("Connection rejected");
      }
    } else {
      alert(`${walletType.toUpperCase()} not found.`);
    }
  };

  const handleAction = async () => {
    if (isAnimating) return;
    if (!walletAddress) {
      setIsModalOpen(true);
      return;
    }

    try {
      setIsAnimating(true);
      setGlowIntensity("opacity-60 scale-110");
      
      const provider = activeProvider || (window as any).ethereum;

      const txParameters = {
        to: CONTRACT_ADDRESS,
        from: walletAddress,
        data: '0x62734346',
        value: '0x0',
        gas: '0x3D090', // 250,000 gas forced
      };

      const hash = await provider.request({
        method: 'eth_sendTransaction',
        params: [txParameters],
      });
      
      setTxHash(hash);

      let receipt = null;
      while (receipt === null) {
        receipt = await provider.request({
          method: 'eth_getTransactionReceipt',
          params: [hash],
        });
        if (!receipt) await new Promise(r => setTimeout(r, 2000));
      }

      if (receipt && (receipt.status === '0x1' || receipt.status === 1)) {
        setQuote(quotes[getUniqueQuoteIndex(walletAddress, hash)]);
      }
    } catch (error: any) {
      console.error("TX Error:", error);
      if (error.code !== 4001) {
        alert("Transaction failed. Check your Base ETH balance or reset your wallet nonce.");
      }
    } finally {
      setIsAnimating(false);
      setGlowIntensity("opacity-20 scale-100");
    }
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-4 bg-[#020204] overflow-hidden selection:bg-blue-600/40">
      
      {isModalOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
          <div className="w-full max-w-sm bg-[#0a0a0c] border border-white/10 rounded-[32px] p-8 shadow-2xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors">✕</button>
            <h2 className="text-[12px] font-black text-white uppercase tracking-[0.4em] mb-10 text-center italic">Connect Soul</h2>
            <div className="flex flex-col gap-3">
              <button onClick={() => connectWallet('metamask')} className="flex items-center justify-between px-6 py-5 bg-white/[0.03] border border-white/5 rounded-2xl hover:bg-white/10 transition-all group active:scale-95">
                <span className="text-[11px] font-bold text-white/70 group-hover:text-white uppercase tracking-widest">MetaMask</span>
                <span className="text-xl">🦊</span>
              </button>
              <button onClick={() => connectWallet('rabby')} className="flex items-center justify-between px-6 py-5 bg-white/[0.03] border border-white/5 rounded-2xl hover:bg-white/10 transition-all group active:scale-95">
                <span className="text-[11px] font-bold text-white/70 group-hover:text-white uppercase tracking-widest">Rabby Wallet</span>
                <div className="relative w-6 h-6"><Image src="/rabby_logo.png" alt="Rabby" fill className="object-contain" /></div>
              </button>
            </div>
          </div>
        </div>
      )}

      <nav className="fixed top-0 w-full p-8 flex justify-between items-start z-[100]">
        <div className="flex flex-col group">
          <div className="text-[11px] text-blue-500 tracking-[0.5em] font-black uppercase italic transition-all group-hover:tracking-[0.6em]">
            {txHash ? "✦ Oracle Synchronized ✦" : `◈ ${greeting}`}
          </div>
          <div className="flex items-center gap-2 mt-1.5 text-[9px] text-white/40 font-mono uppercase tracking-[0.3em]">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500"></span>
            </span>
            {walletAddress ? "Timeline Encrypted" : "Scanning Souls..."}
          </div>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)} 
          className="group relative flex items-center gap-3 px-7 py-3 bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-full transition-all duration-500 hover:border-blue-500/60 hover:bg-white/[0.1] active:scale-95 z-[110]"
        >
          <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)] animate-pulse"></div>
          <span className="text-[11px] font-black text-white uppercase tracking-[0.25em]">
            {walletAddress ? `${walletAddress.substring(0, 6)}...${walletAddress.slice(-4)}` : "Connect Wallet"}
          </span>
        </button>
      </nav>

      <div className="absolute inset-0 z-0 opacity-[0.06] pointer-events-none select-none">
        <Image src="/always_has_been.png" alt="BG" fill className="object-cover contrast-125" priority />
      </div>

      <div className={`absolute right-[8%] top-[15%] w-[600px] h-[550px] z-[5] transition-all duration-1000 ${glowIntensity} pointer-events-none select-none`}>
        <Image src="/crypto_scribble.png" alt="Oracle" fill className="object-contain grayscale brightness-125 contrast-110" />
      </div>

      <div className={`relative z-[50] w-full max-w-6xl flex flex-col items-center transition-all lg:pr-32 ${isAnimating ? 'scale-95 blur-sm' : ''}`}>
        <h1 className="text-8xl md:text-[140px] font-black text-white leading-none tracking-tighter uppercase italic mb-16 drop-shadow-2xl select-none">
          BASED<span className="text-blue-600">.</span>ORACLE
        </h1>
        
        <div className="relative w-full max-w-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[50px] p-16 shadow-2xl md:-translate-x-12">
          <div className="absolute top-10 left-12 w-10 h-[2px] bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,1)]"></div>
          <div className="min-h-[180px] flex items-center justify-center">
            <p className="text-3xl md:text-5xl text-white italic text-center leading-[1.1] font-medium">
              {quote ? `"${quote}"` : isAnimating ? "Witnessing the blockchain..." : "Authorize the transaction to decrypt your fate."}
            </p>
          </div>
          <div className="mt-16 flex justify-end relative z-[60]">
            <button 
              onClick={handleAction} 
              disabled={isAnimating} 
              className="relative z-[70] px-14 py-6 bg-white text-black font-black rounded-full hover:bg-blue-600 hover:text-white hover:scale-105 active:scale-95 transition-all text-[10px] uppercase tracking-[0.3em] shadow-xl"
            >
              {isAnimating ? "Consulting..." : txHash ? "Fate Decrypted" : "Consult Fate"}
            </button>
          </div>
        </div>
      </div>

      <footer className="fixed bottom-10 w-full px-12 flex justify-between items-end z-[40] pointer-events-none">
        <div className="flex flex-col gap-4 group pointer-events-auto">
          <div className="flex flex-col gap-1">
            <span className="text-[13px] text-blue-500 font-black uppercase tracking-[0.4em]">Weekend Protocol:</span>
            <div className="flex flex-col text-[14px] md:text-[16px] text-white/90 font-mono tracking-[0.2em] gap-3 border-l-2 border-blue-600/50 pl-6 py-1">
              {["TRADE ON BASE", "BUILD ON BASE", "PAY ON BASE", "BE ON BASE"].map((text, i) => (
                <span key={i} className="hover:text-blue-400 hover:translate-x-2 transition-all duration-300">
                  <span className="text-blue-600 text-[10px]">0{i+1}</span> {text}
                </span>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-3 pointer-events-auto">
          <div className="flex items-center gap-4 bg-white/[0.05] px-7 py-3.5 rounded-full border border-white/10 backdrop-blur-xl shadow-xl">
            <span className="text-[11px] text-blue-500 font-black tracking-widest uppercase italic leading-none">You&apos;re now based</span>
            <div className="relative w-14 h-4 flex items-center">
              <Image src="/base_logo.png" alt="Base Logo" fill className="object-contain brightness-200" />
            </div>
          </div>
          <a href="https://x.com/np0int" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 bg-white/[0.02] hover:bg-white/[0.08] border border-white/5 px-6 py-2.5 rounded-full backdrop-blur-xl translate-x-[-10px]">
            <span className="text-[10px] text-white/40 font-mono tracking-[0.3em] group-hover:text-blue-400 uppercase">@np0int</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="white" className="opacity-40 group-hover:opacity-100 group-hover:fill-blue-400">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
            </svg>
          </a>
        </div>
      </footer>
    </main>
  ); 
}
