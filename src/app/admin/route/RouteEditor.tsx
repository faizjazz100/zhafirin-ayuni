"use client";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Polyline, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
// @ts-expect-error – no types for CSS side-effect import
import "leaflet/dist/leaflet.css";
import { supabase } from "@/lib/supabase";
import { buildRemarkIcon } from "@/src/app/components/buildRemarkIcon";

// @ts-expect-error – private property
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export type RemarkSide = "top" | "bottom" | "left" | "right";
export type Waypoint = { lat: number; lng: number; remark?: string; remarkSide?: RemarkSide };

const DEFAULT_CENTER: [number, number] = [2.96425, 101.63183];

const SIDE_BUTTONS: { side: RemarkSide; label: string }[] = [
    { side: "top", label: "↑" },
    { side: "bottom", label: "↓" },
    { side: "left", label: "←" },
    { side: "right", label: "→" },
];

function WaypointMarkers({ points }: { points: Waypoint[] }) {
    const map = useMap();
    const markersRef = useRef<L.Marker[]>([]);

    useEffect(() => {
        markersRef.current.forEach(m => m.remove());
        markersRef.current = [];
        points.forEach((pt, i) => {
            const icon = buildRemarkIcon(pt, i, points.length);
            markersRef.current.push(L.marker([pt.lat, pt.lng], { icon }).addTo(map));
        });
        return () => { markersRef.current.forEach(m => m.remove()); };
    }, [map, points]);

    return null;
}

function FitRoute({ points }: { points: Waypoint[] }) {
    const map = useMap();
    useEffect(() => {
        if (points.length < 2) return;
        try {
            const bounds = L.latLngBounds(points.map(p => L.latLng(p.lat, p.lng)));
            if (bounds.isValid()) map.fitBounds(bounds, { padding: [60, 60] });
        } catch { /* ignore */ }
    }, [map, points]);
    return null;
}

function EnableDraw({ onAdd }: { onAdd: (pt: Waypoint) => void }) {
    const map = useMap();
    useEffect(() => {
        map.dragging.enable();
        map.scrollWheelZoom.enable();
        map.touchZoom.enable();
        map.keyboard.enable();
        map.doubleClickZoom.disable();
        map.getContainer().style.cursor = "crosshair";
        return () => { map.getContainer().style.cursor = ""; };
    }, [map]);
    useMapEvents({ click(e) { onAdd({ lat: e.latlng.lat, lng: e.latlng.lng }); } });
    return null;
}

export default function RouteEditor() {
    const [points, setPoints] = useState<Waypoint[]>([]);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [loadError, setLoadError] = useState(false);

    useEffect(() => {
        supabase
            .from("direction_route")
            .select("waypoints")
            .eq("id", 1)
            .single()
            .then(({ data, error }) => {
                if (error) { setLoadError(true); return; }
                if (data && data.waypoints?.length >= 2) {
                    const normalized: Waypoint[] = data.waypoints.map((p: unknown) =>
                        Array.isArray(p) ? { lat: p[0], lng: p[1] } : p as Waypoint
                    );
                    setPoints(normalized);
                }
            });
    }, []);

    const undo = () => { setSaved(false); setPoints(p => p.slice(0, -1)); };
    const clear = () => { setSaved(false); setPoints([]); };

    const update = (i: number, patch: Partial<Waypoint>) => {
        setPoints(p => p.map((pt, idx) => idx === i ? { ...pt, ...patch } : pt));
        setSaved(false);
    };

    const save = async () => {
        if (points.length < 2) return;
        setSaving(true);
        const { error } = await supabase
            .from("direction_route")
            .upsert({ id: 1, waypoints: points, updated_at: new Date().toISOString() });
        setSaving(false);
        if (!error) { setSaved(true); setTimeout(() => setSaved(false), 3000); }
    };

    return (
        <>
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-2 border-b border-black/10 px-4 py-3">
                <span className="mr-auto text-sm font-medium text-zinc-700">
                    {points.length === 0
                        ? "Click on the map to start placing points"
                        : `${points.length} point${points.length !== 1 ? "s" : ""} — last point is the destination`}
                </span>
                <button onClick={undo} disabled={points.length === 0}
                    className="rounded-full border border-black/10 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 disabled:opacity-40">
                    ↩ Undo
                </button>
                <button onClick={clear} disabled={points.length === 0}
                    className="rounded-full border border-black/10 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 disabled:opacity-40">
                    🗑 Clear
                </button>
                <button onClick={save} disabled={points.length < 2 || saving}
                    className="rounded-full bg-[#7A0022] px-4 py-1.5 text-xs font-medium text-white hover:bg-[#64001C] disabled:opacity-40">
                    {saving ? "Saving…" : saved ? "✓ Saved!" : "Save Route"}
                </button>
            </div>

            {loadError && <p className="px-4 py-2 text-xs text-red-500">Failed to load existing route.</p>}

            {/* Map */}
            <MapContainer
                center={DEFAULT_CENTER}
                zoom={17}
                style={{ height: "460px", width: "100%" }}
                zoomControl
                attributionControl={false}
            >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <EnableDraw onAdd={(pt) => { setSaved(false); setPoints(p => [...p, pt]); }} />
                <FitRoute points={points} />
                {points.length >= 2 && (
                    <Polyline
                        positions={points.map(p => [p.lat, p.lng] as [number, number])}
                        pathOptions={{ color: "#7A0022", weight: 4, dashArray: "8 6", lineCap: "round", lineJoin: "round" }}
                    />
                )}
                <WaypointMarkers points={points} />
            </MapContainer>

            {/* Remarks editor */}
            {points.length > 0 && (
                <div className="border-t border-black/10 px-4 py-4 space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Remarks (optional)</p>
                    {points.map((pt, i) => (
                        <div key={i} className="flex flex-col gap-2 rounded-xl border border-black/08 bg-zinc-50 p-3">
                            <div className="flex items-center gap-3">
                                {/* Point number */}
                                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-[#7A0022] bg-white text-[11px] font-bold text-[#7A0022]">
                                    {i + 1}
                                </div>
                                {/* Remark text */}
                                <input
                                    type="text"
                                    value={pt.remark ?? ""}
                                    onChange={e => update(i, { remark: e.target.value || undefined })}
                                    placeholder={i === points.length - 1 ? "e.g. Venue entrance" : "e.g. Turn left here"}
                                    maxLength={40}
                                    className="flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-zinc-400"
                                />
                            </div>

                            {/* Position picker — only shown when remark has text */}
                            {pt.remark && (
                                <div className="flex items-center gap-2 pl-9">
                                    <span className="text-xs text-zinc-400">Label position:</span>
                                    <div className="flex gap-1">
                                        {SIDE_BUTTONS.map(({ side, label }) => (
                                            <button
                                                key={side}
                                                onClick={() => update(i, { remarkSide: side })}
                                                className={[
                                                    "flex h-7 w-7 items-center justify-center rounded-lg border text-sm font-bold transition",
                                                    (pt.remarkSide ?? "top") === side
                                                        ? "border-[#7A0022] bg-[#7A0022] text-white"
                                                        : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-100",
                                                ].join(" ")}
                                            >
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}
