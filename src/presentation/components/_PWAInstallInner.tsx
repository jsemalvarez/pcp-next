"use client";

import PWAInstall from "@khmyznikov/pwa-install/dist/react-legacy/pwa-install.react-legacy.js";

export default function PWAInstallInner() {
  return (
    <PWAInstall
      manifestUrl="/manifest.json"
      name="Paseos con Peques"
      description="Guía interactiva de paseos y eventos para disfrutar con niños."
      icon="/favicon.svg"
      installDescription="Instalá la app para acceso rápido sin el navegador"
      disableScreenshots
    />
  );
}
