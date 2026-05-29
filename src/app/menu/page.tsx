"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { getMenuItems, getBranches, getCategories, MenuItem, Branch, createOrder } from "@/app/actions";
import CustomSelect from "@/components/CustomSelect";

type CartItem = {
  item: MenuItem;
  quantity: number;
};


export default function Menu() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderName, setOrderName] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [selectedOjolBranchIndex, setSelectedOjolBranchIndex] = useState<number>(0);
  const [isLoadingBranches, setIsLoadingBranches] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load cart from Local Storage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("ayapi_cart");
      if (savedCart) {
        // Defer setting state to resolve react-hooks/set-state-in-effect warning
        Promise.resolve().then(() => {
          setCart(JSON.parse(savedCart));
        });
      }
    } catch (err) {
      console.error("Gagal memuat keranjang dari local storage:", err);
    }
  }, []);

  // Save cart to Local Storage on change
  useEffect(() => {
    try {
      localStorage.setItem("ayapi_cart", JSON.stringify(cart));
    } catch (err) {
      console.error("Gagal menyimpan keranjang ke local storage:", err);
    }
  }, [cart]);

  const [branches, setBranches] = useState<Branch[]>([]);

  const [categories, setCategories] = useState<{ id: string; name: string }[]>([
    { id: "all", name: "Semua Menu" },
    { id: "krisbar", name: "Ayam Krisbar" },
    { id: "paket", name: "Paket Hemat" },
    { id: "geprek", name: "Ayam Geprek" },
    { id: "sambal", name: "Aneka Sambal" },
  ]);

  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    // Krisbar Category
    {
      name: "Ayapi Krisbar Original",
      price: "Rp 22.000",
      description: "Ayam goreng tepung krispi gurih yang dibakar dengan balutan saus manis pedas khas Ayapi.",
      image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=500&q=80",
      category: "krisbar",
    },
    {
      name: "Ayapi Krisbar Madu",
      price: "Rp 24.000",
      description: "Ayam krispi bakar berlapis madu murni manis gurih legit dengan bumbu rempah pilihan.",
      image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=500&q=80",
      category: "krisbar",
    },
    {
      name: "Ayapi Krisbar Cheese",
      price: "Rp 25.000",
      description: "Ayam krispi bakar lezat disiram saus keju cheddar creamy gurih yang berlimpah.",
      image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=500&q=80",
      category: "krisbar",
    },
    // Paket Category
    {
      name: "Paket Krisbar Hemat",
      price: "Rp 27.000",
      description: "Nasi putih hangat + Ayam Krisbar Original + lalapan segar (kol, timun, kemangi) + Sambal.",
      image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=500&q=80",
      category: "paket",
    },
    {
      name: "Paket Krisbar Duo",
      price: "Rp 45.000",
      description: "Nasi hangat + 2 Ayam Krisbar Original + Es Teh manis segar + lalapan dan sambal nikmat.",
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80",
      category: "paket",
    },
    {
      name: "Paket Krisbar Family",
      price: "Rp 95.000",
      description: "Porsi keluarga! 5 Ayam Krisbar Original + 4 Nasi putih + 4 Es Teh + sambal ekstra besar.",
      image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=500&q=80",
      category: "paket",
    },
    // Geprek Category
    {
      name: "Paket Geprek Krisbar",
      price: "Rp 25.000",
      description: "Nasi hangat + Ayam krispi bakar yang digeprek dengan sambal korek bawang rawit merah super pedas.",
      image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=500&q=80",
      category: "geprek",
    },
    {
      name: "Paket Geprek Krisbar Ijo",
      price: "Rp 26.000",
      description: "Nasi hangat + Ayam krispi bakar digeprek dengan sambal hijau cabai ijo besar Padang segar gurih.",
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80",
      category: "geprek",
    },
    // Sambal Category
    {
      name: "Sambal Korek Bawang",
      price: "Rp 4.000",
      description: "Sambal bawang rawit pedas murni disiram minyak kelapa panas, cocok untuk cocolan.",
      image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=500&q=80",
      category: "sambal",
    },
    {
      name: "Sambal Ijo Padang",
      price: "Rp 4.000",
      description: "Sambal cabai hijau muda khas Minang dengan rasa pedas lembut gurih dan aroma harum.",
      image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=500&q=80",
      category: "sambal",
    },
  ]);

  useEffect(() => {
    const fetchMenuAndBranches = async () => {
      try {
        const [items, branchList, categoriesList] = await Promise.all([
          getMenuItems(),
          getBranches(),
          getCategories(),
        ]);
        if (items.length > 0) {
          setMenuItems(items);
        }
        if (branchList.length > 0) {
          setBranches(branchList);
          if (branchList[0]) {
            setSelectedBranch(branchList[0].name);
          }
        }
        if (categoriesList.length > 0) {
          setCategories([
            { id: "all", name: "Semua Menu" },
            ...categoriesList.map((c) => ({ id: c.key, name: c.name })),
          ]);
        }
      } catch (err) {
        console.error("Gagal memuat menu, cabang, dan kategori:", err);
      } finally {
        setIsLoadingBranches(false);
      }
    };
    fetchMenuAndBranches();
  }, []);

  const parsePrice = (priceStr: string) => {
    return parseInt(priceStr.replace(/[^0-9]/g, ""), 10);
  };

  const formatPrice = (price: number) => {
    return "Rp " + price.toLocaleString("id-ID");
  };

  const addToCart = (item: MenuItem) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.item.name === item.name);
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.item.name === item.name
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prevCart, { item, quantity: 1 }];
    });
  };

  const updateQuantity = (itemName: string, amount: number) => {
    setCart((prevCart) => {
      return prevCart
        .map((cartItem) => {
          if (cartItem.item.name === itemName) {
            const newQty = cartItem.quantity + amount;
            return { ...cartItem, quantity: newQty };
          }
          return cartItem;
        })
        .filter((cartItem) => cartItem.quantity > 0);
    });
  };

  const removeFromCart = (itemName: string) => {
    setCart((prevCart) => prevCart.filter((cartItem) => cartItem.item.name !== itemName));
  };

  const getCartTotal = () => {
    return cart.reduce((sum, cartItem) => {
      return sum + parsePrice(cartItem.item.price) * cartItem.quantity;
    }, 0);
  };

  const getCartCount = () => {
    return cart.reduce((sum, cartItem) => sum + cartItem.quantity, 0);
  };

  const handleSendWhatsApp = async () => {
    if (!orderName.trim()) {
      alert("Silakan masukkan nama pemesan terlebih dahulu.");
      return;
    }

    const lastOrderTime = localStorage.getItem("ayapi_last_order_time");
    const now = Date.now();
    if (lastOrderTime && now - parseInt(lastOrderTime, 10) < 2 * 60 * 1000) {
      alert("Harap tunggu 2 menit sebelum mengirim pesanan kembali untuk menghindari spam fiktif.");
      return;
    }

    setIsSubmitting(true);

    const orderItems = cart.map((cartItem) => ({
      name: cartItem.item.name,
      quantity: cartItem.quantity,
      price: cartItem.item.price,
    }));

    try {
      await createOrder({
        customer_name: orderName.trim(),
        branch_name: selectedBranch || (branches[0]?.name || "Cabang Utama"),
        notes: orderNotes.trim(),
        total_price: getCartTotal(),
        items: orderItems,
      });

      localStorage.setItem("ayapi_last_order_time", now.toString());

      const cartDetails = cart
        .map(
          (cartItem) =>
            `- ${cartItem.quantity}x ${cartItem.item.name} (${formatPrice(
              parsePrice(cartItem.item.price) * cartItem.quantity
            )})`
        )
        .join("\n");

      const messageTemplate =
        `Halo Ayapi Krispi Bakar!\n` +
        `Saya ingin memesan menu berikut melalui website:\n\n` +
        `${cartDetails}\n\n` +
        `*Total Pesanan:* ${formatPrice(getCartTotal())}\n` +
        `*Nama Pemesan:* ${orderName.trim()}\n` +
        `*Cabang Terdekat:* ${selectedBranch || (branches[0]?.name || "Cabang Utama")}\n` +
        (orderNotes.trim() ? `*Catatan:* ${orderNotes.trim()}\n` : "") +
        `\nMohon segera diproses ya. Terima kasih!`;

      const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "6287777652032";
      const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(messageTemplate)}`;

      // Reset cart and fields
      setCart([]);
      setOrderName("");
      setOrderNotes("");
      setIsCartOpen(false);

      window.open(waUrl, "_blank");
    } catch (err) {
      console.error("Gagal mencatat pesanan:", err);
      alert("Terjadi kesalahan sistem saat memproses pesanan. Silakan coba beberapa saat lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full bg-white py-12 md:py-20 relative min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-brand-red font-bold text-xs uppercase tracking-widest px-4 py-1.5 bg-brand-red/10 rounded-full inline-block mb-3">
            Menu Istimewa Kami
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-brand-dark mb-4">
            Daftar Menu Ayapi
          </h1>
          <div className="h-1.5 w-16 bg-brand-red mx-auto rounded-full mb-4"></div>
          <p className="text-gray-500 text-sm md:text-base">
            Jelajahi kelezatan menu Ayam Krispi Bakar kami. Nikmati kerenyahan bintang lima dengan harga merakyat!
          </p>
        </div>

        {/* Online Food Shop Deep Link Banner */}
        <div className="bg-gradient-to-r from-gray-50 to-brand-light border border-gray-200/60 rounded-3xl p-6 md:p-8 mb-12 max-w-4xl mx-auto shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2">
              <span className="bg-[#25D366]/10 text-[#128C7E] font-bold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-md inline-block">
                Pesan Cepat Via Aplikasi Ojol
              </span>
              <h3 className="font-bold text-lg text-brand-dark">Pesan Lewat Ojek Online</h3>
              <p className="text-xs text-gray-500 max-w-md">
                Pilih cabang Ayapi terdekat dari lokasi Anda untuk menikmati promo ongkir dan menu eksklusif di aplikasi ojol kesayangan Anda.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
              <div className="shrink-0 w-full sm:w-[220px]">
                <CustomSelect
                  options={
                    isLoadingBranches
                      ? [{ value: 0, label: "Memuat cabang..." }]
                      : branches.map((branch, index) => ({
                          value: index,
                          label: branch.name,
                        }))
                  }
                  value={selectedOjolBranchIndex}
                  onChange={(val) => setSelectedOjolBranchIndex(Number(val))}
                  disabled={isLoadingBranches}
                />
              </div>

              {/* Ojol Apps Buttons */}
              <div className="flex gap-2 justify-center">
                <a
                  href={branches[selectedOjolBranchIndex]?.gofood || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-center p-2.5 bg-[#E42327]/10 hover:bg-[#E42327]/20 border border-[#E42327]/20 rounded-xl transition-all duration-200 ${!branches[selectedOjolBranchIndex]?.gofood ? "opacity-40 pointer-events-none cursor-not-allowed" : ""
                    }`}
                  title="Pesan via GoFood"
                >
                  <span className="text-xs font-bold text-[#E42327] px-1">GoFood</span>
                </a>
                <a
                  href={branches[selectedOjolBranchIndex]?.grabfood || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-center p-2.5 bg-[#00B14F]/10 hover:bg-[#00B14F]/20 border border-[#00B14F]/20 rounded-xl transition-all duration-200 ${!branches[selectedOjolBranchIndex]?.grabfood ? "opacity-40 pointer-events-none cursor-not-allowed" : ""
                    }`}
                  title="Pesan via GrabFood"
                >
                  <span className="text-xs font-bold text-[#00B14F] px-1">GrabFood</span>
                </a>
                <a
                  href={branches[selectedOjolBranchIndex]?.shopeefood || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-center p-2.5 bg-[#EE4D2D]/10 hover:bg-[#EE4D2D]/20 border border-[#EE4D2D]/20 rounded-xl transition-all duration-200 ${!branches[selectedOjolBranchIndex]?.shopeefood ? "opacity-40 pointer-events-none cursor-not-allowed" : ""
                    }`}
                  title="Pesan via ShopeeFood"
                >
                  <span className="text-xs font-bold text-[#EE4D2D] px-1">ShopeeFood</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-8 relative px-4 sm:px-0">
          <span className="absolute inset-y-0 left-0 pl-7 sm:pl-3 flex items-center text-gray-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Cari menu terlezat pilihan Anda (contoh: Bakar, Madu, Keju)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-10 py-3 border border-gray-200 focus:border-brand-red focus:ring-1 focus:ring-brand-red rounded-2xl text-xs font-semibold focus:outline-none transition-all shadow-sm bg-white text-gray-700"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-brand-red transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Categories Tab Filters */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-10">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold tracking-wide uppercase transition-all duration-200 cursor-pointer ${activeCategory === category.id
                ? "bg-brand-red text-white shadow-md shadow-brand-red/20 scale-105"
                : "bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-brand-dark"
                }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item, index) => {
            const cartItem = cart.find((ci) => ci.item.name === item.name);
            return (
              <div
                key={index}
                className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 flex flex-col h-full group"
              >
                {/* Image Section */}
                <div className="relative w-full h-[220px] bg-gray-50 overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    loading="lazy"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    sizes="(max-w-768px) 100vw, 33vw"
                  />
                  {/* Category Badge */}
                  <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-brand-red text-[10px] font-bold tracking-wider px-3 py-1 rounded-full shadow-sm uppercase">
                    {categories.find((c) => c.id === item.category)?.name || item.category}
                  </span>
                  {/* Out of Stock Overlay */}
                  {item.is_available === false && (
                    <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px] flex items-center justify-center z-10">
                      <span className="bg-brand-red text-white text-xs font-black uppercase tracking-widest px-4 py-2 rounded-xl shadow-lg animate-pulse">
                        Habis
                      </span>
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <h3 className="font-bold text-lg text-brand-dark leading-snug group-hover:text-brand-red transition-colors duration-200">
                      {item.name}
                    </h3>
                    <span className="bg-brand-yellow/10 text-[#b38000] font-extrabold text-sm px-3 py-1 rounded-xl whitespace-nowrap">
                      {item.price}
                    </span>
                  </div>
                  <p className="text-gray-500 text-xs leading-relaxed mb-6 flex-grow">
                    {item.description}
                  </p>

                  {/* Action Button: Add to Cart */}
                  {item.is_available === false ? (
                    <button
                      disabled
                      className="w-full flex items-center justify-center gap-2 bg-gray-100 border border-gray-200 text-gray-400 font-bold text-xs uppercase py-3.5 rounded-xl cursor-not-allowed"
                    >
                      Stok Habis
                    </button>
                  ) : cartItem ? (
                    <div className="flex items-center justify-between bg-gray-50 border border-gray-200/80 rounded-xl p-1.5 w-full">
                      <button
                        onClick={() => updateQuantity(item.name, -1)}
                        className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 text-gray-500 hover:text-brand-red hover:border-brand-red/30 rounded-lg transition-all font-extrabold cursor-pointer"
                      >
                        -
                      </button>
                      <span className="font-bold text-sm text-brand-dark px-4">{cartItem.quantity}</span>
                      <button
                        onClick={() => addToCart(item)}
                        className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 text-gray-500 hover:text-brand-red hover:border-brand-red/30 rounded-lg transition-all font-extrabold cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => addToCart(item)}
                      className="w-full flex items-center justify-center gap-2 bg-brand-red hover:bg-[#a01c1c] text-white font-bold text-xs uppercase py-3 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Tambah ke Keranjang
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Menu Notes Banner */}
        <div className="bg-gray-50 border border-gray-100 rounded-3xl p-8 mt-16 text-center max-w-4xl mx-auto">
          <h3 className="font-bold text-base text-brand-dark mb-2">Informasi Tambahan</h3>
          <p className="text-gray-500 text-xs leading-relaxed max-w-2xl mx-auto">
            Harga dapat bervariasi tergantung lokasi outlet kemitraan. Menu kami menggunakan 100% bahan halal dan higienis. Jika ada alergi tertentu silakan tulis pada catatan pemesanan.
          </p>
        </div>
      </div>

      {/* FLOATING CART BAR */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-xl animate-bounce-short">
          <div className="bg-brand-dark/95 backdrop-blur-md text-white px-6 py-4 rounded-2xl shadow-xl flex items-center justify-between border border-white/10">
            <div className="flex items-center gap-3">
              <div className="relative p-2.5 bg-brand-red rounded-xl">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="absolute -top-1.5 -right-1.5 bg-brand-yellow text-black font-extrabold text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                  {getCartCount()}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-300 font-medium">Total Pesanan</p>
                <p className="text-sm font-extrabold text-brand-yellow">{formatPrice(getCartTotal())}</p>
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(true)}
              className="bg-brand-red hover:bg-[#a01c1c] text-white font-extrabold text-xs uppercase px-5 py-2.5 rounded-xl shadow-md transition-all duration-200 cursor-pointer"
            >
              Lihat Keranjang
            </button>
          </div>
        </div>
      )}

      {/* CART DRAWER / MODAL OVERLAY */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop Overlay */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsCartOpen(false)}
          ></div>

          {/* Drawer Panel */}
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full">

              {/* Drawer Header */}
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <h2 className="text-lg font-bold text-brand-dark flex items-center gap-2">
                  <svg className="w-5 h-5 text-brand-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Keranjang Pemesanan
                </h2>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="text-gray-400 hover:text-brand-dark p-1 rounded-lg hover:bg-gray-100 transition-all cursor-pointer"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-grow overflow-y-auto px-6 py-4 space-y-6">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
                    <div className="p-4 bg-gray-50 rounded-full text-gray-300">
                      <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-brand-dark text-base">Keranjang Anda Kosong</h3>
                    <p className="text-xs text-gray-400 max-w-xs leading-relaxed">
                      Silakan pilih menu lezat Ayapi dan tambahkan ke keranjang untuk memesan via WhatsApp.
                    </p>
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="bg-brand-red hover:bg-[#a01c1c] text-white font-bold text-xs uppercase px-6 py-2.5 rounded-xl transition-all duration-200 cursor-pointer"
                    >
                      Mulai Belanja
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Item List */}
                    <div className="space-y-4 divide-y divide-gray-100">
                      {cart.map((cartItem) => (
                        <div key={cartItem.item.name} className="flex gap-4 pt-4 first:pt-0 items-start">
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-gray-100 bg-gray-50">
                            <Image
                              src={cartItem.item.image}
                              alt={cartItem.item.name}
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          </div>
                          <div className="flex-grow space-y-1">
                            <div className="flex justify-between items-start gap-2">
                              <h4 className="font-bold text-sm text-brand-dark leading-snug">{cartItem.item.name}</h4>
                              <button
                                onClick={() => removeFromCart(cartItem.item.name)}
                                className="text-gray-400 hover:text-brand-red transition-colors p-0.5 cursor-pointer"
                                title="Hapus Item"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                            <p className="text-xs text-gray-500 font-medium">{cartItem.item.price}</p>

                            {/* Qty Control & Subtotal */}
                            <div className="flex items-center justify-between pt-1.5">
                              <div className="flex items-center border border-gray-200 rounded-lg p-0.5 bg-gray-50 scale-90 -origin-left">
                                <button
                                  onClick={() => updateQuantity(cartItem.item.name, -1)}
                                  className="w-7 h-7 flex items-center justify-center bg-white border border-gray-100 text-gray-500 hover:text-brand-red rounded transition-all font-bold cursor-pointer"
                                >
                                  -
                                </button>
                                <span className="font-bold text-xs text-brand-dark px-2.5">{cartItem.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(cartItem.item.name, 1)}
                                  className="w-7 h-7 flex items-center justify-center bg-white border border-gray-100 text-gray-500 hover:text-brand-red rounded transition-all font-bold cursor-pointer"
                                >
                                  +
                                </button>
                              </div>
                              <span className="font-bold text-xs text-brand-dark">
                                {formatPrice(parsePrice(cartItem.item.price) * cartItem.quantity)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Details Form */}
                    <div className="pt-6 border-t border-gray-100 space-y-4">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-gray-400">Informasi Pemesanan</h4>

                      <div>
                        <label htmlFor="orderName" className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">
                          Nama Pemesan *
                        </label>
                        <input
                          type="text"
                          id="orderName"
                          value={orderName}
                          onChange={(e) => setOrderName(e.target.value)}
                          placeholder="Masukkan nama Anda..."
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red transition-all"
                        />
                      </div>

                      <div>
                        <label htmlFor="orderBranch" className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">
                          Cabang Terdekat / Pilihan Outlet *
                        </label>
                        <CustomSelect
                          id="orderBranch"
                          options={
                            isLoadingBranches
                              ? [{ value: "", label: "Memuat cabang..." }]
                              : branches.map((branch) => ({
                                  value: branch.name,
                                  label: branch.name,
                                }))
                          }
                          value={selectedBranch}
                          onChange={(val) => setSelectedBranch(val)}
                          disabled={isLoadingBranches}
                          placeholder={isLoadingBranches ? "Memuat cabang..." : "Pilih Cabang..."}
                        />
                      </div>

                      <div>
                        <label htmlFor="orderNotes" className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">
                          Catatan (Opsional)
                        </label>
                        <textarea
                          id="orderNotes"
                          rows={2}
                          value={orderNotes}
                          onChange={(e) => setOrderNotes(e.target.value)}
                          placeholder="Contoh: Sambal ijo dipisah, paha bawah..."
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red transition-all"
                        ></textarea>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Drawer Footer */}
              {cart.length > 0 && (
                <div className="px-6 py-5 border-t border-gray-100 bg-gray-50 space-y-4">
                  <div className="flex items-center justify-between font-bold text-brand-dark">
                    <span className="text-sm">Total Belanja</span>
                    <span className="text-base text-brand-red">{formatPrice(getCartTotal())}</span>
                  </div>

                  <button
                    onClick={handleSendWhatsApp}
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white font-extrabold text-xs uppercase tracking-wider py-4 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436.002 9.858-4.384 9.86-9.778.002-2.613-1.015-5.07-2.861-6.918C16.626 2.062 14.17 1.043 11.56 1.043c-5.443 0-9.865 4.386-9.867 9.782-.001 1.77.476 3.498 1.38 5.061L1.96 21.05l5.244-1.378zm11.385-6.85c-.3-.15-1.77-.874-2.043-.974-.275-.1-.475-.15-.675.15-.2.3-.775.975-.95 1.174-.175.2-.35.225-.65.075-1.205-.6-2.015-1.112-2.823-2.507-.213-.368-.213-.7-.076-.875.124-.15.275-.325.412-.49.137-.162.18-.275.273-.45.093-.188.046-.35-.022-.5-.069-.15-.675-1.625-.925-2.225-.244-.588-.492-.51-.675-.52-.172-.007-.369-.007-.565-.007-.196 0-.517.074-.788.374-.27.3-1.03 1.01-1.03 2.46s1.055 2.85 1.202 3.05c.148.2 2.077 3.17 5.034 4.45.703.303 1.25.485 1.678.62.707.224 1.35.193 1.86.117.567-.085 1.77-.724 2.02-1.41.25-.688.25-1.275.175-1.41-.075-.137-.275-.212-.575-.362z" />
                    </svg>
                    {isSubmitting ? "Memproses Pesanan..." : "Kirim via WhatsApp"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
