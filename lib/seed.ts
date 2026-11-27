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
      "id": "exp-ssi",
      "company": "SS Innovations International",
      "role": "Software Development Engineer I (SDE-1)",
      "type": "Full-time",
      "start": "Apr 2025",
      "end": "Present",
      "location": "Gurugram, India",
      "logo": "/images/logos/ssi.jpeg",
      "summary": "I build the web platforms and internal tools of a surgical-robotics company: event ticketing, training sites, conference platforms and team automation.",
      "points": [
        "Built SSI Events, the registration, slot-booking and QR-ticket platform for SS Innovations conferences, robot demo visits and workshops. Wrote the first version alone in Next.js, MongoDB and Socket.IO, then continued it on AWS Lambda and DynamoDB.",
        "Prevented overbooking with database transactions and idempotent retry IDs; an event-day load test of 1,620 booking attempts across 3 events confirmed 540 seats with none oversold.",
        "Built camera-based QR check-in in the browser and an admin console with per-module roles, an activity log, live analytics and CSV/Excel/print reports.",
        "Added bus tracking on Google Maps with a driver mode, slot waitlists, scheduled post-event feedback emails (EventBridge, SES) and a phone-first redesign of booking and admin check-in.",
        "Built SSI Studios, the team's internal workspace: training-certificate records with Excel import and PDF generation, and image, video and document converters that run in the browser.",
        "Built the SS Innovations corporate website (3D product visuals with Three.js), the SMRSC 2026 and SSI CRS sites, and worked on real-time instrument jaw-angle measurement with NDI optical tracking in Python."
      ],
      "tech": [
        "Next.js",
        "TypeScript",
        "AWS Lambda",
        "DynamoDB",
        "MongoDB",
        "Socket.IO",
        "Three.js",
        "Python"
      ],
      "published": true
    },
    {
      "id": "exp-medanta",
      "company": "Medanta The Medicity",
      "role": "Intern",
      "type": "Internship",
      "start": "Jun 2023",
      "end": "Aug 2023",
      "location": "Gurugram, India",
      "logo": "/images/logos/medanta.png",
      "summary": "Quality assurance on the hospital website and patient registration flows.",
      "points": [
        "Tested the hospital website and patient registration flows, catching validation errors, broken links and UI bugs.",
        "Logged defects with reproduction steps and severity, and re-tested fixes with developers before each release."
      ],
      "tech": [
        "Manual Testing",
        "Functional Testing",
        "QA"
      ],
      "published": true
    }
  ],
  projects: [
    {
      "role": "Built the first version alone (SSI Maya Connect). Co-develop the AWS serverless version with a teammate.",
      "overview": "Version 1 (SSI Maya Connect, Sep–Oct 2026, 102 commits, all mine): Next.js app with an event catalogue, two registration templates, multi-day slot booking, QR tickets, My Tickets recovery by booking reference plus mobile number, QR and manual check-in, live dashboards, reports, an analytics page, admin roles with an approval flow and an activity log. In October the platform moved to an AWS serverless codebase on GitLab, shared with a teammate. There I built Bus Management (live tracking, Driver Mode with Google Places suggestions, history), slot waitlists, post-event feedback emails, Admin Notes, the mobile booking flow redesign, check-in by booked date, a camera-first mobile check-in screen, an event-day dashboard and the bookings Excel export.",
      "architecture": "Version 1: a custom Node server ran Next.js and Socket.IO together, forked one worker per CPU, and shared real-time updates between workers and containers through Redis pub/sub. Docker Compose ran two app clusters behind an nginx least-connections load balancer, plus a backup service that streamed MongoDB change events into a separate append-only backup cluster that never deletes. Current version: CloudFront in front of a Next.js Lambda (standalone build with Lambda Web Adapter) and an API Lambda (TypeScript, Node 24, arm64, esbuild bundle); a single-table DynamoDB design with conditional writes and transactions; S3 for event images, SES for ticket email (DKIM, DMARC), SSM Parameter Store for secrets, EventBridge for scheduled feedback emails. Live screens poll revision counters every 4 seconds, cached 2 seconds at CloudFront, so polling cost does not grow with open screens.",
      "challenges": "Overselling under concurrent requests (solved with transactions and seat counters checked inside the write, not with application locks); duplicate submissions on bad venue networks (persistent retry IDs); time zones (every event stores its IANA time zone, check-in and slot expiry use it, and clock times skipped or repeated by daylight saving are rejected); duplicate scans at the door (conditional updates); safe image uploads (bytes are checked against the declared type, re-encoded and stripped of metadata); and admin security (scrypt password hashes, HMAC-signed HttpOnly cookies, lockout after 5 failed sign-ins in 15 minutes, cross-origin writes rejected).",
      "demoVideo": "https://o84jhj08pqkv4hu6.public.blob.vercel-storage.com/portfolio/projects/ssi-events-user-demo-199ukn755UioGd9DySU9Si7mLgn6xv.mp4",
      "demoPoster": "https://o84jhj08pqkv4hu6.public.blob.vercel-storage.com/portfolio/projects/ssi-events-user-demo-poster-oXY06zKfEvyMa3UX0V4cUbIfF7tqCF.jpg",
      "demoCaption": "Attendee walkthrough: find an event, book a slot, get a QR ticket, check in · 1:22",
      "id": "prj-events",
      "slug": "ssi-events",
      "title": "SSI Events",
      "tagline": "Registration, slot booking, QR tickets and venue check-in for SS Innovations events: robotic-surgery conferences, SSi MantraM system visits and CME workshops.",
      "context": "SS Innovations International",
      "period": "Sep 2026 – Present",
      "cover": "",
      "gallery": [],
      "liveUrl": "",
      "repoUrl": "",
      "tech": [
        "Next.js 16",
        "React 19",
        "TypeScript",
        "Tailwind CSS 4",
        "Node.js",
        "AWS Lambda",
        "DynamoDB",
        "Amazon S3",
        "Amazon SES",
        "CloudFront",
        "EventBridge",
        "GitLab CI/CD",
        "MongoDB",
        "Socket.IO",
        "Redis",
        "Docker"
      ],
      "problem": "SS Innovations runs conferences, MantraM robot demo visits and CME workshops where surgeons and clinical staff book time slots. Registration and check-in needed one system that stops overbooking, works on a phone at the venue, and gives staff live numbers and exports.",
      "built": [
        "Attendees book without an account: pick a slot, get a QR ticket on screen and by email, then reschedule, cancel or add it to Google Calendar. Registration-only events skip the slot step.",
        "Each booking is one database transaction with an idempotency key, so a seat is claimed only while the slot has room and a retried request returns the original booking. An event-day load test made 1,620 booking attempts (30 in flight) across 3 events and 3 days: 540 seats confirmed, no overbooking.",
        "Check-in scans tickets with the phone camera in the browser. Two scanners reading the same ticket record it once, and early or late arrivals can be moved into an open slot and checked in in one step.",
        "Admin console with per-module permissions (superadmin, admin, staff), an activity log kept for one year, first-party analytics (visits, booking funnel, live visitors, API response times) and reports exported to CSV, Excel and print.",
        "I added bus tracking for the SSi MantraM tour bus (the driver's phone shares its location; staff see the bus on Google Maps), slot waitlists, post-event feedback emails sent 30 minutes after each slot ends, shared admin notes, and a phone-first redesign of booking and admin check-in.",
        "Runs with no always-on servers: CloudFront routes to two Lambda functions, data is in one DynamoDB table, and a merge to main deploys through GitLab CI with short-lived OIDC credentials and a post-deploy health check."
      ],
      "impact": [
        "In production for SS Innovations events. Test coverage: 143 backend tests and 10 frontend unit tests run in CI on every merge request; version 1 had 22 unit, 34 API and 65 browser checks across Chromium, Firefox and WebKit. An idle month costs under USD 1 to run."
      ],
      "featured": true,
      "published": true
    },
    {
      "role": "",
      "overview": "",
      "architecture": "",
      "challenges": "",
      "demoVideo": "",
      "demoPoster": "",
      "demoCaption": "",
      "id": "prj-smrsc",
      "slug": "smrsc-2026",
      "title": "SMRSC 2026 website",
      "tagline": "Website for SMRSC 2026, SS Innovations' international conference on robotic surgery.",
      "context": "SS Innovations International",
      "period": "",
      "cover": "/images/projects/smrsc.webp",
      "gallery": [],
      "liveUrl": "https://smrsc.vercel.app/home",
      "repoUrl": "",
      "tech": [
        "Next.js",
        "React",
        "TypeScript",
        "Tailwind CSS",
        "Framer Motion",
        "MongoDB",
        "Mongoose",
        "Lenis"
      ],
      "problem": "A global conference connecting surgeons, healthcare leaders and innovators needed one fast, polished home for its schedule, faculty, venue, media and registration.",
      "built": [
        "Full-stack Next.js App Router platform with frontend and API routes in a single application.",
        "Modules for schedules, faculty profiles, venue information, media content and event registration.",
        "Animated, responsive interface with Framer Motion, Lenis smooth scrolling and Tailwind components.",
        "MongoDB-backed API routes for visitor analytics and editable content."
      ],
      "impact": [
        "Schedules, faculty and media are managed as content instead of being hard-coded."
      ],
      "featured": false,
      "published": true
    },
    {
      "role": "",
      "overview": "",
      "architecture": "",
      "challenges": "",
      "demoVideo": "",
      "demoPoster": "",
      "demoCaption": "",
      "id": "prj-crs",
      "slug": "ssi-crs",
      "title": "SSI CRS website",
      "tagline": "Website for the SSI CRS training program, where surgeons learn the SSi Mantra robotic system.",
      "context": "SS Innovations International",
      "period": "",
      "cover": "/images/projects/ssicrs.webp",
      "gallery": [],
      "liveUrl": "https://ssicrsweb.vercel.app/Home",
      "repoUrl": "",
      "tech": [
        "Next.js",
        "React",
        "Tailwind CSS"
      ],
      "problem": "Healthcare professionals needed a simple place to discover and register for hands-on training programs on the SSi Mantra surgical robotic system.",
      "built": [
        "Pages that explain the training program and its hands-on courses on the SSi Mantra system.",
        "A short enrolment flow for surgeons and clinical staff.",
        "Responsive pages set up for search, with a sitemap and page metadata."
      ],
      "impact": [
        "Doctors can find and sign up for robotic-surgery training in one place."
      ],
      "featured": false,
      "published": true
    },
    {
      "role": "Developer",
      "overview": "Next.js App Router site with reusable section components, product pages for SSi Mantra, SSI Maya, SSI Mudra and telesurgery, and 3D product visuals.",
      "architecture": "Next.js App Router with content in typed data files; Three.js and React Three Fiber scenes load only when their section comes into view.",
      "challenges": "Keeping the 3D scenes and media-heavy pages fast on phones: lazy-loaded sections, dynamic imports, optimised images and self-hosted fonts.",
      "demoVideo": "",
      "demoPoster": "",
      "demoCaption": "",
      "id": "prj-corporate",
      "slug": "ss-innovations-website",
      "title": "SS Innovations website",
      "tagline": "Corporate website for SS Innovations, with product pages and 3D visuals of the SSi Mantra surgical robot.",
      "context": "SS Innovations International",
      "period": "May 2026 – Nov 2026",
      "cover": "/images/projects/ssinnovations.webp",
      "gallery": [],
      "liveUrl": "https://ssinnovations.com/",
      "repoUrl": "",
      "tech": [
        "Next.js",
        "React",
        "TypeScript",
        "Tailwind CSS",
        "Three.js",
        "React Three Fiber",
        "Framer Motion"
      ],
      "problem": "SS Innovations needed a public website that shows its surgical robots and telesurgery work to surgeons, hospitals and investors, and stays fast on phones.",
      "built": [
        "Product pages for SSi Mantra, SSI Maya, SSI Mudra and telesurgery.",
        "3D product visuals of the SSi Mantra robot built with Three.js and React Three Fiber.",
        "Performance work: lazy-loaded sections, dynamic imports, Next.js image optimisation and self-hosted fonts."
      ],
      "impact": [],
      "featured": false,
      "published": true
    },
    {
      "role": "Developer (SS Innovations R&D work)",
      "overview": "A Python program that reads 6-DoF poses from NDI optical trackers in real time and uses a PyTorch model to estimate the opening angle between the instrument's jaws while it moves.",
      "architecture": "",
      "challenges": "",
      "demoVideo": "",
      "demoPoster": "",
      "demoCaption": "",
      "id": "prj-jaw",
      "slug": "instrument-tracking",
      "title": "Real-time instrument angle tracking (NDI sensors)",
      "tagline": "Measures the jaw angle of a surgical robot instrument live, using 6-DoF NDI optical trackers and a PyTorch model.",
      "context": "SS Innovations International",
      "period": "",
      "cover": "",
      "gallery": [],
      "liveUrl": "",
      "repoUrl": "",
      "tech": [
        "Python",
        "PyTorch",
        "NDI optical tracking"
      ],
      "problem": "The instrument jaw module needed a way to measure the opening angle between its jaws during motion.",
      "built": [
        "Reads 6-DoF poses from NDI optical trackers in real time.",
        "A PyTorch model estimates the angle between the instrument's jaws from the tracking data while the instrument moves.",
        "Built for the instrument jaw module of the SSi Mantra surgical robot."
      ],
      "impact": [],
      "featured": false,
      "published": true
    },
    {
      "role": "Solo developer",
      "overview": "A signed-in workspace with a certificate database, Excel import/export and PDF generation, plus browser-only converters and a QR generator. Rebuilt in November 2026 with a new UI, real authentication and certificate templates; the earlier version also had ID card, poster and visiting-card tools.",
      "architecture": "Next.js App Router with server components querying MongoDB through Mongoose; API routes for certificate CRUD, Excel upload and stats; route protection in proxy.ts; converters run client-side with ffmpeg.wasm and pdf.js.",
      "challenges": "Running video conversion in the browser at usable speed (cross-origin isolation headers for multi-threaded ffmpeg, with a single-thread fallback); faster page loads (shared workspace layout, cached certificate data, single certificate load).",
      "demoVideo": "",
      "demoPoster": "",
      "demoCaption": "",
      "id": "prj-studios",
      "slug": "ssi-studios",
      "title": "SSI Studios",
      "tagline": "Internal workspace for the SS Innovations team: training-certificate records and PDF generation, in-browser file conversion and a QR code generator.",
      "context": "SS Innovations International",
      "period": "Jun 2026 – Present (rebuilt Nov 2026)",
      "cover": "/images/projects/ssistudios.webp",
      "gallery": [],
      "liveUrl": "",
      "repoUrl": "",
      "tech": [
        "Next.js 16",
        "React 19",
        "TypeScript",
        "Tailwind CSS 4",
        "MongoDB",
        "Mongoose",
        "pdf-lib",
        "jsPDF",
        "ffmpeg.wasm",
        "pdf.js",
        "SheetJS",
        "Vercel"
      ],
      "problem": "The training team issued surgeon certificates by hand and kept records in spreadsheets; staff also used outside websites to convert files.",
      "built": [
        "Certificate module: search, filter, add, edit and delete training records, bulk import from Excel, export to Excel, and one PDF per certificate generated from templates.",
        "Duplicate finder flags records with the same name and hospital.",
        "Dashboard with live certificate counts, recent records and top hospitals.",
        "Image, video/audio and document converters that run entirely in the browser (ffmpeg.wasm, with multi-threading enabled through COOP/COEP headers), so files are not uploaded.",
        "Every page and API route is protected by a proxy that checks an HMAC-signed, HttpOnly session cookie; passwords are bcrypt-hashed.",
        "Public tool pages with a sitemap, structured data and IndexNow pings for search indexing; functions pinned to the Mumbai region next to the database."
      ],
      "impact": [
        "Used by the SS Innovations team for certificate records."
      ],
      "featured": true,
      "published": true
    },
    {
      "role": "Solo: design, web app, Node server, Android apps",
      "overview": "A Next.js progressive web app served from my PC, a native Android backup app, and a second Android app for chat and calls. Media stays in a folder on the PC; the app only reads originals and keeps its own data (thumbnails, renditions, AI index) in separate folders.",
      "architecture": "Next.js 16 app on a Node server reachable only over a private VPN. Photo understanding runs in a separate Node child process that talks JSON over stdin/stdout and stores results keyed by file content, so they survive renames. Video renditions and HLS segments are generated by ffmpeg. Android apps are WebView shells with native Java services for background sync, notifications and updates. Real-time chat uses Server-Sent Events; calls use WebRTC with a self-hosted TURN relay.",
      "challenges": "Keeping AI indexing from slowing the PC (below-normal process priority, one image at a time); stopping the Android app from filling the phone (originals and videos are never cached, cache capped at 100 MB); resuming interrupted uploads; grouping faces without merging different people (similarity threshold tuned on real photos).",
      "demoVideo": "",
      "demoPoster": "",
      "demoCaption": "",
      "id": "prj-064567a0",
      "slug": "puneet-studios",
      "title": "Puneet Studios",
      "tagline": "A self-hosted photo and video library on my own PC, with Android apps for automatic backup, private chat and video calls. Photos never leave the computer.",
      "context": "Personal project",
      "period": "Oct 2026 – Present",
      "cover": "",
      "gallery": [],
      "liveUrl": "",
      "repoUrl": "",
      "tech": [
        "Next.js 16",
        "React 19",
        "JavaScript",
        "Node.js",
        "Java (Android)",
        "ffmpeg",
        "sharp",
        "Transformers.js (CLIP)",
        "TensorFlow.js",
        "WebRTC",
        "Server-Sent Events",
        "PWA"
      ],
      "problem": "I wanted Google Photos features (search, people, backup, sharing) for my family's media without uploading it to a cloud service or paying for storage.",
      "built": [
        "Search photos by what they show (\"beach\", \"cake\") and group people by face. A low-priority background process runs CLIP and a face model locally on the PC; no photo is sent to any cloud service.",
        "Video player with adaptive HLS streaming and a quality menu (Auto, 1080p, 720p, 480p), HDR-to-SDR tone mapping, lossless trim, rotation and audio extraction, all through ffmpeg on the server.",
        "Native Android app (Java, built without Gradle) that backs up every new photo and video in 8 MB resumable chunks, newest first, skips files the PC already has by SHA-256, and can free up space on the phone.",
        "Duplicate and best-shot finder (exact SHA-256 matches, plus near-duplicates by CLIP similarity and perceptual hash), recycle bin, albums with revocable share links, map view and an offline-capable trip planner with expenses.",
        "Separate chat app for friends: live messages, photos and voice notes over Server-Sent Events, and video calls over WebRTC through a TURN relay that runs on the PC, so calls do not depend on third-party servers.",
        "The server watches its own source, rebuilds into an alternate folder and restarts by itself; phones detect the new build and update without a prompt."
      ],
      "impact": [
        "Used daily by me and my family. 48 commits from Oct to Nov 2026; Android app at version 4.5."
      ],
      "featured": false,
      "published": false
    },
    {
      "role": "Developer",
      "overview": "An LLM-powered RAG chatbot using LangChain and vector search (from LinkedIn).",
      "architecture": "No code found on this PC; confirm the language, model, vector store and where it is deployed before publishing details.",
      "challenges": "",
      "demoVideo": "",
      "demoPoster": "",
      "demoCaption": "",
      "id": "prj-b59f16cc",
      "slug": "rag-chatbot",
      "title": "Website assistant (RAG chatbot)",
      "tagline": "An LLM chatbot that answers website visitors' questions from the site's own content, using retrieval-augmented generation.",
      "context": "SS Innovations International",
      "period": "",
      "cover": "",
      "gallery": [],
      "liveUrl": "",
      "repoUrl": "",
      "tech": [
        "Python",
        "LangChain",
        "LLMs",
        "Vector search"
      ],
      "problem": "Website visitors needed quick answers without searching through pages.",
      "built": [
        "Indexes site content in a vector store and retrieves the relevant passages for each question.",
        "Passes the retrieved passages to an LLM so answers come from the site's content.",
        "Built with LangChain."
      ],
      "impact": [],
      "featured": false,
      "published": false
    },
    {
      "role": "Developer",
      "overview": "A learning management system with courses, assessments, progress and certification (from LinkedIn).",
      "architecture": "No code found on this PC; confirm details before publishing.",
      "challenges": "",
      "demoVideo": "",
      "demoPoster": "",
      "demoCaption": "",
      "id": "prj-5ad53d11",
      "slug": "learning-management-system",
      "title": "Learning management system",
      "tagline": "Courses, assessments, progress tracking and certification in one web app.",
      "context": "SS Innovations International",
      "period": "",
      "cover": "",
      "gallery": [],
      "liveUrl": "",
      "repoUrl": "",
      "tech": [
        "Next.js",
        "Node.js",
        "PostgreSQL",
        "Docker"
      ],
      "problem": "",
      "built": [
        "Course content, assessments and per-learner progress.",
        "Certification on completion.",
        "Next.js front end, Node.js backend, PostgreSQL database, Docker deployment."
      ],
      "impact": [],
      "featured": false,
      "published": false
    },
    {
      "role": "Developer",
      "overview": "A VR medical imaging app in Unity (from LinkedIn). The PC has a Unity project and Windows build based on Meta's Interaction SDK samples, but no MRI/CT volume code was found in it.",
      "architecture": "Confirm the volume-rendering approach and data format before publishing details.",
      "challenges": "",
      "demoVideo": "",
      "demoPoster": "",
      "demoCaption": "",
      "id": "prj-3951068b",
      "slug": "vr-medical-imaging",
      "title": "VR medical imaging viewer",
      "tagline": "A Unity VR app that shows MRI and CT scans as 3D volumes you can grab, turn and inspect.",
      "context": "SS Innovations International",
      "period": "",
      "cover": "",
      "gallery": [],
      "liveUrl": "",
      "repoUrl": "",
      "tech": [
        "Unity",
        "C#",
        "Meta XR Interaction SDK",
        "Meta Quest"
      ],
      "problem": "",
      "built": [
        "Loads MRI and CT scans and shows them as interactive 3D volumes in VR.",
        "Hand and controller interaction through the Meta XR Interaction SDK.",
        "Built and run as a Quest / PC VR application."
      ],
      "impact": [],
      "featured": false,
      "published": false
    },
    {
      "role": "",
      "overview": "",
      "architecture": "",
      "challenges": "",
      "demoVideo": "",
      "demoPoster": "",
      "demoCaption": "",
      "id": "prj-blackhole",
      "slug": "black-hole-simulation",
      "title": "Black Hole Simulation",
      "tagline": "Real-time WebGL ray-marching of Schwarzschild / Kerr black holes.",
      "context": "Personal project",
      "period": "",
      "cover": "/images/projects/blackhole.webp",
      "gallery": [],
      "liveUrl": "",
      "repoUrl": "",
      "tech": [
        "Next.js",
        "React",
        "TypeScript",
        "WebGL",
        "GLSL"
      ],
      "problem": "Visualise how a black hole bends light, interactively and in real time, in an ordinary browser.",
      "built": [
        "Interactive WebGL simulation using general-relativistic ray marching written in GLSL.",
        "Gravitational lensing and a volumetric accretion disk with Doppler beaming.",
        "Adaptive step sizing for high-performance rendering."
      ],
      "impact": [
        "Runs in real time in the browser with no install."
      ],
      "featured": false,
      "published": false
    }
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
    {
      "id": "sk-d4a86cb9",
      "name": "TypeScript",
      "category": "LANGUAGES",
      "tag": "Languages",
      "year": "2025",
      "icon": "code",
      "companies": [
        "ssi"
      ],
      "description": "SSI Events (frontend and Lambda API), SSI Maya Connect, SSI Studios, company websites",
      "published": true
    },
    {
      "id": "sk-ee620923",
      "name": "JavaScript",
      "category": "LANGUAGES",
      "tag": "Languages",
      "year": "2025",
      "icon": "code",
      "companies": [],
      "description": "Puneet Studios server and web app; Node build and render scripts",
      "published": true
    },
    {
      "id": "sk-6e360488",
      "name": "Python",
      "category": "LANGUAGES",
      "tag": "Languages",
      "year": "2021",
      "icon": "code",
      "companies": [
        "ssi",
        "gla"
      ],
      "description": "Instrument angle tracking with NDI sensors; B.Tech in CSE (AI & ML)",
      "published": true
    },
    {
      "id": "sk-e027e576",
      "name": "Java",
      "category": "LANGUAGES",
      "tag": "Languages",
      "year": "2026",
      "icon": "code",
      "companies": [],
      "description": "Puneet Studios Android apps: background sync service, notifications, updater",
      "published": true
    },
    {
      "id": "sk-e4bc4b10",
      "name": "C#",
      "category": "LANGUAGES",
      "tag": "Languages",
      "year": "2025",
      "icon": "code",
      "companies": [],
      "description": "Unity VR project",
      "published": true
    },
    {
      "id": "sk-2064cb64",
      "name": "SQL",
      "category": "LANGUAGES",
      "tag": "Languages",
      "year": "2021",
      "icon": "database",
      "companies": [],
      "description": "Relational schemas, joins and queries.",
      "published": true
    },
    {
      "id": "sk-4d1f996a",
      "name": "React",
      "category": "FRONTEND",
      "tag": "Frontend",
      "year": "2025",
      "icon": "layout",
      "companies": [],
      "description": "All web projects (React 19)",
      "published": true
    },
    {
      "id": "sk-694fd7bd",
      "name": "Next.js",
      "category": "FRONTEND",
      "tag": "Frontend",
      "year": "2025",
      "icon": "layout",
      "companies": [],
      "description": "All web projects (Next.js 16 App Router, standalone build on Lambda, static export)",
      "published": true
    },
    {
      "id": "sk-cfea8894",
      "name": "Tailwind CSS",
      "category": "FRONTEND",
      "tag": "Frontend",
      "year": "2025",
      "icon": "layers",
      "companies": [
        "ssi"
      ],
      "description": "SSI Events, SSI Studios, company websites (Tailwind 4)",
      "published": true
    },
    {
      "id": "sk-e6276f16",
      "name": "Framer Motion",
      "category": "FRONTEND",
      "tag": "Frontend",
      "year": "2025",
      "icon": "layers",
      "companies": [
        "ssi"
      ],
      "description": "SSI Events booking flow, company websites",
      "published": true
    },
    {
      "id": "sk-ace8b068",
      "name": "Three.js / React Three Fiber",
      "category": "FRONTEND",
      "tag": "Frontend",
      "year": "2026",
      "icon": "layers",
      "companies": [
        "ssi"
      ],
      "description": "SS Innovations corporate website 3D product visuals",
      "published": true
    },
    {
      "id": "sk-385e9e93",
      "name": "Recharts",
      "category": "FRONTEND",
      "tag": "Frontend",
      "year": "2026",
      "icon": "layout",
      "companies": [
        "ssi"
      ],
      "description": "SSI Events reports and analytics",
      "published": true
    },
    {
      "id": "sk-05e394c4",
      "name": "Progressive web apps",
      "category": "FRONTEND",
      "tag": "Frontend",
      "year": "2026",
      "icon": "layout",
      "companies": [],
      "description": "Puneet Studios (manifest, offline trip planner, auto-update)",
      "published": true
    },
    {
      "id": "sk-10b34932",
      "name": "Node.js",
      "category": "BACKEND",
      "tag": "Backend",
      "year": "2025",
      "icon": "server",
      "companies": [
        "ssi"
      ],
      "description": "SSI Events API on Lambda (Node 24), SSI Maya Connect custom server with worker cluster, Puneet Studios server",
      "published": true
    },
    {
      "id": "sk-4dcf0663",
      "name": "REST APIs",
      "category": "BACKEND",
      "tag": "Backend",
      "year": "2025",
      "icon": "server",
      "companies": [
        "ssi"
      ],
      "description": "SSI Events API (documented contract), SSI Studios API routes",
      "published": true
    },
    {
      "id": "sk-c0a9e6bd",
      "name": "Socket.IO",
      "category": "BACKEND",
      "tag": "Backend",
      "year": "2026",
      "icon": "zap",
      "companies": [
        "ssi"
      ],
      "description": "SSI Maya Connect: live bookings, attendance and dashboards, fanned out across workers through Redis",
      "published": true
    },
    {
      "id": "sk-fe00bd91",
      "name": "Server-Sent Events and WebRTC",
      "category": "BACKEND",
      "tag": "Backend",
      "year": "2026",
      "icon": "zap",
      "companies": [],
      "description": "Puneet Studios chat (SSE) and video calls (WebRTC with a self-hosted TURN relay)",
      "published": true
    },
    {
      "id": "sk-88d2336f",
      "name": "Authentication and role-based access",
      "category": "BACKEND",
      "tag": "Backend",
      "year": "2025",
      "icon": "server",
      "companies": [
        "ssi"
      ],
      "description": "SSI Events: scrypt hashes, HMAC-signed cookies, per-module permissions, lockout, audit log; SSI Studios: bcrypt and signed sessions",
      "published": true
    },
    {
      "id": "sk-0be4b9df",
      "name": "Express.js / NestJS",
      "category": "BACKEND",
      "tag": "Backend",
      "year": "",
      "icon": "server",
      "companies": [],
      "description": "REST services on Node.js.",
      "published": true
    },
    {
      "id": "sk-801baa81",
      "name": "MongoDB / Mongoose",
      "category": "DATA",
      "tag": "Data",
      "year": "2025",
      "icon": "database",
      "companies": [
        "ssi"
      ],
      "description": "SSI Maya Connect (transactions, change streams, append-only backup cluster), SSI Studios",
      "published": true
    },
    {
      "id": "sk-28f0d442",
      "name": "DynamoDB",
      "category": "DATA",
      "tag": "Data",
      "year": "2026",
      "icon": "database",
      "companies": [
        "ssi"
      ],
      "description": "SSI Events: single-table design, transactions, conditional writes, TTL, point-in-time recovery",
      "published": true
    },
    {
      "id": "sk-24071b57",
      "name": "Redis",
      "category": "DATA",
      "tag": "Data",
      "year": "2026",
      "icon": "database",
      "companies": [
        "ssi"
      ],
      "description": "SSI Maya Connect: pub/sub for real-time updates across processes",
      "published": true
    },
    {
      "id": "sk-24fd6c2d",
      "name": "PostgreSQL",
      "category": "DATA",
      "tag": "Data",
      "year": "",
      "icon": "database",
      "companies": [],
      "description": "Database for a learning management system.",
      "published": true
    },
    {
      "id": "sk-deaa0c39",
      "name": "MySQL",
      "category": "DATA",
      "tag": "Data",
      "year": "",
      "icon": "database",
      "companies": [],
      "description": "Relational schemas and queries.",
      "published": true
    },
    {
      "id": "sk-0b7a6b9b",
      "name": "AWS Lambda",
      "category": "CLOUD",
      "tag": "Cloud & DevOps",
      "year": "2026",
      "icon": "cloud",
      "companies": [
        "ssi"
      ],
      "description": "SSI Events: API and Next.js site as Lambda functions",
      "published": true
    },
    {
      "id": "sk-ae6bf120",
      "name": "Amazon S3, SES, CloudFront, EventBridge",
      "category": "CLOUD",
      "tag": "Cloud & DevOps",
      "year": "2026",
      "icon": "cloud",
      "companies": [
        "ssi"
      ],
      "description": "SSI Events: images and static assets, ticket email with DKIM/DMARC, CDN routing and caching, scheduled feedback emails",
      "published": true
    },
    {
      "id": "sk-bc9f66ec",
      "name": "AWS IAM, SSM Parameter Store, Route 53",
      "category": "CLOUD",
      "tag": "Cloud & DevOps",
      "year": "2026",
      "icon": "cloud",
      "companies": [
        "ssi"
      ],
      "description": "SSI Events: least-privilege roles, GitLab OIDC deploy role, secrets, DNS",
      "published": true
    },
    {
      "id": "sk-a77d03da",
      "name": "Docker and Docker Compose",
      "category": "CLOUD",
      "tag": "Cloud & DevOps",
      "year": "2026",
      "icon": "terminal",
      "companies": [
        "ssi"
      ],
      "description": "SSI Maya Connect: two app clusters, Redis, backup service",
      "published": true
    },
    {
      "id": "sk-f2560cbc",
      "name": "Nginx",
      "category": "CLOUD",
      "tag": "Cloud & DevOps",
      "year": "2026",
      "icon": "terminal",
      "companies": [
        "ssi"
      ],
      "description": "SSI Maya Connect: least-connections load balancer with failover, gzip and static caching",
      "published": true
    },
    {
      "id": "sk-61780c02",
      "name": "CI/CD (GitLab CI)",
      "category": "CLOUD",
      "tag": "Cloud & DevOps",
      "year": "2026",
      "icon": "git",
      "companies": [
        "ssi"
      ],
      "description": "SSI Events: merge-request pipeline, protected main, automatic deploy with health check",
      "published": true
    },
    {
      "id": "sk-4a7b27e9",
      "name": "Vercel",
      "category": "CLOUD",
      "tag": "Cloud & DevOps",
      "year": "2025",
      "icon": "cloud",
      "companies": [
        "ssi"
      ],
      "description": "SSI Studios, SSI Maya Connect (Mumbai region), app download page",
      "published": true
    },
    {
      "id": "sk-04e1d163",
      "name": "AWS EC2",
      "category": "CLOUD",
      "tag": "Cloud & DevOps",
      "year": "",
      "icon": "cloud",
      "companies": [],
      "description": "Virtual servers on AWS.",
      "published": true
    },
    {
      "id": "sk-98a2e30e",
      "name": "PyTorch",
      "category": "AI",
      "tag": "AI & ML",
      "year": "2025",
      "icon": "zap",
      "companies": [
        "ssi"
      ],
      "description": "Instrument angle model",
      "published": true
    },
    {
      "id": "sk-1d17ae57",
      "name": "On-device computer vision (CLIP, face recognition)",
      "category": "AI",
      "tag": "AI & ML",
      "year": "2026",
      "icon": "zap",
      "companies": [],
      "description": "Puneet Studios: Transformers.js CLIP for photo search, TensorFlow.js face model for People grouping, near-duplicate detection",
      "published": true
    },
    {
      "id": "sk-7d573505",
      "name": "LLMs, RAG, LangChain",
      "category": "AI",
      "tag": "AI & ML",
      "year": "2025",
      "icon": "zap",
      "companies": [],
      "description": "Website RAG chatbot",
      "published": true
    },
    {
      "id": "sk-6e2df9e4",
      "name": "Machine learning and deep learning",
      "category": "AI",
      "tag": "AI & ML",
      "year": "2021",
      "icon": "zap",
      "companies": [
        "gla"
      ],
      "description": "B.Tech CSE (AI & ML specialisation)",
      "published": true
    },
    {
      "id": "sk-d0866d1b",
      "name": "Unity",
      "category": "XR",
      "tag": "XR",
      "year": "2025",
      "icon": "monitor",
      "companies": [],
      "description": "VR medical imaging app",
      "published": true
    },
    {
      "id": "sk-99123449",
      "name": "Meta XR Interaction SDK",
      "category": "XR",
      "tag": "XR",
      "year": "2025",
      "icon": "monitor",
      "companies": [],
      "description": "Hand and controller interaction for Meta Quest.",
      "published": true
    },
    {
      "id": "sk-0b0a8124",
      "name": "Git, GitHub, GitLab",
      "category": "TOOLS",
      "tag": "Tools",
      "year": "2025",
      "icon": "git",
      "companies": [
        "ssi"
      ],
      "description": "All projects; merge-request workflow on SSI Events",
      "published": true
    },
    {
      "id": "sk-871d3d0c",
      "name": "Playwright and node:test",
      "category": "TOOLS",
      "tag": "Tools",
      "year": "2026",
      "icon": "terminal",
      "companies": [
        "ssi"
      ],
      "description": "SSI Maya Connect browser tests and event-day load scenario; SSI Events backend tests",
      "published": true
    },
    {
      "id": "sk-8669df97",
      "name": "ffmpeg / ffmpeg.wasm",
      "category": "TOOLS",
      "tag": "Tools",
      "year": "2026",
      "icon": "terminal",
      "companies": [
        "ssi"
      ],
      "description": "Puneet Studios video processing (HLS, tone mapping, trim); SSI Studios in-browser converter",
      "published": true
    },
    {
      "id": "sk-8aba34ed",
      "name": "Google Maps JavaScript API",
      "category": "TOOLS",
      "tag": "Tools",
      "year": "2026",
      "icon": "globe",
      "companies": [
        "ssi"
      ],
      "description": "SSI Events bus tracking and Driver Mode place suggestions",
      "published": true
    },
    {
      "id": "sk-53e6ce35",
      "name": "ZXing (QR scanning)",
      "category": "TOOLS",
      "tag": "Tools",
      "year": "2026",
      "icon": "terminal",
      "companies": [
        "ssi"
      ],
      "description": "SSI Events check-in scanner",
      "published": true
    },
    {
      "id": "sk-162f7472",
      "name": "pdf-lib, jsPDF, SheetJS, ExcelJS",
      "category": "TOOLS",
      "tag": "Tools",
      "year": "2025",
      "icon": "terminal",
      "companies": [
        "ssi"
      ],
      "description": "SSI Studios certificate PDFs and Excel import/export; SSI Events exports",
      "published": true
    },
    {
      "id": "sk-13be65af",
      "name": "Figma",
      "category": "TOOLS",
      "tag": "Tools",
      "year": "2025",
      "icon": "terminal",
      "companies": [],
      "description": "Interface design and prototypes.",
      "published": true
    }
  ],
  skillCategories: [
    {
      "id": "ALL",
      "label": "Ecosystem",
      "wide": false
    },
    {
      "id": "LANGUAGES",
      "label": "Languages",
      "wide": false
    },
    {
      "id": "FRONTEND",
      "label": "Frontend",
      "wide": false
    },
    {
      "id": "BACKEND",
      "label": "Backend",
      "wide": false
    },
    {
      "id": "DATA",
      "label": "Data",
      "wide": false
    },
    {
      "id": "CLOUD",
      "label": "Cloud & DevOps",
      "wide": false
    },
    {
      "id": "AI",
      "label": "AI & ML",
      "wide": false
    },
    {
      "id": "XR",
      "label": "XR",
      "wide": false
    },
    {
      "id": "TOOLS",
      "label": "Tools",
      "wide": false
    }
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
  art: {
    kicker: "The Art Side",
    heading: "Frames &",
    headingAccent: "Stories",
    intro: "Away from the editor I shoot and cut short films, reels and photographs. This is where that work lives.",
    galleryHeading: "Gallery",
    galleryIntro: "Reels and photographs from the road.",
    instagramUrl: "https://www.instagram.com/puneetshuklafilms/",
    heroVideo: "/videos/heroone.webm",
    heroPoster: "/videos/heroone.webp",
    categories: [
      { id: "films-reels", label: "Films & Reels" },
      { id: "travel", label: "Travel & Nature" },
      { id: "skies", label: "Skies & Nights" },
      { id: "festivals", label: "Festivals & Temples" },
      { id: "streets", label: "Streets & Cities" },
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
  theme: { accent: "#007acc", accent2: "#10b981", defaultMode: "light" },
  contact: {
    heading: "Get in Touch",
    blurb: "The quickest way to reach me is email. You can also leave a message here and I'll reply.",
    formEnabled: true,
  },
  version: 2,
  updatedAt: "2026-11-27T00:00:00.000Z",
};
