import type { ContentKey } from "@/lib/types";
import type { Field } from "./Form";

const rid = () => Math.random().toString(36).slice(2, 10);

export type EditorDef = {
  key: ContentKey;
  title: string;
  intro: string;
  kind: "object" | "list";
  fields: Field[];
  newItem?: () => unknown;
  titleOf?: (x: never) => string;
  addLabel?: string;
};

export const EDITORS: Record<string, EditorDef> = {
  profile: {
    key: "profile",
    title: "Hero & profile",
    intro: "The first thing visitors see: your name, the headline, the short pitch and the hero photo.",
    kind: "object",
    fields: [
      { k: "name", label: "Name", type: "text", half: true },
      { k: "role", label: "Role", type: "text", half: true },
      { k: "company", label: "Company", type: "text", half: true },
      { k: "location", label: "Location", type: "text", half: true },
      { k: "badge", label: "Small badge above the name", type: "text" },
      { k: "headline", label: "Headline", type: "textarea", rows: 2 },
      { k: "pitch", label: "Short pitch", type: "textarea", rows: 3 },
      { k: "email", label: "Public email", type: "email" },
      { k: "avatarUrl", label: "Hero photo", type: "image", help: "Portrait (4:5) works best." },
      { k: "avatarAlt", label: "Hero photo description (alt text)", type: "text" },
      { k: "aboutPhotoUrl", label: "About photo", type: "image" },
      { k: "aboutPhotoAlt", label: "About photo description", type: "text" },
      { k: "workPhotoUrl", label: "Work section photo", type: "image", help: "Wide photo shown above the timeline." },
      { k: "workPhotoAlt", label: "Work photo caption", type: "text" },
    ],
  },
  about: {
    key: "about",
    title: "About",
    intro: "A few short paragraphs in your own words, plus quick facts.",
    kind: "object",
    fields: [
      { k: "heading", label: "Heading", type: "text" },
      { k: "paragraphs", label: "Paragraphs", type: "paragraphs" },
      {
        k: "facts",
        label: "Quick facts",
        type: "list",
        item: [
          { k: "label", label: "Label", type: "text", half: true },
          { k: "value", label: "Value", type: "text", half: true },
        ],
        newItem: () => ({ label: "", value: "" }),
        titleOf: (x: { label: string; value: string }) => (x.label ? `${x.label}: ${x.value}` : ""),
        addLabel: "Add fact",
      },
    ],
  },
  experience: {
    key: "experience",
    title: "Work",
    intro: "Jobs and internships, newest first. Use the eye to hide an entry without deleting it.",
    kind: "list",
    addLabel: "Add job",
    titleOf: ((x: { role: string; company: string }) => `${x.role || "Role"} · ${x.company || "Company"}`) as never,
    newItem: () => ({ id: rid(), company: "", role: "", start: "", end: "Present", location: "", logo: "", summary: "", items: [], tech: [], published: false }),
    fields: [
      { k: "role", label: "Role", type: "text", half: true },
      { k: "company", label: "Company", type: "text", half: true },
      { k: "start", label: "Start", type: "text", half: true, placeholder: "Apr 2025" },
      { k: "end", label: "End", type: "text", half: true, placeholder: "Present" },
      { k: "location", label: "Location", type: "text" },
      { k: "logo", label: "Logo", type: "image" },
      { k: "summary", label: "One-line summary", type: "textarea", rows: 2 },
      {
        k: "items",
        label: "What I worked on",
        type: "list",
        item: [
          { k: "title", label: "Title", type: "text" },
          { k: "tech", label: "Tech", type: "tags" },
          { k: "points", label: "Bullet points", type: "lines" },
        ],
        newItem: () => ({ title: "", tech: [], points: [] }),
        titleOf: (x: { title: string }) => x.title,
        addLabel: "Add item",
      },
      { k: "tech", label: "Tech used (summary)", type: "tags" },
    ],
  },
  projects: {
    key: "projects",
    title: "Projects",
    intro: "Each project gets its own case-study page. Starred projects show as big cards on the home page.",
    kind: "list",
    addLabel: "Add project",
    titleOf: ((x: { title: string }) => x.title) as never,
    newItem: () => ({
      id: rid(), slug: "", title: "New project", tagline: "", context: "", period: "", cover: "", gallery: [], liveUrl: "", repoUrl: "",
      tech: [], problem: "", built: [], impact: [], featured: false, published: false,
    }),
    fields: [
      { k: "title", label: "Title", type: "text", half: true },
      { k: "slug", label: "URL slug", type: "text", half: true, help: "Leave empty to use the title." },
      { k: "tagline", label: "One-line description", type: "textarea", rows: 2 },
      { k: "context", label: "Context", type: "text", half: true, placeholder: "Company or Personal project" },
      { k: "period", label: "When", type: "text", half: true, placeholder: "2025" },
      { k: "featured", label: "Featured (big card on home page)", type: "toggle" },
      { k: "cover", label: "Cover image", type: "image", help: "Screenshot, 16:10 looks best. Leave empty for a text cover." },
      { k: "gallery", label: "More screenshots (URLs)", type: "lines", help: "One image URL per line. Upload with the cover field, then paste here." },
      { k: "liveUrl", label: "Live URL", type: "url", half: true },
      { k: "repoUrl", label: "Code URL", type: "url", half: true },
      { k: "tech", label: "Tech", type: "tags" },
      { k: "problem", label: "The problem", type: "textarea", rows: 3 },
      { k: "built", label: "What I built", type: "lines" },
      { k: "impact", label: "Result", type: "lines" },
    ],
  },
  skills: {
    key: "skills",
    title: "Skills",
    intro: "Group skills the way a recruiter scans them.",
    kind: "list",
    addLabel: "Add group",
    titleOf: ((x: { name: string }) => x.name) as never,
    newItem: () => ({ id: rid(), name: "New group", items: [], published: true }),
    fields: [
      { k: "name", label: "Group name", type: "text" },
      { k: "items", label: "Skills", type: "tags" },
    ],
  },
  education: {
    key: "education",
    title: "Education",
    intro: "Degrees and courses.",
    kind: "list",
    addLabel: "Add education",
    titleOf: ((x: { degree: string; school: string }) => `${x.school} · ${x.degree}`) as never,
    newItem: () => ({ id: rid(), school: "", degree: "", start: "", end: "", location: "", grade: "", logo: "", highlights: [], published: false }),
    fields: [
      { k: "degree", label: "Degree", type: "text" },
      { k: "school", label: "School", type: "text", half: true },
      { k: "location", label: "Location", type: "text", half: true },
      { k: "start", label: "Start", type: "text", half: true },
      { k: "end", label: "End", type: "text", half: true },
      { k: "grade", label: "Grade", type: "text" },
      { k: "logo", label: "Logo", type: "image" },
      { k: "highlights", label: "Highlights", type: "lines" },
    ],
  },
  events: {
    key: "events",
    title: "Events photos",
    intro: "Photo strip from conferences and events. Only show photos of other people if they're OK with it.",
    kind: "object",
    fields: [
      { k: "heading", label: "Heading", type: "text" },
      { k: "intro", label: "Intro", type: "textarea", rows: 2 },
      {
        k: "photos",
        label: "Photos",
        type: "list",
        item: [
          { k: "src", label: "Photo", type: "image" },
          { k: "caption", label: "Caption", type: "text" },
          { k: "alt", label: "Description for screen readers", type: "text" },
        ],
        newItem: () => ({ id: rid(), src: "", alt: "", caption: "", published: true }),
        titleOf: (x: { caption: string; alt: string }) => x.caption || x.alt,
        addLabel: "Add photo",
      },
    ],
  },
  beyond: {
    key: "beyond",
    title: "Films",
    intro: "Outside-work section: films and photography.",
    kind: "object",
    fields: [
      { k: "heading", label: "Heading", type: "text" },
      { k: "intro", label: "Intro", type: "textarea", rows: 3 },
      {
        k: "items",
        label: "Films",
        type: "list",
        item: [
          { k: "title", label: "Title", type: "text", half: true },
          { k: "subtitle", label: "Subtitle", type: "text", half: true },
          { k: "tags", label: "Tags", type: "tags" },
        ],
        newItem: () => ({ id: rid(), title: "", subtitle: "", tags: [], image: "", published: true }),
        titleOf: (x: { title: string }) => x.title,
        addLabel: "Add film",
      },
    ],
  },
  contact: {
    key: "contact",
    title: "Contact",
    intro: "The contact section and the message form. Messages arrive in the Messages inbox.",
    kind: "object",
    fields: [
      { k: "heading", label: "Heading", type: "text" },
      { k: "blurb", label: "Text", type: "textarea", rows: 3 },
      { k: "formEnabled", label: "Show the message form", type: "toggle" },
    ],
  },
  social: {
    key: "social",
    title: "Social links",
    intro: "Shown in the hero, contact section and footer.",
    kind: "list",
    addLabel: "Add link",
    titleOf: ((x: { label: string }) => x.label) as never,
    newItem: () => ({ id: rid(), label: "", url: "", icon: "website", published: true }),
    fields: [
      { k: "label", label: "Label", type: "text", half: true },
      {
        k: "icon",
        label: "Icon",
        type: "select",
        half: true,
        options: [
          { value: "github", label: "GitHub" },
          { value: "linkedin", label: "LinkedIn" },
          { value: "email", label: "Email" },
          { value: "website", label: "Website" },
          { value: "x", label: "X" },
          { value: "youtube", label: "YouTube" },
          { value: "instagram", label: "Instagram" },
        ],
      },
      { k: "url", label: "URL", type: "url", help: "For email use mailto:you@example.com" },
    ],
  },
  seo: {
    key: "seo",
    title: "SEO",
    intro: "How the site appears in Google and in link previews.",
    kind: "object",
    fields: [
      { k: "title", label: "Page title", type: "text" },
      { k: "description", label: "Description", type: "textarea", rows: 3, help: "About 150 characters." },
      { k: "keywords", label: "Keywords", type: "tags" },
      { k: "siteUrl", label: "Site URL", type: "url", help: "e.g. https://your-domain.com (used for sitemap and previews). Leave empty to detect." },
    ],
  },
  theme: {
    key: "theme",
    title: "Theme colour",
    intro: "Accent colours used for buttons, links and highlights.",
    kind: "object",
    fields: [
      { k: "accent", label: "Accent", type: "color", half: true, help: "Buttons and links. Keep it dark enough for white text." },
      { k: "accent2", label: "Second accent", type: "color", half: true, help: "Small highlights." },
      {
        k: "defaultMode",
        label: "Default mode for new visitors",
        type: "select",
        options: [
          { value: "light", label: "Light" },
          { value: "dark", label: "Dark" },
        ],
      },
    ],
  },
};
