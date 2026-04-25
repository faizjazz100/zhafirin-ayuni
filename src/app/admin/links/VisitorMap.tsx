"use client";

import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";

type MapMarker = {
    lat: number;
    lng: number;
    label: string;
    device: string | null;
};

const DEVICE_ICON: Record<string, string> = {
    mobile: "📱",
    tablet: "📱",
    desktop: "🖥️",
};

export default function VisitorMap({ markers }: { markers: MapMarker[] }) {
    if (markers.length === 0) return null;

    return (
        <div className="overflow-hidden rounded-2xl border border-black/8" style={{ height: 280 }}>
            <MapContainer
                center={[20, 10]}
                zoom={2}
                style={{ height: "100%", width: "100%" }}
                scrollWheelZoom={false}
                attributionControl={false}
            >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {markers.map((m, i) => (
                    <CircleMarker
                        key={i}
                        center={[m.lat, m.lng]}
                        radius={7}
                        pathOptions={{ color: "#7A0022", fillColor: "#7A0022", fillOpacity: 0.75, weight: 1.5 }}
                    >
                        <Tooltip direction="top" offset={[0, -6]}>
                            <span>{DEVICE_ICON[m.device ?? "desktop"] ?? "🖥️"} {m.label}</span>
                        </Tooltip>
                    </CircleMarker>
                ))}
            </MapContainer>
        </div>
    );
}
