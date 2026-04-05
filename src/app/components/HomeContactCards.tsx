"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type ContactItem = {
    name: string;
    phone: string;
    phoneE164: string;
};

const FALLBACK: ContactItem[] = [
    { name: "Mai (Groom's)", phone: "013-355 2455", phoneE164: "60133552455" },
    { name: "Elin (Groom's)", phone: "019-226 6996", phoneE164: "60192266996" },
    { name: "Darwish (Bride's)", phone: "012-846 2690", phoneE164: "60128462690" },
    { name: "En Firdaus (Bride's)", phone: "019-282 7625", phoneE164: "60192827625" },
];

export default function HomeContactCards() {
    const [contacts, setContacts] = useState<ContactItem[]>(FALLBACK);

    useEffect(() => {
        supabase
            .from("contacts")
            .select("name, phone_display, phone_e164")
            .order("display_order", { ascending: true })
            .then(({ data }) => {
                if (data && data.length > 0) {
                    setContacts(
                        data.map((r) => ({
                            name: r.name,
                            phone: r.phone_display,
                            phoneE164: r.phone_e164,
                        }))
                    );
                }
            });
    }, []);

    return (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {contacts.map((c) => (
                <div
                    key={c.name}
                    className="rounded-3xl border border-black/10 bg-white/75 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.06)]"
                >
                    <p className="text-xs font-semibold uppercase tracking-[0.30em] text-[#7A0022]/80">
                        {c.name}
                    </p>
                    <p className="mt-2 text-lg font-semibold text-zinc-900">{c.phone}</p>

                    <div className="mt-4 flex gap-3">
                        <a
                            className="inline-flex flex-1 items-center justify-center rounded-2xl bg-[#7A0022] px-4 py-2 text-sm text-white hover:opacity-90"
                            href={`tel:+${c.phoneE164}`}
                        >
                            Call
                        </a>
                        <a
                            className="inline-flex flex-1 items-center justify-center rounded-2xl border border-black/10 bg-white/90 px-4 py-2 text-sm text-zinc-900 hover:bg-white"
                            href={`https://wa.me/${c.phoneE164}`}
                            target="_blank"
                            rel="noreferrer"
                        >
                            WhatsApp
                        </a>
                    </div>
                </div>
            ))}
        </div>
    );
}
