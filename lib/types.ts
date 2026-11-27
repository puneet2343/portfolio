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

export interface SubProject {
  title: string;
  tech: string[];
  points: string[];
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  start: string;
  end: string;
  location: string;
  logo: string;
  summary: string;
  items: SubProject[];
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
  built: string[];
  impact: string[];
  featured: boolean;
  published: boolean;
}

export interface SkillGroup {
  id: string;
  name: string;
  items: string[];
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
  highlights: string[];
  published: boolean;
}

export interface BeyondItem {
  id: string;
  title: string;
  subtitle: string;
  tags: string[];
  image: string;
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
  heading: string;
  intro: string;
  items: BeyondItem[];
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
  defaultMode: "dark" | "light";
}

export interface ContactSettings {
  heading: string;
  blurb: string;
  formEnabled: boolean;
}

export interface SiteContent {
  profile: Profile;
  about: About;
  experience: Experience[];
  projects: Project[];
  skills: SkillGroup[];
  education: Education[];
  events: Events;
  beyond: Beyond;
  social: SocialLink[];
  sections: SectionSetting[];
  seo: Seo;
  theme: Theme;
  contact: ContactSettings;
  updatedAt: string;
}

export type ContentKey = Exclude<keyof SiteContent, "updatedAt">;

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
