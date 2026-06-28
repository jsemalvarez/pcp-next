"use client";

import React, { useState } from "react";
import { Plus, Edit2, Trash2, X, Check } from "lucide-react";
import Link from "next/link";
import {
  createOrganizerType,
  updateOrganizerType,
  deleteOrganizerType,
} from "@/actions/organizerTypes";

interface OrganizerType {
  id: string;
  name: string;
  slug: string;
}

interface Props {
  initialTypes: OrganizerType[];
}

export function OrganizerTypesClient({ initialTypes }: Props) {
  const [types, setTypes] = useState<OrganizerType[]>(initialTypes);
  const [nameInput, setNameInput] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNameInput, setEditNameInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const clearMessages = () => {
    setError(null);
    setSuccessMsg(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;

    setLoading(true);
    clearMessages();

    const res = await createOrganizerType(nameInput.trim());
    setLoading(false);

    if (res.success && res.data) {
      setTypes((prev) => [...prev, res.data as OrganizerType].sort((a, b) => a.name.localeCompare(b.name)));
      setNameInput("");
      setSuccessMsg("Especialidad creada correctamente.");
    } else {
      setError(res.error || "Error al crear la especialidad.");
    }
  };

  const handleStartEdit = (type: OrganizerType) => {
    setEditingId(type.id);
    setEditNameInput(type.name);
    clearMessages();
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditNameInput("");
  };

  const handleUpdate = async (id: string) => {
    if (!editNameInput.trim()) return;

    setLoading(true);
    clearMessages();

    const res = await updateOrganizerType(id, editNameInput.trim());
    setLoading(false);

    if (res.success && res.data) {
      setTypes((prev) =>
        prev
          .map((t) => (t.id === id ? (res.data as OrganizerType) : t))
          .sort((a, b) => a.name.localeCompare(b.name))
      );
      setEditingId(null);
      setEditNameInput("");
      setSuccessMsg("Especialidad actualizada.");
    } else {
      setError(res.error || "Error al actualizar.");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar la especialidad "${name}"?`)) {
      return;
    }

    setLoading(true);
    clearMessages();

    const res = await deleteOrganizerType(id);
    setLoading(false);

    if (res.success) {
      setTypes((prev) => prev.filter((t) => t.id !== id));
      setSuccessMsg("Especialidad eliminada.");
    } else {
      setError(res.error || "Error al eliminar.");
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl shadow-brand-primary/20 border border-white/50 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-black text-brand-primary">Especialidades</h1>
            <p className="text-sm font-bold text-gray-600 mt-1 uppercase tracking-widest">
              Gestionar categorías de organizadores (músicos, payasos, etc.)
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Link 
              href="/admin/dashboard"
              className="text-gray-500 hover:text-gray-800 font-bold text-sm uppercase tracking-wider"
            >
              Volver al Dashboard
            </Link>
          </div>
        </header>

        {/* Mensajes */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl font-medium text-sm">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-2xl font-medium text-sm">
            {successMsg}
          </div>
        )}

        {/* Crear Nueva */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/50">
          <h2 className="text-xl font-black text-brand-primary mb-4">Nueva Especialidad</h2>
          <form onSubmit={handleCreate} className="flex gap-4">
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Ej. Músico, Payaso, Nutricionista..."
              className="flex-1 px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary bg-white/50 font-medium"
              disabled={loading}
              required
            />
            <button
              type="submit"
              disabled={loading || !nameInput.trim()}
              className="flex items-center gap-2 bg-brand-primary hover:bg-brand-primary/90 disabled:opacity-55 text-white px-6 py-3 rounded-2xl font-black text-sm tracking-wide transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              AGREGAR
            </button>
          </form>
        </div>

        {/* Lista */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-primary/5 text-brand-primary text-sm uppercase tracking-wider">
                  <th className="p-4 font-black">Nombre</th>
                  <th className="p-4 font-black">Slug (URL)</th>
                  <th className="p-4 font-black text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {types.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-gray-500 font-medium">
                      No hay especialidades registradas.
                    </td>
                  </tr>
                ) : (
                  types.map((type) => (
                    <tr key={type.id} className="border-t border-gray-100 hover:bg-white transition-colors">
                      <td className="p-4 font-bold text-gray-800">
                        {editingId === type.id ? (
                          <input
                            type="text"
                            value={editNameInput}
                            onChange={(e) => setEditNameInput(e.target.value)}
                            className="px-3 py-1.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 w-full font-medium"
                            required
                          />
                        ) : (
                          type.name
                        )}
                      </td>
                      <td className="p-4 text-gray-500 font-mono text-sm">
                        {type.slug}
                      </td>
                      <td className="p-4 text-right">
                        {editingId === type.id ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleUpdate(type.id)}
                              disabled={loading || !editNameInput.trim()}
                              className="p-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl transition-colors cursor-pointer"
                              title="Guardar"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              disabled={loading}
                              className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl transition-colors cursor-pointer"
                              title="Cancelar"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleStartEdit(type)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
                              title="Editar"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(type.id, type.name)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
