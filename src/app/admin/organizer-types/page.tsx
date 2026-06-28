import React from "react";
import { getOrganizerTypes } from "@/actions/organizerTypes";
import { OrganizerTypesClient } from "@/presentation/components/Admin/OrganizerTypesClient";

export const dynamic = "force-dynamic";

export default async function AdminOrganizerTypesPage() {
  const initialTypes = await getOrganizerTypes();

  return <OrganizerTypesClient initialTypes={initialTypes} />;
}
