
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  ImagePlus,
  Upload,
  Loader2,
  BookOpen,
  FolderOpen,
  FileText,
  AlertCircle,
  RefreshCw,
  Image as ImageIcon,
} from "lucide-react";

import {
  createGuide,
  deleteGuide,
  listGuides,
  updateGuide,
  type GuideInput,
} from "@/services/guides.service";

import type { Guide } from "@/types";

import {
  uploadGuideImage,
  deleteGuideImage,
} from "@/services/guide-image.service";

import { Pagination } from "@/components/shared/pagination";

const PAGE_SIZE = 10;

type GuideForm = {
  title: string;
  category: string;
  summary: string;
  content: string;
};

const INITIAL_FORM: GuideForm = {
  title: "",
  category: "",
  summary: "",
  content: "",
};

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export function ManageGuidesPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Data
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  // Search and filter
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [page, setPage] = useState(1);

  // Dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Selected guide
  const [editingGuide, setEditingGuide] = useState<Guide | null>(null);
  const [deletingGuide, setDeletingGuide] = useState<Guide | null>(null);

  // Form
  const [formData, setFormData] = useState<GuideForm>(INITIAL_FORM);
  const [formError, setFormError] = useState("");

  // Image
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [removeExistingImage, setRemoveExistingImage] = useState(false);

  // Notification
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // --------------------------------------------------
  // Notification
  // --------------------------------------------------

  const showNotification = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    setNotification({ message, type });

    window.setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  // --------------------------------------------------
  // Load guides
  // --------------------------------------------------

  const loadGuides = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await listGuides();

      setGuides(result || []);
    } catch (err) {
      console.error("Gagal mengambil panduan:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Gagal memuat data panduan."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadGuides();
  }, []);

  // --------------------------------------------------
  // Categories
  // --------------------------------------------------

  const categories = useMemo(() => {
    const values = guides
      .map((guide) => guide.category)
      .filter(
        (category): category is string =>
          typeof category === "string" && category.trim() !== ""
      );

    return ["Semua", ...Array.from(new Set(values)).sort()];
  }, [guides]);

  // --------------------------------------------------
  // Filter guides
  // --------------------------------------------------

  const filteredGuides = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return guides.filter((guide) => {
      const matchesSearch =
        !keyword ||
        guide.title?.toLowerCase().includes(keyword) ||
        guide.summary?.toLowerCase().includes(keyword) ||
        guide.category?.toLowerCase().includes(keyword) ||
        guide.content?.toLowerCase().includes(keyword);

      const matchesCategory =
        selectedCategory === "Semua" ||
        guide.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [guides, search, selectedCategory]);

  // --------------------------------------------------
  // Statistics
  // --------------------------------------------------

  const totalGuides = guides.length;
  const totalCategories = categories.length - 1;
  const totalFiltered = filteredGuides.length;

  const totalPages = Math.max(1, Math.ceil(totalFiltered / PAGE_SIZE));

  const pageItems = useMemo(
    () => filteredGuides.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filteredGuides, page]
  );

  useEffect(() => {
    setPage(1);
  }, [search, selectedCategory]);

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  // --------------------------------------------------
  // Image preview cleanup
  // --------------------------------------------------

  const clearImagePreview = () => {
    if (imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setSelectedImage(null);
    setImagePreview("");
  };

  // --------------------------------------------------
  // Open add dialog
  // --------------------------------------------------

  const openAddDialog = () => {
    clearImagePreview();

    setEditingGuide(null);
    setFormData(INITIAL_FORM);
    setFormError("");
    setRemoveExistingImage(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setIsDialogOpen(true);
  };

  // --------------------------------------------------
  // Open edit dialog
  // --------------------------------------------------

  const openEditDialog = (guide: Guide) => {
    clearImagePreview();

    setEditingGuide(guide);

    setFormData({
      title: guide.title || "",
      category: guide.category || "",
      summary: guide.summary || "",
      content: guide.content || "",
    });

    setImagePreview(guide.imageUrl || "");
    setSelectedImage(null);
    setRemoveExistingImage(false);
    setFormError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setIsDialogOpen(true);
  };

  // --------------------------------------------------
  // Close dialog
  // --------------------------------------------------

  const closeDialog = () => {
    if (saving) return;

    clearImagePreview();

    setIsDialogOpen(false);
    setEditingGuide(null);
    setFormData(INITIAL_FORM);
    setFormError("");
    setRemoveExistingImage(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // --------------------------------------------------
  // Form input
  // --------------------------------------------------

  const handleInputChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // --------------------------------------------------
  // Select image
  // --------------------------------------------------

  const handleImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setFormError("Format gambar harus JPG, PNG, atau WEBP.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setFormError("Ukuran gambar maksimal 5 MB.");
      event.target.value = "";
      return;
    }

    setFormError("");

    if (imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
    setRemoveExistingImage(false);
  };

  // --------------------------------------------------
  // Remove image
  // --------------------------------------------------

  const handleRemoveImage = () => {
    if (imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setSelectedImage(null);
    setImagePreview("");
    setRemoveExistingImage(true);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // --------------------------------------------------
  // Validate form
  // --------------------------------------------------

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setFormError("Judul panduan wajib diisi.");
      return false;
    }

    if (!formData.category.trim()) {
      setFormError("Kategori panduan wajib diisi.");
      return false;
    }

    if (!formData.summary.trim()) {
      setFormError("Ringkasan panduan wajib diisi.");
      return false;
    }

    if (!formData.content.trim()) {
      setFormError("Isi panduan wajib diisi.");
      return false;
    }

    return true;
  };

  // --------------------------------------------------
  // Save guide
  // --------------------------------------------------

  const handleSaveGuide = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!validateForm()) return;

    let uploadedImageUrl = "";

    const oldImageUrl = editingGuide?.imageUrl || "";

    try {
      setSaving(true);
      setFormError("");

      let imageUrl = oldImageUrl;

      // Upload gambar baru
      if (selectedImage) {
        uploadedImageUrl = await uploadGuideImage(selectedImage);
        imageUrl = uploadedImageUrl;
      }

      // Hapus gambar jika diminta
      if (removeExistingImage) {
        imageUrl = "";
      }

      const payload: GuideInput = {
        title: formData.title.trim(),
        category: formData.category.trim(),
        summary: formData.summary.trim(),
        content: formData.content.trim(),
        imageUrl,
      };

      if (editingGuide) {
        await updateGuide(editingGuide.id, payload);

        // Hapus gambar lama hanya setelah database berhasil diperbarui.
        if (oldImageUrl && oldImageUrl !== imageUrl) {
          try {
            await deleteGuideImage(oldImageUrl);
          } catch (cleanupError) {
            console.error(
              "Gambar lama gagal dihapus:",
              cleanupError
            );
          }
        }

        showNotification("Panduan berhasil diperbarui.");
      } else {
        await createGuide(payload);

        showNotification("Panduan berhasil ditambahkan.");
      }

      clearImagePreview();

      setIsDialogOpen(false);
      setEditingGuide(null);
      setFormData(INITIAL_FORM);
      setRemoveExistingImage(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      await loadGuides();
    } catch (err) {
      console.error("Gagal menyimpan panduan:", err);

      // Hapus file baru jika penyimpanan database gagal.
      if (uploadedImageUrl) {
        try {
          await deleteGuideImage(uploadedImageUrl);
        } catch (cleanupError) {
          console.error(
            "Gagal membersihkan gambar baru:",
            cleanupError
          );
        }
      }

      setFormError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat menyimpan panduan."
      );
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // Delete guide
  // --------------------------------------------------

  const openDeleteDialog = (guide: Guide) => {
    setDeletingGuide(guide);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteGuide = async () => {
    if (!deletingGuide) return;

    try {
      setDeleting(true);

      await deleteGuide(deletingGuide.id);

      // Hapus gambar dari Storage setelah data berhasil dihapus.
      if (deletingGuide.imageUrl) {
        try {
          await deleteGuideImage(deletingGuide.imageUrl);
        } catch (imageError) {
          console.error("Gagal menghapus gambar:", imageError);
        }
      }

      showNotification("Panduan berhasil dihapus.");

      setIsDeleteDialogOpen(false);
      setDeletingGuide(null);

      await loadGuides();
    } catch (err) {
      console.error("Gagal menghapus panduan:", err);

      showNotification(
        err instanceof Error
          ? err.message
          : "Gagal menghapus panduan.",
        "error"
      );
    } finally {
      setDeleting(false);
    }
  };

  // --------------------------------------------------
  // Render
  // --------------------------------------------------

  return (
    <div className="animate-fade-in space-y-6">
      {/* Notification */}
      {notification && (
        <div
          className={`fixed right-4 top-4 z-[100] flex max-w-sm items-center gap-3 rounded-xl px-5 py-4 text-sm font-medium text-white shadow-xl ${
            notification.type === "success"
              ? "bg-emerald-600"
              : "bg-red-600"
          }`}
        >
          {notification.type === "success" ? (
            <BookOpen size={18} />
          ) : (
            <AlertCircle size={18} />
          )}

          {notification.message}

          <button
            type="button"
            onClick={() => setNotification(null)}
            className="ml-2"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* Page header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-teal-700">
            <BookOpen size={17} />
            Manajemen Konten
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Kelola Panduan
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Kelola artikel, informasi, dan panduan kesehatan
            untuk pengguna ApotekerKita.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddDialog}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700"
        >
          <Plus size={19} />
          Tambah Panduan
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Total Panduan
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {totalGuides}
              </p>
            </div>

            <div className="rounded-xl bg-teal-50 p-3 text-teal-700">
              <BookOpen size={23} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Total Kategori
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {totalCategories}
              </p>
            </div>

            <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
              <FolderOpen size={23} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Hasil Pencarian
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {totalFiltered}
              </p>
            </div>

            <div className="rounded-xl bg-violet-50 p-3 text-violet-700">
              <FileText size={23} />
            </div>
          </div>
        </div>
      </div>

      {/* Search and filter */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari judul, ringkasan, atau isi panduan..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-100"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(event) =>
              setSelectedCategory(event.target.value)
            }
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => {
              setSearch("");
              setSelectedCategory("Semua");
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            <RefreshCw size={16} />
            Reset
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="font-semibold text-slate-900">
              Daftar Panduan
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Menampilkan {filteredGuides.length} dari {guides.length} panduan
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="mb-3 animate-spin text-teal-600" size={32} />
            <p className="text-sm text-slate-500">
              Memuat data panduan...
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
            <AlertCircle size={35} className="mb-3 text-red-500" />
            <p className="font-semibold text-slate-800">
              Gagal memuat panduan
            </p>
            <p className="mt-2 max-w-md text-sm text-slate-500">
              {error}
            </p>
            <button
              type="button"
              onClick={() => void loadGuides()}
              className="mt-5 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
            >
              Coba Lagi
            </button>
          </div>
        ) : filteredGuides.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-5 py-20 text-center">
            <div className="mb-4 rounded-2xl bg-slate-100 p-5 text-slate-400">
              <BookOpen size={34} />
            </div>

            <h3 className="font-semibold text-slate-800">
              {guides.length === 0
                ? "Belum ada panduan"
                : "Panduan tidak ditemukan"}
            </h3>

            <p className="mt-2 max-w-sm text-sm text-slate-500">
              {guides.length === 0
                ? "Mulai tambahkan panduan kesehatan untuk pengguna."
                : "Coba gunakan kata kunci atau kategori lainnya."}
            </p>

            {guides.length === 0 && (
              <button
                type="button"
                onClick={openAddDialog}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
              >
                <Plus size={17} />
                Tambah Panduan
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Panduan</th>
                    <th className="px-5 py-4 font-semibold">Kategori</th>
                    <th className="px-5 py-4 font-semibold">Ringkasan</th>
                    <th className="px-5 py-4 text-right font-semibold">
                      Aksi
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {pageItems.map((guide) => (
                    <tr
                      key={guide.id}
                      className="transition hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-4">
                        <div className="flex min-w-[220px] items-center gap-3">
                          <div className="h-14 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100">
                            {guide.imageUrl ? (
                              <img
                                src={guide.imageUrl}
                                alt={guide.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-slate-400">
                                <ImageIcon size={22} />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="line-clamp-2 font-semibold text-slate-800">
                              {guide.title}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                          {guide.category || "-"}
                        </span>
                      </td>

                      <td className="max-w-xs px-5 py-4">
                        <p className="line-clamp-2 text-sm text-slate-500">
                          {guide.summary || "-"}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditDialog(guide)}
                            title="Edit panduan"
                            className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700"
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            type="button"
                            onClick={() => openDeleteDialog(guide)}
                            title="Hapus panduan"
                            className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="grid gap-4 p-4 md:hidden">
              {pageItems.map((guide) => (
                <div
                  key={guide.id}
                  className="overflow-hidden rounded-xl border border-slate-200"
                >
                  {guide.imageUrl ? (
                    <img
                      src={guide.imageUrl}
                      alt={guide.title}
                      className="h-44 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-36 items-center justify-center bg-slate-100 text-slate-400">
                      <ImageIcon size={30} />
                    </div>
                  )}

                  <div className="space-y-3 p-4">
                    <span className="inline-flex rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                      {guide.category || "-"}
                    </span>

                    <h3 className="font-semibold text-slate-900">
                      {guide.title}
                    </h3>

                    <p className="line-clamp-3 text-sm leading-relaxed text-slate-500">
                      {guide.summary || "-"}
                    </p>

                    <div className="flex gap-2 border-t border-slate-100 pt-3">
                      <button
                        type="button"
                        onClick={() => openEditDialog(guide)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-teal-50 py-2.5 text-sm font-semibold text-teal-700 hover:bg-teal-100"
                      >
                        <Pencil size={16} />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => openDeleteDialog(guide)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-50 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100"
                      >
                        <Trash2 size={16} />
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Pagination
              page={page}
              totalPages={totalPages}
              totalItems={totalFiltered}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
              itemLabel="panduan"
            />
          </>
        )}
      </div>

      {/* Add/Edit Dialog */}
      {isDialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-3 backdrop-blur-sm sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeDialog();
            }
          }}
        >
          <div className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:max-h-[94vh]">
            {/* Dialog header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-7">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {editingGuide ? "Edit Panduan" : "Tambah Panduan"}
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Lengkapi informasi panduan kesehatan.
                </p>
              </div>

              <button
                type="button"
                onClick={closeDialog}
                disabled={saving}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >
                <X size={21} />
              </button>
            </div>

            {/* Dialog form */}
            <form
              onSubmit={handleSaveGuide}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="space-y-5 overflow-y-auto px-5 py-5 sm:px-7">
                {/* Image upload */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Gambar Panduan
                  </label>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />

                  {imagePreview ? (
                    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                      <img
                        src={imagePreview}
                        alt="Preview gambar panduan"
                        className="h-52 w-full object-cover sm:h-64"
                      />

                      <div className="absolute right-3 top-3 flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            fileInputRef.current?.click()
                          }
                          disabled={saving}
                          className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-md hover:bg-slate-100"
                        >
                          <Upload size={15} />
                          Ganti
                        </button>

                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          disabled={saving}
                          className="rounded-lg bg-white p-2 text-red-600 shadow-md hover:bg-red-50"
                          title="Hapus gambar"
                        >
                          <X size={17} />
                        </button>
                      </div>

                      {selectedImage && (
                        <div className="absolute bottom-0 left-0 right-0 bg-slate-950/65 px-3 py-2 text-xs text-white">
                          {selectedImage.name}
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        fileInputRef.current?.click()
                      }
                      disabled={saving}
                      className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-5 py-9 text-center transition hover:border-teal-500 hover:bg-teal-50 disabled:opacity-50"
                    >
                      <div className="mb-3 rounded-full bg-teal-100 p-4 text-teal-700">
                        <ImagePlus size={27} />
                      </div>

                      <span className="text-sm font-semibold text-slate-800">
                        Klik untuk memilih gambar
                      </span>

                      <span className="mt-1 text-xs text-slate-500">
                        JPG, PNG, WEBP · Maksimal 5 MB
                      </span>
                    </button>
                  )}
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <label
                    htmlFor="guide-title"
                    className="block text-sm font-semibold text-slate-700"
                  >
                    Judul Panduan <span className="text-red-500">*</span>
                  </label>

                  <input
                    id="guide-title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Contoh: Cara Menggunakan Obat dengan Benar"
                    required
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <label
                    htmlFor="guide-category"
                    className="block text-sm font-semibold text-slate-700"
                  >
                    Kategori <span className="text-red-500">*</span>
                  </label>

                  <input
                    id="guide-category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    placeholder="Contoh: Penggunaan Obat"
                    required
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  />
                </div>

                {/* Summary */}
                <div className="space-y-2">
                  <label
                    htmlFor="guide-summary"
                    className="block text-sm font-semibold text-slate-700"
                  >
                    Ringkasan <span className="text-red-500">*</span>
                  </label>

                  <textarea
                    id="guide-summary"
                    name="summary"
                    value={formData.summary}
                    onChange={handleInputChange}
                    placeholder="Tuliskan ringkasan singkat panduan..."
                    rows={3}
                    required
                    className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm leading-relaxed outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  />
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <label
                    htmlFor="guide-content"
                    className="block text-sm font-semibold text-slate-700"
                  >
                    Isi Panduan <span className="text-red-500">*</span>
                  </label>

                  <textarea
                    id="guide-content"
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    placeholder="Tuliskan isi panduan secara lengkap..."
                    rows={8}
                    required
                    className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm leading-relaxed outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  />

                  <p className="text-xs text-slate-400">
                    Kamu dapat menulis isi panduan dengan beberapa paragraf.
                  </p>
                </div>

                {/* Error */}
                {formError && (
                  <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    <AlertCircle
                      size={18}
                      className="mt-0.5 flex-shrink-0"
                    />
                    <span>{formError}</span>
                  </div>
                )}
              </div>

              {/* Dialog footer */}
              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
                <button
                  type="button"
                  onClick={closeDialog}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="!inline-flex !items-center !justify-center !gap-2 !rounded-xl !border-0 !bg-[#0D9488] !px-6 !py-3 !text-sm !font-semibold !text-white !opacity-100 !shadow-sm transition hover:!bg-[#0F766E] disabled:!cursor-not-allowed disabled:!opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2 size={17} className="animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Upload size={17} />
                      {editingGuide
                        ? "Simpan Perubahan"
                        : "Simpan Panduan"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {isDeleteDialogOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <Trash2 size={23} />
            </div>

            <h2 className="text-lg font-bold text-slate-900">
              Hapus Panduan?
            </h2>

            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Apakah kamu yakin ingin menghapus panduan{" "}
              <strong className="text-slate-800">
                {deletingGuide?.title}
              </strong>
              ? Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteDialogOpen(false);
                  setDeletingGuide(null);
                }}
                disabled={deleting}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={() => void handleDeleteGuide()}
                disabled={deleting}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Menghapus...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Ya, Hapus
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
