"use client";

import { useState } from "react";

interface ImagePreviewProps {
  src: string;
  alt: string;
}

export default function ImagePreview({ src, alt }: ImagePreviewProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div className="w-12 h-12 bg-slate-100 rounded flex items-center justify-center text-xs text-slate-400">
        无图
      </div>
    );
  }

  return (
    <>
      {/* 缩略图 */}
      <div
        className="w-12 h-12 bg-slate-100 rounded overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all"
        onClick={() => setShowPreview(true)}
      >
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-contain"
          onError={() => setError(true)}
        />
      </div>

      {/* 大图预览弹窗 */}
      {showPreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
          onClick={() => setShowPreview(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-lg overflow-hidden">
            <button
              className="absolute top-2 right-2 w-8 h-8 bg-slate-800/80 text-white rounded-full flex items-center justify-center hover:bg-slate-700"
              onClick={() => setShowPreview(false)}
            >
              ✕
            </button>
            <img
              src={src}
              alt={alt}
              className="max-w-full max-h-[90vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  );
}
