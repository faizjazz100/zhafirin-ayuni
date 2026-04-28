"use client";

type Props = {
    className?: string;
    position?: "top-left" | "top-right";
    size?: number;
};

export default function FloralCorner2({
    className = "",
    position = "top-right",
    size = 110,
}: Props) {
    const flip = position === "top-left" ? "translate(130,0) scale(-1,1)" : undefined;

    return (
        <div
            className={`pointer-events-none absolute top-0 ${position === "top-right" ? "right-0" : "left-0"} overflow-visible ${className}`}
            aria-hidden="true"
        >
            <svg
                width={size}
                height={size}
                viewBox="0 0 130 130"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <g transform={flip}>
                <g opacity="0.40">

                    {/* ── Short curved stems from corner ── */}
                    <path d="M 122 8 C 115 16 105 20 98 28" stroke="#7A0022" strokeWidth="1.1" strokeLinecap="round"/>
                    <path d="M 118 4 C 108 10 100 18 90 22" stroke="#7A0022" strokeWidth="0.9" strokeLinecap="round" opacity="0.7"/>
                    <path d="M 110 8 C 104 18 98 24 88 36" stroke="#7A0022" strokeWidth="0.8" strokeLinecap="round" opacity="0.65"/>
                    <path d="M 100 6 C 92 14 84 20 76 32" stroke="#7A0022" strokeWidth="0.7" strokeLinecap="round" opacity="0.6"/>
                    <path d="M 90 12 C 84 22 78 30 66 44" stroke="#7A0022" strokeWidth="0.65" strokeLinecap="round" opacity="0.55"/>
                    <path d="M 78 18 C 70 28 64 38 54 50" stroke="#7A0022" strokeWidth="0.6" strokeLinecap="round" opacity="0.5"/>

                    {/* ── Tiny connecting tendrils ── */}
                    <path d="M 104 24 C 100 20 96 22 98 28" stroke="#7A0022" strokeWidth="0.5" strokeLinecap="round" opacity="0.45"/>
                    <path d="M 86 32 C 82 28 80 32 84 38" stroke="#7A0022" strokeWidth="0.45" strokeLinecap="round" opacity="0.4"/>

                    {/* ── Leaves — short and organic ── */}
                    <g transform="translate(106,20) rotate(-30)">
                        <path d="M 0 -7 C 4 -3.5 4 3.5 0 7 C -4 3.5 -4 -3.5 0 -7 Z" fill="#7A0022" opacity="0.68"/>
                        <line x1="0" y1="-7" x2="0" y2="7" stroke="#7A0022" strokeWidth="0.4" opacity="0.35"/>
                    </g>
                    <g transform="translate(96,28) rotate(20)">
                        <path d="M 0 -6 C 3.5 -3 3.5 3 0 6 C -3.5 3 -3.5 -3 0 -6 Z" fill="#7A0022" opacity="0.62"/>
                    </g>
                    <g transform="translate(88,36) rotate(-50)">
                        <path d="M 0 -8 C 4.5 -4 4.5 4 0 8 C -4.5 4 -4.5 -4 0 -8 Z" fill="#7A0022" opacity="0.60"/>
                        <line x1="0" y1="-8" x2="0" y2="8" stroke="#7A0022" strokeWidth="0.4" opacity="0.3"/>
                    </g>
                    <g transform="translate(76,34) rotate(10)">
                        <path d="M 0 -7 C 4 -3.5 4 3.5 0 7 C -4 3.5 -4 -3.5 0 -7 Z" fill="#7A0022" opacity="0.58"/>
                    </g>
                    <g transform="translate(68,46) rotate(-40)">
                        <path d="M 0 -8 C 4.5 -4 4.5 4 0 8 C -4.5 4 -4.5 -4 0 -8 Z" fill="#7A0022" opacity="0.55"/>
                        <line x1="0" y1="-8" x2="0" y2="8" stroke="#7A0022" strokeWidth="0.4" opacity="0.3"/>
                    </g>
                    <g transform="translate(58,52) rotate(30)">
                        <path d="M 0 -6 C 3.5 -3 3.5 3 0 6 C -3.5 3 -3.5 -3 0 -6 Z" fill="#7A0022" opacity="0.5"/>
                    </g>

                    {/* ── Flower 1 — large, near top corner (105, 14) ── */}
                    <g transform="translate(105,14)">
                        {[0,72,144,216,288].map((d) => (
                            <g key={d} transform={`rotate(${d})`}>
                                <path d="M 0 -13 C 5 -9 5 -2 0 1 C -5 -2 -5 -9 0 -13 Z" fill="#7A0022" opacity="0.50"/>
                            </g>
                        ))}
                        <circle cx="0" cy="0" r="6" fill="#7A0022" opacity="0.14"/>
                        <circle cx="0" cy="0" r="4.5" fill="#7A0022" opacity="0.88"/>
                        <circle cx="0" cy="0" r="2.5" fill="#4A0010" opacity="1"/>
                        <circle cx="0" cy="0" r="1" fill="#F4D7DA" opacity="0.9"/>
                    </g>

                    {/* ── Flower 2 — medium, along mid stem (82, 28) ── */}
                    <g transform="translate(82,28)">
                        {[0,60,120,180,240,300].map((d) => (
                            <g key={d} transform={`rotate(${d})`}>
                                <path d="M 0 -11 C 4 -7.5 4 -2 0 1 C -4 -2 -4 -7.5 0 -11 Z" fill="#7A0022" opacity="0.46"/>
                            </g>
                        ))}
                        <circle cx="0" cy="0" r="5" fill="#7A0022" opacity="0.12"/>
                        <circle cx="0" cy="0" r="3.8" fill="#7A0022" opacity="0.85"/>
                        <circle cx="0" cy="0" r="2" fill="#4A0010" opacity="1"/>
                        <circle cx="0" cy="0" r="0.8" fill="#F4D7DA" opacity="0.85"/>
                    </g>

                    {/* ── Flower 3 — medium, lower (62, 48) ── */}
                    <g transform="translate(62,48)">
                        {[0,72,144,216,288].map((d) => (
                            <g key={d} transform={`rotate(${d})`}>
                                <path d="M 0 -11 C 4.5 -7.5 4.5 -2 0 1 C -4.5 -2 -4.5 -7.5 0 -11 Z" fill="#7A0022" opacity="0.46"/>
                            </g>
                        ))}
                        <circle cx="0" cy="0" r="5" fill="#7A0022" opacity="0.12"/>
                        <circle cx="0" cy="0" r="3.8" fill="#7A0022" opacity="0.85"/>
                        <circle cx="0" cy="0" r="2" fill="#4A0010" opacity="1"/>
                        <circle cx="0" cy="0" r="0.8" fill="#F4D7DA" opacity="0.85"/>
                    </g>

                    {/* ── Flower 4 — small bud (92, 16) ── */}
                    <g transform="translate(92,16)">
                        {[0,72,144,216,288].map((d) => (
                            <g key={d} transform={`rotate(${d})`}>
                                <path d="M 0 -8 C 3 -5.5 3 -1.5 0 0.5 C -3 -1.5 -3 -5.5 0 -8 Z" fill="#7A0022" opacity="0.44"/>
                            </g>
                        ))}
                        <circle cx="0" cy="0" r="3" fill="#7A0022" opacity="0.85"/>
                        <circle cx="0" cy="0" r="1.5" fill="#4A0010" opacity="1"/>
                    </g>

                    {/* ── Flower 5 — tiny bud (74, 40) ── */}
                    <g transform="translate(74,40)">
                        {[0,90,180,270].map((d) => (
                            <g key={d} transform={`rotate(${d})`}>
                                <path d="M 0 -6 C 2.5 -4 2.5 -1 0 0 C -2.5 -1 -2.5 -4 0 -6 Z" fill="#7A0022" opacity="0.42"/>
                            </g>
                        ))}
                        <circle cx="0" cy="0" r="2.5" fill="#7A0022" opacity="0.82"/>
                        <circle cx="0" cy="0" r="1.2" fill="#4A0010" opacity="1"/>
                    </g>

                    {/* ── Berries / buds at stem tips ── */}
                    <circle cx="122" cy="6" r="2.5" fill="#7A0022" opacity="0.72"/>
                    <circle cx="118" cy="3" r="1.5" fill="#7A0022" opacity="0.52"/>
                    <circle cx="98" cy="30" r="1.8" fill="#7A0022" opacity="0.55"/>
                    <circle cx="54" cy="52" r="1.5" fill="#7A0022" opacity="0.48"/>
                    <circle cx="50" cy="56" r="1" fill="#7A0022" opacity="0.38"/>

                </g>
                </g>
            </svg>
        </div>
    );
}
