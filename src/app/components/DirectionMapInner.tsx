"use client";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { supabase } from "@/lib/supabase";
import type { Waypoint } from "@/src/app/admin/route/RouteEditor";
import { buildRemarkIcon } from "@/src/app/components/buildRemarkIcon";

// @ts-expect-error – private property
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const DEFAULT_CENTER: [number, number] = [2.96425, 101.63183];

function interpolate(pts: Waypoint[], steps = 40): [number, number][] {
    const out: [number, number][] = [];
    for (let i = 0; i < pts.length - 1; i++) {
        const { lat: lat1, lng: lng1 } = pts[i];
        const { lat: lat2, lng: lng2 } = pts[i + 1];
        for (let s = i === 0 ? 0 : 1; s <= steps; s++) {
            const t = s / steps;
            out.push([lat1 + (lat2 - lat1) * t, lng1 + (lng2 - lng1) * t]);
        }
    }
    return out;
}

// Remark labels shown after animation completes
function RemarkMarkers({ waypoints }: { waypoints: Waypoint[] }) {
    const map = useMap();
    const markersRef = useRef<L.Marker[]>([]);
    const compact = typeof window !== "undefined" && window.innerWidth < 640;

    useEffect(() => {
        markersRef.current.forEach(m => m.remove());
        markersRef.current = [];
        waypoints.forEach((pt, i) => {
            if (!pt.remark) return;
            const icon = buildRemarkIcon(pt, i, waypoints.length, false, compact);
            markersRef.current.push(L.marker([pt.lat, pt.lng], { icon }).addTo(map));
        });
        return () => { markersRef.current.forEach(m => m.remove()); };
    }, [map, waypoints]);

    return null;
}

// Animated circle + pulsing pin for the destination
function DestinationMarker({ pos }: { pos: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        const r = 38;
        const circ = 2 * Math.PI * r;
        const icon = L.divIcon({
            className: "",
            html: `
                <div style="position:relative;width:${r * 2 + 20}px;height:${r * 2 + 20}px;transform:translate(-50%,-50%)">
                    <svg width="${r * 2 + 20}" height="${r * 2 + 20}" style="position:absolute;inset:0;overflow:visible">
                        <circle cx="${r + 10}" cy="${r + 10}" r="${r}"
                            fill="rgba(122,0,34,0.07)" stroke="#7A0022" stroke-width="2.5"
                            stroke-dasharray="${circ}" stroke-dashoffset="${circ}" stroke-linecap="round"
                            style="animation:drawCircle 0.9s ease-out forwards"/>
                    </svg>
                    <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:${r * 2}px;height:${r * 2}px;border-radius:50%;border:1.5px solid #7A0022;animation:ping 1.8s ease-out 1s infinite;opacity:0"></div>
                    <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:13px;height:13px;border-radius:50%;background:#7A0022;box-shadow:0 0 0 3px rgba(122,0,34,0.25);animation:popIn 0.4s ease-out 0.2s both"></div>
                </div>`,
            iconSize: [0, 0],
        });
        const marker = L.marker(pos, { icon }).addTo(map);
        return () => { marker.remove(); };
    }, [map, pos]);
    return null;
}

function LockMap() {
    const map = useMap();
    useEffect(() => {
        map.dragging.disable();
        map.scrollWheelZoom.disable();
        map.doubleClickZoom.disable();
        map.touchZoom.disable();
        map.boxZoom.disable();
        map.keyboard.disable();
    }, [map]);
    return null;
}

function FitRoute({ route }: { route: Waypoint[] }) {
    const map = useMap();
    useEffect(() => {
        if (route.length < 2) return;
        try {
            const bounds = L.latLngBounds(route.map(p => L.latLng(p.lat, p.lng)));
            if (bounds.isValid()) map.fitBounds(bounds, { padding: [50, 50], maxZoom: 17 });
        } catch { /* ignore invalid bounds */ }
    }, [map, route]);
    return null;
}

export default function DirectionMapInner({ replayKey = 0, interactive = false }: { replayKey?: number; interactive?: boolean }) {
    const [route, setRoute] = useState<Waypoint[]>([]);
    const [visiblePoints, setVisiblePoints] = useState<[number, number][]>([]);
    const [showPin, setShowPin] = useState(false);
    const animRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        supabase
            .from("direction_route")
            .select("waypoints")
            .eq("id", 1)
            .single()
            .then(({ data }) => {
                if (data && data.waypoints?.length >= 2) {
                    const normalized: Waypoint[] = data.waypoints.map((p: unknown) =>
                        Array.isArray(p)
                            ? { lat: p[0], lng: p[1] }
                            : p as Waypoint
                    );
                    setRoute(normalized);
                }
            });
    }, []);

    useEffect(() => {
        if (route.length < 2) return;
        if (animRef.current) clearInterval(animRef.current);
        const all = interpolate(route, 40);
        let i = 0;
        const rafId = requestAnimationFrame(() => {
            setShowPin(false);
            setVisiblePoints([]);
            animRef.current = setInterval(() => {
                i += 3;
                setVisiblePoints(all.slice(0, Math.min(i, all.length)));
                if (i >= all.length) {
                    clearInterval(animRef.current!);
                    setTimeout(() => setShowPin(true), 200);
                }
            }, 30);
        });
        return () => {
            cancelAnimationFrame(rafId);
            if (animRef.current) clearInterval(animRef.current);
        };
    }, [route, replayKey]);

    const destination = route[route.length - 1];

    return (
        <>
            <style>{`
                @keyframes ping {
                    0%   { transform: translate(-50%,-50%) scale(1); opacity: 0.8; }
                    100% { transform: translate(-50%,-50%) scale(1.6); opacity: 0; }
                }
                @keyframes drawCircle { to { stroke-dashoffset: 0; } }
                @keyframes popIn {
                    0%   { transform: translate(-50%,-50%) scale(0); }
                    70%  { transform: translate(-50%,-50%) scale(1.2); }
                    100% { transform: translate(-50%,-50%) scale(1); }
                }
                @keyframes remarkPop {
                    0%   { opacity:0; transform: scale(0.5) translateY(10px); }
                    100% { opacity:1; transform: scale(1) translateY(0); }
                }
                @keyframes arrowBounce {
                    0%   { transform: translateY(0px); }
                    100% { transform: translateY(5px); }
                }
            `}</style>

            <MapContainer
                center={DEFAULT_CENTER}
                zoom={17}
                style={{ height: "380px", width: "100%" }}
                zoomControl={interactive}
                attributionControl={false}
            >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" detectRetina />
                {!interactive && <LockMap />}
                <FitRoute route={route} />
                {visiblePoints.length >= 2 && (
                    <Polyline
                        positions={visiblePoints}
                        pathOptions={{ color: "#7A0022", weight: 5, lineCap: "round", lineJoin: "round" }}
                    />
                )}
                {showPin && destination && (
                    <>
                        <DestinationMarker pos={[destination.lat, destination.lng]} />
                        <RemarkMarkers waypoints={route} />
                    </>
                )}
            </MapContainer>

            {route.length < 2 && (
                <p className="py-6 text-center text-sm text-zinc-400">No route set yet. Configure it in the admin panel.</p>
            )}
        </>
    );
}
