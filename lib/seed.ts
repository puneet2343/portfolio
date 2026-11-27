import type { SiteContent } from "./types";

/**
 * Seed content. Facts come only from the previous portfolio and the latest resume.
 * Items marked `published: false` are unconfirmed drafts: review them in /admin before enabling.
 */
export const seedContent: SiteContent = {
  profile: {
    name: "Puneet Shukla",
    role: "Software Engineer (SDE-1)",
    company: "SS Innovations International",
    location: "Gurugram, India",
    badge: "SDE-1 · Surgical robotics",
    headline: "I build web apps end to end: booking systems, internal tools and conference sites.",
    pitch:
      "I'm a software engineer (SDE-1) at SS Innovations International, a surgical-robotics company in Gurugram. I work across the stack: Next.js front ends, Node.js APIs, MongoDB, real-time features and AWS.",
    email: "puneetshukla042@gmail.com",
    resumeUrl: "/resume/Puneet_Shukla_Resume.pdf",
    avatarUrl: "/images/photos/hero-booth-4x5.webp",
    aboutPhotoUrl: "/images/photos/about-headshot-4x5.webp",
    workPhotoUrl: "/images/photos/console-demo.webp",
    avatarAlt: "Puneet Shukla in a dark suit at the SS Innovations booth, in front of a robotic surgical system",
    aboutPhotoAlt: "Portrait of Puneet Shukla outdoors, in glasses, a dark suit and blue tie",
    workPhotoAlt: "At the surgeon console of the SSI Mantra 3 during a demo, November 2026",
  },
  about: {
    heading: "About",
    paragraphs: [
      "I'm a full-stack software developer at SS Innovations International, a surgical-robotics company in Gurugram. Since April 2025 I've been building and shipping production web applications end to end: responsive front ends, backend APIs, real-time features, databases and cloud deployment on AWS.",
      "My work ranges from an event registration and ticketing platform for surgical conferences, with slot-based booking, QR check-in and live attendance, to an internal team workspace that automates certificates, ID cards and other assets.",
      "I care about the details users feel: correctness under load, fast pages and interfaces that work as well on a phone as on a desktop. Outside of code, I shoot and edit short films.",
    ],
    facts: [
      { label: "Role", value: "SDE-1" },
      { label: "Company", value: "SS Innovations International" },
      { label: "Based in", value: "Gurugram, India" },
      { label: "Degree", value: "B.Tech CSE (AI & ML) · CGPA 8.3" },
    ],
  },
  experience: [
    {
      id: "exp-ssi",
      company: "SS Innovations International",
      role: "Software Development Engineer I (SDE-1)",
      type: "Full-time",
      start: "Apr 2025",
      end: "Present",
      location: "Gurugram, India",
      logo: "/images/logos/ssi.jpeg",
      summary:
        "I build the web platforms and internal tools of a surgical-robotics company: event ticketing, training sites, conference platforms and team automation.",
      points: [
        "Built SSI Events, the company's event platform for surgical conferences: slot-based booking, QR tickets and QR check-in with live attendance over Socket.IO.",
        "Stopped double bookings and overselling with retry IDs and MongoDB transactions on every booking request.",
        "Built SSI Studios, an internal workspace for certificates, ID cards, PDFs and media converters, behind signed session-cookie login.",
        "Built the SS Innovations corporate site (3D SSi Mantra visuals in Three.js), the SSI CRS training site and the SMRSC conference platform.",
      ],
      tech: ["Next.js", "TypeScript", "MongoDB", "Socket.IO", "AWS", "Three.js"],
      published: true,
    },
    {
      id: "exp-medanta",
      company: "Medanta The Medicity",
      role: "Intern",
      type: "Internship",
      start: "Jun 2023",
      end: "Aug 2023",
      location: "Gurugram, India",
      logo: "/images/logos/medanta.png",
      summary: "Quality assurance on the hospital website and patient registration flows.",
      points: [
        "Tested the hospital website and patient registration flows, catching validation errors, broken links and UI bugs.",
        "Logged defects with reproduction steps and severity, and re-tested fixes with developers before each release.",
      ],
      tech: ["Manual Testing", "Functional Testing", "QA"],
      published: true,
    },
  ],
  projects: [
    {
      id: "prj-studios",
      slug: "ssi-studios",
      title: "SSI Studios",
      tagline: "Internal workspace that automates certificates, ID cards and other assets.",
      context: "SS Innovations International",
      period: "",
      cover: "/images/projects/ssistudios.png",
      gallery: [],
      liveUrl: "https://ssistudios.vercel.app",
      repoUrl: "",
      tech: ["Next.js", "React", "TypeScript", "MongoDB", "pdf-lib", "ffmpeg.wasm", "AWS S3", "Cloudinary", "SendGrid", "Tailwind CSS"],
      problem:
        "The team produced training certificates, ID cards, visiting cards, posters and invitations by hand, one at a time, which took days of manual design work.",
      built: [
        "Training-certificate manager with Excel import, one-click PDF certificates, export and a live dashboard.",
        "Generators for certificates, visiting cards and ID cards, plus PDF generation and Excel import / export pipelines.",
        "In-browser image, video and document converters and a QR generator, behind signed session-cookie login.",
        "Media storage and email delivery through AWS S3, Cloudinary and SendGrid.",
        "Modular Next.js App Router architecture with API routes and MongoDB data models.",
      ],
      impact: [
        "Manual design work for ID cards, visiting cards and posters went from days to seconds.",
        "Certificates for a whole training batch are generated in one click from an Excel sheet.",
      ],
      featured: true,
      published: true,
    },
    {
      id: "prj-smrsc",
      slug: "smrsc-2026",
      title: "SMRSC 2026 Platform",
      tagline: "Official web platform for a global robotic surgery conference.",
      context: "SS Innovations International",
      period: "",
      cover: "/images/projects/smrsc.png",
      gallery: [],
      liveUrl: "https://www.ssinnovations.com/SMRSC_2026/home/",
      repoUrl: "",
      tech: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Framer Motion", "MongoDB", "Mongoose", "Lenis"],
      problem:
        "A global conference connecting surgeons, healthcare leaders and innovators needed one fast, polished home for its schedule, faculty, venue, media and registration.",
      built: [
        "Full-stack Next.js App Router platform with frontend and API routes in a single application.",
        "Modules for schedules, faculty profiles, venue information, media content and event registration.",
        "Animated, responsive interface with Framer Motion, Lenis smooth scrolling and Tailwind components.",
        "MongoDB-backed API routes for visitor analytics and editable content.",
      ],
      impact: [
        "Fast, responsive and SEO-optimized conference website.",
        "Schedules, faculty and media are managed as content instead of being hard-coded.",
      ],
      featured: true,
      published: true,
    },
    {
      id: "prj-crs",
      slug: "ssi-crs",
      title: "SSI CRS",
      tagline: "Training-program portal for surgeons learning the SSi Mantra robotic system.",
      context: "SS Innovations International",
      period: "",
      cover: "/images/projects/ssicrs.png",
      gallery: [],
      liveUrl: "https://ssicrsweb.vercel.app/Home",
      repoUrl: "",
      tech: ["Next.js", "React", "Tailwind CSS"],
      problem:
        "Healthcare professionals needed a simple place to discover and register for hands-on training programs on the SSi Mantra surgical robotic system.",
      built: [
        "Dedicated portal for training-program information and registration.",
        "A short enrolment flow for hands-on surgical courses.",
        "Fast, responsive, SEO-optimized pages.",
      ],
      impact: [
        "Doctors can find and sign up for robotic-surgery training in one place.",
      ],
      featured: true,
      published: true,
    },
    {
      id: "prj-blackhole",
      slug: "black-hole-simulation",
      title: "Black Hole Simulation",
      tagline: "Real-time WebGL ray-marching of Schwarzschild / Kerr black holes.",
      context: "Personal project",
      period: "",
      cover: "/images/projects/blackhole.png",
      gallery: [],
      liveUrl: "https://blackhole-nu-red.vercel.app/",
      repoUrl: "",
      tech: ["Next.js", "React", "TypeScript", "WebGL", "GLSL"],
      problem: "Visualise how a black hole bends light, interactively and in real time, in an ordinary browser.",
      built: [
        "Interactive WebGL simulation using general-relativistic ray marching written in GLSL.",
        "Gravitational lensing and a volumetric accretion disk with Doppler beaming.",
        "Adaptive step sizing for high-performance rendering.",
      ],
      impact: ["Runs in real time in the browser with no install."],
      featured: false,
      published: true,
    },
    {
      id: "prj-events",
      slug: "ssi-events",
      title: "SSI Events",
      tagline: "Event registration & ticketing platform for surgical conferences.",
      context: "SS Innovations International",
      period: "",
      cover: "",
      gallery: [],
      liveUrl: "",
      repoUrl: "",
      tech: ["Next.js", "TypeScript", "MongoDB", "Socket.IO", "AWS Lambda", "DynamoDB", "Google Maps API"],
      problem:
        "Surgical conferences need attendees to book limited slots, receive tickets and check in on the day, without double bookings or overselling, and organisers need live attendance and reports.",
      built: [
        "Event catalogue with slot-based booking and QR tickets.",
        "Booking safety: retry IDs and MongoDB transactions on every booking request.",
        "QR check-in with an in-browser scanner that validates the booked slot and pushes attendance live via Socket.IO.",
        "Admin console with role-based access, activity logs, analytics and CSV / Excel / PDF report exports.",
        "Live bus tracking on Google Maps and automated feedback emails, running on AWS Lambda and DynamoDB.",
      ],
      impact: [
        "No double bookings or overselling: every booking request runs inside a MongoDB transaction with a retry ID.",
        "Check-in is a single QR scan, and attendance appears live for organisers.",
        "Organisers export reports themselves in CSV, Excel or PDF.",
      ],
      featured: true,
      published: true,
    },
    {
      id: "prj-corporate",
      slug: "ss-innovations-website",
      title: "SS Innovations corporate website",
      tagline: "Corporate website with 3D product visuals of the SSi Mantra robot.",
      context: "SS Innovations International",
      period: "",
      cover: "",
      gallery: [],
      liveUrl: "",
      repoUrl: "",
      tech: ["Next.js", "React", "Tailwind CSS", "Three.js"],
      problem: "The company needed a modern corporate website that shows its surgical robot, not just describes it.",
      built: [
        "Corporate website built with Next.js and Tailwind CSS.",
        "3D product visuals of the SSi Mantra robot using Three.js.",
      ],
      impact: ["Visitors can explore the product in 3D directly in the browser."],
      featured: false,
      published: true,
    },
    {
      id: "prj-jaw",
      slug: "instrument-jaw-angle",
      title: "Instrument Jaw Angle Measurement",
      tagline: "Real-time angle detection for a surgical instrument jaw module.",
      context: "SS Innovations International",
      period: "",
      cover: "",
      gallery: [],
      liveUrl: "",
      repoUrl: "",
      tech: ["Python", "NDI tracking"],
      problem: "Measure the angle between the jaws of a surgical instrument's jaw module in real time.",
      built: ["Worked on real-time angle detection between the jaws using NDI tracking sensors."],
      impact: [],
      featured: false,
      published: true,
    },
    {
      id: "prj-medilens",
      slug: "medilens",
      title: "MediLens Clinical Intelligence Platform",
      tagline: "Multimodal AI diagnostic dashboard. (Draft from old portfolio: confirm before publishing.)",
      context: "Personal project",
      period: "",
      cover: "/images/projects/medilens.png",
      gallery: [],
      liveUrl: "https://medilenss.vercel.app/",
      repoUrl: "",
      tech: ["Next.js", "TypeScript", "FastAPI", "PostgreSQL", "PyTorch"],
      problem:
        "Bring retinal imaging, chest X-rays, ECG signals, speech biomarkers, dermatology analysis and cognitive tests into one clinical dashboard.",
      built: [
        "Full-stack architecture using Next.js and FastAPI with modular AI pipelines per diagnostic module.",
        "Explainability: Grad-CAM heatmaps, biomarker breakdowns and LLM-generated clinical explanations.",
        "Amazon Polly voice summaries, audit logging and real-time system monitoring.",
      ],
      impact: ["Sub-3-second processing per diagnostic module (claim from the old portfolio)."],
      featured: false,
      published: false,
    },
  ],
  hero: {
    role: "Full Stack Developer",
    company: "SS Innovations · SDE-1",
    location: "India",
    hire: "Ready to build the future.",
    skills: [
      { key: "languages", items: ["TypeScript", "JavaScript", "Python", "SQL"] },
      { key: "frameworks", items: ["Next.js", "React", "Node.js", "Tailwind", "Three.js"] },
      { key: "databases", items: ["MongoDB", "DynamoDB", "Redis"] },
      { key: "cloud_services", items: ["AWS Lambda", "AWS S3", "AWS SES"] },
      { key: "realtime", items: ["Socket.IO"] },
      { key: "tools", items: ["Git", "GitLab CI/CD", "Figma"] },
    ],
    readme: `# Puneet Shukla

Software Development Engineer (SDE-1)
SS Innovations International · Gurugram, India

## Now
Building event, training and internal tools
for a surgical-robotics company.

## Stack
Next.js · TypeScript · Node.js · MongoDB · AWS

## Usage
Run the build command to see the magic happen.`,
    styles: `:root {
  --primary: #007acc;
  --bg: #02091a;
}

.career-path {
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.3s ease;
}

.ships-to-production {
  width: 100%;
  height: 100%;
}`,
  },
  skills: [
    { id: "sk-next", name: "Next.js", category: "FRONTEND", tag: "Core Framework", year: "2024", icon: "globe", companies: ["ssi"], description: "Server Actions, App Router, SSR.", published: true },
    { id: "sk-react", name: "React Ecosystem", category: "FRONTEND", tag: "UI Library", year: "2023", icon: "layout", companies: ["ssi"], description: "Hooks, Context, Custom Patterns.", published: true },
    { id: "sk-ts", name: "TypeScript", category: "FRONTEND", tag: "Language", year: "2023", icon: "code", companies: ["ssi"], description: "Strict typing, Interfaces, Generics.", published: true },
    { id: "sk-framer", name: "Framer Motion", category: "FRONTEND", tag: "Animation", year: "2024", icon: "zap", companies: ["ssi"], description: "Gestures & layout animations.", published: true },
    { id: "sk-tailwind", name: "Tailwind CSS", category: "FRONTEND", tag: "Design System", year: "2023", icon: "layers", companies: ["ssi"], description: "Config & responsive design.", published: true },
    { id: "sk-node", name: "Node.js", category: "BACKEND", tag: "Runtime", year: "2022", icon: "server", companies: ["ssi"], description: "REST APIs, Socket.IO, auth & roles.", published: true },
    { id: "sk-mongo", name: "MongoDB", category: "BACKEND", tag: "NoSQL", year: "2023", icon: "database", companies: ["ssi"], description: "Transactions, aggregation & indexing.", published: true },
    { id: "sk-python", name: "Python", category: "BACKEND", tag: "Scripting", year: "2020", icon: "terminal", companies: ["medanta"], description: "Automation & Data Analysis.", published: true },
    { id: "sk-socket", name: "Socket.IO", category: "BACKEND", tag: "Realtime", year: "2025", icon: "zap", companies: ["ssi"], description: "Live check-in & attendance.", published: true },
    { id: "sk-three", name: "Three.js", category: "FRONTEND", tag: "3D", year: "2025", icon: "layers", companies: ["ssi"], description: "3D product visuals.", published: true },
    { id: "sk-git", name: "Git & CI/CD", category: "TOOLS", tag: "DevOps", year: "2022", icon: "git", companies: ["medanta", "ssi"], description: "Version control & GitLab CI/CD.", published: true },
    { id: "sk-aws", name: "AWS", category: "TOOLS", tag: "Cloud", year: "2024", icon: "cloud", companies: ["ssi"], description: "Lambda, S3, SES.", published: true },
    // Hidden drafts from the old portfolio (not on the current resume): confirm before showing.
    { id: "sk-postgres", name: "PostgreSQL", category: "BACKEND", tag: "Relational DB", year: "2021", icon: "hash", companies: ["medanta"], description: "Complex queries & normalization.", published: false },
    { id: "sk-mysql", name: "MySQL", category: "BACKEND", tag: "Relational DB", year: "2021", icon: "database", companies: [], description: "Relational schemas & queries.", published: false },
    { id: "sk-electron", name: "Electron", category: "TOOLS", tag: "Desktop", year: "2024", icon: "monitor", companies: ["ssi"], description: "Cross-platform desktop apps.", published: false },
    { id: "sk-ec2", name: "AWS EC2", category: "TOOLS", tag: "Cloud", year: "2024", icon: "server", companies: ["ssi"], description: "Virtual servers.", published: false },
  ],
  skillCategories: [
    { id: "ALL", label: "Ecosystem", wide: false },
    { id: "FRONTEND", label: "Interface", wide: true },
    { id: "BACKEND", label: "Core", wide: false },
    { id: "TOOLS", label: "Infrastructure", wide: false },
  ],
  education: [
    {
      id: "edu-gla",
      school: "GLA University",
      degree: "B.Tech Computer Science (AI & ML)",
      start: "Sep 2021",
      end: "Aug 2025",
      location: "Mathura, India",
      grade: "CGPA 8.3 / 10",
      logo: "/images/logos/gla.jpeg",
      summary: "Specialization in Artificial Intelligence & Machine Learning.",
      highlights: ["Bachelor of Technology in Computer Science and Engineering (AI & ML).", "CGPA 8.3 / 10."],
      tags: ["AI/ML", "Algorithms", "Data Structures"],
      published: true,
    },
    {
      id: "edu-gla-extra",
      school: "GLA University (extra details, unconfirmed)",
      degree: "B.Tech Computer Science (AI & ML)",
      start: "Sep 2021",
      end: "Aug 2025",
      location: "Mathura, India",
      grade: "CGPA 8.3 / 10",
      logo: "/images/logos/gla.jpeg",
      summary: "Specialization in Artificial Intelligence & Machine Learning.",
      highlights: ["Minor in Cloud Computing.", "Head of Technical Society.", "Research on neural-network optimization."],
      tags: ["AI/ML", "Algorithms", "Research"],
      published: false,
    },
  ],
  events: {
    heading: "Recent Events",
    intro: "SMICTSI · ATCSA ICC · ISMICS 2026 — One Unified Congress, 20–22 Nov 2026, SS Innovations booth (SSI Mantra 3).",
    photos: [
      { id: "ph-arch", src: "/images/photos/congress-arch.webp", alt: "Red circular entrance arch with the SMICTSI · ATCSA ICC · ISMICS 2026 congress branding", caption: "One Unified Congress, 20–22 Nov 2026", published: true },
      { id: "ph-booth", src: "/images/photos/booth-standing.webp", alt: "Puneet in a dark suit in front of a multi-arm robotic surgical system at the SS Innovations booth", caption: "At the SS Innovations booth", published: true },
      { id: "ph-console", src: "/images/photos/console-demo.webp", alt: "Puneet seated at a robotic surgery console with a 3D simulation on screen", caption: "At the SSI Mantra 3 surgeon console", published: true },
      { id: "ph-display", src: "/images/photos/booth-display.webp", alt: "Puneet standing beside a monitor showing a 3D surgical simulation and robotic arms", caption: "Booth demo station", published: true },
      { id: "ph-table", src: "/images/photos/booth-table.webp", alt: "Puneet reading a brochure at a glass table inside the booth, robotic arms behind him", caption: "Day two at the booth", published: true },
    ],
  },
  beyond: {
    kicker: "Beyond The Code",
    heading: "Filmmaking &",
    headingAccent: "Cinematography",
    intro:
      "While my professional focus lies in architecting software and engineering web platforms, my creative pursuit lives behind the lens. Filmmaking is my medium to capture raw emotion, ambient light, and compelling narratives. Here is a glimpse into my visual stories.",
    items: [
      {
        id: "film-braj",
        kicker: "The Divine Play",
        title: "Braj Ki",
        titleAccent: "Holi",
        quote:
          "In the sacred lanes of Vrindavan, colors aren't just thrown—they are lived. Witness the eternal dance where the divine love of Radha and Krishna dissolves the boundaries between the human and the celestial.",
        tags: ["CinemaScope", "Remastered"],
        video: "/videos/heroone.webm",
        poster: "/videos/heroone.webp",
        rotate: false,
        videoRight: false,
        theme: "gold",
        published: true,
      },
      {
        id: "film-delhi",
        kicker: "Dwarka, Delhi",
        title: "Delhi Streets",
        titleAccent: "Flower Market",
        quote:
          "Before the city wakes, the streets erupt in a chaotic symphony of fragrance and color. Marigolds, roses, and jasmine flood the alleyways, painting the dawn with the vibrant soul of the capital.",
        tags: ["Street Photography", "24mm Lens"],
        video: "/videos/herotwo.webm",
        poster: "/videos/herotwo.webp",
        rotate: false,
        videoRight: true,
        theme: "orange",
        published: true,
      },
      {
        id: "film-bombay",
        kicker: "Marine Drive",
        title: "The Life in",
        titleAccent: "7 AM Bombay",
        quote:
          "The sea breeze carries the stories of a million dreams. As the first light hits the Queen's Necklace, the city shakes off its slumber, ready to conquer another day in the city that never sleeps.",
        tags: ["First Light", "16mm Film"],
        video: "/videos/herofour.webm",
        poster: "/videos/herofour.webp",
        rotate: false,
        videoRight: true,
        theme: "blue",
        published: true,
      },
      {
        id: "film-nature",
        kicker: "Ethereal Canvas",
        title: "Nature's",
        titleAccent: "Palette",
        quote:
          "The sky doesn't ask for attention, yet it commands it. In the gradient of the horizon, we find the colors of our own emotions—ever-changing, infinite, and beautifully untamed.",
        tags: ["Vibrance", "Horizon"],
        video: "/videos/herofive.webm",
        poster: "/videos/herofive.webp",
        rotate: true,
        videoRight: false,
        theme: "sunset",
        published: true,
      },
      {
        id: "film-dreams",
        kicker: "The Uphill Battle",
        title: "Dreams",
        titleAccent: "Vs. Everyone",
        quote:
          "They told him to be realistic. They told him to follow the path. But the vision was too clear to ignore. Standing alone against the tide, it's not just about proving them wrong—it's about proving yourself right.",
        tags: ["Inner Light", "Resilience"],
        video: "/videos/herosix.webm",
        poster: "/videos/herosix.webp",
        rotate: true,
        videoRight: true,
        theme: "purple",
        published: true,
      },
    ],
  },
  social: [
    { id: "s-li", label: "LinkedIn", url: "https://www.linkedin.com/in/puneet-shukla-72b915225", icon: "linkedin", published: true },
    { id: "s-gh", label: "GitHub", url: "https://github.com/puneet2343", icon: "github", published: false },
    { id: "s-em", label: "Email", url: "mailto:puneetshukla042@gmail.com", icon: "email", published: true },
  ],
  sections: [
    { id: "experience", label: "Journey", visible: true },
    { id: "skills", label: "Ecosystem", visible: true },
    { id: "projects", label: "Projects", visible: true },
    { id: "beyond", label: "Films", visible: true },
    { id: "events", label: "Events", visible: true },
    { id: "contact", label: "Contact", visible: true },
  ],
  seo: {
    title: "Puneet Shukla · Full-Stack Software Developer",
    description:
      "Puneet Shukla is a full-stack software developer (SDE-1) at SS Innovations International in Gurugram, building production web apps with Next.js, TypeScript, Node.js, MongoDB and AWS.",
    keywords: ["Puneet Shukla", "Full-stack developer", "Software engineer", "Next.js", "TypeScript", "React", "Node.js", "Gurugram"],
    siteUrl: "",
  },
  theme: { accent: "#007acc", accent2: "#10b981", defaultMode: "system" },
  contact: {
    heading: "Get in Touch",
    blurb: "The quickest way to reach me is email. You can also leave a message here and I'll reply.",
    formEnabled: true,
  },
  version: 2,
  updatedAt: "2026-11-27T00:00:00.000Z",
};
