"use client";

import { useActionState } from "react";
import { loginAction } from "@/actions/auth";
import { Lock, Mail, ArrowRight } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null);

  return (
    <div className="min-h-dvh grid grid-rows-[1fr_2fr] md:grid-rows-1 md:grid-cols-[45%_1fr] bg-white overflow-hidden">

      {/* ── Panel izquierdo: ilustración ── */}
      <div className="relative w-full h-full overflow-hidden rounded-b-4xl">
        {/* Fondo degradado base */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary via-[#2a2d5e] to-brand-accent" />

        {/* Patrón de puntos decorativo */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Ilustración */}
        <div className="absolute inset-0 flex items-end justify-center">
          <Image
            src="/images/hero-bg.webp"
            alt="Paseos con Peques"
            fill
            className="object-cover object-center"
            priority
          />
        </div>

        {/* Overlay degradado inferior para texto legible */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-primary/80 via-transparent to-brand-primary/30" />

        {/* Badge superior */}
        <div className="absolute top-5 left-5 flex items-center gap-2 z-10">
          <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
            <span className="text-white font-black text-xs">P</span>
          </div>
          <span className="text-white font-black text-sm tracking-wide">Paseos con Peques</span>
        </div>

        {/* Texto inferior */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 z-10">
          <h2 className="text-white font-black text-2xl md:text-4xl leading-tight tracking-tight drop-shadow-lg">
            La guía cultural<br />
            <span className="text-brand-accent">para las familias</span>
          </h2>
          <p className="text-white/70 text-xs md:text-sm font-semibold mt-2 uppercase tracking-widest">
            Panel de administración
          </p>
        </div>

        {/* Círculos decorativos */}
        <div className="absolute top-1/4 right-[-40px] w-32 h-32 rounded-full border border-white/10" />
        <div className="absolute top-1/3 right-[-20px] w-20 h-20 rounded-full border border-white/10" />
      </div>

      {/* ── Panel derecho: formulario ── */}
      <div className="w-full h-full flex flex-col justify-center items-center px-6 bg-white overflow-hidden">
        <div className="w-full max-w-sm">

          {/* Encabezado */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
              Bienvenidos
            </h1>
            <p className="text-gray-400 text-sm font-medium mt-1">
              Ingresá tus credenciales para continuar
            </p>
          </div>

          {/* Separador decorativo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px flex-1 bg-gray-100" />
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-accent" />
              <div className="w-1.5 h-1.5 rounded-full bg-brand-primary/40" />
              <div className="w-1.5 h-1.5 rounded-full bg-brand-primary/20" />
            </div>
            <div className="h-px flex-1 bg-gray-100" />
          </div>

          {/* Formulario */}
          <form className="space-y-4" action={formAction}>

            {/* Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-xs font-bold text-gray-500 uppercase tracking-widest"
              >
                Correo electrónico
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-300 group-focus-within:text-brand-primary transition-colors" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 text-sm placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary/50 focus:bg-white transition-all"
                  placeholder="correo@gmail.com"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-xs font-bold text-gray-500 uppercase tracking-widest"
              >
                Contraseña
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-300 group-focus-within:text-brand-primary transition-colors" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 text-sm placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary/50 focus:bg-white transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Error */}
            {state?.error && (
              <div className="bg-red-50 border border-red-100 text-red-500 px-4 py-3 rounded-2xl text-sm font-bold animate-fade-in text-center">
                {state.error}
              </div>
            )}

            {/* Botón */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isPending}
                className="group w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl font-black text-sm text-white bg-brand-primary hover:bg-brand-primary/90 shadow-lg shadow-brand-primary/25 hover:shadow-brand-primary/40 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isPending ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Verificando...
                  </>
                ) : (
                  <>
                    Ingresar al panel
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
