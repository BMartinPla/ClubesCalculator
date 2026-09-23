"use client";

import { useEffect, useRef, useState } from "react";

interface ShareBuildModalProps {
  open: boolean;
  url: string;
  onClose: () => void;
}

export default function ShareBuildModal({ open, url, onClose }: ShareBuildModalProps) {
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    inputRef.current?.select();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  if (!open) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      inputRef.current?.select();
      document.execCommand?.("copy");
      setCopied(true);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-title"
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
    >
      <div
        className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-lg animate-pop-in rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 id="share-title" className="text-base font-bold text-zinc-100">
              Compartir build
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Cualquiera con este enlace abrirá tu build cargada automáticamente.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-800 hover:text-zinc-200"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950 p-2">
          <input
            ref={inputRef}
            readOnly
            value={url}
            onFocus={(e) => e.target.select()}
            className="min-w-0 flex-1 bg-transparent px-2 text-xs text-zinc-300 focus:outline-none"
            aria-label="Enlace para compartir"
          />
          <button
            type="button"
            onClick={copy}
            className={`shrink-0 rounded-lg px-3 py-2 text-xs font-bold transition ${
              copied
                ? "bg-emerald-500 text-zinc-950"
                : "bg-zinc-100 text-zinc-950 hover:bg-white"
            }`}
          >
            {copied ? "¡Copiado!" : "Copiar"}
          </button>
        </div>

        <p className="mt-3 text-[11px] leading-relaxed text-zinc-600">
          El enlace codifica el arquetipo, la altura, el peso y cada atributo ajustado.
          Se regenera cada vez que modificas la build.
        </p>
      </div>
    </div>
  );
}
