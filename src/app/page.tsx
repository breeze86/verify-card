"use client";

import { useState } from "react";
import Image from "next/image";

interface CardData {
  certNo: string;
  tagNo: string;
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
  const [cardNo, setCardNo] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CardData | null>(null);
  const [error, setError] = useState("");

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNo.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch(`/api/verify?cardNo=${encodeURIComponent(cardNo.trim())}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Certification not found");
        return;
      }

      setResult(data);
    } catch {
      setError("Network error, please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header with logos */}
      <header className="w-full py-6 px-4">
        <div className="max-w-6xl mx-auto flex justify-center items-center gap-8 md:gap-16">
          <Image
            src="/stg-logo.png"
            alt="STG Logo"
            width={120}
            height={60}
            className="h-12 md:h-16 w-auto object-contain"
            priority
          />
          <div className="w-px h-8 bg-slate-300" />
          <Image
            src="/astra-logo.png"
            alt="Astra Logo"
            width={120}
            height={60}
            className="h-12 md:h-16 w-auto object-contain"
            priority
          />
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 py-12 md:py-20">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            Card Authentication
          </h1>
          <p className="text-slate-600 text-lg">
            Enter your card certification number to verify authenticity and view grading details
          </p>
        </div>

        {/* Search form */}
        <form onSubmit={handleVerify} className="max-w-xl mx-auto mb-12">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={cardNo}
              onChange={(e) => setCardNo(e.target.value)}
              placeholder="Enter certification number (15 digits)"
              className="flex-1 px-5 py-4 text-lg border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
              maxLength={32}
            />
            <button
              type="submit"
              disabled={loading || !cardNo.trim()}
              className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-xl hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Authenticating..." : "Authenticate"}
            </button>
          </div>
        </form>

        {/* Error message */}
        {error && (
          <div className="max-w-xl mx-auto mb-8 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-center">
            {error === "Card not found" ? "Certification not found" : error}
          </div>
        )}

        {/* Result card */}
        {result && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
            {/* Certificate header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <h2 className="text-white text-xl font-semibold">Certificate of Authenticity</h2>
            </div>

            <div className="p-6 md:p-8">
              {/* Images */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="aspect-[4/3] relative bg-slate-100 rounded-xl overflow-hidden">
                  {result.frontImageUrl ? (
                    <Image
                      src={result.frontImageUrl}
                      alt="Card Front Image"
                      fill
                      className="object-contain"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-400">
                      No front image available
                    </div>
                  )}
                  <span className="absolute bottom-2 left-2 px-3 py-1 bg-black/50 text-white text-sm rounded-full">
                    Front
                  </span>
                </div>
                <div className="aspect-[4/3] relative bg-slate-100 rounded-xl overflow-hidden">
                  {result.backImageUrl ? (
                    <Image
                      src={result.backImageUrl}
                      alt="Card Back Image"
                      fill
                      className="object-contain"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-400">
                      No back image available
                    </div>
                  )}
                  <span className="absolute bottom-2 left-2 px-3 py-1 bg-black/50 text-white text-sm rounded-full">
                    Back
                  </span>
                </div>
              </div>

              {/* Card details */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <span className="text-slate-500 text-sm">Certificate No.</span>
                  <p className="text-slate-800 font-semibold text-lg">{result.certNo}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <span className="text-slate-500 text-sm">Tag No.</span>
                  <p className="text-slate-800 font-semibold text-lg">{result.tagNo}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <span className="text-slate-500 text-sm">Brand</span>
                  <p className="text-slate-800 font-semibold text-lg">{result.brand}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <span className="text-slate-500 text-sm">Series</span>
                  <p className="text-slate-800 font-semibold text-lg">{result.series}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl md:col-span-2">
                  <span className="text-slate-500 text-sm">Product Name</span>
                  <p className="text-slate-800 font-semibold text-lg">{result.productName}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <span className="text-slate-500 text-sm">Issue Year</span>
                  <p className="text-slate-800 font-semibold text-lg">{result.issueYear}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <span className="text-slate-500 text-sm">Language</span>
                  <p className="text-slate-800 font-semibold text-lg">{result.language}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <span className="text-slate-500 text-sm">Product No.</span>
                  <p className="text-slate-800 font-semibold text-lg">{result.productNo}</p>
                </div>
                <div className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-100">
                  <span className="text-amber-600 text-sm">Grade</span>
                  <p className="text-amber-800 font-bold text-2xl">{result.grade}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Company Introduction */}
      <section className="max-w-4xl mx-auto px-4 py-12 border-t border-slate-200">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-slate-800 mb-3">About STG & Astra</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            We are a professional trading card grading and authentication institution rooted in China and serving the global market.
            With "Star as Proof, Quality as Core" as our original aspiration, we have built a dual-brand matrix of STG and Astra.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* STG Brand */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-xl font-bold text-blue-700 mb-3">STG</h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              <strong>Star Standard, Professional Companion</strong>
            </p>
            <p className="text-slate-600 text-sm leading-relaxed">
              STG (Star Trading Card Grading) serves as the core baseline of our brand,
              benchmarking against international grading standards (PSA, BGS).
              We cover all categories including Pokémon, Yu-Gi-Oh!, Magic: The Gathering,
              sports cards, and anime collectibles, providing cost-effective and trustworthy
              standardized grading services.
            </p>
          </div>

          {/* Astra Brand */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-xl font-bold text-amber-600 mb-3">Astra</h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              <strong>Pinnacle of the Stars, Ultimate Selection</strong>
            </p>
            <p className="text-slate-600 text-sm leading-relaxed">
              Astra (Star Dome Grading) derives from the Latin word for "star,"
              symbolizing vastness and precision. Designed for high-end rare collectibles,
              Astra focuses on scarce cards, autographed cards, and limited editions.
              Each Astra-graded card undergoes multiple professional appraisals with
              exclusive star-mark anti-counterfeiting encapsulation.
            </p>
          </div>
        </div>

        {/* Core Advantages */}
        <div className="mt-10 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4 text-center">Our Core Advantages</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="font-semibold text-slate-700 mb-1">Dual-Brand Positioning</div>
              <p className="text-slate-500">STG for standardization, Astra for high-end customization</p>
            </div>
            <div className="text-center">
              <div className="font-semibold text-slate-700 mb-1">International Standards</div>
              <p className="text-slate-500">Scientific and unified grading standards with global recognition</p>
            </div>
            <div className="text-center">
              <div className="font-semibold text-slate-700 mb-1">Rigorous Process</div>
              <p className="text-slate-500">Professional team with high-precision detection equipment</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-slate-400 text-sm border-t border-slate-200">
        <p>© {new Date().getFullYear()} STG & Astra Grading. All rights reserved.</p>
      </footer>
    </div>
  );
}
