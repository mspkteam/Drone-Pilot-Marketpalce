import { CAPTAINS_CLUB_STANDARDS } from "@/lib/marketing/captains-club-content";

export function CaptainsClubValueProps() {
  return (
    <section className="captains-club-standards" aria-labelledby="captains-club-standards-title">
      <div className="public-container captains-club-standards-inner">
        <p className="captains-club-standards-eyebrow">{CAPTAINS_CLUB_STANDARDS.eyebrow}</p>
        <h2 id="captains-club-standards-title" className="captains-club-standards-title">
          {CAPTAINS_CLUB_STANDARDS.title}
        </h2>
        <div className="captains-club-standards-grid">
          {CAPTAINS_CLUB_STANDARDS.items.map((item) => (
            <article key={item.id} className="captains-club-standards-card">
              <h3 className="captains-club-standards-card-title">{item.title}</h3>
              <p className="captains-club-standards-card-desc">{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
