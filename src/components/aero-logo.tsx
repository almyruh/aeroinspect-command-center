export function AeroLogo({ className = "size-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect x="0.5" y="0.5" width="31" height="31" rx="7" className="fill-surface-raised stroke-border-strong" />
      <path d="M16 6 L26 24 L16 19.5 L6 24 Z" className="fill-primary" />
      <path d="M16 6 L16 19.5 L6 24 Z" className="fill-primary-glow" opacity="0.55" />
      <circle cx="16" cy="15" r="1.6" className="fill-background" />
    </svg>
  );
}
