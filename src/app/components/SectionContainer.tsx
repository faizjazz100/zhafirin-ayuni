import { motion } from "framer-motion";
import FloralCorner from "@/src/app/components/FloralCorner";

export default function SectionContainer({
    id,
    children,
    floral = false,
    animate = true,
    className = "",
}: {
    id?: string;
    children: React.ReactNode;
    floral?: boolean;
    animate?: boolean;
    className?: string;
}) {
    const inner = (
        <div className={`relative mt-10 ${className}`}>
            {floral && <FloralCorner />}
            <div className="rounded-[28px] border border-white/55 bg-white/65 p-6 shadow-[0_20px_70px_rgba(0,0,0,0.10)] sm:p-10">
                {children}
            </div>
        </div>
    );

    if (!animate) {
        return <section id={id}>{inner}</section>;
    }

    return (
        <motion.section
            id={id}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
        >
            {inner}
        </motion.section>
    );
}