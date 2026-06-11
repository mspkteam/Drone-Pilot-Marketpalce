import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join, extname } from "path";

const replacements = [
  ["text-[#f5f1ea]", "text-ras-heading"],
  ["text-[#f4f1ea]", "text-ras-text"],
  ["text-[#e5e2e1]", "text-ras-text"],
  ["text-[#a39684]", "text-ras-warm"],
  ["text-[#d0c5af]", "text-ras-warm"],
  ["text-[#a8a29a]", "text-ras-muted"],
  ["text-[#8a847a]", "text-ras-soft"],
  ["text-[#d8b339]", "text-gold"],
  ["text-[#e9c349]", "text-gold-light"],
  ["text-[#e4c55a]", "text-gold-light"],
  ["text-[#0e0a07]", "text-ras-cta"],
  ["text-[#11100d]", "text-ras-cta"],
  ["text-[#3c2f00]", "text-ras-waitlist"],
  ["text-[#3c2f00]/85", "text-ras-waitlist/85"],
  ["bg-[#131313]", "bg-ras-bg"],
  ["bg-[#0e0e0d]", "bg-ras-soft"],
  ["bg-[#0e0e0e]", "bg-ras-soft"],
  ["bg-[#11100f]", "bg-ras-section"],
  ["bg-[#10100f]", "bg-ras-section"],
  ["bg-[#201f1f]", "bg-ras-card"],
  ["bg-[#201f1d]", "bg-ras-card"],
  ["bg-[#171512]", "bg-ras-card-warm"],
  ["bg-[#1a1917]", "bg-surface"],
  ["bg-[#3c2f00]/10", "bg-ras-waitlist/10"],
  ["border-[#4d4635]", "border-ras-border-muted"],
  ["border-[#3c2f00]/20", "border-ras-waitlist/20"],
  ["border-[rgba(235,169,65,0.11)]", "border-ras-gold-subtle"],
  ["hover:text-[#e4c55a]", "hover:text-gold-light"],
  ["hover:text-[#d8b339]", "hover:text-gold"],
  ["focus:border-[#3c2f00]/40", "focus:border-ras-waitlist/40"],
  ["focus:ring-[#3c2f00]/25", "focus:ring-ras-waitlist/25"],
  ["text-[#6f6a62]", "text-ras-dim"],
  ["text-[#8f8980]", "text-ras-dim-alt"],
  ["placeholder:text-[#6f6a62]", "placeholder:text-ras-dim"],
  ["bg-[#d8b339]", "bg-gold"],
  ["bg-[#D8B339]", "bg-gold"],
  ["hover:bg-[#e4c55a]", "hover:bg-gold-light"],
  ["hover:bg-[#E4C55A]", "hover:bg-gold-light"],
  ["border-[#11100d]", "border-ras-cta"],
  ["hover:bg-[#11100d]/10", "hover:bg-ras-cta/10"],
  ["bg-[#151310]", "bg-ras-card-warm"],
  ["bg-[#211d12]", "bg-ras-card-warm-alt"],
  ["bg-[#1a1a1a]", "bg-surface"],
  ["bg-[#141414]", "bg-surface"],
  ["bg-[#1a1918]", "bg-surface"],
  ["bg-[#1f1e1c]", "bg-ras-card"],
  ["bg-[#25231f]", "bg-surface-elevated"],
  ["bg-[#252525]", "bg-surface-elevated"],
  ["bg-[#12100f]", "bg-ras-section"],
  ["bg-[#141210]", "bg-ras-card-warm"],
  ["text-[#c9a227]/80", "text-gold-dark/80"],
  ["text-[#090706]", "text-ras-cta"],
  ["border-l-[#d8b339]", "border-l-gold"],
  ["border-[#ddb049]", "border-gold"],
  ["stroke=\"#D8B339\"", "stroke=\"var(--color-gold)\""],
  ["fill=\"#D8B339\"", "fill=\"var(--color-gold)\""],
];

/** CSS-only: hex → design tokens (skip :root definitions) */
const cssReplacements = [
  ["background: #14120f", "background: var(--color-panel)"],
  ["background: #16130f", "background: var(--color-card-warm)"],
  ["background: #191612", "background: var(--color-card-warm)"],
  ["background: #1c1914", "background: var(--color-panel)"],
  ["background: #1e1b16", "background: var(--color-panel)"],
  ["background: #252118", "background: var(--color-card-warm-alt)"],
  ["background: #2a2722", "background: var(--color-card)"],
  ["background: #050505", "background: var(--color-bg-deeper)"],
  ["background: #e9bf4a", "background: var(--color-gold-soft)"],
  ["background: #e4c55a", "background: var(--color-gold-soft)"],
  ["background: #22c55e", "background: var(--color-success-bright)"],
  ["color: #11100d", "color: var(--color-cta-dark)"],
  ["color: #0e0a07", "color: var(--color-cta-dark)"],
  ["color: #e9bf4a", "color: var(--color-gold-soft)"],
  ["color: #e4c55a", "color: var(--color-gold-soft)"],
  ["color: #22c55e", "color: var(--color-success-bright)"],
  ["color: #ef4444", "color: var(--color-danger)"],
  ["color: #fca5a5", "color: var(--color-danger-soft)"],
  ["color: #f5a3a3", "color: var(--color-danger-soft)"],
  ["color: #f87171", "color: var(--color-danger-soft)"],
  ["color: #f0a8a8", "color: var(--color-danger-soft)"],
  ["color: #f5b8b8", "color: var(--color-danger-soft)"],
  ["color: #86efac", "color: var(--color-success)"],
  ["color: #6ee7b7", "color: var(--color-success)"],
  ["color: #8fb89a", "color: var(--color-success)"],
  ["color: #6f6a62", "color: var(--color-text-dim)"],
  ["color: #8a8478", "color: var(--color-text-soft)"],
  ["color: #c4bdb0", "color: var(--color-text-warm)"],
  ["border-top-color: #22c55e", "border-top-color: var(--color-success-bright)"],
  ["border-top-color: #f5a3a3", "border-top-color: var(--color-danger-soft)"],
  [", #e9bf4a)", ", var(--color-gold-soft))"],
  ["linear-gradient(180deg, #e9bf4a, var(--color-gold))", "linear-gradient(180deg, var(--color-gold-soft), var(--color-gold))"],
  ["linear-gradient(90deg, var(--color-gold), #e9bf4a)", "linear-gradient(90deg, var(--color-gold), var(--color-gold-soft))"],
  ["background: #e9c64a", "background: var(--color-gold-soft)"],
  ["background: #11100e", "background: var(--color-bg-section)"],
  ["background: #0b0b0a", "background: var(--color-bg-soft)"],
  ["background: #050504", "background: var(--color-bg-deeper)"],
  ["background: #12100d", "background: var(--color-panel-deep)"],
  ["background: #181612", "background: var(--color-card-warm)"],
  ["background: #24211d", "background: var(--color-card-warm-alt)"],
  ["background: #1a1814", "background: var(--color-panel)"],
  ["background: #302d28", "background: var(--color-card)"],
  ["color: #d46a6a", "color: var(--color-danger-soft)"],
  ["color: #6dbf82", "color: var(--color-success-bright)"],
  ["color: #d8c48a", "color: var(--color-gold-soft)"],
  ["color: #94a3b8", "color: var(--color-text-muted)"],
  ["color: #cbd5e1", "color: var(--color-text-warm)"],
  ["color: #c4bfb6", "color: var(--color-text-warm)"],
  ["color: #78716c", "color: var(--color-text-soft)"],
  ["color: #e7e2d8", "color: var(--color-text)"],
  ["color: #e8e4dc", "color: var(--color-text)"],
  ["background: #ef4444", "background: var(--color-danger)"],
  ["background: #dc2626", "background: var(--color-danger)"],
  [", #c9a632)", ", var(--color-gold-dark))"],
];

const exts = new Set([".tsx", ".ts", ".css"]);

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      if (name === "node_modules" || name === ".next") continue;
      walk(p);
      continue;
    }
    if (!exts.has(extname(name))) continue;
    let content = readFileSync(p, "utf8");
    const original = content;
    const pairs = extname(name) === ".css" ? [...replacements, ...cssReplacements] : replacements;
    for (const [from, to] of pairs) {
      content = content.split(from).join(to);
    }
    if (content !== original) {
      writeFileSync(p, content, "utf8");
      console.log("Updated:", p);
    }
  }
}

walk("src");
