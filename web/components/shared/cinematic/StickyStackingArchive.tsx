"use client"

import { motion } from "motion/react"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface ArchiveItem {
    id: string
    title: string
    subtitle: string
    price: string
    priceSub: string
    features: string[]
    isPopular?: boolean
    isEnterprise?: boolean
}

interface StickyStackingArchiveProps {
    title: string
    subtitle: string
    items: ArchiveItem[]
}

export function StickyStackingArchive({ title, subtitle, items }: StickyStackingArchiveProps) {
    return (
        <section className="py-24 bg-slate-50 relative">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-500/[0.04] rounded-full blur-[140px] pointer-events-none" />

            <div className="container mx-auto px-6 max-w-4xl relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-heading font-bold text-slate-900 mb-4">
                        {title}
                    </h2>
                    <p className="text-xl text-slate-600">
                        {subtitle}
                    </p>
                </div>

                <div className="space-y-6">
                    {items.map((item, i) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ delay: i * 0.1, type: "spring", stiffness: 300, damping: 30 }}
                            className="sticky"
                            style={{
                                top: `${120 + i * 24}px`,
                                zIndex: i + 1,
                            }}
                        >
                            <div
                                className={`flex flex-col md:flex-row gap-8 items-center rounded-xl border p-8 md:p-10 card-depth shadow-[0_10px_40px_rgba(0,0,0,0.08)]
                  ${item.isPopular ? 'border-primary-500 ring-2 ring-primary-500/20' : 'border-slate-200'}
                  ${item.isEnterprise ? 'border-slate-800 bg-slate-900' : 'bg-white'}
                `}
                            >
                                {/* Left Col: Info */}
                                <div className="flex-1 w-full text-left">
                                    {item.isPopular && (
                                        <div className="text-xs font-bold text-primary-600 uppercase tracking-widest mb-3">
                                            Most Popular
                                        </div>
                                    )}
                                    {item.isEnterprise && (
                                        <div className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3">
                                            High Volume
                                        </div>
                                    )}
                                    <h3 className={`text-3xl font-heading font-bold mb-2 ${item.isEnterprise ? 'text-white' : 'text-slate-900'}`}>
                                        {item.title}
                                    </h3>
                                    <p className={`${item.isEnterprise ? 'text-slate-400' : 'text-slate-500'} mb-6`}>
                                        {item.subtitle}
                                    </p>
                                    <div className="flex items-baseline gap-2 mb-6 md:mb-0">
                                        <span className={`text-5xl font-heading font-bold ${item.isEnterprise ? 'text-white' : 'text-slate-900'}`}>
                                            {item.price}
                                        </span>
                                        <span className={`${item.isEnterprise ? 'text-slate-400' : 'text-slate-500'} font-mono`}>
                                            {item.priceSub}
                                        </span>
                                    </div>
                                </div>

                                {/* Right Col: Features & CTA */}
                                <div className="flex-1 w-full space-y-6">
                                    <ul className="space-y-3">
                                        {item.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-center gap-3">
                                                <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${item.isEnterprise ? 'bg-indigo-500/20' : 'bg-emerald-100'}`}>
                                                    <Check className={`w-3 h-3 ${item.isEnterprise ? 'text-indigo-400' : 'text-emerald-600'}`} />
                                                </div>
                                                <span className={`${item.isEnterprise ? 'text-slate-300' : 'text-slate-600'}`}>
                                                    {feature}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>

                                    <Button
                                        asChild
                                        className={`w-full py-6 rounded-[10px] font-semibold text-lg overflow-hidden group
                      ${item.isPopular ? 'bg-primary-500 hover:bg-primary-600 text-white shadow-[0_4px_14px_rgba(59,130,246,0.3)]' :
                                                item.isEnterprise ? 'bg-white hover:bg-slate-100 text-slate-900' :
                                                    'bg-transparent border-2 border-primary-500 text-primary-500 hover:bg-primary-50'}
                    `}
                                    >
                                        <Link href="/signup">
                                            <span className="relative z-10 transition-transform group-hover:scale-105 inline-block">
                                                {item.isEnterprise ? 'Contact Sales' : 'Start Free Trial'}
                                            </span>
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
