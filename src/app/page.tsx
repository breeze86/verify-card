"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

interface CardData {
  certNo: string;
  brand: string;
  series: string;
  productName: string;
  issueYear: number;
  language: string;
  productNo: string;
  grade: string;
  frontImageUrl: string;
  backImageUrl: string;
}

export default function Home() {
  const [certNo, setCertNo] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CardData | null>(null);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  const handleAuthenticate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certNo.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);
    setShowModal(false);

    try {
      const res = await fetch(`/api/verify?certNo=${encodeURIComponent(certNo.trim())}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "No matching card record found for this certification number. Please verify the number and try again.");
        return;
      }

      setResult(data);
      setShowModal(true);
    } catch {
      setError("Network error, please try again");
    } finally {
      setLoading(false);
    }
  };

  const closeModal = useCallback(() => {
    setShowModal(false);
  }, []);

  // ESC key to close modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    if (showModal) {
      window.addEventListener("keydown", handleEsc);
      return () => window.removeEventListener("keydown", handleEsc);
    }
  }, [showModal, closeModal]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showModal]);

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100">
      {/* Header with logos */}
      <header className="w-full py-10 md:py-12 px-4 border-b border-slate-800">
        <div className="max-w-6xl mx-auto flex justify-center items-center gap-10 md:gap-20">
          <Image
            src="/stg-logo.png"
            alt="STG Logo"
            width={140}
            height={70}
            className="h-20 md:h-28 w-auto object-contain"
            priority
          />
          <div className="w-px h-12 md:h-16 bg-gradient-to-b from-transparent via-amber-400 to-transparent" />
          <Image
            src="/astra-logo.png"
            alt="Astra Logo"
            width={140}
            height={70}
            className="h-20 md:h-28 w-auto object-contain"
            priority
          />
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-4 py-10 md:py-14">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent">
            Card Authentication
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Enter your certification number to verify authenticity and view grading details
          </p>
        </div>

        {/* Search form */}
        <form onSubmit={handleAuthenticate} className="max-w-2xl mx-auto mb-10">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={certNo}
                onChange={(e) => setCertNo(e.target.value)}
                placeholder="Enter certification number"
                className="w-full px-6 py-5 text-lg bg-slate-800/50 border-2 border-slate-700 rounded-xl focus:border-amber-500 focus:outline-none transition-colors text-slate-100 placeholder:text-slate-500"
                maxLength={32}
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500/10 via-transparent to-amber-500/10 pointer-events-none" />
            </div>
            <button
              type="submit"
              disabled={loading || !certNo.trim()}
              className="px-10 py-5 bg-gradient-to-r from-amber-600 to-amber-500 text-slate-900 text-lg font-bold rounded-xl hover:from-amber-500 hover:to-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-amber-500/20"
            >
              {loading ? "Authenticating..." : "Authenticate"}
            </button>
          </div>
        </form>

        {/* Error message */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8 p-5 bg-red-950/50 border border-red-800 rounded-xl text-red-300 text-center">
            {error}
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && result && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="relative w-full max-h-[90vh] overflow-hidden bg-gradient-to-b from-slate-900 to-slate-800 rounded-2xl shadow-2xl border border-amber-500/30" style={{ maxWidth: '800px' }}>
            {/* Compact Header with Close Button */}
            <div className="bg-slate-900/80 backdrop-blur px-5 py-3 border-b border-amber-500/30 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                  <svg className="w-4 h-4 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-amber-400 leading-tight">Certificate of Authenticity</h2>
                  <p className="text-slate-500 text-xs">STG & Astra Grading Services</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <div className="text-xs text-slate-500 uppercase tracking-wider">Cert #</div>
                  <div className="text-sm font-mono text-amber-200">{result.certNo}</div>
                </div>
                <button
                  onClick={closeModal}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                  aria-label="Close"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Scrollable Content - Compact Layout */}
            <div className="app-scrollbar overflow-y-auto max-h-[calc(90vh-60px)]" data-scrollable="true">
              <div className="p-5">
                {/* Grade Badge - Horizontal at top */}
                <div className="flex flex-col items-center justify-center mb-5 p-4 bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 rounded-xl border border-amber-500/20">
                  <div className="text-sm text-slate-400 uppercase tracking-wider mb-1">Grade</div>
                  <div className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 leading-none">
                    {result.grade}
                  </div>
                </div>

                {/* Images Grid */}
                <div className="grid grid-cols-2 gap-4 max-w-[80%] mx-auto">
                      <div className="bg-slate-800/50 rounded-lg p-2 border border-slate-700">
                        <div className="aspect-[2/3] relative rounded overflow-hidden bg-slate-900">
                          {result.frontImageUrl ? (
                            <Image
                              src={result.frontImageUrl}
                              alt="Card Front"
                              fill
                              className="object-contain"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                              No image
                            </div>
                          )}
                        </div>
                        <div className="text-center mt-1.5 text-xs text-slate-500 font-medium uppercase tracking-wider">Front</div>
                      </div>
                      <div className="bg-slate-800/50 rounded-lg p-2 border border-slate-700">
                        <div className="aspect-[2/3] relative rounded overflow-hidden bg-slate-900">
                          {result.backImageUrl ? (
                            <Image
                              src={result.backImageUrl}
                              alt="Card Back"
                              fill
                              className="object-contain"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                              No image
                            </div>
                          )}
                        </div>
                        <div className="text-center mt-1.5 text-xs text-slate-500 font-medium uppercase tracking-wider">Back</div>
                      </div>
                    </div>

                {/* Card Details - Compact Grid */}
                <div className="mt-5 pt-4 border-t border-slate-700/50 flex flex-col items-center">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">Card Information</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-4 w-full text-center">
                    <div>
                      <span className="text-sm text-slate-400 uppercase block">Brand</span>
                      <p className="text-base text-slate-200 font-medium truncate">{result.brand}</p>
                    </div>
                    <div>
                      <span className="text-sm text-slate-400 uppercase block">Series</span>
                      <p className="text-base text-slate-200 font-medium truncate">{result.series}</p>
                    </div>
                    <div>
                      <span className="text-sm text-slate-400 uppercase block">Product</span>
                      <p className="text-base text-slate-200 font-medium truncate">{result.productName}</p>
                    </div>
                    <div>
                      <span className="text-sm text-slate-400 uppercase block">Year</span>
                      <p className="text-base text-slate-200 font-medium">{result.issueYear}</p>
                    </div>
                    <div>
                      <span className="text-sm text-slate-400 uppercase block">Language</span>
                      <p className="text-base text-slate-200 font-medium">{result.language}</p>
                    </div>
                    <div>
                      <span className="text-sm text-slate-400 uppercase block">Product No.</span>
                      <p className="text-base text-slate-200 font-medium truncate">{result.productNo}</p>
                    </div>
                  </div>
                </div>

                {/* Security Footer - Compact */}
                <div className="mt-4 pt-3 border-t border-slate-700/50 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-xs text-slate-400">Authentication Verified</span>
                  </div>
                  <div className="text-xs text-slate-500 font-mono">SECURE • AUTHENTIC • GUARANTEED</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Company Introduction */}
      <section className="max-w-5xl mx-auto px-4 py-10 border-t border-slate-800">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-100 mb-4">About STG & Astra</h2>
          <p className="text-slate-400 max-w-3xl mx-auto leading-relaxed">
            We are a professional trading card grading and authentication institution rooted in China and serving the global market.
            With <span className="text-amber-400">&ldquo;Star as Proof, Quality as Core&rdquo;</span> as our original aspiration, we have built a dual-brand matrix of STG and Astra.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* STG Brand */}
          <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700 hover:border-blue-500/50 transition-colors">
            <h3 className="text-2xl font-bold text-blue-400 mb-4">STG</h3>
            <p className="text-amber-200/80 text-sm font-semibold mb-3">
              Star Standard, Professional Companion
            </p>
            <p className="text-slate-400 text-sm leading-relaxed">
              STG (Star Trading Card Grading) serves as the core baseline of our brand,
              benchmarking against international grading standards (PSA, BGS).
              We cover all categories including Pokémon, Yu-Gi-Oh!, Magic: The Gathering,
              sports cards, and anime collectibles, providing cost-effective and trustworthy
              standardized grading services.
            </p>
          </div>

          {/* Astra Brand */}
          <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700 hover:border-amber-500/50 transition-colors">
            <h3 className="text-2xl font-bold text-amber-400 mb-4">Astra</h3>
            <p className="text-amber-200/80 text-sm font-semibold mb-3">
              Pinnacle of the Stars, Ultimate Selection
            </p>
            <p className="text-slate-400 text-sm leading-relaxed">
              Astra (Star Dome Grading) derives from the Latin word for &ldquo;star,&rdquo;
              symbolizing vastness and precision. Designed for high-end rare collectibles,
              Astra focuses on scarce cards, autographed cards, and limited editions.
              Each Astra-graded card undergoes multiple professional appraisals with
              exclusive star-mark anti-counterfeiting encapsulation.
            </p>
          </div>
        </div>

        {/* Core Advantages */}
        <div className="mt-8 bg-gradient-to-r from-slate-800/50 to-slate-900/50 rounded-2xl p-8 border border-slate-700">
          <h3 className="text-xl font-bold text-slate-100 mb-8 text-center">Our Core Advantages</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold">1</div>
              <div className="font-semibold text-slate-200 mb-2">Dual-Brand Positioning</div>
              <p className="text-slate-400 text-sm">STG for standardization, Astra for high-end customization</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-900 font-bold">2</div>
              <div className="font-semibold text-slate-200 mb-2">International Standards</div>
              <p className="text-slate-400 text-sm">Scientific and unified grading standards with global recognition</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-white font-bold border border-slate-500">3</div>
              <div className="font-semibold text-slate-200 mb-2">Rigorous Process</div>
              <p className="text-slate-400 text-sm">Professional team with high-precision detection equipment</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 text-center text-slate-500 text-sm border-t border-slate-800">
        <p>© {new Date().getFullYear()} STG & Astra Grading. All rights reserved.</p>
      </footer>

    </div>
  );
}
