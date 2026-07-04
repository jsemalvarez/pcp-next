"use client";

import { usePWAInstall } from "@/presentation/hooks/usePWAInstall";

// ── Android: banner que dispara el Richer Install UI nativo de Chrome ─────────

function AndroidInstallBanner({
  onInstall,
  onDismiss,
}: {
  onInstall: () => void;
  onDismiss: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-label="Instalar aplicación"
      style={{
        position: "fixed",
        bottom: "80px", // encima del BottomNav
        left: "12px",
        right: "12px",
        zIndex: 9999,
        background: "#ffffff",
        borderRadius: "16px",
        boxShadow:
          "0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(249,115,22,0.10)",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        animation: "pwa-slide-up 0.35s cubic-bezier(0.34,1.56,0.64,1)",
        border: "1px solid #fed7aa",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/icons/android-chrome-192x192.png"
          alt="Paseos con Peques"
          width={48}
          height={48}
          style={{ borderRadius: "12px", flexShrink: 0 }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              margin: 0,
              fontWeight: 700,
              fontSize: "15px",
              color: "#1c1917",
              fontFamily: "var(--font-nunito, sans-serif)",
            }}
          >
            Paseos con Peques
          </p>
          <p
            style={{
              margin: 0,
              fontSize: "12px",
              color: "#78716c",
              fontFamily: "var(--font-nunito, sans-serif)",
            }}
          >
            Agregá la app a tu pantalla de inicio
          </p>
        </div>
        <button
          onClick={onDismiss}
          aria-label="Cerrar"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "4px",
            color: "#a8a29e",
            fontSize: "20px",
            lineHeight: 1,
            flexShrink: 0,
          }}
        >
          ✕
        </button>
      </div>

      {/* Descripción */}
      <p
        style={{
          margin: 0,
          fontSize: "13px",
          color: "#57534e",
          lineHeight: 1.5,
          fontFamily: "var(--font-nunito, sans-serif)",
        }}
      >
        Accedé rápido a paseos, eventos y lugares para disfrutar con los peques
        — sin abrir el navegador.
      </p>

      {/* Botones */}
      <div style={{ display: "flex", gap: "8px" }}>
        <button
          onClick={onDismiss}
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "10px",
            border: "1px solid #e7e5e4",
            background: "transparent",
            color: "#78716c",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "var(--font-nunito, sans-serif)",
          }}
        >
          Ahora no
        </button>
        <button
          onClick={onInstall}
          style={{
            flex: 2,
            padding: "10px",
            borderRadius: "10px",
            border: "none",
            background: "linear-gradient(135deg, #f97316, #ea580c)",
            color: "#ffffff",
            fontSize: "14px",
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "var(--font-nunito, sans-serif)",
            boxShadow: "0 2px 8px rgba(249,115,22,0.35)",
          }}
        >
          📲 Instalar app
        </button>
      </div>

      <style>{`
        @keyframes pwa-slide-up {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ── iOS: modal con instrucciones para "Agregar a pantalla de inicio" ──────────

function IOSInstallModal({ onDismiss }: { onDismiss: () => void }) {
  return (
    <>
      {/* Overlay */}
      <div
        onClick={onDismiss}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9998,
          background: "rgba(0,0,0,0.4)",
          animation: "pwa-fade-in 0.2s ease",
        }}
      />

      {/* Bottom sheet */}
      <div
        role="dialog"
        aria-label="Cómo instalar la app en iOS"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          background: "#ffffff",
          borderRadius: "20px 20px 0 0",
          boxShadow: "0 -4px 32px rgba(0,0,0,0.15)",
          padding: "24px 20px 40px",
          animation: "pwa-slide-up 0.35s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        {/* Handle */}
        <div
          style={{
            width: "40px",
            height: "4px",
            borderRadius: "2px",
            background: "#e7e5e4",
            margin: "0 auto 20px",
          }}
        />

        {/* Encabezado */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "20px",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icons/apple-touch-icon.png"
            alt="Paseos con Peques"
            width={52}
            height={52}
            style={{ borderRadius: "12px", flexShrink: 0 }}
          />
          <div>
            <p
              style={{
                margin: 0,
                fontWeight: 800,
                fontSize: "16px",
                color: "#1c1917",
                fontFamily: "var(--font-nunito, sans-serif)",
              }}
            >
              Instalá la app
            </p>
            <p
              style={{
                margin: 0,
                fontSize: "13px",
                color: "#78716c",
                fontFamily: "var(--font-nunito, sans-serif)",
              }}
            >
              Paseos con Peques
            </p>
          </div>
          <button
            onClick={onDismiss}
            aria-label="Cerrar"
            style={{
              marginLeft: "auto",
              background: "#f5f5f4",
              border: "none",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              cursor: "pointer",
              fontSize: "16px",
              color: "#78716c",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>
        </div>

        {/* Pasos */}
        {[
          {
            icon: "⬆️",
            text: (
              <>
                Tocá el ícono de{" "}
                <strong style={{ color: "#3b82f6" }}>Compartir</strong>{" "}
                (cuadrado con flecha) en la barra de Safari
              </>
            ),
          },
          {
            icon: "➕",
            text: (
              <>
                Seleccioná{" "}
                <strong style={{ color: "#f97316" }}>
                  &ldquo;Agregar a pantalla de inicio&rdquo;
                </strong>
              </>
            ),
          },
          {
            icon: "✅",
            text: (
              <>
                Tocá <strong>Agregar</strong> — el ícono aparecerá en tu
                pantalla de inicio
              </>
            ),
          },
        ].map((step, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "14px",
              padding: "12px 0",
              borderBottom: i < 2 ? "1px solid #f5f5f4" : "none",
            }}
          >
            <span
              style={{
                fontSize: "22px",
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#fff7ed",
                borderRadius: "10px",
                flexShrink: 0,
              }}
            >
              {step.icon}
            </span>
            <p
              style={{
                margin: 0,
                fontSize: "14px",
                color: "#44403c",
                lineHeight: 1.5,
                paddingTop: "6px",
                fontFamily: "var(--font-nunito, sans-serif)",
              }}
            >
              {step.text}
            </p>
          </div>
        ))}

        <style>{`
          @keyframes pwa-slide-up {
            from { opacity: 0; transform: translateY(24px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes pwa-fade-in {
            from { opacity: 0; }
            to   { opacity: 1; }
          }
        `}</style>
      </div>
    </>
  );
}

// ── Componente principal ───────────────────────────────────────────────────────

export function PWAInstallPrompt() {
  const { canInstall, isIOS, isInstalled, showBanner, promptInstall, dismissBanner } =
    usePWAInstall();

  // No mostrar si ya está instalada o no hay nada que mostrar
  if (isInstalled || !showBanner) return null;

  if (canInstall) {
    return (
      <AndroidInstallBanner onInstall={promptInstall} onDismiss={dismissBanner} />
    );
  }

  if (isIOS) {
    return <IOSInstallModal onDismiss={dismissBanner} />;
  }

  return null;
}

