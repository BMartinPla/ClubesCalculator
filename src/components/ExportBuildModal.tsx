"use client";

import { useEffect, useRef, useState } from "react";

import BuildSummaryCard from "@/components/BuildSummaryCard";
import UiIcon from "@/components/UiIcon";
import type {
  Archetype,
  ArchetypeMastery,
  BuildResult,
  MasteriesState,
} from "@/types";

interface ExportBuildModalProps {
  open: boolean;
  onClose: () => void;
  archetype: Archetype;
  build: BuildResult;
  keyAttributes: string[];
  activeMasteries: ArchetypeMastery[];
  totalMasteriesCount: number;
  skills: number;
  weakFoot: number;
  targetStats: Record<string, number>;
  masteries: MasteriesState;
  selectedPlayStyleIds: (string | null)[];
}

type Busy = "download" | "copy" | null;

const STORAGE_KEY = "saved_builds";

export default function ExportBuildModal({
  open,
  onClose,
  archetype,
  build,
  keyAttributes,
  activeMasteries,
  totalMasteriesCount,
  skills,
  weakFoot,
  targetStats,
  masteries,
  selectedPlayStyleIds,
}: ExportBuildModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState<Busy>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveName, setSaveName] = useState("");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  useEffect(() => {
    if (!saved) return;
    const t = setTimeout(() => setSaved(false), 2500);
    return () => clearTimeout(t);
  }, [saved]);

  if (!open) return null;

  const captureOptions = {
    quality: 0.95,
    pixelRatio: 2,
      backgroundColor: "#0a100d",
    cacheBust: true,
  } as const;

  const handleDownload = async () => {
    const node = cardRef.current;
    if (!node) return;
    setBusy("download");
    setError(null);
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(node, captureOptions);
      const link = document.createElement("a");
      link.download = `build-${archetype.name}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      setError("Could not generate the image. Please try again.");
    } finally {
      setBusy(null);
    }
  };

  const handleCopy = async () => {
    const node = cardRef.current;
    if (!node) return;
    setBusy("copy");
    setError(null);
    try {
      if (typeof ClipboardItem === "undefined") {
        throw new Error("ClipboardItem no soportado");
      }
      const { toBlob } = await import("html-to-image");
      const blob = await toBlob(node, captureOptions);
      if (!blob) throw new Error("empty blob");
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      setCopied(true);
    } catch {
      setError("Your browser cannot copy images. Use Download Image.");
    } finally {
      setBusy(null);
    }
  };

  const handleSave = () => {
    setError(null);
    try {
      const name =
        saveName.trim() ||
        `${archetype.name} ${new Date().toLocaleString()}`;
      const entry = {
        id: `${Date.now()}`,
        name,
        createdAt: new Date().toISOString(),
        archetype: archetype.name,
        targetStats,
        masteries,
        skills,
        weakFoot,
      };
      const raw =
        typeof window !== "undefined"
          ? window.localStorage.getItem(STORAGE_KEY)
          : null;
      const list = raw ? (JSON.parse(raw) as unknown[]) : [];
      list.push(entry);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      setSaved(true);
      setSaveName("");
    } catch {
      setError("Could not save the build in this browser.");
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-title"
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
    >
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative flex max-h-[92vh] w-full max-w-[900px] animate-pop-in flex-col overflow-hidden rounded-2xl border border-line bg-[#0d130f]/98 shadow-2xl shadow-black/50 backdrop-blur-xl">
        <div className="flex items-start justify-between gap-4 border-b border-line bg-white/[0.015] p-4 sm:p-5">
          <div>
            <h2 id="export-title" className="text-base font-bold text-zinc-50">
              Export Snapshot
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Stylized summary of your build, ready to share.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="focus-ring flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-white/[0.06] hover:text-zinc-200"
          >
            <UiIcon name="close" className="h-4 w-4" />
          </button>
        </div>

        {/* Preview */}
        <div className="min-h-0 flex-1 overflow-auto bg-[#080c0a] p-3 sm:p-4">
          <div className="mx-auto w-fit">
            <BuildSummaryCard
              ref={cardRef}
              archetype={archetype}
              build={build}
              keyAttributes={keyAttributes}
              activeMasteries={activeMasteries}
              totalMasteriesCount={totalMasteriesCount}
              skills={skills}
              weakFoot={weakFoot}
              selectedPlayStyleIds={selectedPlayStyleIds}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-line bg-white/[0.015] p-4 sm:p-5">
          {error && (
            <p className="mb-3 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
              {error}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleDownload}
              disabled={busy !== null}
              className="focus-ring inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-extrabold text-[#10150b] transition hover:bg-brand-hi disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy === "download" ? "Generating…" : "Download Image (PNG)"}
            </button>
            <button
              type="button"
              onClick={handleCopy}
              disabled={busy !== null}
              className={`focus-ring inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                copied
                  ? "bg-brand text-[#10150b]"
                  : "border border-line bg-surface-input text-zinc-100 hover:border-line-strong"
              }`}
            >
              {busy === "copy"
                ? "Copying…"
                : copied
                  ? "Copied!"
                  : "Copy to Clipboard"}
            </button>
          </div>

          {/* Save to localStorage */}
          <div className="mt-4 rounded-xl border border-line bg-surface-input p-3">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              Save to My Builds
            </p>
            <div className="flex flex-wrap gap-2">
              <input
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder={`Build name (e.g. ${archetype.name} Competitive)`}
                aria-label="Build name"
                className="min-w-0 flex-1 rounded-lg border border-line bg-[#080c0a] px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-brand/60 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleSave}
                className={`focus-ring rounded-lg px-4 py-2 text-sm font-bold transition ${
                  saved
                    ? "bg-brand text-[#10150b]"
                    : "border border-brand/30 bg-brand/5 text-brand hover:border-brand/60 hover:bg-brand/10"
                }`}
              >
                {saved ? "Saved!" : "Save"}
              </button>
            </div>
            <p className="mt-2 text-[10px] text-zinc-600">
              Saved in this browser (localStorage · key{" "}
              <span className="font-mono">saved_builds</span>).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
