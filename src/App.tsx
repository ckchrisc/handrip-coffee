/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { COFFEE_BEANS, COLD_BREW_PRODUCTS, DRIP_BAG_PRODUCTS, COFFEE_GEAR_PRODUCTS, FAQS, DEFAULT_PROMOTIONS } from './data';
import { CoffeeBean, ColdBrewProduct, DripBagProduct, EquipmentProduct, OrderItem, CustomerOrder, ShopPromotion, PaymentSettings } from './types';
import WashiBackground from './components/WashiBackground';
import SakuraBlossoms from './components/SakuraBlossoms';
import BrandCrest from './components/BrandCrest';
import CoffeeMatchmaker from './components/CoffeeMatchmaker';
import OrderDrawer from './components/OrderDrawer';
import RadarChart from './components/RadarChart';
import HeadLogo from './components/HeadLogo';
import AdminConsole from './components/AdminConsole';

import {
  Flame,
  Award,
  Coffee,
  Sparkles,
  ArrowRight,
  HelpCircle,
  ShoppingCart,
  Instagram,
  Compass,
  AlertCircle,
  Menu,
  X,
  Clock,
  Truck,
  Lock
} from 'lucide-react';

export default function App() {
  // Product list states synced with localStorage
  const [beans, setBeans] = useState<CoffeeBean[]>(() => {
    const saved = localStorage.getItem('handrip_beans');
    return saved ? JSON.parse(saved) : COFFEE_BEANS;
  });
  const [coldBrews, setColdBrews] = useState<ColdBrewProduct[]>(() => {
    const saved = localStorage.getItem('handrip_coldbrews');
    return saved ? JSON.parse(saved) : COLD_BREW_PRODUCTS;
  });
  const [dripBags, setDripBags] = useState<DripBagProduct[]>(() => {
    const saved = localStorage.getItem('handrip_dripbags');
    return saved ? JSON.parse(saved) : DRIP_BAG_PRODUCTS;
  });
  const [equipments, setEquipments] = useState<EquipmentProduct[]>(() => {
    const saved = localStorage.getItem('handrip_equipments');
    return saved ? JSON.parse(saved) : COFFEE_GEAR_PRODUCTS;
  });

  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);

  // Shop Promotions state loaded from local storage or defaults
  const [promotions, setPromotions] = useState<ShopPromotion[]>(() => {
    const saved = localStorage.getItem('handrip_promotions');
    const list: ShopPromotion[] = saved ? JSON.parse(saved) : DEFAULT_PROMOTIONS;
    const now = new Date();
    let updated = false;
    const checked = list.map(p => {
      if (p.isActive && p.expiryDate && now > new Date(p.expiryDate)) {
        updated = true;
        return { ...p, isActive: false };
      }
      return p;
    });
    if (updated) {
      localStorage.setItem('handrip_promotions', JSON.stringify(checked));
      return checked;
    }
    return list;
  });

  // Periodically check and deactivate expired promotions
  useEffect(() => {
    const checkExpiry = () => {
      const now = new Date();
      let changed = false;
      const checked = promotions.map(p => {
        if (p.isActive && p.expiryDate && now > new Date(p.expiryDate)) {
          changed = true;
          return { ...p, isActive: false };
        }
        return p;
      });
      if (changed) {
        setPromotions(checked);
        localStorage.setItem('handrip_promotions', JSON.stringify(checked));
      }
    };
    checkExpiry();
    const interval = setInterval(checkExpiry, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [promotions]);

  // Submitted Customer Orders list from local storage
  const [orders, setOrders] = useState<CustomerOrder[]>(() => {
    const saved = localStorage.getItem('handrip_orders');
    return saved ? JSON.parse(saved) : [];
  });

  // Custom client-side brand logo
  const [customLogoUrl, setCustomLogoUrl] = useState<string>(() => {
    return localStorage.getItem('handrip_custom_logo') || '';
  });

  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>(() => {
    const saved = localStorage.getItem('handrip_payment_settings');
    return saved ? JSON.parse(saved) : {
      fpsId: '12345678',
      fpsQrCodeUrl: '',
      paymeQrCodeUrl: ''
    };
  });

  const handlePlaceOrder = (newOrder: CustomerOrder) => {
    // 1. Add order to state & local storage
    setOrders((prev) => {
      const nextOrders = [newOrder, ...prev];
      localStorage.setItem('handrip_orders', JSON.stringify(nextOrders));
      return nextOrders;
    });

    // 2. Decrement stocks
    let updatedBeans = [...beans];
    let updatedColdBrews = [...coldBrews];
    let updatedDripBags = [...dripBags];
    let updatedEquipments = [...equipments];

    let hasBeansUpdate = false;
    let hasColdBrewsUpdate = false;
    let hasDripBagsUpdate = false;
    let hasEquipmentsUpdate = false;

    newOrder.items.forEach(item => {
      if (item.category === 'beans') {
        updatedBeans = updatedBeans.map(b => {
          if (b.id === item.productId) {
            hasBeansUpdate = true;
            const currentStock = b.stock ?? 30;
            const nextStock = Math.max(0, currentStock - item.quantity);
            return {
              ...b,
              stock: nextStock,
              isOutOfStock: nextStock <= 0 ? true : b.isOutOfStock
            };
          }
          return b;
        });
      } else if (item.category === 'coldbrew') {
        updatedColdBrews = updatedColdBrews.map(cb => {
          if (cb.id === item.productId) {
            hasColdBrewsUpdate = true;
            const currentStock = cb.stock ?? 20;
            const nextStock = Math.max(0, currentStock - item.quantity);
            return {
              ...cb,
              stock: nextStock,
              isOutOfStock: nextStock <= 0 ? true : cb.isOutOfStock
            };
          }
          return cb;
        });
      } else if (item.category === 'dripbags') {
        updatedDripBags = updatedDripBags.map(db => {
          if (db.id === item.productId) {
            hasDripBagsUpdate = true;
            const currentStock = db.stock ?? 15;
            const nextStock = Math.max(0, currentStock - item.quantity);
            return {
              ...db,
              stock: nextStock,
              isOutOfStock: nextStock <= 0 ? true : db.isOutOfStock
            };
          }
          return db;
        });
      } else if (item.category === 'equipment') {
        updatedEquipments = updatedEquipments.map(eq => {
          if (eq.id === item.productId) {
            hasEquipmentsUpdate = true;
            const currentStock = eq.stock ?? 10;
            const nextStock = Math.max(0, currentStock - item.quantity);
            return {
              ...eq,
              stock: nextStock,
              isOutOfStock: nextStock <= 0 ? true : eq.isOutOfStock
            };
          }
          return eq;
        });
      }
    });

    if (hasBeansUpdate) {
      setBeans(updatedBeans);
      localStorage.setItem('handrip_beans', JSON.stringify(updatedBeans));
    }
    if (hasColdBrewsUpdate) {
      setColdBrews(updatedColdBrews);
      localStorage.setItem('handrip_coldbrews', JSON.stringify(updatedColdBrews));
    }
    if (hasDripBagsUpdate) {
      setDripBags(updatedDripBags);
      localStorage.setItem('handrip_dripbags', JSON.stringify(updatedDripBags));
    }
    if (hasEquipmentsUpdate) {
      setEquipments(updatedEquipments);
      localStorage.setItem('handrip_equipments', JSON.stringify(updatedEquipments));
    }
  };

  // Order list state
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [activeMenuTab, setActiveMenuTab] = useState<'beans' | 'coldbrew' | 'dripbags'>('beans');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Freshness live countdown simulator
  const [hoursLeft, setHoursLeft] = useState<number>(34);
  const [minutesLeft, setMinutesLeft] = useState<number>(14);
  const [secondsLeft, setSecondsLeft] = useState<number>(45);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev > 0) return prev - 1;
        setMinutesLeft((m) => {
          if (m > 0) return m - 1;
          setHoursLeft((h) => (h > 0 ? h - 1 : 47));
          return 59;
        });
        return 59;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Standard checkout action multipliers
  const handleAddToOrder = (item: OrderItem) => {
    setOrderItems((prev) => {
      const match = prev.find(
        (i) => i.productId === item.productId && i.grindSize === item.grindSize
      );
      if (match) {
        return prev.map((i) =>
          i.productId === item.productId && i.grindSize === item.grindSize
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prev, item];
    });
    // Open cart drawer immediately to provide visual confirmation
    setIsDrawerOpen(true);
  };

  const handleAddBeanToOrder = (bean: CoffeeBean, qty: number, grind: string) => {
    const item: OrderItem = {
      id: `${bean.id}-${grind}`,
      productId: bean.id,
      name: bean.name,
      category: 'beans',
      price: bean.price,
      quantity: qty,
      grindSize: grind
    };
    handleAddToOrder(item);
  };

  const handleAddColdBrew = (prod: ColdBrewProduct) => {
    const item: OrderItem = {
      id: prod.id,
      productId: prod.id,
      name: prod.name,
      category: 'coldbrew',
      price: prod.price,
      quantity: 1
    };
    handleAddToOrder(item);
  };

  const handleAddDripBag = (prod: DripBagProduct) => {
    const item: OrderItem = {
      id: prod.id,
      productId: prod.id,
      name: prod.name,
      category: 'dripbags',
      price: prod.price,
      quantity: 1
    };
    handleAddToOrder(item);
  };

  const handleAddEquipment = (prod: EquipmentProduct) => {
    const item: OrderItem = {
      id: prod.id,
      productId: prod.id,
      name: prod.name,
      category: 'equipment',
      price: prod.price,
      quantity: 1
    };
    handleAddToOrder(item);
  };

  const handleRemoveItem = (id: string) => {
    setOrderItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdateQuantity = (id: string, q: number) => {
    setOrderItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: q } : item))
    );
  };

  const handleClearOrder = () => {
    setOrderItems([]);
  };

  const totalBasketCount = orderItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <WashiBackground>
      {/* 2. Top Minimal navigation bar */}
      <header className="sticky top-0 bg-[#1A1816]/90 backdrop-blur-md border-b border-transparent z-30 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <a href="#" className="flex items-center space-x-2.5 hover:opacity-90 transition-opacity">
            <HeadLogo className="w-8 h-8 rounded-full border border-[#8C827A]/30 bg-[#24211E] p-0.5" customLogoUrl={customLogoUrl} />
            <span className="text-sm font-serif font-bold tracking-widest text-[#E5DCD3]">
              Handrip Co.
            </span>
          </a>

          {/* Desktop menu */}
          <nav className="hidden md:flex items-center space-x-8 text-xs font-serif tracking-widest text-[#E5DCD3] font-semibold">
            <a href="#matchmaker" className="hover:text-[#C5A880] transition-colors relative group">
              風味配盤
              <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#C5A880] transition-all group-hover:w-full"></span>
            </a>
            <a href="#showroom" className="hover:text-[#C5A880] transition-colors relative group">
              精品豆物
              <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#C5A880] transition-all group-hover:w-full"></span>
            </a>
            <a href="#equipment" className="hover:text-[#C5A880] transition-colors relative group">
              咖啡用具
              <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#C5A880] transition-all group-hover:w-full"></span>
            </a>
            <a href="#faq" className="hover:text-[#C5A880] transition-colors relative group">
              職人問答
              <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#C5A880] transition-all group-hover:w-full"></span>
            </a>
          </nav>

          <div className="flex items-center space-x-3">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#E5DCD3]/60 hover:text-[#C5A880] p-2 transition-colors"
              title="官方 IG"
            >
              <Instagram className="w-4 h-4" />
            </a>

            {/* Shopping Cart Action Button */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="relative p-2 rounded-full border border-[#8C827A]/40 bg-[#C5A880] text-[#1A1816] hover:bg-[#C5A880]/85 transition-all cursor-pointer shadow-md font-bold"
              title="檢視預購籃"
            >
              <ShoppingCart className="w-4 h-4" />
              {totalBasketCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#E5DCD3] text-[#1A1816] text-[9px] font-mono font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center animate-bounce shadow border border-[#1A1816]">
                  {totalBasketCount}
                </span>
              )}
            </button>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#E5DCD3] hover:bg-[#24211E] rounded"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu overlay */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#1A1816] border-b border-[#8C827A]/30 px-6 py-4 space-y-3 flex flex-col text-sm font-serif tracking-widest font-bold">
            <a
              href="#matchmaker"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 border-b border-[#8C827A]/15 text-[#E5DCD3] hover:text-[#C5A880]"
            >
              風味配盤 Matchmaker
            </a>
            <a
              href="#showroom"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 border-b border-[#8C827A]/15 text-[#E5DCD3] hover:text-[#C5A880]"
            >
              精品豆物 Showroom
            </a>
            <a
              href="#equipment"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 border-b border-[#8C827A]/15 text-[#E5DCD3] hover:text-[#C5A880]"
            >
              咖啡用具 Equipment
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 text-[#E5DCD3] hover:text-[#C5A880]"
            >
              常見問答 FAQs
            </a>
          </div>
        )}
      </header>

      {/* 3. Hero Visual Section */}
      <section className="relative px-6 pt-12 md:pt-20 pb-16 overflow-hidden">
        {/* Animated cherry blossoms background */}
        <SakuraBlossoms />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Slogan Text Left side (Col 7) */}
          <div className="lg:col-span-7 space-y-6 md:space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#8C827A]/20 text-[#C5A880] border border-[#8C827A]/30 rounded-full text-xs font-serif font-bold">
              <Flame className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>線上精品烘焙工坊 • 發貨新鮮純度 48 小時承諾</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-serif font-black tracking-tight text-[#E5DCD3] leading-[1.12]">
                以漢字與地圖之形，
                <span className="block text-[#C5A880] mt-2 lg:mt-3">
                  沖出職人的純粹與安然。
                </span>
              </h1>
              <p className="text-sm md:text-base text-stone-300 font-sans max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Handrip Co. 將日式 Wabi-Sabi
                美學與極致的手工烘焙工藝融於一杯。我們精心測試每一批豆款的最佳風味曲線。拒絕工業糖精、拒絕冗長囤積，我們只呈遞下單烘焙、當旬當季的鮮焙豆物。
              </p>
            </div>

            {/* Quick stats board */}
            <div className="grid grid-cols-3 gap-3 md:gap-4 max-w-md mx-auto lg:mx-0">
              <div className="p-3 bg-[#24211E]/85 rounded-xl border border-[#8C827A]/30 text-center">
                <span className="block font-serif text-xl md:text-2xl font-black text-[#C5A880]">
                  0%
                </span>
                <span className="text-[9px] text-[#8C827A] font-semibold uppercase block mt-0.5 font-sans">
                  硬性金融手續費
                </span>
              </div>
              <div className="p-3 bg-[#24211E]/85 rounded-xl border border-[#8C827A]/30 text-center">
                <span className="block font-mono text-xl md:text-2xl font-black text-[#E5DCD3]">
                  48h
                </span>
                <span className="text-[9px] text-[#8C827A] font-semibold uppercase block mt-0.5 font-sans">
                  烘焙極速包裝發貨
                </span>
              </div>
              <div className="p-3 bg-[#24211E]/85 rounded-xl border border-[#8C827A]/30 text-center">
                <span className="block font-serif text-xl md:text-2xl font-black text-[#E5DCD3]">
                  100%
                </span>
                <span className="text-[9px] text-[#8C827A] font-semibold uppercase block mt-0.5 font-sans">
                  職人微批手工烘焙
                </span>
              </div>
            </div>

            {/* Actions CTA */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center lg:justify-start">
              <a
                href="#matchmaker"
                className="w-full sm:w-auto bg-[#C5A880] text-[#1A1816] hover:bg-[#C5A880]/85 font-serif text-xs font-bold tracking-widest uppercase py-3.5 px-8 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 shadow-md text-center flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Compass className="w-4 h-4 text-[#1A1816]" />
                尋找您的專屬風味圓
              </a>
            </div>
          </div>

          {/* Logo Crest Centerpiece Right side (Col 5) */}
          <div className="lg:col-span-12 xl:col-span-5 flex flex-col items-center justify-center">
            <div className="p-6 md:p-10 rounded-full border border-[#8C827A]/30 bg-gradient-to-b from-[#24211E]/90 to-[#1A1816]/75 shadow-2xl relative">
              {/* Dynamic decorative seal ribbon */}
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#C5A880] text-[#1A1816] text-[9px] font-mono tracking-widest uppercase py-1 px-3 rounded-full border border-[#C5A880] shadow flex items-center gap-1 font-bold">
                <Award className="w-3 h-3 animate-pulse" /> HANDRIP CO.
              </div>

              <BrandCrest size={340} animate={true} customLogoUrl={customLogoUrl} />
            </div>
          </div>
        </div>
      </section>

      {/* 4. Matchmaker Section */}
      <section id="matchmaker" className="py-16 px-6 bg-gradient-to-b from-[#24211E]/40 to-[#1A1816] border-t border-transparent scrolling-mt-18">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-[10px] font-bold text-[#C5A880] tracking-[0.25em] uppercase block font-serif">
              FLAVOUR PROFILER
            </span>
            <h2 className="text-3xl md:text-4xl font-serif text-[#E5DCD3] font-bold tracking-tight">
              職人風味自動匹配盤
            </h2>
            <p className="text-xs text-stone-300 font-sans leading-relaxed">
              根據咖啡風味化學核心指標：花香、果酸、甜感及黏稠度，實時調校。
              演算法將為您瞬間推荐最適合您口感習慣的 Handrip 豆款。
            </p>
          </div>

          <CoffeeMatchmaker onAddToOrder={handleAddBeanToOrder} beans={beans} />
        </div>
      </section>

      {/* 6. Standard Menu Showcase Catalog */}
      <section id="showroom" className="py-16 px-6 border-t border-transparent">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2 max-w-lg">
              <span className="text-[10px] font-bold text-[#C5A880] tracking-[0.25em] uppercase block font-serif">
                MENU LISTING
              </span>
              <h2 className="text-3xl md:text-4xl font-serif text-[#E5DCD3] font-bold tracking-tight">
                精品豆物展示 showroom
              </h2>
              <p className="text-xs text-stone-300 font-sans leading-relaxed">
                全批豆子皆為少量小火微批烘焙。冷萃與掛耳均包裝密封避免進光。點擊右側分類選項即刻瀏覽：
              </p>
            </div>

            {/* Menu tab selection */}
            <div className="flex flex-wrap bg-[#24211E]/80 border border-[#8C827A]/40 p-1 rounded-xl self-start gap-1">
              {[
                { tab: 'beans', label: '手烘熟豆' },
                { tab: 'coldbrew', label: '幽玄冰滴冷萃' },
                { tab: 'dripbags', label: '精品自立掛耳' }
              ].map((opt) => (
                <button
                  key={opt.tab}
                  type="button"
                  onClick={() => setActiveMenuTab(opt.tab as any)}
                  className={`px-4 py-2 text-xs font-serif rounded-lg transition-all cursor-pointer ${
                    activeMenuTab === opt.tab
                      ? 'bg-[#C5A880] text-[#1A1816] font-bold shadow-sm'
                      : 'text-stone-400 hover:text-[#E5DCD3]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Catalog grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* TABS 1: BEANS */}
            {activeMenuTab === 'beans' &&
              beans.map((bean) => {
                const isOutOfStock = bean.isOutOfStock || (bean.stock !== undefined && bean.stock <= 0);
                const isRestocking = !!bean.isRestocking;
                const displayImage = bean.imageUrl || "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&q=80&w=600";
                return (
                  <div
                    key={bean.id}
                    className={`bg-[#24211E] rounded-2xl border border-[#8C827A]/35 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                      (isOutOfStock || isRestocking) ? 'opacity-50' : ''
                    }`}
                  >
                    {/* Visual Image Section */}
                    {displayImage && (
                      <div className="relative h-48 w-full overflow-hidden bg-stone-900 border-b border-[#8C827A]/20">
                        <img 
                          src={displayImage} 
                          alt={bean.name}
                          className="w-full h-full object-cover select-none brightness-95 hover:scale-105 transition duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1816] via-transparent to-transparent opacity-60"></div>
                      </div>
                    )}

                    {/* Card head visual */}
                    <div className="p-5 pb-3 border-b border-[#8C827A]/25 flex items-start justify-between">
                      <div>
                        <span className="text-[10px] text-stone-400 font-mono tracking-widest block font-bold mb-0.5 flex items-center gap-1.5 animate-pulse">
                          SINGLE ORIGIN BEAN
                          {bean.stock !== undefined && bean.stock > 0 && bean.stock <= 5 && (
                            <span className="text-[#C5A880] font-sans font-bold">• 僅餘 {bean.stock} 包</span>
                          )}
                        </span>
                        <h4 className="text-xl font-serif font-black text-[#E5DCD3] leading-tight flex items-center gap-1.5">
                          {bean.name}
                          <span className="text-xs text-[#C5A880] font-normal tracking-wide font-sans">
                            ({bean.jpName && bean.jpName.includes(' - ') ? bean.jpName.split(' - ')[1] : bean.jpName || ''})
                          </span>
                        </h4>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="bg-[#C5A880] text-[#1A1816] text-[9px] font-serif tracking-widest font-bold px-2 py-0.5 rounded">
                          {bean.roastLevelZH}
                        </span>
                        {isRestocking ? (
                          <span className="bg-amber-950/80 text-amber-300 border border-amber-900/40 text-[8px] font-sans font-bold px-1.5 py-0.5 rounded uppercase">
                            補貨中
                          </span>
                        ) : isOutOfStock ? (
                          <span className="bg-red-950/80 text-red-300 border border-red-900/40 text-[8px] font-sans font-bold px-1.5 py-0.5 rounded uppercase font-semibold">
                            已售罄
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {/* Body elements */}
                    <div className="px-5 py-4 flex-1 flex flex-col">
                      <div className="space-y-4 flex-1">
                        <div className="space-y-1">
                          <span className="text-[10px] text-[#C5A880] uppercase font-bold tracking-wider block font-sans">
                            產地及處理方式
                          </span>
                          <div className="text-xs text-[#E5DCD3]/90 font-serif font-medium">
                            {bean.origin} ── <span className="text-[#C5A880]">{bean.process}</span>
                          </div>
                        </div>

                        <p className="text-xs text-stone-300 leading-relaxed font-sans mt-2">
                          {bean.description}
                        </p>

                        <div className="space-y-1.5 pt-1">
                          <span className="text-[10px] text-[#C5A880] uppercase font-bold tracking-wider block font-sans">
                            杯測主要風味
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {bean.tastingNotes.map((note) => (
                              <span
                                key={note}
                                className="text-[10px] text-[#E5DCD3] bg-[#1A1816] border border-[#8C827A]/30 rounded px-2.5 py-0.8 font-medium"
                              >
                                {note}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Miniature SVG radar polygon overlay for visual premium feeling */}
                      <div className="flex items-center justify-between border-t border-[#8C827A]/20 pt-3.5 mt-4">
                        <div>
                          <span className="text-[10px] text-stone-400 font-mono leading-none font-sans">零售價格 / {bean.weight || '200g'}</span>
                          <div className="text-xl font-mono text-[#E5DCD3] font-bold leading-none mt-1">
                            HK$ {bean.price}
                          </div>
                        </div>

                        {/* Dropdown choice matched */}
                        <button
                          type="button"
                          disabled={isOutOfStock || isRestocking}
                          onClick={() => handleAddBeanToOrder(bean, 1, '整豆')}
                          className={`text-xs font-serif font-bold tracking-widest py-2 px-4 rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer ${
                            (isOutOfStock || isRestocking)
                              ? 'bg-[#1A1816]/80 text-stone-500 border border-[#8C827A]/15 cursor-not-allowed'
                              : 'bg-[#C5A880] hover:bg-[#C5A880]/85 text-[#1A1816]'
                          }`}
                        >
                          {isRestocking ? (
                            <>補貨中</>
                          ) : isOutOfStock ? (
                            <>已售罄</>
                          ) : (
                            <><Coffee className="w-3.5 h-3.5" /> 預留全豆</>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

            {/* TABS 2: COLD BREWS */}
            {activeMenuTab === 'coldbrew' &&
              coldBrews.map((prod) => {
                const isOutOfStock = prod.isOutOfStock || (prod.stock !== undefined && prod.stock <= 0);
                const isRestocking = !!prod.isRestocking;
                const displayImage = prod.imageUrl || "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=600";
                return (
                  <div
                    key={prod.id}
                    className={`bg-[#24211E] rounded-2xl border border-[#8C827A]/35 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                      (isOutOfStock || isRestocking) ? 'opacity-50' : ''
                    }`}
                  >
                    {/* Visual Image Section */}
                    {displayImage && (
                      <div className="relative h-48 w-full overflow-hidden bg-stone-900 border-b border-[#8C827A]/20">
                        <img 
                          src={displayImage} 
                          alt={prod.name}
                          className="w-full h-full object-cover select-none brightness-95 hover:scale-105 transition duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1816] via-transparent to-transparent opacity-60"></div>
                      </div>
                    )}

                    <div className="p-5 pb-3 border-b border-[#8C827A]/25 flex items-start justify-between">
                      <div>
                        <span className="text-[10px] text-stone-400 font-mono tracking-widest block font-bold mb-0.5 flex items-center gap-1.5 animate-pulse">
                          熟成低溫冰滴 BOTTLE
                          {prod.stock !== undefined && prod.stock > 0 && prod.stock <= 3 && (
                            <span className="text-[#C5A880] font-sans font-bold">• 僅餘 {prod.stock} 瓶</span>
                          )}
                        </span>
                        <h4 className="text-xl font-serif font-black text-[#E5DCD3] leading-tight">
                          {prod.name}
                        </h4>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="bg-[#C5A880] text-[#1A1816] text-[9px] font-mono tracking-widest font-bold px-2 py-0.5 rounded">
                          {prod.volume}
                        </span>
                        {isRestocking ? (
                          <span className="bg-amber-950/80 text-amber-300 border border-amber-900/40 text-[8px] font-sans font-bold px-1.5 py-0.5 rounded uppercase">
                            補貨中
                          </span>
                        ) : isOutOfStock ? (
                          <span className="bg-red-950/80 text-red-300 border border-red-900/40 text-[8px] font-sans font-bold px-1.5 py-0.5 rounded uppercase font-semibold">
                            已售罄
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="px-5 py-4 flex-1 flex flex-col">
                      <div className="space-y-4 flex-1">
                        <p className="text-xs text-stone-300 leading-relaxed font-sans">
                          {prod.description}
                        </p>

                        <div className="p-3 bg-[#1A1816]/75 rounded-xl space-y-1 border border-[#8C827A]/25 text-xs">
                          <span className="text-[9px] text-[#C5A880] font-bold block font-sans">
                            保鮮期承諾 (SHELF LIFE)
                          </span>
                          <p className="text-[10px] text-[#EDDED4]/90 font-medium">
                            {prod.shelfLife}
                          </p>
                        </div>

                        <div className="space-y-1.5 pt-1">
                          <span className="text-[10px] text-[#C5A880] uppercase font-bold tracking-wider block font-sans">
                            冷萃主味
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {prod.tastingNotes.map((note) => (
                              <span
                                key={note}
                                className="text-[10px] text-[#E5DCD3] bg-[#1A1816] border border-[#8C827A]/25 rounded px-2.5 py-0.8 font-medium"
                              >
                                {note}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-[#8C827A]/20 pt-3.5 mt-4">
                        <div>
                          <span className="text-[10px] text-stone-400 font-mono">玻璃瓶裝定價</span>
                          <div className="text-xl font-mono text-[#E5DCD3] font-bold mt-0.5">
                            HK$ {prod.price}
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={isOutOfStock || isRestocking}
                          onClick={() => handleAddColdBrew(prod)}
                          className={`text-xs font-serif font-bold tracking-widest py-2 px-4 rounded-lg shadow-sm transition-all cursor-pointer ${
                            (isOutOfStock || isRestocking)
                              ? 'bg-[#1A1816]/80 text-stone-500 border border-[#8C827A]/15 cursor-not-allowed'
                              : 'bg-[#C5A880] hover:bg-[#C5A880]/90 text-[#1A1816]'
                          }`}
                        >
                          {isRestocking ? <>補貨中</> : isOutOfStock ? <>已售罄</> : <>加入預購</>}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

            {/* TABS 3: DRIP BAGS */}
            {activeMenuTab === 'dripbags' &&
              dripBags.map((prod) => {
                const isOutOfStock = prod.isOutOfStock || (prod.stock !== undefined && prod.stock <= 0);
                const isRestocking = !!prod.isRestocking;
                const displayImage = prod.imageUrl || "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=600";
                return (
                  <div
                    key={prod.id}
                    className={`bg-[#24211E] rounded-2xl border border-[#8C827A]/35 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                      (isOutOfStock || isRestocking) ? 'opacity-50' : ''
                    }`}
                  >
                    {/* Visual Image Section */}
                    {displayImage && (
                      <div className="relative h-48 w-full overflow-hidden bg-stone-900 border-b border-[#8C827A]/20">
                        <img 
                          src={displayImage} 
                          alt={prod.name}
                          className="w-full h-full object-cover select-none brightness-95 hover:scale-105 transition duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1816] via-transparent to-transparent opacity-60"></div>
                      </div>
                    )}

                    <div className="p-5 pb-3 border-b border-[#8C827A]/25 flex items-start justify-between">
                      <div>
                        <span className="text-[10px] text-stone-400 font-mono tracking-widest block font-bold mb-0.5 flex items-center gap-1.5 animate-pulse">
                          PORTABLE DRIP BOX
                          {prod.stock !== undefined && prod.stock > 0 && prod.stock <= 3 && (
                            <span className="text-[#C5A880] font-sans font-bold">• 僅餘 {prod.stock} 盒</span>
                          )}
                        </span>
                        <h4 className="text-xl font-serif font-black text-[#E5DCD3] leading-tight">
                          {prod.name}
                        </h4>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="bg-[#C5A880] text-[#1A1816] text-[9px] font-mono tracking-widest font-bold px-2 py-0.5 rounded animate-pulse">
                          精緻裝
                        </span>
                        {isRestocking ? (
                          <span className="bg-amber-950/80 text-amber-300 border border-amber-900/40 text-[8px] font-sans font-bold px-1.5 py-0.5 rounded uppercase">
                            補貨中
                          </span>
                        ) : isOutOfStock ? (
                          <span className="bg-red-950/80 text-red-300 border border-red-900/40 text-[8px] font-sans font-bold px-1.5 py-0.5 rounded uppercase font-semibold">
                            已售罄
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="px-5 py-4 flex-1 flex flex-col">
                      <div className="space-y-4 flex-1">
                        <p className="text-xs text-stone-300 leading-relaxed font-sans">
                          {prod.description}
                        </p>

                        <div className="p-3 bg-[#1A1816]/75 rounded-xl border border-[#8C827A]/25 text-[10px] text-[#C5A880] space-y-1 leading-relaxed font-mono">
                          <span>• 包裝形式：10包裝 獨立日系常溫避光鋁膜</span>
                          <br />
                          <span>• 水溫推荐：90°C - 92°C 緩慢畫圈注水 150ml-180ml</span>
                        </div>

                        <div className="space-y-1.5 pt-1">
                          <span className="text-[10px] text-[#C5A880] uppercase font-bold tracking-wider block font-sans">
                            優勢特點
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {prod.tastingNotes.map((note) => (
                              <span
                                key={note}
                                className="text-[10px] text-[#E5DCD3] bg-[#1A1816] border border-[#8C827A]/25 rounded px-2 py-0.5 font-medium"
                              >
                                {note}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-[#8C827A]/20 pt-3.5 mt-4">
                        <div>
                          <span className="text-[10px] text-stone-400 font-mono">精裝包裝售價</span>
                          <div className="text-xl font-mono text-[#E5DCD3] font-bold mt-0.5">
                            HK$ {prod.price} <span className="text-[10px] font-normal text-stone-400">/ 盒</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={isOutOfStock || isRestocking}
                          onClick={() => handleAddDripBag(prod)}
                          className={`text-xs font-serif font-bold tracking-widest py-2 px-4 rounded-lg shadow-sm transition-all cursor-pointer ${
                            (isOutOfStock || isRestocking)
                              ? 'bg-[#1A1816]/80 text-stone-500 border border-[#8C827A]/15 cursor-not-allowed'
                              : 'bg-[#C5A880] hover:bg-[#C5A880]/90 text-[#1A1816]'
                          }`}
                        >
                          {isRestocking ? <>補貨中</> : isOutOfStock ? <>已售罄</> : <>預購禮盒</>}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

          </div>
        </div>
      </section>

      {/* 6.5. Professional Coffee Gear / Utensils Section */}
      <section id="equipment" className="py-16 px-6 border-t border-[#8C827A]/20 scrolling-mt-18 bg-gradient-to-b from-[#1A1816] to-[#24211E]/40">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2 max-w-lg">
              <span className="text-[10px] font-bold text-[#C5A880] tracking-[0.25em] uppercase block font-serif">
                PROFESSIONAL GEAR
              </span>
              <h2 className="text-3xl md:text-4xl font-serif text-[#E5DCD3] font-bold tracking-tight">
                專業咖啡用具 equipment
              </h2>
              <p className="text-xs text-stone-300 font-sans leading-relaxed">
                工欲善其事，必先利其器。我們親自挑選並測試每一款沖煮器具，從研磨、萃取到注水，完美還原每一滴精品咖啡豆的天然產地風味。
              </p>
            </div>
          </div>

          {/* Equipment Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {equipments.map((prod) => {
              const isOutOfStock = prod.isOutOfStock || (prod.stock !== undefined && prod.stock <= 0);
              const isRestocking = !!prod.isRestocking;
              
              // Support direct image URLs entered by administrators, otherwise premium Unsplash presets matching seeds
              const displayImage = prod.imageUrl || (
                prod.imageSeed === 'miyabi_grinder' 
                  ? "https://images.unsplash.com/photo-1595928642581-f50f4f3453a5?auto=format&fit=crop&q=80&w=600"
                  : prod.imageSeed === 'flame_dripper'
                  ? "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=600"
                  : prod.imageSeed === 'kaze_kettle'
                  ? "https://images.unsplash.com/photo-1577968897067-15e7c2f1725b?auto=format&fit=crop&q=80&w=600"
                  : "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=600"
              );

              return (
                <div
                  key={prod.id}
                  className={`bg-[#24211E] rounded-2xl border border-[#8C827A]/35 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                    (isOutOfStock || isRestocking) ? 'opacity-50' : ''
                  }`}
                >
                  {/* Visual Image Section */}
                  {displayImage && (
                    <div className="relative h-48 w-full overflow-hidden bg-stone-900 border-b border-[#8C827A]/20">
                      <img 
                        src={displayImage} 
                        alt={prod.name}
                        className="w-full h-full object-cover select-none brightness-95 hover:scale-105 transition duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1A1816] via-transparent to-transparent opacity-60"></div>
                      {prod.jpName && (
                        <div className="absolute bottom-3 left-4">
                          <span className="text-[10px] bg-[#1A1816]/75 text-[#C5A880] px-2 py-0.5 rounded font-mono tracking-widest border border-[#8C827A]/20">
                            {prod.jpName}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="p-5 pb-3 border-b border-[#8C827A]/25 flex items-start justify-between">
                    <div>
                      <span className="text-[10px] text-stone-400 font-mono tracking-widest block font-bold mb-0.5 flex items-center gap-1.5 uppercase">
                        ☕ PROFESSIONAL GEAR
                        {prod.stock !== undefined && prod.stock > 0 && prod.stock <= 3 && (
                          <span className="text-[#C5A880] font-sans font-bold animate-pulse">• 僅餘 {prod.stock} 件</span>
                        )}
                      </span>
                      <h4 className="text-lg md:text-xl font-serif font-black text-[#E5DCD3] leading-tight">
                        {prod.name}
                      </h4>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {isRestocking ? (
                        <span className="bg-amber-950/80 text-amber-300 border border-amber-900/40 text-[8px] font-sans font-bold px-1.5 py-0.5 rounded uppercase">
                          補貨中
                        </span>
                      ) : isOutOfStock ? (
                        <span className="bg-red-950/80 text-red-300 border border-red-900/40 text-[8px] font-sans font-bold px-1.5 py-0.5 rounded">
                          已售罄
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="px-5 py-4 flex-1 flex flex-col">
                    <div className="space-y-4 flex-1 font-sans">
                      <p className="text-xs text-stone-300 leading-relaxed">
                        {prod.description}
                      </p>

                      <div className="flex flex-wrap gap-1 pt-1 font-sans">
                        {prod.tags?.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] text-[#C5A880] bg-[#1A1816] border border-[#8C827A]/25 rounded px-2.5 py-0.5 font-medium tracking-wider"
                          >
                            ✨ {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-[#8C827A]/20 pt-3.5 mt-4">
                      <div>
                        <span className="text-[10px] text-stone-400 font-mono">精準器皿售價</span>
                        <div className="text-xl font-mono text-[#E5DCD3] font-bold mt-0.5">
                          HK$ {prod.price} <span className="text-[10px] font-normal text-stone-400">/ 件</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={isOutOfStock || isRestocking}
                        onClick={() => handleAddEquipment(prod)}
                        className={`text-xs font-serif font-bold tracking-widest py-2 px-4 rounded-lg shadow-sm transition-all cursor-pointer ${
                          (isOutOfStock || isRestocking)
                            ? 'bg-[#1A1816]/80 text-stone-500 border border-[#8C827A]/15 cursor-not-allowed'
                            : 'bg-[#C5A880] hover:bg-[#C5A880]/90 text-[#1A1816]'
                        }`}
                      >
                        {isRestocking ? <>補貨中</> : isOutOfStock ? <>已售罄</> : <>加到預購袋</>}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. Brand Story & Aesthetics (漢字美學與 Wabi Sabi) */}
      <section className="py-20 px-6 bg-[#24211E] text-[#E5DCD3] relative overflow-hidden" id="about">
        {/* Abstract vector geometric circles of Asanoha stars */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-screen bg-repeat"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M15 0L30 15L15 30L0 15Z' fill='%238C827A' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`
          }}
        />

        <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
          <div className="space-y-2">
            <span className="text-xs font-serif tracking-[0.43em] text-[#C5A880] block">
              THE PHILOSOPHY OF HANDRIP CO.
            </span>
            <h2 className="text-3xl md:text-5xl font-serif text-white font-black tracking-tight leading-normal">
              以一瓢手沖，照見生活中的「間」
            </h2>
          </div>

          <p className="text-sm md:text-base text-stone-300 leading-relaxed max-w-2xl mx-auto font-serif">
            「享」即「享受」，亦是中日書法中的精緻留白（マ）。
            「Handrip Co.」誕生於香港本土咖啡社群。在快節奏與高昂營運成本的喧囂中，我們特立獨行地剝離多餘的商業金流溢價。
            我們的Logo由圓規與木紋構建，中央倒扣的三葉草幾何，正是一隻象徵著現代精密的倒三角形手沖濾杯。
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6">
            <div className="space-y-1.5 p-4 rounded-xl bg-white/5 border border-white/5">
              <span className="font-serif font-bold text-base text-[#C5A880] block">月 (Crescent)</span>
              <p className="text-[11px] text-stone-400 font-sans">
                象徵深夜靜水長流。猶如烘焙熟成時不斷釋放的氣體與高雅風味。
              </p>
            </div>
            <div className="space-y-1.5 p-4 rounded-xl bg-white/5 border border-white/5">
              <span className="font-serif font-bold text-base text-[#C5A880] block">桜 (Sakura)</span>
              <p className="text-[11px] text-stone-400 font-sans">
                象徵咖啡的地域風土季節性。只做時令鮮貨，杜絕冷藏陳化。
              </p>
            </div>
            <div className="space-y-1.5 p-4 rounded-xl bg-white/5 border border-white/5">
              <span className="font-serif font-bold text-base text-[#C5A880] block">傘 (Wagasa)</span>
              <p className="text-[11px] text-stone-400 font-sans">
                傳統和傘的細骨。喻指烘焙師極致控制的火力曲線與嚴格封裝。
              </p>
            </div>
            <div className="space-y-1.5 p-4 rounded-xl bg-white/5 border border-white/5">
              <span className="font-serif font-bold text-base text-[#C5A880] block">鳥 (Flying Birds)</span>
              <p className="text-[11px] text-stone-400 font-sans">
                翱翔在非洲與美洲的燕雀，將最好的野生原豆帶到海邊的香港觀塘。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Help & FAQs Section */}
      <section className="py-16 px-6 bg-gradient-to-b from-[#1A1816] to-[#24211E]/40" id="faq">
        <div className="max-w-3xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <HelpCircle className="w-8 h-8 text-[#C5A880] mx-auto opacity-75" />
            <h2 className="text-3xl font-serif text-[#E5DCD3] font-bold tracking-tight">
              職人配送與預留事宜 FAQs
            </h2>
            <p className="text-xs text-stone-400 font-sans">
              了解我們的線下運營、預購籃流程與零摩擦支付，共同探索永續的香港本土小店生態。
            </p>
          </div>

          <div className="space-y-5">
            {FAQS.map((faq, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-[#24211E] border border-[#8C827A]/30 shadow-sm space-y-2"
              >
                <h4 className="text-sm font-serif font-bold text-[#E5DCD3] flex gap-2">
                  <span className="text-[#C5A880] font-mono">Q{idx + 1}.</span>
                  {faq.q}
                </h4>
                <p className="text-xs text-stone-300 font-sans leading-relaxed pl-6 border-l-2 border-[#8C827A]/35">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center pt-4">
            <p className="text-xs text-[#C5A880] font-serif tracking-[0.12em]">
              如有任何大宗咖啡定製、辦公室掛耳配置、婚宴禮盒等合作意向，歡迎直接點擊右上方購物車，與我們取得直接 WhatsApp 聯絡。
            </p>
          </div>
        </div>
      </section>

      {/* 9. Footer copyright */}
      <footer className="bg-[#1A1816] text-[#E5DCD3]/50 py-10 px-6 border-t border-transparent text-center text-xs">
        <div className="max-w-7xl mx-auto space-y-4 font-sans select-none">
          <div className="flex items-center justify-center space-x-2.5">
            <button
              type="button"
              onClick={() => setIsAdminOpen(true)}
              className="flex items-center justify-center gap-2 text-[#E5DCD3]/50 hover:text-[#C5A880] transition-all cursor-pointer"
              title="店主控制台"
            >
              <HeadLogo className="w-6 h-6 rounded-full border border-[#8C827A]/30 bg-[#24211E] p-0.5 hover:border-[#C5A880] transition-colors" customLogoUrl={customLogoUrl} />
              <span className="font-serif font-bold tracking-wider">
                Handrip Co. • 2026 最新限定版
              </span>
              <Lock className="w-3 h-3 text-stone-800 hover:text-[#C5A880] ml-1 transition-colors" />
            </button>
          </div>
          <p className="text-[10px] text-stone-400 max-w-md mx-auto">
            © 2026 Handrip Co. 精品烘焙工作室。保留所有權利。
            <br />
            香港製造 ── 觀塘手捻排烘，48小時極速真空空郵。
          </p>
        </div>
      </footer>

      {/* 10. Floating Sticky Order Trigger Button */}
      {totalBasketCount > 0 && (
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-[#C5A880] text-[#1A1816] p-4 rounded-full shadow-2xl hover:bg-[#C5A880]/85 transition-all transform hover:scale-105 active:scale-95 border-2 border-[#C5A880] animate-bounce flex items-center gap-2 cursor-pointer font-bold"
        >
          <ShoppingCart className="w-5 h-5" />
          <span className="font-serif text-xs font-bold font-mono tracking-wide">
            預留籃({totalBasketCount}) • 前往預約
          </span>
        </button>
      )}

      {/* Order Basket Drawer overlay */}
      <OrderDrawer
        items={orderItems}
        onRemoveItem={handleRemoveItem}
        onClearOrder={handleClearOrder}
        onUpdateQuantity={handleUpdateQuantity}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onPlaceOrder={handlePlaceOrder}
        promotions={promotions}
        paymentSettings={paymentSettings}
      />

      {/* Admin Panel Console Portal */}
      {isAdminOpen && (
        <AdminConsole
          beans={beans}
          onUpdateBeans={(newBeans) => {
            setBeans(newBeans);
            localStorage.setItem('handrip_beans', JSON.stringify(newBeans));
          }}
          coldBrews={coldBrews}
          onUpdateColdBrews={(newColdBrews) => {
            setColdBrews(newColdBrews);
            localStorage.setItem('handrip_coldbrews', JSON.stringify(newColdBrews));
          }}
          dripBags={dripBags}
          onUpdateDripBags={(newDripBags) => {
            setDripBags(newDripBags);
            localStorage.setItem('handrip_dripbags', JSON.stringify(newDripBags));
          }}
          equipments={equipments}
          onUpdateEquipments={(newEquipments) => {
            setEquipments(newEquipments);
            localStorage.setItem('handrip_equipments', JSON.stringify(newEquipments));
          }}
          orders={orders}
          onUpdateOrders={(newOrders) => {
            setOrders(newOrders);
            localStorage.setItem('handrip_orders', JSON.stringify(newOrders));
          }}
          promotions={promotions}
          onUpdatePromotions={(newPromos) => {
            setPromotions(newPromos);
            localStorage.setItem('handrip_promotions', JSON.stringify(newPromos));
          }}
          customLogoUrl={customLogoUrl}
          onUpdateCustomLogoUrl={(newLogo) => {
            setCustomLogoUrl(newLogo);
            localStorage.setItem('handrip_custom_logo', newLogo);
          }}
          paymentSettings={paymentSettings}
          onUpdatePaymentSettings={(newSettings) => {
            setPaymentSettings(newSettings);
            localStorage.setItem('handrip_payment_settings', JSON.stringify(newSettings));
          }}
          onClose={() => setIsAdminOpen(false)}
        />
      )}
    </WashiBackground>
  );
}
