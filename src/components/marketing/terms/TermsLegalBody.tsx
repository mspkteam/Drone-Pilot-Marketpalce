import Link from "next/link";
import {
  TERMS_SECTIONS,
  type TermsBlock,
  type TermsTextPart,
} from "@/lib/marketing/terms-content";

function TermsParagraph({ parts }: { parts: TermsTextPart[] }) {
  return (
    <p className="terms-legal-paragraph">
      {parts.map((part, index) =>
        part.href ? (
          <Link key={`${part.href}-${index}`} href={part.href} className="terms-legal-link">
            {part.text}
          </Link>
        ) : (
          <span key={`${part.text.slice(0, 24)}-${index}`}>{part.text}</span>
        ),
      )}
    </p>
  );
}

function TermsBlockView({ block }: { block: TermsBlock }) {
  switch (block.type) {
    case "paragraph":
      return <TermsParagraph parts={block.parts} />;
    case "subheading":
      return <h3 className="terms-legal-subheading">{block.text}</h3>;
    case "bullets":
      return (
        <ul className="terms-legal-list">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    default:
      return null;
  }
}

type TermsLegalBodyProps = {
  headingLevel?: "h2" | "h3";
  className?: string;
};

export function TermsLegalBody({
  headingLevel = "h2",
  className,
}: TermsLegalBodyProps) {
  const Heading = headingLevel;

  return (
    <div className={className}>
      {TERMS_SECTIONS.map((section) => (
        <article key={section.number} className="terms-legal-section">
          <Heading className="terms-legal-heading">
            {section.number}. {section.title}
          </Heading>
          <div className="terms-legal-section-body">
            {section.blocks.map((block, index) => (
              <TermsBlockView key={`${section.number}-${index}`} block={block} />
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}
