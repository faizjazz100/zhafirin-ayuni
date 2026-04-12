import L from "leaflet";
import type { Waypoint } from "@/src/app/admin/route/RouteEditor";

// Fixed container — dot always at center, bubble overflows based on side
const CW = 220;
const CH = 220;

// SVG triangle pointing UP by default — rotated to face the dot
function arrowSvg(color: string, rotateDeg: number, compact: boolean): string {
    const w = compact ? 7 : 10;
    const h = compact ? 6 : 8;
    return `<div style="display:flex;align-items:center;justify-content:center;flex-shrink:0;width:${w}px;height:${h}px;">
        <svg width="${w}" height="${h}" viewBox="0 0 10 8" style="display:block;transform:rotate(${rotateDeg}deg);transform-origin:center;" xmlns="http://www.w3.org/2000/svg">
            <polygon points="5,0 10,8 0,8" fill="${color}"/>
        </svg>
    </div>`;
}

export function buildRemarkIcon(pt: Waypoint, index: number, total: number, showDot = true, compact = false): L.DivIcon {
    const DOT = compact ? 20 : 26;
    const GAP = 2;
    const isLast = index === total - 1;
    const color = isLast ? "#7A0022" : "#1c1917";
    const side = pt.remarkSide ?? "top";
    const O = DOT / 2 + GAP; // distance from center to arrow tip

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

    const bubble = `<div style="
        background:${color};color:#fff;
        font-size:${compact ? "9px" : "12px"};font-weight:700;letter-spacing:0.01em;
        padding:${compact ? "3px 8px" : "6px 13px"};border-radius:${compact ? "10px" : "16px"};
        max-width:${compact ? "80px" : "120px"};text-align:center;line-height:1.4;
        box-shadow:0 4px 14px rgba(0,0,0,0.22);
        animation:remarkPop 0.5s cubic-bezier(0.34,1.56,0.64,1) both;
    ">${pt.remark.replace(/\n/g, "<br>")}</div>`;

    // arrowRot: angle so the SVG triangle (tip-up) points TOWARD the dot
    // 0=up, 90=right, 180=down, 270=left
    type Cfg = {
        arrowRot: number;
        pos: string;       // CSS absolute positioning
        flex: string;      // flex-direction
        align: string;     // align-items
        arrowFirst: boolean; // true = arrow before bubble in DOM order
    };

    // Use `translate` (separate CSS property) for centering so it doesn't
    // conflict with `transform` used by the arrowBounce animation.
    const configs: Record<string, Cfg> = {
        "top":          { arrowRot: 180, pos: `bottom:calc(50% + ${O}px);left:50%;translate:-50% 0;`,   flex: "column",         align: "center",     arrowFirst: false },
        "top-right":    { arrowRot: 225, pos: `bottom:calc(50% + ${O}px);left:calc(50% + ${O}px);`,     flex: "column",         align: "flex-start", arrowFirst: false },
        "right":        { arrowRot: 270, pos: `top:50%;left:calc(50% + ${O}px);translate:0 -50%;`,      flex: "row",            align: "center",     arrowFirst: true  },
        "bottom-right": { arrowRot: 315, pos: `top:calc(50% + ${O}px);left:calc(50% + ${O}px);`,        flex: "column-reverse", align: "flex-start", arrowFirst: false },
        "bottom":       { arrowRot: 0,   pos: `top:calc(50% + ${O}px);left:50%;translate:-50% 0;`,      flex: "column-reverse", align: "center",     arrowFirst: false },
        "bottom-left":  { arrowRot: 45,  pos: `top:calc(50% + ${O}px);right:calc(50% + ${O}px);`,       flex: "column-reverse", align: "flex-end",   arrowFirst: false },
        "left":         { arrowRot: 90,  pos: `top:50%;right:calc(50% + ${O}px);translate:0 -50%;`,     flex: "row",            align: "center",     arrowFirst: false },
        "top-left":     { arrowRot: 135, pos: `bottom:calc(50% + ${O}px);right:calc(50% + ${O}px);`,    flex: "column",         align: "flex-end",   arrowFirst: false },
    };

    const cfg = configs[side] ?? configs["top"];
    const arrow = arrowSvg(color, cfg.arrowRot, compact);
    const items = cfg.arrowFirst ? `${arrow}${bubble}` : `${bubble}${arrow}`;

    const bubbleHtml = `
        <div style="position:absolute;${cfg.pos}display:flex;flex-direction:${cfg.flex};align-items:${cfg.align};gap:0;animation:arrowBounce 0.7s ease-in-out infinite alternate;">
            ${items}
        </div>`;

    return L.divIcon({
        className: "",
        html: `<div style="position:relative;width:${CW}px;height:${CH}px;">${dotHtml}${bubbleHtml}</div>`,
        iconSize: [CW, CH],
        iconAnchor: [CW / 2, CH / 2],
    });
}
