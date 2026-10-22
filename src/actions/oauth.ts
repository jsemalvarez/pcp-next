"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/server/auth/require-admin";
import {
  buildRedirect,
  createAuthorizationCode,
  validateAuthorizeRequest,
} from "@/server/oauth/oauth.service";

/**
 * Respuesta de la pantalla de consentimiento de /oauth/authorize.
 * Se vuelve a validar todo: el formulario solo trae la query original.
 */

export async function approveAuthorization(formData: FormData) {
  const session = await requireAdmin();
  const request = await validateAuthorizeRequest(new URLSearchParams(String(formData.get("query") ?? "")));
  const code = await createAuthorizationCode(request, session.userId);
  redirect(buildRedirect(request.redirectUri, { code, state: request.state }));
}

export async function denyAuthorization(formData: FormData) {
  await requireAdmin();
  const request = await validateAuthorizeRequest(new URLSearchParams(String(formData.get("query") ?? "")));
  redirect(buildRedirect(request.redirectUri, { error: "access_denied", state: request.state }));
}
