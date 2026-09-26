/**
 * Web3 Carnival Design System - Core Brand & Content Data
 * Sourced directly from design.md & live site foundation
 */

const WEB3_CARNIVAL_DATA = {
  brand: {
    name: "Web3 Carnival",
    tagline: "World's Premier Web3 & Blockchain Event",
    description: "The global gathering bridging decentralized technologies, builders, institutional leaders, and innovators worldwide.",
    dates: "November 14-16, 2026",
    location: "Global & Hybrid",
    statusBadge: "Next Edition: Nov 2026"
  },

  // Upcoming Event Snapshot + Countdown target (Homepage §3–4)
  eventDetails: {
    name: "Web3 Carnival 2026",
    edition: "Flagship Global Edition",
    dateLabel: "November 14–16, 2026",
    countdownTarget: "2026-11-14T09:00:00Z",
    location: "Global & Hybrid — Flagship Venue + Virtual Stage",
    format: "3 Days · In-Person + Virtual",
    description: "Three days of keynotes, builder workshops, and closed-door investor rooms spanning 7 thematic tracks — the checkpoint event for anyone shipping in Web3 this cycle."
  },

  // Personalized Entry paths (Homepage §2) — lightweight, skippable, not a gate
  personas: [
    { id: "attend", label: "Attend", recommend: "Reserve your seat at the carnival floor, stages, and side events.", ctaLabel: "Reserve Attendee Pass", ctaHref: "register.html" },
    { id: "speak", label: "Speak", recommend: "Pitch your session idea to our program committee across 7 tracks.", ctaLabel: "Apply to Speak", ctaHref: "register.html?type=speaker" },
    { id: "build", label: "Build", recommend: "Put your protocol live on the Super Demo stage in front of allocators.", ctaLabel: "Apply for Super Demo", ctaHref: "register.html?type=super-demo" },
    { id: "invest", label: "Invest", recommend: "Meet 1,500+ vetted Web3 startups and founders in one place.", ctaLabel: "Explore the Ecosystem", ctaHref: "ecosystem.html" },
    { id: "partner", label: "Partner", recommend: "Put your brand in front of the global Web3 ecosystem.", ctaLabel: "Become a Partner", ctaHref: "register.html?type=sponsor" }
  ],

  // Featured Past Events (Homepage §7) — sample of the real event history
  pastEvents: [
    { edition: "Web3 Carnival 2025", location: "Singapore", year: "2025", attendees: "4,200+ Attendees", icon: "🎪" },
    { edition: "Web3 Carnival 2024", location: "Dubai, UAE", year: "2024", attendees: "3,100+ Attendees", icon: "🕌" },
    { edition: "Web3 Carnival 2023", location: "Lisbon, Portugal", year: "2023", attendees: "2,400+ Attendees", icon: "🌍" }
  ],

  // The 7 locked tracks from design.md
  tracks: [
    {
      id: "infra",
      name: "Blockchain & its Infrastructure",
      description: "L1/L2 scalability, cross-chain interoperability, consensus mechanics, and decentralized compute pipelines.",
      icon: "⛓️"
    },
    {
      id: "dao",
      name: "DAO & Governance",
      description: "Decentralized decision frameworks, treasury orchestration, tokenomics architecture, and on-chain voting.",
      icon: "🏛️"
    },
    {
      id: "metaverse",
      name: "Metaverse & GameFi",
      description: "Virtual economies, sovereign identity, immersive digital spaces, and play-and-own gaming engines.",
      icon: "🎮"
    },
    {
      id: "zk",
      name: "ZK & Security",
      description: "Zero-knowledge cryptography, verifiable computation, smart contract auditing, and threat vectors.",
      icon: "🛡️"
    },
    {
      id: "defi",
      name: "CeFi DeFi & Staking",
      description: "Institutional liquidity, automated market protocols, yield primitives, and staking infrastructure.",
      icon: "📈"
    },
    {
      id: "enterprise",
      name: "Enterprise Blockchain",
      description: "Supply chain traceability, enterprise consortiums, compliance automation, and real-world asset tokenization.",
      icon: "🏢"
    },
    {
      id: "nft",
      name: "NFT & Utilities",
      description: "Next-gen utility tokens, intellectual property rights, dynamic media metadata, and phygital experiences.",
      icon: "💎"
    }
  ],

  // The 8 locked audience / ecosystem segments from design.md
  ecosystemSegments: [
    { id: "startups", name: "Startups", description: "Early-stage founders disrupting legacy rails." },
    { id: "enthusiasts", name: "Web3 Enthusiasts", description: "Active users and decentralized technology advocates." },
    { id: "developers", name: "Developers", description: "Engineers deploying protocol-level code." },
    { id: "investors", name: "Investors", description: "Venture funds, angel syndicates, and capital allocators." },
    { id: "policymakers", name: "Policy Makers", description: "Regulators and legal advisors guiding compliance." },
    { id: "enterprises", name: "Enterprises", description: "Fortune 500 corporations adopting Web3 stacks." },
    { id: "academia", name: "Academia and Institutions", description: "Research labs and university blockchain societies." },
    { id: "incubators", name: "Incubators and Accelerators", description: "Growth hubs scaling Web3 talent." }
  ],

  // Real "why us" stats from design.md (Animated proof)
  stats: [
    { value: 5000, suffix: "+", label: "Attendees" },
    { value: 250, suffix: "+", label: "Investors & Accelerators" },
    { value: 1000, suffix: "+", label: "Web3 Developers" },
    { value: 500, suffix: "+", label: "KOLs" },
    { value: 750, suffix: "+", label: "Partners" },
    { value: 1500, suffix: "+", label: "Potential Web3 Startups" }
  ],

  // Real "Get Involved" paths from design.md
  getInvolvedPaths: [
    { id: "sponsor", title: "Sponsor", description: "Showcase brand leadership to thousands of Web3 decision makers." },
    { id: "speaker", title: "Speaker", description: "Share protocol breakthroughs and technical visions on global stages." },
    { id: "media", title: "Media", description: "Cover breaking announcements and exclusive executive interviews." },
    { id: "community", title: "Community Partner", description: "Mobilize local chapters and developer clusters." },
    { id: "volunteer", title: "Volunteer", description: "Drive ground operations and gain insider access to the ecosystem." },
    { id: "super-demo", title: "Super Demo", description: "Pitch live on stage in front of top venture syndicates." }
  ],

  // Sample speakers for preview
  sampleSpeakers: [
    {
      name: "Dr. Elena Rostova",
      role: "Lead Cryptographer, ZeroShield Labs",
      track: "ZK & Security",
      initials: "ER",
      location: "Zurich, CH",
      photo: "https://i.pravatar.cc/320?img=47"
    },
    {
      name: "Marcus Vance",
      role: "Founding Partner, Genesis Capital",
      track: "CeFi DeFi & Staking",
      initials: "MV",
      location: "Singapore, SG",
      photo: "https://i.pravatar.cc/320?img=13"
    },
    {
      name: "Aaliyah Chen",
      role: "Core Protocol Architect, NovaLayer",
      track: "Blockchain & its Infrastructure",
      initials: "AC",
      location: "San Francisco, US",
      photo: "https://i.pravatar.cc/320?img=25"
    },
    {
      name: "David K. O'Connor",
      role: "Head of Governance, OlympusDAO Council",
      track: "DAO & Governance",
      initials: "DO",
      location: "London, UK",
      photo: "https://i.pravatar.cc/320?img=33"
    }
  ],

  // Partner Tiers
  partnerTiers: [
    {
      tier: "Strategic Sponsors",
      partners: ["Ethereum Foundation", "Polygon Labs", "Arbitrum", "Solana Ventures", "Near Protocol", "Chainlink"]
    },
    {
      tier: "Crypto Payment Partners",
      partners: ["Transak", "MoonPay", "Sardine", "BitPay"]
    },
    {
      tier: "Community & Media",
      partners: ["CoinDesk", "CoinTelegraph", "BeInCrypto", "Blockworks", "Bankless", "Decrypt"]
    }
  ]
};

// Freeze object to prevent accidental mutation
if (typeof Object.freeze === 'function') {
  Object.freeze(WEB3_CARNIVAL_DATA);
}
