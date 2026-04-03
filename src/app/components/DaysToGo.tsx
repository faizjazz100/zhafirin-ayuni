"use client";

function useDaysToGo(dateLabel: string) {
    try {
        const d = new Date(dateLabel);
        if (Number.isNaN(d.getTime())) return null;
        const now = new Date();
        const diff = d.getTime() - now.getTime();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return Math.max(days, 0);
    } catch {
        return null;
    }
}

export default function DaysToGo({ date }: { date: string }) {
    const daysToGo = useDaysToGo(date);
    if (daysToGo == null) return null;
    return (
        <div className="mt-3 text-[12px] font-semibold uppercase tracking-[0.30em] text-zinc-600">
            {daysToGo} DAYS TO GO!
        </div>
    );
}