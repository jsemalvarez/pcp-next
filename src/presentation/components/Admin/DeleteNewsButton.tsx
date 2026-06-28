"use client";

import { Trash2 } from "lucide-react";
import { deleteNews } from "@/actions/news";
import { useState } from "react";

export function DeleteNewsButton({ id, title }: { id: string; title: string }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (
      window.confirm(
        `¿Estás seguro de que deseas eliminar la noticia "${title}"? Esta acción no se puede deshacer.`
      )
    ) {
      setIsDeleting(true);
      const result = await deleteNews(id);
      if (!result.success) {
        alert(result.error || "Hubo un error al eliminar la noticia.");
        setIsDeleting(false);
      }
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
      title="Eliminar Noticia"
    >
      <Trash2 className={`w-4 h-4 ${isDeleting ? "animate-pulse" : ""}`} />
    </button>
  );
}
