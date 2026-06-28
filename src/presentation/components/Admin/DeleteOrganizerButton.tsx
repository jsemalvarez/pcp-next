"use client";

import { Trash2 } from "lucide-react";
import { deleteOrganizer } from "@/actions/organizers";
import { useState } from "react";

export function DeleteOrganizerButton({ id, name }: { id: string; name: string }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (
      window.confirm(
        `¿Estás seguro de que deseas eliminar a "${name}"? Esta acción no se puede deshacer.`
      )
    ) {
      setIsDeleting(true);
      const result = await deleteOrganizer(id);
      if (!result.success) {
        alert(result.error || "Hubo un error al eliminar el organizador/artista.");
        setIsDeleting(false);
      }
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
      title="Eliminar"
    >
      <Trash2 className={`w-4 h-4 ${isDeleting ? "animate-pulse" : ""}`} />
    </button>
  );
}
