import L from "leaflet";
import type { Waypoint } from "@/src/app/admin/route/RouteEditor";

// Fixed container — dot always at center, bubble overflows based on side
const CW = 220;
const CH = 220;
const DOT = 26;
const GAP = 10;

export function buildRemarkIcon(pt: Waypoint, index: number, total: number, showDot = true): L.DivIcon {
    const isLast = index === total - 1;
    const color = isLast ? "#7A0022" : "#1c1917";
    const side = pt.remarkSide ?? "top";

    const dotHtml = showDot ? `
        <div style="
            position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
            width:${DOT}px;height:${DOT}px;border-radius:50%;
            background:${isLast ? "#7A0022" : "#fff"};
            color:${isLast ? "#fff" : "#7A0022"};
            font-size:12px;font-weight:700;
            display:flex;align-items:center;justify-content:center;
            border:2.5px solid #7A0022;
            box-shadow:0 2px 6px rgba(0,0,0,0.25);
            z-index:2;
        ">${index + 1}</div>` : "";

    if (!pt.remark) {
        return L.divIcon({
            className: "",
            html: `<div style="position:relative;width:${CW}px;height:${CH}px;">${dotHtml}</div>`,
            iconSize: [CW, CH],
            iconAnchor: [CW / 2, CH / 2],
        });
    }

    const bubble = `
        <div style="
            background:${color};color:#fff;
            font-size:12px;font-weight:700;letter-spacing:0.01em;
            padding:6px 13px;border-radius:99px;
            white-space:nowrap;
            box-shadow:0 4px 14px rgba(0,0,0,0.22);
            animation:remarkPop 0.5s cubic-bezier(0.34,1.56,0.64,1) both;
        ">${pt.remark}</div>`;

    // Arrow points toward the dot
    const arrowMap: Record<string, string> = { top: "↓", bottom: "↑", left: "→", right: "←" };
    const arrow = `<div style="font-size:16px;font-weight:900;color:${color};line-height:1;animation:arrowBounce 0.7s ease-in-out infinite alternate;">${arrowMap[side]}</div>`;

    let bubbleHtml = "";

    if (side === "top") {
        // Bubble above dot — anchor arrow to just above center
        bubbleHtml = `
            <div style="position:absolute;bottom:calc(50% + ${DOT / 2 + GAP}px);left:50%;
                transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:2px;">
                ${bubble}${arrow}
            </div>`;
    } else if (side === "bottom") {
        bubbleHtml = `
            <div style="position:absolute;top:calc(50% + ${DOT / 2 + GAP}px);left:50%;
                transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:2px;">
                ${arrow}${bubble}
            </div>`;
    } else if (side === "left") {
        bubbleHtml = `
            <div style="position:absolute;right:calc(50% + ${DOT / 2 + GAP}px);top:50%;
                transform:translateY(-50%);display:flex;flex-direction:row;align-items:center;gap:2px;">
                ${bubble}${arrow}
            </div>`;
    } else if (side === "right") {
        bubbleHtml = `
            <div style="position:absolute;left:calc(50% + ${DOT / 2 + GAP}px);top:50%;
                transform:translateY(-50%);display:flex;flex-direction:row;align-items:center;gap:2px;">
                ${arrow}${bubble}
            </div>`;
    }

    return L.divIcon({
        className: "",
        html: `<div style="position:relative;width:${CW}px;height:${CH}px;">${dotHtml}${bubbleHtml}</div>`,
        iconSize: [CW, CH],
        iconAnchor: [CW / 2, CH / 2],
    });
}
