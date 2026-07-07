/**
 * Remote Air Service — single design scheme reference.
 * All colors/spacing live in globals.css :root. Use Tailwind `ras-*` utilities or `ras-*` CSS classes.
 */
export const brandClasses = {
  btnPrimary: "ras-btn-primary",
  btnOutline: "ras-btn-outline",
  btnDanger: "ras-btn-danger",
  btnHomeGold: "ras-btn-home-gold",
  btnHomeHeroLight: "ras-btn-home-hero-light",
  btnHomeMuted: "ras-btn-home-muted",
  btnTextLink: "ras-btn-text-link",
  eyebrowPill: "ras-eyebrow-pill",
  heroTitle: "ras-hero-title",
  heroBody: "ras-hero-body",
  sectionEyebrow: "ras-section-eyebrow",
  card: "ras-card",
  cardWarm: "ras-card-warm",
  link: "ras-link",
  input: "ras-input",
  badgeGold: "ras-badge ras-badge--gold",
  badgeSuccess: "ras-badge ras-badge--success",
  badgeDanger: "ras-badge ras-badge--danger",
  badgeMuted: "ras-badge ras-badge--muted",
  marketingHeaderNavLink: "ras-marketing-header-nav-link",
  marketingHeaderLogin: "ras-marketing-header-login",
  marketingHeaderCta: "ras-marketing-header-cta",
} as const;

export const brandText = {
  heading: "text-ras-heading",
  body: "text-ras-text",
  warm: "text-ras-warm",
  muted: "text-ras-muted",
  soft: "text-ras-soft",
  dim: "text-ras-dim",
  gold: "text-gold",
  cta: "text-ras-cta",
} as const;

export const brandBg = {
  page: "bg-ras-bg",
  soft: "bg-ras-soft",
  section: "bg-ras-section",
  card: "bg-ras-card",
  cardWarm: "bg-ras-card-warm",
} as const;
