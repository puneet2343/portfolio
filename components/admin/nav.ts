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
      { href: "/admin/edit/profile", label: "Hero & profile" },
      { href: "/admin/edit/about", label: "About" },
      { href: "/admin/edit/experience", label: "Work" },
      { href: "/admin/edit/projects", label: "Projects" },
      { href: "/admin/edit/skills", label: "Skills" },
      { href: "/admin/edit/education", label: "Education" },
      { href: "/admin/edit/events", label: "Events photos" },
      { href: "/admin/edit/beyond", label: "Films" },
      { href: "/admin/edit/contact", label: "Contact" },
      { href: "/admin/edit/social", label: "Social links" },
    ],
  },
  {
    group: "Site",
    items: [
      { href: "/admin/edit/sections", label: "Sections & order" },
      { href: "/admin/edit/resume", label: "Resume PDF" },
      { href: "/admin/edit/seo", label: "SEO" },
      { href: "/admin/edit/theme", label: "Theme colour" },
    ],
  },
];
