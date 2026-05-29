"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  logoutAdmin,
  getMenuItems,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getGalleryItems,
  addGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  uploadImage,
  getBranches,
  addBranch,
  updateBranch,
  deleteBranch,
  deleteBranches,
  getPartnershipLeads,
  updatePartnershipLeadStatus,
  deletePartnershipLeads,
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  checkAdminSession,
  toggleMenuItemAvailability,
  MenuItem,
  GalleryItem,
  Branch,
  PartnershipLead,
  Category,
} from "@/app/actions";

// Helper: Format number to Rupiah currency
const formatToRupiah = (rawVal: string): string => {
  const numbers = rawVal.replace(/\D/g, "");
  if (!numbers) return "";
  const parsed = parseInt(numbers, 10);
  return "Rp " + parsed.toLocaleString("id-ID");
};

// Helper: Check if string is a valid HTTP/HTTPS URL
const isValidUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch (_) {
    return false;
  }
};

// Helper: Compress image to WebP on the client side using canvas
const compressImage = (file: File): Promise<File> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Max width 800px, maintain aspect ratio
        const MAX_WIDTH = 800;
        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
                type: "image/webp",
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file); // Fallback to raw file if blob creation fails
            }
          },
          "image/webp",
          0.85 // 85% WebP quality
        );
      };
    };
  });
};

export default function AdminDashboard() {
  const router = useRouter();
  
  // Tab State
  const [activeTab, setActiveTab] = useState<"menu" | "category" | "gallery" | "branch" | "leads">("menu");
  
  // Data States
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchIds, setSelectedBranchIds] = useState<string[]>([]);
  const [partnershipLeads, setPartnershipLeads] = useState<PartnershipLead[]>([]);
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Modal / Form States
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingGalleryItem, setEditingGalleryItem] = useState<GalleryItem | null>(null);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  // File Upload States
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageUrlInput, setImageUrlInput] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  // Action Loading States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form Validation State
  const [formErrors, setFormErrors] = useState<Record<string, boolean>>({});

  // Custom Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  // Form Fields - Menu
  const [menuName, setMenuName] = useState("");
  const [menuPrice, setMenuPrice] = useState("");
  const [menuDesc, setMenuDesc] = useState("");
  const [menuCat, setMenuCat] = useState("");
  const [menuAvailable, setMenuAvailable] = useState(true);

  // Form Fields - Category
  const [categoryKey, setCategoryKey] = useState("");
  const [categoryName, setCategoryName] = useState("");

  // Form Fields - Gallery
  const [galleryTitle, setGalleryTitle] = useState("");
  const [galleryCat, setGalleryCat] = useState("");

  // Form Fields - Branch
  const [branchName, setBranchName] = useState("");
  const [branchGofood, setBranchGofood] = useState("");
  const [branchGrabfood, setBranchGrabfood] = useState("");
  const [branchShopeefood, setBranchShopeefood] = useState("");

  const showMsg = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const askConfirmation = (title: string, message: string, onConfirm: () => void) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  useEffect(() => {
    let active = true;
    const verifyAndLoad = async () => {
      try {
        const isAdmin = await checkAdminSession();
        if (!isAdmin) {
          router.replace("/admin/login");
          return;
        }

        const [menus, galleries, branchesData, leadsData, categoriesData] = await Promise.all([
          getMenuItems(),
          getGalleryItems(),
          getBranches(),
          getPartnershipLeads(),
          getCategories(),
        ]);

        if (active) {
          setMenuItems(menus);
          setGalleryItems(galleries);
          setBranches(branchesData);
          setPartnershipLeads(leadsData);
          setCategories(categoriesData);
        }
      } catch (err) {
        console.error("Gagal memuat data:", err);
        if (active) {
          showMsg("error", "Gagal memuat data dari database.");
        }
      } finally {
        if (active) {
          setIsLoadingData(false);
        }
      }
    };
    verifyAndLoad();
    return () => {
      active = false;
    };
  }, [router]);

  useEffect(() => {
    setSelectedBranchIds([]);
    setSelectedLeadIds([]);
  }, [activeTab]);

  // Auth Action
  const handleLogout = async () => {
    await logoutAdmin();
    router.push("/");
    router.refresh();
  };

  // Image Upload Handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showMsg("error", "Ukuran file terlalu besar! Maksimal 5MB.");
        e.target.value = ""; // Clear file input
        return;
      }
      // Validate file type (image only)
      if (!file.type.startsWith("image/")) {
        showMsg("error", "Format file tidak didukung! Gunakan JPG, PNG, atau WEBP.");
        e.target.value = ""; // Clear file input
        return;
      }
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
      setImageUrlInput(""); // clear URL input if file is selected
      if (formErrors.image) {
        setFormErrors((prev) => ({ ...prev, image: false }));
      }
    }
  };

  // Open Menu Modal for Add
  const openMenuAdd = () => {
    setEditingMenuItem(null);
    setMenuName("");
    setMenuPrice("");
    setMenuDesc("");
    setMenuCat(categories[0]?.key || "krisbar");
    setMenuAvailable(true);
    setImagePreview("");
    setImageUrlInput("");
    setSelectedFile(null);
    setFormErrors({});
    setIsMenuModalOpen(true);
  };

  // Open Menu Modal for Edit
  const openMenuEdit = (item: MenuItem) => {
    setEditingMenuItem(item);
    setMenuName(item.name);
    setMenuPrice(item.price);
    setMenuDesc(item.description);
    setMenuCat(item.category);
    setMenuAvailable(item.is_available !== false);
    setImagePreview(item.image);
    setImageUrlInput(item.image);
    setSelectedFile(null);
    setFormErrors({});
    setIsMenuModalOpen(true);
  };

  // Handle Submit Menu Form
  const handleMenuSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation with red borders
    const errors: Record<string, boolean> = {};
    if (!menuName.trim()) errors.menuName = true;
    if (!menuPrice.trim()) errors.menuPrice = true;
    if (!selectedFile && !imageUrlInput.trim()) errors.image = true;

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showMsg("error", "Silakan lengkapi kolom wajib yang ditandai merah.");
      return;
    }

    // Validate URL if provided manually
    if (!selectedFile && imageUrlInput && !isValidUrl(imageUrlInput)) {
      setFormErrors({ image: true });
      showMsg("error", "Tautan URL gambar tidak valid! Harus diawali dengan http:// atau https://");
      return;
    }

    setIsSubmitting(true);
    setFormErrors({});
    try {
      let finalImageUrl = imageUrlInput;

      // Upload image first if a local file is selected
      if (selectedFile) {
        setIsUploading(true);
        let fileToUpload = selectedFile;
        
        try {
          // Compress image client-side first to WebP
          fileToUpload = await compressImage(selectedFile);
        } catch (compressionErr) {
          console.warn("Client-side image compression failed, using original file:", compressionErr);
        }

        const uploadData = new FormData();
        uploadData.append("file", fileToUpload);
        const uploadResult = await uploadImage(uploadData);
        finalImageUrl = uploadResult.url;
        setIsUploading(false);
      }

      if (!finalImageUrl) {
        setFormErrors({ image: true });
        showMsg("error", "Silakan unggah gambar atau masukkan URL gambar.");
        setIsSubmitting(false);
        return;
      }

      const itemPayload = {
        name: menuName,
        price: menuPrice,
        description: menuDesc,
        image: finalImageUrl,
        category: menuCat,
        is_available: menuAvailable,
      };

      if (editingMenuItem && editingMenuItem.id) {
        // Edit Mode
        const updated = await updateMenuItem(editingMenuItem.id, itemPayload);
        setMenuItems((prev) =>
          prev.map((m) => (m.id === editingMenuItem.id ? updated : m))
        );
        showMsg("success", `Menu "${menuName}" berhasil diperbarui!`);
      } else {
        // Create Mode
        const added = await addMenuItem(itemPayload);
        setMenuItems((prev) => [...prev, added]);
        showMsg("success", `Menu "${menuName}" berhasil ditambahkan!`);
      }

      setIsMenuModalOpen(false);
    } catch (err: any) {
      console.error(err);
      const errMsg = err?.message || "Gagal menyimpan item menu.";
      showMsg("error", errMsg);
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  // Handle Toggle Availability
  const handleToggleAvailability = async (id: string, currentStatus: boolean) => {
    try {
      const item = menuItems.find((m) => m.id === id);
      if (!item) return;

      const updated = await toggleMenuItemAvailability(id, !currentStatus);
      setMenuItems((prev) =>
        prev.map((m) => (m.id === id ? { ...m, is_available: updated.is_available } : m))
      );
      showMsg("success", `Status ketersediaan menu "${item.name}" berhasil diubah.`);
    } catch (err) {
      console.error(err);
      showMsg("error", "Gagal mengubah ketersediaan menu.");
    }
  };

  // Handle Delete Menu
  const handleMenuDelete = (id: string, name: string) => {
    askConfirmation(
      "Hapus Menu",
      `Apakah Anda yakin ingin menghapus menu "${name}"? Tindakan ini tidak dapat dibatalkan.`,
      async () => {
        try {
          await deleteMenuItem(id);
          setMenuItems((prev) => prev.filter((m) => m.id !== id));
          showMsg("success", `Menu "${name}" berhasil dihapus.`);
        } catch (err: any) {
          console.error(err);
          const errMsg = err?.message || `Gagal menghapus menu "${name}".`;
          showMsg("error", errMsg);
        }
      }
    );
  };

  // Open Category Modal for Add
  const openCategoryAdd = () => {
    setEditingCategory(null);
    setCategoryKey("");
    setCategoryName("");
    setFormErrors({});
    setIsCategoryModalOpen(true);
  };

  // Open Category Modal for Edit
  const openCategoryEdit = (item: Category) => {
    setEditingCategory(item);
    setCategoryKey(item.key);
    setCategoryName(item.name);
    setFormErrors({});
    setIsCategoryModalOpen(true);
  };

  // Handle Submit Category Form
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: Record<string, boolean> = {};
    if (!categoryKey.trim()) errors.categoryKey = true;
    if (!categoryName.trim()) errors.categoryName = true;

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showMsg("error", "Silakan lengkapi kolom wajib yang ditandai merah.");
      return;
    }

    setIsSubmitting(true);
    setFormErrors({});
    try {
      const payload = {
        key: categoryKey.trim().toLowerCase(),
        name: categoryName.trim(),
      };

      if (editingCategory && editingCategory.id) {
        // Edit Mode
        const updated = await updateCategory(editingCategory.id, payload);
        setCategories((prev) =>
          prev.map((c) => (c.id === editingCategory.id ? updated : c))
        );
        showMsg("success", `Kategori "${categoryName}" berhasil diperbarui!`);
      } else {
        // Create Mode
        const added = await addCategory(payload);
        setCategories((prev) => [...prev, added]);
        showMsg("success", `Kategori "${categoryName}" berhasil ditambahkan!`);
      }

      setIsCategoryModalOpen(false);
    } catch (err: any) {
      console.error(err);
      const errMsg = err?.message || "Gagal menyimpan kategori.";
      showMsg("error", errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Category
  const handleCategoryDelete = (id: string, name: string) => {
    askConfirmation(
      "Hapus Kategori",
      `Apakah Anda yakin ingin menghapus kategori "${name}"? Tindakan ini tidak dapat dibatalkan.`,
      async () => {
        try {
          await deleteCategory(id);
          setCategories((prev) => prev.filter((c) => c.id !== id));
          showMsg("success", `Kategori "${name}" berhasil dihapus.`);
        } catch (err: any) {
          console.error(err);
          const errMsg = err?.message || `Gagal menghapus kategori "${name}".`;
          showMsg("error", errMsg);
        }
      }
    );
  };

  // Open Gallery Modal for Add
  const openGalleryAdd = () => {
    setEditingGalleryItem(null);
    setGalleryTitle("");
    setGalleryCat("");
    setImagePreview("");
    setImageUrlInput("");
    setSelectedFile(null);
    setFormErrors({});
    setIsGalleryModalOpen(true);
  };

  // Open Gallery Modal for Edit
  const openGalleryEdit = (item: GalleryItem) => {
    setEditingGalleryItem(item);
    setGalleryTitle(item.title);
    setGalleryCat(item.category);
    setImagePreview(item.image);
    setImageUrlInput(item.image);
    setSelectedFile(null);
    setFormErrors({});
    setIsGalleryModalOpen(true);
  };

  // Handle Submit Gallery Form
  const handleGallerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation with red borders
    const errors: Record<string, boolean> = {};
    if (!galleryTitle.trim()) errors.galleryTitle = true;
    if (!galleryCat.trim()) errors.galleryCat = true;
    if (!selectedFile && !imageUrlInput.trim()) errors.image = true;

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showMsg("error", "Silakan lengkapi kolom wajib yang ditandai merah.");
      return;
    }

    // Validate URL if provided manually
    if (!selectedFile && imageUrlInput && !isValidUrl(imageUrlInput)) {
      setFormErrors({ image: true });
      showMsg("error", "Tautan URL gambar tidak valid! Harus diawali dengan http:// atau https://");
      return;
    }

    setIsSubmitting(true);
    setFormErrors({});
    try {
      let finalImageUrl = imageUrlInput;

      if (selectedFile) {
        setIsUploading(true);
        let fileToUpload = selectedFile;

        try {
          // Compress image client-side first to WebP
          fileToUpload = await compressImage(selectedFile);
        } catch (compressionErr) {
          console.warn("Client-side image compression failed, using original file:", compressionErr);
        }

        const uploadData = new FormData();
        uploadData.append("file", fileToUpload);
        const uploadResult = await uploadImage(uploadData);
        finalImageUrl = uploadResult.url;
        setIsUploading(false);
      }

      if (!finalImageUrl) {
        setFormErrors({ image: true });
        showMsg("error", "Silakan unggah gambar atau masukkan URL gambar.");
        setIsSubmitting(false);
        return;
      }

      const itemPayload = {
        title: galleryTitle,
        image: finalImageUrl,
        category: galleryCat,
      };

      if (editingGalleryItem && editingGalleryItem.id) {
        // Edit Mode
        const updated = await updateGalleryItem(editingGalleryItem.id, itemPayload);
        setGalleryItems((prev) =>
          prev.map((g) => (g.id === editingGalleryItem.id ? updated : g))
        );
        showMsg("success", `Galeri "${galleryTitle}" berhasil diperbarui!`);
      } else {
        // Create Mode
        const added = await addGalleryItem(itemPayload);
        setGalleryItems((prev) => [...prev, added]);
        showMsg("success", `Galeri "${galleryTitle}" berhasil ditambahkan!`);
      }

      setIsGalleryModalOpen(false);
    } catch (err: any) {
      console.error(err);
      const errMsg = err?.message || "Gagal menyimpan item galeri.";
      showMsg("error", errMsg);
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  // Handle Delete Gallery
  const handleGalleryDelete = (id: string, title: string) => {
    askConfirmation(
      "Hapus Foto Galeri",
      `Apakah Anda yakin ingin menghapus foto "${title}"? Tindakan ini tidak dapat dibatalkan.`,
      async () => {
        try {
          await deleteGalleryItem(id);
          setGalleryItems((prev) => prev.filter((g) => g.id !== id));
          showMsg("success", `Foto "${title}" berhasil dihapus.`);
        } catch (err: any) {
          console.error(err);
          const errMsg = err?.message || `Gagal menghapus foto "${title}".`;
          showMsg("error", errMsg);
        }
      }
    );
  };

  // Open Branch Modal for Add
  const openBranchAdd = () => {
    setEditingBranch(null);
    setBranchName("");
    setBranchGofood("");
    setBranchGrabfood("");
    setBranchShopeefood("");
    setFormErrors({});
    setIsBranchModalOpen(true);
  };

  // Open Branch Modal for Edit
  const openBranchEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setBranchName(branch.name || "");
    setBranchGofood(branch.gofood || "");
    setBranchGrabfood(branch.grabfood || "");
    setBranchShopeefood(branch.shopeefood || "");
    setFormErrors({});
    setIsBranchModalOpen(true);
  };

  // Handle Submit Branch Form
  const handleBranchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation
    const errors: Record<string, boolean> = {};
    const cleanBranchName = (branchName || "").trim();
    if (!cleanBranchName) errors.branchName = true;
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showMsg("error", "Nama Cabang harus diisi.");
      return;
    }

    const gofoodVal = (branchGofood || "").trim();
    const grabfoodVal = (branchGrabfood || "").trim();
    const shopeefoodVal = (branchShopeefood || "").trim();

    // Validate URL format for ojol links
    if (gofoodVal && !isValidUrl(gofoodVal)) {
      setFormErrors({ gofood: true });
      showMsg("error", "Tautan GoFood tidak valid! Harus diawali dengan http:// atau https://");
      return;
    }
    if (grabfoodVal && !isValidUrl(grabfoodVal)) {
      setFormErrors({ grabfood: true });
      showMsg("error", "Tautan GrabFood tidak valid! Harus diawali dengan http:// atau https://");
      return;
    }
    if (shopeefoodVal && !isValidUrl(shopeefoodVal)) {
      setFormErrors({ shopeefood: true });
      showMsg("error", "Tautan ShopeeFood tidak valid! Harus diawali dengan http:// atau https://");
      return;
    }

    setIsSubmitting(true);
    setFormErrors({});
    try {
      const branchPayload = {
        name: cleanBranchName,
        gofood: gofoodVal,
        grabfood: grabfoodVal,
        shopeefood: shopeefoodVal,
      };

      if (editingBranch && editingBranch.id) {
        // Edit Mode
        const updated = await updateBranch(editingBranch.id, branchPayload);
        setBranches((prev) =>
          prev.map((b) => (b.id === editingBranch.id ? updated : b))
        );
        showMsg("success", `Cabang "${cleanBranchName}" berhasil diperbarui!`);
      } else {
        // Create Mode
        const added = await addBranch(branchPayload);
        setBranches((prev) => [...prev, added]);
        showMsg("success", `Cabang "${cleanBranchName}" berhasil ditambahkan!`);
      }

      setIsBranchModalOpen(false);
    } catch (err: any) {
      console.error(err);
      const errMsg = err?.message || "Gagal menyimpan cabang.";
      showMsg("error", errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Branch
  const handleBranchDelete = (id: string, name: string) => {
    askConfirmation(
      "Hapus Cabang",
      `Apakah Anda yakin ingin menghapus cabang "${name}"? Tindakan ini tidak dapat dibatalkan.`,
      async () => {
        try {
          await deleteBranch(id);
          setBranches((prev) => prev.filter((b) => b.id !== id));
          showMsg("success", `Cabang "${name}" berhasil dihapus.`);
        } catch (err: any) {
          console.error(err);
          const errMsg = err?.message || `Gagal menghapus cabang "${name}".`;
          showMsg("error", errMsg);
        }
      }
    );
  };

  // Handle individual branch selection toggle
  const handleSelectBranch = (id: string) => {
    setSelectedBranchIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Handle select all branches
  const handleSelectAllBranches = () => {
    if (selectedBranchIds.length === branches.length) {
      setSelectedBranchIds([]);
    } else {
      setSelectedBranchIds(branches.map((b) => b.id!).filter(Boolean));
    }
  };

  // Handle Bulk Delete Branches
  const handleBulkBranchDelete = () => {
    if (selectedBranchIds.length === 0) return;
    
    askConfirmation(
      "Hapus Cabang Terpilih",
      `Apakah Anda yakin ingin menghapus ${selectedBranchIds.length} cabang yang terpilih? Tindakan ini tidak dapat dibatalkan.`,
      async () => {
        try {
          await deleteBranches(selectedBranchIds);
          setBranches((prev) => prev.filter((b) => !selectedBranchIds.includes(b.id!)));
          setSelectedBranchIds([]);
          showMsg("success", "Cabang terpilih berhasil dihapus massal.");
        } catch (err: any) {
          console.error(err);
          const errMsg = err?.message || "Gagal menghapus cabang terpilih secara massal.";
          showMsg("error", errMsg);
        }
      }
    );
  };

  // Handle individual lead selection toggle
  const handleSelectLead = (id: string) => {
    setSelectedLeadIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Handle select all leads
  const handleSelectAllLeads = () => {
    if (selectedLeadIds.length === partnershipLeads.length) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(partnershipLeads.map((l) => l.id!).filter(Boolean));
    }
  };

  // Handle inline status update for a lead
  const handleUpdateLeadStatus = async (id: string, newStatus: string) => {
    try {
      const updated = await updatePartnershipLeadStatus(id, newStatus);
      setPartnershipLeads((prev) =>
        prev.map((l) => (l.id === id ? { ...l, status: updated.status } : l))
      );
      showMsg("success", "Status prospek berhasil diperbarui.");
    } catch (err) {
      console.error(err);
      showMsg("error", "Gagal memperbarui status prospek.");
    }
  };

  // Handle individual lead deletion
  const handleLeadDelete = (id: string, name: string) => {
    askConfirmation(
      "Hapus Prospek",
      `Apakah Anda yakin ingin menghapus prospek kemitraan "${name}"? Tindakan ini tidak dapat dibatalkan.`,
      async () => {
        try {
          await deletePartnershipLeads([id]);
          setPartnershipLeads((prev) => prev.filter((l) => l.id !== id));
          showMsg("success", `Prospek "${name}" berhasil dihapus.`);
        } catch (err: any) {
          console.error(err);
          const errMsg = err?.message || `Gagal menghapus prospek "${name}".`;
          showMsg("error", errMsg);
        }
      }
    );
  };

  // Handle bulk leads deletion
  const handleBulkLeadsDelete = () => {
    if (selectedLeadIds.length === 0) return;

    askConfirmation(
      "Hapus Prospek Terpilih",
      `Apakah Anda yakin ingin menghapus ${selectedLeadIds.length} prospek yang terpilih? Tindakan ini tidak dapat dibatalkan.`,
      async () => {
        try {
          await deletePartnershipLeads(selectedLeadIds);
          setPartnershipLeads((prev) => prev.filter((l) => !selectedLeadIds.includes(l.id!)));
          setSelectedLeadIds([]);
          showMsg("success", "Prospek terpilih berhasil dihapus massal.");
        } catch (err: any) {
          console.error(err);
          const errMsg = err?.message || "Gagal menghapus prospek terpilih secara massal.";
          showMsg("error", errMsg);
        }
      }
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-brand-dark">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <div className="bg-brand-red p-2.5 rounded-xl shadow-sm">
                <Image
                  src="/logo.png"
                  alt="Ayapi Logo"
                  width={90}
                  height={50}
                  className="w-[70px] h-auto"
                />
              </div>
              <div>
                <h1 className="font-extrabold text-lg text-brand-dark leading-tight">Admin CMS</h1>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Ayapi Management</p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 border border-gray-200 hover:border-brand-red/30 hover:text-brand-red text-gray-600 font-bold text-xs uppercase px-4 py-2 rounded-xl transition-all cursor-pointer bg-white"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Keluar
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
        
        {/* Toast Alerts */}
        {message && (
          <div
            className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl shadow-xl border flex items-center gap-3 max-w-md animate-fade-in ${
              message.type === "success"
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            {message.type === "success" ? (
              <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
            <span className="text-xs font-bold">{message.text}</span>
          </div>
        )}

        {/* Tab Controls & Add CTA */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-white border border-gray-200/60 p-4 rounded-2xl shadow-sm">
          {/* Tabs */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setActiveTab("menu")}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold tracking-wide uppercase transition-all cursor-pointer ${
                activeTab === "menu"
                  ? "bg-brand-red text-white shadow-md shadow-brand-red/10"
                  : "text-gray-500 hover:bg-gray-50 hover:text-brand-dark"
              }`}
            >
              🍔 Daftar Menu ({menuItems.length})
            </button>
            <button
              onClick={() => setActiveTab("category")}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold tracking-wide uppercase transition-all cursor-pointer ${
                activeTab === "category"
                  ? "bg-brand-red text-white shadow-md shadow-brand-red/10"
                  : "text-gray-500 hover:bg-gray-50 hover:text-brand-dark"
              }`}
            >
              📂 Kategori ({categories.length})
            </button>
            <button
              onClick={() => setActiveTab("gallery")}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold tracking-wide uppercase transition-all cursor-pointer ${
                activeTab === "gallery"
                  ? "bg-brand-red text-white shadow-md shadow-brand-red/10"
                  : "text-gray-500 hover:bg-gray-50 hover:text-brand-dark"
              }`}
            >
              📸 Galeri Visual ({galleryItems.length})
            </button>
            <button
              onClick={() => setActiveTab("branch")}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold tracking-wide uppercase transition-all cursor-pointer ${
                activeTab === "branch"
                  ? "bg-brand-red text-white shadow-md shadow-brand-red/10"
                  : "text-gray-500 hover:bg-gray-50 hover:text-brand-dark"
              }`}
            >
              📍 Cabang Ojol ({branches.length})
            </button>
            <button
              onClick={() => setActiveTab("leads")}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold tracking-wide uppercase transition-all cursor-pointer ${
                activeTab === "leads"
                  ? "bg-brand-red text-white shadow-md shadow-brand-red/10"
                  : "text-gray-500 hover:bg-gray-50 hover:text-brand-dark"
              }`}
            >
              💼 Leads Kemitraan ({partnershipLeads.length})
            </button>
          </div>

          {/* Add Buttons */}
          <div>
            {activeTab === "menu" ? (
              <button
                onClick={openMenuAdd}
                className="w-full sm:w-auto bg-brand-red hover:bg-[#a01c1c] text-white font-extrabold uppercase tracking-widest px-6 py-3 rounded-xl shadow-sm hover:shadow-md transition-all text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                Tambah Menu
              </button>
            ) : activeTab === "category" ? (
              <button
                onClick={openCategoryAdd}
                className="w-full sm:w-auto bg-brand-red hover:bg-[#a01c1c] text-white font-extrabold uppercase tracking-widest px-6 py-3 rounded-xl shadow-sm hover:shadow-md transition-all text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                Tambah Kategori
              </button>
            ) : activeTab === "gallery" ? (
              <button
                onClick={openGalleryAdd}
                className="w-full sm:w-auto bg-brand-red hover:bg-[#a01c1c] text-white font-extrabold uppercase tracking-widest px-6 py-3 rounded-xl shadow-sm hover:shadow-md transition-all text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                Tambah Foto Galeri
              </button>
            ) : activeTab === "branch" ? (
              <div className="flex gap-2">
                {selectedBranchIds.length > 0 && (
                  <button
                    onClick={handleBulkBranchDelete}
                    className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-extrabold uppercase tracking-widest px-6 py-3 rounded-xl shadow-sm hover:shadow-md transition-all text-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Hapus Terpilih ({selectedBranchIds.length})
                  </button>
                )}
                <button
                  onClick={openBranchAdd}
                  className="w-full sm:w-auto bg-brand-red hover:bg-[#a01c1c] text-white font-extrabold uppercase tracking-widest px-6 py-3 rounded-xl shadow-sm hover:shadow-md transition-all text-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                  Tambah Cabang
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                {selectedLeadIds.length > 0 && (
                  <button
                    onClick={handleBulkLeadsDelete}
                    className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-extrabold uppercase tracking-widest px-6 py-3 rounded-xl shadow-sm hover:shadow-md transition-all text-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Hapus Terpilih ({selectedLeadIds.length})
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Loading Spinner */}
        {isLoadingData ? (
          <div className="bg-white border border-gray-100 rounded-3xl p-16 text-center shadow-sm">
            <svg className="animate-spin h-10 w-10 text-brand-red mx-auto" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-gray-400 font-bold text-xs uppercase tracking-wider mt-4">Memuat data dari Supabase...</p>
          </div>
        ) : (
          /* Data Render Section */
          <div className="animate-fade-in">
            {activeTab === "menu" && (
              /* MENU TAB CONTENT */
              <div className="bg-white border border-gray-200/60 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 font-bold text-[10px] text-gray-400 uppercase tracking-wider">
                        <th className="py-4 px-6">Gambar</th>
                        <th className="py-4 px-6">Nama Menu</th>
                        <th className="py-4 px-6">Kategori</th>
                        <th className="py-4 px-6">Harga</th>
                        <th className="py-4 px-6">Deskripsi</th>
                        <th className="py-4 px-6 text-center">Stok</th>
                        <th className="py-4 px-6 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {menuItems.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-xs text-gray-400 font-bold">
                            Tidak ada item menu tersedia.
                          </td>
                        </tr>
                      ) : (
                        menuItems.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50/50 text-xs">
                            {/* Image */}
                            <td className="py-4 px-6 shrink-0">
                              <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shadow-inner">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </td>
                            {/* Name */}
                            <td className="py-4 px-6 font-bold text-brand-dark text-sm">{item.name}</td>
                            {/* Category */}
                            <td className="py-4 px-6">
                              <span className="bg-brand-red/10 text-brand-red font-bold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full">
                                {item.category === "krisbar" ? "Krisbar" : item.category === "paket" ? "Paket" : item.category === "geprek" ? "Geprek" : "Sambal"}
                              </span>
                            </td>
                            {/* Price */}
                            <td className="py-4 px-6 font-extrabold text-brand-yellow text-sm bg-brand-yellow/5">{item.price}</td>
                            {/* Description */}
                            <td className="py-4 px-6 text-gray-500 max-w-[240px] truncate leading-relaxed">
                              {item.description || "-"}
                            </td>
                            {/* Status Availability Toggle */}
                            <td className="py-4 px-6 text-center">
                              <button
                                onClick={() => handleToggleAvailability(item.id!, item.is_available !== false)}
                                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                  item.is_available !== false ? "bg-green-500" : "bg-gray-200"
                                }`}
                                role="switch"
                                aria-checked={item.is_available !== false}
                                title={item.is_available !== false ? "Ubah status ke Habis" : "Ubah status ke Tersedia"}
                              >
                                <span
                                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                    item.is_available !== false ? "translate-x-5" : "translate-x-0"
                                  }`}
                                />
                              </button>
                            </td>
                            {/* Actions */}
                            <td className="py-4 px-6">
                              <div className="flex justify-center gap-2">
                                <button
                                  onClick={() => openMenuEdit(item)}
                                  className="p-2 border border-gray-200 hover:border-brand-yellow/40 hover:text-brand-yellow rounded-xl transition-all cursor-pointer bg-white text-gray-500"
                                  title="Edit Menu"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleMenuDelete(item.id!, item.name)}
                                  className="p-2 border border-gray-200 hover:border-brand-red/40 hover:text-brand-red rounded-xl transition-all cursor-pointer bg-white text-gray-500"
                                  title="Hapus Menu"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "category" && (
              /* CATEGORY TAB CONTENT */
              <div className="bg-white border border-gray-200/60 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-400 uppercase tracking-wider">
                        <th className="py-4 px-6">Nama Kategori</th>
                        <th className="py-4 px-6">Key (Identifikasi System)</th>
                        <th className="py-4 px-6 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                      {categories.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="py-8 px-6 text-center text-xs text-gray-400 font-bold">
                            Tidak ada kategori tersedia.
                          </td>
                        </tr>
                      ) : (
                        categories.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="py-4.5 px-6 font-bold text-brand-dark">
                              {item.name}
                            </td>
                            <td className="py-4.5 px-6 font-mono text-gray-500">
                              {item.key}
                            </td>
                            <td className="py-4.5 px-6 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => openCategoryEdit(item)}
                                  className="p-2 border border-gray-200 hover:border-brand-yellow/40 hover:text-brand-yellow rounded-xl transition-all cursor-pointer bg-white text-gray-500"
                                  title="Edit Kategori"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleCategoryDelete(item.id!, item.name)}
                                  className="p-2 border border-gray-200 hover:border-brand-red/40 hover:text-brand-red rounded-xl transition-all cursor-pointer bg-white text-gray-500"
                                  title="Hapus Kategori"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "gallery" && (
              /* GALLERY TAB CONTENT */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {galleryItems.length === 0 ? (
                  <div className="col-span-full bg-white border border-gray-100 rounded-3xl p-16 text-center text-xs text-gray-400 font-bold shadow-sm">
                    Tidak ada item galeri tersedia.
                  </div>
                ) : (
                  galleryItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-3xl overflow-hidden border border-gray-200/60 shadow-sm flex flex-col group hover:shadow-md transition-shadow"
                    >
                      {/* Image Preview */}
                      <div className="relative aspect-[4/3] w-full bg-gray-50 border-b border-gray-100 overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm text-brand-red text-[9px] font-bold tracking-wider px-2.5 py-1 rounded-full shadow-sm uppercase">
                          {item.category}
                        </span>
                      </div>
                      
                      {/* Content & Actions */}
                      <div className="p-4 flex-grow flex flex-col justify-between gap-4">
                        <h4 className="font-extrabold text-xs text-brand-dark leading-snug">{item.title}</h4>
                        
                        <div className="flex gap-2 justify-end border-t border-gray-50 pt-3">
                          <button
                            onClick={() => openGalleryEdit(item)}
                            className="flex-1 py-2 px-3 border border-gray-200 hover:border-brand-yellow/30 hover:text-brand-yellow text-gray-500 rounded-xl transition-all cursor-pointer bg-white text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleGalleryDelete(item.id!, item.title)}
                            className="flex-1 py-2 px-3 border border-gray-200 hover:border-brand-red/30 hover:text-brand-red text-gray-500 rounded-xl transition-all cursor-pointer bg-white text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "branch" && (
              /* BRANCH TAB CONTENT */
              <div className="bg-white border border-gray-200/60 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 font-bold text-[10px] text-gray-400 uppercase tracking-wider">
                        <th className="py-4 px-6 text-center w-12">
                          <input
                            type="checkbox"
                            checked={branches.length > 0 && selectedBranchIds.length === branches.length}
                            onChange={handleSelectAllBranches}
                            className="w-4 h-4 text-brand-red border-gray-300 rounded focus:ring-brand-red cursor-pointer"
                          />
                        </th>
                        <th className="py-4 px-6">Nama Cabang</th>
                        <th className="py-4 px-6">Link GoFood</th>
                        <th className="py-4 px-6">Link GrabFood</th>
                        <th className="py-4 px-6">Link ShopeeFood</th>
                        <th className="py-4 px-6 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {branches.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-xs text-gray-400 font-bold">
                            Tidak ada cabang ojol tersedia.
                          </td>
                        </tr>
                      ) : (
                        branches.map((branch) => (
                          <tr key={branch.id} className={`hover:bg-gray-50/50 text-xs ${selectedBranchIds.includes(branch.id!) ? "bg-red-50/5" : ""}`}>
                            {/* Checkbox Selection */}
                            <td className="py-4 px-6 text-center">
                              <input
                                type="checkbox"
                                checked={selectedBranchIds.includes(branch.id!)}
                                onChange={() => handleSelectBranch(branch.id!)}
                                className="w-4 h-4 text-brand-red border-gray-300 rounded focus:ring-brand-red cursor-pointer"
                              />
                            </td>
                            {/* Branch Name */}
                            <td className="py-4 px-6 font-bold text-brand-dark text-sm">{branch.name}</td>
                            {/* GoFood Link */}
                            <td className="py-4 px-6">
                              {branch.gofood ? (
                                <a
                                  href={branch.gofood}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-brand-red hover:underline font-semibold"
                                >
                                  Buka Link GoFood
                                </a>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            {/* GrabFood Link */}
                            <td className="py-4 px-6">
                              {branch.grabfood ? (
                                <a
                                  href={branch.grabfood}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-green-600 hover:underline font-semibold"
                                >
                                  Buka Link GrabFood
                                </a>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            {/* ShopeeFood Link */}
                            <td className="py-4 px-6">
                              {branch.shopeefood ? (
                                <a
                                  href={branch.shopeefood}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-orange-500 hover:underline font-semibold"
                                >
                                  Buka Link ShopeeFood
                                </a>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            {/* Actions */}
                            <td className="py-4 px-6">
                              <div className="flex justify-center gap-2">
                                <button
                                  onClick={() => openBranchEdit(branch)}
                                  className="p-2 border border-gray-200 hover:border-brand-yellow/40 hover:text-brand-yellow rounded-xl transition-all cursor-pointer bg-white text-gray-500"
                                  title="Edit Cabang"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleBranchDelete(branch.id!, branch.name)}
                                  className="p-2 border border-gray-200 hover:border-brand-red/40 hover:text-brand-red rounded-xl transition-all cursor-pointer bg-white text-gray-500"
                                  title="Hapus Cabang"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "leads" && (
              /* LEADS TAB CONTENT */
              <div className="bg-white border border-gray-200/60 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 font-bold text-[10px] text-gray-400 uppercase tracking-wider">
                        <th className="py-4 px-6 text-center w-12">
                          <input
                            type="checkbox"
                            checked={partnershipLeads.length > 0 && selectedLeadIds.length === partnershipLeads.length}
                            onChange={handleSelectAllLeads}
                            className="w-4 h-4 text-brand-red border-gray-300 rounded focus:ring-brand-red cursor-pointer"
                          />
                        </th>
                        <th className="py-4 px-6">Nama Calon Mitra</th>
                        <th className="py-4 px-6">No. WhatsApp</th>
                        <th className="py-4 px-6">Tanggal Terdaftar</th>
                        <th className="py-4 px-6">Status Follow-up</th>
                        <th className="py-4 px-6 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {partnershipLeads.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-xs text-gray-400 font-bold">
                            Tidak ada prospek kemitraan terdaftar.
                          </td>
                        </tr>
                      ) : (
                        partnershipLeads.map((lead) => (
                          <tr key={lead.id} className={`hover:bg-gray-50/50 text-xs ${selectedLeadIds.includes(lead.id!) ? "bg-red-50/5" : ""}`}>
                            {/* Checkbox Selection */}
                            <td className="py-4 px-6 text-center">
                              <input
                                type="checkbox"
                                checked={selectedLeadIds.includes(lead.id!)}
                                onChange={() => handleSelectLead(lead.id!)}
                                className="w-4 h-4 text-brand-red border-gray-300 rounded focus:ring-brand-red cursor-pointer"
                              />
                            </td>
                            {/* Name */}
                            <td className="py-4 px-6 font-bold text-brand-dark text-sm">{lead.name}</td>
                            {/* Phone with WhatsApp click-to-chat */}
                            <td className="py-4 px-6">
                              <a
                                href={`https://wa.me/${lead.phone.replace(/\D/g, "").startsWith("0") ? "62" + lead.phone.replace(/\D/g, "").substring(1) : lead.phone.replace(/\D/g, "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-green-600 hover:underline font-semibold flex items-center gap-1.5"
                              >
                                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436.002 9.858-4.384 9.86-9.778.002-2.613-1.015-5.07-2.861-6.918C16.626 2.062 14.17 1.043 11.56 1.043c-5.443 0-9.865 4.386-9.867 9.782-.001 1.77.476 3.498 1.38 5.061L1.96 21.05l5.244-1.378zm11.385-6.85c-.3-.15-1.77-.874-2.043-.974-.275-.1-.475-.15-.675.15-.2.3-.775.975-.95 1.174-.175.2-.35.225-.65.075-1.205-.6-2.015-1.112-2.823-2.507-.213-.368-.213-.7-.076-.875.124-.15.275-.325.412-.49.137-.162.18-.275.273-.45.093-.188.046-.35-.022-.5-.069-.15-.675-1.625-.925-2.225-.244-.588-.492-.51-.675-.52-.172-.007-.369-.007-.565-.007-.196 0-.517.074-.788.374-.27.3-1.03 1.01-1.03 2.46s1.055 2.85 1.202 3.05c.148.2 2.077 3.17 5.034 4.45.703.303 1.25.485 1.678.62.707.224 1.35.193 1.86.117.567-.085 1.77-.724 2.02-1.41.25-.688.25-1.275.175-1.41-.075-.137-.275-.212-.575-.362z" />
                                </svg>
                                {lead.phone}
                              </a>
                            </td>
                            {/* Created At */}
                            <td className="py-4 px-6 text-gray-500 font-medium">
                              {lead.created_at ? new Date(lead.created_at).toLocaleString("id-ID", {
                                dateStyle: "medium",
                                timeStyle: "short",
                              }) : "-"}
                            </td>
                            {/* Status */}
                            <td className="py-4 px-6">
                              <select
                                value={lead.status}
                                onChange={(e) => handleUpdateLeadStatus(lead.id!, e.target.value)}
                                className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-colors cursor-pointer focus:outline-none ${
                                  lead.status === "Baru" ? "bg-blue-50 border-blue-200 text-blue-700" :
                                  lead.status === "Dihubungi" ? "bg-amber-50 border-amber-200 text-amber-700" :
                                  lead.status === "Batal" ? "bg-gray-50 border-gray-200 text-gray-600" :
                                  "bg-green-50 border-green-200 text-green-700"
                                }`}
                              >
                                <option value="Baru">🔵 Baru</option>
                                <option value="Dihubungi">🟡 Dihubungi</option>
                                <option value="Batal">⚪ Batal</option>
                                <option value="Mitra Resmi">🟢 Mitra Resmi</option>
                              </select>
                            </td>
                            {/* Action Delete */}
                            <td className="py-4 px-6 text-center">
                              <button
                                onClick={() => handleLeadDelete(lead.id!, lead.name)}
                                className="p-2 border border-gray-200 hover:border-brand-red/40 hover:text-brand-red rounded-xl transition-all cursor-pointer bg-white text-gray-500"
                                title="Hapus Prospek"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* =========================================================================
         MENU CRUD MODAL
         ========================================================================= */}
      {isMenuModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isSubmitting && setIsMenuModalOpen(false)}></div>
          
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full z-10 shadow-2xl border border-gray-100 relative max-h-[90vh] overflow-y-auto animate-fade-in space-y-6">
            <h3 className="font-black text-lg text-brand-dark border-b border-gray-100 pb-3">
              {editingMenuItem ? "Edit Menu Ayam" : "Tambah Menu Ayam Baru"}
            </h3>

            <form onSubmit={handleMenuSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5">Nama Menu *</label>
                <input
                  type="text"
                  required
                  value={menuName}
                  onChange={(e) => {
                    setMenuName(e.target.value);
                    if (formErrors.menuName) {
                      setFormErrors((prev) => ({ ...prev, menuName: false }));
                    }
                  }}
                  placeholder="Contoh: Ayapi Krisbar Keju"
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none transition-all ${
                    formErrors.menuName
                      ? "border-red-500 ring-1 ring-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50/10"
                      : "border-gray-200 focus:border-brand-red focus:ring-1 focus:ring-brand-red"
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Price */}
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5">Harga *</label>
                  <input
                    type="text"
                    required
                    value={menuPrice}
                    onChange={(e) => {
                      setMenuPrice(formatToRupiah(e.target.value));
                      if (formErrors.menuPrice) {
                        setFormErrors((prev) => ({ ...prev, menuPrice: false }));
                      }
                    }}
                    placeholder="Contoh: Rp 25.000"
                    className={`w-full px-4 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none transition-all ${
                      formErrors.menuPrice
                        ? "border-red-500 ring-1 ring-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50/10"
                        : "border-gray-200 focus:border-brand-red focus:ring-1 focus:ring-brand-red"
                    }`}
                  />
                </div>
                {/* Category */}
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5">Kategori *</label>
                  <select
                    value={menuCat}
                    onChange={(e) => setMenuCat(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold bg-white focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red transition-all cursor-pointer text-gray-700"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id || cat.key} value={cat.key}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5">Deskripsi</label>
                <textarea
                  rows={2}
                  value={menuDesc}
                  onChange={(e) => setMenuDesc(e.target.value)}
                  placeholder="Deskripsi bahan-bahan atau rasa ayam..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red transition-all"
                ></textarea>
              </div>

              {/* Status Ketersediaan */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="menuAvailable"
                  checked={menuAvailable}
                  onChange={(e) => setMenuAvailable(e.target.checked)}
                  className="w-4 h-4 text-brand-red border-gray-300 rounded focus:ring-brand-red cursor-pointer"
                />
                <label htmlFor="menuAvailable" className="text-xs font-bold text-gray-600 cursor-pointer select-none">
                  Tersedia untuk Pelanggan (Stok Ready)
                </label>
              </div>

              {/* Image Upload / Input */}
              <div className="space-y-3">
                <div className="flex flex-col gap-0.5">
                  <label className="block text-[10px] font-bold uppercase text-gray-400 mb-0">Gambar Menu *</label>
                  <span className="text-[9px] text-gray-400 leading-normal">
                    Unggah file gambar langsung (disarankan) atau gunakan link gambar langsung (.jpg/.png/.webp). Jangan menggunakan link halaman pencarian Google.
                  </span>
                </div>
                
                {/* Image Preview Window */}
                {imagePreview && (
                  <div className="relative w-full h-[160px] bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
                    <img
                      src={imagePreview}
                      alt="Pratinjau gambar"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview("");
                        setSelectedFile(null);
                        setImageUrlInput("");
                      }}
                      className="absolute top-2 right-2 bg-red-600/90 text-white rounded-lg p-1.5 hover:bg-red-700 transition-colors shadow"
                      title="Hapus Gambar"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                )}

                {/* Upload options (File vs URL toggle) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* File Upload */}
                  <div className="space-y-1">
                    <span className="block text-[9px] font-bold text-gray-400 uppercase">Unggah File</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-bold file:uppercase file:bg-brand-red/5 file:text-brand-red hover:file:bg-brand-red/10 cursor-pointer"
                    />
                  </div>
                  {/* URL Input */}
                  <div className="space-y-1">
                    <span className="block text-[9px] font-bold text-gray-400 uppercase">Atau Masukkan Link URL</span>
                    <input
                      type="text"
                      value={imageUrlInput}
                      onChange={(e) => {
                        setImageUrlInput(e.target.value);
                        setImagePreview(e.target.value);
                        setSelectedFile(null); // clear local file if URL is written
                        if (formErrors.image) {
                          setFormErrors((prev) => ({ ...prev, image: false }));
                        }
                      }}
                      placeholder="https://example.com/image.jpg"
                      className={`w-full px-4 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none transition-all ${
                        formErrors.image
                          ? "border-red-500 ring-1 ring-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50/10"
                          : "border-gray-200 focus:border-brand-red focus:ring-1 focus:ring-brand-red"
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsMenuModalOpen(false)}
                  className="flex-1 py-3 bg-gray-50 border border-gray-200 text-gray-500 hover:bg-gray-100 font-bold uppercase tracking-wider rounded-xl text-xs transition-all cursor-pointer text-center"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-brand-red hover:bg-[#a01c1c] text-white font-extrabold uppercase tracking-widest py-3.5 rounded-xl text-xs transition-all duration-200 shadow-md hover:shadow-lg disabled:bg-gray-400 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      {isUploading ? "Mengunggah..." : "Menyimpan..."}
                    </>
                  ) : (
                    "Simpan Menu"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
         CATEGORY CRUD MODAL
         ========================================================================= */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isSubmitting && setIsCategoryModalOpen(false)}></div>
          
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full z-10 shadow-2xl border border-gray-100 relative animate-fade-in space-y-6">
            <h3 className="font-black text-lg text-brand-dark border-b border-gray-100 pb-3">
              {editingCategory ? "Edit Kategori" : "Tambah Kategori Baru"}
            </h3>

            <form onSubmit={handleCategorySubmit} className="space-y-4">
              {/* Category Name */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5">Nama Kategori *</label>
                <input
                  type="text"
                  required
                  value={categoryName}
                  onChange={(e) => {
                    setCategoryName(e.target.value);
                    if (formErrors.categoryName) {
                      setFormErrors((prev) => ({ ...prev, categoryName: false }));
                    }
                  }}
                  placeholder="Contoh: Paket Keluarga"
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none transition-all ${
                    formErrors.categoryName
                      ? "border-red-500 ring-1 ring-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50/10"
                      : "border-gray-200 focus:border-brand-red focus:ring-1 focus:ring-brand-red"
                  }`}
                />
              </div>

              {/* Category Key */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5">Key Identifikasi (Satu kata, lowercase) *</label>
                <input
                  type="text"
                  required
                  disabled={!!editingCategory} // key shouldn't change once created to preserve menu association
                  value={categoryKey}
                  onChange={(e) => {
                    setCategoryKey(e.target.value.replace(/[^a-zA-Z0-9]/g, "").toLowerCase());
                    if (formErrors.categoryKey) {
                      setFormErrors((prev) => ({ ...prev, categoryKey: false }));
                    }
                  }}
                  placeholder="Contoh: paketkeluarga"
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs font-mono font-semibold focus:outline-none transition-all ${
                    editingCategory ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200" :
                    formErrors.categoryKey
                      ? "border-red-500 ring-1 ring-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50/10"
                      : "border-gray-200 focus:border-brand-red focus:ring-1 focus:ring-brand-red"
                  }`}
                />
                <p className="text-[10px] text-gray-400 mt-1 font-medium">Digunakan sistem secara internal untuk filtering menu.</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="flex-1 py-3 bg-gray-50 border border-gray-200 text-gray-500 hover:bg-gray-100 font-bold uppercase tracking-wider rounded-xl text-xs transition-all cursor-pointer text-center"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-brand-red hover:bg-[#a01c1c] text-white font-extrabold uppercase tracking-widest py-3.5 rounded-xl text-xs transition-all duration-200 shadow-md hover:shadow-lg disabled:bg-gray-400 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Menyimpan...
                    </>
                  ) : (
                    "Simpan Kategori"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
         GALLERY CRUD MODAL
         ========================================================================= */}
      {isGalleryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isSubmitting && setIsGalleryModalOpen(false)}></div>
          
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full z-10 shadow-2xl border border-gray-100 relative max-h-[90vh] overflow-y-auto animate-fade-in space-y-6">
            <h3 className="font-black text-lg text-brand-dark border-b border-gray-100 pb-3">
              {editingGalleryItem ? "Edit Foto Galeri" : "Tambah Foto Galeri Baru"}
            </h3>

            <form onSubmit={handleGallerySubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5">Judul Foto *</label>
                <input
                  type="text"
                  required
                  value={galleryTitle}
                  onChange={(e) => {
                    setGalleryTitle(e.target.value);
                    if (formErrors.galleryTitle) {
                      setFormErrors((prev) => ({ ...prev, galleryTitle: false }));
                    }
                  }}
                  placeholder="Contoh: Proses Grilling Ayam"
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none transition-all ${
                    formErrors.galleryTitle
                      ? "border-red-500 ring-1 ring-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50/10"
                      : "border-gray-200 focus:border-brand-red focus:ring-1 focus:ring-brand-red"
                  }`}
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5">Kategori / Lokasi *</label>
                <input
                  type="text"
                  required
                  value={galleryCat}
                  onChange={(e) => {
                    setGalleryCat(e.target.value);
                    if (formErrors.galleryCat) {
                      setFormErrors((prev) => ({ ...prev, galleryCat: false }));
                    }
                  }}
                  placeholder="Contoh: Menu, Dapur, Outlet, Bahan Baku"
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none transition-all ${
                    formErrors.galleryCat
                      ? "border-red-500 ring-1 ring-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50/10"
                      : "border-gray-200 focus:border-brand-red focus:ring-1 focus:ring-brand-red"
                  }`}
                />
              </div>

              {/* Image Upload / Input */}
              <div className="space-y-3">
                <div className="flex flex-col gap-0.5">
                  <label className="block text-[10px] font-bold uppercase text-gray-400 mb-0">Gambar Galeri *</label>
                  <span className="text-[9px] text-gray-400 leading-normal">
                    Unggah file gambar langsung (disarankan) atau gunakan link gambar langsung (.jpg/.png/.webp). Jangan menggunakan link halaman pencarian Google.
                  </span>
                </div>
                
                {/* Image Preview Window */}
                {imagePreview && (
                  <div className="relative w-full h-[160px] bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
                    <img
                      src={imagePreview}
                      alt="Pratinjau gambar"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview("");
                        setSelectedFile(null);
                        setImageUrlInput("");
                      }}
                      className="absolute top-2 right-2 bg-red-600/90 text-white rounded-lg p-1.5 hover:bg-red-700 transition-colors shadow"
                      title="Hapus Gambar"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                )}

                {/* Upload options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* File Upload */}
                  <div className="space-y-1">
                    <span className="block text-[9px] font-bold text-gray-400 uppercase">Unggah File</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-bold file:uppercase file:bg-brand-red/5 file:text-brand-red hover:file:bg-brand-red/10 cursor-pointer"
                    />
                  </div>
                  {/* URL Input */}
                  <div className="space-y-1">
                    <span className="block text-[9px] font-bold text-gray-400 uppercase">Atau Masukkan Link URL</span>
                    <input
                      type="text"
                      value={imageUrlInput}
                      onChange={(e) => {
                        setImageUrlInput(e.target.value);
                        setImagePreview(e.target.value);
                        setSelectedFile(null);
                        if (formErrors.image) {
                          setFormErrors((prev) => ({ ...prev, image: false }));
                        }
                      }}
                      placeholder="https://example.com/gallery.jpg"
                      className={`w-full px-4 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none transition-all ${
                        formErrors.image
                          ? "border-red-500 ring-1 ring-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50/10"
                          : "border-gray-200 focus:border-brand-red focus:ring-1 focus:ring-brand-red"
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsGalleryModalOpen(false)}
                  className="flex-1 py-3 bg-gray-50 border border-gray-200 text-gray-500 hover:bg-gray-100 font-bold uppercase tracking-wider rounded-xl text-xs transition-all cursor-pointer text-center"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-brand-red hover:bg-[#a01c1c] text-white font-extrabold uppercase tracking-widest py-3.5 rounded-xl text-xs transition-all duration-200 shadow-md hover:shadow-lg disabled:bg-gray-400 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      {isUploading ? "Mengunggah..." : "Menyimpan..."}
                    </>
                  ) : (
                    "Simpan Foto"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
         BRANCH CRUD MODAL
         ========================================================================= */}
      {isBranchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isSubmitting && setIsBranchModalOpen(false)}></div>
          
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full z-10 shadow-2xl border border-gray-100 relative max-h-[90vh] overflow-y-auto animate-fade-in space-y-6">
            <h3 className="font-black text-lg text-brand-dark border-b border-gray-100 pb-3">
              {editingBranch ? "Edit Cabang Ojol" : "Tambah Cabang Ojol Baru"}
            </h3>

            <form onSubmit={handleBranchSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5">Nama Cabang *</label>
                <input
                  type="text"
                  required
                  value={branchName}
                  onChange={(e) => {
                    setBranchName(e.target.value);
                    if (formErrors.branchName) {
                      setFormErrors((prev) => ({ ...prev, branchName: false }));
                    }
                  }}
                  placeholder="Contoh: Ayapi Tebet, Jakarta Selatan"
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none transition-all ${
                    formErrors.branchName
                      ? "border-red-500 ring-1 ring-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50/10"
                      : "border-gray-200 focus:border-brand-red focus:ring-1 focus:ring-brand-red"
                  }`}
                />
              </div>

              {/* GoFood URL */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5">Link GoFood</label>
                <input
                  type="text"
                  value={branchGofood}
                  onChange={(e) => {
                    setBranchGofood(e.target.value);
                    if (formErrors.gofood) {
                      setFormErrors((prev) => ({ ...prev, gofood: false }));
                    }
                  }}
                  placeholder="https://gofood.link/a/..."
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none transition-all ${
                    formErrors.gofood
                      ? "border-red-500 ring-1 ring-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50/10"
                      : "border-gray-200 focus:border-brand-red focus:ring-1 focus:ring-brand-red"
                  }`}
                />
              </div>

              {/* GrabFood URL */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5">Link GrabFood</label>
                <input
                  type="text"
                  value={branchGrabfood}
                  onChange={(e) => {
                    setBranchGrabfood(e.target.value);
                    if (formErrors.grabfood) {
                      setFormErrors((prev) => ({ ...prev, grabfood: false }));
                    }
                  }}
                  placeholder="https://r.grab.com/g/f/..."
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none transition-all ${
                    formErrors.grabfood
                      ? "border-red-500 ring-1 ring-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50/10"
                      : "border-gray-200 focus:border-brand-red focus:ring-1 focus:ring-brand-red"
                  }`}
                />
              </div>

              {/* ShopeeFood URL */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5">Link ShopeeFood</label>
                <input
                  type="text"
                  value={branchShopeefood}
                  onChange={(e) => {
                    setBranchShopeefood(e.target.value);
                    if (formErrors.shopeefood) {
                      setFormErrors((prev) => ({ ...prev, shopeefood: false }));
                    }
                  }}
                  placeholder="https://shopee.co.id/universal-link/now-food/shop/..."
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none transition-all ${
                    formErrors.shopeefood
                      ? "border-red-500 ring-1 ring-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50/10"
                      : "border-gray-200 focus:border-brand-red focus:ring-1 focus:ring-brand-red"
                  }`}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsBranchModalOpen(false)}
                  className="flex-1 py-3 bg-gray-50 border border-gray-200 text-gray-500 hover:bg-gray-100 font-bold uppercase tracking-wider rounded-xl text-xs transition-all cursor-pointer text-center"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-brand-red hover:bg-[#a01c1c] text-white font-extrabold uppercase tracking-widest py-3.5 rounded-xl text-xs transition-all duration-200 shadow-md hover:shadow-lg disabled:bg-gray-400 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Menyimpan...
                    </>
                  ) : (
                    "Simpan Cabang"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
         CUSTOM CONFIRMATION MODAL
         ========================================================================= */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
          ></div>
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full z-10 shadow-2xl border border-gray-100 relative animate-scale-up text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-red-50 text-brand-red rounded-full flex items-center justify-center shadow-inner">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="space-y-2">
              <h3 className="font-black text-lg text-brand-dark">{confirmModal.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{confirmModal.message}</p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                className="flex-1 py-3 bg-gray-50 border border-gray-200 text-gray-500 hover:bg-gray-100 font-bold uppercase tracking-wider rounded-xl text-xs transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmModal.onConfirm}
                className="flex-1 bg-brand-red hover:bg-[#a01c1c] text-white font-extrabold uppercase tracking-widest py-3.5 rounded-xl text-xs transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
