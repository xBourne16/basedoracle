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
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal kontrolü
  const [greeting, setGreeting] = useState("GM");

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

  // Cüzdan Bağlama Fonksiyonu
  const connectWallet = async (walletType: 'metamask' | 'rabby') => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({ method: "eth_requestAccounts" });
        setWalletAddress(accounts[0]);
        setIsModalOpen(false); // Bağlanınca modalı kapat
        return accounts[0];
      } catch (err) {
        console.error("Connection rejected");
      }
    } else {
      alert("Please install a wallet like MetaMask or Rabby.");
    }
    return null;
  };

  const handleAction = async () => {
    if (isAnimating) return;
    if (!walletAddress) {
      setIsModalOpen(true); // Cüzdan yoksa modalı aç
      return;
    }

    try {
      setIsAnimating(true);
      setGlowIntensity("opacity-60 scale-110");
      
      const transactionParameters = {
        to: CONTRACT_ADDRESS,
        from: walletAddress,
        data: '0x62734346', 
        value: '0x0',
        gas: '0x3D090', 
      };

      const hash = await (window as any).ethereum.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      });
      
      let receipt = null;
      while (receipt === null) {
        try {
          receipt = await (window as any).ethereum.request({
            method: 'eth_getTransactionReceipt',
            params: [hash],
          });
          if (receipt === null) await new Promise(r => setTimeout(r, 2000));
        } catch (e) { console.log("Waiting..."); }
      }

      if (receipt.status === '0x1' || receipt.status === 1) {
        setTxHash(hash);
        const index = getUniqueQuoteIndex(walletAddress, hash);
        setQuote(quotes[index]);
      } else {
        throw new Error("TX Failed");
      }

    } catch (error: any) {
      if (error.code !== 4001) alert("Oracle failure. Check Base balance.");
    } finally {
      setIsAnimating(false);
      setGlowIntensity("opacity-20 scale-100");
    }
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-4 bg-[#020204] overflow-hidden">
      
      {/* NAV */}
      <nav className="fixed top-0 w-full p-8 flex justify-between items-start z-[100]">
        <div className="flex flex-col">
          <div className="text-[11px] text-blue-500 tracking-[0.5em] font-black uppercase italic">{greeting}</div>
          <div className="text-[9px] text-white/40 font-mono mt-1 uppercase tracking-[0.3em]">Timeline Encrypted</div>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)} 
          className="px-7 py-3 bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-full text-[11px] font-black text-white uppercase tracking-[0.25em] hover:bg-white/[0.1] transition-all"
        >
          {walletAddress ? `${walletAddress.substring(0, 6)}...${walletAddress.slice(-4)}` : "Connect Wallet"}
        </button>
      </nav>

      {/* WALLET MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative w-full max-w-sm bg-[#0a0a0c] border border-white/10 rounded-[32px] p-8 shadow-2xl">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors">✕</button>
            <h2 className="text-sm font-black text-white uppercase tracking-[0.3em] mb-8 text-center">Connect Soul</h2>
            
            <div className="flex flex-col gap-3">
              {[
                { name: "MetaMask", id: 'metamask', icon: "🦊" },
                { name: "Rabby Wallet", id: 'rabby', icon: "🐧" },
                { name: "WalletConnect", id: 'wc', icon: "🌐" }
              ].map((w) => (
                <button 
                  key={w.id}
                  onClick={() => connectWallet('metamask')}
                  className="flex items-center justify-between px-6 py-5 bg-white/[0.03] border border-white/5 rounded-2xl hover:bg-white/10 hover:border-blue-500/50 transition-all group"
                >
                  <span className="text-[12px] font-bold text-white/80 group-hover:text-white uppercase tracking-widest">{w.name}</span>
                  <span className="text-xl">{w.icon}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* BACKGROUNDS */}
      <div className="absolute inset-0 z-0 opacity-[0.06] pointer-events-none select-none">
        <Image src="/always_has_been.png" alt="BG" fill className="object-cover contrast-125" priority />
      </div>

      {/* MAIN CONTENT */}
      <div className={`relative z-[50] w-full max-w-6xl flex flex-col items-center transition-all ${isAnimating ? 'scale-95 blur-sm' : ''}`}>
        <h1 className="text-8xl md:text-[140px] font-black text-white leading-none tracking-tighter uppercase italic mb-16 select-none">
          BASED<span className="text-blue-600">.</span>ORACLE
        </h1>
        
        <div className="relative w-full max-w-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[50px] p-16 shadow-2xl">
          <div className="min-h-[180px] flex items-center justify-center">
            <p className="text-3xl md:text-5xl text-white italic text-center leading-[1.1] font-medium">
              {quote ? `"${quote}"` : isAnimating ? "Witnessing the blockchain..." : "Authorize the transaction to decrypt your fate."}
            </p>
          </div>
          
          <div className="mt-16 flex justify-end">
            <button 
              onClick={handleAction} 
              disabled={isAnimating} 
              className="px-14 py-6 bg-white text-black font-black rounded-full hover:bg-blue-600 hover:text-white transition-all text-[10px] uppercase tracking-[0.3em] disabled:opacity-50"
            >
              {isAnimating ? "Consulting..." : txHash ? "Fate Decrypted" : "Consult Fate"}
            </button>
          </div>
        </div>
      </div>

      <footer className="fixed bottom-10 w-full px-12 flex justify-between items-end z-[10] pointer-events-none">
        <div className="flex flex-col gap-4 pointer-events-auto">
          <span className="text-[13px] text-blue-500 font-black uppercase tracking-[0.4em]">Weekend Protocol:</span>
          <div className="flex flex-col text-[14px] text-white/90 font-mono tracking-[0.2em] gap-3 border-l-2 border-blue-600/50 pl-6">
            {["TRADE", "BUILD", "PAY", "BE"].map((t) => <span key={t}>ON BASE</span>)}
          </div>
        </div>
        <div className="flex flex-col items-end gap-3 pointer-events-auto">
          <div className="flex items-center gap-4 bg-white/[0.05] px-7 py-3.5 rounded-full border border-white/10 backdrop-blur-xl">
            <span className="text-[11px] text-blue-500 font-black tracking-widest uppercase italic">You&apos;re now based</span>
            <div className="relative w-14 h-4"><Image src="/base_logo.png" alt="Base" fill className="object-contain brightness-200" /></div>
          </div>
        </div>
      </footer>
    </main>
  ); 
}