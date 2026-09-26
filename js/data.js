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

  // Past Events / Archive (Homepage §7 preview + full Past Events page §5).
  // These 3 editions are the real, documented event history available to this
  // build. Fields beyond edition/location/year/attendees/icon (id, country,
  // attendeesValue, summary) are additive and used only by the Past Events
  // page's timeline, stats, and detail panel — nothing here is invented
  // beyond what the brand foundation already states; summaries only restate
  // location + attendance, never invented specifics (session counts, named
  // speakers, exact formats) that aren't part of the supplied content.
  pastEvents: [
    {
      id: "2025-singapore",
      edition: "Web3 Carnival 2025",
      location: "Singapore",
      country: "Singapore",
      year: "2025",
      attendees: "4,200+ Attendees",
      attendeesValue: 4200,
      icon: "🎪",
      summary: "The most recent documented edition, and the largest crowd on record — held in Singapore."
    },
    {
      id: "2024-dubai",
      edition: "Web3 Carnival 2024",
      location: "Dubai, UAE",
      country: "United Arab Emirates",
      year: "2024",
      attendees: "3,100+ Attendees",
      attendeesValue: 3100,
      icon: "🕌",
      summary: "The second flagship edition in the archive, hosted in Dubai, UAE."
    },
    {
      id: "2023-lisbon",
      edition: "Web3 Carnival 2023",
      location: "Lisbon, Portugal",
      country: "Portugal",
      year: "2023",
      attendees: "2,400+ Attendees",
      attendeesValue: 2400,
      icon: "🌍",
      summary: "The earliest edition currently on record — the starting point for the carnival's global footprint, hosted in Lisbon, Portugal."
    }
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

  // Speaker directory for the Track ↔ Speaker ↔ Session Explorer.
  // Keep this centralized so track and speaker views can render from one source.
  // Each speaker also carries a bio, expertise tags, and social links —
  // added here (not a second dataset) so the Speakers directory (Phase 4)
  // and the Tracks Explorer (Phase 3) both read from this one array.
  speakers: [
    { id: "elena-rostova", name: "Dr. Elena Rostova", role: "Lead Cryptographer, ZeroShield Labs", location: "Zurich, CH", initials: "ER", photo: "https://i.pravatar.cc/320?img=47", trackIds: ["infra", "zk"],
      bio: "Elena leads applied cryptography research at ZeroShield, moving zero-knowledge proof systems out of whitepapers and into production rollups. She previously built verification tooling for two major L2 launches.",
      expertise: ["Zero-Knowledge Proofs", "Protocol Security", "Applied Cryptography"],
      socials: { twitter: "https://twitter.com/elenarostova", linkedin: "https://linkedin.com/in/elenarostova", website: "https://zeroshieldlabs.io" } },
    { id: "aaliyah-chen", name: "Aaliyah Chen", role: "Core Protocol Architect, NovaLayer", location: "San Francisco, US", initials: "AC", photo: "https://i.pravatar.cc/320?img=25", trackIds: ["infra", "nft"],
      bio: "Aaliyah designs cross-chain messaging and settlement layers at NovaLayer, with a focus on minimizing trust assumptions between chains. Her recent work extends into dynamic, on-chain NFT metadata.",
      expertise: ["Cross-Chain Interoperability", "Protocol Architecture", "NFT Infrastructure"],
      socials: { twitter: "https://twitter.com/aaliyahchen", linkedin: "https://linkedin.com/in/aaliyahchen" } },
    { id: "david-oconnor", name: "David K. O'Connor", role: "Head of Governance, OlympusDAO Council", location: "London, UK", initials: "DO", photo: "https://i.pravatar.cc/320?img=33", trackIds: ["dao"],
      bio: "David chairs OlympusDAO's governance council, rebuilding treasury policy and voter participation programs after periods of low engagement. He writes and speaks widely on sustainable DAO tokenomics.",
      expertise: ["DAO Governance", "Treasury Management", "Policy & Compliance"],
      socials: { twitter: "https://twitter.com/davidkoconnor", linkedin: "https://linkedin.com/in/davidkoconnor" } },
    { id: "priya-nathan", name: "Priya Nathan", role: "Governance Lead, Constellation DAO", location: "Bengaluru, IN", initials: "PN", photo: "https://i.pravatar.cc/320?img=44", trackIds: ["dao", "nft"],
      bio: "Priya designs on-chain voting systems and governance UX for Constellation DAO, and researches phygital products that tie physical goods to verifiable on-chain provenance.",
      expertise: ["Governance UX", "Voting Systems", "Phygital Products"],
      socials: { linkedin: "https://linkedin.com/in/priyanathan", website: "https://constellationdao.xyz" } },
    { id: "jonas-weber", name: "Jonas Weber", role: "Studio Director, Aetherfall Games", location: "Berlin, DE", initials: "JW", photo: "https://i.pravatar.cc/320?img=12", trackIds: ["metaverse"],
      bio: "Jonas leads game economy design at Aetherfall, one of the studios that survived the play-to-earn hype cycle. He now advises on sustainable in-game economies for GameFi projects.",
      expertise: ["GameFi Economies", "Virtual Worlds", "Player Retention"],
      socials: { twitter: "https://twitter.com/jonasweber", linkedin: "https://linkedin.com/in/jonasweber" } },
    { id: "mei-lin-tan", name: "Mei Lin Tan", role: "Founder, Persona Protocol", location: "Singapore, SG", initials: "MT", photo: "https://i.pravatar.cc/320?img=32", trackIds: ["metaverse"],
      bio: "Mei Lin founded Persona Protocol to give people portable, verifiable identity inside immersive worlds — without depending on any single platform to hold that identity.",
      expertise: ["Sovereign Identity", "Immersive Platforms", "Privacy Engineering"],
      socials: { twitter: "https://twitter.com/meilintan", website: "https://personaprotocol.io" } },
    { id: "tomas-reyes", name: "Tomás Reyes", role: "Principal Auditor, Sentinel Security", location: "Madrid, ES", initials: "TR", photo: "https://i.pravatar.cc/320?img=68", trackIds: ["zk"],
      bio: "Tomás leads smart contract audits at Sentinel Security, and maintains the firm's public vulnerability-class database drawn from a year of production audits.",
      expertise: ["Smart Contract Auditing", "Security Research", "Threat Modeling"],
      socials: { twitter: "https://twitter.com/tomasreyes", linkedin: "https://linkedin.com/in/tomasreyes" } },
    { id: "marcus-vance", name: "Marcus Vance", role: "Founding Partner, Genesis Capital", location: "Singapore, SG", initials: "MV", photo: "https://i.pravatar.cc/320?img=13", trackIds: ["defi"],
      bio: "Marcus co-founded Genesis Capital and tracks institutional capital flows across DeFi primitives, publishing allocator data most funds keep to themselves.",
      expertise: ["Institutional Capital", "DeFi Strategy", "Market Structure"],
      socials: { linkedin: "https://linkedin.com/in/marcusvance", website: "https://genesis.capital" } },
    { id: "kwame-boateng", name: "Kwame Boateng", role: "Head of Infrastructure, StakeForge", location: "Accra, GH", initials: "KB", photo: "https://i.pravatar.cc/320?img=11", trackIds: ["defi"],
      bio: "Kwame runs validator infrastructure at StakeForge across multiple chains at institutional scale, and writes about the operational lessons that don't make it into whitepapers.",
      expertise: ["Validator Operations", "Staking Infrastructure", "Network Reliability"],
      socials: { twitter: "https://twitter.com/kwameboateng", linkedin: "https://linkedin.com/in/kwameboateng" } },
    { id: "sofia-marchetti", name: "Sofia Marchetti", role: "General Counsel, Ledger & Co.", location: "Milan, IT", initials: "SM", photo: "https://i.pravatar.cc/320?img=49", trackIds: ["enterprise"],
      bio: "Sofia built Ledger & Co.'s compliance framework for tokenizing real-world assets across three major regulatory regimes, and advises enterprise clients on blockchain legal strategy.",
      expertise: ["Regulatory Compliance", "RWA Tokenization", "Legal Strategy"],
      socials: { linkedin: "https://linkedin.com/in/sofiamarchetti" } },
    { id: "henrik-solberg", name: "Henrik Solberg", role: "VP Blockchain Strategy, Nordkraft Group", location: "Oslo, NO", initials: "HS", photo: "https://i.pravatar.cc/320?img=52", trackIds: ["enterprise"],
      bio: "Henrik leads blockchain strategy for Nordkraft Group's enterprise consortium work, one of the few pilots in its sector to survive past proof-of-concept.",
      expertise: ["Enterprise Consortiums", "Blockchain Strategy", "Change Management"],
      socials: { twitter: "https://twitter.com/henriksolberg", linkedin: "https://linkedin.com/in/henriksolberg", website: "https://nordkraftgroup.com" } }
  ],

  // Event Experience Timeline (Event page §3) — editorial arc, not numbered steps
  eventTimeline: [
    {
      id: "discover",
      name: "Discover",
      kicker: "Day 1 · Morning",
      description: "Mainstage keynotes and the state-of-the-ecosystem address frame the three days ahead — where the capital, the code, and the culture are heading next.",
      icon: "🧭"
    },
    {
      id: "explore",
      name: "Explore",
      kicker: "Day 1–2 · All Day",
      description: "Break into 7 track stages for deep technical sessions, protocol walkthroughs, and closed-door investor rooms running in parallel across the floor.",
      icon: "🔍"
    },
    {
      id: "connect",
      name: "Connect",
      kicker: "Day 1–3 · Between Sessions",
      description: "Curated matchmaking lounges, founder tables, and the ecosystem floor turn hallway conversations into the introductions that actually matter.",
      icon: "🤝"
    },
    {
      id: "build",
      name: "Build",
      kicker: "Day 2 · Afternoon",
      description: "Hands-on workshops and the Super Demo stage put protocols in front of allocators live — bring a laptop, leave with a working prototype or a term sheet lead.",
      icon: "🛠️"
    },
    {
      id: "celebrate",
      name: "Celebrate",
      kicker: "Day 3 · Evening",
      description: "The closing carnival — awards, live performances, and a send-off that turns three days of work into the story you tell about this cycle.",
      icon: "🎉"
    }
  ],

  // Smart Event Discovery — filter taxonomies (Event page §4)
  eventDays: [
    { id: "day1", label: "Day 1", dateLabel: "Nov 14" },
    { id: "day2", label: "Day 2", dateLabel: "Nov 15" },
    { id: "day3", label: "Day 3", dateLabel: "Nov 16" }
  ],

  sessionInterests: [
    { id: "investing", label: "Investing & Capital" },
    { id: "engineering", label: "Protocol Engineering" },
    { id: "security", label: "Security & Risk" },
    { id: "culture", label: "Culture & Community" },
    { id: "design", label: "Design & UX" },
    { id: "policy", label: "Policy & Compliance" }
  ],

  experienceLevels: [
    { id: "beginner", label: "Beginner" },
    { id: "intermediate", label: "Intermediate" },
    { id: "advanced", label: "Advanced" }
  ],

  // Venue & Logistics (Event page §8)
  venue: {
    name: "Marina Convergence Hall",
    city: "Singapore · Hybrid with a Virtual Stage",
    address: "8 Bayfront Concourse, Singapore 018956",
    hours: "Doors open 08:00 daily · Main stage runs 09:00–19:00",
    logistics: [
      { label: "Badge Pickup", value: "On-site kiosks open Nov 13, 12:00–20:00, and daily from 07:30." },
      { label: "Wi-Fi", value: "Network \"W3C-2026\" — password printed on your digital pass." },
      { label: "Accessibility", value: "Step-free access, live captioning on all mainstage sessions, and quiet rooms on Level 2." },
      { label: "Virtual Stage", value: "All mainstage keynotes and Track talks are livestreamed for hybrid pass holders." }
    ]
  },

  // Structured session data — mock content for Smart Event Discovery (Event page §4–6)
  sessions: [
    {
      id: "s01",
      title: "State of the Ecosystem: What Actually Shipped This Cycle",
      speaker: "Dr. Elena Rostova",
      speakerId: "elena-rostova",
      speakerRole: "Lead Cryptographer, ZeroShield Labs",
      trackId: "infra",
      dayId: "day1",
      time: "09:00 – 09:45",
      level: "beginner",
      interest: "engineering",
      description: "A grounded look at which L1/L2 scaling claims held up under real load this year, and which ones quietly didn't."
    },
    {
      id: "s02",
      title: "Cross-Chain Interoperability Without the Trust Assumptions",
      speaker: "Aaliyah Chen",
      speakerId: "aaliyah-chen",
      speakerRole: "Core Protocol Architect, NovaLayer",
      trackId: "infra",
      dayId: "day2",
      time: "11:00 – 11:45",
      level: "advanced",
      interest: "engineering",
      description: "A technical teardown of bridge designs that minimize — rather than relocate — cross-chain trust assumptions."
    },
    {
      id: "s03",
      title: "Treasury Governance After the Last Bear Market",
      speaker: "David K. O'Connor",
      speakerId: "david-oconnor",
      speakerRole: "Head of Governance, OlympusDAO Council",
      trackId: "dao",
      dayId: "day1",
      time: "13:00 – 13:45",
      level: "intermediate",
      interest: "policy",
      description: "How mature DAOs rebuilt treasury policy and voter participation after two years of low engagement."
    },
    {
      id: "s04",
      title: "Designing Voting Systems People Actually Use",
      speaker: "Priya Nathan",
      speakerId: "priya-nathan",
      speakerRole: "Governance Lead, Constellation DAO",
      trackId: "dao",
      dayId: "day3",
      time: "10:00 – 10:45",
      level: "beginner",
      interest: "design",
      description: "Practical UX patterns for on-chain voting that raise turnout without sacrificing legitimacy."
    },
    {
      id: "s05",
      title: "Play-and-Own Economies: A Post-Mortem",
      speaker: "Jonas Weber",
      speakerId: "jonas-weber",
      speakerRole: "Studio Director, Aetherfall Games",
      trackId: "metaverse",
      dayId: "day2",
      time: "09:30 – 10:15",
      level: "intermediate",
      interest: "culture",
      description: "What survived the play-to-earn hype cycle, and the sustainable in-game economy patterns that emerged from it."
    },
    {
      id: "s06",
      title: "Sovereign Identity for Immersive Worlds",
      speaker: "Mei Lin Tan",
      speakerId: "mei-lin-tan",
      speakerRole: "Founder, Persona Protocol",
      trackId: "metaverse",
      dayId: "day3",
      time: "14:00 – 14:45",
      level: "advanced",
      interest: "engineering",
      description: "Portable, verifiable identity primitives for virtual spaces that don't depend on a single platform."
    },
    {
      id: "s07",
      title: "Zero-Knowledge Proofs, Explained for Builders",
      speaker: "Dr. Elena Rostova",
      speakerId: "elena-rostova",
      speakerRole: "Lead Cryptographer, ZeroShield Labs",
      trackId: "zk",
      dayId: "day1",
      time: "15:00 – 15:45",
      level: "beginner",
      interest: "engineering",
      description: "A no-nonsense primer on ZK cryptography and where it earns its complexity budget in production systems."
    },
    {
      id: "s08",
      title: "Smart Contract Auditing: The Bugs We Keep Missing",
      speaker: "Tomás Reyes",
      speakerId: "tomas-reyes",
      speakerRole: "Principal Auditor, Sentinel Security",
      trackId: "zk",
      dayId: "day2",
      time: "16:00 – 16:45",
      level: "advanced",
      interest: "security",
      description: "Recurring vulnerability classes from a year of audits, and the review checklist that would have caught them."
    },
    {
      id: "s09",
      title: "Institutional Liquidity Is Finally Showing Up — Here's the Data",
      speaker: "Marcus Vance",
      speakerId: "marcus-vance",
      speakerRole: "Founding Partner, Genesis Capital",
      trackId: "defi",
      dayId: "day1",
      time: "11:00 – 11:45",
      level: "intermediate",
      interest: "investing",
      description: "Fresh allocator data on where institutional capital is actually flowing across DeFi primitives this cycle."
    },
    {
      id: "s10",
      title: "Staking Infrastructure at Scale",
      speaker: "Kwame Boateng",
      speakerId: "kwame-boateng",
      speakerRole: "Head of Infrastructure, StakeForge",
      trackId: "defi",
      dayId: "day3",
      time: "09:00 – 09:45",
      level: "intermediate",
      interest: "engineering",
      description: "Operational lessons from running validator infrastructure across multiple chains at institutional scale."
    },
    {
      id: "s11",
      title: "Real-World Asset Tokenization: A Compliance Playbook",
      speaker: "Sofia Marchetti",
      speakerId: "sofia-marchetti",
      speakerRole: "General Counsel, Ledger & Co.",
      trackId: "enterprise",
      dayId: "day2",
      time: "13:30 – 14:15",
      level: "intermediate",
      interest: "policy",
      description: "A working compliance framework for tokenizing real-world assets across three major regulatory regimes."
    },
    {
      id: "s12",
      title: "Enterprise Consortiums That Didn't Fall Apart",
      speaker: "Henrik Solberg",
      speakerId: "henrik-solberg",
      speakerRole: "VP Blockchain Strategy, Nordkraft Group",
      trackId: "enterprise",
      dayId: "day3",
      time: "11:30 – 12:15",
      level: "beginner",
      interest: "culture",
      description: "Governance lessons from enterprise blockchain consortiums that survived past the pilot phase."
    },
    {
      id: "s13",
      title: "Dynamic Metadata and the Next Generation of Utility NFTs",
      speaker: "Aaliyah Chen",
      speakerId: "aaliyah-chen",
      speakerRole: "Core Protocol Architect, NovaLayer",
      trackId: "nft",
      dayId: "day2",
      time: "15:30 – 16:15",
      level: "advanced",
      interest: "engineering",
      description: "Technical patterns for NFTs whose metadata and utility evolve with on-chain and real-world state."
    },
    {
      id: "s14",
      title: "Phygital Products: Bridging Physical Goods and On-Chain Ownership",
      speaker: "Priya Nathan",
      speakerId: "priya-nathan",
      speakerRole: "Governance Lead, Constellation DAO",
      trackId: "nft",
      dayId: "day1",
      time: "17:00 – 17:45",
      level: "beginner",
      interest: "design",
      description: "Case studies on physical products with on-chain provenance, from limited drops to supply-chain proof."
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
  ],

  // Partner category metadata (Sponsors & Partners page, §7 Sponsors) — the
  // 5 real tiers the live site groups partners into. Real names for
  // Sponsors / Crypto Payment / Media are read from partnerTiers above via
  // tierIndex, so there is exactly one source of truth for those names — no
  // list is duplicated or retyped here. Ticketing and Community have no
  // confirmed named partner anywhere in the supplied foundation, so they
  // carry placeholderCount instead of a tierIndex and render as clearly
  // labeled placeholder slots rather than invented company names.
  partnerCategories: [
    { id: "sponsors", label: "Sponsors", icon: "\uD83D\uDEE1\uFE0F", tierIndex: 0, tierLabel: "Strategic Sponsor", description: "Blockchain foundations and protocol teams backing the flagship stages and tracks." },
    { id: "crypto-payment", label: "Crypto Payment Partner", icon: "\uD83D\uDCB3", tierIndex: 1, tierLabel: "Crypto Payment Partner", description: "On-ramp, off-ramp, and compliance infrastructure behind ticketing and on-site payments." },
    { id: "ticketing", label: "Ticketing", icon: "\uD83C\uDF9F\uFE0F", tierIndex: null, placeholderCount: 2, tierLabel: "Ticketing Partner", description: "The platform layer handling registration, check-in, and pass distribution." },
    { id: "community", label: "Community", icon: "\uD83C\uDF10", tierIndex: null, placeholderCount: 3, tierLabel: "Community Partner", description: "Local chapters, developer guilds, and DAOs mobilizing their members to attend." },
    { id: "media", label: "Media", icon: "\uD83D\uDCF0", tierIndex: 2, tierLabel: "Media Partner", description: "Global crypto and business press bringing the carnival to their audiences." }
  ],

  // Selected partner spotlights (Sponsors & Partners page §4) — one real,
  // already-listed name per represented tier, described only in general,
  // publicly-known terms about what that kind of organization does. No
  // specific event-history claim (dates, quotes, deal terms) is invented
  // beyond what this foundation confirms.
  partnerSpotlights: [
    {
      partner: "Ethereum Foundation",
      categoryId: "sponsors",
      tierLabel: "Strategic Sponsor",
      focus: "Blockchain & its Infrastructure",
      blurb: "The nonprofit steward of the Ethereum protocol anchors the Sponsors tier \u2014 the kind of foundation-level credibility that tells builders and enterprises the ecosystem's core infrastructure is represented on the carnival floor."
    },
    {
      partner: "Transak",
      categoryId: "crypto-payment",
      tierLabel: "Crypto Payment Partner",
      focus: "CeFi DeFi & Staking",
      blurb: "A fiat-to-crypto on/off-ramp used across consumer wallets and exchanges, Transak represents the payment-rail layer that lets attendees move between traditional and on-chain value without friction."
    },
    {
      partner: "CoinDesk",
      categoryId: "media",
      tierLabel: "Media Partner",
      focus: "Global press coverage",
      blurb: "One of the longest-running dedicated crypto news outlets, CoinDesk's presence in the Media tier is what carries the lineup, announcements, and on-the-ground coverage to a global crypto-native audience."
    }
  ],

  // Partnership value proposition (Sponsors & Partners page §5) — framed
  // around the real reach numbers already defined in `stats` above, not
  // invented metrics.
  partnerValueProps: [
    { icon: "\uD83C\uDF0D", title: "Global, hybrid reach", desc: "In-person and virtual stages put a brand in front of 5,000+ attendees across every time zone, not just the room." },
    { icon: "\uD83E\uDDD1\u200D\uD83D\uDCBB", title: "The builders, not just the buzz", desc: "1,000+ Web3 developers and 1,500+ potential startups make up the floor \u2014 an audience that ships, not just watches." },
    { icon: "\uD83D\uDCBC", title: "Capital in the room", desc: "250+ investors and accelerators attend specifically to source deal flow, giving sponsors direct access to allocators." },
    { icon: "\uD83D\uDCE3", title: "Amplification built in", desc: "500+ KOLs and the Media tier's outlets extend a partner's visibility well past the three event days." }
  ]
};

// Freeze object to prevent accidental mutation
if (typeof Object.freeze === 'function') {
  Object.freeze(WEB3_CARNIVAL_DATA);
}
