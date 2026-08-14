/* eslint-disable @next/next/no-img-element */
"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import QRCode from "qrcode";
import {
  logoutAdmin,
  getMenuItems,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  restoreMenuItem,
  getGalleryItems,
  addGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  restoreGalleryItem,
  uploadImage,
  getBranches,
  addBranch,
  updateBranch,
  deleteBranch,
  restoreBranch,
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
  // Link-in-Bio Actions
  getAdminLinks,
  addLink,
  updateLink,
  deleteLink,
  restoreLink,
  swapLinkOrder,
  getThemeSetting,
  updateThemeSetting,
  LinkItem,
  // Hero Slides Actions
  getAdminHeroSlides,
  addHeroSlide,
  updateHeroSlide,
  deleteHeroSlide,
  restoreHeroSlide,
  swapHeroSlideOrder,
  HeroSlide,
  // Testimonials Actions
  getAdminTestimonials,
  addTestimonial,
  updateTestimonial,
  deleteTestimonial,
  restoreTestimonial,
  swapTestimonialOrder,
  Testimonial,
  purgeExpiredDeletedItems,
  // Site Settings & Editable Features
  getAllSiteSettings,
  updateAllSiteSettings,
  getAdminPartnershipPackages,
  addPartnershipPackage,
  updatePartnershipPackage,
  deletePartnershipPackage,
  restorePartnershipPackage,
  PartnershipPackage,
  getAdminFaqs,
  addFaq,
  updateFaq,
  deleteFaq,
  restoreFaq,
  swapFaqOrder,
  FAQItem,
  getTrashItems,
  restoreTrashItem,
  permanentDeleteTrashItem,
  emptyAllTrashItems,
  TrashItem,
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
  } catch {
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
  type TabType = "menu" | "category" | "gallery" | "branch" | "leads" | "links" | "slideshow" | "testimonials" | "settings" | "packages" | "faqs" | "trash";
  const [activeTab, setActiveTabState] = useState<TabType>("menu");

  const setActiveTab = (tab: TabType) => {
    setActiveTabState(tab);
    setSelectedBranchIds([]);
    setSelectedLeadIds([]);
  };
  
  // Data States
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchIds, setSelectedBranchIds] = useState<string[]>([]);
  const [partnershipLeads, setPartnershipLeads] = useState<PartnershipLead[]>([]);
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [theme, setTheme] = useState<string>("peach");
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [siteSettings, setSiteSettings] = useState<Record<string, string>>({});
  const [packages, setPackages] = useState<PartnershipPackage[]>([]);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [trashItems, setTrashItems] = useState<TrashItem[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Undo / Garbage Collection State
  type UndoItem = {
    id: string;
    type: "menu" | "gallery" | "branch" | "link" | "slide" | "testimonial" | "package" | "faq";
    name: string;
    secondsRemaining: number;
    restoreAction: (id: string) => Promise<any>;
    reloadCallback: () => void;
  };
  const [undoList, setUndoList] = useState<UndoItem[]>([]);

  // Modal / Form States
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isSlideModalOpen, setIsSlideModalOpen] = useState(false);
  const [isTestimonialModalOpen, setIsTestimonialModalOpen] = useState(false);
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
  
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingGalleryItem, setEditingGalleryItem] = useState<GalleryItem | null>(null);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [editingLink, setEditingLink] = useState<LinkItem | null>(null);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [editingPackage, setEditingPackage] = useState<PartnershipPackage | null>(null);
  const [editingFaq, setEditingFaq] = useState<FAQItem | null>(null);


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
  const [branchOpenTime, setBranchOpenTime] = useState("10:00");
  const [branchCloseTime, setBranchCloseTime] = useState("22:00");

  // Form Fields - Link
  const [linkTitle, setLinkTitle] = useState("");
  const [linkSubtitle, setLinkSubtitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkIcon, setLinkIcon] = useState("WhatsApp");
  const [linkIsActive, setLinkIsActive] = useState(true);

  // Form Fields - Hero Slide
  const [slideAlt, setSlideAlt] = useState("");
  const [slideBadge, setSlideBadge] = useState("");
  const [slideTitle, setSlideTitle] = useState("");
  const [slideSub, setSlideSub] = useState("");
  const [slideButtonText, setSlideButtonText] = useState("");
  const [slideButtonLink, setSlideButtonLink] = useState("");
  const [slideButton2Text, setSlideButton2Text] = useState("");
  const [slideButton2Link, setSlideButton2Link] = useState("");
  const [slideIsActive, setSlideIsActive] = useState(true);

  // Form Fields - Testimonial
  const [testimonialName, setTestimonialName] = useState("");
  const [testimonialRole, setTestimonialRole] = useState("");
  const [testimonialRating, setTestimonialRating] = useState(5);
  const [testimonialReview, setTestimonialReview] = useState("");
  const [testimonialInitials, setTestimonialInitials] = useState("");
  const [testimonialBgGradient, setTestimonialBgGradient] = useState("from-red-500 to-orange-500");
  const [testimonialIsActive, setTestimonialIsActive] = useState(true);

  // Form Fields - Site Settings
  const [settingWaNumber, setSettingWaNumber] = useState("628213444730");
  const [settingWaFormatted, setSettingWaFormatted] = useState("+62 821-3444-730");
  const [settingCsEmail, setSettingCsEmail] = useState("ayapihr@gmail.com");
  const [settingAddress, setSettingAddress] = useState("Jl. Diponegoro No.177, Dauh Puri Klod, Kec. Denpasar Bar., Kota Denpasar, Bali 80113");
  const [settingInstagram, setSettingInstagram] = useState("https://instagram.com/ayapikrispibar");
  const [settingTiktok, setSettingTiktok] = useState("https://tiktok.com/@ayapikrispibar");
  const [settingHalal, setSettingHalal] = useState("ID3111000012345");
  const [settingHaki, setSettingHaki] = useState("IPT2024001234");
  const [settingCogsPercent, setSettingCogsPercent] = useState("55");
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Form Fields - Partnership Package
  const [pkgKey, setPkgKey] = useState("express");
  const [pkgName, setPkgName] = useState("");
  const [pkgPriceText, setPkgPriceText] = useState("");
  const [pkgPriceValue, setPkgPriceValue] = useState(50000000);
  const [pkgDesc, setPkgDesc] = useState("");
  const [pkgBadge, setPkgBadge] = useState("");
  const [pkgInclusionsText, setPkgInclusionsText] = useState("");

  // Form Fields - FAQ
  const [faqQuestion, setFaqQuestion] = useState("");
  const [faqAnswer, setFaqAnswer] = useState("");
  const [faqIsActive, setFaqIsActive] = useState(true);

  // QR Code URL state
  const [qrUrl, setQrUrl] = useState("");


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

  // Client-side soft-delete countdown timer
  useEffect(() => {
    if (undoList.length === 0) return;
    const interval = setInterval(() => {
      let hasExpired = false;
      setUndoList((prev) => {
        const next = prev.map((item) => ({
          ...item,
          secondsRemaining: item.secondsRemaining - 1,
        }));
        
        if (next.some((item) => item.secondsRemaining <= 0)) {
          hasExpired = true;
        }

        return next.filter((item) => item.secondsRemaining > 0);
      });

      if (hasExpired) {
        setTimeout(() => {
          purgeExpiredDeletedItems().catch(console.error);
        }, 0);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [undoList]);

  // Undo Handler
  const handleUndo = async (item: UndoItem) => {
    try {
      await item.restoreAction(item.id);
      item.reloadCallback();
      setUndoList((prev) => prev.filter((u) => u.id !== item.id));
      showMsg("success", `Berhasil memulihkan "${item.name}".`);
    } catch (err) {
      console.error(err);
      showMsg("error", `Gagal memulihkan "${item.name}".`);
    }
  };

  // Trigger Undo registration
  const triggerUndo = (
    id: string,
    type: "menu" | "gallery" | "branch" | "link" | "slide" | "testimonial" | "package" | "faq",
    name: string,
    restoreAction: (id: string) => Promise<any>,
    reloadCallback: () => void
  ) => {

    // Remove if already in undo list
    setUndoList((prev) => prev.filter((u) => u.id !== id || u.type !== type));
    const newItem: UndoItem = {
      id,
      type,
      name,
      secondsRemaining: 10, // 10 seconds
      restoreAction,
      reloadCallback,
    };
    setUndoList((prev) => [...prev, newItem]);
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

        // Lazy garbage collection of old soft-deleted items on dashboard load
        purgeExpiredDeletedItems();

        const [
          menus,
          galleries,
          branchesData,
          leadsData,
          categoriesData,
          linksData,
          themeData,
          slidesData,
          testimonialsData,
          settingsData,
          packagesData,
          faqsData,
          trashData,
        ] = await Promise.all([
          getMenuItems(),
          getGalleryItems(),
          getBranches(),
          getPartnershipLeads(),
          getCategories(),
          getAdminLinks(),
          getThemeSetting(),
          getAdminHeroSlides(),
          getAdminTestimonials(),
          getAllSiteSettings(),
          getAdminPartnershipPackages(),
          getAdminFaqs(),
          getTrashItems(),
        ]);

        if (active) {
          setMenuItems(menus);
          setGalleryItems(galleries);
          setBranches(branchesData);
          setPartnershipLeads(leadsData);
          setCategories(categoriesData);
          setLinks(linksData);
          setTheme(themeData);
          setHeroSlides(slidesData);
          setTestimonials(testimonialsData);
          setSiteSettings(settingsData);
          setPackages(packagesData);
          setFaqs(faqsData);
          setTrashItems(trashData);
          if (settingsData) {
            if (settingsData.wa_number) setSettingWaNumber(settingsData.wa_number);
            if (settingsData.wa_number_formatted) setSettingWaFormatted(settingsData.wa_number_formatted);
            if (settingsData.cs_email) setSettingCsEmail(settingsData.cs_email);
            if (settingsData.headquarter_address) setSettingAddress(settingsData.headquarter_address);
            if (settingsData.instagram_url) setSettingInstagram(settingsData.instagram_url);
            if (settingsData.tiktok_url) setSettingTiktok(settingsData.tiktok_url);
            if (settingsData.halal_cert_number) setSettingHalal(settingsData.halal_cert_number);
            if (settingsData.haki_cert_number) setSettingHaki(settingsData.haki_cert_number);
            if (settingsData.roi_cogs_percent) setSettingCogsPercent(settingsData.roi_cogs_percent);
          }
          setPackages(packagesData);
          setFaqs(faqsData);
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
    } catch (err) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : "Gagal menyimpan item menu.";
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
  const handleMenuDelete = async (id: string, name: string) => {
    try {
      await deleteMenuItem(id);
      setMenuItems((prev) => prev.filter((m) => m.id !== id));
      triggerUndo(id, "menu", name, restoreMenuItem, async () => {
        const updatedMenus = await getMenuItems();
        setMenuItems(updatedMenus);
      });
      showMsg("success", `Menu "${name}" dipindahkan ke keranjang sampah.`);
    } catch (err) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : `Gagal menghapus menu "${name}".`;
      showMsg("error", errMsg);
    }
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
    } catch (err) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : "Gagal menyimpan kategori.";
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
        } catch (err) {
          console.error(err);
          const errMsg = err instanceof Error ? err.message : `Gagal menghapus kategori "${name}".`;
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
    } catch (err) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : "Gagal menyimpan item galeri.";
      showMsg("error", errMsg);
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  // Handle Delete Gallery
  const handleGalleryDelete = async (id: string, title: string) => {
    try {
      await deleteGalleryItem(id);
      setGalleryItems((prev) => prev.filter((g) => g.id !== id));
      triggerUndo(id, "gallery", title, restoreGalleryItem, async () => {
        const updatedGallery = await getGalleryItems();
        setGalleryItems(updatedGallery);
      });
      showMsg("success", `Foto "${title}" dipindahkan ke keranjang sampah.`);
    } catch (err) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : `Gagal menghapus foto "${title}".`;
      showMsg("error", errMsg);
    }
  };

  // Open Branch Modal for Add
  // Open Branch Modal for Add
  const openBranchAdd = () => {
    setEditingBranch(null);
    setBranchName("");
    setBranchGofood("");
    setBranchGrabfood("");
    setBranchShopeefood("");
    setBranchOpenTime("10:00");
    setBranchCloseTime("22:00");
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
    setBranchOpenTime(branch.open_time || "10:00");
    setBranchCloseTime(branch.close_time || "22:00");
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
        open_time: branchOpenTime,
        close_time: branchCloseTime,
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
    } catch (err) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : "Gagal menyimpan cabang.";
      showMsg("error", errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Branch
  const handleBranchDelete = async (id: string, name: string) => {
    try {
      await deleteBranch(id);
      setBranches((prev) => prev.filter((b) => b.id !== id));
      triggerUndo(id, "branch", name, restoreBranch, async () => {
        const updatedBranches = await getBranches();
        setBranches(updatedBranches);
      });
      showMsg("success", `Cabang "${name}" dipindahkan ke keranjang sampah.`);
    } catch (err) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : `Gagal menghapus cabang "${name}".`;
      showMsg("error", errMsg);
    }
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
        } catch (err) {
          console.error(err);
          const errMsg = err instanceof Error ? err.message : "Gagal menghapus cabang terpilih secara massal.";
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
        } catch (err) {
          console.error(err);
          const errMsg = err instanceof Error ? err.message : `Gagal menghapus prospek "${name}".`;
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
        } catch (err) {
          console.error(err);
          const errMsg = err instanceof Error ? err.message : "Gagal menghapus prospek terpilih secara massal.";
          showMsg("error", errMsg);
        }
      }
    );
  };

  // Compile partnership leads data into a CSV blob and download it
  const handleExportLeadsCSV = () => {
    if (partnershipLeads.length === 0) return;

    // Header for CSV
    const headers = ["Nama Calon Mitra", "No. WhatsApp", "Tanggal Terdaftar", "Status Follow-up"];

    // Convert leads to rows
    const rows = partnershipLeads.map((lead) => {
      const formattedDate = lead.created_at
        ? new Date(lead.created_at).toLocaleString("id-ID", {
            dateStyle: "medium",
            timeStyle: "short",
          })
        : "-";

      // Escape commas, double quotes and newlines for CSV safety
      const name = `"${(lead.name || "").replace(/"/g, '""')}"`;
      const phone = `"${(lead.phone || "").replace(/"/g, '""')}"`;
      const date = `"${formattedDate.replace(/"/g, '""')}"`;
      const status = `"${(lead.status || "").replace(/"/g, '""')}"`;

      return [name, phone, date, status].join(",");
    });

    // Combine header and rows
    const csvContent = [headers.join(","), ...rows].join("\n");

    // Add BOM character to ensure proper UTF-8 encoding in Excel
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Leads_Kemitraan_Ayapi_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showMsg("success", "Data prospek kemitraan berhasil diekspor ke CSV.");
  };

  // Open Link Modal for Add
  const openLinkAdd = () => {
    setEditingLink(null);
    setLinkTitle("");
    setLinkSubtitle("");
    setLinkUrl("");
    setLinkIcon("WhatsApp");
    setLinkIsActive(true);
    setFormErrors({});
    setIsLinkModalOpen(true);
  };

  // Open Link Modal for Edit
  const openLinkEdit = (item: LinkItem) => {
    setEditingLink(item);
    setLinkTitle(item.title);
    setLinkSubtitle(item.subtitle);
    setLinkUrl(item.url);
    setLinkIcon(item.icon);
    setLinkIsActive(item.is_active !== false);
    setFormErrors({});
    setIsLinkModalOpen(true);
  };

  // Submit Link Form
  const handleLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: Record<string, boolean> = {};
    if (!linkTitle.trim()) errors.linkTitle = true;
    if (!linkUrl.trim()) errors.linkUrl = true;

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showMsg("error", "Silakan lengkapi kolom wajib yang ditandai merah.");
      return;
    }

    if (!isValidUrl(linkUrl) && !linkUrl.startsWith("/") && !linkUrl.startsWith("tel:") && !linkUrl.startsWith("mailto:")) {
      setFormErrors({ linkUrl: true });
      showMsg("error", "Tautan URL tidak valid! Harus diawali dengan http://, https://, atau berupa rute internal.");
      return;
    }

    setIsSubmitting(true);
    setFormErrors({});
    try {
      const payload = {
        title: linkTitle.trim(),
        subtitle: linkSubtitle.trim(),
        url: linkUrl.trim(),
        icon: linkIcon,
        is_active: linkIsActive,
      };

      if (editingLink && editingLink.id) {
        // Edit Mode
        const updated = await updateLink(editingLink.id, payload);
        setLinks((prev) =>
          prev.map((l) => (l.id === editingLink.id ? updated : l))
        );
        showMsg("success", `Tautan "${linkTitle}" berhasil diperbarui!`);
      } else {
        // Create Mode
        const added = await addLink(payload);
        setLinks((prev) => [...prev, added]);
        showMsg("success", `Tautan "${linkTitle}" berhasil ditambahkan!`);
      }

      setIsLinkModalOpen(false);
    } catch (err) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : "Gagal menyimpan tautan.";
      showMsg("error", errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Link is_active State
  const handleToggleLinkActive = async (id: string, currentStatus: boolean) => {
    try {
      const item = links.find((l) => l.id === id);
      if (!item) return;

      const updated = await updateLink(id, { is_active: !currentStatus });
      setLinks((prev) =>
        prev.map((l) => (l.id === id ? { ...l, is_active: updated.is_active } : l))
      );
      showMsg("success", `Status keaktifan tautan "${item.title}" berhasil diubah.`);
    } catch (err) {
      console.error(err);
      showMsg("error", "Gagal mengubah keaktifan tautan.");
    }
  };

  // Delete Link
  const handleLinkDelete = async (id: string, title: string) => {
    try {
      await deleteLink(id);
      setLinks((prev) => prev.filter((l) => l.id !== id));
      triggerUndo(id, "link", title, restoreLink, async () => {
        const updatedLinks = await getAdminLinks();
        setLinks(updatedLinks);
      });
      showMsg("success", `Tautan "${title}" dipindahkan ke keranjang sampah.`);
    } catch (err) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : `Gagal menghapus tautan "${title}".`;
      showMsg("error", errMsg);
    }
  };

  // Sort Order Move (Up/Down)
  const handleMoveLink = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= links.length) return;

    const link1 = links[index];
    const link2 = links[targetIndex];

    if (!link1.id || !link2.id) return;

    try {
      // Swap order optimistically
      const updatedLinks = [...links];
      const tempOrder = link1.sort_order;
      
      const newLink1 = { ...link1, sort_order: link2.sort_order };
      const newLink2 = { ...link2, sort_order: tempOrder };
      
      updatedLinks[index] = newLink2;
      updatedLinks[targetIndex] = newLink1;
      setLinks(updatedLinks);

      await swapLinkOrder(link1.id, link2.sort_order, link2.id, link1.sort_order);
      showMsg("success", "Urutan tautan berhasil diperbarui.");
    } catch (err) {
      console.error(err);
      showMsg("error", "Gagal memperbarui urutan tautan.");
      // Rollback
      const refreshedLinks = await getAdminLinks();
      setLinks(refreshedLinks);
    }
  };

  // Change Theme Setting
  const handleThemeChange = async (newTheme: string) => {
    try {
      setTheme(newTheme); // Optimistic Update
      await updateThemeSetting(newTheme);
      showMsg("success", `Tema kustom berhasil diubah ke "${newTheme.toUpperCase()}"!`);
    } catch (err) {
      console.error(err);
      showMsg("error", "Gagal memperbarui pengaturan tema.");
    }
  };

  // Generate QR Code dynamically
  useEffect(() => {
    const generateQR = async () => {
      try {
        const siteUrl = typeof window !== "undefined"
          ? `${window.location.protocol}//${window.location.host}/links`
          : "https://ayapikrispibar.com/links";

        const url = await QRCode.toDataURL(siteUrl, {
          width: 400,
          margin: 2,
          color: {
            dark: "#C62828", // brand-red
            light: "#FFFFFF" // white
          }
        });
        setQrUrl(url);
      } catch (err) {
        console.error("QR Code generation error:", err);
      }
    };
    generateQR();
  }, [links]);
  // ============================================================
  // HERO SLIDE CRUD HANDLERS
  // ============================================================

  const openSlideAdd = () => {
    setEditingSlide(null);
    setSlideAlt("");
    setSlideBadge("");
    setSlideTitle("");
    setSlideSub("");
    setSlideButtonText("");
    setSlideButtonLink("");
    setSlideButton2Text("");
    setSlideButton2Link("");
    setSlideIsActive(true);
    setImagePreview("");
    setImageUrlInput("");
    setSelectedFile(null);
    setFormErrors({});
    setIsSlideModalOpen(true);
  };

  const openSlideEdit = (slide: HeroSlide) => {
    setEditingSlide(slide);
    setSlideAlt(slide.alt);
    setSlideBadge(slide.badge || "");
    setSlideTitle(slide.title || "");
    setSlideSub(slide.sub);
    setSlideButtonText(slide.button_text || "");
    setSlideButtonLink(slide.button_link || "");
    setSlideButton2Text(slide.button2_text || "");
    setSlideButton2Link(slide.button2_link || "");
    setSlideIsActive(slide.is_active);
    setImagePreview(slide.image);
    setImageUrlInput(slide.image);
    setSelectedFile(null);
    setFormErrors({});
    setIsSlideModalOpen(true);
  };

  const handleSlideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: Record<string, boolean> = {};
    if (!slideAlt.trim()) errors.slideAlt = true;
    if (!selectedFile && !imageUrlInput.trim()) errors.image = true;

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showMsg("error", "Silakan lengkapi kolom wajib yang ditandai merah.");
      return;
    }

    if (!selectedFile && imageUrlInput && !isValidUrl(imageUrlInput)) {
      setFormErrors({ image: true });
      showMsg("error", "URL gambar tidak valid! Harus diawali http:// atau https://");
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
          fileToUpload = await compressImage(selectedFile);
        } catch (compressionErr) {
          console.warn("Compression failed, using original:", compressionErr);
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

      const slidePayload = {
        image: finalImageUrl,
        alt: slideAlt,
        badge: slideBadge,
        title: slideTitle,
        sub: slideSub,
        button_text: slideButtonText,
        button_link: slideButtonLink,
        button2_text: slideButton2Text,
        button2_link: slideButton2Link,
        is_active: slideIsActive,
        sort_order: editingSlide?.sort_order ?? heroSlides.length,
      };

      if (editingSlide && editingSlide.id) {
        const updated = await updateHeroSlide(editingSlide.id, slidePayload);
        setHeroSlides((prev) =>
          prev.map((s) => (s.id === editingSlide.id ? updated : s))
        );
        showMsg("success", `Slide "${slideAlt}" berhasil diperbarui!`);
      } else {
        const added = await addHeroSlide(slidePayload);
        setHeroSlides((prev) => [...prev, added]);
        showMsg("success", `Slide "${slideAlt}" berhasil ditambahkan!`);
      }

      setIsSlideModalOpen(false);
    } catch (err) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : "Gagal menyimpan slide.";
      showMsg("error", errMsg);
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  const handleSlideDelete = async (id: string, alt: string) => {
    try {
      await deleteHeroSlide(id);
      setHeroSlides((prev) => prev.filter((s) => s.id !== id));
      triggerUndo(id, "slide", alt, restoreHeroSlide, async () => {
        const updatedSlides = await getAdminHeroSlides();
        setHeroSlides(updatedSlides);
      });
      showMsg("success", `Slide "${alt}" dipindahkan ke keranjang sampah.`);
    } catch (err) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : `Gagal menghapus slide "${alt}".`;
      showMsg("error", errMsg);
    }
  };

  // Testimonials Action Handlers
  const openTestimonialAdd = () => {
    setEditingTestimonial(null);
    setTestimonialName("");
    setTestimonialRole("");
    setTestimonialRating(5);
    setTestimonialReview("");
    setTestimonialInitials("");
    setTestimonialBgGradient("from-red-500 to-orange-500");
    setTestimonialIsActive(true);
    setFormErrors({});
    setIsTestimonialModalOpen(true);
  };

  const openTestimonialEdit = (t: Testimonial) => {
    setEditingTestimonial(t);
    setTestimonialName(t.name);
    setTestimonialRole(t.role);
    setTestimonialRating(t.rating);
    setTestimonialReview(t.review);
    setTestimonialInitials(t.initials);
    setTestimonialBgGradient(t.bg_gradient);
    setTestimonialIsActive(t.is_active);
    setFormErrors({});
    setIsTestimonialModalOpen(true);
  };

  const handleTestimonialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors: Record<string, boolean> = {};
    if (!testimonialName.trim()) errors.testimonialName = true;
    if (!testimonialRole.trim()) errors.testimonialRole = true;
    if (!testimonialReview.trim()) errors.testimonialReview = true;
    if (!testimonialInitials.trim()) errors.testimonialInitials = true;

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showMsg("error", "Silakan lengkapi semua kolom wajib.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: testimonialName.trim(),
        role: testimonialRole.trim(),
        rating: testimonialRating,
        review: testimonialReview.trim(),
        initials: testimonialInitials.trim().toUpperCase(),
        bg_gradient: testimonialBgGradient,
        is_active: testimonialIsActive,
      };

      if (editingTestimonial && editingTestimonial.id) {
        // Edit mode
        const updated = await updateTestimonial(editingTestimonial.id, payload);
        setTestimonials((prev) =>
          prev.map((t) => (t.id === editingTestimonial.id ? { ...t, ...updated } : t))
        );
        showMsg("success", "Testimoni berhasil diperbarui!");
      } else {
        // Create mode
        const added = await addTestimonial(payload);
        setTestimonials((prev) => [...prev, added]);
        showMsg("success", "Testimoni baru berhasil ditambahkan!");
      }
      setIsTestimonialModalOpen(false);
    } catch (err) {
      console.error(err);
      showMsg("error", "Gagal menyimpan testimoni.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTestimonialDelete = async (id: string, name: string) => {
    try {
      await deleteTestimonial(id);
      setTestimonials((prev) => prev.filter((t) => t.id !== id));
      triggerUndo(id, "testimonial", name, restoreTestimonial, async () => {
        const actual = await getAdminTestimonials();
        setTestimonials(actual);
      });
      showMsg("success", `Testimoni dari "${name}" dipindahkan ke keranjang sampah.`);
    } catch (err) {
      console.error(err);
      showMsg("error", "Gagal menghapus testimoni.");
    }
  };

  const handleSwapTestimonialOrder = async (index1: number, index2: number) => {
    const t1 = testimonials[index1];
    const t2 = testimonials[index2];
    if (!t1 || !t2 || !t1.id || !t2.id) return;
    
    // Optimistic UI update
    const nextList = [...testimonials];
    const tempOrder = t1.sort_order;
    t1.sort_order = t2.sort_order;
    t2.sort_order = tempOrder;
    nextList[index1] = t2;
    nextList[index2] = t1;
    setTestimonials(nextList);

    try {
      await swapTestimonialOrder(t1.id, t1.sort_order, t2.id, t2.sort_order);
    } catch (err) {
      console.error(err);
      showMsg("error", "Gagal mengubah urutan testimoni.");
      const actual = await getAdminTestimonials();
      setTestimonials(actual);
    }
  };

  const handleToggleTestimonialActive = async (id: string, currentStatus: boolean) => {
    try {
      const updated = await updateTestimonial(id, { is_active: !currentStatus });
      setTestimonials((prev) =>
        prev.map((t) => (t.id === id ? { ...t, is_active: updated.is_active } : t))
      );
      showMsg("success", "Status testimoni berhasil diubah.");
    } catch (err) {
      console.error(err);
      showMsg("error", "Gagal mengubah status testimoni.");
    }
  };

  // SITE SETTINGS HANDLERS
  const handleSaveSiteSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const payload: Record<string, string> = {
        wa_number: settingWaNumber.trim(),
        wa_number_formatted: settingWaFormatted.trim(),
        cs_email: settingCsEmail.trim(),
        headquarter_address: settingAddress.trim(),
        instagram_url: settingInstagram.trim(),
        tiktok_url: settingTiktok.trim(),
        halal_cert_number: settingHalal.trim(),
        haki_cert_number: settingHaki.trim(),
        roi_cogs_percent: settingCogsPercent.trim(),
      };
      await updateAllSiteSettings(payload);
      setSiteSettings(payload);
      showMsg("success", "Pengaturan website berhasil disimpan & diperbarui!");
    } catch (err: any) {
      console.error(err);
      showMsg("error", err?.message || "Gagal menyimpan pengaturan website.");
    } finally {
      setIsSavingSettings(false);
    }
  };

  // PARTNERSHIP PACKAGES HANDLERS
  const openPackageAdd = () => {
    setEditingPackage(null);
    setPkgKey("express");
    setPkgName("");
    setPkgPriceText("");
    setPkgPriceValue(50000000);
    setPkgDesc("");
    setPkgBadge("");
    setPkgInclusionsText("");
    setSelectedFile(null);
    setImagePreview("");
    setImageUrlInput("");
    setIsPackageModalOpen(true);
  };

  const openPackageEdit = (pkg: PartnershipPackage) => {
    setEditingPackage(pkg);
    setPkgKey(pkg.package_key || "express");
    setPkgName(pkg.name || "");
    setPkgPriceText(pkg.price_text || "");
    setPkgPriceValue(pkg.price_value || 50000000);
    setPkgDesc(pkg.description || "");
    setPkgBadge(pkg.badge || "");
    setPkgInclusionsText(Array.isArray(pkg.inclusions) ? pkg.inclusions.join("\n") : "");
    setSelectedFile(null);
    setImagePreview("");
    setImageUrlInput(pkg.image || "");
    setIsPackageModalOpen(true);
  };

  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pkgName.trim() || !pkgPriceText.trim()) {
      showMsg("error", "Nama paket dan harga wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    try {
      let finalImageUrl = imageUrlInput;
      if (selectedFile) {
        setIsUploading(true);
        const uploadData = new FormData();
        uploadData.append("file", selectedFile);
        const uploadResult = await uploadImage(uploadData);
        if (uploadResult?.url) finalImageUrl = uploadResult.url;
        setIsUploading(false);
      }


      const inclusionsArray = pkgInclusionsText
        .split("\n")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const payload: PartnershipPackage = {
        package_key: pkgKey.trim(),
        name: pkgName.trim(),
        price_text: pkgPriceText.trim(),
        price_value: pkgPriceValue,
        description: pkgDesc.trim(),
        badge: pkgBadge.trim(),
        image: finalImageUrl || "/express_booth_mockup.png",
        inclusions: inclusionsArray,
        sort_order: editingPackage ? editingPackage.sort_order : packages.length + 1,
      };

      if (editingPackage && editingPackage.id) {
        const updated = await updatePartnershipPackage(editingPackage.id, payload);
        setPackages((prev) =>
          prev.map((p) => (p.id === editingPackage.id ? { ...p, ...updated } : p))
        );
        showMsg("success", "Paket kemitraan berhasil diperbarui!");
      } else {
        const added = await addPartnershipPackage(payload);
        setPackages((prev) => [...prev, added]);
        showMsg("success", "Paket kemitraan baru berhasil ditambahkan!");
      }
      setIsPackageModalOpen(false);
    } catch (err: any) {
      console.error(err);
      showMsg("error", err?.message || "Gagal menyimpan paket kemitraan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePackageDelete = async (id: string, name: string) => {
    try {
      await deletePartnershipPackage(id);
      setPackages((prev) => prev.filter((p) => p.id !== id));
      triggerUndo(id, "package", name, restorePartnershipPackage, async () => {
        const actual = await getAdminPartnershipPackages();
        setPackages(actual);
      });
      showMsg("success", `Paket "${name}" dipindahkan ke keranjang sampah.`);
    } catch (err: any) {
      console.error(err);
      showMsg("error", err?.message || "Gagal menghapus paket kemitraan.");
    }
  };

  // FAQ HANDLERS
  const openFaqAdd = () => {
    setEditingFaq(null);
    setFaqQuestion("");
    setFaqAnswer("");
    setFaqIsActive(true);
    setIsFaqModalOpen(true);
  };

  const openFaqEdit = (faq: FAQItem) => {
    setEditingFaq(faq);
    setFaqQuestion(faq.question || "");
    setFaqAnswer(faq.answer || "");
    setFaqIsActive(faq.is_active !== false);
    setIsFaqModalOpen(true);
  };

  const handleSaveFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqQuestion.trim() || !faqAnswer.trim()) {
      showMsg("error", "Pertanyaan dan jawaban FAQ wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: FAQItem = {
        question: faqQuestion.trim(),
        answer: faqAnswer.trim(),
        is_active: faqIsActive,
        sort_order: editingFaq ? editingFaq.sort_order : faqs.length + 1,
      };

      if (editingFaq && editingFaq.id) {
        const updated = await updateFaq(editingFaq.id, payload);
        setFaqs((prev) =>
          prev.map((f) => (f.id === editingFaq.id ? { ...f, ...updated } : f))
        );
        showMsg("success", "FAQ berhasil diperbarui!");
      } else {
        const added = await addFaq(payload);
        setFaqs((prev) => [...prev, added]);
        showMsg("success", "FAQ baru berhasil ditambahkan!");
      }
      setIsFaqModalOpen(false);
    } catch (err: any) {
      console.error(err);
      showMsg("error", err?.message || "Gagal menyimpan FAQ.");
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleFaqDelete = async (id: string, question: string) => {
    try {
      await deleteFaq(id);
      setFaqs((prev) => prev.filter((f) => f.id !== id));
      triggerUndo(id, "faq", question, restoreFaq, async () => {
        const actual = await getAdminFaqs();
        setFaqs(actual);
      });
      showMsg("success", `FAQ dipindahkan ke keranjang sampah.`);
    } catch (err) {
      console.error(err);
      showMsg("error", "Gagal menghapus FAQ.");
    }
  };

  const handleSwapFaqOrder = async (index1: number, index2: number) => {
    const f1 = faqs[index1];
    const f2 = faqs[index2];
    if (!f1 || !f2 || !f1.id || !f2.id) return;

    const nextList = [...faqs];
    const tempOrder = f1.sort_order || index1 + 1;
    f1.sort_order = f2.sort_order || index2 + 1;
    f2.sort_order = tempOrder;
    nextList[index1] = f2;
    nextList[index2] = f1;
    setFaqs(nextList);

    try {
      await swapFaqOrder(f1.id, f1.sort_order, f2.id, f2.sort_order);
    } catch (err) {
      console.error(err);
      showMsg("error", "Gagal mengubah urutan FAQ.");
      const actual = await getAdminFaqs();
      setFaqs(actual);
    }
  };

  const handleToggleFaqActive = async (id: string, currentStatus: boolean) => {
    try {
      const updated = await updateFaq(id, { is_active: !currentStatus });
      setFaqs((prev) =>
        prev.map((f) => (f.id === id ? { ...f, is_active: updated.is_active } : f))
      );
      showMsg("success", "Status FAQ berhasil diubah.");
    } catch (err) {
      console.error(err);
      showMsg("error", "Gagal mengubah status FAQ.");
    }
  };

  // Trash Bin Handlers
  const handleRestoreTrash = async (id: string, type: TrashItem["type"], title: string) => {
    try {
      await restoreTrashItem(id, type);
      showMsg("success", `"${title}" berhasil dipulihkan!`);
      const [updatedTrash, updatedMenu, updatedGallery, updatedBranches, updatedLinks, updatedSlides, updatedTestimonials] = await Promise.all([
        getTrashItems(),
        getMenuItems(),
        getGalleryItems(),
        getBranches(),
        getAdminLinks(),
        getAdminHeroSlides(),
        getAdminTestimonials(),
      ]);
      setTrashItems(updatedTrash);
      setMenuItems(updatedMenu);
      setGalleryItems(updatedGallery);
      setBranches(updatedBranches);
      setLinks(updatedLinks);
      setHeroSlides(updatedSlides);
      setTestimonials(updatedTestimonials);
    } catch (err) {
      console.error(err);
      showMsg("error", "Gagal memulihkan item.");
    }
  };

  const handlePermanentDeleteTrash = async (id: string, type: TrashItem["type"], title: string) => {
    try {
      await permanentDeleteTrashItem(id, type);
      setTrashItems((prev) => prev.filter((i) => !(i.id === id && i.type === type)));
      showMsg("success", `"${title}" dihapus secara permanen.`);
    } catch (err) {
      console.error(err);
      showMsg("error", "Gagal menghapus item secara permanen.");
    }
  };

  const handleEmptyTrash = async () => {
    try {
      await emptyAllTrashItems();
      setTrashItems([]);
      showMsg("success", "Keranjang sampah berhasil dikosongkan.");
    } catch (err) {
      console.error(err);
      showMsg("error", "Gagal mengosongkan keranjang sampah.");
    }
  };


  const handleMoveSlide = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= heroSlides.length) return;

    const slide1 = heroSlides[index];
    const slide2 = heroSlides[targetIndex];

    if (!slide1.id || !slide2.id) return;

    try {
      const updatedSlides = [...heroSlides];
      const tempOrder = slide1.sort_order;

      const newSlide1 = { ...slide1, sort_order: slide2.sort_order };
      const newSlide2 = { ...slide2, sort_order: tempOrder };

      updatedSlides[index] = newSlide2;
      updatedSlides[targetIndex] = newSlide1;
      setHeroSlides(updatedSlides);

      await swapHeroSlideOrder(slide1.id, slide2.sort_order, slide2.id, slide1.sort_order);
      showMsg("success", "Urutan slide berhasil diperbarui.");
    } catch (err) {
      console.error(err);
      showMsg("error", "Gagal memperbarui urutan slide.");
      const refreshed = await getAdminHeroSlides();
      setHeroSlides(refreshed);
    }
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
        {(() => {
          const tabsList: { id: TabType; label: string; icon: string; count?: number; badgeBg?: string }[] = [
            { id: "menu", label: "Daftar Menu", icon: "🍔", count: menuItems.length },
            { id: "category", label: "Kategori", icon: "📂", count: categories.length },
            { id: "gallery", label: "Galeri Visual", icon: "📸", count: galleryItems.length },
            { id: "branch", label: "Cabang Ojol", icon: "📍", count: branches.length },
            { id: "leads", label: "Leads Kemitraan", icon: "💼", count: partnershipLeads.length },
            { id: "links", label: "Kelola Tautan", icon: "🔗", count: links.length },
            { id: "slideshow", label: "Slideshow", icon: "🖼️", count: heroSlides.length },
            { id: "testimonials", label: "Testimoni", icon: "💬", count: testimonials.length },
            { id: "settings", label: "Pengaturan Web", icon: "⚙️" },
            { id: "packages", label: "Paket Franchise", icon: "📦", count: packages.length },
            { id: "faqs", label: "FAQ Franchise", icon: "❓", count: faqs.length },
            { id: "trash", label: "Keranjang Sampah", icon: "🗑️", count: trashItems.length, badgeBg: trashItems.length > 0 ? "bg-red-500 text-white" : "bg-gray-200/80 text-gray-700" },
          ];

          return (
            <div className="bg-white/90 backdrop-blur-md border border-gray-200/80 p-3.5 sm:p-5 rounded-3xl shadow-sm space-y-4">
              
              {/* Mobile Select Dropdown (HP Only) */}
              <div className="sm:hidden">
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-1.5 px-1">
                  Pilih Modul Admin
                </label>
                <div className="relative">
                  <select
                    value={activeTab}
                    onChange={(e) => setActiveTab(e.target.value as TabType)}
                    className="w-full bg-gray-50 border border-gray-200 text-brand-dark font-extrabold text-xs py-3 pl-4 pr-10 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-brand-red shadow-inner cursor-pointer"
                  >
                    {tabsList.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.icon} {t.label} {t.count !== undefined ? `(${t.count})` : ""}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-gray-500 text-xs">
                    ▼
                  </div>
                </div>
              </div>

              {/* Desktop & Touch Scrollable Pill Bar */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex gap-2 overflow-x-auto no-scrollbar py-1 scroll-smooth w-full">
                  {tabsList.map((t) => {
                    const isActive = activeTab === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setActiveTab(t.id)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all duration-200 flex items-center gap-2 cursor-pointer shrink-0 ${
                          isActive
                            ? "bg-gradient-to-r from-brand-red to-[#b81414] text-white shadow-md shadow-brand-red/25 scale-[1.02]"
                            : "text-gray-600 hover:bg-gray-100/90 hover:text-brand-dark bg-gray-50/80 border border-gray-100"
                        }`}
                      >
                        <span className="text-sm">{t.icon}</span>
                        <span>{t.label}</span>
                        {t.count !== undefined && (
                          <span
                            className={`px-2 py-0.5 text-[10px] font-black rounded-full transition-colors ${
                              isActive
                                ? "bg-white/20 text-white"
                                : t.badgeBg || "bg-gray-200/80 text-gray-700"
                            }`}
                          >
                            {t.count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Desktop Action CTA Button */}
                <div className="hidden lg:block shrink-0">
                  {activeTab === "menu" ? (
                    <button
                      onClick={openMenuAdd}
                      className="bg-brand-red hover:bg-[#a01c1c] text-white font-extrabold uppercase tracking-widest px-5 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all text-xs flex items-center gap-2 cursor-pointer whitespace-nowrap"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                      </svg>
                      Tambah Menu
                    </button>
                  ) : activeTab === "category" ? (
                    <button
                      onClick={openCategoryAdd}
                      className="bg-brand-red hover:bg-[#a01c1c] text-white font-extrabold uppercase tracking-widest px-5 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all text-xs flex items-center gap-2 cursor-pointer whitespace-nowrap"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                      </svg>
                      Tambah Kategori
                    </button>
                  ) : activeTab === "gallery" ? (
                    <button
                      onClick={openGalleryAdd}
                      className="bg-brand-red hover:bg-[#a01c1c] text-white font-extrabold uppercase tracking-widest px-5 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all text-xs flex items-center gap-2 cursor-pointer whitespace-nowrap"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                      </svg>
                      Tambah Foto
                    </button>
                  ) : activeTab === "branch" ? (
                    <button
                      onClick={openBranchAdd}
                      className="bg-brand-red hover:bg-[#a01c1c] text-white font-extrabold uppercase tracking-widest px-5 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all text-xs flex items-center gap-2 cursor-pointer whitespace-nowrap"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                      </svg>
                      Tambah Cabang
                    </button>
                  ) : activeTab === "links" ? (
                    <button
                      onClick={openLinkAdd}
                      className="bg-brand-red hover:bg-[#a01c1c] text-white font-extrabold uppercase tracking-widest px-5 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all text-xs flex items-center gap-2 cursor-pointer whitespace-nowrap"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                      </svg>
                      Tambah Tautan
                    </button>
                  ) : activeTab === "slideshow" ? (
                    <button
                      onClick={openSlideAdd}
                      className="bg-brand-red hover:bg-[#a01c1c] text-white font-extrabold uppercase tracking-widest px-5 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all text-xs flex items-center gap-2 cursor-pointer whitespace-nowrap"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                      </svg>
                      Tambah Slide
                    </button>
                  ) : activeTab === "testimonials" ? (
                    <button
                      onClick={openTestimonialAdd}
                      className="bg-brand-red hover:bg-[#a01c1c] text-white font-extrabold uppercase tracking-widest px-5 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all text-xs flex items-center gap-2 cursor-pointer whitespace-nowrap"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                      </svg>
                      Tambah Testimoni
                    </button>
                  ) : activeTab === "packages" ? (
                    <button
                      onClick={openPackageAdd}
                      className="bg-brand-red hover:bg-[#a01c1c] text-white font-extrabold uppercase tracking-widest px-5 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all text-xs flex items-center gap-2 cursor-pointer whitespace-nowrap"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                      </svg>
                      Tambah Paket
                    </button>
                  ) : activeTab === "faqs" ? (
                    <button
                      onClick={openFaqAdd}
                      className="bg-brand-red hover:bg-[#a01c1c] text-white font-extrabold uppercase tracking-widest px-5 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all text-xs flex items-center gap-2 cursor-pointer whitespace-nowrap"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                      </svg>
                      Tambah FAQ
                    </button>
                  ) : activeTab === "trash" ? (
                    trashItems.length > 0 && (
                      <button
                        onClick={() => askConfirmation("Kosongkan Sampah", "Apakah Anda yakin ingin menghapus semua item di Keranjang Sampah secara permanen?", handleEmptyTrash)}
                        className="bg-red-600 hover:bg-red-700 text-white font-extrabold uppercase tracking-widest px-5 py-2.5 rounded-xl shadow-sm transition-all text-xs flex items-center gap-2 cursor-pointer whitespace-nowrap"
                      >
                        🗑️ Kosongkan Sampah
                      </button>
                    )
                  ) : null}
                </div>
              </div>

              {/* Action CTA Button on Mobile & Tablet */}
              <div className="lg:hidden">
                {activeTab === "menu" ? (
                  <button
                    onClick={openMenuAdd}
                    className="w-full bg-brand-red hover:bg-[#a01c1c] text-white font-extrabold uppercase tracking-widest px-6 py-3 rounded-xl shadow-sm transition-all text-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                    Tambah Menu
                  </button>
                ) : activeTab === "category" ? (
                  <button
                    onClick={openCategoryAdd}
                    className="w-full bg-brand-red hover:bg-[#a01c1c] text-white font-extrabold uppercase tracking-widest px-6 py-3 rounded-xl shadow-sm transition-all text-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                    Tambah Kategori
                  </button>
                ) : activeTab === "gallery" ? (
                  <button
                    onClick={openGalleryAdd}
                    className="w-full bg-brand-red hover:bg-[#a01c1c] text-white font-extrabold uppercase tracking-widest px-6 py-3 rounded-xl shadow-sm transition-all text-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                    Tambah Foto
                  </button>
                ) : activeTab === "branch" ? (
                  <button
                    onClick={openBranchAdd}
                    className="w-full bg-brand-red hover:bg-[#a01c1c] text-white font-extrabold uppercase tracking-widest px-6 py-3 rounded-xl shadow-sm transition-all text-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                    Tambah Cabang
                  </button>
                ) : activeTab === "links" ? (
                  <button
                    onClick={openLinkAdd}
                    className="w-full bg-brand-red hover:bg-[#a01c1c] text-white font-extrabold uppercase tracking-widest px-6 py-3 rounded-xl shadow-sm transition-all text-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                    Tambah Tautan
                  </button>
                ) : activeTab === "slideshow" ? (
                  <button
                    onClick={openSlideAdd}
                    className="w-full bg-brand-red hover:bg-[#a01c1c] text-white font-extrabold uppercase tracking-widest px-6 py-3 rounded-xl shadow-sm transition-all text-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                    Tambah Slide
                  </button>
                ) : activeTab === "testimonials" ? (
                  <button
                    onClick={openTestimonialAdd}
                    className="w-full bg-brand-red hover:bg-[#a01c1c] text-white font-extrabold uppercase tracking-widest px-6 py-3 rounded-xl shadow-sm transition-all text-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                    Tambah Testimoni
                  </button>
                ) : activeTab === "packages" ? (
                  <button
                    onClick={openPackageAdd}
                    className="w-full bg-brand-red hover:bg-[#a01c1c] text-white font-extrabold uppercase tracking-widest px-6 py-3 rounded-xl shadow-sm transition-all text-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                    Tambah Paket
                  </button>
                ) : activeTab === "faqs" ? (
                  <button
                    onClick={openFaqAdd}
                    className="w-full bg-brand-red hover:bg-[#a01c1c] text-white font-extrabold uppercase tracking-widest px-6 py-3 rounded-xl shadow-sm transition-all text-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                    Tambah FAQ
                  </button>
                ) : activeTab === "trash" ? (
                  trashItems.length > 0 && (
                    <button
                      onClick={() => askConfirmation("Kosongkan Sampah", "Apakah Anda yakin ingin menghapus semua item di Keranjang Sampah secara permanen?", handleEmptyTrash)}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-extrabold uppercase tracking-widest px-5 py-3 rounded-xl shadow-sm transition-all text-xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      🗑️ Kosongkan Sampah
                    </button>
                  )
                ) : null}
              </div>

            </div>
          );
        })()}

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
              <div className="space-y-6 animate-fade-in">
                {/* Stats Dashboard Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Card 1: Total Leads */}
                  <div className="bg-white border border-gray-200/60 p-5 rounded-3xl shadow-sm flex items-center gap-4">
                    <div className="bg-blue-50 text-blue-600 p-4 rounded-2xl">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Leads</p>
                      <h4 className="text-2xl font-black text-brand-dark">{partnershipLeads.length}</h4>
                    </div>
                  </div>

                  {/* Card 2: New Leads */}
                  <div className="bg-white border border-gray-200/60 p-5 rounded-3xl shadow-sm flex items-center gap-4">
                    <div className="bg-sky-50 text-sky-600 p-4 rounded-2xl">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Prospek Baru</p>
                      <h4 className="text-2xl font-black text-brand-dark">
                        {partnershipLeads.filter((l) => l.status === "Baru").length}
                      </h4>
                    </div>
                  </div>

                  {/* Card 3: In Progress Leads */}
                  <div className="bg-white border border-gray-200/60 p-5 rounded-3xl shadow-sm flex items-center gap-4">
                    <div className="bg-amber-50 text-amber-600 p-4 rounded-2xl">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Dihubungi</p>
                      <h4 className="text-2xl font-black text-brand-dark">
                        {partnershipLeads.filter((l) => l.status === "Dihubungi").length}
                      </h4>
                    </div>
                  </div>

                  {/* Card 4: Mitra Resmi */}
                  <div className="bg-white border border-gray-200/60 p-5 rounded-3xl shadow-sm flex items-center gap-4">
                    <div className="bg-green-50 text-green-600 p-4 rounded-2xl">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Mitra Resmi</p>
                      <h4 className="text-2xl font-black text-brand-dark">
                        {partnershipLeads.filter((l) => l.status === "Mitra Resmi").length}
                      </h4>
                    </div>
                  </div>
                </div>

                {/* Table Container */}
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
              </div>
            )}

            {activeTab === "links" && (
              /* LINKS TAB CONTENT */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
                
                {/* Left Panel: Theme Select & QR Code */}
                <div className="lg:col-span-4 space-y-6">
                  {/* Theme Select Card */}
                  <div className="bg-white border border-gray-200/60 p-6 rounded-3xl shadow-sm space-y-4">
                    <div>
                      <h3 className="font-extrabold text-base text-brand-dark">Pilih Tema Halaman</h3>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Warna Linktree Kustom</p>
                    </div>
                    <div className="h-0.5 bg-gray-50"></div>
                    <div className="grid grid-cols-1 gap-2.5">
                      {[
                        { key: "peach", label: "Peach", desc: "Warm peach & kuning pastel", color: "bg-orange-100 text-orange-800 border-orange-200" },
                        { key: "crimson", label: "Crimson", desc: "Nuansa merah lembut", color: "bg-red-50 text-red-700 border-red-200" },
                        { key: "forest", label: "Forest", desc: "Nuansa hijau segar", color: "bg-green-50 text-green-700 border-green-200" },
                        { key: "midnight", label: "Midnight", desc: "Nuansa gelap premium", color: "bg-slate-900 text-slate-100 border-slate-800" },
                        { key: "lilac", label: "Lilac", desc: "Nuansa ungu elegan", color: "bg-purple-50 text-purple-700 border-purple-200" },
                      ].map((t) => (
                        <button
                          key={t.key}
                          onClick={() => handleThemeChange(t.key)}
                          className={`w-full p-3.5 rounded-2xl border flex items-center justify-between text-left transition-all active:scale-[0.98] cursor-pointer ${
                            theme === t.key
                              ? "border-brand-red bg-red-50/10 ring-2 ring-brand-red/10"
                              : "border-gray-200 hover:bg-gray-50 bg-white"
                          }`}
                        >
                          <div>
                            <span className="text-xs font-black text-brand-dark block">{t.label}</span>
                            <span className="text-[10px] text-gray-400 font-semibold mt-0.5 block">{t.desc}</span>
                          </div>
                          <span className={`w-6 h-6 rounded-full ${t.color} flex items-center justify-center border text-[10px] font-bold`}>
                            {theme === t.key ? "✓" : ""}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* QR Code Card */}
                  <div className="bg-white border border-gray-200/60 p-6 rounded-3xl shadow-sm flex flex-col items-center text-center space-y-4">
                    <div>
                      <h3 className="font-extrabold text-base text-brand-dark">QR Code Halaman</h3>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Tautan Fisik Outlet</p>
                    </div>
                    <div className="h-0.5 bg-gray-50 w-full"></div>
                    
                    {qrUrl ? (
                      <div className="space-y-4 w-full flex flex-col items-center">
                        <div className="border border-red-100 p-3 bg-red-50/10 rounded-2xl relative group">
                          <img
                            src={qrUrl}
                            alt="Ayapi QR Code"
                            className="w-44 h-44 object-contain"
                          />
                        </div>
                        <div className="text-[10px] text-gray-400 font-medium max-w-[200px] leading-relaxed">
                          Cetak QR Code ini untuk ditaruh di meja outlet atau bungkus kemasan Ayapi.
                        </div>
                        <a
                          href={qrUrl}
                          download="ayapi-link-qr.png"
                          className="w-full bg-brand-red hover:bg-[#a01c1c] text-white font-extrabold uppercase tracking-widest py-3 rounded-xl shadow-sm hover:shadow-md transition-all text-xs text-center block cursor-pointer"
                        >
                          Unduh QR Code (PNG)
                        </a>
                      </div>
                    ) : (
                      <div className="py-8 text-gray-400 text-xs font-bold">Membuat QR Code...</div>
                    )}
                  </div>
                </div>

                {/* Right Panel: Links CRUD Table */}
                <div className="lg:col-span-8 bg-white border border-gray-200/60 rounded-3xl overflow-hidden shadow-sm flex flex-col">
                  <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/20">
                    <div>
                      <h3 className="font-extrabold text-base text-brand-dark">Daftar Link Aktif</h3>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Urutan & Statistik Klik Pelanggan</p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 font-bold text-[10px] text-gray-400 uppercase tracking-wider">
                          <th className="py-4 px-6 text-center w-12">Urutan</th>
                          <th className="py-4 px-6">Tautan</th>
                          <th className="py-4 px-6 text-center">Klik</th>
                          <th className="py-4 px-6 text-center">Status</th>
                          <th className="py-4 px-6 text-center w-28">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {links.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-12 text-center text-xs text-gray-400 font-bold">
                              Tidak ada tautan tersedia. Klik &quot;Tambah Tautan&quot; untuk membuat.
                            </td>
                          </tr>
                        ) : (
                          links.map((link, idx) => (
                            <tr key={link.id} className="hover:bg-gray-50/50 text-xs">
                              {/* Reordering Controls */}
                              <td className="py-4 px-6 text-center">
                                <div className="flex flex-col items-center gap-1">
                                  <button
                                    onClick={() => handleMoveLink(idx, "up")}
                                    disabled={idx === 0}
                                    className={`p-1 rounded hover:bg-gray-100 disabled:opacity-30 cursor-pointer`}
                                    title="Pindahkan Ke Atas"
                                  >
                                    ▲
                                  </button>
                                  <span className="text-[10px] font-black text-gray-400">{idx + 1}</span>
                                  <button
                                    onClick={() => handleMoveLink(idx, "down")}
                                    disabled={idx === links.length - 1}
                                    className={`p-1 rounded hover:bg-gray-100 disabled:opacity-30 cursor-pointer`}
                                    title="Pindahkan Ke Bawah"
                                  >
                                    ▼
                                  </button>
                                </div>
                              </td>

                              {/* Title, Subtitle & Icon */}
                              <td className="py-4 px-6">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="bg-red-50 text-brand-red px-2 py-0.5 rounded-lg text-[10px] font-black uppercase">
                                      {link.icon}
                                    </span>
                                    <span className="font-extrabold text-brand-dark text-sm">{link.title}</span>
                                  </div>
                                  {link.subtitle && (
                                    <p className="text-[10px] text-gray-400 font-medium leading-tight">{link.subtitle}</p>
                                  )}
                                  <p className="text-[10px] text-brand-red font-medium leading-tight break-all">{link.url}</p>
                                </div>
                              </td>

                              {/* Click Count statistics */}
                              <td className="py-4 px-6 text-center font-bold text-gray-500 text-sm">
                                <span className="flex items-center justify-center gap-1 text-slate-700">
                                  👁️ {link.clicks || 0}
                                </span>
                              </td>

                              {/* is_active Toggle status */}
                              <td className="py-4 px-6 text-center">
                                <button
                                  onClick={() => handleToggleLinkActive(link.id!, link.is_active !== false)}
                                  className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-colors cursor-pointer focus:outline-none ${
                                    link.is_active !== false
                                      ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                      : "bg-gray-100 border-gray-200 text-gray-400"
                                  }`}
                                >
                                  {link.is_active !== false ? "Aktif" : "Nonaktif"}
                                </button>
                              </td>

                              {/* Edit & Delete Action Buttons */}
                              <td className="py-4 px-6 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => openLinkEdit(link)}
                                    className="p-2 border border-gray-200 hover:border-brand-red/40 hover:text-brand-red rounded-xl transition-all cursor-pointer bg-white text-gray-500"
                                    title="Edit Tautan"
                                  >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => handleLinkDelete(link.id!, link.title)}
                                    className="p-2 border border-gray-200 hover:border-brand-red/40 hover:text-brand-red rounded-xl transition-all cursor-pointer bg-white text-gray-500"
                                    title="Hapus Tautan"
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

              </div>
            )}

            {/* =================== SLIDESHOW TAB =================== */}
            {activeTab === "slideshow" && (
              <div className="space-y-6">
                <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/80">
                          <th className="py-4 px-6 text-left text-[10px] font-black uppercase tracking-wider text-gray-400">#</th>
                          <th className="py-4 px-6 text-left text-[10px] font-black uppercase tracking-wider text-gray-400">Preview</th>
                          <th className="py-4 px-6 text-left text-[10px] font-black uppercase tracking-wider text-gray-400">Detail Konten Slide</th>
                          <th className="py-4 px-6 text-center text-[10px] font-black uppercase tracking-wider text-gray-400">Status</th>
                          <th className="py-4 px-6 text-center text-[10px] font-black uppercase tracking-wider text-gray-400">Urutan</th>
                          <th className="py-4 px-6 text-center text-[10px] font-black uppercase tracking-wider text-gray-400">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {heroSlides.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-16 text-center text-xs text-gray-400 font-bold">
                              🖼️ Tidak ada slide tersedia. Klik &quot;Tambah Slide&quot; untuk membuat.
                            </td>
                          </tr>
                        ) : (
                          heroSlides.map((slide, index) => (
                            <tr key={slide.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                              <td className="py-4 px-6 text-xs font-bold text-gray-400">{index + 1}</td>
                              <td className="py-4 px-6">
                                <div className="w-28 h-16 rounded-xl overflow-hidden bg-gray-100 relative">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={slide.image} alt={slide.alt} className="w-full h-full object-cover" />
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <div className="space-y-1.5 max-w-[320px]">
                                  {slide.badge && (
                                    <span className="inline-block bg-brand-red/10 text-brand-red text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                                      {slide.badge}
                                    </span>
                                  )}
                                  <h4 className="text-xs font-black text-brand-dark leading-tight whitespace-pre-line">{slide.title || "Tanpa Headline"}</h4>
                                  <p className="text-[10px] text-gray-400 line-clamp-2 leading-relaxed">{slide.sub || "Tanpa Deskripsi"}</p>
                                  <div className="flex flex-wrap gap-x-2.5 gap-y-1 pt-1.5">
                                    <span className="text-[9px] font-bold text-gray-400">Alt: <span className="text-gray-500 font-semibold">{slide.alt}</span></span>
                                    {slide.button_text && (
                                      <span className="text-[9px] font-bold text-[#b8860b] bg-yellow-50 border border-yellow-200 px-1.5 py-0.5 rounded">
                                        Tombol 1: {slide.button_text} ({slide.button_link})
                                      </span>
                                    )}
                                    {slide.button2_text && (
                                      <span className="text-[9px] font-bold text-gray-500 bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded">
                                        Tombol 2: {slide.button2_text} ({slide.button2_link})
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-6 text-center">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${slide.is_active ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-gray-100 text-gray-400 border border-gray-200"}`}>
                                  {slide.is_active ? "Aktif" : "Nonaktif"}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    onClick={() => handleMoveSlide(index, "up")}
                                    disabled={index === 0}
                                    className="p-1.5 border border-gray-200 rounded-lg hover:border-brand-red/30 hover:text-brand-red disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer bg-white text-gray-400"
                                    title="Pindah Ke Atas"
                                  >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" /></svg>
                                  </button>
                                  <button
                                    onClick={() => handleMoveSlide(index, "down")}
                                    disabled={index === heroSlides.length - 1}
                                    className="p-1.5 border border-gray-200 rounded-lg hover:border-brand-red/30 hover:text-brand-red disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer bg-white text-gray-400"
                                    title="Pindah Ke Bawah"
                                  >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                                  </button>
                                </div>
                              </td>
                              <td className="py-4 px-6 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => openSlideEdit(slide)}
                                    className="p-2 border border-gray-200 hover:border-brand-red/40 hover:text-brand-red rounded-xl transition-all cursor-pointer bg-white text-gray-500"
                                    title="Edit Slide"
                                  >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => handleSlideDelete(slide.id!, slide.alt)}
                                    className="p-2 border border-gray-200 hover:border-brand-red/40 hover:text-brand-red rounded-xl transition-all cursor-pointer bg-white text-gray-500"
                                    title="Hapus Slide"
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
              </div>
            )}

            {activeTab === "testimonials" && (
              /* TESTIMONIALS TAB CONTENT */
              <div className="bg-white border border-gray-200/60 rounded-3xl overflow-hidden shadow-sm animate-fade-in">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/50">
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">Preview & Avatar</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">Nama Pelanggan</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">Peran / Posisi</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">Rating</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">Review</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-gray-400 text-center">Urutan</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-gray-400 text-center">Status</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-gray-400 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {testimonials.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-6 py-10 text-center text-gray-400 font-medium text-xs">
                            Belum ada testimoni. Klik tombol "Tambah Testimoni" untuk membuat baru.
                          </td>
                        </tr>
                      ) : (
                        testimonials.map((t, idx) => (
                          <tr key={t.id} className="hover:bg-gray-50/40 transition-all">
                            {/* Preview & Avatar */}
                            <td className="px-6 py-4">
                              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.bg_gradient} flex items-center justify-center text-white font-extrabold text-sm shadow-md`}>
                                {t.initials}
                              </div>
                            </td>
                            {/* Name */}
                            <td className="px-6 py-4 font-bold text-gray-900 text-xs">{t.name}</td>
                            {/* Role */}
                            <td className="px-6 py-4 text-gray-500 font-semibold text-xs">{t.role}</td>
                            {/* Rating */}
                            <td className="px-6 py-4">
                              <div className="flex gap-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <svg
                                    key={i}
                                    className={`w-3.5 h-3.5 ${i < t.rating ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"}`}
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                              </div>
                            </td>
                            {/* Review */}
                            <td className="px-6 py-4 text-xs font-semibold text-gray-500 max-w-xs truncate" title={t.review}>
                              {t.review}
                            </td>
                            {/* Sorting Order */}
                            <td className="px-6 py-4">
                              <div className="flex justify-center items-center gap-1">
                                <button
                                  onClick={() => handleSwapTestimonialOrder(idx, idx - 1)}
                                  disabled={idx === 0}
                                  className="p-1 text-gray-400 hover:text-brand-red disabled:opacity-30 disabled:hover:text-gray-400 cursor-pointer"
                                  title="Pindah Ke Atas"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleSwapTestimonialOrder(idx, idx + 1)}
                                  disabled={idx === testimonials.length - 1}
                                  className="p-1 text-gray-400 hover:text-brand-red disabled:opacity-30 disabled:hover:text-gray-400 cursor-pointer"
                                  title="Pindah Ke Bawah"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                            {/* Status */}
                            <td className="px-6 py-4 text-center">
                              <button
                                onClick={() => handleToggleTestimonialActive(t.id!, t.is_active)}
                                className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider cursor-pointer transition-all ${
                                  t.is_active
                                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                              >
                                {t.is_active ? "Aktif" : "Non-aktif"}
                              </button>
                            </td>
                            {/* Action Buttons */}
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => openTestimonialEdit(t)}
                                  className="p-2 border border-gray-200 hover:border-brand-red/40 hover:text-brand-red rounded-xl transition-all cursor-pointer bg-white text-gray-500"
                                  title="Edit Testimoni"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleTestimonialDelete(t.id!, t.name)}
                                  className="p-2 border border-gray-200 hover:border-brand-red/40 hover:text-brand-red rounded-xl transition-all cursor-pointer bg-white text-gray-500"
                                  title="Hapus Testimoni"
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

            {activeTab === "settings" && (
              /* SITE SETTINGS TAB CONTENT */
              <div className="bg-white border border-gray-200/60 rounded-3xl p-6 sm:p-8 shadow-sm animate-fade-in space-y-6">
                <div className="border-b border-gray-100 pb-4">
                  <h2 className="text-xl font-black text-brand-dark">Pengaturan Umum & Branding Website</h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Ubah informasi kontak CS, sosial media, nomor legalitas, dan parameter ROI secara terpusat di seluruh website AYAPI.
                  </p>
                </div>

                <form onSubmit={handleSaveSiteSettings} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* CS WhatsApp */}
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase text-gray-400 tracking-wider mb-1.5">
                        Nomor WA CS (Untuk Link Chat/Order) *
                      </label>
                      <input
                        type="text"
                        required
                        value={settingWaNumber}
                        onChange={(e) => setSettingWaNumber(e.target.value)}
                        placeholder="Contoh: 628213444730"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
                      />
                      <span className="text-[10px] text-gray-400 mt-1 block">Format tanpa + / spasi / strip (contoh: 628213444730).</span>
                    </div>

                    {/* Formatted WA */}
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase text-gray-400 tracking-wider mb-1.5">
                        Format Tampilan Nomor WA (Untuk Teks) *
                      </label>
                      <input
                        type="text"
                        required
                        value={settingWaFormatted}
                        onChange={(e) => setSettingWaFormatted(e.target.value)}
                        placeholder="Contoh: +62 821-3444-730"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
                      />
                    </div>

                    {/* CS Email */}
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase text-gray-400 tracking-wider mb-1.5">
                        Alamat Email CS Resmi *
                      </label>
                      <input
                        type="email"
                        required
                        value={settingCsEmail}
                        onChange={(e) => setSettingCsEmail(e.target.value)}
                        placeholder="Contoh: ayapihr@gmail.com"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
                      />
                    </div>

                    {/* Headquarter Address */}
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase text-gray-400 tracking-wider mb-1.5">
                        Alamat Kantor Pusat AYAPI *
                      </label>
                      <input
                        type="text"
                        required
                        value={settingAddress}
                        onChange={(e) => setSettingAddress(e.target.value)}
                        placeholder="Contoh: Jl. Diponegoro No.177, Dauh Puri Klod, Kec. Denpasar Bar., Kota Denpasar, Bali 80113"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
                      />
                    </div>

                    {/* Instagram URL */}
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase text-gray-400 tracking-wider mb-1.5">
                        URL Akun Instagram Official
                      </label>
                      <input
                        type="text"
                        value={settingInstagram}
                        onChange={(e) => setSettingInstagram(e.target.value)}
                        placeholder="https://instagram.com/ayapikrispibar"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
                      />
                    </div>

                    {/* TikTok URL */}
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase text-gray-400 tracking-wider mb-1.5">
                        URL Akun TikTok Official
                      </label>
                      <input
                        type="text"
                        value={settingTiktok}
                        onChange={(e) => setSettingTiktok(e.target.value)}
                        placeholder="https://tiktok.com/@ayapikrispibar"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
                      />
                    </div>

                    {/* Halal Cert Number */}
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase text-gray-400 tracking-wider mb-1.5">
                        Nomor Sertifikat Halal Indonesia
                      </label>
                      <input
                        type="text"
                        value={settingHalal}
                        onChange={(e) => setSettingHalal(e.target.value)}
                        placeholder="Contoh: ID3111000012345"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
                      />
                    </div>

                    {/* HKI Cert Number */}
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase text-gray-400 tracking-wider mb-1.5">
                        Nomor Pendaftaran Merek HKI
                      </label>
                      <input
                        type="text"
                        value={settingHaki}
                        onChange={(e) => setSettingHaki(e.target.value)}
                        placeholder="Contoh: IPT2024001234"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
                      />
                    </div>

                    {/* ROI COGS Percent */}
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase text-gray-400 tracking-wider mb-1.5">
                        Persentase HPP Bahan Baku Kalkulator ROI (%)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="90"
                        value={settingCogsPercent}
                        onChange={(e) => setSettingCogsPercent(e.target.value)}
                        placeholder="55"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex justify-end">
                    <button
                      type="submit"
                      disabled={isSavingSettings}
                      className="bg-brand-red hover:bg-[#a01c1c] text-white font-extrabold uppercase tracking-widest px-8 py-3.5 rounded-xl text-xs shadow-md hover:shadow-lg transition-all cursor-pointer disabled:bg-gray-400"
                    >
                      {isSavingSettings ? "Menyimpan..." : "Simpan Pengaturan Website"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === "packages" && (
              /* PARTNERSHIP PACKAGES TAB CONTENT */
              <div className="bg-white border border-gray-200/60 rounded-3xl overflow-hidden shadow-sm animate-fade-in">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/50">
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">Mockup</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">Nama Paket</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">Harga Investasi</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">Badge</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">Fasilitas / Inklusi</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-gray-400 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {packages.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-10 text-center text-gray-400 font-medium text-xs">
                            Belum ada paket kemitraan. Klik &quot;Tambah Paket&quot; untuk membuat.
                          </td>
                        </tr>
                      ) : (
                        packages.map((pkg) => (
                          <tr key={pkg.id} className="hover:bg-gray-50/40 transition-all text-xs">
                            <td className="px-6 py-4">
                              <div className="relative w-16 h-12 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                                <img src={pkg.image} alt={pkg.name} className="w-full h-full object-cover" />
                              </div>
                            </td>
                            <td className="px-6 py-4 font-bold text-gray-900">{pkg.name}</td>
                            <td className="px-6 py-4 font-extrabold text-brand-red">{pkg.price_text}</td>
                            <td className="px-6 py-4">
                              {pkg.badge ? (
                                <span className="bg-brand-red text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full">
                                  {pkg.badge}
                                </span>
                              ) : (
                                <span className="text-gray-300">-</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-gray-500 font-semibold">
                                {Array.isArray(pkg.inclusions) ? `${pkg.inclusions.length} fasilitas` : "-"}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => openPackageEdit(pkg)}
                                  className="p-2 border border-gray-200 hover:border-brand-red/40 hover:text-brand-red rounded-xl transition-all cursor-pointer bg-white text-gray-500"
                                  title="Edit Paket"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handlePackageDelete(pkg.id!, pkg.name)}
                                  className="p-2 border border-gray-200 hover:border-brand-red/40 hover:text-brand-red rounded-xl transition-all cursor-pointer bg-white text-gray-500"
                                  title="Hapus Paket"
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

            {activeTab === "faqs" && (
              /* FAQS TAB CONTENT */
              <div className="bg-white border border-gray-200/60 rounded-3xl overflow-hidden shadow-sm animate-fade-in">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/50">
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">Pertanyaan</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">Jawaban Ringkas</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-gray-400 text-center">Urutan</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-gray-400 text-center">Status</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-gray-400 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {faqs.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-10 text-center text-gray-400 font-medium text-xs">
                            Belum ada FAQ. Klik &quot;Tambah FAQ&quot; untuk membuat baru.
                          </td>
                        </tr>
                      ) : (
                        faqs.map((faq, idx) => (
                          <tr key={faq.id} className="hover:bg-gray-50/40 transition-all text-xs">
                            <td className="px-6 py-4 font-bold text-gray-900 max-w-xs">{faq.question}</td>
                            <td className="px-6 py-4 text-gray-500 font-medium max-w-sm truncate" title={faq.answer}>
                              {faq.answer}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex justify-center items-center gap-1">
                                <button
                                  onClick={() => handleSwapFaqOrder(idx, idx - 1)}
                                  disabled={idx === 0}
                                  className="p-1 text-gray-400 hover:text-brand-red disabled:opacity-30 disabled:hover:text-gray-400 cursor-pointer"
                                  title="Pindah Ke Atas"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleSwapFaqOrder(idx, idx + 1)}
                                  disabled={idx === faqs.length - 1}
                                  className="p-1 text-gray-400 hover:text-brand-red disabled:opacity-30 disabled:hover:text-gray-400 cursor-pointer"
                                  title="Pindah Ke Bawah"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <button
                                onClick={() => handleToggleFaqActive(faq.id!, faq.is_active !== false)}
                                className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider cursor-pointer transition-all ${
                                  faq.is_active !== false
                                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                              >
                                {faq.is_active !== false ? "Aktif" : "Non-aktif"}
                              </button>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => openFaqEdit(faq)}
                                  className="p-2 border border-gray-200 hover:border-brand-red/40 hover:text-brand-red rounded-xl transition-all cursor-pointer bg-white text-gray-500"
                                  title="Edit FAQ"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleFaqDelete(faq.id!, faq.question)}
                                  className="p-2 border border-gray-200 hover:border-brand-red/40 hover:text-brand-red rounded-xl transition-all cursor-pointer bg-white text-gray-500"
                                  title="Hapus FAQ"
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

            {/* ========================================== */}
            {/* TAB 12: KERANJANG SAMPAH (TRASH BIN)       */}
            {/* ========================================== */}
            {activeTab === "trash" && (
              <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
                  <div>
                    <h3 className="text-lg font-black text-brand-dark flex items-center gap-2">
                      🗑️ Keranjang Sampah ({trashItems.length})
                    </h3>
                    <p className="text-xs text-gray-400 font-medium mt-1">
                      Daftar semua data yang telah dihapus. Anda dapat memulihkan (restore) atau menghapus secara permanen.
                    </p>
                  </div>
                </div>

                {trashItems.length === 0 ? (
                  <div className="text-center py-16 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                    <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                      🗑️
                    </div>
                    <h4 className="font-bold text-gray-700 text-sm">Keranjang sampah kosong</h4>
                    <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                      Tidak ada item yang telah dihapus saat ini.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-gray-100 text-[11px] font-extrabold uppercase tracking-wider text-gray-400">
                          <th className="py-3.5 px-4">Item</th>
                          <th className="py-3.5 px-4">Tipe Data</th>
                          <th className="py-3.5 px-4">Waktu Dihapus</th>
                          <th className="py-3.5 px-4 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 text-xs">
                        {trashItems.map((item) => (
                          <tr key={`${item.type}-${item.id}`} className="hover:bg-gray-50/60 transition-colors">
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                {item.image && (
                                  <img src={item.image} alt={item.title} className="w-10 h-10 object-cover rounded-lg border border-gray-100 shrink-0" />
                                )}
                                <div>
                                  <p className="font-bold text-gray-800">{item.title}</p>
                                  {item.subtitle && <p className="text-[11px] text-gray-400 font-medium">{item.subtitle}</p>}
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="bg-gray-100 text-gray-700 font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border border-gray-200">
                                {item.type}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-gray-500 font-medium">
                              {new Date(item.deleted_at).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleRestoreTrash(item.id, item.type, item.title)}
                                  className="px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 font-bold rounded-lg text-xs transition-colors flex items-center gap-1 cursor-pointer"
                                >
                                  🔄 Pulihkan
                                </button>
                                <button
                                  onClick={() => askConfirmation("Hapus Permanen", `Hapus "${item.title}" secara permanen? Data tidak dapat dipulihkan lagi.`, () => handlePermanentDeleteTrash(item.id, item.type, item.title))}
                                  className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-lg text-xs transition-colors flex items-center gap-1 cursor-pointer"
                                >
                                  ❌ Hapus Permanen
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>



      {/* =========================================================================
         HERO SLIDE CRUD MODAL
         ========================================================================= */}

      {isSlideModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isSubmitting && setIsSlideModalOpen(false)}></div>

          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full z-10 shadow-2xl border border-gray-100 relative max-h-[90vh] overflow-y-auto animate-fade-in space-y-6">
            <h3 className="font-black text-lg text-brand-dark border-b border-gray-100 pb-3">
              {editingSlide ? "Edit Slide Hero" : "Tambah Slide Hero Baru"}
            </h3>

            <form onSubmit={handleSlideSubmit} className="space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5">Gambar Slide *</label>
                <div className={`border-2 border-dashed rounded-2xl p-4 text-center transition-colors ${formErrors.image ? "border-red-400 bg-red-50/30" : "border-gray-200 hover:border-brand-red/30"}`}>
                  {imagePreview ? (
                    <div className="relative w-full h-40 rounded-xl overflow-hidden bg-gray-100 mb-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => { setImagePreview(""); setImageUrlInput(""); setSelectedFile(null); }}
                        className="absolute top-2 right-2 bg-white/90 text-gray-500 hover:text-brand-red rounded-lg p-1.5 transition-colors cursor-pointer"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ) : null}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-brand-red/10 file:text-brand-red hover:file:bg-brand-red/20 cursor-pointer w-full"
                  />
                  <p className="text-[10px] text-gray-400 mt-2 font-semibold">Atau masukkan URL gambar di bawah:</p>
                  <input
                    type="text"
                    placeholder="https://example.com/gambar.jpg"
                    value={imageUrlInput}
                    onChange={(e) => {
                      setImageUrlInput(e.target.value);
                      if (e.target.value) { setImagePreview(e.target.value); setSelectedFile(null); }
                      if (formErrors.image) setFormErrors((prev) => ({ ...prev, image: false }));
                    }}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs mt-2 focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red/50 outline-none"
                  />
                </div>
              </div>

              {/* Alt Text */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5">Alt Text (Deskripsi Gambar) *</label>
                <input
                  type="text"
                  required
                  value={slideAlt}
                  onChange={(e) => { setSlideAlt(e.target.value); if (formErrors.slideAlt) setFormErrors((prev) => ({ ...prev, slideAlt: false })); }}
                  placeholder="Contoh: Ayam Krispi Bakar Spesial"
                  className={`w-full border rounded-xl px-4 py-3 text-xs focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red/50 outline-none transition-colors ${formErrors.slideAlt ? "border-red-400 bg-red-50/30" : "border-gray-200"}`}
                />
              </div>

              {/* Badge */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5">Badge Slide (Opsional)</label>
                <input
                  type="text"
                  value={slideBadge}
                  onChange={(e) => setSlideBadge(e.target.value)}
                  placeholder="Contoh: 🔥 KULINER FRANCHISE TERBAIK"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red/50 outline-none"
                />
              </div>

              {/* Title / Headline */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5">Headline Utama (Mendukung Enter / Baris Baru)</label>
                <textarea
                  rows={2}
                  value={slideTitle}
                  onChange={(e) => setSlideTitle(e.target.value)}
                  placeholder="Contoh: Aroma Smoky Juara,&#10;Bisnis Kuliner Luar Biasa"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red/50 outline-none"
                />
              </div>

              {/* Description (sub) */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5">Deskripsi / Paragraf Utama (Opsional)</label>
                <textarea
                  rows={3}
                  value={slideSub}
                  onChange={(e) => setSlideSub(e.target.value)}
                  placeholder="Masukkan kalimat promosi atau informasi detail slide..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red/50 outline-none"
                />
              </div>

              {/* Button 1 (Left / Primary) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5">Teks Tombol 1</label>
                  <input
                    type="text"
                    value={slideButtonText}
                    onChange={(e) => setSlideButtonText(e.target.value)}
                    placeholder="Contoh: 🍔 Lihat Menu"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red/50 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5">Link Tombol 1</label>
                  <input
                    type="text"
                    value={slideButtonLink}
                    onChange={(e) => setSlideButtonLink(e.target.value)}
                    placeholder="Contoh: /menu"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red/50 outline-none"
                  />
                </div>
              </div>

              {/* Button 2 (Right / Secondary) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5">Teks Tombol 2</label>
                  <input
                    type="text"
                    value={slideButton2Text}
                    onChange={(e) => setSlideButton2Text(e.target.value)}
                    placeholder="Contoh: 💼 Kemitraan"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red/50 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5">Link Tombol 2</label>
                  <input
                    type="text"
                    value={slideButton2Link}
                    onChange={(e) => setSlideButton2Link(e.target.value)}
                    placeholder="Contoh: /kemitraan"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red/50 outline-none"
                  />
                </div>
              </div>

              {/* Is Active Toggle */}
              <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-xl">
                <div>
                  <span className="text-xs font-bold text-brand-dark block">Status Aktif</span>
                  <span className="text-[10px] text-gray-400 font-semibold">Tampilkan slide ini di halaman utama</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSlideIsActive(!slideIsActive)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${slideIsActive ? "bg-emerald-500" : "bg-gray-300"}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${slideIsActive ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsSlideModalOpen(false)}
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-gray-50 border border-gray-200 text-gray-500 hover:bg-gray-100 font-bold uppercase tracking-wider rounded-xl text-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-brand-red hover:bg-[#a01c1c] text-white font-extrabold uppercase tracking-widest py-3.5 rounded-xl text-xs transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                      {isUploading ? "Mengunggah..." : "Menyimpan..."}
                    </>
                  ) : (
                    editingSlide ? "Simpan Perubahan" : "Tambah Slide"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
         LINK CRUD MODAL
         ========================================================================= */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isSubmitting && setIsLinkModalOpen(false)}></div>
          
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full z-10 shadow-2xl border border-gray-100 relative max-h-[90vh] overflow-y-auto animate-fade-in space-y-6">
            <h3 className="font-black text-lg text-brand-dark border-b border-gray-100 pb-3">
              {editingLink ? "Edit Tautan Halaman" : "Tambah Tautan Halaman Baru"}
            </h3>

            <form onSubmit={handleLinkSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5">Judul Tautan *</label>
                <input
                  type="text"
                  required
                  value={linkTitle}
                  onChange={(e) => {
                    setLinkTitle(e.target.value);
                    if (formErrors.linkTitle) {
                      setFormErrors((prev) => ({ ...prev, linkTitle: false }));
                    }
                  }}
                  placeholder="Contoh: WhatsApp Pemesanan"
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none transition-all ${
                    formErrors.linkTitle
                      ? "border-red-500 ring-1 ring-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50/10"
                      : "border-gray-200 focus:border-brand-red focus:ring-1 focus:ring-brand-red"
                  }`}
                />
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5">Sub-judul (Opsional)</label>
                <input
                  type="text"
                  value={linkSubtitle}
                  onChange={(e) => setLinkSubtitle(e.target.value)}
                  placeholder="Contoh: Pesan ojol/katering langsung ke outlet"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red transition-all"
                />
              </div>

              {/* Target URL */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5">Target URL Tautan *</label>
                <input
                  type="text"
                  required
                  value={linkUrl}
                  onChange={(e) => {
                    setLinkUrl(e.target.value);
                    if (formErrors.linkUrl) {
                      setFormErrors((prev) => ({ ...prev, linkUrl: false }));
                    }
                  }}
                  placeholder="Contoh: https://wa.me/628... atau /menu"
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none transition-all ${
                    formErrors.linkUrl
                      ? "border-red-500 ring-1 ring-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50/10"
                      : "border-gray-200 focus:border-brand-red focus:ring-1 focus:ring-brand-red"
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Icon selection */}
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5">Ikon Tautan *</label>
                  <select
                    value={linkIcon}
                    onChange={(e) => setLinkIcon(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold bg-white focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red transition-all cursor-pointer text-gray-700"
                  >
                    <option value="WhatsApp">💬 WhatsApp</option>
                    <option value="Instagram">📸 Instagram</option>
                    <option value="Globe">🌐 Website Utama</option>
                    <option value="ShoppingBag">🛍️ Shopee/Ojol</option>
                    <option value="FileText">📄 Proposal / PDF</option>
                    <option value="Briefcase">💼 Kemitraan / Bisnis</option>
                    <option value="Link">🔗 Tautan Umum</option>
                  </select>
                </div>

                {/* Status keaktifan */}
                <div className="flex flex-col justify-center">
                  <span className="block text-[10px] font-bold uppercase text-gray-400 mb-2">Status Tampilan</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="linkIsActive"
                      checked={linkIsActive}
                      onChange={(e) => setLinkIsActive(e.target.checked)}
                      className="w-4 h-4 text-brand-red border-gray-300 rounded focus:ring-brand-red cursor-pointer"
                    />
                    <label htmlFor="linkIsActive" className="text-xs font-bold text-gray-600 cursor-pointer select-none">
                      Tampilkan ke Publik
                    </label>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsLinkModalOpen(false)}
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
                    "Simpan Tautan"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

              {/* Operational Hours */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5">Jam Buka *</label>
                  <input
                    type="time"
                    required
                    value={branchOpenTime}
                    onChange={(e) => setBranchOpenTime(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-red focus:ring-1 focus:ring-brand-red text-xs font-semibold focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5">Jam Tutup *</label>
                  <input
                    type="time"
                    required
                    value={branchCloseTime}
                    onChange={(e) => setBranchCloseTime(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-red focus:ring-1 focus:ring-brand-red text-xs font-semibold focus:outline-none transition-all"
                  />
                </div>
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
         TESTIMONIAL CRUD MODAL
         ========================================================================= */}
      {isTestimonialModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isSubmitting && setIsTestimonialModalOpen(false)}></div>
          
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full z-10 shadow-2xl border border-gray-100 relative max-h-[90vh] overflow-y-auto animate-fade-in space-y-6">
            <h3 className="font-black text-lg text-brand-dark border-b border-gray-100 pb-3">
              {editingTestimonial ? "Edit Testimoni Pelanggan" : "Tambah Testimoni Pelanggan Baru"}
            </h3>

            <form onSubmit={handleTestimonialSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5">Nama Pelanggan *</label>
                <input
                  type="text"
                  required
                  value={testimonialName}
                  onChange={(e) => {
                    setTestimonialName(e.target.value);
                    // Automatically generate initials
                    const words = e.target.value.trim().split(/\s+/);
                    if (words.length > 0 && words[0]) {
                      const firstInit = words[0].charAt(0);
                      const lastInit = words.length > 1 ? words[words.length - 1].charAt(0) : "";
                      setTestimonialInitials((firstInit + lastInit).toUpperCase());
                    }
                    if (formErrors.testimonialName) {
                      setFormErrors((prev) => ({ ...prev, testimonialName: false }));
                    }
                  }}
                  placeholder="Contoh: Budi Santoso"
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none transition-all ${
                    formErrors.testimonialName
                      ? "border-red-500 ring-1 ring-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50/10"
                      : "border-gray-200 focus:border-brand-red focus:ring-1 focus:ring-brand-red"
                  }`}
                />
              </div>

              {/* Role / Occupation */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5">Pekerjaan / Peran *</label>
                <input
                  type="text"
                  required
                  value={testimonialRole}
                  onChange={(e) => {
                    setTestimonialRole(e.target.value);
                    if (formErrors.testimonialRole) {
                      setFormErrors((prev) => ({ ...prev, testimonialRole: false }));
                    }
                  }}
                  placeholder="Contoh: Pengusaha Muda / Pelanggan Setia"
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none transition-all ${
                    formErrors.testimonialRole
                      ? "border-red-500 ring-1 ring-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50/10"
                      : "border-gray-200 focus:border-brand-red focus:ring-1 focus:ring-brand-red"
                  }`}
                />
              </div>

              {/* Grid Initials & Rating & BG Gradient */}
              <div className="grid grid-cols-3 gap-4">
                {/* Initials */}
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5">Inisial Avatar *</label>
                  <input
                    type="text"
                    required
                    maxLength={2}
                    value={testimonialInitials}
                    onChange={(e) => {
                      setTestimonialInitials(e.target.value.toUpperCase());
                      if (formErrors.testimonialInitials) {
                        setFormErrors((prev) => ({ ...prev, testimonialInitials: false }));
                      }
                    }}
                    placeholder="BS"
                    className={`w-full px-4 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none transition-all text-center ${
                      formErrors.testimonialInitials
                        ? "border-red-500 ring-1 ring-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50/10"
                        : "border-gray-200 focus:border-brand-red focus:ring-1 focus:ring-brand-red"
                    }`}
                  />
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5">Rating Bintang *</label>
                  <select
                    value={testimonialRating}
                    onChange={(e) => setTestimonialRating(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-brand-red focus:ring-1 focus:ring-brand-red text-xs font-semibold focus:outline-none transition-all"
                  >
                    <option value={5}>⭐⭐⭐⭐% (5)</option>
                    <option value={4}>⭐⭐⭐⭐ (4)</option>
                    <option value={3}>⭐⭐⭐ (3)</option>
                    <option value={2}>⭐⭐ (2)</option>
                    <option value={1}>⭐ (1)</option>
                  </select>
                </div>

                {/* BG Gradient */}
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5">Warna Avatar *</label>
                  <select
                    value={testimonialBgGradient}
                    onChange={(e) => setTestimonialBgGradient(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-brand-red focus:ring-1 focus:ring-brand-red text-xs font-semibold focus:outline-none transition-all"
                  >
                    <option value="from-red-500 to-orange-500">Sunset (Merah-Oranye)</option>
                    <option value="from-orange-400 to-amber-500">Peach (Oranye-Kuning)</option>
                    <option value="from-rose-500 to-red-600">Crimson (Pink-Merah)</option>
                    <option value="from-purple-600 to-indigo-600">Royal (Ungu-Biru)</option>
                    <option value="from-cyan-500 to-blue-600">Ocean (Sian-Biru)</option>
                  </select>
                </div>
              </div>

              {/* Review Textarea */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5">Isi Review / Ulasan *</label>
                <textarea
                  required
                  rows={4}
                  value={testimonialReview}
                  onChange={(e) => {
                    setTestimonialReview(e.target.value);
                    if (formErrors.testimonialReview) {
                      setFormErrors((prev) => ({ ...prev, testimonialReview: false }));
                    }
                  }}
                  placeholder="Tuliskan pengalaman pelanggan di sini..."
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none transition-all resize-none ${
                    formErrors.testimonialReview
                      ? "border-red-500 ring-1 ring-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50/10"
                      : "border-gray-200 focus:border-brand-red focus:ring-1 focus:ring-brand-red"
                  }`}
                />
              </div>

              {/* Status Aktif */}
              <div className="flex items-center gap-2 py-1.5">
                <input
                  type="checkbox"
                  id="testimonialIsActive"
                  checked={testimonialIsActive}
                  onChange={(e) => setTestimonialIsActive(e.target.checked)}
                  className="rounded border-gray-300 text-brand-red focus:ring-brand-red w-4 h-4 cursor-pointer"
                />
                <label htmlFor="testimonialIsActive" className="text-xs font-bold text-gray-700 cursor-pointer select-none">
                  Tampilkan Testimoni di Halaman Utama (Aktif)
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsTestimonialModalOpen(false)}
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
                    "Simpan Testimoni"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* PARTNERSHIP PACKAGE CRUD MODAL */}

      {isPackageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsPackageModalOpen(false)}></div>
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full z-10 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto animate-scale-up">
            <div className="flex justify-between items-center pb-4 mb-6 border-b border-gray-100">
              <h3 className="font-extrabold text-lg text-brand-dark">
                {editingPackage ? "Edit Paket Kemitraan" : "Tambah Paket Kemitraan Baru"}
              </h3>
              <button onClick={() => setIsPackageModalOpen(false)} className="text-gray-400 hover:text-brand-dark p-1 cursor-pointer">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSavePackage} className="space-y-4">
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-gray-400 tracking-wider mb-1">Package Key *</label>
                <input
                  type="text"
                  required
                  value={pkgKey}
                  onChange={(e) => setPkgKey(e.target.value)}
                  placeholder="express, mini, atau premium"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase text-gray-400 tracking-wider mb-1">Nama Paket *</label>
                <input
                  type="text"
                  required
                  value={pkgName}
                  onChange={(e) => setPkgName(e.target.value)}
                  placeholder="Contoh: Express, Mini Resto, Premium Resto"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-gray-400 tracking-wider mb-1">Teks Harga *</label>
                  <input
                    type="text"
                    required
                    value={pkgPriceText}
                    onChange={(e) => setPkgPriceText(e.target.value)}
                    placeholder="Contoh: 50 Juta*"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-gray-400 tracking-wider mb-1">Nilai Harga (Angka Rp)</label>
                  <input
                    type="number"
                    value={pkgPriceValue}
                    onChange={(e) => setPkgPriceValue(Number(e.target.value))}
                    placeholder="50000000"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase text-gray-400 tracking-wider mb-1">Badge Spesial (Opsional)</label>
                <input
                  type="text"
                  value={pkgBadge}
                  onChange={(e) => setPkgBadge(e.target.value)}
                  placeholder="Contoh: Terpopuler / Hemat"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase text-gray-400 tracking-wider mb-1">Deskripsi Paket</label>
                <textarea
                  rows={2}
                  value={pkgDesc}
                  onChange={(e) => setPkgDesc(e.target.value)}
                  placeholder="Penjelasan ringkas paket kemitraan..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase text-gray-400 tracking-wider mb-1">Fasilitas / Inklusi Paket (1 Fasilitas per Baris)</label>
                <textarea
                  rows={4}
                  value={pkgInclusionsText}
                  onChange={(e) => setPkgInclusionsText(e.target.value)}
                  placeholder={"Booth Semi-Kontainer\nPeralatan Masak Lengkap\nStarter Kit Bahan Baku..."}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase text-gray-400 tracking-wider mb-1">URL Gambar / Upload Mockup</label>
                <input
                  type="text"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  placeholder="/express_booth_mockup.png"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red mb-2"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const compressed = await compressImage(file);
                      setSelectedFile(compressed);
                    }
                  }}
                  className="text-xs text-gray-500"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsPackageModalOpen(false)}
                  className="flex-1 py-3.5 border border-gray-200 text-gray-500 font-bold uppercase tracking-wider rounded-xl text-xs hover:bg-gray-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-brand-red hover:bg-[#a01c1c] text-white font-extrabold uppercase tracking-widest py-3.5 rounded-xl text-xs shadow-md hover:shadow-lg disabled:bg-gray-400 cursor-pointer"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Paket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FAQ CRUD MODAL */}
      {isFaqModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsFaqModalOpen(false)}></div>
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full z-10 shadow-2xl border border-gray-100 animate-scale-up">
            <div className="flex justify-between items-center pb-4 mb-6 border-b border-gray-100">
              <h3 className="font-extrabold text-lg text-brand-dark">
                {editingFaq ? "Edit FAQ Franchise" : "Tambah FAQ Baru"}
              </h3>
              <button onClick={() => setIsFaqModalOpen(false)} className="text-gray-400 hover:text-brand-dark p-1 cursor-pointer">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSaveFaq} className="space-y-4">
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-gray-400 tracking-wider mb-1">Pertanyaan *</label>
                <input
                  type="text"
                  required
                  value={faqQuestion}
                  onChange={(e) => setFaqQuestion(e.target.value)}
                  placeholder="Contoh: Apakah bumbu rahasia disediakan oleh pusat?"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase text-gray-400 tracking-wider mb-1">Jawaban Lengkap *</label>
                <textarea
                  rows={4}
                  required
                  value={faqAnswer}
                  onChange={(e) => setFaqAnswer(e.target.value)}
                  placeholder="Tuliskan jawaban yang jelas dan ramah..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="faqIsActive"
                  checked={faqIsActive}
                  onChange={(e) => setFaqIsActive(e.target.checked)}
                  className="w-4 h-4 text-brand-red focus:ring-brand-red rounded border-gray-300"
                />
                <label htmlFor="faqIsActive" className="text-xs font-bold text-gray-700">Tampilkan FAQ di Website (Aktif)</label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsFaqModalOpen(false)}
                  className="flex-1 py-3.5 border border-gray-200 text-gray-500 font-bold uppercase tracking-wider rounded-xl text-xs hover:bg-gray-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-brand-red hover:bg-[#a01c1c] text-white font-extrabold uppercase tracking-widest py-3.5 rounded-xl text-xs shadow-md hover:shadow-lg disabled:bg-gray-400 cursor-pointer"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan FAQ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Undo Notification Panel */}
      {undoList.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full animate-slide-up">
          {undoList.map((item) => (
            <div
              key={`${item.type}-${item.id}`}
              className="bg-white/95 backdrop-blur-md border border-gray-200 shadow-2xl p-4 rounded-2xl flex items-center justify-between gap-4 transition-all duration-300 transform hover:scale-[1.02]"
            >
              <div className="flex items-center gap-3">
                {/* Progress Ring / Timer */}
                <div className="relative flex items-center justify-center w-10 h-10 shrink-0">
                  <svg className="w-10 h-10 transform -rotate-90">
                    <circle
                      cx="20"
                      cy="20"
                      r="16"
                      className="text-gray-100"
                      strokeWidth="3"
                      fill="transparent"
                      stroke="currentColor"
                    />
                    <circle
                      cx="20"
                      cy="20"
                      r="16"
                      className="text-brand-red transition-all duration-1000"
                      strokeWidth="3"
                      fill="transparent"
                      stroke="currentColor"
                      strokeDasharray="100.53"
                      strokeDashoffset={100.53 * (1 - item.secondsRemaining / 10)}
                    />
                  </svg>
                  <span className="absolute text-[10px] font-bold text-gray-700">{item.secondsRemaining}s</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900 leading-tight">Dihapus</p>
                  <p className="text-[11px] text-gray-500 truncate max-w-[160px]">{item.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleUndo(item)}
                  className="bg-brand-red hover:bg-[#a01c1c] text-white text-xs font-extrabold uppercase px-3 py-1.5 rounded-lg shadow-sm hover:shadow transition-all cursor-pointer whitespace-nowrap"
                >
                  Urungkan
                </button>
                <button
                  onClick={() => setUndoList((prev) => prev.filter((u) => u.id !== item.id || u.type !== item.type))}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-lg transition-colors cursor-pointer"
                  title="Tutup (Abaikan)"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
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
