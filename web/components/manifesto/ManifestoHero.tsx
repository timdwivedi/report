"use client";

import { useRef } from "react";
import { Flame, ChevronDown } from "lucide-react";
import { motion, useInView, useScroll, useTransform } from "motion/react";
import ScrollReveal from "@/components/shared/ScrollReveal";

const headlineWords = ["Read", "This", "Before", "You"];
const goldWords = ["Work", "With", "Me"];

export function AnimatedDivider({ color = "primary-gold" }: { color?: string }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-20px" });
    const colorMap: Record<string, string> = {
        "primary-gold": "rgba(212,175,55,0.4)",
        "primary-cyan": "rgba(0,212,255,0.3)",
        "purple-500": "rgba(139,92,246,0.3)",
        "white": "rgba(255,255,255,0.06)",
    };
    const via = colorMap[color] || colorMap["white"];

    return (
        <motion.div
            ref={ref}
            className="absolute bottom-0 left-0 right-0 h-px"
            style={{
                background: `linear-gradient(to right, transparent, ${via}, transparent)`,
            }}
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
            transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
    );
}

export default function ManifestoHero() {
    const sectionRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start start", "end start"],
    });
    const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

    return (
        <section
            ref={sectionRef}
            className="relative py-32 md:py-44 overflow-hidden"
        >
            {/* Parallax background */}
            <motion.div
                className="absolute inset-0 -inset-y-[30%]"
                style={{
                    y: bgY,
                    background: `
                        radial-gradient(800px 500px at 33% 0%, rgba(212,175,55,0.12), transparent),
                        radial-gradient(700px 400px at 75% 100%, rgba(0,212,255,0.08), transparent),
                        radial-gradient(600px 600px at 50% 50%, rgba(139,92,246,0.06), transparent),
                        radial-gradient(300px 300px at 66% 25%, rgba(212,175,55,0.15), transparent)
                    `,
                }}
            />

            <div className="max-w-4xl mx-auto px-6 text-center relative">
                <ScrollReveal direction="none" duration={0.6}>
                    <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-gold/[0.10] border border-primary-gold/25 rounded-full mb-10 backdrop-blur-md shadow-[0_0_30px_rgba(212,175,55,0.12)]">
                        <Flame size={14} className="text-primary-gold animate-pulse-subtle" />
                        <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-primary-gold">
                            The Manifesto
                        </span>
                    </div>
                </ScrollReveal>

                {/* Word-by-word stagger headline */}
                <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-8 leading-[0.95]">
                    <span className="block drop-shadow-2xl">
                        {headlineWords.map((word, i) => (
                            <motion.span
                                key={word}
                                className="inline-block mr-[0.25em] text-gradient-headline"
                                initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
                                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                                transition={{
                                    duration: 0.5,
                                    delay: 0.3 + i * 0.12,
                                    ease: "easeOut",
                                }}
                            >
                                {word}
                            </motion.span>
                        ))}
                    </span>
                    <span className="block mt-2">
                        {goldWords.map((word, i) => (
                            <motion.span
                                key={word}
                                className="inline-block mr-[0.25em] text-transparent bg-clip-text bg-gradient-to-r from-primary-gold via-amber-300 to-primary-gold animate-shimmer bg-[length:200%_auto]"
                                initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
                                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                                transition={{
                                    duration: 0.5,
                                    delay: 0.3 + (headlineWords.length + i) * 0.12,
                                    ease: "easeOut",
                                }}
                            >
                                {word}
                            </motion.span>
                        ))}
                    </span>
                </h1>

                <ScrollReveal direction="up" delay={0.2} duration={0.7}>
                    <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-4 leading-relaxed">
                        This is not a suggestion. This is mandatory reading for every person on this team.
                    </p>
                    <p className="text-base text-gray-500/80 max-w-xl mx-auto mb-16">
                        If anything here makes you uncomfortable, that&apos;s fine... but you need to know it upfront so there are no surprises.
                    </p>
                </ScrollReveal>

                <ScrollReveal direction="up" delay={0.3} duration={0.6}>
                    <blockquote className="manifesto-quote p-10 max-w-3xl mx-auto mb-16">
                        <p className="text-2xl sm:text-3xl font-serif font-medium text-transparent bg-clip-text bg-gradient-to-r from-primary-gold via-amber-300 to-primary-gold leading-relaxed italic">
                            &ldquo;Give me an army of a million and I can conquer the fucking planet... especially when each one is armed with AI and trained to use it.&rdquo;
                        </p>
                    </blockquote>
                </ScrollReveal>

                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                    <ChevronDown size={32} className="mx-auto text-primary-gold/40" />
                </motion.div>
            </div>

            <AnimatedDivider color="primary-gold" />
        </section>
    );
}
