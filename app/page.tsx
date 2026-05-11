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

  const connectWallet = async (walletType: 'metamask' | 'rabby' | 'wc') => {
    if (typeof window === "undefined") return;
    if (walletType === 'wc') {
      alert("WalletConnect entegrasyonu yakında eklenecek. Şimdilik MetaMask veya Rabby kullanın.");
      return;
    }

    let provider: any = null;
    const eth = (window as any).ethereum;

    if (!eth) {
      alert("Cüzdan bulunamadı.");
      return;
    }

    if (eth.providers?.length) {
      if (walletType === 'rabby') provider = eth.providers.find((p: any) => p.isRabby);
      else provider = eth.providers.find((p: any) => p.isMetaMask && !p.isRabby);
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
        console.error("Connection error", err);
      }
    } else {
      alert("Seçilen cüzdan yüklü değil.");
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
      const transactionParameters = {
        to: CONTRACT_ADDRESS,
        from: walletAddress,
        data: '0x62734346', 
        value: '0x0',
        gas: '0x3D090', 
      };

      const provider = activeProvider || (window as any).ethereum;
      const hash = await provider.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      });
      
      let receipt = null;
      while (receipt === null) {
        try {
          receipt = await provider.request({
            method: 'eth_getTransactionReceipt',
            params: [hash],
          });
          if (receipt === null) await new Promise(r => setTimeout(r, 2000));
        } catch (e) { console.log("Confirming..."); }
      }

      if (receipt.status === '0x1' || receipt.status === 1) {
        setTxHash(hash);
        setQuote(quotes[getUniqueQuoteIndex(walletAddress, hash)]);
      }
    } catch (error: any) {
      if (error.code !== 4001) alert("İşlem başarısız.");
    } finally {
      setIsAnimating(false);
      setGlowIntensity("opacity-20 scale-100");
    }
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-4 bg-[#020204] overflow-hidden selection:bg-blue-600/40">
      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-sm bg-[#0a0a0c] border border-white/10 rounded-[32px] p-8">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-white/40 hover:text-white">✕</button>
            <h2 className="text-[12px] font-black text-white uppercase tracking-[0.4em] mb-10 text-center italic">Connect Soul</h2>
            <div className="flex flex-col gap-3">
              <button onClick={() => connectWallet('metamask')} className="flex items-center justify-between px-6 py-5 bg-white/[0.03] border border-white/5 rounded-2xl hover:bg-white/10 transition-all group">
                <span className="text-[11px] font-bold text-white/70 group-hover:text-white uppercase">MetaMask</span>
                <span className="text-xl">🦊</span>
              </button>
              <button onClick={() => connectWallet('rabby')} className="flex items-center justify-between px-6 py-5 bg-white/[0.03] border border-white/5 rounded-2xl hover:bg-white/10 transition-all group">
                <span className="text-[11px] font-bold text-white/70 group-hover:text-white uppercase">Rabby Wallet</span>
                <div className="relative w-6 h-6"><Image src="/rabby_logo.png" alt="Rabby" fill className="object-contain" /></div>
              </button>
              <button onClick={() => connectWallet('wc')} className="flex items-center justify-between px-6 py-5 bg-white/[0.01] border border-white/5 rounded-2xl opacity-40 cursor-not-allowed">
                <span className="text-[11px] font-bold text-white/20 uppercase">WalletConnect</span>
                <span className="text-xl grayscale">🌐</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NAV */}
      <nav className="fixed top-0 w-full p-8 flex justify-between items-start z-[100]">
        <div className="flex flex-col group">
          <div className="text-[11px] text-blue-500 tracking-[0.5em] font-black uppercase italic">{txHash ? "✦ Oracle Synchronized ✦" : `◈ ${greeting}`}</div>
          <div className="text-[9px] text-white/40 font-mono uppercase tracking-[0.3em] mt-1">Timeline Encrypted</div>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="px-7 py-3 bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-full text-[11px] font-black text-white uppercase tracking-[0.25em]">
          {walletAddress ? `${walletAddress.substring(0, 6)}...${walletAddress.slice(-4)}` : "Connect Wallet"}
        </button>
      </nav>

      {/* CONTENT */}
      <div className={`relative z-[50] w-full max-w-6xl flex flex-col items-center transition-all lg:pr-32 ${isAnimating ? 'scale-95 blur-sm' : ''}`}>
        <h1 className="text-8xl md:text-[140px] font-black text-white leading-none tracking-tighter uppercase italic mb-16 select-none">
          BASED<span className="text-blue-600">.</span>ORACLE
        </h1>
        <div className="relative w-full max-w-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[50px] p-16 shadow-2xl">
          <div className="min-h-[180px] flex items-center justify-center">
            <p className="text-3xl md:text-5xl text-white italic text-center leading-[1.1] font-medium italic">
              {quote ? `"${quote}"` : isAnimating ? "Witnessing the blockchain..." : "Authorize the transaction to decrypt your fate."}
            </p>
          </div>
          <div className="mt-16 flex justify-end">
            <button onClick={handleAction} disabled={isAnimating} className="px-14 py-6 bg-white text-black font-black rounded-full hover:bg-blue-600 hover:text-white transition-all text-[10px] uppercase tracking-[0.3em]">
              {isAnimating ? "Consulting..." : txHash ? "Fate Decrypted" : "Consult Fate"}
            </button>
          </div>
        </div>
      </div>

      {/* FOOTER - X ADRESİ BURADA */}
      <footer className="fixed bottom-10 w-full px-12 flex justify-between items-end z-[10] pointer-events-none">
        <div className="flex flex-col gap-4 group pointer-events-auto">
          <div className="flex flex-col gap-1">
            <span className="text-[13px] text-blue-500 font-black uppercase tracking-[0.4em]">Weekend Protocol:</span>
            <div className="flex flex-col text-[14px] text-white/90 font-mono tracking-[0.2em] gap-3 border-l-2 border-blue-600/50 pl-6 py-1">
              {["TRADE ON BASE", "BUILD ON BASE", "PAY ON BASE", "BE ON BASE"].map((t, i) => <span key={i}>{t}</span>)}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-3 pointer-events-auto">
          <div className="flex items-center gap-4 bg-white/[0.05] px-7 py-3.5 rounded-full border border-white/10 backdrop-blur-xl shadow-xl">
            <span className="text-[11px] text-blue-500 font-black tracking-widest uppercase italic">You&apos;re now based</span>
            <div className="relative w-14 h-4"><Image src="/base_logo.png" alt="Base" fill className="object-contain brightness-200" /></div>
          </div>
          <a href="https://x.com/np0int" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 bg-white/[0.02] hover:bg-white/[0.08] border border-white/5 px-6 py-2.5 rounded-full transition-all">
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