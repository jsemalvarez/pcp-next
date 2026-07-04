"use client";

import { useRef, useLayoutEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Map as MapIcon,
  Calendar,
  Newspaper,
  MapPin,
  Heart,
} from "lucide-react";

const PRIMARY = "#353865";
const ACCENT = "#e37b7c";
const NAV_H = 64;
const BR = 20;    // border-radius of the corners
const D = 28;     // notch depth (reduced from 32 to 28)
const w = 42;     // half-width of the notch (increased from 38 to 42)
const cp = 20;    // control point offset (adjusted from 18 to 20)

/** Generates path with a concave curved notch centered at X */
function buildPath(W: number, X: number): string {
  const x0 = X - w;
  const x1 = X - cp;
  const x2 = X;
  const x3 = X + cp;
  const x4 = X + w;

  return [
    `M ${BR},0`,
    `L ${Math.max(BR, x0)},0`,
    `C ${Math.max(BR, x1)},0 ${Math.max(BR, x1)},${D} ${x2},${D}`,
    `C ${Math.min(W - BR, x3)},${D} ${Math.min(W - BR, x3)},0 ${Math.min(W - BR, x4)},0`,
    `L ${W - BR},0`,
    `Q ${W},0 ${W},${BR}`,
    `L ${W},${NAV_H - BR}`,
    `Q ${W},${NAV_H} ${W - BR},${NAV_H}`,
    `L ${BR},${NAV_H}`,
    `Q 0,${NAV_H} 0,${NAV_H - BR}`,
    `L 0,${BR}`,
    `Q 0,0 ${BR},0 Z`
  ].join(" ");
}

/** Rectangular flat path with identical command structure to buildPath for smooth morphing */
function buildSolidPath(W: number): string {
  const X = W / 2;
  const x0 = X - w;
  const x1 = X - cp;
  const x2 = X;
  const x3 = X + cp;
  const x4 = X + w;

  return [
    `M ${BR},0`,
    `L ${Math.max(BR, x0)},0`,
    `C ${Math.max(BR, x1)},0 ${Math.max(BR, x1)},0 ${x2},0`,
    `C ${Math.min(W - BR, x3)},0 ${Math.min(W - BR, x3)},0 ${Math.min(W - BR, x4)},0`,
    `L ${W - BR},0`,
    `Q ${W},0 ${W},${BR}`,
    `L ${W},${NAV_H - BR}`,
    `Q ${W},${NAV_H} ${W - BR},${NAV_H}`,
    `L ${BR},${NAV_H}`,
    `Q 0,${NAV_H} 0,${NAV_H - BR}`,
    `L 0,${BR}`,
    `Q 0,0 ${BR},0 Z`
  ].join(" ");
}

export default function BottomNav() {
  const pathname  = usePathname();
  const navRef    = useRef<HTMLDivElement>(null);
  const [navWidth, setNavWidth] = useState(328);

  useLayoutEffect(() => {
    const el = navRef.current;
    if (!el) return;
    const update = () => setNavWidth(el.offsetWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const publicNavItems = [
    { name: "Inicio",    href: "/",          icon: Home      },
    { name: "Noticias",  href: "/noticias",  icon: Newspaper },
    { name: "Eventos",   href: "/calendario",icon: Calendar  },
    { name: "Mapa",      href: "/map",       icon: MapIcon   },
    { name: "Favoritos", href: "/favorites", icon: Heart     },
  ];

  const adminNavItems = [
    { name: "Panel",    href: "/admin/dashboard", icon: Home   },
    { name: "Lugares",  href: "/admin/lugares",   icon: MapPin },
    { name: "Eventos",  href: "/admin/eventos",   icon: Calendar },
  ];

  if (pathname === "/admin/login") return null;

  const isAdminRoute = pathname.startsWith("/admin");
  const navItems     = isAdminRoute ? adminNavItems : publicNavItems;

  const activeIndex = navItems.findIndex((item) => item.href === pathname);
  const xPos = activeIndex >= 0
    ? ((activeIndex + 0.5) / navItems.length) * navWidth
    : -999;

  const svgD = activeIndex >= 0
    ? buildPath(navWidth, xPos)
    : buildSolidPath(navWidth);

  return (
    <>
      <style>{`
        @keyframes magic-bounce {
          0%   { transform: translate(-50%, 0)    scale(0.7);  opacity: 0; }
          60%  { transform: translate(-50%, -50%) scale(1.12); opacity: 1; }
          80%  { transform: translate(-50%, -46%) scale(0.95); }
          100% { transform: translate(-50%, -50%) scale(1);    opacity: 1; }
        }
        @keyframes magic-label-in {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
      `}</style>

      {/* Spacing spacer */}
      <div style={{ height: `${NAV_H + 32}px` }} className="md:hidden" aria-hidden="true" />

      {/* Floating navbar container */}
      <div
        ref={navRef}
        className="md:hidden fixed z-50"
        style={{
          bottom: "16px",
          left: "16px",
          right: "16px",
          height: `${NAV_H}px`,
        }}
      >
        {/* SVG background shape that curves around the active tab */}
        <svg
          aria-hidden="true"
          viewBox={`0 0 ${navWidth} ${NAV_H}`}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            overflow: "visible",
            filter: "drop-shadow(0 8px 24px rgba(53,56,101,0.35))",
          }}
        >
          <path
            d={svgD}
            fill={PRIMARY}
            style={{
              transition: "d 0.3s cubic-bezier(0.25, 1, 0.5, 1)",
            }}
          />
        </svg>

        {/* Navigation Items (Layered above the background path) */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
            height: "100%",
          }}
        >
          {navItems.map((item) => {
            const Icon     = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                style={{
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  flex: 1,
                  height: "100%",
                  textDecoration: "none",
                  WebkitTapHighlightColor: "transparent",
                  gap: isActive ? "0px" : "4px",
                }}
              >
                {isActive ? (
                  <>
                    {/* Active Floating Circle Button (fitted into the cutout notch) */}
                    <span
                      aria-hidden="true"
                      style={{
                        position: "absolute",
                        top: "-2px",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: "48px",
                        height: "48px",
                        borderRadius: "50%",
                        background: ACCENT,
                        boxShadow: "0 6px 16px rgba(227,123,124,0.5)",
                        animation: "magic-bounce 0.45s cubic-bezier(0.34,1.56,0.64,1) forwards",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 10,
                      }}
                    >
                      <Icon size={20} strokeWidth={2.5} color="#ffffff" />
                    </span>

                    {/* Active Label */}
                    <span
                      style={{
                        position: "absolute",
                        bottom: "8px",
                        fontSize: "9px",
                        fontWeight: 700,
                        letterSpacing: "0.05em",
                        color: "#ffffff",
                        animation: "magic-label-in 0.3s ease 0.15s both",
                        fontFamily: "var(--font-nunito, sans-serif)",
                      }}
                    >
                      {item.name}
                    </span>
                  </>
                ) : (
                  <>
                    <Icon size={20} strokeWidth={2} color={ACCENT} style={{ opacity: 0.75 }} />
                    <span
                      style={{
                        fontSize: "9px",
                        fontWeight: 600,
                        letterSpacing: "0.04em",
                        color: ACCENT,
                        opacity: 0.65,
                        fontFamily: "var(--font-nunito, sans-serif)",
                      }}
                    >
                      {item.name}
                    </span>
                  </>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
