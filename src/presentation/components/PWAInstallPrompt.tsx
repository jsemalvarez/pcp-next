"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// El Web Component usa APIs del navegador (window, navigator), por lo tanto
// debe renderizarse exclusivamente en el cliente, sin SSR.
const PWAInstallInner = dynamic(
  () => import("./_PWAInstallInner"),
  { ssr: false }
);

export function PWAInstallPrompt() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const hasTouch = window.matchMedia("(pointer: coarse)").matches;
      const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(hasTouch || isMobileUA);
    };

    checkMobile();
  }, []);

  if (!isMobile) {
    return null;
  }

  return <PWAInstallInner />;
}
