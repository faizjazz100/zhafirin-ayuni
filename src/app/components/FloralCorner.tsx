export default function FloralCorner({
    className = "",
}: {
    className?: string;
}) {
    return (
        <div
            className={`pointer-events-none absolute top-0 right-0 opacity-35 ${className}`}
            aria-hidden="true"
        >
            <svg
                width="90"
                height="90"
                viewBox="0 0 120 120"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-[#7A0022]"
            >
                {/* vine */}
                <path
                    d="M118 2C95 25 70 35 50 60C35 80 20 95 2 118"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                />

                <path d="M82 26C90 24 96 28 98 36C90 38 84 34 82 26Z" fill="currentColor" />
                <path d="M70 38C78 36 84 40 86 48C78 50 72 46 70 38Z" fill="currentColor" />
                <path d="M60 48C68 46 74 50 76 58C68 60 62 56 60 48Z" fill="currentColor" />
                <path d="M55 58C63 56 69 60 71 68C63 70 57 66 55 58Z" fill="currentColor" />
                <path d="M38 70C46 68 52 72 54 80C46 82 40 78 38 70Z" fill="currentColor" />
                <path d="M75 30C67 28 61 32 59 40C67 42 73 38 75 30Z" fill="currentColor" />
                <path d="M52 52C44 50 38 54 36 62C44 64 50 60 52 52Z" fill="currentColor" />

                <path d="M92 16C96 15 99 18 100 22C96 23 93 20 92 16Z" fill="currentColor" />
                <path d="M84 22C88 21 91 24 92 28C88 29 85 26 84 22Z" fill="currentColor" />
            </svg>
        </div>
    );
}