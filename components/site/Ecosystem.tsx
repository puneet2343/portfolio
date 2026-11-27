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

  const filteredSkills = skills.filter((skill) => activeFilter === "ALL" || skill.category === activeFilter);

  return (
    <section id="ecosystem" aria-labelledby="ecosystem-title" className="relative min-h-screen bg-transparent text-foreground font-sans py-12 md:py-24 lg:py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        <div className="flex flex-col xl:flex-row xl:items-end justify-between mb-12 md:mb-16 gap-6 md:gap-12">
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

        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <AnimatePresence>
            {filteredSkills.map((skill) => (
              <motion.div
                layout
                key={skill.id}
                initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className={`flex w-full h-full ${wide.has(skill.category) && activeFilter === "ALL" ? "md:col-span-2" : "col-span-1"}`}
              >
                <BentoCard skill={skill} companies={companies} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
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
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="group relative w-full h-full bg-background/40 border border-white/10 rounded-3xl overflow-hidden hover:border-white/20 transition-colors duration-500 cursor-pointer flex flex-col"
    >
      <motion.div className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100 z-10 hidden md:block" style={{ background: spot }} />

      <div className="relative z-20 h-full p-5 md:p-6 flex flex-col justify-between">
        <div className="flex justify-between items-start mb-6 md:mb-8">
          <div className="p-2.5 md:p-3 bg-background/80 rounded-2xl border border-foreground/5 text-foreground shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
            <Icon size={24} />
          </div>
          <span className="px-2.5 py-1 md:px-3 rounded-full bg-foreground/5 border border-foreground/5 text-[10px] font-medium text-foreground/60 uppercase tracking-wide group-hover:bg-foreground/10 transition-colors">
            {skill.tag}
          </span>
        </div>

        <div className="flex-1">
          <h3 className="text-lg md:text-xl font-semibold text-foreground mb-1 group-hover:text-emerald-400 transition-colors">{skill.name}</h3>
          <p className="text-xs md:text-sm text-foreground/50 line-clamp-2 mb-4 group-hover:text-foreground/70 transition-colors">{skill.description}</p>

          {cos.length > 0 && (
            <div className="flex items-center mb-4">
              <div className="flex -space-x-2">
                {cos.map((c, i) => (
                  <div
                    key={i}
                    className="w-6 h-6 md:w-7 md:h-7 rounded-full border border-background bg-foreground/10 overflow-hidden relative z-0 hover:z-10 transition-all hover:scale-125 cursor-pointer"
                    title={c.name}
                  >
                    <Image src={c.logo} alt={c.name} fill sizes="28px" className="object-cover opacity-80 hover:opacity-100" />
                  </div>
                ))}
              </div>
              <span className="ml-3 text-[10px] text-foreground/50 font-medium">{skill.year}</span>
            </div>
          )}
        </div>

        {/* Experience line (years, no percentages) */}
        <div className="mt-auto pt-4 border-t border-foreground/5">
          <div className="flex justify-between items-end">
            <span className="text-[10px] text-foreground/50 font-mono">IN USE SINCE {skill.year}</span>
            {years > 0 && (
              <span className="text-xs font-mono text-emerald-500">
                {years}+ {years === 1 ? "yr" : "yrs"}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
