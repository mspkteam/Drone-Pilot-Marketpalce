/** Terms & Conditions copy — Figma frame 808:47368 */

export const TERMS_LAST_UPDATED = "08/06/2026";

export type TermsTextPart = {
  text: string;
  href?: string;
};

export type TermsBlock =
  | { type: "paragraph"; parts: TermsTextPart[] }
  | { type: "bullets"; items: string[] }
  | { type: "subheading"; text: string };

export type TermsSection = {
  number: number;
  title: string;
  blocks: TermsBlock[];
};

export const TERMS_INTRO: TermsTextPart[][] = [
  [
    {
      text: 'Welcome to Remote Air Service ("Remote Air Service," "RAS," "we," "our," or "us").',
    },
  ],
  [
    {
      text: 'These Terms and Conditions ("Terms") govern access to and use of the Remote Air Service platform, website, mobile applications, services, communications, and related technologies (collectively, the "Platform").',
    },
  ],
  [
    {
      text: "By creating an account, posting a mission, applying for a mission, accepting a mission, accessing the Platform, or otherwise using any Remote Air Service service, you agree to be legally bound by these Terms.",
    },
  ],
  [{ text: "If you do not agree with these Terms, you must not use the Platform." }],
];

export const TERMS_SECTIONS: TermsSection[] = [
  {
    number: 1,
    title: "PLATFORM PURPOSE",
    blocks: [
      {
        type: "paragraph",
        parts: [
          {
            text: 'Remote Air Service is a marketplace that connects businesses, organizations, government agencies, and individuals ("Clients") with qualified drone operators, remote pilots, aerial service providers, and related professionals ("Providers" or "Pilots").',
          },
        ],
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "Remote Air Service facilitates introductions, communication, project management, payment processing, and dispute resolution but is not a direct employer of Providers and does not directly perform drone services unless expressly stated in writing.",
          },
        ],
      },
    ],
  },
  {
    number: 2,
    title: "ELIGIBILITY",
    blocks: [
      {
        type: "paragraph",
        parts: [{ text: "To use the Platform, users must:" }],
      },
      {
        type: "bullets",
        items: [
          "Be at least eighteen (18) years old.",
          "Have legal authority to enter into binding contracts.",
          "Provide accurate registration information.",
          "Maintain current contact information.",
          "Comply with all applicable laws and regulations.",
        ],
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "Remote Air Service reserves the right to suspend or terminate accounts that provide inaccurate information.",
          },
        ],
      },
    ],
  },
  {
    number: 3,
    title: "ACCOUNT RESPONSIBILITIES",
    blocks: [
      {
        type: "paragraph",
        parts: [{ text: "Users are responsible for:" }],
      },
      {
        type: "bullets",
        items: [
          "Maintaining account security.",
          "Protecting login credentials.",
          "Preventing unauthorized account access.",
          "Immediately reporting suspected security breaches.",
        ],
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "Users are responsible for all activities occurring under their accounts.",
          },
        ],
      },
    ],
  },
  {
    number: 4,
    title: "PRIVACY",
    blocks: [
      {
        type: "paragraph",
        parts: [
          {
            text: "Remote Air Service is committed to protecting user information.",
          },
        ],
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "We maintain administrative, technical, and physical safeguards designed to protect user data and Platform security.",
          },
        ],
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "We do not sell personal information or confidential company information to third parties.",
          },
        ],
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "Our collection, use, storage, and protection of information are governed by our ",
          },
          { text: "Privacy Policy", href: "/privacy" },
          { text: ", which is incorporated into these Terms by reference." },
        ],
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "Users agree to review and comply with the ",
          },
          { text: "Privacy Policy", href: "/privacy" },
          { text: "." },
        ],
      },
    ],
  },
  {
    number: 5,
    title: "PLATFORM AVAILABILITY",
    blocks: [
      {
        type: "paragraph",
        parts: [
          {
            text: "While we strive to maintain continuous Platform availability, Remote Air Service does not guarantee uninterrupted access.",
          },
        ],
      },
      {
        type: "paragraph",
        parts: [{ text: "We reserve the right to:" }],
      },
      {
        type: "bullets",
        items: [
          "Modify Platform features.",
          "Perform maintenance.",
          "Correct errors.",
          "Upgrade systems.",
          "Restrict access when necessary.",
        ],
      },
      {
        type: "paragraph",
        parts: [{ text: "Temporary outages may occur without notice." }],
      },
    ],
  },
  {
    number: 6,
    title: "COMPLIANCE WITH LAWS AND REGULATIONS",
    blocks: [
      {
        type: "paragraph",
        parts: [
          {
            text: "All Clients and Providers agree to comply with all applicable laws, regulations, ordinances, licensing requirements, and aviation rules applicable to their jurisdiction.",
          },
        ],
      },
      {
        type: "paragraph",
        parts: [{ text: "This includes, but is not limited to:" }],
      },
      { type: "subheading", text: "United States" },
      {
        type: "bullets",
        items: [
          "Federal Aviation Administration (FAA) regulations",
          "Part 107 regulations",
          "State laws",
          "Local ordinances",
          "Privacy laws",
          "Property access requirements",
        ],
      },
      { type: "subheading", text: "Canada" },
      {
        type: "bullets",
        items: [
          "Transport Canada regulations",
          "Provincial requirements",
          "Local regulations",
        ],
      },
      { type: "subheading", text: "Western Europe" },
      {
        type: "bullets",
        items: [
          "European Union Aviation Safety Agency (EASA) regulations",
          "National aviation authority requirements",
          "Local municipal requirements",
          "Data privacy regulations",
        ],
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "Providers are solely responsible for obtaining and maintaining any licenses, certifications, waivers, insurance, or approvals necessary to legally perform services.",
          },
        ],
      },
    ],
  },
  {
    number: 7,
    title: "INDEPENDENT CONTRACTOR RELATIONSHIP",
    blocks: [
      {
        type: "paragraph",
        parts: [{ text: "Providers operate as independent contractors." }],
      },
      {
        type: "paragraph",
        parts: [{ text: "Nothing contained in these Terms creates:" }],
      },
      {
        type: "bullets",
        items: [
          "Employment",
          "Partnership",
          "Agency",
          "Joint venture",
          "Franchise relationship between Remote Air Service and any Provider.",
        ],
      },
      {
        type: "paragraph",
        parts: [{ text: "Providers are solely responsible for:" }],
      },
      {
        type: "bullets",
        items: [
          "Taxes",
          "Insurance",
          "Licensing",
          "Equipment",
          "Business expenses",
          "Regulatory compliance",
        ],
      },
      {
        type: "subheading",
        text: "SECTION 7A. PROVIDER BACKGROUND SCREENING",
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "All Providers, Pilots, and Service Professionals seeking to offer services through Remote Air Service acknowledge and agree that Remote Air Service may conduct background screening, identity verification, credential verification, license verification, and related screening processes before approving or maintaining an account.",
          },
        ],
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "By creating a Provider account, applying for missions, or offering services through the Platform, the Provider expressly authorizes Remote Air Service and its authorized third-party screening partners to perform such reviews as permitted by applicable law.",
          },
        ],
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "Remote Air Service reserves the right to request additional documentation at any time, including but not limited to:",
          },
        ],
      },
      {
        type: "bullets",
        items: [
          "Government-issued identification",
          "FAA certificates",
          "Aviation licenses",
          "Insurance documentation",
          "Business registrations",
          "Proof of address",
          "Continuing education records",
          "Other documentation deemed necessary for Platform safety and compliance",
        ],
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "Remote Air Service may deny, suspend, restrict, or terminate any account based upon information obtained during screening processes.",
          },
        ],
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "Grounds for denial or removal may include, but are not limited to:",
          },
        ],
      },
      {
        type: "bullets",
        items: [
          "Violent criminal offenses",
          "Sexual offenses",
          "Fraud-related offenses",
          "Theft-related offenses",
          "Financial crimes",
          "Identity theft",
          "Aviation-related violations",
          "Regulatory enforcement actions",
          "Falsification of records",
          "Material misrepresentations made to Remote Air Service",
        ],
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "Remote Air Service is under no obligation to disclose specific screening results or reasons for denial beyond what is required by applicable law. Completion of a screening process does not constitute a guarantee of future conduct, competence, safety, or reliability of any Provider.",
          },
        ],
      },
      {
        type: "subheading",
        text: "SECTION 7B. NO GUARANTEE OF WORK, REVENUE, CLIENTS, OR MISSION VOLUME",
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "Remote Air Service provides a technology platform designed to facilitate connections between Clients seeking aerial services and Providers offering such services.",
          },
        ],
      },
      {
        type: "paragraph",
        parts: [{ text: "Participation on the Platform does not guarantee:" }],
      },
      {
        type: "bullets",
        items: [
          "Mission opportunities",
          "Project invitations",
          "Client inquiries",
          "Selection for any mission",
          "Mission awards",
          "Contract awards",
          "Geographic coverage",
          "Business opportunities",
          "Revenue",
          "Earnings",
          "Profitability",
          "Frequency of work",
          "Continued availability of the Platform",
          "Availability of Clients in any particular region or market",
        ],
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "Providers acknowledge and agree that mission opportunities may vary significantly based upon numerous factors, including but not limited to:",
          },
        ],
      },
      {
        type: "bullets",
        items: [
          "Geographic location",
          "Market demand",
          "Competition among Providers",
          "Provider qualifications",
          "Provider ratings and reviews",
          "Regulatory requirements",
          "Seasonal factors",
          "Economic conditions",
          "Client preferences",
          "Platform growth and development",
        ],
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "Clients likewise acknowledge that Remote Air Service does not guarantee:",
          },
        ],
      },
      {
        type: "bullets",
        items: [
          "Provider availability",
          "Provider response times",
          "Provider acceptance of missions",
          "Mission completion timeframes",
          "Availability of Providers possessing specialized qualifications or equipment",
        ],
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "Any estimates, projections, marketing materials, promotional materials, onboarding materials, pilot recruitment materials, presentations, communications, or statements regarding potential mission opportunities, earnings, business growth, platform expansion, market demand, or future opportunities are provided for informational purposes only and shall not be interpreted as guarantees, promises, warranties, or contractual commitments. Providers are solely responsible for evaluating whether participation on the Platform is appropriate for their individual business goals, financial circumstances, equipment investments, operational expenses, and professional objectives. Remote Air Service shall not be liable for any losses, expenses, business decisions, equipment purchases, staffing decisions, missed opportunities, lost profits, lost revenue, or other damages arising from a Provider's expectation of receiving future work, missions, contracts, or income through the Platform. By using the Platform, Providers acknowledge that participation is voluntary and that no minimum level of mission opportunities, revenue, earnings, or business activity is guaranteed.",
          },
        ],
      },
    ],
  },
  {
    number: 8,
    title: "PLATFORM-ONLY TRANSACTIONS",
    blocks: [
      {
        type: "paragraph",
        parts: [
          {
            text: "To protect Clients, Providers, project records, reviews, payment security, dispute resolution, and customer support, all project communications, contracts, and payments must remain on the Platform.",
          },
        ],
      },
      {
        type: "paragraph",
        parts: [{ text: "Users agree not to:" }],
      },
      {
        type: "bullets",
        items: [
          "Exchange direct payment information.",
          "Accept cash payments.",
          "Send or receive PayPal payments.",
          "Accept bank transfers.",
          "Accept wire transfers.",
          "Process credit card transactions independently.",
          "Circumvent Platform payment systems.",
        ],
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "This restriction applies to all current and future projects between a Client and Provider, regardless of how many projects have previously been completed together.",
          },
        ],
      },
      {
        type: "subheading",
        text: "SECTION 8A. NON-SOLICITATION AND PLATFORM PROTECTION",
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "Clients and Providers acknowledge that Remote Air Service invests substantial resources into marketing, recruitment, screening, technology development, payment processing, dispute resolution, and platform operations. Accordingly, Clients and Providers agree not to circumvent the Platform by directly soliciting, contracting with, hiring, employing, subcontracting, or otherwise conducting business with one another outside the Platform when the relationship originated through Remote Air Service. This restriction applies during active use of the Platform and for a period of twenty-four (24) months following the most recent transaction between the parties conducted through Remote Air Service.",
          },
        ],
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "Any attempt to avoid Platform fees or protections through off-platform arrangements may result in: immediate account suspension; permanent account termination; cancellation of pending transactions; forfeiture of promotional benefits; refusal of future Platform services. Remote Air Service reserves the right to pursue any additional remedies available under applicable law.",
          },
        ],
      },
      {
        type: "subheading",
        text: "SECTION 8B. AFFILIATED ENTITIES, SUCCESSOR ACCOUNTS, AND BUSINESS ENTITY ENFORCEMENT",
      },
      {
        type: "paragraph",
        parts: [
          {
            text: 'Remote Air Service reserves the right to enforce these Terms and Conditions against any individual or entity that participates in, assists with, benefits from, or attempts to circumvent the Platform\'s policies, payment systems, security measures, fee structures, or operational requirements. For purposes of enforcement, "related parties" may include, but are not limited to:',
          },
        ],
      },
      {
        type: "bullets",
        items: [
          "Individual users",
          "Business entities",
          "Parent companies",
          "Subsidiaries",
          "Affiliates",
          "Partners",
          "Officers",
          "Directors",
          "Owners",
          "Shareholders",
          "Employees",
          "Contractors",
          "Agents",
          "Representatives",
          "Successor entities",
          "Newly formed entities established after enforcement actions",
        ],
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "If Remote Air Service reasonably determines that a user, company, or related party has violated these Terms, including but not limited to off-platform transactions, fraud, payment circumvention, abuse of the Platform, misrepresentation, or other prohibited conduct, Remote Air Service may take enforcement action against any associated account or related party involved in such conduct.",
          },
        ],
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "Such actions may include: account suspension; account restriction; permanent account termination; refusal of future services; cancellation of pending transactions; removal of reviews or ratings obtained through prohibited conduct; withholding of payouts pending investigation; recovery of damages, fees, costs, or losses permitted by applicable law.",
          },
        ],
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "Users may not evade enforcement actions by creating new accounts, establishing new business entities, using alternate identities, utilizing affiliated organizations, or directing third parties to conduct activities prohibited under these Terms. Remote Air Service reserves the right to investigate relationships between accounts and entities to protect the integrity of the Platform, its users, and its business operations. Any attempt to evade Platform enforcement measures shall constitute a material breach of these Terms and may result in immediate and permanent removal from the Platform.",
          },
        ],
      },
    ],
  },
  {
    number: 9,
    title: "CIRCUMVENTION PROHIBITED",
    blocks: [
      {
        type: "paragraph",
        parts: [
          {
            text: "Any attempt to avoid Platform fees or remove transactions from the Platform is strictly prohibited.",
          },
        ],
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "If Remote Air Service determines that users are circumventing Platform services, we may: suspend accounts; restrict account functionality; remove reviews; cancel projects; withhold payouts pending investigation; permanently terminate accounts; refuse future service. These actions may be applied to individual users, companies, related accounts, or affiliated entities at our sole discretion.",
          },
        ],
      },
    ],
  },
  {
    number: 10,
    title: "CUSTOMER SUPPORT LIMITATIONS",
    blocks: [
      {
        type: "paragraph",
        parts: [
          {
            text: "Remote Air Service customer support, project mediation, dispute review, payment protection, and review protections only apply to transactions conducted entirely through the Platform.",
          },
        ],
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "If a Client and Provider choose to conduct business outside the Platform: Remote Air Service cannot verify the transaction; Remote Air Service cannot guarantee project performance; Remote Air Service cannot provide payment protection; Remote Air Service cannot provide dispute resolution; Remote Air Service cannot provide refunds; Remote Air Service cannot enforce project terms. All risks associated with off-platform transactions are assumed entirely by the participating parties.",
          },
        ],
      },
    ],
  },
  {
    number: 11,
    title: "FEES AND COMMISSIONS",
    blocks: [
      {
        type: "paragraph",
        parts: [
          {
            text: "Remote Air Service may charge fees to Clients, Providers, or both.",
          },
        ],
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "Provider commission rates may vary. Provider fees may range from 0% to 15% depending upon: promotional programs; pilot incentive programs; volume discounts; strategic partnerships; special circumstances; launch promotions. Commission rates may be changed at any time with reasonable notice. Client service fees, processing fees, taxes, and related transaction charges may be included within project pricing or displayed separately. By using the Platform, users agree to all applicable fees disclosed at the time of transaction.",
          },
        ],
      },
    ],
  },
];
