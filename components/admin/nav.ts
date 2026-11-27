export const ADMIN_NAV: { group: string; items: { href: string; label: string }[] }[] = [
  {
    group: "Overview",
    items: [
      { href: "/admin", label: "Dashboard" },
      { href: "/admin/messages", label: "Messages" },
    ],
  },
  {
    group: "Content",
    items: [
      { href: "/admin/edit/hero", label: "Hero (code editor)" },
      { href: "/admin/edit/experience", label: "Journey (work)" },
      { href: "/admin/edit/education", label: "Education" },
      { href: "/admin/edit/skills", label: "Skills" },
      { href: "/admin/edit/skillCategories", label: "Skill filters" },
      { href: "/admin/edit/projects", label: "Projects" },
      { href: "/admin/edit/events", label: "Events photos" },
      { href: "/admin/edit/contact", label: "Contact" },
      { href: "/admin/edit/social", label: "Social links" },
      { href: "/admin/edit/profile", label: "Profile" },
    ],
  },
  {
    group: "Art side",
    items: [
      { href: "/admin/art", label: "Art gallery" },
      { href: "/admin/edit/art", label: "Art page & categories" },
    ],
  },
  {
    group: "Site",
    items: [
      { href: "/admin/edit/sections", label: "Sections & order" },
      { href: "/admin/edit/resume", label: "Resume PDF" },
      { href: "/admin/edit/seo", label: "SEO" },
      { href: "/admin/edit/theme", label: "Theme" },
    ],
  },
];
