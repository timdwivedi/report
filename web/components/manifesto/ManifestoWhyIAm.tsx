"use client";

import { useRef } from "react";
import { Heart } from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";
import ScrollReveal from "@/components/shared/ScrollReveal";
import { AnimatedDivider } from "@/components/manifesto/ManifestoHero";

export default function ManifestoWhyIAm() {
    const sectionRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start end", "end start"],
    });
    const bgY = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);

    return (
        <section
            ref={sectionRef}
            className="relative py-28 overflow-hidden manifesto-section"
        >
            {/* Parallax background */}
            <motion.div
                className="absolute inset-0 -inset-y-[20%]"
                style={{
                    y: bgY,
                    background: `
                        radial-gradient(600px 500px at 25% 33%, rgba(139,92,246,0.08), transparent),
                        radial-gradient(400px 400px at 66% 75%, rgba(212,175,55,0.04), transparent),
                        radial-gradient(300px 300px at 75% 50%, rgba(0,212,255,0.03), transparent)
                    `,
                }}
            />

            {/* Top line */}
            <AnimatedDivider color="purple-500" />

            <div className="max-w-3xl mx-auto px-6 relative">
                <ScrollReveal direction="none" duration={0.6}>
                    <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-500/[0.10] border border-purple-500/25 rounded-full mb-10 backdrop-blur-md shadow-[0_0_30px_rgba(139,92,246,0.12)]">
                        <Heart size={14} className="text-purple-400 animate-pulse-subtle" />
                        <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-purple-400">
                            Why I Am The Way I Am
                        </span>
                    </div>
                </ScrollReveal>

                <ScrollReveal direction="up" delay={0.1} duration={0.7}>
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-10 leading-tight">
                        Because I Built This From{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                            Nothing
                        </span>
                    </h2>
                </ScrollReveal>

                <ScrollReveal direction="up" delay={0.15} duration={0.7}>
                    <p className="text-lg text-gray-400 leading-relaxed mb-6">
                        I didn&apos;t grow up with money. I didn&apos;t have a safety net. I built everything from scratch through discipline, intensity, and refusing to accept average.
                    </p>
                </ScrollReveal>

                <ScrollReveal direction="up" delay={0.2} duration={0.7}>
                    <p className="text-lg text-gray-400 leading-relaxed mb-6">
                        I spent years fuelled by suffering... using pain as proof that I was working hard enough, going deep enough, sacrificing enough. That worked for a while. It built the foundation. But I&apos;ve outgrown it.
                    </p>
                </ScrollReveal>

                <ScrollReveal direction="up" delay={0.25} duration={0.7}>
                    <p className="text-lg text-gray-300 leading-relaxed mb-8">
                        Now I operate from a different place. Not comfort. Not softness. <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 font-semibold">Aliveness.</span> The kind of energy that comes from building something so big it scares you and excites you at the same time.
                    </p>
                </ScrollReveal>

                <ScrollReveal direction="up" delay={0.3} duration={0.7}>
                    <p className="text-lg text-gray-400 leading-relaxed mb-10">
                        I&apos;m hard on people because I&apos;ve been harder on myself. I&apos;m impatient with mediocrity because I&apos;ve seen what happens when you accept it... nothing. I&apos;m direct because life is short and I refuse to waste any of it on games.
                    </p>
                </ScrollReveal>

                <ScrollReveal direction="up" delay={0.35} duration={0.6}>
                    <motion.blockquote
                        whileHover={{
                            boxShadow: "0 0 50px rgba(139,92,246,0.12), 0 10px 30px rgba(0,0,0,0.3)",
                            borderColor: "rgba(139,92,246,0.5)",
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="manifesto-quote-purple p-8 mb-10"
                    >
                        <p className="text-2xl md:text-3xl font-serif text-white italic leading-relaxed mb-4">
                            &ldquo;Pain is part of life. Suffering is an option.&rdquo;
                        </p>
                        <footer className="text-purple-400/80 font-mono text-sm uppercase tracking-widest">
                            — Tony Robbins
                        </footer>
                    </motion.blockquote>
                </ScrollReveal>

                <ScrollReveal direction="up" delay={0.4} duration={0.6}>
                    <p className="text-lg text-gray-400 leading-relaxed">
                        If you&apos;re reading this and thinking &ldquo;this guy is intense&rdquo;... you&apos;re right. That&apos;s the point. The mission requires intensity. A million operators don&apos;t get armed with AI by a team that&apos;s comfortable.
                    </p>
                </ScrollReveal>
            </div>

            <AnimatedDivider color="white" />
        </section>
    );
}
