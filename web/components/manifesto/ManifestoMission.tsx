"use client";

import { useRef } from "react";
import { Target, Crosshair, Radio, Brain, Rocket, Users } from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";
import ScrollReveal from "@/components/shared/ScrollReveal";
import AnimatedCounter from "@/components/shared/AnimatedCounter";
import { StaggerContainer, StaggerItem } from "@/components/shared/StaggerChildren";
import { AnimatedDivider } from "@/components/manifesto/ManifestoHero";

const ecosystem = [
    { icon: Crosshair, label: "The Weapon", product: "Invisible Pipeline", desc: "Scan LinkedIn, connect, monetize any lead" },
    { icon: Radio, label: "Distribution Engine", product: "Extension + Affiliates", desc: "Each person recruits the next" },
    { icon: Brain, label: "Training Ground", product: "Identity Reframing", desc: "Rewire how they see themselves" },
    { icon: Rocket, label: "Build Engine", product: "Bloom", desc: "Level up and build their own system" },
    { icon: Users, label: "The Proof", product: "Setters", desc: "First soldiers. Proof it works." },
];

export default function ManifestoMission() {
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
                        radial-gradient(600px 500px at 25% 25%, rgba(212,175,55,0.10), transparent),
                        radial-gradient(500px 400px at 66% 66%, rgba(139,92,246,0.06), transparent),
                        radial-gradient(350px 350px at 75% 50%, rgba(0,212,255,0.05), transparent)
                    `,
                }}
            />

            {/* Top line */}
            <AnimatedDivider color="primary-gold" />

            <div className="max-w-7xl mx-auto px-6 relative">
                <ScrollReveal direction="none" duration={0.6}>
                    <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-gold/[0.10] border border-primary-gold/25 rounded-full mb-10 backdrop-blur-md shadow-[0_0_30px_rgba(212,175,55,0.12)]">
                        <Target size={14} className="text-primary-gold animate-pulse-subtle" />
                        <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-primary-gold">
                            What We&apos;re Building
                        </span>
                    </div>
                </ScrollReveal>

                <ScrollReveal direction="up" delay={0.1} duration={0.7}>
                    <h2 className="text-4xl sm:text-5xl md:text-7xl font-bold text-gradient-headline text-glow-gold mb-8 leading-tight">
                        <AnimatedCounter value={1000000} duration={2.5} className="tabular-nums" /> People.{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-gold via-amber-400 to-primary-gold animate-shimmer bg-[length:200%_auto]">
                            Financially Free.
                        </span>
                    </h2>
                </ScrollReveal>

                <ScrollReveal direction="up" delay={0.15} duration={0.7}>
                    <p className="text-lg text-gray-400 leading-relaxed mb-6 max-w-3xl">
                        We are building a system that takes a million people from zero to financially free. Not followers. Not subscribers. People who found their first client, closed their first deal, built their first business, and learned to use AI as a weapon.
                    </p>
                    <p className="text-lg text-gray-400 leading-relaxed mb-6 max-w-3xl">
                        That&apos;s the mission. Everything we do serves that.
                    </p>
                    <p className="text-lg text-gray-300 leading-relaxed mb-14 max-w-3xl">
                        Invisible Pipeline is the tool. Bloom is the build engine. The extension is the distribution machine. The content is the magnet. The team... <span className="text-white font-medium">you</span>... are the backbone that makes all of it work.
                    </p>
                </ScrollReveal>

                {/* Ecosystem Cards — spring-physics hover */}
                <StaggerContainer stagger={0.08} className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {ecosystem.map((item) => (
                        <StaggerItem key={item.label} direction="up">
                            <motion.div
                                whileHover={{
                                    y: -6,
                                    boxShadow: "0 10px 40px rgba(212,175,55,0.15), 0 0 60px rgba(212,175,55,0.1)",
                                    borderColor: "rgba(212,175,55,0.4)",
                                }}
                                whileTap={{ scale: 0.97 }}
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                className="h-full p-6 manifesto-card flex flex-col items-center text-center"
                            >
                                <motion.div
                                    whileHover={{ scale: 1.15, backgroundColor: "rgba(212,175,55,0.12)" }}
                                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                                    className="w-14 h-14 rounded-full bg-primary-gold/5 border border-primary-gold/10 flex items-center justify-center mb-5 shadow-[0_0_20px_rgba(212,175,55,0.05)]"
                                >
                                    <item.icon size={24} className="text-primary-gold/80" />
                                </motion.div>
                                <h3 className="text-white font-bold text-lg mb-1">{item.label}</h3>
                                <p className="text-primary-gold/80 text-xs font-mono uppercase tracking-wider mb-3">{item.product}</p>
                                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                            </motion.div>
                        </StaggerItem>
                    ))}
                </StaggerContainer>

                <ScrollReveal direction="up" delay={0.6} duration={0.5}>
                    <p className="text-base text-gray-500 mt-10 max-w-2xl">
                        If you don&apos;t understand the mission, ask. If you understand the mission but don&apos;t feel it, that&apos;s a problem. Because we&apos;re not here to clock in and clock out. We&apos;re here to build something that changes lives at scale.
                    </p>
                </ScrollReveal>
            </div>

            <AnimatedDivider color="white" />
        </section>
    );
}
