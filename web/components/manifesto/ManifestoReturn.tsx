"use client";

import { useRef } from "react";
import { Gift, GraduationCap, Crown, Rocket, HeartHandshake } from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";
import ScrollReveal from "@/components/shared/ScrollReveal";
import { StaggerContainer, StaggerItem } from "@/components/shared/StaggerChildren";
import { AnimatedDivider } from "@/components/manifesto/ManifestoHero";

const benefits = [
    {
        icon: GraduationCap,
        title: "Learn at the edge",
        desc: "I build at the cutting edge of AI, SaaS, and sales systems. You'll be in rooms and conversations most people never see.",
    },
    {
        icon: Crown,
        title: "Real responsibility",
        desc: "Not busywork. Not tasks someone else didn't want. Real ownership of things that matter.",
    },
    {
        icon: Rocket,
        title: "Accelerated growth",
        desc: "Not in a corporate-ladder way. In a \"I became a completely different person\" way.",
    },
    {
        icon: HeartHandshake,
        title: "Actual impact",
        desc: "Not a marketing slogan. A system that takes people from nothing to financially free. And you helped build it.",
    },
];

export default function ManifestoReturn() {
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
                        radial-gradient(600px 500px at 25% 25%, rgba(212,175,55,0.12), transparent),
                        radial-gradient(500px 400px at 66% 75%, rgba(0,212,255,0.07), transparent),
                        radial-gradient(400px 400px at 50% 50%, rgba(139,92,246,0.05), transparent),
                        #0f0f1a
                    `,
                }}
            />

            {/* Top line */}
            <AnimatedDivider color="primary-gold" />

            <div className="max-w-4xl mx-auto px-6 relative">
                <ScrollReveal direction="none" duration={0.6}>
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-gold/[0.10] border border-primary-gold/25 rounded-full mb-10 backdrop-blur-md shadow-[0_0_30px_rgba(212,175,55,0.12)]">
                            <Gift size={14} className="text-primary-gold animate-pulse-subtle" />
                            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-primary-gold">
                                What You Get In Return
                            </span>
                        </div>

                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gradient-headline text-glow-gold mb-5 leading-tight">
                            Match the Energy.{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-gold via-amber-400 to-primary-gold animate-shimmer bg-[length:200%_auto]">
                                Reap the Rewards.
                            </span>
                        </h2>
                    </div>
                </ScrollReveal>

                {/* Benefit cards — spring-physics hover */}
                <StaggerContainer stagger={0.08} className="grid sm:grid-cols-2 gap-5 mb-16">
                    {benefits.map((benefit) => (
                        <StaggerItem key={benefit.title} direction="up">
                            <motion.div
                                whileHover={{
                                    y: -6,
                                    boxShadow: "0 10px 40px rgba(212,175,55,0.15), 0 0 60px rgba(212,175,55,0.1)",
                                    borderColor: "rgba(212,175,55,0.4)",
                                }}
                                whileTap={{ scale: 0.98 }}
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                className="manifesto-card p-7 h-full"
                            >
                                <motion.div
                                    whileHover={{ scale: 1.12, backgroundColor: "rgba(212,175,55,0.15)" }}
                                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                                    className="w-11 h-11 rounded-xl bg-primary-gold/[0.12] border border-primary-gold/25 flex items-center justify-center mb-5 shadow-[0_0_20px_rgba(212,175,55,0.15)]"
                                >
                                    <benefit.icon size={18} className="text-primary-gold" />
                                </motion.div>
                                <h3 className="text-lg font-semibold text-white mb-2">{benefit.title}</h3>
                                <p className="text-sm text-gray-400 leading-relaxed">{benefit.desc}</p>
                            </motion.div>
                        </StaggerItem>
                    ))}
                </StaggerContainer>

                {/* Closing */}
                <ScrollReveal direction="up" delay={0.4} duration={0.6}>
                    <div className="text-center">
                        <p className="text-xl sm:text-2xl md:text-3xl font-semibold text-white mb-10 leading-relaxed">
                            Intensity for growth. Standards for opportunity.{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-gold via-amber-400 to-primary-gold animate-shimmer bg-[length:200%_auto]">
                                Fire for fire.
                            </span>
                        </p>
                        <div className="space-y-4">
                            <p className="text-lg text-gray-300">
                                If that sounds like what you want... <span className="text-white font-medium">welcome to the team.</span>
                            </p>
                            <p className="text-base text-gray-500">
                                If it doesn&apos;t... no hard feelings. But now you know.
                            </p>
                        </div>
                    </div>
                </ScrollReveal>
            </div>

            {/* Cinematic bottom fade */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" />
        </section>
    );
}
