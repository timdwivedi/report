"use client";

import { useRef } from "react";
import { Shield } from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";
import ScrollReveal from "@/components/shared/ScrollReveal";
import AnimatedCounter from "@/components/shared/AnimatedCounter";
import { StaggerContainer, StaggerItem } from "@/components/shared/StaggerChildren";
import { AnimatedDivider } from "@/components/manifesto/ManifestoHero";

const laws = [
    {
        number: 1,
        title: "Don't Ask Me What To Do",
        body: `"What should I work on?" or "Do you have any work for me?" are the single most draining sentences you can say to me.\n\nIf you don't know what to do, that means one of two things: either you don't understand the mission well enough, or you're not thinking hard enough. Both are fixable. But the fix is on you, not me.\n\nThe right move is always: figure out what needs to happen, do it, then show me what you did. I'll tell you if it's wrong. But come with something. Always come with something.`,
    },
    {
        number: 2,
        title: "Speed Over Perfection",
        body: `Done is better than perfect. Shipped is better than polished. A rough version I can see today is worth more than a perfect version next week.\n\nI don't care if it's messy. I care if it exists. We can clean it up later. We can't get back wasted time.\n\nIf you're spending three days making something look nice before anyone's even seen it... you're working on the wrong thing.`,
    },
    {
        number: 3,
        title: "Own Your Work",
        body: `When you take something on, it's yours. You don't need to check in every step. You don't need to ask if you're on the right track every hour. Do the work. Make the call. If you're wrong, we fix it. But I need people who can carry weight without someone watching.\n\nOwnership means: if it breaks, you fix it. If it's unclear, you figure it out. If it's stuck, you find a way around it. You don't wait for me to notice.`,
    },
    {
        number: 4,
        title: "I Will Change Direction",
        body: `I pivot. Sometimes fast. Sometimes mid-sentence. That's not chaos... that's how I operate. I see patterns other people miss, and when I see a better path, I take it.\n\nIf I change the plan, don't fight it. Don't say "but we already started the other thing." Adapt. Move with me. The old plan is dead. The new plan is what matters now.\n\nIf you need a week to emotionally process every pivot, this isn't the right team for you.`,
    },
    {
        number: 5,
        title: "Silence Is Not a Problem",
        body: `If I go quiet for a day, two days, a week... I'm building something. I'm deep in creation mode. I'm thinking at a level that requires me to disappear.\n\nDon't panic. Don't send "just checking in" messages. Don't assume the sky is falling.\n\nKeep working. Keep executing. Keep moving the mission forward. When I come back, I'll have something new. And I'll expect you to have something new too.`,
    },
    {
        number: 6,
        title: "Don't Bring Me Problems Without Solutions",
        body: `I already know there are problems. Every business has problems. That's not news.\n\nWhat I need from you is: "Here's the problem, here's what I think we should do, and here's what I've already tried." That's useful. That's high-value. That's how operators think.\n\n"Hey, this thing is broken" with nothing else attached? That's just noise.`,
    },
    {
        number: 7,
        title: "I Don't Tolerate Mediocrity",
        body: `Mediocrity is not about talent. Some of the most talented people I've met are mediocre because they coast. They do the minimum. They wait to be told. They treat this like a job instead of a mission.\n\nI'd rather work with someone who has less skill but brings fire than someone brilliant who's a weasel.\n\nIf you're here, be here. All the way. If you're halfway in, do us both a favour and say so.`,
    },
    {
        number: 8,
        title: "Communication Is Direct... Match It",
        body: `I say what I mean. I expect you to do the same.\n\nDon't hedge. Don't give me "maybe" or "I think possibly" or "it could be an option." Tell me what you actually think. Even if I disagree, I'll respect you for having a spine.\n\nIf something I said doesn't make sense... say so. If you think I'm wrong... tell me. I don't need yes-men. I need people who think and speak clearly.`,
    },
    {
        number: 9,
        title: "Results Talk, Everything Else Walks",
        body: `I don't care how many hours you worked. I don't care how busy you were. I don't care if you pulled an all-nighter.\n\nI care about what moved forward. What shipped. What's different now because of what you did.\n\nShow me the output. That's all that matters.`,
    },
    {
        number: 10,
        title: "This Is Not a Job... It's a Vehicle",
        body: `If you see this as a paycheck, you'll always be replaceable. If you see this as a vehicle to grow, to learn, to become someone you couldn't be anywhere else... then you'll thrive here.\n\nThe people who do well on this team are the ones who treat this like their own business. They think like owners. They act like the mission is theirs. Because if you do that, you'll grow faster here than anywhere else. And when you look back, you'll realize this was the environment that made you.`,
    },
];

export default function ManifestoLaws() {
    const sectionRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start end", "end start"],
    });
    const bgY = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

    return (
        <section
            ref={sectionRef}
            className="relative py-28 overflow-hidden manifesto-section"
        >
            {/* Parallax background */}
            <motion.div
                className="absolute inset-0 -inset-y-[15%]"
                style={{
                    y: bgY,
                    background: `
                        radial-gradient(700px 600px at 75% 25%, rgba(212,175,55,0.08), transparent),
                        radial-gradient(500px 500px at 33% 75%, rgba(0,212,255,0.05), transparent),
                        radial-gradient(400px 400px at 50% 50%, rgba(139,92,246,0.04), transparent),
                        #0f0f1a
                    `,
                }}
            />

            {/* Top line */}
            <AnimatedDivider color="primary-gold" />

            <div className="max-w-5xl mx-auto px-6 relative">
                <ScrollReveal direction="none" duration={0.6}>
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-gold/[0.10] border border-primary-gold/25 rounded-full mb-10 backdrop-blur-md shadow-[0_0_30px_rgba(212,175,55,0.12)]">
                            <Shield size={14} className="text-primary-gold animate-pulse-subtle" />
                            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-primary-gold">
                                The Laws
                            </span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gradient-headline text-glow-gold mb-5 leading-tight">
                            Non-Negotiable.{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-gold via-amber-400 to-primary-gold animate-shimmer bg-[length:200%_auto]">
                                No Exceptions.
                            </span>
                        </h2>
                        <p className="text-gray-500 text-lg max-w-xl mx-auto">
                            These are how this team operates.
                        </p>
                    </div>
                </ScrollReveal>

                <StaggerContainer stagger={0.06} className="grid md:grid-cols-2 gap-5">
                    {laws.map((law) => (
                        <StaggerItem key={law.number} direction="up">
                            <motion.div
                                whileHover={{
                                    y: -4,
                                    boxShadow: "0 10px 40px rgba(212,175,55,0.15), 0 0 60px rgba(212,175,55,0.1)",
                                    borderColor: "rgba(212,175,55,0.4)",
                                }}
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                className="manifesto-card p-7 h-full"
                            >
                                {/* Law number badge with count-up */}
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-gold/[0.12] border border-primary-gold/30 flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.15)]">
                                        <AnimatedCounter
                                            value={law.number}
                                            duration={0.8}
                                            className="text-sm font-bold text-primary-gold"
                                        />
                                    </div>
                                    <h3 className="text-lg font-semibold text-white">{law.title}</h3>
                                </div>
                                {/* Law body */}
                                <div className="space-y-3">
                                    {law.body.split("\n\n").map((paragraph, j) => (
                                        <p key={j} className="text-sm text-gray-400 leading-relaxed">
                                            {paragraph}
                                        </p>
                                    ))}
                                </div>
                            </motion.div>
                        </StaggerItem>
                    ))}
                </StaggerContainer>
            </div>

            <AnimatedDivider color="white" />
        </section>
    );
}
