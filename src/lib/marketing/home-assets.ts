/**
 * Homepage media — mapped from Figma frame 97:2145 exports in /public/marketing.
 * Original Figma layer names preserved in comments.
 */

export const homeAssets = {
  /** Group 250 — primary RAS seal (header, footer, dashboard) */
  logo: "/marketing/Group 250.png",
  logoFooter: "/marketing/Group 250.png",
  /** image 2 (2) — site favicon */
  favicon: "/marketing/image 2 (2).png",

  /** hero-drone.jpg — Client Pathway (97:2226) */
  heroDrone: "/marketing/hero-drone.jpg",
  /** hero-pilot.jpg — Pilot Pathway (97:2240) */
  heroPilot: "/marketing/hero-pilot.jpg",

  trust: {
    /** Container 97:2151 — Verified Licensed Pilots */
    verified: "/marketing/icon-trust-verified.png",
    /** Container 97:2159 — FAA Part 107 */
    faa: "/marketing/icon-trust-faa.png",
    /** Container 97:2167 — Secure Payments */
    payments: "/marketing/icon-trust-payments.png",
  },

  capabilities: {
    /** Background+Border 97:2393 — USA */
    usa: "/marketing/icon-capability-usa.png",
    /** Background+Border 97:2403 — Europe */
    europe: "/marketing/icon-capability-europe.png",
    /** Background+Border (2) — map panel (97:2411) */
    map: "/marketing/capabilities-map.png",
  },

  ranks: {
    /** bdg 2 — A-1 Student (171:50) */
    a1: "/marketing/rank-a1.png",
    a2: "/marketing/rank-a2.png",
    a3: "/marketing/rank-a3.png",
    a4: "/marketing/rank-a4.png",
    a5: "/marketing/rank-a5.png",
    a6: "/marketing/rank-a6.png",
  },

  footer: {
    /** Link 97:2624 */
    socialShare: "/marketing/icon-social-share.png",
    /** Link 97:2626 */
    socialGlobe: "/marketing/icon-social-globe.png",
  },
} as const;
