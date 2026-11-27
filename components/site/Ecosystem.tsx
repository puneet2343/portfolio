"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, useMotionTemplate, useMotionValue } from "motion/react";
import { Code2, Database, Cloud, Layout, Terminal, Globe, Server, Zap, GitBranch, Monitor, Hash, Layers } from "lucide-react";
import Image from "next/image";
import type { SkillCard, SkillCategoryDef, SkillIcon } from "@/lib/types";

export type Company = { name: string; logo: string };

const ICONS: Record<SkillIcon, React.ComponentType<{ size?: number }>> = {
  globe: Globe,
  layout: Layout,
  code: Code2,
  zap: Zap,
  layers: Layers,
  server: Server,
  database: Database,
  terminal: Terminal,
  git: GitBranch,
  cloud: Cloud,
  monitor: Monitor,
  hash: Hash,
};

export default function Ecosystem({
  skills,
  categories,
  companies,
}: {
  skills: SkillCard[];
  categories: SkillCategoryDef[];
  companies: Record<string, Company>;
}) {
  const filters = categories.length ? categories : [{ id: "ALL", label: "Ecosystem", wide: false }];
  const [activeFilter, setActiveFilter] = useState<string>(filters[0].id);
  const wide = new Set(categories.filter((c) => c.wide).map((c) => c.id));

  const [showAll, setShowAll] = useState(false);
  const matching = skills.filter((skill) => activeFilter === "ALL" || skill.category === activeFilter);
  // The overview shows the core tools first; everything else is one tap away.
  const LIMIT = 12;
  const overview = () => {
    // Round-robin across categories so the overview covers every area, not just the first one.
    const groups = filters.filter((c) => c.id !== "ALL").map((c) => matching.filter((x) => x.category === c.id && x.year));
    const out: SkillCard[] = [];
    for (let i = 0; out.length < LIMIT && groups.some((g) => g[i]); i++) for (const g of groups) if (g[i] && out.length < LIMIT) out.push(g[i]);
    return out.length ? out : matching.slice(0, LIMIT);
  };
  const filteredSkills = activeFilter === "ALL" && !showAll ? overview() : matching;
  const hidden = matching.length - filteredSkills.length;

  return (
    <section id="ecosystem" aria-labelledby="ecosystem-title" className="relative bg-transparent text-foreground font-sans pt-10 pb-12 md:py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        <div className="flex flex-col xl:flex-row xl:items-end justify-between mb-8 md:mb-12 gap-5 md:gap-12">
          <div className="max-w-2xl">
            <h2 id="ecosystem-title" className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-foreground">
              Engineering <br className="hidden sm:block" /> <span className="text-foreground/50">Ecosystem.</span>
            </h2>
          </div>

          {/* iOS-style segmented control */}
          <div data-lenis-prevent className="w-full xl:w-auto overflow-x-auto pb-4 xl:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div role="tablist" aria-label="Filter skills" className="p-1 bg-foreground/5 border border-foreground/10 rounded-full backdrop-blur-2xl flex w-max xl:w-auto gap-1 shadow-2xl">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  role="tab"
                  aria-selected={activeFilter === filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`relative min-h-11 px-4 py-2 md:px-5 md:py-2.5 rounded-full text-xs md:text-sm font-medium transition-all duration-300 cursor-pointer whitespace-nowrap ${
                    activeFilter === filter.id ? "text-background" : "text-foreground/60 hover:text-foreground hover:bg-foreground/5"
                  }`}
                  style={{ WebkitTapHighlightColor: "transparent" }}
                >
                  {activeFilter === filter.id && (
                    <motion.div layoutId="pill" className="absolute inset-0 bg-foreground rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.2)]" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
                  )}
                  <span className="relative z-10">{filter.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <motion.div layout className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
          <AnimatePresence>
            {filteredSkills.map((skill) => (
              <motion.div
                layout
                key={skill.id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className={`flex w-full h-full ${wide.has(skill.category) && activeFilter === "ALL" ? "md:col-span-2" : "col-span-1"}`}
              >
                <BentoCard skill={skill} companies={companies} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        {activeFilter === "ALL" && (hidden > 0 || showAll) ? (
          <div className="mt-8 flex justify-center md:mt-10">
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              aria-expanded={showAll}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-foreground/10 bg-foreground/5 px-5 text-sm font-medium text-foreground/75 backdrop-blur-xl transition hover:bg-foreground/10 hover:text-foreground"
            >
              {showAll ? "Show fewer" : `Show all ${matching.length} skills`}
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}

const BentoCard = ({ skill, companies }: { skill: SkillCard; companies: Record<string, Company> }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const spot = useMotionTemplate`radial-gradient(650px circle at ${mouseX}px ${mouseY}px, rgba(255, 255, 255, 0.08), transparent 80%)`;
  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }
  const Icon = ICONS[skill.icon] ?? Code2;
  const cos = skill.companies.map((k) => companies[k]).filter(Boolean);
  const since = Number.parseInt(skill.year, 10);
  const years = Number.isFinite(since) ? Math.max(1, new Date().getFullYear() - since) : 0;

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      className="group relative w-full h-full bg-[var(--glass-strong)] border border-[var(--line)] rounded-2xl md:rounded-3xl overflow-hidden shadow-[var(--glass-shadow)] hover:border-foreground/20 hover:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.25)] transition-[border-color,box-shadow] duration-500 cursor-pointer flex flex-col"
    >
      <motion.div className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100 z-10 hidden md:block" style={{ background: spot }} />

      <div className="relative z-20 h-full p-4 md:p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-3">
          <div className="shrink-0 p-2 md:p-2.5 rounded-xl bg-foreground/[0.04] border border-foreground/5 text-foreground group-hover:scale-110 transition-transform duration-300">
            <Icon size={20} />
          </div>
          <span className="hidden sm:inline-block ml-auto px-2.5 py-1 rounded-full bg-foreground/5 text-[10px] md:text-[11px] font-medium text-foreground/60 uppercase tracking-wide">
            {skill.tag}
          </span>
        </div>

        <h3 className="text-[15px] md:text-xl font-semibold leading-snug text-foreground mb-1 group-hover:text-[var(--accent)] transition-colors">{skill.name}</h3>
        <p className="text-xs md:text-sm leading-relaxed text-foreground/60 line-clamp-2 md:line-clamp-3 flex-1">{skill.description}</p>

        <div className="mt-3 pt-3 border-t border-foreground/5 flex items-center gap-2 min-h-7">
          {cos.length > 0 && (
            <div className="flex -space-x-2">
              {cos.map((c, i) => (
                <div key={i} className="w-6 h-6 rounded-full border border-background bg-foreground/10 overflow-hidden relative" title={c.name}>
                  <Image src={c.logo} alt={c.name} fill sizes="24px" className="object-cover" />
                </div>
              ))}
            </div>
          )}
          <span className="text-[11px] md:text-xs text-foreground/55">{skill.year ? `Since ${skill.year}` : "Working knowledge"}</span>
          {years > 0 && <span className="ml-auto text-[11px] md:text-xs font-medium text-[var(--vs-ok)]">{years}+ {years === 1 ? "yr" : "yrs"}</span>}
        </div>
      </div>
    </motion.div>
  );
};
