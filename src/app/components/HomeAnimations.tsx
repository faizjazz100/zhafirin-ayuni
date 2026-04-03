"use client";

import { motion } from "framer-motion";

export function MotionDiv({
    children,
    className,
    ...props
}: React.ComponentProps<typeof motion.div>) {
    return (
        <motion.div className={className} {...props}>
            {children}
        </motion.div>
    );
}

export function MotionSection({
    children,
    className,
    ...props
}: React.ComponentProps<typeof motion.section>) {
    return (
        <motion.section className={className} {...props}>
            {children}
        </motion.section>
    );
}