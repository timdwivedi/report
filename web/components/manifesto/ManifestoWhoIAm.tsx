"use client";

import { useRef } from "react";
import { Hammer, Zap, Compass, Volume2, Swords } from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";
import ScrollReveal from "@/components/shared/ScrollReveal";
import { StaggerContainer, StaggerItem } from "@/components/shared/StaggerChildren";
import { AnimatedDivider } from "@/components/manifesto/ManifestoHero";

const traits = [
    { icon: Hammer, label: "Builder" },
    { icon: Zap, label: "Fast" },
    { icon: Compass, label: "Direct" },
    { icon: Volume2, label: "Unfiltered" },
    { icon: Swords, label: "Intense" },
];

export default function ManifestoWhoIAm() {
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
                        radial-gradient(600px 500px at 75% 33%, rgba(0,212,255,0.08), transparent),
                        radial-gradient(400px 400px at 33% 75%, rgba(212,175,55,0.05), transparent),
                        radial-gradient(300px 300px at 50% 50%, rgba(139,92,246,0.04), transparent),
                        #0f0f1a
                    `,
                }}
            />

            {/* Top line */}
            <AnimatedDivider color="primary-cyan" />

            <div className="max-w-6xl mx-auto px-6 relative">
                <div className="grid lg:grid-cols-2 gap-16 items-start">

                    {/* Left Column: Text */}
                    <StaggerContainer stagger={0.05}>
                        <StaggerItem direction="none">
                            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-cyan/[0.10] border border-primary-cyan/25 rounded-full mb-10 backdrop-blur-md shadow-[0_0_30px_rgba(0,212,255,0.12)]">
                                <Hammer size={14} className="text-primary-cyan animate-pulse-subtle" />
                                <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-primary-cyan">
                                    Who I Am
                                </span>
                            </div>
                        </StaggerItem>

                        <StaggerItem direction="up">
                            <h2 className="text-4xl sm:text-5xl font-bold mb-8 leading-tight text-white">
                                I am a <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-cyan to-blue-400">Builder</span>.<br />
                                Not a Manager.
                            </h2>
                        </StaggerItem>

                        <StaggerItem direction="up">
                            <p className="text-xl sm:text-2xl text-gray-200 leading-relaxed mb-8">
                                I&apos;m a builder. Not a manager. Not a babysitter. Not someone who sits in meetings talking about what we could do. I build things. Systems, products, businesses, movements.
                            </p>
                        </StaggerItem>

                        <StaggerItem direction="up">
                            <p className="text-lg text-gray-400 leading-relaxed mb-8">
                                I think fast. I move fast. I change direction when I see a better path. I don&apos;t ask permission to evolve. I expect the same from you.
                            </p>
                        </StaggerItem>

                        <StaggerItem direction="up">
                            <p className="text-lg text-gray-400 leading-relaxed mb-8">
                                I am direct. I will tell you exactly what I think. I won&apos;t dress it up. I won&apos;t soften it to protect your feelings. That&apos;s not disrespect... that&apos;s respect. I respect you enough to be honest with you instead of wasting your time with polite bullshit.
                            </p>
                        </StaggerItem>

                        <StaggerItem direction="up">
                            <p className="text-lg text-gray-400 leading-relaxed mb-8">
                                I might swear. I might be blunt. I might sound frustrated when I see the same mistake twice. That&apos;s not anger at you... it&apos;s impatience with mediocrity. There&apos;s a difference. I hold myself to an insane standard. I hold this team to the same one.
                            </p>
                        </StaggerItem>
                    </StaggerContainer>

                    {/* Right Column: Traits — spring-physics hover */}
                    <div className="lg:sticky lg:top-32">
                        <ScrollReveal direction="right" delay={0.2} duration={0.5}>
                            <div className="grid gap-4">
                                {traits.map((trait) => (
                                    <motion.div
                                        key={trait.label}
                                        whileHover={{
                                            y: -4,
                                            boxShadow: "0 10px 40px rgba(0,212,255,0.18), 0 0 60px rgba(0,212,255,0.08)",
                                            borderColor: "rgba(0,212,255,0.4)",
                                        }}
                                        whileTap={{ scale: 0.98 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                        className="relative p-5 bg-dark-card/40 border border-white/5 rounded-2xl overflow-hidden cursor-default"
                                    >
                                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-cyan/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                        <div className="flex items-center gap-5 relative z-10">
                                            <motion.div
                                                whileHover={{ scale: 1.15, backgroundColor: "rgba(0,212,255,0.2)" }}
                                                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                                                className="w-12 h-12 rounded-xl bg-primary-cyan/10 flex items-center justify-center border border-primary-cyan/20"
                                            >
                                                <trait.icon size={20} className="text-primary-cyan" />
                                            </motion.div>
                                            <h3 className="text-white font-semibold text-lg">{trait.label}</h3>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </ScrollReveal>
                    </div>
                </div>

                {/* Centered Closing Card */}
                <ScrollReveal direction="up" delay={0.4} className="mt-16 max-w-5xl mx-auto">
                    <motion.div
                        whileHover={{
                            y: -4,
                            boxShadow: "0 10px 40px rgba(0,212,255,0.15), 0 0 60px rgba(0,212,255,0.1)",
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="manifesto-card-cyan p-10 text-center"
                    >
                        <p className="text-xl text-gray-200 leading-relaxed italic">
                            If you need someone who&apos;s always calm, always gentle, always patient... I&apos;m not your guy. But if you want someone who will go to war for the vision, build something that actually matters, and push you to become better than you thought you could be... then we&apos;re going to get along.
                        </p>
                    </motion.div>
                </ScrollReveal>
            </div>

            <AnimatedDivider color="white" />
        </section>
    );
}
