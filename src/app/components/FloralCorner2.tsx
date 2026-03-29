"use client";

type FloralCornerProps = {
    className?: string;
    position?: "top-left" | "top-right";
    size?: number; // scale size (default 80)
};

export default function FloralCorner2({
    className = "",
    position = "top-right",
    size = 80,
}: FloralCornerProps) {
    const transformClass = position === "top-left" ? "scale-x-[-1]" : "";

    return (
        <div
            className={`pointer-events-none absolute top-0 ${position === "top-right" ? "right-0" : "left-0"} overflow-visible ${className} ${transformClass}`}
            aria-hidden="true"
        >
            <svg
                width={size}
                height={size}
                viewBox="0 20 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <g opacity="0.5">
                    {/* Gentle curved vine */}
                    <path d="M100 0 C80 25 55 50 20 90" stroke="#7A0022" strokeWidth="1" strokeLinecap="round" />

                    {/* Small branch vines */}
                    <path d="M80 25 C70 35 55 30 45 36" stroke="#7A0022" strokeWidth="0.7" strokeLinecap="round" opacity="0.7" />
                    <path d="M55 60 C45 65 38 63 30 70" stroke="#7A0022" strokeWidth="0.6" strokeLinecap="round" opacity="0.6" />

                    {/* Leaves */}
                    <path d="M95 15 C102 8 110 5 112 12 C110 20 102 23 95 15Z" fill="#7A0022" opacity="0.75" />
                    <path d="M78 38 C86 28 94 26 96 33 C92 42 82 44 78 38Z" fill="#7A0022" opacity="0.65" />
                    <path d="M50 65 C62 58 70 60 70 68 C66 76 56 74 50 65Z" fill="#7A0022" opacity="0.6" />

                    {/* Tiny buds */}
                    <circle cx="95" cy="5" r="2.5" fill="#7A0022" opacity="0.8" />
                    <circle cx="65" cy="50" r="6" fill="#7A0022" opacity="0.15" />
                    <circle cx="65" cy="50" r="4.5" fill="#7A0022" opacity="0.75" />
                    <path d="M65 45 C68 47 69 50 68 53 C65 55 61 53 61 50 C62 47 64 45 65 45Z" fill="#B0103E" opacity="0.8" />
                    <circle cx="65" cy="50" r="2" fill="#5A0018" opacity="0.9" />

                    {/* Vine end buds */}
                    <ellipse cx="30" cy="72" rx="1.5" ry="2.5" fill="#7A0022" opacity="0.55" transform="rotate(-35 30 72)" />
                    <circle cx="20" cy="90" r="1.5" fill="#7A0022" opacity="0.5" />
                </g>
            </svg>
        </div>
    );
}