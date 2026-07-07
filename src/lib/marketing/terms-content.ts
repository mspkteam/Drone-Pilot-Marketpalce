/** Terms & Conditions copy — Figma frame 808:47368 */

export const TERMS_EFFECTIVE_DATE = "August 1, 2026";
export const TERMS_LAST_UPDATED = "August 1, 2026";

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
        parts: [{ text: "Provider commission rates may vary." }],
      },
      {
        type: "paragraph",
        parts: [{ text: "Provider fees may range from 0% to 15% depending upon:" }],
      },
      {
        type: "bullets",
        items: [
          "Promotional programs",
          "Pilot incentive programs",
          "Volume discounts",
          "Strategic partnerships",
          "Special circumstances",
          "Launch promotions",
        ],
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "Commission rates may be changed at any time with reasonable notice.",
          },
        ],
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "Client service fees, processing fees, taxes, and related transaction charges may be included within project pricing or displayed separately.",
          },
        ],
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "By using the Platform, users agree to all applicable fees disclosed at the time of transaction.",
          },
        ],
      },
    ],
  },
  {
    number: 12,
    title: "PAYMENTS",
    blocks: [
      {
        type: "paragraph",
        parts: [
          {
            text: "Payments are processed through approved payment providers selected by Remote Air Service.",
          },
        ],
      },
      {
        type: "paragraph",
        parts: [{ text: "Users authorize Remote Air Service and its payment partners to:" }],
      },
      {
        type: "bullets",
        items: [
          "Process transactions",
          "Hold funds when necessary",
          "Resolve disputes",
          "Issue refunds when appropriate",
          "Deduct applicable fees",
        ],
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "Remote Air Service reserves the right to delay payouts when fraud, disputes, compliance concerns, or suspicious activity are suspected.",
          },
        ],
      },
      {
        type: "subheading",
        text: "SECTION 12A. CHARGEBACKS AND PAYMENT DISPUTES",
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "Clients agree not to initiate chargebacks, payment reversals, bank disputes, or credit card disputes for missions that have been substantially completed according to the agreed project requirements.",
          },
        ],
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "Before initiating any payment dispute, Clients agree to utilize the Platform's dispute resolution process.",
          },
        ],
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "If a chargeback or payment reversal is initiated after Remote Air Service determines that services were substantially completed, Remote Air Service may:",
          },
        ],
      },
      {
        type: "bullets",
        items: [
          "Suspend the Client account",
          "Restrict future Platform access",
          "Recover associated chargeback fees",
          "Offset future account balances",
          "Refer unpaid balances for collection",
        ],
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "Nothing herein limits a user's rights under applicable consumer protection laws.",
          },
        ],
      },
    ],
  },
  {
    number: 13,
    title: "PROJECT ACCEPTANCE AND DELIVERY",
    blocks: [
      {
        type: "paragraph",
        parts: [{ text: "Providers agree to:" }],
      },
      {
        type: "bullets",
        items: [
          "Deliver services professionally.",
          "Meet project requirements.",
          "Maintain communication.",
          "Perform services safely and legally.",
        ],
      },
      {
        type: "paragraph",
        parts: [{ text: "Clients agree to:" }],
      },
      {
        type: "bullets",
        items: [
          "Provide accurate project information.",
          "Grant necessary site access.",
          "Cooperate reasonably with project completion.",
        ],
      },
      {
        type: "paragraph",
        parts: [{ text: "Project completion shall be determined based upon:" }],
      },
      {
        type: "bullets",
        items: [
          "Mission requirements",
          "Deliverables",
          "Communications",
          "Documentation",
          "Applicable industry standards",
        ],
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "as reviewed by Remote Air Service.",
          },
        ],
      },
      {
        type: "subheading",
        text: "SECTION 13A. WEATHER, AIRSPACE, SAFETY, ACCESS, AND MISSION INTERRUPTIONS",
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "Drone operations are inherently dependent upon weather conditions, airspace availability, operational safety considerations, site accessibility, regulatory requirements, and circumstances outside the control of Remote Air Service and its Providers.",
          },
        ],
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "Accordingly, Clients acknowledge and agree that a scheduled mission may be delayed, rescheduled, modified, interrupted, suspended, or canceled when necessary due to factors including, but not limited to:",
          },
        ],
      },
      {
        type: "bullets",
        items: [
          "Unsafe weather conditions",
          "High winds",
          "Rain, snow, hail, or ice",
          "Lightning or thunderstorms",
          "Reduced visibility",
          "Smoke, haze, or environmental hazards",
          "Excessive heat or cold affecting equipment performance",
          "Temporary Flight Restrictions (TFRs)",
          "Restricted or prohibited airspace",
          "Military operations",
          "Law enforcement activities",
          "Emergency response operations",
          "Aviation authority directives",
          "GPS interference",
          "Radio frequency interference",
          "Equipment malfunctions",
          "Site safety concerns",
          "Dangerous conditions affecting people or property",
          "Property access denial",
          "Landowner restrictions",
          "Security restrictions",
          "Any circumstance that, in the Provider's reasonable judgment, would create an unsafe, unlawful, or impractical operating environment",
        ],
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "The Provider serving as Pilot in Command shall have sole authority to determine whether flight operations may be conducted safely and legally.",
          },
        ],
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "Neither the Client nor Remote Air Service may require a Provider to conduct a flight that the Provider reasonably believes would violate applicable laws, regulations, safety standards, manufacturer guidance, insurance requirements, or accepted aviation practices.",
          },
        ],
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "If a mission cannot be completed due to circumstances beyond the reasonable control of the Provider, Remote Air Service, or the Client, the parties shall make reasonable efforts to reschedule the mission at a mutually agreeable time.",
          },
        ],
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "In situations where a Provider has already traveled to the mission location, incurred expenses, performed pre-flight planning, obtained authorizations, reserved airspace access, conducted site inspections, or otherwise expended substantial effort in preparation for the mission, the Provider may be entitled to partial compensation, cancellation fees, travel reimbursement, or other compensation as determined under the applicable project terms.",
          },
        ],
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "Remote Air Service reserves the right to review mission circumstances and determine appropriate compensation, credits, rescheduling options, or other remedies on a case-by-case basis.",
          },
        ],
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "Mission delays, interruptions, or cancellations resulting from weather, airspace restrictions, safety concerns, regulatory requirements, site access limitations, or similar circumstances shall not automatically entitle a Client to a refund.",
          },
        ],
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "Where mission performance is prevented by factors outside the control of the parties, Remote Air Service may offer rescheduling, account credits, or alternative accommodations at its sole discretion.",
          },
        ],
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "Clients acknowledge that aviation safety, regulatory compliance, and protection of persons and property shall take precedence over project schedules, deadlines, or delivery expectations.",
          },
        ],
      },
      {
        type: "subheading",
        text: "SECTION 13B. CLIENT SITE RESPONSIBILITY, PROPERTY ACCESS, AND OPERATIONAL PERMISSIONS",
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "Clients are solely responsible for ensuring that they possess all necessary rights, permissions, authorizations, approvals, and legal authority required to request, authorize, and receive services at the proposed mission location.",
          },
        ],
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "By posting a mission or engaging a Provider through Remote Air Service, the Client represents and warrants that:",
          },
        ],
      },
      {
        type: "bullets",
        items: [
          "The Client has the legal authority to request services at the designated location",
          "Any required property owner permissions have been obtained",
          "Any required tenant permissions have been obtained",
          "Any required site access permissions have been obtained",
          "The requested services do not violate applicable laws, regulations, ordinances, contractual obligations, property restrictions, or governmental requirements",
          "The Client has disclosed any known hazards or restrictions that may affect mission planning or execution",
        ],
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "Clients agree to provide accurate information regarding site conditions, including but not limited to:",
          },
        ],
      },
      {
        type: "bullets",
        items: [
          "Access limitations",
          "Security requirements",
          "Restricted areas",
          "Construction activity",
          "Hazardous conditions",
          "Power lines",
          "Utility infrastructure",
          "Sensitive facilities",
          "Wildlife concerns",
          "Temporary restrictions",
          "Any known condition that could affect safe mission performance",
        ],
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "Providers reserve the right to suspend, postpone, modify, or terminate mission activities if actual site conditions materially differ from those represented by the Client or if previously undisclosed hazards, restrictions, or legal concerns are identified.",
          },
        ],
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "Remote Air Service and its Providers shall not be responsible for delays, interruptions, additional expenses, or mission modifications resulting from inaccurate, incomplete, or misleading information provided by a Client.",
          },
        ],
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "Clients acknowledge that certain locations may be subject to restrictions imposed by:",
          },
        ],
      },
      {
        type: "bullets",
        items: [
          "Property owners",
          "Homeowners associations",
          "Commercial property managers",
          "Government agencies",
          "Military installations",
          "Airports",
          "Utility operators",
          "Critical infrastructure operators",
          "Public safety agencies",
          "Other entities possessing lawful authority over the location",
        ],
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "If a mission cannot be completed due to the Client's failure to obtain required permissions, approvals, access rights, or authorizations, the Client may remain responsible for applicable mission fees, travel expenses, scheduling costs, cancellation fees, airspace authorization expenses, and other costs incurred in preparation for the mission.",
          },
        ],
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "Clients further agree to defend, indemnify, and hold harmless Remote Air Service, its affiliates, officers, directors, employees, contractors, agents, and Providers from and against any claims, demands, actions, liabilities, damages, fines, penalties, losses, costs, or expenses arising from:",
          },
        ],
      },
      {
        type: "bullets",
        items: [
          "Unauthorized property access requests",
          "Failure to obtain required permissions",
          "Misrepresentations regarding site ownership or authority",
          "Violations of property rights",
          "Violations of contractual access restrictions",
          "Violations of local ordinances or site-specific requirements",
          "Any claim arising from the Client's lack of authority to authorize the requested services",
        ],
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "Nothing in this section shall be interpreted as transferring responsibility for aviation regulatory compliance from the Provider acting as Pilot in Command. Providers remain responsible for conducting flight operations in accordance with applicable aviation laws and safety requirements.",
          },
        ],
      },
    ],
  },
  {
    number: 14,
    title: "REFUND POLICY",
    blocks: [
      {
        type: "paragraph",
        parts: [
          {
            text: "Mission fees are generally non-refundable once a mission has been completed and deliverables have been provided.",
          },
        ],
      },
      {
        type: "paragraph",
        parts: [{ text: "If a Client disputes a completed mission:" }],
      },
      {
        type: "bullets",
        items: [
          "Remote Air Service may conduct a review.",
          "Platform staff may examine evidence submitted by both parties.",
          "A determination will be made regarding whether the mission was substantially completed according to project requirements.",
        ],
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "If Remote Air Service determines that the mission was completed according to agreed standards, no refund shall be issued.",
          },
        ],
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "In some circumstances, Remote Air Service may offer a promotional credit, discount, or goodwill accommodation toward a future mission.",
          },
        ],
      },
      {
        type: "paragraph",
        parts: [{ text: "Such accommodations:" }],
      },
      {
        type: "bullets",
        items: [
          "Are discretionary.",
          "Are not guaranteed.",
          "Do not establish future obligations.",
        ],
      },
    ],
  },
  {
    number: 15,
    title: "DISPUTE RESOLUTION",
    blocks: [
      {
        type: "paragraph",
        parts: [
          {
            text: "Remote Air Service reserves the right to review project disputes and make administrative determinations regarding:",
          },
        ],
      },
      {
        type: "bullets",
        items: [
          "Deliverables",
          "Communications",
          "Project completion",
          "Refund eligibility",
          "Account actions",
        ],
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "Platform determinations are final for purposes of Platform administration.",
          },
        ],
      },
    ],
  },
  {
    number: 16,
    title: "PROHIBITED ACTIVITIES",
    blocks: [
      {
        type: "paragraph",
        parts: [{ text: "Users may not:" }],
      },
      {
        type: "bullets",
        items: [
          "Violate laws or regulations.",
          "Provide false information.",
          "Impersonate others.",
          "Circumvent Platform fees.",
          "Harass users.",
          "Upload malicious software.",
          "Interfere with Platform operations.",
          "Infringe intellectual property rights.",
          "Engage in fraud.",
          "Misrepresent qualifications or certifications.",
        ],
      },
    ],
  },
  {
    number: 17,
    title: "INTELLECTUAL PROPERTY",
    blocks: [
      {
        type: "paragraph",
        parts: [
          {
            text: "Remote Air Service retains all rights, title, and interest in:",
          },
        ],
      },
      {
        type: "bullets",
        items: [
          "Platform software",
          "Branding",
          "Logos",
          "Designs",
          "Technology",
          "Content",
        ],
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "Users may not reproduce or distribute Platform materials without written permission.",
          },
        ],
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "Providers retain ownership of their pre-existing intellectual property unless otherwise agreed in writing.",
          },
        ],
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "Project deliverables transfer according to project-specific agreements.",
          },
        ],
      },
    ],
  },
  {
    number: 18,
    title: "USER CONTENT",
    blocks: [
      {
        type: "paragraph",
        parts: [
          {
            text: "Users grant Remote Air Service a limited license to host, display, process, and store content necessary to operate the Platform.",
          },
        ],
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "Users represent that they possess all necessary rights to content submitted to the Platform.",
          },
        ],
      },
    ],
  },
  {
    number: 19,
    title: "INSURANCE",
    blocks: [
      {
        type: "paragraph",
        parts: [
          {
            text: "Providers are encouraged and may be required to maintain appropriate insurance coverage.",
          },
        ],
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "Remote Air Service may require proof of insurance before permitting participation in certain projects.",
          },
        ],
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "Failure to maintain required coverage may result in suspension.",
          },
        ],
      },
      {
        type: "subheading",
        text: "SECTION 19A. FLIGHT OPERATIONS RESPONSIBILITY",
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "Providers retain sole responsibility for all flight operations conducted through the Platform.",
          },
        ],
      },
      {
        type: "paragraph",
        parts: [{ text: "Providers are solely responsible for:" }],
      },
      {
        type: "bullets",
        items: [
          "Aircraft operation",
          "Airspace compliance",
          "Flight planning",
          "Safety procedures",
          "Visual observers",
          "Equipment maintenance",
          "Mission execution",
          "Aviation regulatory compliance",
        ],
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "Remote Air Service does not direct, supervise, control, or operate any aircraft involved in Provider missions.",
          },
        ],
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "The Provider serving the mission remains the Pilot in Command and bears all responsibilities associated with that role under applicable aviation regulations.",
          },
        ],
      },
    ],
  },
  {
    number: 20,
    title: "DISCLAIMER OF WARRANTIES",
    blocks: [
      {
        type: "paragraph",
        parts: [
          {
            text: 'The Platform is provided on an "AS IS" and "AS AVAILABLE" basis.',
          },
        ],
      },
      {
        type: "paragraph",
        parts: [{ text: "Remote Air Service makes no guarantee regarding:" }],
      },
      {
        type: "bullets",
        items: [
          "Platform availability",
          "Mission volume",
          "Earnings",
          "Business opportunities",
          "Project outcomes",
          "User conduct",
        ],
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "To the fullest extent permitted by law, all warranties are disclaimed.",
          },
        ],
      },
      {
        type: "subheading",
        text: "SECTION 20A. MARKETPLACE AND TECHNOLOGY PLATFORM DISCLAIMER",
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "Remote Air Service is a technology marketplace that facilitates connections between Clients and Providers.",
          },
        ],
      },
      {
        type: "paragraph",
        parts: [{ text: "Remote Air Service is not:" }],
      },
      {
        type: "bullets",
        items: [
          "An air carrier",
          "An aviation operator",
          "A drone operator",
          "A flight contractor",
          "A transportation provider",
        ],
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "unless expressly identified in a separate written agreement.",
          },
        ],
      },
      {
        type: "paragraph",
        parts: [{ text: "Remote Air Service does not guarantee:" }],
      },
      {
        type: "bullets",
        items: [
          "Mission availability",
          "Provider availability",
          "Provider qualifications",
          "Mission outcomes",
          "Client conduct",
          "Provider conduct",
        ],
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "Remote Air Service's role is limited to facilitating marketplace transactions and related services.",
          },
        ],
      },
      {
        type: "subheading",
        text: "SECTION 20B. FAA, EASA, AND REGULATORY VERIFICATION RIGHTS",
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "Remote Air Service reserves the right to verify, monitor, audit, or request documentation regarding a Provider's qualifications, certifications, licenses, insurance coverage, regulatory compliance, and operational authority at any time.",
          },
        ],
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "Failure to provide requested documentation within a reasonable period may result in:",
          },
        ],
      },
      {
        type: "bullets",
        items: [
          "Account suspension",
          "Mission restrictions",
          "Removal from the Platform",
        ],
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "Remote Air Service may report suspected regulatory violations to applicable governmental authorities when required by law or necessary to protect Platform integrity.",
          },
        ],
      },
      {
        type: "subheading",
        text: "SECTION 20C. INSURANCE VERIFICATION REQUIREMENTS",
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "Remote Air Service may require Providers to maintain liability insurance and other aviation-related coverage as determined appropriate for Platform participation.",
          },
        ],
      },
      {
        type: "paragraph",
        parts: [{ text: "Insurance requirements may vary by:" }],
      },
      {
        type: "bullets",
        items: [
          "Mission type",
          "Equipment used",
          "Jurisdiction",
          "Client requirements",
          "Operational risk factors",
        ],
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "Failure to maintain required insurance may result in account restrictions or termination.",
          },
        ],
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "Verification of insurance by Remote Air Service does not create any guarantee regarding coverage, claims handling, or insurer solvency.",
          },
        ],
      },
      {
        type: "subheading",
        text: "SECTION 20D. MEDIA AND MARKETING LICENSE",
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "Unless otherwise agreed in writing or restricted by applicable law, Providers and Clients grant Remote Air Service a limited, non-exclusive, worldwide, royalty-free license to display, reproduce, and use project-related photographs, videos, renderings, screenshots, testimonials, reviews, project descriptions, and related materials for:",
          },
        ],
      },
      {
        type: "bullets",
        items: [
          "Marketing",
          "Advertising",
          "Investor presentations",
          "Public relations",
          "Social media promotion",
          "Website content",
          "Business development purposes",
        ],
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "Users may request confidentiality restrictions in writing prior to project commencement.",
          },
        ],
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "Remote Air Service reserves the right to approve or deny confidentiality requests based on operational requirements and contractual obligations.",
          },
        ],
      },
      {
        type: "subheading",
        text: "SECTION 20E. CONFIDENTIALITY OF CLIENT INFORMATION",
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "Providers agree to protect confidential, proprietary, and sensitive information received from Clients.",
          },
        ],
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "Unless authorized by the Client or required by law, Providers shall not disclose:",
          },
        ],
      },
      {
        type: "bullets",
        items: [
          "Trade secrets",
          "Proprietary business information",
          "Security-sensitive information",
          "Internal operational data",
          "Client contact databases",
          "Protected project materials",
        ],
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "Violation of confidentiality obligations may result in immediate account termination and legal action where appropriate.",
          },
        ],
      },
      {
        type: "subheading",
        text: "SECTION 20F. LIMITATION OF PLATFORM VETTING",
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "While Remote Air Service conducts screening and verification processes designed to promote safety and professionalism, no screening process can guarantee future conduct.",
          },
        ],
      },
      {
        type: "paragraph",
        parts: [{ text: "Users acknowledge that:" }],
      },
      {
        type: "bullets",
        items: [
          "Background screenings have limitations.",
          "Regulatory records may change.",
          "Insurance coverage may lapse.",
          "Certifications may expire.",
          "Human behavior cannot be predicted.",
        ],
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "Accordingly, Clients remain responsible for exercising reasonable business judgment when selecting Providers, and Providers remain responsible for evaluating Clients and mission opportunities.",
          },
        ],
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "Remote Air Service makes no guarantee regarding the future actions, qualifications, performance, or reliability of any Platform user.",
          },
        ],
      },
    ],
  },
  {
    number: 21,
    title: "LIMITATION OF LIABILITY",
    blocks: [
      {
        type: "paragraph",
        parts: [
          {
            text: "To the maximum extent permitted by law, Remote Air Service shall not be liable for:",
          },
        ],
      },
      {
        type: "bullets",
        items: [
          "Lost profits",
          "Lost revenue",
          "Business interruption",
          "Consequential damages",
          "Indirect damages",
          "Special damages",
          "Punitive damages",
        ],
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "arising from use of the Platform.",
          },
        ],
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "Remote Air Service's maximum aggregate liability shall not exceed the total fees paid by the user to Remote Air Service during the twelve (12) months preceding the claim.",
          },
        ],
      },
    ],
  },
  {
    number: 22,
    title: "INDEMNIFICATION",
    blocks: [
      {
        type: "paragraph",
        parts: [
          {
            text: "Users agree to defend, indemnify, and hold harmless Remote Air Service, its officers, directors, employees, contractors, and affiliates from any claims, damages, liabilities, costs, and expenses arising from:",
          },
        ],
      },
      {
        type: "bullets",
        items: [
          "User conduct",
          "Regulatory violations",
          "Project performance",
          "Breach of these Terms",
          "Third-party claims",
        ],
      },
    ],
  },
  {
    number: 23,
    title: "ARBITRATION AGREEMENT",
    blocks: [
      {
        type: "paragraph",
        parts: [
          {
            text: "Any dispute arising out of or relating to these Terms, the Platform, or services provided through the Platform shall be resolved through binding arbitration.",
          },
        ],
      },
      {
        type: "paragraph",
        parts: [{ text: "Users waive the right to:" }],
      },
      {
        type: "bullets",
        items: ["Jury trials", "Class actions", "Representative actions"],
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "Arbitration shall be conducted under the applicable arbitration rules in effect at the time of filing.",
          },
        ],
      },
    ],
  },
  {
    number: 24,
    title: "GOVERNING LAW",
    blocks: [
      {
        type: "paragraph",
        parts: [
          {
            text: "These Terms shall be governed by and interpreted under the laws of the State of Texas, United States, without regard to conflict-of-law principles.",
          },
        ],
      },
    ],
  },
  {
    number: 25,
    title: "VENUE",
    blocks: [
      {
        type: "paragraph",
        parts: [
          {
            text: "If a dispute is determined by a court to be non-arbitrable, exclusive jurisdiction and venue shall lie in the state or federal courts located in Texas.",
          },
        ],
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "Users consent to such jurisdiction and venue.",
          },
        ],
      },
    ],
  },
  {
    number: 26,
    title: "FORCE MAJEURE",
    blocks: [
      {
        type: "paragraph",
        parts: [
          {
            text: "Remote Air Service shall not be liable for delays or failures resulting from circumstances beyond its reasonable control, including:",
          },
        ],
      },
      {
        type: "bullets",
        items: [
          "Weather",
          "Natural disasters",
          "Power outages",
          "Internet disruptions",
          "Government actions",
          "Aviation restrictions",
          "Labor disputes",
          "Cybersecurity incidents",
        ],
      },
    ],
  },
  {
    number: 27,
    title: "ACCOUNT TERMINATION",
    blocks: [
      {
        type: "paragraph",
        parts: [
          {
            text: "Remote Air Service may suspend or terminate accounts at any time when:",
          },
        ],
      },
      {
        type: "bullets",
        items: [
          "Terms are violated.",
          "Fraud is suspected.",
          "Platform security is threatened.",
          "Regulatory concerns arise.",
          "Business interests require account removal.",
        ],
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "Termination decisions are made at Remote Air Service's sole discretion.",
          },
        ],
      },
    ],
  },
  {
    number: 28,
    title: "MODIFICATIONS TO TERMS",
    blocks: [
      {
        type: "paragraph",
        parts: [
          {
            text: "Remote Air Service may update these Terms periodically.",
          },
        ],
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "Updated Terms become effective upon posting to the Platform.",
          },
        ],
      },
      {
        type: "paragraph",
        parts: [
          {
            text: "Continued use of the Platform constitutes acceptance of revised Terms.",
          },
        ],
      },
    ],
  },
  {
    number: 29,
    title: "SEVERABILITY",
    blocks: [
      {
        type: "paragraph",
        parts: [
          {
            text: "If any provision of these Terms is found unenforceable, the remaining provisions shall remain in full force and effect.",
          },
        ],
      },
    ],
  },
  {
    number: 30,
    title: "ENTIRE AGREEMENT",
    blocks: [
      {
        type: "paragraph",
        parts: [
          {
            text: "These Terms, together with the Privacy Policy and any incorporated policies, constitute the entire agreement between users and Remote Air Service regarding Platform use.",
          },
        ],
      },
    ],
  },
];

export const TERMS_CONTACT = {
  company: "Remote Air Service",
  email: "Support@RemoteAirService.com",
  website: "RemoteAirService.com",
  address: "5900 Balcones Drive, Suite 100, Austin, Texas 78731",
};

export const TERMS_CLOSING =
  "By using Remote Air Service, you acknowledge that you have read, understood, and agree to these Terms and Conditions.";
