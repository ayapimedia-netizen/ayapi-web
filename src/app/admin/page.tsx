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
  uploadImage,
  getBranches,
  addBranch,
  updateBranch,
  deleteBranch,
  restoreBranch,
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
  // Promo Actions
  getAdminPromos,
  addPromo,
  updatePromo,
  deletePromo,
  restorePromo,
  swapPromoOrder,
  PromoItem,
  getTrashItems,
  restoreTrashItem,
  permanentDeleteTrashItem,
  emptyAllTrashItems,
  TrashItem,
  getAdminSecurityInfo,
  updateAdminCredentials,
  AdminSecurityInfo,
  uploadProposalPdf,
  updateProposalPdfUrl,
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
  type TabType =
    | "dashboard"
    | "menu"
    | "category"
    | "branch"
    | "leads"
    | "links"
    | "slideshow"
    | "promos"
    | "testimonials"
    | "settings"
    | "packages"
    | "faqs"
    | "trash";
  const [activeTab, setActiveTabState] = useState<TabType>("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [witaClock, setWitaClock] = useState("10:00:00");
  const [chartMode, setChartMode] = useState<"menu" | "links">("menu");

  // Menu Pagination & Filter States
  const [menuFilterCategory, setMenuFilterCategory] = useState<string>("all");
  const [menuFilterStock, setMenuFilterStock] = useState<"all" | "available" | "unavailable">("all");
  const [menuPerPage, setMenuPerPage] = useState<number>(10);
  const [menuCurrentPage, setMenuCurrentPage] = useState<number>(1);

  // Leads Pagination States
  const [leadsPerPage, setLeadsPerPage] = useState<number>(10);
  const [leadsCurrentPage, setLeadsCurrentPage] = useState<number>(1);

  const setActiveTab = (tab: TabType) => {
    setActiveTabState(tab);
    setSelectedBranchIds([]);
    setSelectedLeadIds([]);
    setSearchQuery("");
    setMenuCurrentPage(1);
    setLeadsCurrentPage(1);
    setIsSidebarOpen(false);
  };

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
      const wita = new Date(utcMs + 8 * 3600000);
      const pad = (n: number) => n.toString().padStart(2, "0");
      setWitaClock(`${pad(wita.getHours())}:${pad(wita.getMinutes())}:${pad(wita.getSeconds())}`);
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);
  
  // Data States
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchIds, setSelectedBranchIds] = useState<string[]>([]);
  const [partnershipLeads, setPartnershipLeads] = useState<PartnershipLead[]>([]);
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [theme, setTheme] = useState<string>("peach");
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [promos, setPromos] = useState<PromoItem[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [packages, setPackages] = useState<PartnershipPackage[]>([]);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [trashItems, setTrashItems] = useState<TrashItem[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Undo / Garbage Collection State
  type UndoItem = {
    id: string;
    type: "menu" | "branch" | "link" | "slide" | "promo" | "testimonial" | "package" | "faq";
    name: string;
    secondsRemaining: number;
    restoreAction: (id: string) => Promise<unknown>;
    reloadCallback: () => void;
  };
  const [undoList, setUndoList] = useState<UndoItem[]>([]);

  // Modal / Form States
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isSlideModalOpen, setIsSlideModalOpen] = useState(false);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [isTestimonialModalOpen, setIsTestimonialModalOpen] = useState(false);
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
  
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [editingLink, setEditingLink] = useState<LinkItem | null>(null);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [editingPromo, setEditingPromo] = useState<PromoItem | null>(null);
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

  // Form Fields - Promo
  const [promoTitle, setPromoTitle] = useState("");
  const [promoBadge, setPromoBadge] = useState("");
  const [promoDesc, setPromoDesc] = useState("");
  const [promoCtaText, setPromoCtaText] = useState("See More");
  const [promoActionType, setPromoActionType] = useState<"modal" | "link">("modal");
  const [promoLinkUrl, setPromoLinkUrl] = useState("");
  const [promoIsActive, setPromoIsActive] = useState(true);
  const [promoHighlight, setPromoHighlight] = useState("");
  const [promoDetailsDescription, setPromoDetailsDescription] = useState("");
  const [promoPoints, setPromoPoints] = useState<string[]>([]);
  const [newPointInput, setNewPointInput] = useState("");
  const [promoActionButtonText, setPromoActionButtonText] = useState("");
  const [promoActionButtonUrl, setPromoActionButtonUrl] = useState("");
  const [promoShowQrCode, setPromoShowQrCode] = useState(false);

  // File upload states for promo
  const [promoSelectedFile, setPromoSelectedFile] = useState<File | null>(null);
  const [promoImagePreview, setPromoImagePreview] = useState<string>("");
  const [promoImageUrlInput, setPromoImageUrlInput] = useState<string>("");

  const [bannerSelectedFile, setBannerSelectedFile] = useState<File | null>(null);
  const [bannerImagePreview, setBannerImagePreview] = useState<string>("");
  const [bannerImageUrlInput, setBannerImageUrlInput] = useState<string>("");
  const [useSameImageForBanner, setUseSameImageForBanner] = useState(true);

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
  const [settingAddress, setSettingAddress] = useState("Jl. Tukad Pakerisan No.96, Dauh Puri Klod, Kec. Denpasar Barat, Kota Denpasar, Bali");
  const [settingInstagram, setSettingInstagram] = useState("https://instagram.com/ayapikrispibar");
  const [settingTiktok, setSettingTiktok] = useState("https://tiktok.com/@ayapikrispibar");
  const [settingHalal, setSettingHalal] = useState("ID3111000012345");
  const [settingHaki, setSettingHaki] = useState("IPT2024001234");
  const [settingCogsPercent, setSettingCogsPercent] = useState("55");
  const [settingProposalUrl, setSettingProposalUrl] = useState("/proposal-kemitraan-ayapi.pdf");
  const [proposalPdfFile, setProposalPdfFile] = useState<File | null>(null);
  const [isUploadingProposal, setIsUploadingProposal] = useState(false);
  const [isSavingProposal, setIsSavingProposal] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Form Fields - Admin Security & Credentials
  const [securityInfo, setSecurityInfo] = useState<AdminSecurityInfo>({
    username: "admin",
    isCustomUsername: false,
    isCustomPassword: false,
    updatedAt: null,
  });
  const [adminUsernameInput, setAdminUsernameInput] = useState("admin");
  const [currentPasswordInput, setCurrentPasswordInput] = useState("");
  const [newPasswordInput, setNewPasswordInput] = useState("");
  const [confirmPasswordInput, setConfirmPasswordInput] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [capsLockActive, setCapsLockActive] = useState(false);
  const [isSavingCredentials, setIsSavingCredentials] = useState(false);

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
    type: "menu" | "branch" | "link" | "slide" | "promo" | "testimonial" | "package" | "faq",
    name: string,
    restoreAction: (id: string) => Promise<unknown>,
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
          branchesData,
          leadsData,
          categoriesData,
          linksData,
          themeData,
          slidesData,
          promosData,
          testimonialsData,
          settingsData,
          packagesData,
          faqsData,
          trashData,
          securityData,
        ] = await Promise.all([
          getMenuItems(),
          getBranches(),
          getPartnershipLeads(),
          getCategories(),
          getAdminLinks(),
          getThemeSetting(),
          getAdminHeroSlides(),
          getAdminPromos(),
          getAdminTestimonials(),
          getAllSiteSettings(),
          getAdminPartnershipPackages(),
          getAdminFaqs(),
          getTrashItems(),
          getAdminSecurityInfo(),
        ]);

        if (active) {
          setMenuItems(menus);
          setBranches(branchesData);
          setPartnershipLeads(leadsData);
          setCategories(categoriesData);
          setLinks(linksData);
          setTheme(themeData);
          setHeroSlides(slidesData);
          setPromos(promosData);
          setTestimonials(testimonialsData);
          setPackages(packagesData);
          setFaqs(faqsData);
          setTrashItems(trashData);
          if (securityData) {
            setSecurityInfo(securityData);
            setAdminUsernameInput(securityData.username);
          }
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
            if (settingsData.proposal_pdf_url) setSettingProposalUrl(settingsData.proposal_pdf_url);
          }
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
          : "https://ayapiku.com/links";

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

  // ============================================================
  // PROMO HANDLERS
  // ============================================================

  const reloadPromos = async () => {
    try {
      const data = await getAdminPromos();
      setPromos(data);
    } catch (err) {
      console.error("Gagal memuat data promo:", err);
    }
  };

  const openPromoAdd = () => {
    setEditingPromo(null);
    setPromoTitle("");
    setPromoBadge("🔥 PROMO SPESIAL");
    setPromoDesc("");
    setPromoCtaText("See More");
    setPromoActionType("modal");
    setPromoLinkUrl("");
    setPromoIsActive(true);
    setPromoHighlight("");
    setPromoDetailsDescription("");
    setPromoPoints([
      "Pesan langsung tanpa perantara",
      "Menu higienis, hangat, dan fresh",
      "Tersedia untuk makan di tempat dan take away"
    ]);
    setNewPointInput("");
    setPromoActionButtonText("Pesan via WhatsApp");
    setPromoActionButtonUrl("https://wa.me/628213444730");
    setPromoShowQrCode(false);

    setPromoSelectedFile(null);
    setPromoImagePreview("");
    setPromoImageUrlInput("");

    setBannerSelectedFile(null);
    setBannerImagePreview("");
    setBannerImageUrlInput("");
    setUseSameImageForBanner(true);

    setFormErrors({});
    setIsPromoModalOpen(true);
  };

  const openPromoEdit = (p: PromoItem) => {
    setEditingPromo(p);
    setPromoTitle(p.title);
    setPromoBadge(p.badge || "");
    setPromoDesc(p.desc || "");
    setPromoCtaText(p.ctaText || "See More");
    setPromoActionType(p.actionType || "modal");
    setPromoLinkUrl(p.linkUrl || "");
    setPromoIsActive(p.is_active ?? true);
    setPromoHighlight(p.details?.highlight || "");
    setPromoDetailsDescription(p.details?.description || "");
    setPromoPoints(p.details?.points ? [...p.details.points] : []);
    setNewPointInput("");
    setPromoActionButtonText(p.details?.actionButtonText || "");
    setPromoActionButtonUrl(p.details?.actionButtonUrl || "");
    setPromoShowQrCode(p.details?.showQrCode ?? false);

    setPromoSelectedFile(null);
    setPromoImagePreview(p.image);
    setPromoImageUrlInput(p.image);

    setBannerSelectedFile(null);
    setBannerImagePreview(p.bannerImage || p.image);
    setBannerImageUrlInput(p.bannerImage || p.image);
    setUseSameImageForBanner(p.bannerImage === p.image || !p.bannerImage);

    setFormErrors({});
    setIsPromoModalOpen(true);
  };

  const handleAddPromoPoint = () => {
    if (!newPointInput.trim()) return;
    setPromoPoints((prev) => [...prev, newPointInput.trim()]);
    setNewPointInput("");
  };

  const handleRemovePromoPoint = (idx: number) => {
    setPromoPoints((prev) => prev.filter((_, i) => i !== idx));
  };

  const handlePromoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: Record<string, boolean> = {};
    if (!promoTitle.trim()) errors.promoTitle = true;
    if (!promoDesc.trim()) errors.promoDesc = true;
    if (!promoSelectedFile && !promoImageUrlInput.trim()) errors.promoImage = true;

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showMsg("error", "Silakan lengkapi kolom yang wajib diisi!");
      return;
    }

    setIsSubmitting(true);
    setFormErrors({});

    try {
      let finalCardImage = promoImageUrlInput.trim();
      let finalBannerImage = bannerImageUrlInput.trim();

      if (promoSelectedFile) {
        setIsUploading(true);
        let fileToUpload = promoSelectedFile;
        try {
          fileToUpload = await compressImage(promoSelectedFile);
        } catch (compressionErr) {
          console.warn("Compression failed, using original:", compressionErr);
        }
        const uploadData = new FormData();
        uploadData.append("file", fileToUpload);
        const res = await uploadImage(uploadData);
        finalCardImage = res.url;
        setIsUploading(false);
      }

      if (useSameImageForBanner) {
        finalBannerImage = finalCardImage;
      } else if (bannerSelectedFile) {
        setIsUploading(true);
        let fileToUpload = bannerSelectedFile;
        try {
          fileToUpload = await compressImage(bannerSelectedFile);
        } catch (compressionErr) {
          console.warn("Compression failed, using original:", compressionErr);
        }
        const uploadData = new FormData();
        uploadData.append("file", fileToUpload);
        const res = await uploadImage(uploadData);
        finalBannerImage = res.url;
        setIsUploading(false);
      } else if (!finalBannerImage) {
        finalBannerImage = finalCardImage;
      }

      const payload = {
        title: promoTitle.trim(),
        badge: promoBadge.trim(),
        desc: promoDesc.trim(),
        image: finalCardImage,
        bannerImage: finalBannerImage,
        ctaText: promoCtaText.trim() || "See More",
        actionType: promoActionType,
        linkUrl: promoLinkUrl.trim(),
        is_active: promoIsActive,
        details: {
          highlight: promoHighlight.trim() || promoTitle.trim(),
          description: promoDetailsDescription.trim() || promoDesc.trim(),
          points: promoPoints.filter((p) => p.trim()),
          actionButtonText: promoActionButtonText.trim(),
          actionButtonUrl: promoActionButtonUrl.trim(),
          showQrCode: promoShowQrCode,
        },
      };

      if (editingPromo) {
        await updatePromo(editingPromo.id, payload);
        showMsg("success", `Promo "${promoTitle}" berhasil diperbarui!`);
      } else {
        await addPromo(payload);
        showMsg("success", `Promo "${promoTitle}" berhasil ditambahkan!`);
      }

      setIsPromoModalOpen(false);
      await reloadPromos();
    } catch (err: unknown) {
      console.error(err);
      showMsg("error", err instanceof Error ? err.message : "Gagal menyimpan promo.");
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  const handleDeletePromo = async (id: string, title: string) => {
    try {
      await deletePromo(id);
      triggerUndo(id, "promo", title, restorePromo, reloadPromos);
      await reloadPromos();
      const trash = await getTrashItems();
      setTrashItems(trash);
      showMsg("success", `Promo "${title}" dipindahkan ke keranjang sampah.`);
    } catch (err: unknown) {
      console.error(err);
      showMsg("error", err instanceof Error ? err.message : "Gagal menghapus promo.");
    }
  };

  const handleTogglePromoActive = async (p: PromoItem) => {
    try {
      const nextActive = !p.is_active;
      await updatePromo(p.id, { is_active: nextActive });
      await reloadPromos();
      showMsg("success", `Status promo "${p.title}" diubah menjadi ${nextActive ? "Aktif" : "Nonaktif"}.`);
    } catch (err: unknown) {
      console.error(err);
      showMsg("error", err instanceof Error ? err.message : "Gagal mengubah status promo.");
    }
  };

  const handleMovePromo = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= promos.length) return;
    const current = promos[index];
    const target = promos[targetIndex];
    try {
      await swapPromoOrder(current.id, current.sort_order ?? index + 1, target.id, target.sort_order ?? targetIndex + 1);
      await reloadPromos();
    } catch (err: unknown) {
      console.error(err);
      showMsg("error", err instanceof Error ? err.message : "Gagal mengubah urutan promo.");
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
    
    const order1 = t1.sort_order;
    const order2 = t2.sort_order;
    const nextList = [...testimonials];
    nextList[index1] = { ...t2, sort_order: order1 };
    nextList[index2] = { ...t1, sort_order: order2 };
    setTestimonials(nextList);

    try {
      await swapTestimonialOrder(t1.id, order2, t2.id, order1);
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
        proposal_pdf_url: settingProposalUrl.trim() || "/proposal-kemitraan-ayapi.pdf",
      };
      await updateAllSiteSettings(payload);
      showMsg("success", "Pengaturan website berhasil disimpan & diperbarui!");
    } catch (err: unknown) {
      console.error(err);
      showMsg("error", err instanceof Error ? err.message : "Gagal menyimpan pengaturan website.");
    } finally {
      setIsSavingSettings(false);
    }
  };

  // PROPOSAL PDF HANDLERS
  const handleProposalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 25 * 1024 * 1024) {
        showMsg("error", "Ukuran file PDF terlalu besar! Maksimal 25MB.");
        e.target.value = "";
        return;
      }
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (ext !== "pdf") {
        showMsg("error", "Format file tidak didukung! Hanya file PDF (.pdf) yang diperbolehkan.");
        e.target.value = "";
        return;
      }
      setProposalPdfFile(file);
    }
  };

  const handleSaveProposalPdf = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProposal(true);
    try {
      let finalUrl = settingProposalUrl.trim();

      if (proposalPdfFile) {
        setIsUploadingProposal(true);
        const formData = new FormData();
        formData.append("file", proposalPdfFile);
        const uploadResult = await uploadProposalPdf(formData);
        if (uploadResult?.url) {
          finalUrl = uploadResult.url;
          setSettingProposalUrl(uploadResult.url);
        }
        setIsUploadingProposal(false);
      }

      if (!finalUrl) {
        showMsg("error", "URL atau berkas PDF proposal wajib diisi.");
        return;
      }

      await updateProposalPdfUrl(finalUrl);
      setProposalPdfFile(null);
      showMsg("success", "File Proposal Kemitraan (PDF) berhasil diperbarui!");
    } catch (err: unknown) {
      console.error("Error saving proposal PDF:", err);
      showMsg("error", err instanceof Error ? err.message : "Gagal memperbarui file proposal PDF.");
    } finally {
      setIsSavingProposal(false);
      setIsUploadingProposal(false);
    }
  };

  // ADMIN SECURITY & CREDENTIALS HANDLERS
  const handleCapsLockEvent = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setCapsLockActive(e.getModifierState("CapsLock"));
  };

  const executeSaveAdminCredentials = async () => {
    setIsSavingCredentials(true);
    try {
      const result = await updateAdminCredentials({
        currentPassword: currentPasswordInput,
        newUsername: adminUsernameInput.trim(),
        newPassword: newPasswordInput.trim(),
        confirmPassword: confirmPasswordInput.trim(),
      });

      if (!result.success) {
        showMsg("error", result.error || "Gagal memperbarui kredensial admin.");
        return;
      }

      if (result.securityInfo) {
        setSecurityInfo(result.securityInfo);
        setAdminUsernameInput(result.securityInfo.username);
      }
      setCurrentPasswordInput("");
      setNewPasswordInput("");
      setConfirmPasswordInput("");
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      showMsg("success", result.message || "Kredensial admin berhasil diperbarui!");
    } catch (err: unknown) {
      console.error(err);
      showMsg("error", err instanceof Error ? err.message : "Terjadi kesalahan saat menyimpan kredensial.");
    } finally {
      setIsSavingCredentials(false);
    }
  };

  const handleSaveAdminCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = adminUsernameInput.trim();
    const cleanCurrent = currentPasswordInput.trim();
    const cleanNew = newPasswordInput.trim();
    const cleanConfirm = confirmPasswordInput.trim();

    if (!cleanCurrent) {
      showMsg("error", "Masukkan Password Saat Ini terlebih dahulu untuk verifikasi keamanan.");
      return;
    }

    const isUsernameChanging = cleanUser.toLowerCase() !== securityInfo.username.toLowerCase();
    const isPasswordChanging = cleanNew.length > 0 || cleanConfirm.length > 0;

    if (!isUsernameChanging && !isPasswordChanging) {
      showMsg("error", "Belum ada perubahan pada Username maupun Password Baru.");
      return;
    }

    if (cleanUser.length < 3 || cleanUser.length > 32 || !/^[a-zA-Z0-9._-]+$/.test(cleanUser)) {
      showMsg("error", "Username harus 3–32 karakter (huruf/angka/titik/garis bawah/strip, tanpa spasi).");
      return;
    }

    if (isPasswordChanging) {
      if (cleanNew.length < 8) {
        showMsg("error", "Password baru minimal 8 karakter.");
        return;
      }
      if (!/[a-zA-Z]/.test(cleanNew) || !/[0-9]/.test(cleanNew)) {
        showMsg("error", "Password baru harus mengandung kombinasi huruf dan angka.");
        return;
      }
      if (cleanNew.toLowerCase() === cleanUser.toLowerCase()) {
        showMsg("error", "Password baru tidak boleh sama dengan username admin.");
        return;
      }
      if (cleanNew !== cleanConfirm) {
        showMsg("error", "Konfirmasi password baru belum cocok! Periksa kembali ketikan Anda.");
        return;
      }
    }

    const summaryText =
      isUsernameChanging && isPasswordChanging
        ? `Anda akan mengganti Username menjadi "${cleanUser}" serta memperbarui Password Admin. Pastikan Anda sudah mencatat kredensial baru ini. Lanjutkan?`
        : isPasswordChanging
        ? `Anda akan memperbarui Password Admin untuk akun "${cleanUser}". Pastikan Anda sudah mengingat/mencatat password baru ini. Lanjutkan?`
        : `Anda akan mengganti Username Admin dari "${securityInfo.username}" menjadi "${cleanUser}". Lanjutkan?`;

    askConfirmation("Konfirmasi Perubahan Keamanan Akun", summaryText, executeSaveAdminCredentials);
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
    setImagePreview(pkg.image || "");
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
        let fileToUpload = selectedFile;
        try {
          fileToUpload = await compressImage(selectedFile);
        } catch (compressionErr) {
          console.warn("Client-side image compression failed, using original file:", compressionErr);
        }

        const uploadData = new FormData();
        uploadData.append("file", fileToUpload);
        const uploadResult = await uploadImage(uploadData);
        if (uploadResult?.url) finalImageUrl = uploadResult.url;
        setIsUploading(false);
      }

      if (!finalImageUrl) {
        finalImageUrl = editingPackage?.image || "/packages/booth-express-1.jpg";
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
        image: finalImageUrl,
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
    } catch (err: unknown) {
      console.error(err);
      showMsg("error", err instanceof Error ? err.message : "Gagal menyimpan paket kemitraan.");
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
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
    } catch (err: unknown) {
      console.error(err);
      showMsg("error", err instanceof Error ? err.message : "Gagal menghapus paket kemitraan.");
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
    } catch (err: unknown) {
      console.error(err);
      showMsg("error", err instanceof Error ? err.message : "Gagal menyimpan FAQ.");
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

    const order1 = f1.sort_order || index1 + 1;
    const order2 = f2.sort_order || index2 + 1;
    const nextList = [...faqs];
    nextList[index1] = { ...f2, sort_order: order1 };
    nextList[index2] = { ...f1, sort_order: order2 };
    setFaqs(nextList);

    try {
      await swapFaqOrder(f1.id, order2, f2.id, order1);
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

    const headers = ["Nama Calon Mitra", "No. WhatsApp", "Tanggal Terdaftar", "Status Follow-up"];
    const rows = partnershipLeads.map((lead) => {
      const formattedDate = lead.created_at
        ? new Date(lead.created_at).toLocaleString("id-ID", {
            dateStyle: "medium",
            timeStyle: "short",
          })
        : "-";
      const name = `"${(lead.name || "").replace(/"/g, '""')}"`;
      const phone = `"${(lead.phone || "").replace(/"/g, '""')}"`;
      const date = `"${formattedDate.replace(/"/g, '""')}"`;
      const status = `"${(lead.status || "").replace(/"/g, '""')}"`;
      return [name, phone, date, status].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
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

  // Trash Bin Handlers
  const handleRestoreTrash = async (id: string, type: TrashItem["type"], title: string) => {
    try {
      await restoreTrashItem(id, type);
      showMsg("success", `"${title}" berhasil dipulihkan!`);
      const [
        updatedTrash,
        updatedMenu,
        updatedBranches,
        updatedLinks,
        updatedSlides,
        updatedPromos,
        updatedTestimonials,
        updatedPackages,
        updatedFaqs,
      ] = await Promise.all([
        getTrashItems(),
        getMenuItems(),
        getBranches(),
        getAdminLinks(),
        getAdminHeroSlides(),
        getAdminPromos(),
        getAdminTestimonials(),
        getAdminPartnershipPackages(),
        getAdminFaqs(),
      ]);
      setTrashItems(updatedTrash);
      setMenuItems(updatedMenu);
      setBranches(updatedBranches);
      setLinks(updatedLinks);
      setHeroSlides(updatedSlides);
      setPromos(updatedPromos);
      setTestimonials(updatedTestimonials);
      setPackages(updatedPackages);
      setFaqs(updatedFaqs);
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

  const menuNavItems: {
    id: TabType;
    label: string;
    subtitle: string;
    icon: string;
    count?: number;
    addLabel?: string;
    onAdd?: () => void;
    searchable?: boolean;
  }[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      subtitle: "Ringkasan performa katalog menu, prospek kemitraan, dan pembaruan konten Ayapi.",
      icon: "⊞",
      addLabel: "Tambah Menu",
      onAdd: openMenuAdd,
    },
    {
      id: "menu",
      label: "Daftar Menu",
      subtitle: "Kelola katalog menu ayam krispi bakar, harga, kategori, dan stok harian.",
      icon: "🍔",
      count: menuItems.length,
      addLabel: "Tambah Menu",
      onAdd: openMenuAdd,
      searchable: true,
    },
    {
      id: "category",
      label: "Kategori",
      subtitle: "Atur pengelompokan kategori untuk navigasi katalog menu pelanggan.",
      icon: "📂",
      count: categories.length,
      addLabel: "Tambah Kategori",
      onAdd: openCategoryAdd,
      searchable: true,
    },
    {
      id: "branch",
      label: "Cabang Ojol",
      subtitle: "Kelola daftar lokasi outlet, jam operasional WITA, serta link GoFood, GrabFood & ShopeeFood.",
      icon: "📍",
      count: branches.length,
      addLabel: "Tambah Cabang",
      onAdd: openBranchAdd,
      searchable: true,
    },
    {
      id: "leads",
      label: "Leads Kemitraan",
      subtitle: "Pantau calon mitra franchise yang masuk, status follow-up WhatsApp, dan ekspor CSV.",
      icon: "💼",
      count: partnershipLeads.length,
      searchable: true,
    },
    {
      id: "slideshow",
      label: "Slideshow",
      subtitle: "Atur gambar banner utama, judul promosi, dan tombol CTA di beranda website.",
      icon: "🖼️",
      count: heroSlides.length,
      addLabel: "Tambah Slide",
      onAdd: openSlideAdd,
    },
    {
      id: "promos",
      label: "Promo Pop-up",
      subtitle: "Kelola kartu promo spesial, syarat & ketentuan pop-up modal, serta QR voucher.",
      icon: "🏷️",
      count: promos.length,
      addLabel: "Tambah Promo",
      onAdd: openPromoAdd,
    },
    {
      id: "testimonials",
      label: "Testimoni",
      subtitle: "Ulasan pelanggan dan cerita sukses mitra resmi Ayapi Krispi Bakar.",
      icon: "💬",
      count: testimonials.length,
      addLabel: "Tambah Testimoni",
      onAdd: openTestimonialAdd,
    },
    {
      id: "packages",
      label: "Paket Franchise",
      subtitle: "Konfigurasi harga investasi, mockup booth/resto, dan fasilitas paket kemitraan.",
      icon: "📦",
      count: packages.length,
      addLabel: "Tambah Paket",
      onAdd: openPackageAdd,
    },
    {
      id: "faqs",
      label: "FAQ Franchise",
      subtitle: "Daftar tanya-jawab seputar sistem kemitraan, bahan baku, dan SOP Ayapi.",
      icon: "❓",
      count: faqs.length,
      addLabel: "Tambah FAQ",
      onAdd: openFaqAdd,
    },
    {
      id: "links",
      label: "Kelola Tautan",
      subtitle: "Atur tombol halaman Link-in-Bio (/links), tema warna, dan QR Code meja outlet.",
      icon: "🔗",
      count: links.length,
      addLabel: "Tambah Tautan",
      onAdd: openLinkAdd,
    },
  ];

  const generalNavItems: {
    id: TabType;
    label: string;
    subtitle: string;
    icon: string;
    count?: number;
  }[] = [
    {
      id: "settings",
      label: "Pengaturan Web",
      subtitle: "Ubah nomor WhatsApp CS, email resmi, alamat kantor pusat, sertifikasi Halal/HKI, dan HPP ROI.",
      icon: "⚙️",
    },
    {
      id: "trash",
      label: "Keranjang Sampah",
      subtitle: "Pulihkan data yang terhapus atau kosongkan keranjang sampah secara permanen.",
      icon: "🗑️",
      count: trashItems.length,
    },
  ];

  const allTabItems = [...menuNavItems, ...generalNavItems];
  const currentTabInfo = allTabItems.find((t) => t.id === activeTab) || menuNavItems[0];
  const activeMenuInfo = menuNavItems.find((t) => t.id === activeTab);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredMenuItems = menuItems.filter((m) => {
    const matchesSearch =
      !normalizedQuery ||
      m.name.toLowerCase().includes(normalizedQuery) ||
      m.category.toLowerCase().includes(normalizedQuery) ||
      (m.description || "").toLowerCase().includes(normalizedQuery);
    const matchesCategory =
      menuFilterCategory === "all" || m.category.toLowerCase() === menuFilterCategory.toLowerCase();
    const matchesStock =
      menuFilterStock === "all" ||
      (menuFilterStock === "available" && m.is_available !== false) ||
      (menuFilterStock === "unavailable" && m.is_available === false);
    return matchesSearch && matchesCategory && matchesStock;
  });

  const totalMenuPages = Math.max(1, Math.ceil(filteredMenuItems.length / menuPerPage));
  const safeMenuPage = Math.min(menuCurrentPage, totalMenuPages);
  const paginatedMenuItems = filteredMenuItems.slice(
    (safeMenuPage - 1) * menuPerPage,
    safeMenuPage * menuPerPage
  );

  const filteredCategories = normalizedQuery
    ? categories.filter(
        (c) =>
          c.name.toLowerCase().includes(normalizedQuery) ||
          c.key.toLowerCase().includes(normalizedQuery)
      )
    : categories;

  const filteredBranches = normalizedQuery
    ? branches.filter((b) => b.name.toLowerCase().includes(normalizedQuery))
    : branches;

  const filteredLeads = normalizedQuery
    ? partnershipLeads.filter(
        (l) =>
          l.name.toLowerCase().includes(normalizedQuery) ||
          l.phone.toLowerCase().includes(normalizedQuery) ||
          (l.status || "").toLowerCase().includes(normalizedQuery)
      )
    : partnershipLeads;

  const totalLeadsPages = Math.max(1, Math.ceil(filteredLeads.length / leadsPerPage));
  const safeLeadsPage = Math.min(leadsCurrentPage, totalLeadsPages);
  const paginatedLeads = filteredLeads.slice(
    (safeLeadsPage - 1) * leadsPerPage,
    safeLeadsPage * leadsPerPage
  );

  const totalAvailableMenu = menuItems.filter((m) => m.is_available !== false).length;
  const unavailableMenuCount = Math.max(0, menuItems.length - totalAvailableMenu);
  const availabilityPercent =
    menuItems.length > 0 ? Math.round((totalAvailableMenu / menuItems.length) * 100) : 100;
  const newLeadsCount = partnershipLeads.filter((l) => l.status === "Baru").length;
  const contactedLeadsCount = partnershipLeads.filter((l) => l.status === "Dihubungi").length;
  const officialPartnersCount = partnershipLeads.filter((l) => l.status === "Mitra Resmi").length;
  const totalLinkClicks = links.reduce((sum, l) => sum + (l.clicks || 0), 0);
  const activePromosCount = promos.filter((p) => p.is_active).length;

  // Real data for the Dual-Mode Capsule Chart:
  // Mode "menu": Menu distribution across categories (Krisbar, Krispy, Geprek, Patungan, Minuman, Sambal)
  const defaultCatKeys =
    categories.length > 0
      ? categories
      : [
          { key: "krisbar", name: "Krisbar" },
          { key: "krispy", name: "Satset Krispy" },
          { key: "geprek", name: "Paket Geprek" },
          { key: "patungan", name: "Patungan" },
          { key: "minuman", name: "Minuman" },
          { key: "sambal", name: "Sambal" },
        ];

  const menuCategoryBars = defaultCatKeys.slice(0, 7).map((cat) => {
    const count = menuItems.filter((m) => m.category.toLowerCase() === cat.key.toLowerCase()).length;
    const shortLabel = cat.name
      .replace(/\(.*?\)/g, "")
      .replace(/Paket\s+/i, "")
      .replace(/Aneka\s+/i, "")
      .replace(/Pilihan\s+/i, "")
      .trim()
      .split(" ")[0]
      .slice(0, 7);
    return {
      key: cat.key,
      label: shortLabel,
      full: cat.name,
      value: count,
      unit: "menu",
    };
  });

  // Mode "links": Top Link-in-Bio Click Performance
  const linkClickBars = (links.length > 0 ? links : [])
    .slice(0, 7)
    .map((lnk) => {
      const shortLabel = lnk.title.split(" ")[0].slice(0, 7);
      return {
        key: lnk.id || lnk.title,
        label: shortLabel,
        full: lnk.title,
        value: lnk.clicks || 0,
        unit: "klik",
      };
    });

  const activeChartBars = chartMode === "menu" ? menuCategoryBars : linkClickBars;
  const maxBarValue = Math.max(...activeChartBars.map((b) => b.value), 1);

  return (
    <div className="min-h-[calc(100dvh+96px)] sm:min-h-[calc(100dvh+112px)] -mt-24 sm:-mt-28 bg-white font-sans text-gray-900 p-2.5 sm:p-4 lg:p-5 flex gap-4">
      {/* Mobile Sidebar Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* =====================================================================
          LEFT FLOATING SIDEBAR (COURSIE STYLE WITH AYAPI COLORS)
         ===================================================================== */}
      <aside
        className={`fixed lg:sticky top-2.5 sm:top-4 lg:top-5 left-2.5 sm:left-4 lg:left-0 z-50 h-[calc(100dvh-20px)] sm:h-[calc(100dvh-32px)] lg:h-[calc(100dvh-40px)] w-64 xl:w-68 bg-[#F7F7F9] rounded-[28px] py-6 px-5 flex flex-col justify-between shrink-0 transition-transform duration-300 ease-out border border-gray-200/60 lg:border-transparent shadow-2xl lg:shadow-none ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-[115%] lg:translate-x-0"
        }`}
      >
        {/* Top Brand Logo */}
        <div className="flex items-center justify-between px-2 mb-5 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("dashboard")}
            className="flex items-center gap-3 cursor-pointer group text-left"
          >
            <div className="bg-gradient-to-br from-[#D32F2F] to-[#8B0000] p-2 rounded-2xl shadow-md shadow-brand-red/20 transition-transform group-hover:scale-105">
              <Image
                src="/logo.png"
                alt="Ayapi Logo"
                width={68}
                height={38}
                className="w-[52px] h-auto"
              />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-gray-900 flex items-center gap-1">
                ayapi
                <span className="w-2 h-2 rounded-full bg-[#FF6B00] inline-block" />
              </span>
              <span className="text-[10px] font-bold text-gray-400 block -mt-0.5">
                Admin Workspace
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-xl text-gray-400 hover:text-gray-800 hover:bg-gray-200/60 cursor-pointer"
            aria-label="Tutup menu"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Menu & General Sections */}
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 pr-0.5">
          {/* MENU GROUP */}
          <div>
            <p className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-gray-400 mb-2">
              MENU
            </p>
            <div className="space-y-0.5">
              {menuNavItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className={`relative w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs transition-all cursor-pointer group ${
                      isActive
                        ? "text-gray-900 font-extrabold bg-white shadow-2xs"
                        : "text-gray-400 hover:text-gray-800 font-semibold hover:bg-white/60"
                    }`}
                  >
                    {/* Left Vertical Pill Indicator (like Coursie reference) */}
                    {isActive && (
                      <span className="absolute -left-5 top-1/2 -translate-y-1/2 w-1.5 h-7 rounded-r-full bg-gradient-to-b from-[#D32F2F] to-[#8B0000]" />
                    )}
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`w-6 h-6 rounded-lg flex items-center justify-center text-sm shrink-0 transition-colors ${
                          isActive
                            ? "bg-red-50 text-brand-red font-black"
                            : "text-gray-400 group-hover:text-gray-700"
                        }`}
                      >
                        {item.icon}
                      </span>
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.count !== undefined && (
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0 ${
                          isActive
                            ? "bg-gradient-to-r from-[#D32F2F] to-[#8B0000] text-white"
                            : item.id === "leads" && newLeadsCount > 0
                            ? "bg-amber-100 text-amber-800"
                            : "bg-gray-200/70 text-gray-500"
                        }`}
                      >
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* GENERAL GROUP */}
          <div>
            <p className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-gray-400 mb-2">
              GENERAL
            </p>
            <div className="space-y-0.5">
              {generalNavItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className={`relative w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs transition-all cursor-pointer group ${
                      isActive
                        ? "text-gray-900 font-extrabold bg-white shadow-2xs"
                        : "text-gray-400 hover:text-gray-800 font-semibold hover:bg-white/60"
                    }`}
                  >
                    {isActive && (
                      <span className="absolute -left-5 top-1/2 -translate-y-1/2 w-1.5 h-7 rounded-r-full bg-gradient-to-b from-[#D32F2F] to-[#8B0000]" />
                    )}
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`w-6 h-6 rounded-lg flex items-center justify-center text-sm shrink-0 ${
                          isActive ? "bg-red-50 text-brand-red" : "text-gray-400 group-hover:text-gray-700"
                        }`}
                      >
                        {item.icon}
                      </span>
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.count !== undefined && (
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0 ${
                          item.count > 0
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-200/70 text-gray-500"
                        }`}
                      >
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-semibold text-gray-400 hover:text-brand-red hover:bg-red-50/60 transition-all cursor-pointer group"
              >
                <span className="w-6 h-6 rounded-lg flex items-center justify-center text-sm shrink-0">
                  🚪
                </span>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Dark Promo Card (Matches "Download our Mobile app" in Coursie) */}
        <div className="mt-4 pt-2 shrink-0">
          <div className="bg-gradient-to-br from-[#190404] via-[#310808] to-[#0D1117] rounded-2xl p-4 text-white relative overflow-hidden shadow-lg">
            <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-brand-red/35 blur-xl pointer-events-none" />
            <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-[#FF6B00]/25 blur-xl pointer-events-none" />

            <div className="relative z-10 space-y-3">
              <div className="w-7 h-7 rounded-full bg-white/15 backdrop-blur-xs flex items-center justify-center text-xs">
                🔥
              </div>
              <div>
                <h4 className="text-xs font-extrabold leading-snug text-white">
                  Portal Link &amp; QR Outlet
                </h4>
                <p className="text-[10px] text-white/60 font-medium mt-0.5">
                  Tautan bio &amp; QR meja pelanggan
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("links")}
                className="w-full py-2 rounded-xl bg-gradient-to-r from-[#D32F2F] to-[#FF6B00] hover:from-[#B71C1C] hover:to-[#E65100] text-white font-extrabold text-[11px] shadow-md transition-all cursor-pointer"
              >
                Kelola QR &amp; Link
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* =====================================================================
          RIGHT COLUMN: FLOATING TOP BAR + MAIN WORKSPACE CONTAINER
         ===================================================================== */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        {/* TOP FLOATING HEADER BAR */}
        <header className="bg-[#F7F7F9] rounded-[24px] px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          {/* Left: Mobile Menu Trigger + Pill Search Input */}
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-gray-700 hover:text-brand-red shadow-2xs cursor-pointer shrink-0"
              aria-label="Buka menu navigasi"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="relative flex-1">
              <svg
                className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activeTab === "dashboard" && e.target.value.trim()) {
                    setActiveTabState("menu");
                  }
                }}
                placeholder="Cari menu, cabang, prospek..."
                className="w-full pl-11 pr-9 py-2.5 bg-white rounded-full text-xs font-semibold text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-red/20 shadow-2xs transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-xs cursor-pointer"
                  aria-label="Hapus pencarian"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Right: Action Icon Pills & Admin Profile */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Leads Inbox Button */}
            <button
              type="button"
              onClick={() => setActiveTab("leads")}
              className="relative w-10 h-10 rounded-full bg-white hover:bg-red-50 text-gray-600 hover:text-brand-red flex items-center justify-center shadow-2xs transition-colors cursor-pointer"
              title="Prospek Kemitraan"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {newLeadsCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-brand-red ring-2 ring-white" />
              )}
            </button>

            {/* Trash / Notification Bell Button */}
            <button
              type="button"
              onClick={() => setActiveTab("trash")}
              className="relative w-10 h-10 rounded-full bg-white hover:bg-red-50 text-gray-600 hover:text-brand-red flex items-center justify-center shadow-2xs transition-colors cursor-pointer"
              title={`Keranjang Sampah (${trashItems.length})`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {trashItems.length > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white" />
              )}
            </button>

            {/* Profile Chip (Click to jump to Account Security) */}
            <div className="flex items-center gap-2.5 pl-1">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("settings");
                  setTimeout(() => {
                    document
                      .getElementById("admin-security-section")
                      ?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }, 100);
                }}
                className="flex items-center gap-2.5 text-left rounded-full pr-2 py-0.5 hover:bg-white/80 transition-colors cursor-pointer group"
                title="Pengaturan Keamanan & Password Admin"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D32F2F] to-[#FF6B00] text-white font-black text-xs flex items-center justify-center shadow-sm ring-2 ring-white shrink-0 group-hover:scale-105 transition-transform">
                  AY
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-extrabold text-gray-900 group-hover:text-brand-red leading-tight transition-colors">
                    Admin Ayapi
                  </p>
                  <p className="text-[10px] text-gray-400 font-semibold">
                    @{securityInfo.username} • Keamanan
                  </p>
                </div>
              </button>
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:flex items-center justify-center w-7 h-7 rounded-full hover:bg-white text-gray-400 hover:text-brand-red transition-colors"
                title="Buka Website Utama"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </header>

        {/* =====================================================================
            MAIN ROUNDED WORKSPACE CANVAS (COURSIE STYLE)
           ===================================================================== */}
        <main className="bg-[#F7F7F9] rounded-[28px] p-4 sm:p-6 lg:p-7 flex-1 space-y-6">
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

          {/* Header Title Row + Dual Pill Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                {activeTab !== "dashboard" && (
                  <button
                    type="button"
                    onClick={() => setActiveTab("dashboard")}
                    className="w-8 h-8 rounded-full bg-white hover:bg-red-50 text-gray-500 hover:text-brand-red flex items-center justify-center shadow-2xs transition-colors cursor-pointer"
                    title="Kembali ke Dashboard"
                  >
                    ←
                  </button>
                )}
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                  {currentTabInfo.label}
                </h1>
              </div>
              <p className="text-xs text-gray-400 font-medium mt-1">
                {currentTabInfo.subtitle}
              </p>
            </div>

            {/* Dual Pill Buttons (Matches "+ Add Project" & "Import Data" in reference) */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              {activeMenuInfo?.onAdd && (
                <button
                  type="button"
                  onClick={activeMenuInfo.onAdd}
                  className="bg-gradient-to-r from-[#C62828] to-[#8B0000] hover:from-[#B71C1C] hover:to-[#7A0000] text-white font-bold text-xs px-5 py-2.5 rounded-full shadow-md shadow-brand-red/20 hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span className="text-sm leading-none">+</span>
                  <span>{activeMenuInfo.addLabel}</span>
                </button>
              )}

              {activeTab === "leads" && selectedLeadIds.length > 0 && (
                <button
                  type="button"
                  onClick={handleBulkLeadsDelete}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-5 py-2.5 rounded-full shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>🗑️</span>
                  <span>Hapus ({selectedLeadIds.length})</span>
                </button>
              )}

              {activeTab === "trash" && trashItems.length > 0 ? (
                <button
                  type="button"
                  onClick={() =>
                    askConfirmation(
                      "Kosongkan Sampah",
                      "Apakah Anda yakin ingin menghapus semua item di Keranjang Sampah secara permanen?",
                      handleEmptyTrash
                    )
                  }
                  className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-5 py-2.5 rounded-full shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>🗑️</span>
                  <span>Kosongkan Sampah</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={
                    activeTab === "leads"
                      ? handleExportLeadsCSV
                      : () => setActiveTab(activeTab === "dashboard" ? "promos" : "dashboard")
                  }
                  className="bg-white hover:bg-gray-50 text-gray-800 border border-gray-300/90 font-bold text-xs px-5 py-2.5 rounded-full transition-all flex items-center gap-2 cursor-pointer"
                >
                  {activeTab === "leads" ? (
                    <>
                      <span>📥</span>
                      <span>Export CSV</span>
                    </>
                  ) : activeTab === "dashboard" ? (
                    <>
                      <span>🏷️</span>
                      <span>Kelola Promo</span>
                    </>
                  ) : (
                    <>
                      <span>⊞</span>
                      <span>Ringkasan Dashboard</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* =================================================================
              ROW 1: 4 KPI CARDS (1st CARD FILLED IN AYAPI GRADIENT + 3 WHITE)
             ================================================================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* Card 1: Highlighted Primary Ayapi Gradient Card */}
            <div
              onClick={() => setActiveTab("menu")}
              className="bg-gradient-to-br from-[#D32F2F] via-[#B71C1C] to-[#7F0000] text-white rounded-3xl p-5 flex flex-col justify-between cursor-pointer shadow-lg shadow-brand-red/20 hover:scale-[1.01] transition-transform"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white/95">Menu Tersedia</span>
                <span className="w-8 h-8 rounded-full bg-white text-brand-red flex items-center justify-center text-xs font-black shadow-xs">
                  ↗
                </span>
              </div>
              <div className="text-4xl font-black tracking-tight my-3">
                {totalAvailableMenu}
              </div>
              <div className="flex items-center gap-2 text-[11px] text-white/85 font-medium">
                <span className="px-1.5 py-0.5 rounded bg-white/20 text-[10px] font-bold">
                  {menuItems.length}▲
                </span>
                <span>Total item di katalog menu</span>
              </div>
            </div>

            {/* Card 2: White KPI Card - Leads Kemitraan */}
            <div
              onClick={() => setActiveTab("leads")}
              className="bg-white rounded-3xl p-5 flex flex-col justify-between cursor-pointer border border-gray-100 hover:border-brand-red/30 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-800">Prospek Kemitraan</span>
                <span className="w-8 h-8 rounded-full border border-gray-300 text-gray-600 flex items-center justify-center text-xs font-bold">
                  ↗
                </span>
              </div>
              <div className="text-4xl font-black text-gray-900 tracking-tight my-3">
                {partnershipLeads.length}
              </div>
              <div className="flex items-center gap-2 text-[11px] text-brand-red font-semibold">
                <span className="px-1.5 py-0.5 rounded border border-red-200 bg-red-50 text-[10px] font-bold">
                  {newLeadsCount}▲
                </span>
                <span>Prospek baru menunggu follow-up</span>
              </div>
            </div>

            {/* Card 3: White KPI Card - Cabang & Ojol */}
            <div
              onClick={() => setActiveTab("branch")}
              className="bg-white rounded-3xl p-5 flex flex-col justify-between cursor-pointer border border-gray-100 hover:border-brand-red/30 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-800">Cabang &amp; Ojol</span>
                <span className="w-8 h-8 rounded-full border border-gray-300 text-gray-600 flex items-center justify-center text-xs font-bold">
                  ↗
                </span>
              </div>
              <div className="text-4xl font-black text-gray-900 tracking-tight my-3">
                {branches.length}
              </div>
              <div className="flex items-center gap-2 text-[11px] text-brand-red font-semibold">
                <span className="px-1.5 py-0.5 rounded border border-red-200 bg-red-50 text-[10px] font-bold">
                  {categories.length}▲
                </span>
                <span>Outlet aktif &amp; kategori menu</span>
              </div>
            </div>

            {/* Card 4: White KPI Card - Klik Link-in-Bio */}
            <div
              onClick={() => setActiveTab("links")}
              className="bg-white rounded-3xl p-5 flex flex-col justify-between cursor-pointer border border-gray-100 hover:border-brand-red/30 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-800">Klik Link-in-Bio</span>
                <span className="w-8 h-8 rounded-full border border-gray-300 text-gray-600 flex items-center justify-center text-xs font-bold">
                  ↗
                </span>
              </div>
              <div className="text-4xl font-black text-gray-900 tracking-tight my-3">
                {totalLinkClicks}
              </div>
              <div className="text-[11px] text-brand-red font-semibold">
                {activePromosCount} Promo &amp; {heroSlides.filter((s) => s.is_active).length} Slide Aktif
              </div>
            </div>
          </div>

          {/* Loading Spinner */}
          {isLoadingData ? (
            <div className="bg-white border border-gray-100 rounded-3xl p-16 text-center shadow-2xs">
              <svg className="animate-spin h-10 w-10 text-brand-red mx-auto" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-gray-400 font-bold text-xs uppercase tracking-wider mt-4">Memuat data dari Supabase...</p>
            </div>
          ) : (
            /* Data Render Section */
            <div className="animate-fade-in">
              {/* ===============================================================
                  BENTO GRID OVERVIEW (WHEN activeTab === "dashboard")
                 =============================================================== */}
              {activeTab === "dashboard" && (
                <div className="space-y-4">
                  {/* MIDDLE BENTO ROW: Capsule Chart (5) + Kontak/CS Card (3) + Menu/Promo List (4) */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    {/* Widget 1: Dual-Mode Vertical Capsule Pill Chart (5 cols) */}
                    <div className="lg:col-span-5 bg-white rounded-3xl p-5 border border-gray-100 flex flex-col justify-between">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                        <div>
                          <h3 className="text-sm font-extrabold text-gray-900">
                            {chartMode === "menu" ? "Distribusi Kategori Menu" : "Performa Klik Link-in-Bio"}
                          </h3>
                          <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                            {chartMode === "menu"
                              ? "Klik batang untuk filter katalog menu"
                              : `Total ${totalLinkClicks} klik tercatat di halaman /links`}
                          </p>
                        </div>

                        {/* Mode Switcher Pill */}
                        <div className="inline-flex items-center bg-[#F7F7F9] p-1 rounded-full border border-gray-200/70">
                          <button
                            type="button"
                            onClick={() => setChartMode("menu")}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold transition-all cursor-pointer ${
                              chartMode === "menu"
                                ? "bg-white text-brand-red shadow-2xs"
                                : "text-gray-400 hover:text-gray-700"
                            }`}
                          >
                            🍗 Menu
                          </button>
                          <button
                            type="button"
                            onClick={() => setChartMode("links")}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold transition-all cursor-pointer ${
                              chartMode === "links"
                                ? "bg-white text-brand-red shadow-2xs"
                                : "text-gray-400 hover:text-gray-700"
                            }`}
                          >
                            🔥 Klik Link
                          </button>
                        </div>
                      </div>

                      <div
                        className="grid gap-2 sm:gap-3 items-end pt-1"
                        style={{
                          gridTemplateColumns: `repeat(${Math.max(activeChartBars.length, 1)}, minmax(0, 1fr))`,
                        }}
                      >
                        {activeChartBars.map((bar, idx) => {
                          const heightPct =
                            bar.value === 0
                              ? 22
                              : Math.max(30, Math.min(100, Math.round((bar.value / maxBarValue) * 100)));
                          const isEven = idx % 2 === 0;
                          return (
                            <button
                              key={bar.key}
                              type="button"
                              onClick={() => {
                                if (chartMode === "menu") {
                                  setMenuFilterCategory(bar.key);
                                  setMenuCurrentPage(1);
                                  setActiveTab("menu");
                                } else {
                                  setActiveTab("links");
                                }
                              }}
                              title={`${bar.full}: ${bar.value} ${bar.unit}`}
                              className="flex flex-col items-center gap-1.5 group cursor-pointer"
                            >
                              <span className="text-[10px] font-extrabold text-gray-500 group-hover:text-brand-red transition-colors">
                                {bar.value}
                              </span>
                              <div className="w-full max-w-[38px] h-32 bg-gray-100 rounded-full flex flex-col justify-end overflow-hidden p-0.5">
                                <div
                                  style={{ height: `${heightPct}%` }}
                                  className={`w-full rounded-full transition-all duration-500 flex flex-col items-center pt-2 ${
                                    isEven
                                      ? "bg-gradient-to-b from-[#D32F2F] to-[#8B0000]"
                                      : "bg-gradient-to-b from-[#FF6B00] to-[#C62828]"
                                  } group-hover:brightness-110`}
                                >
                                  <span className="w-2 h-2 rounded-full bg-white/90 shrink-0" />
                                </div>
                              </div>
                              <span className="text-[10px] font-bold text-gray-400 group-hover:text-brand-red truncate max-w-full">
                                {bar.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Widget 2: Quick Action / CS Card (3 cols - like "Meeting with Arc Company") */}
                    <div className="lg:col-span-3 bg-white rounded-3xl p-5 border border-gray-100 flex flex-col justify-between gap-4">
                      <div>
                        <span className="text-xs font-extrabold text-gray-900 block">
                          Pusat Kemitraan &amp; CS
                        </span>
                        <h4 className="text-base font-black text-[#8B0000] leading-snug mt-3">
                          Hotline WhatsApp Resmi Ayapi
                        </h4>
                        <p className="text-[11px] text-gray-400 font-semibold mt-1.5">
                          WA: {settingWaFormatted || "+62 821-3444-730"}
                        </p>
                        <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                          HPP Kalkulator ROI: {settingCogsPercent || "55"}% • Tema Bio: {theme.toUpperCase()}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setActiveTab("settings")}
                        className="w-full py-3 px-4 rounded-full bg-gradient-to-r from-[#C62828] to-[#8B0000] hover:from-[#B71C1C] hover:to-[#7A0000] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-brand-red/20 transition-all cursor-pointer"
                      >
                        <span>⚙️</span>
                        <span>Pengaturan Web</span>
                      </button>
                    </div>

                    {/* Widget 3: Katalog Menu & Promo Unggulan (4 cols - like right list card) */}
                    <div className="lg:col-span-4 bg-white rounded-3xl p-5 border border-gray-100 flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-extrabold text-gray-900">
                          Katalog Menu &amp; Paket
                        </h3>
                        <button
                          type="button"
                          onClick={openMenuAdd}
                          className="px-3 py-1 rounded-full border border-brand-red/30 text-brand-red hover:bg-red-50 text-[10px] font-extrabold transition-colors cursor-pointer"
                        >
                          + Baru
                        </button>
                      </div>

                      <div className="space-y-3">
                        {menuItems.slice(0, 4).map((m, i) => {
                          const badgeColors = [
                            "bg-red-50 text-brand-red",
                            "bg-orange-50 text-orange-600",
                            "bg-amber-50 text-amber-600",
                            "bg-emerald-50 text-emerald-600",
                          ];
                          return (
                            <div
                              key={m.id || i}
                              onClick={() => openMenuEdit(m)}
                              className="flex items-center gap-3 p-1.5 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                              <div
                                className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm shrink-0 overflow-hidden border border-gray-100 ${
                                  badgeColors[i % badgeColors.length]
                                }`}
                              >
                                {m.image ? (
                                  <img
                                    src={m.image}
                                    alt={m.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  "🍗"
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-extrabold text-gray-900 truncate">
                                  {m.name}
                                </p>
                                <p className="text-[10px] text-gray-400 font-semibold">
                                  Harga: {m.price} • {m.category.toUpperCase()}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* BOTTOM BENTO ROW: Prospek Mitra (5) + Semi-Circle Gauge (3) + WITA Dark Clock (4) */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    {/* Widget 4: Prospek Kemitraan Terbaru (5 cols - like Team Member Status list) */}
                    <div className="lg:col-span-5 bg-white rounded-3xl p-5 border border-gray-100 flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-extrabold text-gray-900">
                          Prospek Mitra Terbaru
                        </h3>
                        <button
                          type="button"
                          onClick={() => setActiveTab("leads")}
                          className="px-3 py-1 rounded-full border border-brand-red/30 text-brand-red hover:bg-red-50 text-[10px] font-extrabold transition-colors cursor-pointer"
                        >
                          + Lihat Semua
                        </button>
                      </div>

                      {partnershipLeads.length === 0 ? (
                        <div className="py-8 text-center text-xs text-gray-400 font-semibold">
                          Belum ada prospek kemitraan yang masuk.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {partnershipLeads.slice(0, 3).map((lead, idx) => {
                            const avatarColors = [
                              "from-[#D32F2F] to-[#FF6B00]",
                              "from-[#8B0000] to-[#D32F2F]",
                              "from-[#FF6B00] to-[#F59E0B]",
                            ];
                            const statusStyle =
                              lead.status === "Mitra Resmi"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : lead.status === "Dihubungi"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : lead.status === "Batal"
                                ? "bg-red-50 text-red-600 border-red-200"
                                : "bg-red-50 text-brand-red border-red-200";
                            return (
                              <div
                                key={lead.id || idx}
                                onClick={() => setActiveTab("leads")}
                                className="flex items-center justify-between gap-3 p-1.5 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div
                                    className={`w-9 h-9 rounded-full bg-gradient-to-br ${
                                      avatarColors[idx % avatarColors.length]
                                    } text-white font-black text-xs flex items-center justify-center shrink-0`}
                                  >
                                    {(lead.name || "M").substring(0, 2).toUpperCase()}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-xs font-extrabold text-gray-900 truncate">
                                      {lead.name}
                                    </p>
                                    <p className="text-[10px] text-gray-400 font-medium truncate">
                                      WhatsApp: <span className="font-bold text-gray-600">{lead.phone}</span>
                                    </p>
                                  </div>
                                </div>
                                <span
                                  className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold shrink-0 ${statusStyle}`}
                                >
                                  {lead.status || "Baru"}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Widget 5: Semi-Circle Gauge Chart (3 cols - like "41% Project Ended") */}
                    <div className="lg:col-span-3 bg-white rounded-3xl p-5 border border-gray-100 flex flex-col justify-between">
                      <h3 className="text-sm font-extrabold text-gray-900">
                        Ketersediaan Menu
                      </h3>

                      <div className="relative flex flex-col items-center justify-center my-2">
                        <svg viewBox="0 0 200 115" className="w-44 h-26 overflow-visible">
                          {/* Background Track Arc */}
                          <path
                            d="M 20 100 A 80 80 0 0 1 180 100"
                            fill="none"
                            stroke="#F1F5F9"
                            strokeWidth="22"
                            strokeLinecap="round"
                          />
                          {/* Active Ayapi Red Arc */}
                          <path
                            d="M 20 100 A 80 80 0 0 1 180 100"
                            fill="none"
                            stroke="url(#ayapiGaugeGrad)"
                            strokeWidth="22"
                            strokeLinecap="round"
                            strokeDasharray="251.3"
                            strokeDashoffset={251.3 * (1 - availabilityPercent / 100)}
                          />
                          <defs>
                            <linearGradient id="ayapiGaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#D32F2F" />
                              <stop offset="65%" stopColor="#8B0000" />
                              <stop offset="100%" stopColor="#FF6B00" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="text-center -mt-10">
                          <span className="text-3xl font-black text-gray-900 block leading-none">
                            {availabilityPercent}%
                          </span>
                          <span className="text-[10px] font-bold text-brand-red mt-1 block">
                            Stok Menu Aktif
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-center gap-3 pt-2 text-[10px] font-bold text-gray-500">
                        <span className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#D32F2F]" />
                          Tersedia ({totalAvailableMenu})
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#8B0000]" />
                          Mitra ({officialPartnersCount + contactedLeadsCount})
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                          Habis ({unavailableMenuCount})
                        </span>
                      </div>
                    </div>

                    {/* Widget 6: Dark Time Tracker Card (4 cols - Live WITA Operational Clock) */}
                    <div className="lg:col-span-4 bg-gradient-to-br from-[#160303] via-[#2B0707] to-[#090D16] rounded-3xl p-5 text-white relative overflow-hidden flex flex-col justify-between shadow-lg">
                      <div className="absolute -right-10 -top-10 w-36 h-36 rounded-full bg-brand-red/30 blur-2xl pointer-events-none" />
                      <div className="absolute -left-10 -bottom-10 w-36 h-36 rounded-full bg-[#FF6B00]/20 blur-2xl pointer-events-none" />

                      <div className="relative z-10 flex items-center justify-between">
                        <span className="text-xs font-extrabold text-white/90">
                          Waktu Operasional WITA
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-extrabold uppercase tracking-wider">
                          Live Bali
                        </span>
                      </div>

                      <div className="relative z-10 text-center my-4">
                        <div className="text-3xl sm:text-4xl font-black tracking-wider font-mono text-white">
                          {witaClock}
                        </div>
                        <p className="text-[10px] text-white/60 font-semibold mt-1">
                          {branches.length} Cabang Terdaftar • {packages.length} Paket Franchise
                        </p>
                      </div>

                      <div className="relative z-10 flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => setActiveTab("branch")}
                          className="w-10 h-10 rounded-full bg-white text-gray-900 hover:scale-105 flex items-center justify-center shadow-md transition-transform cursor-pointer"
                          title="Kelola Jam Cabang"
                        >
                          📍
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveTab("slideshow")}
                          className="w-10 h-10 rounded-full bg-[#E53935] hover:bg-[#D32F2F] text-white hover:scale-105 flex items-center justify-center shadow-md transition-transform cursor-pointer"
                          title="Kelola Slideshow"
                        >
                          🖼️
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "menu" && (
                /* MENU TAB CONTENT WITH FILTERS & PAGINATION */
                <div className="bg-white border border-gray-200/60 rounded-3xl overflow-hidden shadow-sm">
                  {/* Top Filter & Items-Per-Page Toolbar */}
                  <div className="p-4 sm:p-5 border-b border-gray-100 bg-gray-50/40 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    {/* Category Filter Pills */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setMenuFilterCategory("all");
                          setMenuCurrentPage(1);
                        }}
                        className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                          menuFilterCategory === "all"
                            ? "bg-gradient-to-r from-[#D32F2F] to-[#8B0000] text-white shadow-xs"
                            : "bg-white border border-gray-200 text-gray-600 hover:border-brand-red/40 hover:text-brand-red"
                        }`}
                      >
                        Semua ({menuItems.length})
                      </button>
                      {defaultCatKeys.map((cat) => {
                        const count = menuItems.filter(
                          (m) => m.category.toLowerCase() === cat.key.toLowerCase()
                        ).length;
                        const isActive = menuFilterCategory.toLowerCase() === cat.key.toLowerCase();
                        return (
                          <button
                            key={cat.key}
                            type="button"
                            onClick={() => {
                              setMenuFilterCategory(cat.key);
                              setMenuCurrentPage(1);
                            }}
                            className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                              isActive
                                ? "bg-gradient-to-r from-[#D32F2F] to-[#8B0000] text-white shadow-xs"
                                : "bg-white border border-gray-200 text-gray-600 hover:border-brand-red/40 hover:text-brand-red"
                            }`}
                          >
                            {cat.name} ({count})
                          </button>
                        );
                      })}
                    </div>

                    {/* Right Controls: Stock Filter + Items Per Page */}
                    <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                      <select
                        value={menuFilterStock}
                        onChange={(e) => {
                          setMenuFilterStock(e.target.value as "all" | "available" | "unavailable");
                          setMenuCurrentPage(1);
                        }}
                        className="bg-white border border-gray-200 rounded-full px-3.5 py-1.5 text-xs font-bold text-gray-700 focus:outline-none focus:border-brand-red cursor-pointer"
                      >
                        <option value="all">Semua Stok</option>
                        <option value="available">✅ Stok Tersedia</option>
                        <option value="unavailable">⛔ Stok Habis</option>
                      </select>

                      <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3 py-1">
                        <span className="text-[11px] font-bold text-gray-400">Tampilkan:</span>
                        <select
                          value={menuPerPage}
                          onChange={(e) => {
                            setMenuPerPage(Number(e.target.value));
                            setMenuCurrentPage(1);
                          }}
                          className="text-xs font-extrabold text-brand-red bg-transparent focus:outline-none cursor-pointer"
                        >
                          <option value={5}>5 menu</option>
                          <option value={10}>10 menu</option>
                          <option value={20}>20 menu</option>
                          <option value={9999}>Semua</option>
                        </select>
                      </div>
                    </div>
                  </div>

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
                        {paginatedMenuItems.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-12 text-center text-xs text-gray-400 font-bold">
                              Tidak ada item menu yang sesuai filter.
                            </td>
                          </tr>
                        ) : (
                          paginatedMenuItems.map((item) => {
                            const matchedCat = defaultCatKeys.find(
                              (c) => c.key.toLowerCase() === item.category.toLowerCase()
                            );
                            const catLabel = matchedCat ? matchedCat.name : item.category;
                            return (
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
                                  <span className="bg-brand-red/10 text-brand-red font-bold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full whitespace-nowrap">
                                    {catLabel}
                                  </span>
                                </td>
                                {/* Price */}
                                <td className="py-4 px-6 font-extrabold text-brand-yellow text-sm bg-brand-yellow/5 whitespace-nowrap">
                                  {item.price}
                                </td>
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
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Footer */}
                  {filteredMenuItems.length > 0 && (
                    <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/40 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <p className="text-xs font-semibold text-gray-500">
                        Menampilkan{" "}
                        <span className="font-extrabold text-gray-900">
                          {(safeMenuPage - 1) * menuPerPage + 1}–
                          {Math.min(safeMenuPage * menuPerPage, filteredMenuItems.length)}
                        </span>{" "}
                        dari <span className="font-extrabold text-gray-900">{filteredMenuItems.length}</span> menu
                      </p>

                      {totalMenuPages > 1 && (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            disabled={safeMenuPage <= 1}
                            onClick={() => setMenuCurrentPage((p) => Math.max(1, p - 1))}
                            className="px-3.5 py-1.5 rounded-full bg-white border border-gray-200 text-xs font-bold text-gray-700 hover:border-brand-red hover:text-brand-red disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                          >
                            ← Prev
                          </button>

                          {Array.from({ length: totalMenuPages }, (_, i) => i + 1).map((pageNum) => (
                            <button
                              key={pageNum}
                              type="button"
                              onClick={() => setMenuCurrentPage(pageNum)}
                              className={`w-8 h-8 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                                pageNum === safeMenuPage
                                  ? "bg-gradient-to-r from-[#D32F2F] to-[#8B0000] text-white shadow-xs"
                                  : "bg-white border border-gray-200 text-gray-600 hover:border-brand-red hover:text-brand-red"
                              }`}
                            >
                              {pageNum}
                            </button>
                          ))}

                          <button
                            type="button"
                            disabled={safeMenuPage >= totalMenuPages}
                            onClick={() => setMenuCurrentPage((p) => Math.min(totalMenuPages, p + 1))}
                            className="px-3.5 py-1.5 rounded-full bg-white border border-gray-200 text-xs font-bold text-gray-700 hover:border-brand-red hover:text-brand-red disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                          >
                            Next →
                          </button>
                        </div>
                      )}
                    </div>
                  )}
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
                      {filteredCategories.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="py-8 px-6 text-center text-xs text-gray-400 font-bold">
                            Tidak ada kategori tersedia.
                          </td>
                        </tr>
                      ) : (
                        filteredCategories.map((item) => (
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
                      {filteredBranches.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-xs text-gray-400 font-bold">
                            Tidak ada cabang ojol tersedia.
                          </td>
                        </tr>
                      ) : (
                        filteredBranches.map((branch) => (
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
                  <div className="p-4 sm:px-6 border-b border-gray-100 bg-gray-50/40 flex flex-wrap items-center justify-between gap-3">
                    <span className="text-xs font-extrabold text-gray-700">
                      Daftar Calon Mitra ({filteredLeads.length})
                    </span>
                    <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3 py-1">
                      <span className="text-[11px] font-bold text-gray-400">Tampilkan:</span>
                      <select
                        value={leadsPerPage}
                        onChange={(e) => {
                          setLeadsPerPage(Number(e.target.value));
                          setLeadsCurrentPage(1);
                        }}
                        className="text-xs font-extrabold text-brand-red bg-transparent focus:outline-none cursor-pointer"
                      >
                        <option value={10}>10 prospek</option>
                        <option value={20}>20 prospek</option>
                        <option value={9999}>Semua</option>
                      </select>
                    </div>
                  </div>
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
                        {paginatedLeads.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-12 text-center text-xs text-gray-400 font-bold">
                              Tidak ada prospek kemitraan terdaftar.
                            </td>
                          </tr>
                        ) : (
                          paginatedLeads.map((lead) => (
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

                  {filteredLeads.length > 0 && totalLeadsPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/40 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <p className="text-xs font-semibold text-gray-500">
                        Menampilkan{" "}
                        <span className="font-extrabold text-gray-900">
                          {(safeLeadsPage - 1) * leadsPerPage + 1}–
                          {Math.min(safeLeadsPage * leadsPerPage, filteredLeads.length)}
                        </span>{" "}
                        dari <span className="font-extrabold text-gray-900">{filteredLeads.length}</span> prospek
                      </p>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={safeLeadsPage <= 1}
                          onClick={() => setLeadsCurrentPage((p) => Math.max(1, p - 1))}
                          className="px-3.5 py-1.5 rounded-full bg-white border border-gray-200 text-xs font-bold text-gray-700 hover:border-brand-red hover:text-brand-red disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        >
                          ← Prev
                        </button>
                        {Array.from({ length: totalLeadsPages }, (_, i) => i + 1).map((pageNum) => (
                          <button
                            key={pageNum}
                            type="button"
                            onClick={() => setLeadsCurrentPage(pageNum)}
                            className={`w-8 h-8 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                              pageNum === safeLeadsPage
                                ? "bg-gradient-to-r from-[#D32F2F] to-[#8B0000] text-white shadow-xs"
                                : "bg-white border border-gray-200 text-gray-600 hover:border-brand-red hover:text-brand-red"
                            }`}
                          >
                            {pageNum}
                          </button>
                        ))}
                        <button
                          type="button"
                          disabled={safeLeadsPage >= totalLeadsPages}
                          onClick={() => setLeadsCurrentPage((p) => Math.min(totalLeadsPages, p + 1))}
                          className="px-3.5 py-1.5 rounded-full bg-white border border-gray-200 text-xs font-bold text-gray-700 hover:border-brand-red hover:text-brand-red disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        >
                          Next →
                        </button>
                      </div>
                    </div>
                  )}
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

            {/* =================== PROMO POP-UP & BANNER TAB =================== */}
            {activeTab === "promos" && (
              <div className="space-y-6">
                {/* Header Banner Guide */}
                <div className="bg-gradient-to-r from-red-500/10 via-orange-500/10 to-amber-500/10 border border-brand-red/20 rounded-3xl p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-brand-red bg-brand-red/10 px-2.5 py-0.5 rounded-full inline-block">
                      🏷️ Modul Promo Beranda &amp; Pop-up
                    </span>
                    <h3 className="text-base font-black text-gray-900">Kelola Kartu Promo &amp; Detail Pop-up Modal</h3>
                    <p className="text-xs text-gray-600 max-w-2xl leading-relaxed">
                      Ubah gambar kartu, banner modal, badge diskon, syarat &amp; ketentuan, tombol reservasi WhatsApp, hingga barcode dengan mudah.
                    </p>
                  </div>
                  <button
                    onClick={openPromoAdd}
                    className="bg-brand-red hover:bg-[#a01c1c] text-white font-extrabold uppercase tracking-widest px-5 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all text-xs flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                    Tambah Promo
                  </button>
                </div>

                {/* Table of Promos */}
                <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/80">
                          <th className="py-4 px-6 text-left text-[10px] font-black uppercase tracking-wider text-gray-400">#</th>
                          <th className="py-4 px-6 text-left text-[10px] font-black uppercase tracking-wider text-gray-400">Gambar Kartu</th>
                          <th className="py-4 px-6 text-left text-[10px] font-black uppercase tracking-wider text-gray-400">Info Kartu Beranda</th>
                          <th className="py-4 px-6 text-left text-[10px] font-black uppercase tracking-wider text-gray-400">Detail Pop-up Modal (&quot;Dalamnya&quot;)</th>
                          <th className="py-4 px-6 text-center text-[10px] font-black uppercase tracking-wider text-gray-400">Status</th>
                          <th className="py-4 px-6 text-center text-[10px] font-black uppercase tracking-wider text-gray-400">Urutan</th>
                          <th className="py-4 px-6 text-center text-[10px] font-black uppercase tracking-wider text-gray-400">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {promos.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-16 text-center text-xs text-gray-400 font-bold">
                              🏷️ Belum ada promo terdaftar. Klik &quot;Tambah Promo&quot; untuk membuat promo baru.
                            </td>
                          </tr>
                        ) : (
                          promos.map((promo, index) => (
                            <tr key={promo.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                              <td className="py-4 px-6 text-xs font-bold text-gray-400">{index + 1}</td>
                              <td className="py-4 px-6">
                                <div className="w-24 h-16 rounded-xl overflow-hidden bg-gray-100 relative border border-gray-200/80 shadow-xs">
                                  <img src={promo.image} alt={promo.title} className="w-full h-full object-cover" />
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <div className="space-y-1.5 max-w-[240px]">
                                  {promo.badge && (
                                    <span className="inline-block bg-brand-red text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                                      {promo.badge}
                                    </span>
                                  )}
                                  <h4 className="text-xs font-black text-brand-dark leading-tight">{promo.title}</h4>
                                  <p className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed">{promo.desc}</p>
                                  <div className="pt-1 flex items-center gap-2">
                                    <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 border border-gray-200">
                                      {promo.actionType === "link" ? `🔗 Link: ${promo.linkUrl || "/kemitraan"}` : "🪟 Pop-up Modal"}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <div className="space-y-1 text-xs max-w-[280px]">
                                  <div className="font-extrabold text-brand-dark text-[11px] line-clamp-1">
                                    {promo.details?.highlight || promo.title}
                                  </div>
                                  <div className="text-[10px] text-gray-500 line-clamp-1">
                                    {promo.details?.description || promo.desc}
                                  </div>
                                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                    <span className="text-[9px] font-bold bg-amber-50 text-amber-800 border border-amber-200/60 px-2 py-0.5 rounded-md">
                                      📋 {promo.details?.points?.length || 0} Poin S&amp;K
                                    </span>
                                    {promo.details?.showQrCode && (
                                      <span className="text-[9px] font-bold bg-green-50 text-green-700 border border-green-200/60 px-2 py-0.5 rounded-md">
                                        📱 QR Barcode Aktif
                                      </span>
                                    )}
                                    {promo.details?.actionButtonText && (
                                      <span className="text-[9px] font-semibold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-200">
                                        CTA: {promo.details.actionButtonText}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-6 text-center">
                                <button
                                  onClick={() => handleTogglePromoActive(promo)}
                                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-all ${
                                    promo.is_active
                                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                                      : "bg-gray-100 text-gray-400 border border-gray-200 hover:bg-gray-200"
                                  }`}
                                  title="Klik untuk ubah status aktif/nonaktif"
                                >
                                  {promo.is_active ? "Aktif" : "Nonaktif"}
                                </button>
                              </td>
                              <td className="py-4 px-6 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    onClick={() => handleMovePromo(index, "up")}
                                    disabled={index === 0}
                                    className="p-1.5 border border-gray-200 rounded-lg hover:border-brand-red/30 hover:text-brand-red disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer bg-white text-gray-400"
                                    title="Pindah Ke Atas"
                                  >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => handleMovePromo(index, "down")}
                                    disabled={index === promos.length - 1}
                                    className="p-1.5 border border-gray-200 rounded-lg hover:border-brand-red/30 hover:text-brand-red disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer bg-white text-gray-400"
                                    title="Pindah Ke Bawah"
                                  >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                    </svg>
                                  </button>
                                </div>
                              </td>
                              <td className="py-4 px-6 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => openPromoEdit(promo)}
                                    className="p-2 border border-gray-200 hover:border-brand-red/40 hover:text-brand-red rounded-xl transition-all cursor-pointer bg-white text-gray-500"
                                    title="Edit Promo"
                                  >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => askConfirmation("Hapus Promo", `Apakah Anda yakin ingin menghapus promo "${promo.title}"?`, () => handleDeletePromo(promo.id, promo.title))}
                                    className="p-2 border border-gray-200 hover:border-brand-red/40 hover:text-brand-red rounded-xl transition-all cursor-pointer bg-white text-gray-500"
                                    title="Hapus Promo"
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
                            Belum ada testimoni. Klik tombol &quot;Tambah Testimoni&quot; untuk membuat baru.
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
                        placeholder="Contoh: Jl. Tukad Pakerisan No.96, Dauh Puri Klod, Kec. Denpasar Barat, Kota Denpasar, Bali"
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

                    {/* Proposal PDF URL */}
                    <div className="md:col-span-2">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-[10px] font-extrabold uppercase text-gray-400 tracking-wider">
                          URL / Berkas Proposal Kemitraan (PDF)
                        </label>
                        <button
                          type="button"
                          onClick={() => setActiveTab("packages")}
                          className="text-[10px] font-bold text-brand-red hover:underline cursor-pointer flex items-center gap-1"
                        >
                          <span>Kelola &amp; Upload PDF di Menu Paket Kemitraan</span>
                          <span>↗</span>
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={settingProposalUrl}
                          onChange={(e) => setSettingProposalUrl(e.target.value)}
                          placeholder="Contoh: /proposal-kemitraan-ayapi.pdf atau URL cloud"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red font-mono"
                        />
                        {settingProposalUrl && (
                          <a
                            href={settingProposalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1 transition-colors"
                            title="Buka / Preview PDF"
                          >
                            <span>Lihat</span>
                            <span>↗</span>
                          </a>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-400 mt-1 block">
                        File PDF yang otomatis diunduh saat calon mitra mengisi form di halaman Kemitraan.
                      </span>
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

                {/* =====================================================================
                    KEAMANAN AKUN & GANTI PASSWORD / USERNAME ADMIN
                   ===================================================================== */}
                <div
                  id="admin-security-section"
                  className="pt-8 mt-8 border-t-2 border-dashed border-gray-100 space-y-6 scroll-mt-24"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#F7F7F9] rounded-2xl p-5 border border-gray-200/70">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-[#C62828] text-[10px] font-black uppercase tracking-wider border border-red-100">
                          🔐 Keamanan Akun Admin
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            securityInfo.isCustomPassword
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {securityInfo.isCustomPassword
                            ? "✅ Menggunakan Password Kustom Database"
                            : "⚙️ Menggunakan Password Default Sistem (.env)"}
                        </span>
                      </div>
                      <h3 className="text-lg font-black text-gray-900 pt-1">
                        Ganti Password &amp; Username Admin
                      </h3>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        Kredensial dienkripsi dengan <span className="font-bold text-gray-700">Salted SHA-256</span>. Sesi aktif Anda akan otomatis diperbarui setelah menyimpan tanpa perlu login ulang.
                      </p>
                    </div>

                    <div className="bg-white rounded-2xl px-4 py-3 border border-gray-200/80 shrink-0 text-left md:text-right">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        Username Aktif Saat Ini
                      </p>
                      <p className="text-sm font-black text-gray-900 mt-0.5">
                        @{securityInfo.username}
                      </p>
                      <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                        {securityInfo.updatedAt
                          ? `Diperbarui: ${new Date(securityInfo.updatedAt).toLocaleString("id-ID", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}`
                          : "Belum pernah diubah di database"}
                      </p>
                    </div>
                  </div>

                  {/* Caps Lock & Whitespace Human-Error Alerts */}
                  {(capsLockActive ||
                    (newPasswordInput.length > 0 && newPasswordInput !== newPasswordInput.trim())) && (
                    <div className="flex flex-wrap items-center gap-3">
                      {capsLockActive && (
                        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
                          <span>⚠️</span>
                          <span>
                            Tombol <strong>Caps Lock</strong> sedang aktif! Perhatikan huruf besar/kecil pada password Anda.
                          </span>
                        </div>
                      )}
                      {newPasswordInput.length > 0 && newPasswordInput !== newPasswordInput.trim() && (
                        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold">
                          <span>💡</span>
                          <span>
                            Terdeteksi spasi di awal/akhir password (biasanya karena copy-paste). Sistem akan otomatis merapikannya.
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {(() => {
                    const cleanUser = adminUsernameInput.trim();
                    const isUserValid =
                      cleanUser.length >= 3 &&
                      cleanUser.length <= 32 &&
                      /^[a-zA-Z0-9._-]+$/.test(cleanUser);

                    const cleanNew = newPasswordInput.trim();
                    const cleanConfirm = confirmPasswordInput.trim();
                    const hasMinLen = cleanNew.length >= 8;
                    const hasLetterAndNum = /[a-zA-Z]/.test(cleanNew) && /[0-9]/.test(cleanNew);
                    const notSameAsUser =
                      cleanNew.length > 0 && cleanNew.toLowerCase() !== cleanUser.toLowerCase();
                    const hasBonusComplexity =
                      cleanNew.length >= 12 ||
                      (/[a-z]/.test(cleanNew) && /[A-Z]/.test(cleanNew)) ||
                      /[^a-zA-Z0-9]/.test(cleanNew);

                    const strengthScore =
                      cleanNew.length === 0
                        ? 0
                        : (hasMinLen ? 1 : 0) +
                          (hasLetterAndNum ? 1 : 0) +
                          (notSameAsUser ? 1 : 0) +
                          (hasMinLen && hasLetterAndNum && hasBonusComplexity ? 1 : 0);

                    const strengthLabels = ["Belum Diisi", "Lemah", "Cukup", "Kuat", "Sangat Kuat"];
                    const strengthColors = [
                      "bg-gray-200",
                      "bg-red-500",
                      "bg-amber-500",
                      "bg-emerald-500",
                      "bg-emerald-600",
                    ];

                    const isMatch = cleanNew.length > 0 && cleanConfirm.length > 0 && cleanNew === cleanConfirm;
                    const isMismatch =
                      cleanConfirm.length > 0 && cleanNew !== cleanConfirm;

                    return (
                      <form onSubmit={handleSaveAdminCredentials} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* 1. Username Admin */}
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <label className="block text-[10px] font-extrabold uppercase text-gray-400 tracking-wider">
                                Username Admin *
                              </label>
                              <span
                                className={`text-[10px] font-bold ${
                                  isUserValid ? "text-emerald-600" : "text-red-500"
                                }`}
                              >
                                {isUserValid ? "✓ Format valid" : "✕ 3–32 karakter (tanpa spasi)"}
                              </span>
                            </div>
                            <input
                              type="text"
                              required
                              autoComplete="username"
                              value={adminUsernameInput}
                              onChange={(e) => setAdminUsernameInput(e.target.value)}
                              placeholder="Contoh: admin"
                              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
                            />
                            <span className="text-[10px] text-gray-400 mt-1 block">
                              Boleh menggunakan huruf, angka, titik (.), garis bawah (_), atau strip (-).
                            </span>
                          </div>

                          {/* 2. Password Saat Ini (Verifikasi) */}
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <label className="block text-[10px] font-extrabold uppercase text-gray-400 tracking-wider">
                                Password Saat Ini (Wajib untuk Verifikasi) *
                              </label>
                              <span className="text-[10px] font-bold text-brand-red">
                                Wajib diisi
                              </span>
                            </div>
                            <div className="relative">
                              <input
                                type={showCurrentPassword ? "text" : "password"}
                                required
                                autoComplete="current-password"
                                value={currentPasswordInput}
                                onKeyUp={handleCapsLockEvent}
                                onKeyDown={handleCapsLockEvent}
                                onChange={(e) => setCurrentPasswordInput(e.target.value)}
                                placeholder="Masukkan password admin saat ini..."
                                className="w-full pl-4 pr-11 py-3 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
                              />
                              <button
                                type="button"
                                onClick={() => setShowCurrentPassword((prev) => !prev)}
                                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-brand-red transition-colors cursor-pointer"
                                title={showCurrentPassword ? "Sembunyikan password" : "Lihat password"}
                              >
                                {showCurrentPassword ? "🙈" : "👁️"}
                              </button>
                            </div>
                            <span className="text-[10px] text-gray-400 mt-1 block">
                              Mencegah orang lain mengganti password saat perangkat ditinggal terbuka.
                            </span>
                          </div>

                          {/* 3. Password Baru */}
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <label className="block text-[10px] font-extrabold uppercase text-gray-400 tracking-wider">
                                Password Baru {cleanUser.toLowerCase() !== securityInfo.username.toLowerCase() ? "(Opsional)" : "*"}
                              </label>
                              {cleanNew.length > 0 && (
                                <span className="text-[10px] font-extrabold text-gray-600">
                                  Kekuatan: {strengthLabels[strengthScore]}
                                </span>
                              )}
                            </div>
                            <div className="relative">
                              <input
                                type={showNewPassword ? "text" : "password"}
                                autoComplete="new-password"
                                value={newPasswordInput}
                                onKeyUp={handleCapsLockEvent}
                                onKeyDown={handleCapsLockEvent}
                                onChange={(e) => setNewPasswordInput(e.target.value)}
                                placeholder="Minimal 8 karakter (huruf & angka)..."
                                className="w-full pl-4 pr-11 py-3 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
                              />
                              <button
                                type="button"
                                onClick={() => setShowNewPassword((prev) => !prev)}
                                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-brand-red transition-colors cursor-pointer"
                                title={showNewPassword ? "Sembunyikan password" : "Lihat password"}
                              >
                                {showNewPassword ? "🙈" : "👁️"}
                              </button>
                            </div>

                            {/* 4-Bar Strength Meter */}
                            <div className="grid grid-cols-4 gap-1.5 mt-2.5">
                              {[1, 2, 3, 4].map((bar) => (
                                <div
                                  key={bar}
                                  className={`h-1.5 rounded-full transition-all ${
                                    cleanNew.length > 0 && strengthScore >= bar
                                      ? strengthColors[strengthScore]
                                      : "bg-gray-100"
                                  }`}
                                />
                              ))}
                            </div>

                            {/* Live Checklist */}
                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[10px] font-semibold">
                              <span className={hasMinLen ? "text-emerald-600" : "text-gray-400"}>
                                {hasMinLen ? "✅" : "○"} Min. 8 karakter
                              </span>
                              <span className={hasLetterAndNum ? "text-emerald-600" : "text-gray-400"}>
                                {hasLetterAndNum ? "✅" : "○"} Kombinasi huruf &amp; angka
                              </span>
                              <span className={notSameAsUser ? "text-emerald-600" : "text-gray-400"}>
                                {notSameAsUser ? "✅" : "○"} Berbeda dari username
                              </span>
                            </div>
                          </div>

                          {/* 4. Konfirmasi Password Baru */}
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <label className="block text-[10px] font-extrabold uppercase text-gray-400 tracking-wider">
                                Ulangi / Konfirmasi Password Baru {cleanNew.length > 0 ? "*" : ""}
                              </label>
                              {isMatch && (
                                <span className="text-[10px] font-extrabold text-emerald-600">
                                  ✅ Password cocok
                                </span>
                              )}
                              {isMismatch && (
                                <span className="text-[10px] font-extrabold text-red-500">
                                  ❌ Belum sama dengan password baru
                                </span>
                              )}
                            </div>
                            <div className="relative">
                              <input
                                type={showConfirmPassword ? "text" : "password"}
                                autoComplete="new-password"
                                value={confirmPasswordInput}
                                onKeyUp={handleCapsLockEvent}
                                onKeyDown={handleCapsLockEvent}
                                onChange={(e) => setConfirmPasswordInput(e.target.value)}
                                placeholder="Ketik ulang password baru yang sama persis..."
                                className={`w-full pl-4 pr-11 py-3 rounded-xl border text-xs font-semibold focus:outline-none transition-colors ${
                                  isMismatch
                                    ? "border-red-300 bg-red-50/30 focus:border-red-500"
                                    : isMatch
                                    ? "border-emerald-300 bg-emerald-50/20 focus:border-emerald-500"
                                    : "border-gray-200 focus:border-brand-red focus:ring-1 focus:ring-brand-red"
                                }`}
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword((prev) => !prev)}
                                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-brand-red transition-colors cursor-pointer"
                                title={showConfirmPassword ? "Sembunyikan password" : "Lihat password"}
                              >
                                {showConfirmPassword ? "🙈" : "👁️"}
                              </button>
                            </div>
                            <span className="text-[10px] text-gray-400 mt-1 block">
                              Gunakan ikon mata (👁️) untuk memeriksa ketikan sebelum menekan tombol simpan.
                            </span>
                          </div>
                        </div>

                        {/* Emergency Recovery Guide Box + Submit Button */}
                        <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="text-[11px] text-gray-500 bg-gray-50 border border-gray-200/70 rounded-xl px-3.5 py-2.5 max-w-xl leading-relaxed">
                            <span className="font-extrabold text-gray-700">🛡️ Jaring Pengaman Lupa Password:</span>{" "}
                            Jika suatu saat Anda lupa password baru, hapus baris{" "}
                            <code className="px-1.5 py-0.5 rounded bg-gray-200/70 text-gray-800 font-mono text-[10px]">
                              __admin_password_hash
                            </code>{" "}
                            di tabel <code className="font-mono text-[10px]">settings</code> Supabase untuk kembali ke password cadangan <code className="font-mono text-[10px]">.env</code>.
                          </div>

                          <button
                            type="submit"
                            disabled={isSavingCredentials}
                            className="bg-gradient-to-r from-[#D32F2F] to-[#8B0000] hover:from-[#B71C1C] hover:to-[#640000] text-white font-extrabold uppercase tracking-widest px-7 py-3.5 rounded-xl text-xs shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50 shrink-0"
                          >
                            {isSavingCredentials
                              ? "Memverifikasi & Menyimpan..."
                              : "🔐 Simpan Kredensial Admin"}
                          </button>
                        </div>
                      </form>
                    );
                  })()}
                </div>
              </div>
            )}

            {activeTab === "packages" && (
              /* PARTNERSHIP PACKAGES & PROPOSAL PDF TAB CONTENT */
              <div className="space-y-6 animate-fade-in">
                {/* =====================================================================
                    DOKUMEN PROPOSAL KEMITRAAN (PDF) MANAGEMENT CARD
                   ===================================================================== */}
                <div className="bg-white border border-gray-200/60 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
                  {/* Card Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-[#C62828] text-[10px] font-black uppercase tracking-wider border border-red-100">
                          📄 Dokumen Resmi Kemitraan
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Terhubung ke Halaman /kemitraan
                        </span>
                      </div>
                      <h3 className="text-xl font-black text-gray-900 tracking-tight pt-1">
                        Proposal Bisnis &amp; Franchise Ayapi (PDF)
                      </h3>
                      <p className="text-xs text-gray-500 max-w-2xl leading-relaxed">
                        Dokumen PDF ini akan otomatis diunduh oleh calon investor saat mereka memasukkan Nama dan nomor WhatsApp pada tombol &quot;Download Proposal Kemitraan&quot;.
                      </p>
                    </div>

                    {/* Preview / Download Current File Button */}
                    <div className="shrink-0 flex items-center gap-2">
                      <a
                        href={settingProposalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 text-xs font-bold transition-all hover:border-brand-red/40 hover:text-brand-red cursor-pointer shadow-2xs"
                        title="Buka atau unduh file proposal aktif saat ini"
                      >
                        <svg className="w-4 h-4 text-brand-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Pratinjau Proposal Aktif</span>
                        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  </div>

                  {/* Active Proposal Info Banner */}
                  <div className="bg-[#F7F7F9] rounded-2xl p-4 sm:p-5 border border-gray-200/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-500 to-rose-700 text-white flex items-center justify-center font-black text-xs shadow-md shadow-red-500/20 shrink-0">
                        PDF
                      </div>
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                          URL / Path Proposal Saat Ini
                        </p>
                        <p className="text-xs font-mono font-bold text-gray-800 break-all">
                          {settingProposalUrl}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-white text-gray-600 border border-gray-200 shadow-2xs whitespace-nowrap">
                      {settingProposalUrl.startsWith("http") ? "Cloud Storage (Supabase/CDN)" : "File Bawaan Server Lokal"}
                    </span>
                  </div>

                  {/* Edit Proposal Form */}
                  <form onSubmit={handleSaveProposalPdf} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Opsi 1: Upload File PDF Baru */}
                      <div className="space-y-2">
                        <label className="block text-[10px] font-extrabold uppercase text-gray-400 tracking-wider">
                          Opsi 1: Upload Berkas PDF Baru (Maks. 25MB)
                        </label>
                        <div className="relative border-2 border-dashed border-gray-200 hover:border-brand-red/50 rounded-2xl p-4 transition-all bg-gray-50/50 hover:bg-red-50/20 flex flex-col items-center justify-center text-center cursor-pointer group">
                          <input
                            type="file"
                            accept=".pdf,application/pdf"
                            onChange={handleProposalFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          />
                          <div className="w-10 h-10 rounded-full bg-white shadow-2xs flex items-center justify-center text-brand-red mb-2 group-hover:scale-110 transition-transform">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                          </div>
                          {proposalPdfFile ? (
                            <div className="space-y-0.5">
                              <p className="text-xs font-bold text-brand-red line-clamp-1">
                                📑 {proposalPdfFile.name}
                              </p>
                              <p className="text-[10px] text-gray-500 font-semibold">
                                Ukuran: {(proposalPdfFile.size / (1024 * 1024)).toFixed(2)} MB • Siap disimpan
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-0.5">
                              <p className="text-xs font-bold text-gray-700">
                                Klik atau seret file PDF proposal ke sini
                              </p>
                              <p className="text-[10px] text-gray-400">
                                Hanya format .PDF hingga ukuran 25MB
                              </p>
                            </div>
                          )}
                        </div>
                        {proposalPdfFile && (
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() => setProposalPdfFile(null)}
                              className="text-[10px] font-bold text-gray-400 hover:text-brand-red transition-colors cursor-pointer"
                            >
                              ✕ Batalkan pilihan file baru
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Opsi 2: Input URL Link PDF Langsung */}
                      <div className="space-y-2">
                        <label className="block text-[10px] font-extrabold uppercase text-gray-400 tracking-wider">
                          Opsi 2: Atau Tautkan URL Berkas PDF Langsung
                        </label>
                        <div className="space-y-1.5">
                          <input
                            type="text"
                            value={settingProposalUrl}
                            onChange={(e) => setSettingProposalUrl(e.target.value)}
                            placeholder="Contoh: https://... atau /proposal-kemitraan-ayapi.pdf"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red font-mono"
                          />
                          <p className="text-[10px] text-gray-400 leading-relaxed">
                            Bisa berupa link file PDF dari Google Drive, Dropbox, Supabase, atau path lokal server.
                          </p>
                        </div>

                        {/* Reset button to default */}
                        {settingProposalUrl !== "/proposal-kemitraan-ayapi.pdf" && (
                          <button
                            type="button"
                            onClick={() => {
                              setSettingProposalUrl("/proposal-kemitraan-ayapi.pdf");
                              setProposalPdfFile(null);
                            }}
                            className="text-[10px] font-bold text-brand-red hover:underline transition-all cursor-pointer inline-flex items-center gap-1"
                          >
                            <span>↺ Kembalikan ke PDF Bawaan Sistem (/proposal-kemitraan-ayapi.pdf)</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Submit Bar */}
                    <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <p className="text-[11px] text-gray-500 font-medium">
                        💡 Begitu disimpan, pengunjung yang mengisi formulir download proposal di website akan langsung mengunduh versi terbaru ini.
                      </p>
                      <button
                        type="submit"
                        disabled={isSavingProposal || isUploadingProposal}
                        className="bg-gradient-to-r from-[#D32F2F] to-[#8B0000] hover:from-[#B71C1C] hover:to-[#640000] text-white font-extrabold uppercase tracking-widest px-6 py-3 rounded-xl text-xs shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50 shrink-0 flex items-center justify-center gap-2"
                      >
                        {isSavingProposal || isUploadingProposal ? (
                          <>
                            <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <span>Menyimpan Proposal...</span>
                          </>
                        ) : (
                          <>
                            <span>💾 Simpan Perubahan Proposal PDF</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>

                {/* =====================================================================
                    TABEL DAFTAR PAKET KEMITRAAN
                   ===================================================================== */}
                <div className="bg-white border border-gray-200/60 rounded-3xl overflow-hidden shadow-sm">
                  <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-sm text-gray-900">Daftar Paket Usaha Kemitraan</h4>
                      <p className="text-[10px] text-gray-400 font-medium">Paket kemitraan yang tampil di halaman website</p>
                    </div>
                    <button
                      onClick={openPackageAdd}
                      className="bg-brand-red hover:bg-[#a01c1c] text-white font-extrabold uppercase tracking-widest px-4 py-2 rounded-xl shadow-xs text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <span className="text-sm leading-none">+</span>
                      <span>Tambah Paket</span>
                    </button>
                  </div>
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
      </div>



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
         PROMO CRUD MODAL ("DARI GAMBAR SAMPAI DALAM-DALAMNYA")
         ========================================================================= */}
      {isPromoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => !isSubmitting && setIsPromoModalOpen(false)}
          ></div>

          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-2xl w-full z-10 shadow-2xl border border-gray-100 relative max-h-[90vh] overflow-y-auto animate-fade-in space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <div>
                <h3 className="font-black text-lg text-brand-dark">
                  {editingPromo ? "Edit Promo & Pop-up Modal" : "Tambah Promo Baru"}
                </h3>
                <p className="text-[11px] text-gray-500">
                  Konfigurasi tampilan kartu beranda dan seluruh isi pop-up modal (&quot;dalam-dalamnya&quot;).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPromoModalOpen(false)}
                className="text-gray-400 hover:text-brand-dark p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handlePromoSubmit} className="space-y-6">
              {/* SECTION 1: KARTU DEPAN (TAMPILAN BERANDA) */}
              <div className="bg-gray-50/70 p-4 rounded-2xl border border-gray-200/80 space-y-4">
                <span className="text-[10px] font-black uppercase tracking-wider text-brand-red block">
                  1. Informasi Kartu (Tampilan Beranda)
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Judul Promo *</label>
                    <input
                      type="text"
                      required
                      value={promoTitle}
                      onChange={(e) => setPromoTitle(e.target.value)}
                      placeholder="Contoh: FREE DELIVERY"
                      className={`w-full px-4 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none focus:border-brand-red bg-white ${
                        formErrors.promoTitle ? "border-red-400 bg-red-50/30" : "border-gray-200"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Badge Tag</label>
                    <input
                      type="text"
                      value={promoBadge}
                      onChange={(e) => setPromoBadge(e.target.value)}
                      placeholder="Contoh: 🛵 PROMO DELIVERY"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-brand-red bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Deskripsi Singkat Kartu *</label>
                  <input
                    type="text"
                    required
                    value={promoDesc}
                    onChange={(e) => setPromoDesc(e.target.value)}
                    placeholder="Contoh: Nikmati Ayapi tanpa perlu keluar rumah"
                    className={`w-full px-4 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none focus:border-brand-red bg-white ${
                      formErrors.promoDesc ? "border-red-400 bg-red-50/30" : "border-gray-200"
                    }`}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Teks Tombol Kartu</label>
                    <input
                      type="text"
                      value={promoCtaText}
                      onChange={(e) => setPromoCtaText(e.target.value)}
                      placeholder="Default: See More"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-brand-red bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Tipe Aksi Tombol</label>
                    <select
                      value={promoActionType}
                      onChange={(e) => setPromoActionType(e.target.value as "modal" | "link")}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-brand-red bg-white"
                    >
                      <option value="modal">Buka Pop-up Modal Detail (Rekomendasi)</option>
                      <option value="link">Direct Link URL Eksternal / Internal</option>
                    </select>
                  </div>
                </div>

                {promoActionType === "link" && (
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Link URL Tujuan</label>
                    <input
                      type="text"
                      value={promoLinkUrl}
                      onChange={(e) => setPromoLinkUrl(e.target.value)}
                      placeholder="Contoh: /menu atau https://wa.me/..."
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-brand-red bg-white"
                    />
                  </div>
                )}
              </div>

              {/* SECTION 2: GAMBAR KARTU & BANNER MODAL */}
              <div className="bg-gray-50/70 p-4 rounded-2xl border border-gray-200/80 space-y-4">
                <span className="text-[10px] font-black uppercase tracking-wider text-brand-red block">
                  2. Gambar Kartu &amp; Banner Pop-up
                </span>

                {/* Card Thumbnail */}
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Gambar Kartu (Thumbnail) *</label>
                  <div className={`border-2 border-dashed rounded-2xl p-4 text-center transition-colors bg-white ${
                    formErrors.promoImage ? "border-red-400 bg-red-50/30" : "border-gray-200 hover:border-brand-red/30"
                  }`}>
                    {promoImagePreview ? (
                      <div className="relative w-full h-36 rounded-xl overflow-hidden bg-gray-100 mb-3">
                        <img src={promoImagePreview} alt="Preview Kartu" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => { setPromoImagePreview(""); setPromoImageUrlInput(""); setPromoSelectedFile(null); }}
                          className="absolute top-2 right-2 bg-white/90 text-gray-500 hover:text-brand-red rounded-lg p-1.5 transition-colors cursor-pointer"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : null}

                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setPromoSelectedFile(file);
                          setPromoImagePreview(URL.createObjectURL(file));
                          setPromoImageUrlInput("");
                          if (formErrors.promoImage) setFormErrors((prev) => ({ ...prev, promoImage: false }));
                        }
                      }}
                      className="text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-extrabold file:bg-brand-red/10 file:text-brand-red hover:file:bg-brand-red/20 cursor-pointer w-full"
                    />

                    <div className="mt-2 text-center text-[10px] text-gray-400">Atau masukkan URL gambar langsung:</div>
                    <input
                      type="text"
                      value={promoImageUrlInput}
                      onChange={(e) => {
                        setPromoImageUrlInput(e.target.value);
                        setPromoImagePreview(e.target.value);
                        setPromoSelectedFile(null);
                        if (formErrors.promoImage) setFormErrors((prev) => ({ ...prev, promoImage: false }));
                      }}
                      placeholder="https://... atau /promos/..."
                      className="mt-1 w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold focus:outline-none focus:border-brand-red"
                    />
                  </div>
                </div>

                {/* Banner Image for Modal */}
                <div className="pt-2">
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      id="useSameBanner"
                      checked={useSameImageForBanner}
                      onChange={(e) => setUseSameImageForBanner(e.target.checked)}
                      className="rounded text-brand-red focus:ring-brand-red cursor-pointer"
                    />
                    <label htmlFor="useSameBanner" className="text-xs font-bold text-gray-700 cursor-pointer">
                      Gunakan gambar yang sama untuk Header Banner di dalam Pop-up Modal
                    </label>
                  </div>

                  {!useSameImageForBanner && (
                    <div className="border border-gray-200 rounded-2xl p-4 bg-white space-y-2">
                      <label className="block text-[10px] font-bold uppercase text-gray-500">Gambar Header Banner Modal Khusus</label>
                      {bannerImagePreview && (
                        <div className="relative w-full h-28 rounded-xl overflow-hidden bg-gray-100 mb-2">
                          <img src={bannerImagePreview} alt="Preview Banner" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setBannerSelectedFile(file);
                            setBannerImagePreview(URL.createObjectURL(file));
                            setBannerImageUrlInput("");
                          }
                        }}
                        className="text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-extrabold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer w-full"
                      />
                      <input
                        type="text"
                        value={bannerImageUrlInput}
                        onChange={(e) => {
                          setBannerImageUrlInput(e.target.value);
                          setBannerImagePreview(e.target.value);
                          setBannerSelectedFile(null);
                        }}
                        placeholder="Atau URL gambar banner..."
                        className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold focus:outline-none focus:border-brand-red"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 3: ISI DALAM-DALAMNYA (MODAL DETAIL) */}
              <div className="bg-gray-50/70 p-4 rounded-2xl border border-gray-200/80 space-y-4">
                <span className="text-[10px] font-black uppercase tracking-wider text-brand-red block">
                  3. Konten &quot;Dalam-dalamnya&quot; (Pop-up Modal Detail)
                </span>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Headline / Highlight Modal</label>
                  <input
                    type="text"
                    value={promoHighlight}
                    onChange={(e) => setPromoHighlight(e.target.value)}
                    placeholder="Contoh: Gratis Ongkir Langsung ke Pintu Rumahmu!"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-brand-red bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Deskripsi Lengkap Modal</label>
                  <textarea
                    rows={3}
                    value={promoDetailsDescription}
                    onChange={(e) => setPromoDetailsDescription(e.target.value)}
                    placeholder="Tuliskan keterangan lengkap promo yang muncul di dalam modal pop-up..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-brand-red bg-white"
                  />
                </div>

                {/* Dynamic Points Editor */}
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1.5">
                    Syarat &amp; Ketentuan / Poin Keuntungan (Poin List)
                  </label>
                  <div className="space-y-2 mb-2">
                    {promoPoints.map((pt, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-gray-200">
                        <span className="text-xs text-brand-red font-black">•</span>
                        <input
                          type="text"
                          value={pt}
                          onChange={(e) => {
                            const val = e.target.value;
                            setPromoPoints((prev) => prev.map((item, i) => (i === idx ? val : item)));
                          }}
                          className="w-full text-xs font-medium focus:outline-none bg-transparent"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemovePromoPoint(idx)}
                          className="text-gray-400 hover:text-brand-red p-1 cursor-pointer"
                          title="Hapus baris poin"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newPointInput}
                      onChange={(e) => setNewPointInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddPromoPoint();
                        }
                      }}
                      placeholder="Ketik poin syarat/keuntungan lalu klik tombol Tambah..."
                      className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:outline-none focus:border-brand-red bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddPromoPoint}
                      className="bg-brand-dark hover:bg-black text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap"
                    >
                      + Tambah Poin
                    </button>
                  </div>
                </div>

                {/* Modal CTA Button */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Teks Tombol Aksi di Modal</label>
                    <input
                      type="text"
                      value={promoActionButtonText}
                      onChange={(e) => setPromoActionButtonText(e.target.value)}
                      placeholder="Contoh: Pesan via WhatsApp Delivery"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-brand-red bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">URL Tujuan Tombol Aksi</label>
                    <input
                      type="text"
                      value={promoActionButtonUrl}
                      onChange={(e) => setPromoActionButtonUrl(e.target.value)}
                      placeholder="Contoh: https://wa.me/628213444730?text=..."
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-brand-red bg-white"
                    />
                  </div>
                </div>

                {/* QR Barcode Toggle */}
                <div className="flex items-center justify-between p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl">
                  <div>
                    <span className="text-xs font-black text-amber-950 block">Tampilkan QR Barcode WhatsApp</span>
                    <span className="text-[10px] text-amber-800">
                      Otomatis menampilkan QR Barcode scan kamera HP di dalam modal (cocok untuk reservasi event/ulang tahun).
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPromoShowQrCode(!promoShowQrCode)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer shrink-0 ml-4 ${
                      promoShowQrCode ? "bg-brand-red" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                        promoShowQrCode ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Status Toggle */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
                <div>
                  <span className="text-xs font-extrabold text-gray-900 block">Status Publikasi Promo</span>
                  <span className="text-[10px] text-gray-400">Jika nonaktif, promo ini tidak akan muncul di halaman beranda.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setPromoIsActive(!promoIsActive)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer shrink-0 ${
                    promoIsActive ? "bg-emerald-500" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                      promoIsActive ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Form Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsPromoModalOpen(false)}
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
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      {isUploading ? "Mengunggah Gambar..." : "Menyimpan Promo..."}
                    </>
                  ) : editingPromo ? (
                    "Simpan Perubahan Promo"
                  ) : (
                    "Tambah Promo Baru"
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

              {/* Image Upload & Preview */}
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-gray-400 tracking-wider mb-1.5">
                  Foto Mockup Paket *
                </label>
                <div className="space-y-3">
                  {imagePreview && (
                    <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shadow-inner group">
                      <img
                        src={imagePreview}
                        alt="Preview Paket"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview("");
                          setSelectedFile(null);
                          setImageUrlInput("");
                        }}
                        className="absolute top-2 right-2 bg-red-600/90 hover:bg-red-700 text-white rounded-lg p-1.5 transition-colors shadow cursor-pointer"
                        title="Hapus Gambar"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="block text-[9px] font-bold text-gray-400 uppercase">Unggah File Foto</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-bold file:uppercase file:bg-brand-red/5 file:text-brand-red hover:file:bg-brand-red/10 cursor-pointer"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="block text-[9px] font-bold text-gray-400 uppercase">Atau Masukkan Link URL Mockup</span>
                      <input
                        type="text"
                        value={imageUrlInput}
                        onChange={(e) => {
                          setImageUrlInput(e.target.value);
                          setImagePreview(e.target.value);
                          setSelectedFile(null);
                        }}
                        placeholder="/packages/booth-express-1.jpg atau https://..."
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
                      />
                    </div>
                  </div>
                </div>
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
                  disabled={isSubmitting || isUploading}
                  className="flex-1 bg-brand-red hover:bg-[#a01c1c] text-white font-extrabold uppercase tracking-widest py-3.5 rounded-xl text-xs shadow-md hover:shadow-lg disabled:bg-gray-400 cursor-pointer"
                >
                  {isUploading ? "Mengunggah Gambar..." : isSubmitting ? "Menyimpan..." : "Simpan Paket"}
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
