"use client";

import { motion, useScroll, useSpring } from "motion/react";
import ManifestoHero from "@/components/manifesto/ManifestoHero";
import ManifestoWhoIAm from "@/components/manifesto/ManifestoWhoIAm";
import ManifestoMission from "@/components/manifesto/ManifestoMission";
import ManifestoLaws from "@/components/manifesto/ManifestoLaws";
import ManifestoWhyIAm from "@/components/manifesto/ManifestoWhyIAm";
import ManifestoReturn from "@/components/manifesto/ManifestoReturn";

export default function ManifestoPage2() {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001,
    });

    return (
        <div className="min-h-screen bg-dark-bg" data-theme="dark">
            {/* Scroll progress bar */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary-gold via-amber-400 to-primary-gold origin-left z-[100]"
                style={{ scaleX }}
            />

            {/* Page-level texture overlays — single instance, fixed for performance */}
            <div className="page-noise" aria-hidden="true" />
            <div className="page-dots" aria-hidden="true" />

            <div className="relative z-[2]">
                <ManifestoHero />
                <ManifestoWhoIAm />
                <ManifestoMission />
                <ManifestoLaws />
                <ManifestoWhyIAm />
                <ManifestoReturn />
            </div>
        </div>
    );
}
