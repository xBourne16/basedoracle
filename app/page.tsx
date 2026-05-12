"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ethers } from "ethers";
import { quotes } from "./quotes";
import "./globals.css";

export default function Home() {
  const [quote, setQuote] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const [glowIntensity, setGlowIntensity] = useState(
    "opacity-20 scale-100"
  );

  const [walletAddress, setWalletAddress] =
    useState<string | null>(null);

  const [txHash, setTxHash] =
    useState<string | null>(null);

  const [greeting, setGreeting] =
    useState("GM");

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [activeProvider, setActiveProvider] =
    useState<any>(null);

  // DROPDOWN
  const [isDropdownOpen, setIsDropdownOpen] =
    useState(false);

  // COOLDOWN TIMER
  const [cooldown, setCooldown] =
    useState<number>(0);

  // CONTRACT ADDRESS
  const CONTRACT_ADDRESS =
    "0x2C53bB6fD360dE621C9319c7Cb441f3AEBE8325b";

  // ABI
  const abi = [
    "function consult() public",
    "function getRemainingTime(address user) view returns (uint256)",
  ];

  useEffect(() => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
      setGreeting("The Great Awakening");
    } else if (hour >= 12 && hour < 18) {
      setGreeting("The High Noon Cycle");
    } else if (hour >= 18 && hour < 22) {
      setGreeting("The Twilight Shift");
    } else {
      setGreeting("The Midnight Watch");
    }
  }, []);

  // LIVE BLOCKCHAIN COOLDOWN TIMER
  useEffect(() => {
    if (!walletAddress) return;

    const fetchCooldown = async () => {
      try {
        const injectedProvider =
          activeProvider ||
          (window as any).ethereum;

        if (!injectedProvider) return;

        const provider =
          new ethers.BrowserProvider(
            injectedProvider
          );

        const contract =
          new ethers.Contract(
            CONTRACT_ADDRESS,
            abi,
            provider
          );

        const remaining =
          await contract.getRemainingTime(
            walletAddress
          );

        setCooldown(
          Number(remaining) * 1000
        );
      } catch (err) {
        console.error(
          "Cooldown fetch error:",
          err
        );
      }
    };

    fetchCooldown();

    const interval = setInterval(
      fetchCooldown,
      1000
    );

    return () => clearInterval(interval);
  }, [walletAddress, activeProvider]);

  const getUniqueQuoteIndex = (
    address: string,
    hash: string
  ) => {
    const combinedSeed = address + hash;

    const charSum = combinedSeed
      .split("")
      .reduce(
        (acc, char) =>
          acc + char.charCodeAt(0),
        0
      );

    return charSum % quotes.length;
  };

  const connectWallet = async (
    walletType:
      | "metamask"
      | "rabby"
      | "coinbase"
  ) => {
    if (typeof window === "undefined")
      return;

    const eth = (window as any).ethereum;

    if (!eth) {
      alert("No crypto wallet detected.");
      return;
    }

    let provider: any = null;

    if (eth.providers?.length) {
      if (walletType === "rabby") {
        provider = eth.providers.find(
          (p: any) => p.isRabby
        );
      } else if (
        walletType === "coinbase"
      ) {
        provider = eth.providers.find(
          (p: any) =>
            p.isCoinbaseWallet
        );
      } else {
        provider = eth.providers.find(
          (p: any) =>
            p.isMetaMask &&
            !p.isRabby &&
            !p.isCoinbaseWallet
        );
      }
    } else {
      if (
        walletType === "rabby" &&
        eth.isRabby
      ) {
        provider = eth;
      } else if (
        walletType === "coinbase" &&
        eth.isCoinbaseWallet
      ) {
        provider = eth;
      } else if (
        walletType === "metamask" &&
        eth.isMetaMask &&
        !eth.isCoinbaseWallet
      ) {
        provider = eth;
      } else {
        provider = eth;
      }
    }

    if (provider) {
      try {
        const accounts =
          await provider.request({
            method:
              "eth_requestAccounts",
          });

        setWalletAddress(accounts[0]);
        setActiveProvider(provider);
        setIsModalOpen(false);
      } catch (err) {
        console.error(
          "Connection rejected"
        );
      }
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    setActiveProvider(null);
    setTxHash(null);
    setQuote("");
    setCooldown(0);
    setIsDropdownOpen(false);
  };

  const handleAction = async () => {
    if (isAnimating) return;

    if (!walletAddress) {
      setIsModalOpen(true);
      return;
    }

    // BLOCKCHAIN COOLDOWN CHECK
    if (cooldown > 0) {
      return;
    }

    try {
      setIsAnimating(true);

      setGlowIntensity(
        "opacity-60 scale-110"
      );

      const injectedProvider =
        activeProvider ||
        (window as any).ethereum;

      if (!injectedProvider) {
        alert(
          "Wallet provider not found."
        );
        return;
      }

      // BASE MAINNET CHECK
      const chainId =
        await injectedProvider.request({
          method: "eth_chainId",
        });

      // BASE MAINNET
      if (chainId !== "0x2105") {
        try {
          await injectedProvider.request({
            method:
              "wallet_switchEthereumChain",
            params: [
              { chainId: "0x2105" },
            ],
          });
        } catch (switchError: any) {
          // BASE NETWORK EKLE
          if (
            switchError.code === 4902
          ) {
            await injectedProvider.request(
              {
                method:
                  "wallet_addEthereumChain",
                params: [
                  {
                    chainId: "0x2105",
                    chainName: "Base",
                    nativeCurrency: {
                      name: "Ethereum",
                      symbol: "ETH",
                      decimals: 18,
                    },
                    rpcUrls: [
                      "https://mainnet.base.org",
                    ],
                    blockExplorerUrls:
                      [
                        "https://basescan.org",
                      ],
                  },
                ],
              }
            );
          } else {
            alert(
              "Please switch to Base Mainnet."
            );
            return;
          }
        }
      }

      const provider =
        new ethers.BrowserProvider(
          injectedProvider
        );

      const signer =
        await provider.getSigner();

      const contract =
        new ethers.Contract(
          CONTRACT_ADDRESS,
          abi,
          signer
        );

      const tx =
        await contract.consult();

      setTxHash(tx.hash);

      setQuote(
        quotes[
          getUniqueQuoteIndex(
            walletAddress,
            tx.hash
          )
        ]
      );

      await tx.wait();

      // REFRESH COOLDOWN
      const remaining =
        await contract.getRemainingTime(
          walletAddress
        );

      setCooldown(
        Number(remaining) * 1000
      );
    } catch (error: any) {
      console.error("TX Error:", error);

      if (error.code !== 4001) {
        alert(
          "Transaction failed or cooldown active."
        );
      }
    } finally {
      setIsAnimating(false);

      setGlowIntensity(
        "opacity-20 scale-100"
      );
    }
  };

  // TIMER FORMAT
  const formatCooldown = (
    ms: number
  ) => {
    const hours = Math.floor(
      ms / (1000 * 60 * 60)
    );

    const minutes = Math.floor(
      (ms % (1000 * 60 * 60)) /
        (1000 * 60)
    );

    const seconds = Math.floor(
      (ms % (1000 * 60)) / 1000
    );

    return `${hours
      .toString()
      .padStart(2, "0")}H ${minutes
      .toString()
      .padStart(2, "0")}M ${seconds
      .toString()
      .padStart(2, "0")}S`;
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-4 bg-[#020204] overflow-hidden selection:bg-blue-600/40">
      {/* WALLET MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
          <div className="w-full max-w-sm bg-[#0a0a0c] border border-white/10 rounded-[32px] p-8 shadow-2xl relative">
            <button
              onClick={() =>
                setIsModalOpen(false)
              }
              className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors"
            >
              ✕
            </button>

            <h2 className="text-[12px] font-black text-white uppercase tracking-[0.4em] mb-10 text-center italic">
              Connect Soul
            </h2>

            <div className="flex flex-col gap-3">
              {/* METAMASK */}
              <button
                onClick={() =>
                  connectWallet(
                    "metamask"
                  )
                }
                className="flex items-center justify-between px-6 py-5 bg-white/[0.03] border border-white/5 rounded-2xl hover:bg-white/10 transition-all group active:scale-95"
              >
                <span className="text-[11px] font-bold text-white/70 group-hover:text-white uppercase tracking-widest">
                  MetaMask
                </span>

                <span className="text-xl">
                  🦊
                </span>
              </button>

              {/* RABBY */}
              <button
                onClick={() =>
                  connectWallet("rabby")
                }
                className="flex items-center justify-between px-6 py-5 bg-white/[0.03] border border-white/5 rounded-2xl hover:bg-white/10 transition-all group active:scale-95"
              >
                <span className="text-[11px] font-bold text-white/70 group-hover:text-white uppercase tracking-widest">
                  Rabby Wallet
                </span>

                <div className="relative w-6 h-6">
                  <Image
                    src="/rabby_logo.png"
                    alt="Rabby"
                    fill
                    className="object-contain"
                  />
                </div>
              </button>

              {/* COINBASE */}
              <button
                onClick={() =>
                  connectWallet(
                    "coinbase"
                  )
                }
                className="flex items-center justify-between px-6 py-5 bg-white/[0.03] border border-white/5 rounded-2xl hover:bg-white/10 transition-all group active:scale-95"
              >
                <span className="text-[11px] font-bold text-white/70 group-hover:text-white uppercase tracking-widest">
                  Coinbase Wallet
                </span>

                <div className="relative w-6 h-6">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="12"
                      fill="#0052FF"
                    />

                    <circle
                      cx="12"
                      cy="12"
                      r="5"
                      fill="white"
                    />
                  </svg>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NAV */}
      <nav className="fixed top-0 w-full p-8 flex justify-between items-start z-[100]">
        <div className="flex flex-col group">
          <div className="text-[11px] text-blue-500 tracking-[0.5em] font-black uppercase italic transition-all group-hover:tracking-[0.6em]">
            {txHash
              ? "✦ Oracle Synchronized ✦"
              : `◈ ${greeting}`}
          </div>

          <div className="flex items-center gap-2 mt-1.5 text-[9px] text-white/40 font-mono uppercase tracking-[0.3em]">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>

              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500"></span>
            </span>

            {walletAddress
              ? "Timeline Encrypted"
              : "Scanning Souls..."}
          </div>
        </div>

        <div className="relative z-[120]">
          <button
            onClick={() => {
              if (walletAddress) {
                setIsDropdownOpen(
                  !isDropdownOpen
                );
              } else {
                setIsModalOpen(true);
              }
            }}
            className="group relative flex items-center gap-3 px-7 py-3 bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-full transition-all duration-500 hover:border-blue-500/60 hover:bg-white/[0.1] active:scale-95 z-[110]"
          >
            <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)] animate-pulse"></div>

            <span className="text-[11px] font-black text-white uppercase tracking-[0.25em]">
              {walletAddress
                ? `${walletAddress.substring(
                    0,
                    6
                  )}...${walletAddress.slice(
                    -4
                  )}`
                : "Connect Wallet"}
            </span>
          </button>

          {walletAddress &&
            isDropdownOpen && (
              <div className="absolute right-0 mt-3 w-[220px] bg-[#0a0a0c]/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-3 shadow-2xl">
                <div className="px-3 py-2 border-b border-white/5 mb-3">
                  <p className="text-[9px] text-white/30 uppercase tracking-[0.3em] mb-1">
                    Connected Wallet
                  </p>

                  <p className="text-[11px] text-white font-mono break-all">
                    {walletAddress}
                  </p>
                </div>

                <button
                  onClick={
                    disconnectWallet
                  }
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.04] hover:bg-red-500/10 border border-white/5 hover:border-red-500/30 transition-all duration-300 text-[10px] font-black uppercase tracking-[0.25em] text-white hover:text-red-400"
                >
                  Disconnect
                </button>
              </div>
            )}
        </div>
      </nav>

      {/* BG */}
      <div className="absolute inset-0 z-0 opacity-[0.06] pointer-events-none select-none">
        <Image
          src="/always_has_been.png"
          alt="BG"
          fill
          className="object-cover contrast-125"
          priority
        />
      </div>

      {/* GLOW */}
      <div
        className={`absolute right-[8%] top-[15%] w-[600px] h-[550px] z-[5] transition-all duration-1000 ${glowIntensity} pointer-events-none select-none`}
      >
        <Image
          src="/crypto_scribble.png"
          alt="Oracle"
          fill
          className="object-contain grayscale brightness-125 contrast-110"
        />
      </div>

      {/* MAIN */}
      <div
        className={`relative z-[50] w-full max-w-6xl flex flex-col items-center transition-all lg:pr-32 ${
          isAnimating
            ? "scale-95 blur-sm"
            : ""
        }`}
      >
        <h1 className="text-8xl md:text-[140px] font-black text-white leading-none tracking-tighter uppercase italic mb-16 drop-shadow-2xl select-none">
          BASED
          <span className="text-blue-600">
            .
          </span>
          ORACLE
        </h1>

        <div className="relative w-full max-w-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[50px] p-16 shadow-2xl md:-translate-x-12">
          <div className="absolute top-10 left-12 w-10 h-[2px] bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,1)]"></div>

          <div className="min-h-[260px] flex flex-col items-center justify-center text-center">
            {/* DAILY TITLE */}
            {quote && (
              <span className="mb-6 text-[11px] uppercase tracking-[0.45em] text-blue-400 font-black italic">
                Your Quote Of The Day
              </span>
            )}

            {/* QUOTE */}
            <p className="text-3xl md:text-5xl text-white italic text-center leading-[1.1] font-medium">
              {quote
                ? `"${quote}"`
                : isAnimating
                ? "Witnessing the blockchain..."
                : cooldown > 0
                ? "The Oracle sleeps..."
                : "Authorize the transaction to decrypt your fate."}
            </p>

            {/* LUCKY NUMBER */}
            {quote &&
              walletAddress && (
                <div className="mt-10 flex flex-col items-center">
                  <span className="text-[10px] uppercase tracking-[0.4em] text-white/30 mb-3 italic">
                    Your Lucky Number Today
                  </span>

                  <div className="px-8 py-3 rounded-full border border-blue-500/30 bg-blue-500/10 backdrop-blur-xl shadow-[0_0_30px_rgba(37,99,235,0.2)]">
                    <span className="text-3xl md:text-4xl font-black text-blue-400 tracking-[0.15em]">
                      {(
                        walletAddress
                          .split("")
                          .reduce(
                            (
                              acc,
                              char
                            ) =>
                              acc +
                              char.charCodeAt(
                                0
                              ),
                            0
                          ) % 999
                      ) + 1}
                    </span>
                  </div>
                </div>
              )}
          </div>

          {/* COOL TIMER */}
          {cooldown > 0 && (
            <div className="flex flex-col items-center justify-center mb-10 animate-pulse">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-3xl"></div>

                <div className="relative px-10 py-5 rounded-full border border-blue-500/40 bg-blue-500/10 backdrop-blur-2xl shadow-[0_0_40px_rgba(37,99,235,0.35)]">
                  <span className="text-blue-400 font-black tracking-[0.35em] uppercase text-[13px] md:text-[16px]">
                    {formatCooldown(
                      cooldown
                    )}
                  </span>
                </div>
              </div>

              <span className="mt-4 text-[10px] uppercase tracking-[0.4em] text-white/30 italic">
                Oracle Cooldown Active
              </span>
            </div>
          )}

          <div className="mt-10 flex justify-end relative z-[60]">
            <button
              onClick={handleAction}
              disabled={
                isAnimating ||
                cooldown > 0
              }
              className={`relative z-[70] px-14 py-6 font-black rounded-full transition-all text-[10px] uppercase tracking-[0.3em] shadow-xl

              ${
                cooldown > 0
                  ? "bg-blue-950/40 text-blue-300 border border-blue-500/20 cursor-not-allowed"
                  : "bg-white text-black hover:bg-blue-600 hover:text-white hover:scale-105 active:scale-95"
              }

              ${
                isAnimating
                  ? "opacity-50"
                  : ""
              }`}
            >
              {isAnimating
                ? "Consulting..."
                : cooldown > 0
                ? "Oracle Sleeping"
                : txHash
                ? "Fate Decrypted"
                : "Consult Fate"}
            </button>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="fixed bottom-10 w-full px-12 flex justify-between items-end z-[40] pointer-events-none">
        <div className="flex flex-col gap-4 group pointer-events-auto">
          <div className="flex flex-col gap-1">
            <span className="text-[13px] text-blue-500 font-black uppercase tracking-[0.4em]">
              Weekend Protocol:
            </span>

            <div className="flex flex-col text-[14px] md:text-[16px] text-white/90 font-mono tracking-[0.2em] gap-3 border-l-2 border-blue-600/50 pl-6 py-1">
              {[
                {
                  text: "TRADE ON BASE",
                  href: null,
                },
                {
                  text: "BUILD ON BASE",
                  href: null,
                },
                {
                  text: "PAY ON BASE",
                  href: null,
                },
                {
                  text:
                    "BE ON BASE.APP",
                  href:
                    "https://base.app/invite/ozzbourne/YRQ8S104",
                },
              ].map((item, i) =>
                item.href ? (
                  <a
                    key={i}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-400 hover:translate-x-2 transition-all duration-300"
                  >
                    <span className="text-blue-600 text-[10px]">
                      0{i + 1}
                    </span>{" "}
                    {item.text}
                  </a>
                ) : (
                  <span
                    key={i}
                    className="hover:text-blue-400 hover:translate-x-2 transition-all duration-300"
                  >
                    <span className="text-blue-600 text-[10px]">
                      0{i + 1}
                    </span>{" "}
                    {item.text}
                  </span>
                )
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-3 pointer-events-auto">
          <div className="flex items-center gap-4 bg-white/[0.05] px-7 py-3.5 rounded-full border border-white/10 backdrop-blur-xl shadow-xl">
            <span className="text-[11px] text-blue-500 font-black tracking-widest uppercase italic leading-none">
              You&apos;re now based
            </span>

            <div className="relative w-14 h-4 flex items-center">
              <Image
                src="/base_logo.png"
                alt="Base Logo"
                fill
                className="object-contain brightness-200"
              />
            </div>
          </div>

          <a
            href="https://x.com/np0int"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 bg-white/[0.02] hover:bg-white/[0.08] border border-white/5 px-6 py-2.5 rounded-full transition-all duration-500 backdrop-blur-xl translate-x-[-10px]"
          >
            <span className="text-[10px] text-white/40 font-mono tracking-[0.3em] group-hover:text-blue-400 uppercase transition-colors">
              @np0int
            </span>
          </a>
        </div>
      </footer>
    </main>
  );
}