export default function FloralBackground() {
    return (
        <div
            className="pointer-events-none fixed inset-0 overflow-hidden"
            style={{ zIndex: -1 }}
            aria-hidden="true"
        >
            <svg
                width="100%"
                height="100%"
                viewBox="0 0 680 900"
                preserveAspectRatio="xMidYMid slice"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* ── LEFT VINE ────────────────────────────────────────── */}
                <g opacity="0.70">
                    {/* Main stem — flowing S-curve */}
                    <path
                        d="M 48 0 C 24 95 74 195 42 305 C 14 415 70 515 36 635 C 10 755 58 840 42 900"
                        stroke="#7A0022" strokeWidth="1.5" fill="none" strokeLinecap="round"
                    />

                    {/* ─ Rose bud at the top ─ */}
                    <g transform="translate(44, 36)">
                        <ellipse rx="5" ry="7.5" cy="-4" fill="#7A0022" opacity="0.48"/>
                        <ellipse rx="4" ry="6.5" cy="-4" fill="#7A0022" opacity="0.43" transform="rotate(55)"/>
                        <ellipse rx="4" ry="6.5" cy="-4" fill="#7A0022" opacity="0.43" transform="rotate(-55)"/>
                        <ellipse rx="3" ry="5" cy="-4" fill="#7A0022" opacity="0.36" transform="rotate(115)"/>
                        <circle r="2.5" fill="#7A0022" opacity="0.80"/>
                        <circle r="1.3" fill="#B0103E" opacity="0.95"/>
                    </g>
                    <path d="M 44 36 C 33 24 18 20 12 24" stroke="#7A0022" strokeWidth="0.65" fill="none" strokeLinecap="round" opacity="0.42"/>
                    {/* Small leaf on tendril */}
                    <g transform="translate(12, 24)">
                        <g transform="rotate(110)"><ellipse rx="2.5" ry="6.5" cy="-3" fill="#7A0022" opacity="0.40"/></g>
                    </g>

                    {/* ─ Leaf cluster y≈108, branches right ─ */}
                    <path d="M 47 110 C 55 107 62 107 68 105" stroke="#7A0022" strokeWidth="0.6" fill="none" strokeLinecap="round" opacity="0.40"/>
                    <g transform="translate(68, 105)">
                        <g transform="rotate(-52)">
                            <ellipse rx="3.5" ry="10.5" cy="-5" fill="#7A0022" opacity="0.42"/>
                            <path d="M0,0 L0,-16" stroke="#7A0022" strokeWidth="0.45" opacity="0.28"/>
                        </g>
                        <g transform="rotate(-74)"><ellipse rx="3" ry="8.5" cy="-4" fill="#7A0022" opacity="0.34"/></g>
                        <g transform="rotate(-32)"><ellipse rx="2.5" ry="7.5" cy="-4" fill="#7A0022" opacity="0.27"/></g>
                    </g>

                    {/* ─ Leaf cluster y≈197, branches left ─ */}
                    <path d="M 45 199 C 36 196 27 196 20 200" stroke="#7A0022" strokeWidth="0.6" fill="none" strokeLinecap="round" opacity="0.37"/>
                    <g transform="translate(20, 200)">
                        <g transform="rotate(54)">
                            <ellipse rx="3.5" ry="10" cy="-5" fill="#7A0022" opacity="0.40"/>
                            <path d="M0,0 L0,-16" stroke="#7A0022" strokeWidth="0.45" opacity="0.26"/>
                        </g>
                        <g transform="rotate(76)"><ellipse rx="3" ry="8.5" cy="-4" fill="#7A0022" opacity="0.32"/></g>
                    </g>

                    {/* ─ 5-petal flower y≈305 ─ */}
                    <path d="M 44 306 C 40 303 36 303 32 306" stroke="#7A0022" strokeWidth="0.6" fill="none" strokeLinecap="round" opacity="0.38"/>
                    <g transform="translate(32, 306)">
                        <circle r="8.5" fill="#7A0022" opacity="0.06"/>
                        <ellipse rx="2.8" ry="5.8" cy="-3" fill="#7A0022" opacity="0.40"/>
                        <ellipse rx="2.8" ry="5.8" cy="-3" fill="#7A0022" opacity="0.36" transform="rotate(72)"/>
                        <ellipse rx="2.8" ry="5.8" cy="-3" fill="#7A0022" opacity="0.36" transform="rotate(144)"/>
                        <ellipse rx="2.8" ry="5.8" cy="-3" fill="#7A0022" opacity="0.36" transform="rotate(216)"/>
                        <ellipse rx="2.8" ry="5.8" cy="-3" fill="#7A0022" opacity="0.36" transform="rotate(288)"/>
                        <circle r="2.2" fill="#7A0022" opacity="0.76"/>
                        <circle r="1" fill="#B0103E" opacity="0.90"/>
                    </g>

                    {/* ─ Leaf cluster y≈396, branches right ─ */}
                    <path d="M 46 400 C 55 397 62 397 68 395" stroke="#7A0022" strokeWidth="0.55" fill="none" strokeLinecap="round" opacity="0.34"/>
                    <g transform="translate(68, 395)">
                        <g transform="rotate(-46)">
                            <ellipse rx="3.5" ry="10.5" cy="-5" fill="#7A0022" opacity="0.35"/>
                            <path d="M0,0 L0,-16" stroke="#7A0022" strokeWidth="0.4" opacity="0.24"/>
                        </g>
                        <g transform="rotate(-68)"><ellipse rx="3" ry="8.5" cy="-4" fill="#7A0022" opacity="0.27"/></g>
                    </g>

                    {/* ─ Leaf cluster y≈492, branches left ─ */}
                    <path d="M 42 496 C 32 492 22 492 16 496" stroke="#7A0022" strokeWidth="0.55" fill="none" strokeLinecap="round" opacity="0.32"/>
                    <g transform="translate(16, 496)">
                        <g transform="rotate(56)">
                            <ellipse rx="3.5" ry="10" cy="-5" fill="#7A0022" opacity="0.33"/>
                            <path d="M0,0 L0,-16" stroke="#7A0022" strokeWidth="0.4" opacity="0.22"/>
                        </g>
                        <g transform="rotate(80)"><ellipse rx="3" ry="8" cy="-4" fill="#7A0022" opacity="0.26"/></g>
                        <g transform="rotate(36)"><ellipse rx="2.5" ry="7" cy="-3" fill="#7A0022" opacity="0.22"/></g>
                    </g>

                    {/* ─ Small rose bud y≈560 ─ */}
                    <path d="M 40 564 C 50 560 58 560 64 560" stroke="#7A0022" strokeWidth="0.5" fill="none" strokeLinecap="round" opacity="0.30"/>
                    <g transform="translate(64, 560)">
                        <ellipse rx="2.5" ry="5" cy="-2.5" fill="#7A0022" opacity="0.36"/>
                        <ellipse rx="2.5" ry="5" cy="-2.5" fill="#7A0022" opacity="0.30" transform="rotate(62)"/>
                        <ellipse rx="2.5" ry="5" cy="-2.5" fill="#7A0022" opacity="0.30" transform="rotate(-62)"/>
                        <circle r="1.5" fill="#7A0022" opacity="0.60"/>
                        <circle r="0.8" fill="#B0103E" opacity="0.78"/>
                    </g>

                    {/* ─ Leaf cluster y≈628, branches left ─ */}
                    <path d="M 37 632 C 26 628 18 628 12 632" stroke="#7A0022" strokeWidth="0.5" fill="none" strokeLinecap="round" opacity="0.28"/>
                    <g transform="translate(12, 632)">
                        <g transform="rotate(54)"><ellipse rx="3" ry="9" cy="-4" fill="#7A0022" opacity="0.30"/></g>
                        <g transform="rotate(32)"><ellipse rx="2.5" ry="7.5" cy="-3" fill="#7A0022" opacity="0.24"/></g>
                    </g>

                    {/* ─ Leaf cluster y≈732, branches right ─ */}
                    <path d="M 38 736 C 48 732 56 732 62 730" stroke="#7A0022" strokeWidth="0.5" fill="none" strokeLinecap="round" opacity="0.26"/>
                    <g transform="translate(62, 730)">
                        <g transform="rotate(-50)"><ellipse rx="3" ry="9" cy="-4" fill="#7A0022" opacity="0.27"/></g>
                        <g transform="rotate(-72)"><ellipse rx="2.5" ry="7.5" cy="-3" fill="#7A0022" opacity="0.21"/></g>
                    </g>

                    {/* ─ Tiny cluster y≈840 ─ */}
                    <g transform="translate(40, 840)">
                        <g transform="rotate(-36)"><ellipse rx="2.5" ry="7" cy="-3" fill="#7A0022" opacity="0.22"/></g>
                        <g transform="rotate(36)"><ellipse rx="2.5" ry="7" cy="-3" fill="#7A0022" opacity="0.18"/></g>
                        <circle r="1.5" fill="#7A0022" opacity="0.36"/>
                    </g>

                    {/* ─ Scatter accent dots ─ */}
                    <circle cx="24" cy="72" r="1.2" fill="#7A0022" opacity="0.28"/>
                    <circle cx="72" cy="152" r="1" fill="#7A0022" opacity="0.22"/>
                    <circle cx="10" cy="258" r="1.1" fill="#7A0022" opacity="0.26"/>
                    <circle cx="78" cy="360" r="1" fill="#7A0022" opacity="0.20"/>
                    <circle cx="6" cy="458" r="1.1" fill="#7A0022" opacity="0.24"/>
                    <circle cx="76" cy="542" r="1" fill="#7A0022" opacity="0.19"/>
                    <circle cx="4" cy="688" r="1" fill="#7A0022" opacity="0.18"/>
                    <circle cx="70" cy="794" r="1" fill="#7A0022" opacity="0.16"/>
                </g>

                {/* ── RIGHT VINE (mirror of left) ──────────────────── */}
                <g transform="translate(680, 0) scale(-1, 1)" opacity="0.54">
                    <path
                        d="M 48 0 C 24 95 74 195 42 305 C 14 415 70 515 36 635 C 10 755 58 840 42 900"
                        stroke="#7A0022" strokeWidth="1.5" fill="none" strokeLinecap="round"
                    />
                    <g transform="translate(44, 36)">
                        <ellipse rx="5" ry="7.5" cy="-4" fill="#7A0022" opacity="0.48"/>
                        <ellipse rx="4" ry="6.5" cy="-4" fill="#7A0022" opacity="0.43" transform="rotate(55)"/>
                        <ellipse rx="4" ry="6.5" cy="-4" fill="#7A0022" opacity="0.43" transform="rotate(-55)"/>
                        <circle r="2.5" fill="#7A0022" opacity="0.80"/>
                        <circle r="1.3" fill="#B0103E" opacity="0.95"/>
                    </g>
                    <path d="M 47 110 C 55 107 62 107 68 105" stroke="#7A0022" strokeWidth="0.6" fill="none" strokeLinecap="round" opacity="0.36"/>
                    <g transform="translate(68, 105)">
                        <g transform="rotate(-52)"><ellipse rx="3.5" ry="10.5" cy="-5" fill="#7A0022" opacity="0.40"/></g>
                        <g transform="rotate(-74)"><ellipse rx="3" ry="8.5" cy="-4" fill="#7A0022" opacity="0.32"/></g>
                    </g>
                    <path d="M 45 199 C 36 196 27 196 20 200" stroke="#7A0022" strokeWidth="0.6" fill="none" strokeLinecap="round" opacity="0.33"/>
                    <g transform="translate(20, 200)">
                        <g transform="rotate(54)"><ellipse rx="3.5" ry="10" cy="-5" fill="#7A0022" opacity="0.38"/></g>
                        <g transform="rotate(76)"><ellipse rx="3" ry="8.5" cy="-4" fill="#7A0022" opacity="0.30"/></g>
                    </g>
                    <path d="M 44 306 C 40 303 36 303 32 306" stroke="#7A0022" strokeWidth="0.6" fill="none" strokeLinecap="round" opacity="0.35"/>
                    <g transform="translate(32, 306)">
                        <ellipse rx="2.8" ry="5.8" cy="-3" fill="#7A0022" opacity="0.38"/>
                        <ellipse rx="2.8" ry="5.8" cy="-3" fill="#7A0022" opacity="0.34" transform="rotate(72)"/>
                        <ellipse rx="2.8" ry="5.8" cy="-3" fill="#7A0022" opacity="0.34" transform="rotate(144)"/>
                        <ellipse rx="2.8" ry="5.8" cy="-3" fill="#7A0022" opacity="0.34" transform="rotate(216)"/>
                        <ellipse rx="2.8" ry="5.8" cy="-3" fill="#7A0022" opacity="0.34" transform="rotate(288)"/>
                        <circle r="2" fill="#7A0022" opacity="0.72"/>
                        <circle r="1" fill="#B0103E" opacity="0.88"/>
                    </g>
                    <path d="M 46 400 C 55 397 62 397 68 395" stroke="#7A0022" strokeWidth="0.55" fill="none" strokeLinecap="round" opacity="0.31"/>
                    <g transform="translate(68, 395)">
                        <g transform="rotate(-46)"><ellipse rx="3.5" ry="10.5" cy="-5" fill="#7A0022" opacity="0.33"/></g>
                        <g transform="rotate(-68)"><ellipse rx="3" ry="8.5" cy="-4" fill="#7A0022" opacity="0.25"/></g>
                    </g>
                    <path d="M 42 496 C 32 492 22 492 16 496" stroke="#7A0022" strokeWidth="0.55" fill="none" strokeLinecap="round" opacity="0.29"/>
                    <g transform="translate(16, 496)">
                        <g transform="rotate(56)"><ellipse rx="3.5" ry="10" cy="-5" fill="#7A0022" opacity="0.31"/></g>
                        <g transform="rotate(80)"><ellipse rx="3" ry="8" cy="-4" fill="#7A0022" opacity="0.24"/></g>
                    </g>
                    <path d="M 37 632 C 26 628 18 628 12 632" stroke="#7A0022" strokeWidth="0.5" fill="none" strokeLinecap="round" opacity="0.25"/>
                    <g transform="translate(12, 632)">
                        <g transform="rotate(54)"><ellipse rx="3" ry="9" cy="-4" fill="#7A0022" opacity="0.27"/></g>
                        <g transform="rotate(32)"><ellipse rx="2.5" ry="7.5" cy="-3" fill="#7A0022" opacity="0.21"/></g>
                    </g>
                    <path d="M 38 736 C 48 732 56 732 62 730" stroke="#7A0022" strokeWidth="0.5" fill="none" strokeLinecap="round" opacity="0.23"/>
                    <g transform="translate(62, 730)">
                        <g transform="rotate(-50)"><ellipse rx="3" ry="9" cy="-4" fill="#7A0022" opacity="0.24"/></g>
                        <g transform="rotate(-72)"><ellipse rx="2.5" ry="7.5" cy="-3" fill="#7A0022" opacity="0.19"/></g>
                    </g>
                    <circle cx="24" cy="72" r="1.2" fill="#7A0022" opacity="0.24"/>
                    <circle cx="72" cy="152" r="1" fill="#7A0022" opacity="0.19"/>
                    <circle cx="10" cy="258" r="1.1" fill="#7A0022" opacity="0.22"/>
                    <circle cx="78" cy="360" r="1" fill="#7A0022" opacity="0.18"/>
                    <circle cx="6" cy="458" r="1.1" fill="#7A0022" opacity="0.21"/>
                </g>
            </svg>
        </div>
    );
}
