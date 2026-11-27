export type SectionId =
  | "about"
  | "experience"
  | "projects"
  | "skills"
  | "education"
  | "events"
  | "beyond"
  | "contact";

export interface SectionSetting {
  id: SectionId;
  label: string;
  visible: boolean;
}

export interface Profile {
  name: string;
  role: string;
  company: string;
  location: string;
  /** Small pill above the name, e.g. "SDE-1 · Surgical robotics" */
  badge: string;
  /** Big hero headline */
  headline: string;
  /** One or two sentences under the headline */
  pitch: string;
  email: string;
  resumeUrl: string;
  /** Hero photo (portrait works best) */
  avatarUrl: string;
  /** Photo shown next to the About text */
  aboutPhotoUrl: string;
  /** Photo at the top of the Work section */
  workPhotoUrl: string;
  avatarAlt: string;
  aboutPhotoAlt: string;
  workPhotoAlt: string;
}

export interface About {
  heading: string;
  paragraphs: string[];
  facts: { label: string; value: string }[];
}

/** One card in "The Journey" timeline (jobs and internships). */
export interface Experience {
  id: string;
  company: string;
  role: string;
  /** Badge on the card, e.g. Full-time, Internship */
  type: string;
  start: string;
  end: string;
  location: string;
  logo: string;
  summary: string;
  points: string[];
  tech: string[];
  published: boolean;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  context: string;
  period: string;
  cover: string;
  gallery: string[];
  liveUrl: string;
  repoUrl: string;
  tech: string[];
  problem: string;
  /** My part, e.g. "Built v1 alone; co-develop the AWS version" */
  role: string;
  /** Case study: what I built (paragraph) */
  overview: string;
  /** Case study: how it is put together (paragraph) */
  architecture: string;
  /** Case study: hard parts and how they were solved (paragraph) */
  challenges: string;
  built: string[];
  impact: string[];
  /** Product demo video (web MP4) shown on the card and at the top of the case study */
  demoVideo: string;
  /** Poster frame for the demo video */
  demoPoster: string;
  /** Short line shown with the demo, e.g. "Attendee walkthrough" */
  demoCaption: string;
  featured: boolean;
  published: boolean;
}

/** Filter tab in "Engineering Ecosystem". id "ALL" shows every card. */
export interface SkillCategoryDef {
  id: string;
  label: string;
  /** Cards of this category take two columns in the "ALL" view */
  wide: boolean;
}
export type SkillIcon = "globe" | "layout" | "code" | "zap" | "layers" | "server" | "database" | "terminal" | "git" | "cloud" | "monitor" | "hash";

/** One card in the "Engineering Ecosystem" grid. */
export interface SkillCard {
  id: string;
  name: string;
  /** id of a SkillCategoryDef, e.g. FRONTEND */
  category: string;
  tag: string;
  year: string;
  icon: SkillIcon;
  /** Company keys shown as small logos: "ssi" | "medanta" */
  companies: string[];
  description: string;
  published: boolean;
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  start: string;
  end: string;
  location: string;
  grade: string;
  logo: string;
  summary: string;
  highlights: string[];
  tags: string[];
  published: boolean;
}

export type FilmTheme = "gold" | "orange" | "blue" | "sunset" | "purple";

/** One full-screen film block in "Beyond the Code". */
export interface BeyondItem {
  id: string;
  /** Small label above the title, e.g. "The Divine Play" */
  kicker: string;
  /** First title line */
  title: string;
  /** Second title line, shown with the gradient */
  titleAccent: string;
  quote: string;
  tags: string[];
  video: string;
  poster: string;
  /** Portrait clips recorded sideways need rotating */
  rotate: boolean;
  /** Video on the right on desktop (text on the left) */
  videoRight: boolean;
  theme: FilmTheme;
  published: boolean;
}

export interface EventPhoto {
  id: string;
  src: string;
  alt: string;
  caption: string;
  published: boolean;
}

export interface Events {
  heading: string;
  intro: string;
  photos: EventPhoto[];
}

export interface Beyond {
  kicker: string;
  heading: string;
  headingAccent: string;
  intro: string;
  items: BeyondItem[];
}

/** The VS Code hero: files shown in the editor. */
export interface HeroCode {
  /** Lines in developer.ts */
  role: string;
  company: string;
  location: string;
  /** Text returned by hire() */
  hire: string;
  /** key/value lines inside skills: { ... } in developer.ts */
  skills: { key: string; items: string[] }[];
  readme: string;
  styles: string;
}

export type SocialIcon = "github" | "linkedin" | "email" | "website" | "x" | "youtube" | "instagram";

export interface SocialLink {
  id: string;
  label: string;
  url: string;
  icon: SocialIcon;
  published: boolean;
}

export interface Seo {
  title: string;
  description: string;
  keywords: string[];
  siteUrl: string;
}

export interface Theme {
  accent: string;
  accent2: string;
  defaultMode: "dark" | "light" | "system";
}

export interface ContactSettings {
  heading: string;
  blurb: string;
  formEnabled: boolean;
}

/** Filter tab on the Art page gallery. */
export interface ArtCategory {
  id: string;
  label: string;
}

/** Settings of the Art page (/art). Items live in their own collection (see ArtItem). */
export interface ArtSettings {
  kicker: string;
  heading: string;
  headingAccent: string;
  intro: string;
  galleryHeading: string;
  galleryIntro: string;
  /** Hero reel on the Art page: a muted looping clip and its poster */
  heroVideo: string;
  heroPoster: string;
  /** Instagram profile URL shown on the Art page (optional) */
  instagramUrl: string;
  categories: ArtCategory[];
}

export interface ArtMedia {
  type: "image" | "video";
  src: string;
  /** Poster frame for videos (optional for images) */
  poster: string;
  /** Short muted low-res clip for hover previews (videos, optional) */
  preview?: string;
  width: number;
  height: number;
}

/** One piece in the Art gallery: a reel/video, a photo or a carousel (several media). */
export interface ArtItem {
  id: string;
  title: string;
  caption: string;
  /** id of an ArtCategory */
  category: string;
  /** film (the short films), reel or photo */
  kind?: "film" | "reel" | "photo";
  media: ArtMedia[];
  /** Thumbnail override; defaults to the first media's poster or image */
  thumb: string;
  /** Posted date, YYYY-MM-DD */
  date: string;
  /** Lower numbers show first; 0 = by date */
  order: number;
  featured: boolean;
  published: boolean;
  /** Where it came from: "instagram" (importer) or "admin" */
  source: string;
  /** Instagram account name for imported items */
  account: string;
  /** SHA-256 of the original files (importer idempotency) */
  hashes: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SiteContent {
  profile: Profile;
  about: About;
  experience: Experience[];
  projects: Project[];
  hero: HeroCode;
  skills: SkillCard[];
  skillCategories: SkillCategoryDef[];
  education: Education[];
  events: Events;
  beyond: Beyond;
  art: ArtSettings;
  social: SocialLink[];
  sections: SectionSetting[];
  seo: Seo;
  theme: Theme;
  contact: ContactSettings;
  /** Content schema version (2 = old-portfolio redesign) */
  version: number;
  updatedAt: string;
}

export const CONTENT_VERSION = 2;

export type ContentKey = Exclude<keyof SiteContent, "updatedAt" | "version">;

export interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  body: string;
  createdAt: string;
  read: boolean;
}

export interface ViewStats {
  total: number;
  days: { date: string; count: number }[];
  topPaths: { path: string; count: number }[];
}
