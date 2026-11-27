"use client";

import { motion, AnimatePresence, type Transition } from "motion/react";
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Layers, Globe, ArrowUpRight, Play } from "lucide-react";
import Link from "next/link";
import { useState, type MouseEvent } from "react";
import { SocialGlyph } from "./bits";
import { DemoModal, type Demo } from "./DemoPlayer";

export interface ProjectCardData {
  slug: string;
  title: string;
  tagline: string;
  context: string;
  images: string[];
  imageAlt: string;
  url: string;
  github: string;
  problem: string;
  built: string[];
  impact: string[];
  technologies: string[];
  demo?: Demo;
}

const springTransition: Transition = { type: "spring", stiffness: 220, damping: 24, mass: 1.1 };

function ProjectCard({ project, isExpanded, onToggle }: { project: ProjectCardData; isExpanded: boolean; onToggle: () => void }) {
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [demoOpen, setDemoOpen] = useState(false);
  const demo = project.demo;
  const images = project.images.length ? project.images : demo?.poster ? [demo.poster] : [];
  const hasMultipleImages = images.length > 1;

  const nextImage = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };
  const prevImage = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <motion.div
      layout
      transition={springTransition}
      onClick={onToggle}
      role="button"
      tabIndex={0}
      aria-expanded={isExpanded}
      aria-label={`${project.title}: ${isExpanded ? "collapse" : "explore"} project`}
      onKeyDown={(e) => {
        if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onToggle();
        }
      }}
      className={`group cursor-pointer flex flex-col relative overflow-hidden rounded-2xl bg-transparent backdrop-blur-none border-0 z-0 ${
        isExpanded ? "h-auto shadow-[0_0_80px_-20px_rgba(255,255,255,0.05)]" : "h-[400px] sm:h-[480px] hover:shadow-[0_12px_40px_rgba(0,0,0,0.6)]"
      }`}
    >
      <div className="absolute inset-0 rounded-2xl border border-foreground/20 pointer-events-none z-30"></div>
      <div className="absolute inset-[1px] rounded-[calc(1rem-1.5px)] border border-foreground/5 pointer-events-none z-30"></div>
      <div
        className="absolute inset-0 bg-foreground/[0.02] rounded-2xl pointer-events-none z-0"
        style={{ maskImage: "linear-gradient(to bottom, black 60%, transparent 100%)", WebkitMaskImage: "linear-gradient(to bottom, black 60%, transparent 100%)" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-blue-500/[0.03] via-transparent to-transparent pointer-events-none z-0"></div>
      <div
        className="absolute inset-0 backdrop-blur-xl pointer-events-none z-0"
        style={{
          maskImage: "linear-gradient(to bottom, black 10%, rgba(0,0,0,0.5) 40%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 10%, rgba(0,0,0,0.5) 40%, transparent 100%)",
        }}
      />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/50 to-transparent opacity-70 group-hover:opacity-100 transition-opacity z-40"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-foreground/[0.05] via-transparent to-transparent pointer-events-none z-30"></div>

      {/* Image */}
      <motion.div
        layout
        transition={springTransition}
        className={`relative overflow-hidden z-10 ${isExpanded ? "h-[250px] sm:h-[400px] lg:h-[500px]" : "h-[200px] sm:h-[240px]"}`}
        style={{ maskImage: "linear-gradient(to bottom, black 90%, transparent 100%)", WebkitMaskImage: "linear-gradient(to bottom, black 90%, transparent 100%)" }}
      >
        {images.length > 0 && (
          <AnimatePresence mode="wait">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <motion.img
              layout
              transition={springTransition}
              key={currentImageIndex}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              src={images[isExpanded ? currentImageIndex : 0]}
              alt={project.imageAlt}
              loading="lazy"
              decoding="async"
              className={`w-full h-full object-cover object-top ${!isExpanded ? "transition-transform duration-700 group-hover:scale-110" : ""}`}
            />
          </AnimatePresence>
        )}

        {!images.length && (
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-blue-500/10 flex flex-col items-center justify-center gap-3 px-6 text-center">
            <Layers className="text-foreground/10 w-12 h-12 sm:w-16 sm:h-16" />
            {!isExpanded && <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-foreground/30">{project.context}</span>}
          </div>
        )}

        {hasMultipleImages && isExpanded && (
          <>
            <div className="absolute inset-y-0 left-0 flex items-center pl-2 sm:pl-4 z-40">
              <button
                onClick={prevImage}
                aria-label="Previous screenshot"
                className="p-3 rounded-full bg-background/40 backdrop-blur-md border border-foreground/10 text-foreground opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity hover:bg-foreground/20 hover:text-background"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:pr-4 z-40">
              <button
                onClick={nextImage}
                aria-label="Next screenshot"
                className="p-3 rounded-full bg-background/40 backdrop-blur-md border border-foreground/10 text-foreground opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity hover:bg-foreground/20 hover:text-background"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-40">
              {images.map((_, i) => (
                <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === currentImageIndex ? "w-4 bg-foreground shadow-[0_0_8px_rgba(255,255,255,0.8)]" : "w-1.5 bg-foreground/40"}`} />
              ))}
            </div>
          </>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-50" />

        {demo ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setDemoOpen(true);
            }}
            aria-label={`Play the ${project.title} product demo`}
            className="group/demo absolute inset-0 z-[15] flex items-center justify-center"
          >
            <span className="force-dark relative flex h-14 w-14 items-center justify-center rounded-full border border-white/25 bg-black/30 text-white shadow-[0_8px_30px_rgba(0,0,0,0.45)] backdrop-blur-xl transition-transform duration-300 group-hover/demo:scale-110 sm:h-16 sm:w-16">
              <span aria-hidden className="absolute inset-0 animate-ping rounded-full border border-white/20 [animation-duration:2.4s]" />
              <Play className="h-5 w-5 translate-x-0.5 fill-current sm:h-6 sm:w-6" />
            </span>
            <span className="force-dark absolute bottom-3 left-4 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/40 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-white/90 backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Product demo
            </span>
          </button>
        ) : null}

        <div className="absolute top-4 right-4 flex gap-2 z-20">
          <AnimatePresence>
            {!isExpanded && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex gap-2">
                {project.github && (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`${project.title} source code`}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-background/40 backdrop-blur-xl border border-foreground/10 hover:bg-foreground/20 hover:scale-110 transition-all text-foreground"
                  >
                    <SocialGlyph icon="github" className="w-4 h-4" />
                  </a>
                )}
                {project.url && (
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`Open ${project.title} live site`}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-background/40 backdrop-blur-xl border border-foreground/10 hover:bg-foreground/20 hover:scale-110 transition-all text-foreground"
                  >
                    <Globe className="w-4 h-4" />
                  </a>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          {isExpanded && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggle();
              }}
              aria-label="Collapse project"
              className="hidden lg:flex p-2.5 rounded-full bg-foreground/10 backdrop-blur-md text-foreground hover:bg-foreground/20 transition-all border border-foreground/20 shadow-lg"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          )}
        </div>

        {isExpanded && (
          <div className="absolute bottom-6 sm:bottom-8 left-6 right-6 sm:right-8 z-10">
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }} className="space-y-1.5 sm:space-y-2">
              <span className="text-foreground/80 text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.2em] bg-foreground/5 px-2.5 py-1 rounded-full border border-foreground/10 backdrop-blur-md inline-block mb-1 sm:mb-0">
                Project Deep Dive
              </span>
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground title-font drop-shadow-2xl tracking-tight leading-none">{project.title}</h3>
            </motion.div>
          </div>
        )}
      </motion.div>

      {/* Content */}
      <motion.div layout transition={springTransition} className={`px-5 pb-6 pt-1 sm:px-8 sm:pb-8 sm:pt-2 flex-1 flex flex-col relative z-20 ${isExpanded ? "bg-foreground/[0.01]" : ""}`}>
        {!isExpanded && (
          <div className="mb-3 mt-2 sm:mt-0">
            <h3 className="text-lg sm:text-xl font-bold title-font text-foreground/90 group-hover:text-foreground transition-colors mb-1.5 sm:mb-2 tracking-tight">{project.title}</h3>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {project.technologies.slice(0, 3).map((tech, i) => (
                <span key={i} className="text-[9px] sm:text-[10px] uppercase tracking-wider font-bold text-purple-300/80 group-hover:text-purple-300 transition-colors">
                  {tech}
                  {i < Math.min(3, project.technologies.length) - 1 ? " •" : ""}
                </span>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {isExpanded ? (
            <motion.div
              key="expanded"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.2, duration: 0.4 } }}
              exit={{ opacity: 0, y: -10, transition: { duration: 0.1 } }}
              className="w-full space-y-8 mt-4 sm:mt-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
                <div className="lg:col-span-3 space-y-6">
                  {project.problem && <p className="text-sm sm:text-base leading-relaxed text-foreground/70 font-light">{project.problem}</p>}
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="h-px w-6 sm:w-8 bg-purple-500/50"></div>
                    <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-purple-300 shrink-0">Core Initiatives</span>
                    <div className="h-px flex-1 bg-gradient-to-r from-purple-500/20 to-transparent"></div>
                  </div>
                  <div className="space-y-4 sm:space-y-5">
                    {project.built.map((point, i) => (
                      <div key={i} className="flex gap-3 sm:gap-4 group/item">
                        <div className="mt-2 h-1.5 w-1.5 rounded-full bg-foreground/30 group-hover/item:bg-foreground/60 transition-colors shrink-0" />
                        <p className="text-sm sm:text-base leading-relaxed text-foreground/80 font-light">{point}</p>
                      </div>
                    ))}
                  </div>
                  {project.impact.length > 0 && (
                    <>
                      <div className="flex items-center gap-3 sm:gap-4 pt-2">
                        <div className="h-px w-6 sm:w-8 bg-emerald-500/50"></div>
                        <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-500 shrink-0">Impact</span>
                        <div className="h-px flex-1 bg-gradient-to-r from-emerald-500/20 to-transparent"></div>
                      </div>
                      <div className="space-y-4 sm:space-y-5">
                        {project.impact.map((point, i) => (
                          <div key={i} className="flex gap-3 sm:gap-4">
                            <div className="mt-2 h-1.5 w-1.5 rounded-full bg-emerald-500/60 shrink-0" />
                            <p className="text-sm sm:text-base leading-relaxed text-foreground/80 font-light">{point}</p>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <div className="lg:col-span-2 space-y-6">
                  <div className="p-5 sm:p-6 rounded-2xl bg-foreground/[0.02] border border-foreground/5 space-y-6">
                    <div>
                      <h4 className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-foreground/50 mb-4">Technical Snapshot</h4>
                      <div className="flex flex-wrap gap-2">
                        {project.technologies.map((tech, i) => (
                          <span key={i} className="text-[9px] sm:text-[10px] font-bold text-foreground/80 bg-foreground/5 px-2.5 sm:px-3 py-1.5 rounded-lg border border-foreground/10 hover:bg-foreground/10 transition-colors cursor-default">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-6 sm:pt-8 border-t border-foreground/5 flex flex-col gap-3 sm:gap-4">
                      {project.github && (
                        <a
                          href={project.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="group/btn flex items-center justify-between px-5 sm:px-6 py-3.5 sm:py-4 rounded-xl bg-foreground/5 hover:bg-foreground/10 transition-all border border-foreground/10"
                        >
                          <div className="flex items-center gap-3">
                            <SocialGlyph icon="github" className="w-5 h-5 sm:w-6 sm:h-6 text-foreground/70 group-hover/btn:text-foreground transition-colors" />
                            <span className="text-xs sm:text-sm font-semibold text-foreground/70 group-hover/btn:text-foreground transition-colors">Source Code</span>
                          </div>
                          <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-foreground/50 group-hover/btn:text-foreground/80 transition-colors">GitHub</div>
                        </a>
                      )}

                      {project.url && (
                        <a
                          href={project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="group/btn flex items-center justify-between px-5 sm:px-6 py-3.5 sm:py-4 rounded-xl bg-indigo-500/5 hover:bg-indigo-500/15 transition-all border border-indigo-500/20"
                        >
                          <div className="flex items-center gap-3">
                            <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400/70 group-hover/btn:text-indigo-400 transition-colors" />
                            <span className="text-xs sm:text-sm font-semibold text-indigo-300/70 group-hover/btn:text-indigo-300 transition-colors">Visit website</span>
                          </div>
                          <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-indigo-500/50 group-hover/btn:text-indigo-400/50 transition-colors">Live</div>
                        </a>
                      )}

                      <Link
                        href={`/projects/${project.slug}`}
                        onClick={(e) => e.stopPropagation()}
                        className="group/btn flex items-center justify-between px-5 sm:px-6 py-3.5 sm:py-4 rounded-xl bg-foreground/5 hover:bg-foreground/10 transition-all border border-foreground/10"
                      >
                        <span className="text-xs sm:text-sm font-semibold text-foreground/70 group-hover/btn:text-foreground transition-colors">Full case study</span>
                        <ArrowUpRight className="w-4 h-4 text-foreground/50 group-hover/btn:text-foreground transition-colors" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle();
                }}
                className="mt-6 sm:mt-8 pt-4 min-h-11 border-t border-foreground/5 flex items-center justify-between cursor-pointer group/close"
              >
                <span className="text-[9px] sm:text-[10px] font-bold text-foreground/50 uppercase tracking-widest group-hover/close:text-foreground transition-colors">Collapse Project</span>
                <div className="p-2 rounded-full bg-foreground/5 group-hover/close:bg-foreground/10 transition-colors">
                  <ChevronUp className="text-foreground/60 group-hover/close:text-foreground group-hover/close:-translate-y-0.5 transition-all w-3 h-3 sm:w-4 sm:h-4" />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.15 } }}
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
              className="space-y-4 flex-1 flex flex-col justify-between"
            >
              <p className="line-clamp-3 text-xs sm:text-sm text-foreground/60 font-light leading-relaxed">{[project.tagline, project.problem].filter(Boolean).join(" ")}</p>
              <div className="pt-4 border-t border-foreground/5 flex items-center justify-between pointer-events-none mt-auto">
                <span className="text-[8px] sm:text-[9px] font-bold text-foreground/50 uppercase tracking-[0.2em] group-hover:text-foreground transition-colors">Explore Project</span>
                <ChevronDown className="text-foreground/40 group-hover:text-foreground group-hover:translate-y-0.5 transition-all w-3 h-3 sm:w-4 sm:h-4" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      <AnimatePresence>{demo && demoOpen ? <DemoModal demo={demo} title={project.title} onClose={() => setDemoOpen(false)} /> : null}</AnimatePresence>
    </motion.div>
  );
}

export default function Projects({ projects }: { projects: ProjectCardData[] }) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggleExpand = (id: number) => {
    const isExpanding = expandedId !== id;
    setExpandedId(isExpanding ? id : null);
    if (isExpanding) {
      setTimeout(() => {
        const el = document.getElementById(`project-${id}`);
        if (!el) return;
        if (window.__lenis) window.__lenis.scrollTo(el, { offset: -90 });
        else el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    }
  };

  return (
    <section id="projects" aria-labelledby="projects-title" className="pb-16 sm:pb-24 lg:pb-32 border-b border-foreground/10 scroll-mt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex flex-col xl:flex-row xl:items-end justify-between mb-10 sm:mb-12 md:mb-16 gap-6 sm:gap-8 md:gap-12 mt-12 sm:mt-16 lg:mt-24">
          <div className="max-w-2xl">
            <h2 id="projects-title" className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-foreground">
              My <br className="hidden sm:block" /> <span className="text-foreground/50">Projects.</span>
            </h2>
          </div>
        </div>

        <motion.div layout transition={springTransition} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 auto-rows-min">
          {projects.map((project, index) => {
            const isExpanded = expandedId === index;
            return (
              <motion.div
                layout
                transition={springTransition}
                id={`project-${index}`}
                key={project.slug}
                className={isExpanded ? "col-span-1 md:col-span-2 lg:col-span-2 z-10" : "col-span-1 z-0"}
              >
                <ProjectCard project={project} isExpanded={isExpanded} onToggle={() => toggleExpand(index)} />
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
