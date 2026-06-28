'use client';

import { deleteEvent } from "@/actions/events";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";

interface Props {
  id: string;
  title: string;
}

export function DeleteEventButton({ id, title }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`¿Seguro que querés eliminar "${title}" y todas sus fechas?`)) return;
    setLoading(true);
    const res = await deleteEvent(id);
    if (res.success) {
      router.refresh();
    } else {
      alert(res.error || 'Error al eliminar el evento');
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-40"
      title="Eliminar"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
