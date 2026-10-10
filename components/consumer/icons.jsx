// Hand-drawn (not sourced) flat line icons for the consumer surface.
// One shared vocabulary — rounded strokes, no fill, currentColor —
// used at small size for steps/trust signals and, for the hero, a
// larger two-tone parcel illustration built from the same language.

export function IconChecklist(props) {
  return (
    <svg viewBox="0 0 40 40" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="9" y="6" width="22" height="28" rx="3" stroke="currentColor" />
      <path d="M15 6.5V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.5" stroke="currentColor" />
      <path d="M14 17l3.2 3L23 14" stroke="currentColor" />
      <path d="M14 26h12" stroke="currentColor" />
    </svg>
  );
}

export function IconParcelHand(props) {
  return (
    <svg viewBox="0 0 40 40" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="11" y="14" width="18" height="15" rx="2.5" stroke="currentColor" />
      <path d="M11 21h18" stroke="currentColor" />
      <path d="M18 14v15" stroke="currentColor" />
      <path d="M9 34c0-3 2-5 4.5-5H18" stroke="currentColor" />
      <path d="M29 34c1.8-.4 3-1.8 3-3.6V27" stroke="currentColor" />
    </svg>
  );
}

export function IconPin(props) {
  return (
    <svg viewBox="0 0 40 40" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path
        d="M20 35s10-9.6 10-17.5A10 10 0 0 0 10 17.5C10 25.4 20 35 20 35Z"
        stroke="currentColor"
      />
      <circle cx="20" cy="17.5" r="3.5" stroke="currentColor" />
    </svg>
  );
}

export function IconShieldCheck(props) {
  return (
    <svg viewBox="0 0 40 40" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20 5l12 4.5v9c0 8-5.2 13.8-12 16.5C13.2 32.3 8 26.5 8 18.5v-9L20 5Z" stroke="currentColor" />
      <path d="M14.5 19.5l3.8 3.8L26 15" stroke="currentColor" />
    </svg>
  );
}

export function IconPulse(props) {
  return (
    <svg viewBox="0 0 40 40" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="20" cy="20" r="3" stroke="currentColor" />
      <path d="M27 20a7 7 0 0 0-7-7" stroke="currentColor" opacity="0.7" />
      <path d="M31.5 20a11.5 11.5 0 0 0-11.5-11.5" stroke="currentColor" opacity="0.4" />
      <path d="M5 24l4 0 2-4 2.5 8 2-4h3" stroke="currentColor" />
    </svg>
  );
}

// Larger two-tone hero illustration: a flat parcel with a taped seam
// and a few motion marks — reads as "a package on its way" without
// being a photo or a scene.
export function IllustrationParcel(props) {
  return (
    <svg viewBox="0 0 320 320" fill="none" {...props}>
      <g strokeLinecap="round" strokeLinejoin="round">
        <line x1="26" y1="128" x2="70" y2="128" stroke="var(--consumer-accent-primary)" strokeWidth="6" opacity="0.35" />
        <line x1="40" y1="156" x2="76" y2="156" stroke="var(--consumer-accent-primary)" strokeWidth="6" opacity="0.5" />
        <line x1="26" y1="184" x2="64" y2="184" stroke="var(--consumer-accent-primary)" strokeWidth="6" opacity="0.35" />

        <rect x="96" y="104" width="168" height="140" rx="12" stroke="var(--consumer-accent-primary)" strokeWidth="7" />
        <path d="M96 148h168" stroke="var(--consumer-accent-primary)" strokeWidth="7" />
        <path d="M118 104l24-34h36l24 34" stroke="var(--consumer-accent-primary)" strokeWidth="7" />

        <line x1="180" y1="104" x2="180" y2="244" stroke="var(--consumer-accent-status)" strokeWidth="8" />
        <line x1="96" y1="176" x2="264" y2="176" stroke="var(--consumer-accent-status)" strokeWidth="8" />
      </g>
    </svg>
  );
}
