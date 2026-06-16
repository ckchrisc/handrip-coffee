import React, { useState } from 'react';
import { 
  Coffee, 
  Package, 
  Settings, 
  Plus, 
  Edit2, 
  Trash2, 
  Lock, 
  Unlock, 
  Check, 
  X, 
  Save, 
  Sliders, 
  FileText, 
  Tags, 
  ShieldAlert, 
  Flame, 
  Award,
  BookOpen,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  BarChart3,
  Truck,
  Eye,
  Calendar,
  Clock,
  Tag,
  Upload,
  CreditCard
} from 'lucide-react';
import { CoffeeBean, ColdBrewProduct, DripBagProduct, EquipmentProduct, SensoryProfile, CustomerOrder, OrderItem, ShopPromotion, PaymentSettings } from '../types';
import HeadLogo from './HeadLogo';

interface AdminConsoleProps {
  beans: CoffeeBean[];
  onUpdateBeans: (beans: CoffeeBean[]) => void;
  coldBrews: ColdBrewProduct[];
  onUpdateColdBrews: (coldBrews: ColdBrewProduct[]) => void;
  dripBags: DripBagProduct[];
  onUpdateDripBags: (dripBags: DripBagProduct[]) => void;
  equipments: EquipmentProduct[];
  onUpdateEquipments: (equipments: EquipmentProduct[]) => void;
  orders: CustomerOrder[];
  onUpdateOrders: (orders: CustomerOrder[]) => void;
  promotions: ShopPromotion[];
  onUpdatePromotions: (promotions: ShopPromotion[]) => void;
  customLogoUrl: string;
  onUpdateCustomLogoUrl: (url: string) => void;
  paymentSettings: PaymentSettings;
  onUpdatePaymentSettings: (settings: PaymentSettings) => void;
  onClose: () => void;
}

export default function AdminConsole({
  beans,
  onUpdateBeans,
  coldBrews,
  onUpdateColdBrews,
  dripBags,
  onUpdateDripBags,
  equipments,
  onUpdateEquipments,
  orders,
  onUpdateOrders,
  promotions,
  onUpdatePromotions,
  customLogoUrl,
  onUpdateCustomLogoUrl,
  paymentSettings,
  onUpdatePaymentSettings,
  onClose
}: AdminConsoleProps) {
  // Authentication state
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('handrip_admin_auth') === 'true';
  });
  const [authError, setAuthError] = useState('');

  // Prevent background scrolling
  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Active Management category tab
  const [activeTab, setActiveTab] = useState<'beans' | 'coldbrew' | 'dripbags' | 'equipment' | 'orders' | 'analytics' | 'promotions' | 'brand-logo' | 'payment'>('analytics');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('ALL');

  // Currently editing product ID (null if not editing)
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Is creating new product flag
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Form states matching types.ts fields
  const [beanForm, setBeanForm] = useState<Partial<CoffeeBean>>({
    name: '',
    jpName: '',
    origin: '',
    process: '',
    roastLevel: 'Medium',
    roastLevelZH: '中度烘焙',
    tastingNotes: [],
    tags: [],
    description: '',
    price: 120,
    isOutOfStock: false,
    stock: 50,
    weight: '200g',
    profile: { acid: 5, body: 5, sweetness: 5, aroma: 5, balance: 5 }
  });

  const [coldBrewForm, setColdBrewForm] = useState<Partial<ColdBrewProduct>>({
    name: '',
    jpName: '',
    volume: '350ml',
    description: '',
    price: 45,
    tastingNotes: [],
    tags: [],
    shelfLife: '需 0-4°C 冷藏，發貨後保存期 7 天',
    isOutOfStock: false,
    stock: 20
  });

  const [dripBagForm, setDripBagForm] = useState<Partial<DripBagProduct>>({
    name: '',
    packSize: '10包/盒',
    description: '',
    price: 128,
    tastingNotes: [],
    tags: [],
    isOutOfStock: false,
    stock: 15
  });

  const [equipmentForm, setEquipmentForm] = useState<Partial<EquipmentProduct>>({
    name: '',
    jpName: '',
    price: 180,
    description: '',
    imageUrl: '',
    tags: [],
    isOutOfStock: false,
    stock: 10
  });

  // Temporary string input states for comma-separated items
  const [tastingNotesStr, setTastingNotesStr] = useState('');
  const [tagsStr, setTagsStr] = useState('');

  // Shop Promotions form states
  const [promoForm, setPromoForm] = useState<Partial<ShopPromotion>>({
    name: '',
    description: '',
    type: 'COUPON',
    code: '',
    discountValue: 50,
    minSpend: 0,
    minCount: 0,
    isActive: true,
    expiryDate: ''
  });
  const [editingPromoId, setEditingPromoId] = useState<string | null>(null);
  const [isCreatingPromo, setIsCreatingPromo] = useState<boolean>(false);

  // Order actions managers
  const handleUpdateOrderStatus = (orderId: string, nextStatus: 'PENDING' | 'CONFIRMED' | 'PAID' | 'COMPLETED' | 'CANCELLED') => {
    const updated = orders.map(o => {
      if (o.id === orderId) {
        return { ...o, status: nextStatus };
      }
      return o;
    });
    onUpdateOrders(updated);
  };

  const handleDeleteOrder = (orderId: string) => {
    if (confirm(`確定要永久從系統中刪除此訂單記錄嗎？此操作不可逆！\n訂單號: ${orderId}`)) {
      const updated = orders.filter(o => o.id !== orderId);
      onUpdateOrders(updated);
      setSelectedOrderId(null);
    }
  };

  // Promotions operational handlers
  const handleSavePromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoForm.name || !promoForm.description) {
      alert('請填寫優惠名稱與詳細描述！');
      return;
    }

    if (promoForm.type === 'COUPON' && !promoForm.code) {
      alert('「折扣碼方案 A」必須設定專屬進場兌換代碼！');
      return;
    }

    if (editingPromoId) {
      // update existing
      const updated = promotions.map(p => {
        if (p.id === editingPromoId) {
          return {
            ...p,
            name: promoForm.name!,
            description: promoForm.description!,
            type: promoForm.type!,
            code: promoForm.type === 'COUPON' ? promoForm.code?.toUpperCase() : undefined,
            discountValue: Number(promoForm.discountValue || 0),
            minSpend: promoForm.minSpend !== undefined ? Number(promoForm.minSpend) : undefined,
            minCount: promoForm.minCount !== undefined ? Number(promoForm.minCount) : undefined,
            isActive: !!promoForm.isActive,
            expiryDate: promoForm.expiryDate || undefined
          };
        }
        return p;
      });
      onUpdatePromotions(updated);
      alert('優惠方案已成功更新！');
    } else {
      // create new
      const newPromo: ShopPromotion = {
        id: `PROMO-${Math.floor(Math.random() * 90000 + 10000)}`,
        name: promoForm.name,
        description: promoForm.description,
        type: promoForm.type as any,
        code: promoForm.type === 'COUPON' ? promoForm.code?.toUpperCase() : undefined,
        discountValue: Number(promoForm.discountValue || 0),
        minSpend: promoForm.minSpend !== undefined ? Number(promoForm.minSpend) : undefined,
        minCount: promoForm.minCount !== undefined ? Number(promoForm.minCount) : undefined,
        isActive: !!promoForm.isActive,
        expiryDate: promoForm.expiryDate || undefined
      };
      onUpdatePromotions([newPromo, ...promotions]);
      alert('新優惠方案已成功創建並上線！');
    }

    // Reset Form
    setPromoForm({
      name: '',
      description: '',
      type: 'COUPON',
      code: '',
      discountValue: 50,
      minSpend: 0,
      minCount: 0,
      isActive: true,
      expiryDate: ''
    });
    setEditingPromoId(null);
    setIsCreatingPromo(false);
  };

  const handleTogglePromoActive = (id: string) => {
    const updated = promotions.map(p => {
      if (p.id === id) {
        if (!p.isActive && p.expiryDate && new Date() > new Date(p.expiryDate)) {
          alert('🚨 此優惠方案的有效期已過，請先修改其「有效期至」以重新啟用！');
          return p;
        }
        return { ...p, isActive: !p.isActive };
      }
      return p;
    });
    onUpdatePromotions(updated);
  };

  const handleDeletePromo = (id: string, name: string) => {
    if (confirm(`您確定要完全刪除此優惠活動嗎？此操作將導致正在結帳的購物袋無法套用該方案！\n名稱：${name}`)) {
      const updated = promotions.filter(p => p.id !== id);
      onUpdatePromotions(updated);
      if (editingPromoId === id) {
        setEditingPromoId(null);
        setIsCreatingPromo(false);
      }
    }
  };

  // Analytics calculations
  const totalOrdersCountValue = orders.length;
  const nonCancelledOrders = orders.filter(o => o.status !== 'CANCELLED');
  const paidOrders = orders.filter(o => o.status === 'PAID' || o.status === 'COMPLETED');
  const pendingOrders = orders.filter(o => o.status === 'PENDING');
  
  const totalRevenue = nonCancelledOrders.reduce((sum, o) => sum + o.orderTotal, 0);
  const paidRevenue = paidOrders.reduce((sum, o) => sum + o.orderTotal, 0);
  const pendingRevenue = pendingOrders.reduce((sum, o) => sum + o.orderTotal, 0);

  // Items sold stats
  let totalItemsCount = 0;
  let categorySales = { beans: 0, coldbrew: 0, dripbags: 0 };
  let productSalesMap: Record<string, { name: string, category: string, count: number, revenue: number }> = {};

  nonCancelledOrders.forEach(o => {
    if (o.items && Array.isArray(o.items)) {
      o.items.forEach(it => {
        totalItemsCount += it.quantity;
        if (it.category === 'beans') categorySales.beans += it.quantity;
        else if (it.category === 'coldbrew') categorySales.coldbrew += it.quantity;
        else if (it.category === 'dripbags') categorySales.dripbags += it.quantity;

        const pKey = `${it.category}-${it.productId}`;
        if (!productSalesMap[pKey]) {
          productSalesMap[pKey] = {
            name: it.name,
            category: it.category,
            count: 0,
            revenue: 0
          };
        }
        productSalesMap[pKey].count += it.quantity;
        productSalesMap[pKey].revenue += it.price * it.quantity;
      });
    }
  });

  const topSellers = Object.values(productSalesMap).sort((a, b) => b.count - a.count);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'handrip888') {
      setIsAuthenticated(true);
      setAuthError('');
      localStorage.setItem('handrip_admin_auth', 'true');
    } else {
      setAuthError('管理密碼錯誤，請重新輸入 (提示: handrip888)');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('handrip_admin_auth');
  };

  // Set up forms for editing
  const startEditBean = (bean: CoffeeBean) => {
    setEditingId(bean.id);
    setIsCreatingNew(false);
    setBeanForm({ ...bean });
    setTastingNotesStr(bean.tastingNotes.join(', '));
    setTagsStr(bean.tags.join(', '));
  };

  const startCreateBean = () => {
    setEditingId(null);
    setIsCreatingNew(true);
    setBeanForm({
      name: '',
      jpName: '焙煎 - CUSTOM',
      origin: '',
      process: '',
      roastLevel: 'Medium',
      roastLevelZH: '中度烘焙',
      tastingNotes: [],
      tags: [],
      description: '',
      price: 128,
      isOutOfStock: false,
      stock: 30,
      weight: '200g',
      profile: { acid: 5, body: 5, sweetness: 5, aroma: 5, balance: 5 }
    });
    setTastingNotesStr('');
    setTagsStr('新品, 手作');
  };

  const startEditColdBrew = (prod: ColdBrewProduct) => {
    setEditingId(prod.id);
    setIsCreatingNew(false);
    setColdBrewForm({ ...prod });
    setTastingNotesStr(prod.tastingNotes.join(', '));
    setTagsStr(prod.tags.join(', '));
  };

  const startCreateColdBrew = () => {
    setEditingId(null);
    setIsCreatingNew(true);
    setColdBrewForm({
      name: '',
      jpName: 'ボトル - CUSTOM',
      volume: '350ml',
      description: '',
      price: 45,
      tastingNotes: [],
      tags: [],
      shelfLife: '需 0-4°C 冷藏，發貨後保存期 7 天',
      isOutOfStock: false,
      stock: 20
    });
    setTastingNotesStr('');
    setTagsStr('低溫冷萃');
  };

  const startEditDripBag = (prod: DripBagProduct) => {
    setEditingId(prod.id);
    setIsCreatingNew(false);
    setDripBagForm({ ...prod });
    setTastingNotesStr(prod.tastingNotes.join(', '));
    setTagsStr(prod.tags.join(', '));
  };

  const startCreateDripBag = () => {
    setEditingId(null);
    setIsCreatingNew(true);
    setDripBagForm({
      name: '',
      packSize: '10包/盒',
      description: '',
      price: 128,
      tastingNotes: [],
      tags: [],
      isOutOfStock: false,
      stock: 15
    });
    setTastingNotesStr('');
    setTagsStr('精緻禮盒');
  };

  const startEditEquipment = (prod: EquipmentProduct) => {
    setEditingId(prod.id);
    setIsCreatingNew(false);
    setEquipmentForm({ ...prod });
    setTastingNotesStr('');
    setTagsStr(prod.tags ? prod.tags.join(', ') : '');
  };

  const startCreateEquipment = () => {
    setEditingId(null);
    setIsCreatingNew(true);
    setEquipmentForm({
      name: '',
      jpName: '器具 - CUSTOM',
      description: '',
      price: 180,
      imageUrl: '',
      tags: [],
      isOutOfStock: false,
      stock: 10
    });
    setTastingNotesStr('');
    setTagsStr('專業用具');
  };

  // Delete Handlers
  const handleDeleteBean = (id: string) => {
    if (confirm('確定要永久刪除此咖啡豆嗎？')) {
      onUpdateBeans(beans.filter(b => b.id !== id));
    }
  };

  const handleDeleteColdBrew = (id: string) => {
    if (confirm('確定要永久刪除此冷萃咖啡嗎？')) {
      onUpdateColdBrews(coldBrews.filter(c => c.id !== id));
    }
  };

  const handleDeleteDripBag = (id: string) => {
    if (confirm('確定要永久刪除此掛耳包商品嗎？')) {
      onUpdateDripBags(dripBags.filter(d => d.id !== id));
    }
  };

  const handleDeleteEquipment = (id: string) => {
    if (confirm('確定要永久刪除此咖啡用具嗎？')) {
      onUpdateEquipments(equipments.filter(e => e.id !== id));
    }
  };

  const handleImageFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    onUrlLoaded: (url: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('上傳圖片容積過大（限制 2MB 以下），請進行壓縮或選擇較小圖片，以確保存載順暢。');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === 'string') {
          onUrlLoaded(event.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Save Handlers
  const handleSaveBean = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedTastingNotes = tastingNotesStr
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    const parsedTags = tagsStr
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const savedBean: CoffeeBean = {
      ...(beanForm as CoffeeBean),
      id: isCreatingNew ? `b-custom-${Date.now()}` : (editingId as string),
      imageSeed: (beanForm.imageSeed || 'custom_bean'),
      tastingNotes: parsedTastingNotes,
      tags: parsedTags,
      stock: Number(beanForm.stock) || 0,
      isOutOfStock: !!beanForm.isOutOfStock || Number(beanForm.stock) === 0,
      isRestocking: !!beanForm.isRestocking,
    };

    if (isCreatingNew) {
      onUpdateBeans([...beans, savedBean]);
    } else {
      onUpdateBeans(beans.map(b => (b.id === savedBean.id ? savedBean : b)));
    }

    setEditingId(null);
    setIsCreatingNew(false);
  };

  const handleSaveColdBrew = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedTastingNotes = tastingNotesStr
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    const parsedTags = tagsStr
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const savedColdBrew: ColdBrewProduct = {
      ...(coldBrewForm as ColdBrewProduct),
      id: isCreatingNew ? `cb-custom-${Date.now()}` : (editingId as string),
      imageSeed: (coldBrewForm.imageSeed || 'custom_brew'),
      tastingNotes: parsedTastingNotes,
      tags: parsedTags,
      stock: Number(coldBrewForm.stock) || 0,
      isOutOfStock: !!coldBrewForm.isOutOfStock || Number(coldBrewForm.stock) === 0,
      isRestocking: !!coldBrewForm.isRestocking,
    };

    if (isCreatingNew) {
      onUpdateColdBrews([...coldBrews, savedColdBrew]);
    } else {
      onUpdateColdBrews(coldBrews.map(c => (c.id === savedColdBrew.id ? savedColdBrew : c)));
    }

    setEditingId(null);
    setIsCreatingNew(false);
  };

  const handleSaveDripBag = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedTastingNotes = tastingNotesStr
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    const parsedTags = tagsStr
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const savedDripBag: DripBagProduct = {
      ...(dripBagForm as DripBagProduct),
      id: isCreatingNew ? `db-custom-${Date.now()}` : (editingId as string),
      imageSeed: (dripBagForm.imageSeed || 'custom_gift'),
      tastingNotes: parsedTastingNotes,
      tags: parsedTags,
      stock: Number(dripBagForm.stock) || 0,
      isOutOfStock: !!dripBagForm.isOutOfStock || Number(dripBagForm.stock) === 0,
      isRestocking: !!dripBagForm.isRestocking,
    };

    if (isCreatingNew) {
      onUpdateDripBags([...dripBags, savedDripBag]);
    } else {
      onUpdateDripBags(dripBags.map(d => (d.id === savedDripBag.id ? savedDripBag : d)));
    }

    setEditingId(null);
    setIsCreatingNew(false);
  };

  const handleSaveEquipment = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedTags = tagsStr
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const savedEquipment: EquipmentProduct = {
      ...(equipmentForm as EquipmentProduct),
      id: isCreatingNew ? `eq-custom-${Date.now()}` : (editingId as string),
      tags: parsedTags,
      stock: Number(equipmentForm.stock) || 0,
      isOutOfStock: !!equipmentForm.isOutOfStock || Number(equipmentForm.stock) === 0,
      isRestocking: !!equipmentForm.isRestocking,
    };

    if (isCreatingNew) {
      onUpdateEquipments([...equipments, savedEquipment]);
    } else {
      onUpdateEquipments(equipments.map(e => (e.id === savedEquipment.id ? savedEquipment : e)));
    }

    setEditingId(null);
    setIsCreatingNew(false);
  };

  const handleRoastLevelChange = (level: 'Light' | 'Medium' | 'Medium-Dark' | 'Dark') => {
    const zhMap = {
      'Light': '淺度烘焙',
      'Medium': '中度烘焙',
      'Medium-Dark': '中深度烘焙',
      'Dark': '深度烘焙'
    };
    setBeanForm(prev => ({
      ...prev,
      roastLevel: level,
      roastLevelZH: zhMap[level]
    }));
  };

  const adjustSensory = (dim: keyof SensoryProfile, val: number) => {
    setBeanForm(prev => ({
      ...prev,
      profile: {
        ...(prev.profile as SensoryProfile),
        [dim]: val
      }
    }));
  };

  // Auth gate UI
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-[#1A1816]/95 backdrop-blur-md flex items-center justify-center p-6 z-50 overflow-y-auto">
        <div id="auth-box" className="bg-[#24211E] rounded-2xl border border-[#C5A880]/30 p-8 w-full max-w-md shadow-2xl relative">
          <button 
            type="button" 
            onClick={onClose} 
            className="absolute top-4 right-4 text-stone-400 hover:text-[#E5DCD3] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 rounded-full bg-[#C5A880]/10 flex items-center justify-center border border-[#C5A880]/20 mb-3 text-[#C5A880]">
              <Lock className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-serif font-black text-[#E5DCD3] tracking-widest text-center">
              Handrip Co. 店主控制台
            </h3>
            <p className="text-xs text-stone-400 text-center mt-1">
              此處為內部管理專用，需輸入管理員密碼以進入
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[10px] text-stone-400 font-mono tracking-widest font-bold uppercase mb-1">
                管理員密碼 (提示: handrip888)
              </label>
              <input
                type="password"
                required
                placeholder="請輸入密碼"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-[#1A1816] text-[#E5DCD3] border border-[#8C827A]/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880]"
              />
            </div>

            {authError && (
              <div className="bg-red-950/20 text-red-400 border border-red-900/30 rounded-lg p-3 text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-[#C5A880] hover:bg-[#C5A880]/90 text-[#1A1816] py-3 rounded-xl font-serif font-bold text-xs tracking-widest cursor-pointer transition-colors shadow-sm"
            >
              進入管理台
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#1A1816]/98 backdrop-blur-md z-50 flex flex-col overflow-y-auto md:overflow-hidden">
      {/* Header bar */}
      <header className="bg-[#24211E] border-b border-[#8C827A]/20 px-4 sm:px-6 py-3.5 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Settings className="w-4.5 h-4.5 text-[#C5A880] flex-shrink-0 animate-spin" style={{ animationDuration: '6s' }} />
          <h2 className="text-xs sm:text-sm font-serif font-bold tracking-widest text-[#E5DCD3] truncate whitespace-nowrap">
            HANDRIP CO. 管理後台
          </h2>
        </div>

        <div className="flex items-center gap-2.5 flex-shrink-0">
          <button
            type="button"
            onClick={handleLogout}
            className="text-stone-400 hover:text-red-400 transition-colors text-xs font-serif font-bold tracking-wider px-2 py-1 hover:bg-[#1A1816]/30 rounded-lg"
          >
            登出
          </button>
          <button
            type="button"
            onClick={onClose}
            className="bg-[#C5A880] text-[#1A1816] text-xs font-serif font-bold tracking-wider hover:bg-[#C5A880]/90 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-colors cursor-pointer"
          >
            關閉
          </button>
        </div>
      </header>

      {/* Workspace container */}
      <div className="flex-1 md:overflow-hidden flex flex-col md:flex-row">
        {/* Left Navigator (Lists & Tabs) */}
        <div className="w-full md:w-81 bg-[#1E1C1A] border-b md:border-b-0 md:border-r border-[#8C827A]/20 p-4 md:overflow-y-auto flex-shrink-0">
          <div className="space-y-4">
            {/* Mobile Selection Menu */}
            <div className="block md:hidden space-y-2">
              <label className="block text-[10px] text-[#C5A880] font-mono tracking-widest font-bold uppercase mb-1">
                進入管理分類 (SELECT WORKSPACE)
              </label>
              <div className="relative">
                <select
                  value={activeTab}
                  onChange={(e) => {
                    setActiveTab(e.target.value as any);
                    setEditingId(null);
                    setIsCreatingNew(false);
                  }}
                  className="w-full bg-[#161413] text-[#E5DCD3] border-2 border-[#8C827A]/35 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] font-serif font-bold cursor-pointer appearance-none shadow-md pr-10"
                >
                  <optgroup label="💼 業務概覽與運營 (BUSINESS CONSOLE)" className="bg-[#1E1C1A] text-[#C5A880] font-bold">
                    <option value="analytics" className="text-[#E5DCD3] bg-[#161413]">📊 銷售統計</option>
                    <option value="orders" className="text-[#E5DCD3] bg-[#161413]">📋 訂單管理</option>
                    <option value="promotions" className="text-[#E5DCD3] bg-[#161413]">🏷️ 優惠促銷</option>
                  </optgroup>
                  <optgroup label="📦 商品庫存控制 (INVENTORY CONTROLLER)" className="bg-[#1E1C1A] text-[#C5A880] font-bold">
                    <option value="beans" className="text-[#E5DCD3] bg-[#161413]">🪵 莊園豆</option>
                    <option value="coldbrew" className="text-[#E5DCD3] bg-[#161413]">🧪 冰滴瓶</option>
                    <option value="dripbags" className="text-[#E5DCD3] bg-[#161413]">☕ 掛耳包</option>
                    <option value="equipment" className="text-[#E5DCD3] bg-[#161413]">🛠️ 咖啡用具</option>
                  </optgroup>
                  <optgroup label="👑 品牌與設計設定 (BRAND SETTINGS)" className="bg-[#1E1C1A] text-[#C5A880] font-bold">
                    <option value="brand-logo" className="text-[#E5DCD3] bg-[#161413]">🎯 更改店家標誌 / LOGO</option>
                    <option value="payment" className="text-[#E5DCD3] bg-[#161413]">💳 付款方式設定</option>
                  </optgroup>
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-[#C5A880]">
                  <Sliders className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {/* Desktop Vertical Sidebar Menus */}
            <div className="hidden md:block space-y-4">
              {/* Block 1 */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-[#C5A880]/90 font-mono tracking-widest font-bold uppercase block mb-1">
                  業務概覽與運營 (BUSINESS CONSOLE)
                </span>
                <div className="flex flex-col gap-1">
                  {[
                    { type: 'analytics', label: '📊 銷售統計' },
                    { type: 'orders', label: '📋 訂單管理' },
                    { type: 'promotions', label: '🏷️ 優惠促銷' }
                  ].map((t) => (
                    <button
                      key={t.type}
                      type="button"
                      onClick={() => {
                        setActiveTab(t.type as any);
                        setEditingId(null);
                        setIsCreatingNew(false);
                      }}
                      className={`w-full py-2.5 px-4 text-left text-xs font-serif rounded-xl transition-all cursor-pointer flex items-center justify-between group ${
                        activeTab === t.type
                          ? 'bg-[#C5A880] text-[#1A1816] font-bold shadow-sm'
                          : 'text-stone-300 hover:text-[#E5DCD3] hover:bg-[#24211E]/30 bg-[#161413]/40 border border-[#8C827A]/10'
                      }`}
                    >
                      <span>{t.label}</span>
                      {activeTab === t.type && <span className="text-[10px]">●</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Block 2 */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-stone-400 font-mono tracking-widest font-bold uppercase block mb-1 pt-1">
                  商品庫存控制 (INVENTORY CONTROLLER)
                </span>
                <div className="flex flex-col gap-1">
                  {[
                    { type: 'beans', label: '🪵 莊園豆' },
                    { type: 'coldbrew', label: '🧪 冰滴瓶' },
                    { type: 'dripbags', label: '☕ 掛耳包' },
                    { type: 'equipment', label: '🛠️ 咖啡用具' }
                  ].map((t) => (
                    <button
                      key={t.type}
                      type="button"
                      onClick={() => {
                        setActiveTab(t.type as any);
                        setEditingId(null);
                        setIsCreatingNew(false);
                      }}
                      className={`w-full py-2.5 px-4 text-left text-xs font-serif rounded-xl transition-all cursor-pointer flex items-center justify-between group ${
                        activeTab === t.type
                          ? 'bg-[#C5A880] text-[#1A1816] font-bold shadow-sm'
                          : 'text-stone-300 hover:text-[#E5DCD3] hover:bg-[#24211E]/30 bg-[#161413]/40 border border-[#8C827A]/10'
                      }`}
                    >
                      <span>{t.label}</span>
                      {activeTab === t.type && <span className="text-[10px]">●</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Block 3 */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-stone-400 font-mono tracking-widest font-bold uppercase block mb-1 pt-1">
                  品牌與設計設定 (BRAND SETTINGS)
                </span>
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('brand-logo');
                      setEditingId(null);
                      setIsCreatingNew(false);
                    }}
                    className={`w-full py-2.5 px-4 text-left text-xs font-serif rounded-xl transition-all cursor-pointer flex items-center justify-between group ${
                      activeTab === 'brand-logo'
                        ? 'bg-[#C5A880] text-[#1A1816] font-bold shadow-sm'
                        : 'text-stone-300 hover:text-[#E5DCD3] hover:bg-[#24211E]/30 bg-[#161413]/40 border border-[#8C827A]/10'
                    }`}
                  >
                    <span className="flex items-center gap-1.5"><Upload className="w-3.5 h-3.5" /> 🎯 更改店家標誌 / LOGO</span>
                    {activeTab === 'brand-logo' && <span className="text-[10px]">●</span>}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('payment');
                      setEditingId(null);
                      setIsCreatingNew(false);
                    }}
                    className={`w-full py-2.5 px-4 text-left text-xs font-serif rounded-xl transition-all cursor-pointer flex items-center justify-between group ${
                      activeTab === 'payment'
                        ? 'bg-[#C5A880] text-[#1A1816] font-bold shadow-sm'
                        : 'text-stone-300 hover:text-[#E5DCD3] hover:bg-[#24211E]/30 bg-[#161413]/40 border border-[#8C827A]/10'
                    }`}
                  >
                    <span className="flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5" /> 💳 付款方式設定</span>
                    {activeTab === 'payment' && <span className="text-[10px]">●</span>}
                  </button>
                </div>
              </div>
            </div>

            {/* DYNAMIC SIDEBAR BOTTOM SECTION BASED ON SELECTED TAB */}

            {/* A. If Analytics is chosen */}
            {activeTab === 'analytics' && (
              <div className="space-y-4 font-sans text-xs pt-2 hidden md:block">
                <span className="text-[10px] text-[#C5A880] font-mono tracking-widest font-bold uppercase block border-b border-[#8C827A]/25 pb-1.5">
                  運營實績簡要 (OPERATIONS DIGEST)
                </span>
                
                <div className="bg-[#24211E]/40 border border-[#8C827A]/15 rounded-xl p-3.5 space-y-2.5">
                  <p className="text-stone-400 font-serif leading-relaxed text-[11px]">
                    本系統使用 <span className="text-[#C5A880] font-semibold">本地離線儲存器 (Local Storage)</span> 實時同步進銷存與預留記錄。
                  </p>
                  <div className="text-[10px] text-stone-500 font-mono space-y-1">
                    <div>• 數據庫狀態：正常連接</div>
                    <div>• 商品大類：3 類上架中</div>
                    <div>• 實時線上商品：{beans.length + coldBrews.length + dripBags.length} 款</div>
                    <div>• 當前顧客預約：{orders.length} 筆</div>
                  </div>
                </div>

                <div className="bg-amber-950/15 border border-amber-900/20 text-amber-300/80 p-3 rounded-lg text-[11px] leading-relaxed">
                  ℹ️ <strong>關於扣除庫存：</strong>
                  當客人在前台預留籃中點擊「預留」或「WhatsApp」預購時，系統會<strong>實時扣除對應商品的可用現貨數量</strong>，並登錄金額於此，確保不過賣。
                </div>
              </div>
            )}

            {/* B. If Orders Manager is chosen */}
            {activeTab === 'orders' && (
              <div className="space-y-3 pt-2">
                <div className="flex flex-col gap-2 border-b border-[#8C827A]/20 pb-2">
                  <span className="text-[10px] text-[#C5A880] font-mono tracking-widest font-bold uppercase">
                    預留預購單管理 ({orders.length} 筆)
                  </span>
                  
                  {/* Status filter selection */}
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="w-full text-[11px] bg-[#1A1816] border border-[#8C827A]/30 text-[#E5DCD3] rounded px-2 py-1.5 focus:outline-none focus:border-[#C5A880]"
                  >
                    <option value="ALL">全部訂單 ({orders.length})</option>
                    <option value="PENDING">🕒 待核核對對帳 ({orders.filter(o => o.status === 'PENDING').length})</option>
                    <option value="CONFIRMED">🤝 已確認保留 ({orders.filter(o => o.status === 'CONFIRMED').length})</option>
                    <option value="PAID">💵 已確認付款 ({orders.filter(o => o.status === 'PAID').length})</option>
                    <option value="COMPLETED">✅ 已交付完成 ({orders.filter(o => o.status === 'COMPLETED').length})</option>
                    <option value="CANCELLED">❌ 已取消退留 ({orders.filter(o => o.status === 'CANCELLED').length})</option>
                  </select>
                </div>

                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {orders.length === 0 ? (
                    <div className="text-center py-8 text-stone-500 text-xs">
                      暫無顧客預購單
                    </div>
                  ) : (
                    orders
                      .filter(o => orderStatusFilter === 'ALL' || o.status === orderStatusFilter)
                      .map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setSelectedOrderId(item.id);
                          }}
                          className={`w-full block text-left p-3 rounded-lg border transition-all cursor-pointer ${
                            selectedOrderId === item.id
                              ? 'bg-[#C5A880]/15 border-[#C5A880]'
                              : 'bg-[#24211E]/40 border-[#8C827A]/20 hover:border-[#8C827A]/35'
                          }`}
                        >
                          <div className="flex justify-between items-center text-[10px] text-stone-500 font-mono mb-1">
                            <span>{item.id}</span>
                            <span>{new Date(item.createdAt).toLocaleDateString('zh-HK')}</span>
                          </div>
                          <div className="font-serif font-bold text-xs text-[#E5DCD3] flex justify-between items-center">
                            <span className="truncate max-w-[120px]">{item.userName}</span>
                            <span className="font-mono text-[#C5A880] text-[11px]">HK${item.orderTotal}</span>
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-[9px] text-stone-500 font-serif">
                              {item.deliveryType === 'SF' ? '順豐到付' : item.deliveryType === 'Post' ? '常溫郵遞' : '工作室自取'}
                            </span>
                            <span className={`text-[8px] font-sans font-bold px-1.5 py-px rounded uppercase ${
                              item.status === 'PENDING' ? 'bg-amber-950/40 text-amber-400 border border-amber-900/30' :
                              item.status === 'CONFIRMED' ? 'bg-indigo-950/40 text-indigo-300 border border-indigo-900/30' :
                              item.status === 'PAID' ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-900/30' :
                              item.status === 'COMPLETED' ? 'bg-stone-800 text-stone-400 border border-stone-700' :
                              'bg-red-950/30 text-red-400 border border-red-900/30'
                            }`}>
                              {item.status === 'PENDING' ? '待核實' :
                               item.status === 'CONFIRMED' ? '已配庫' :
                               item.status === 'PAID' ? '已付款' :
                               item.status === 'COMPLETED' ? '已出貨' : '已取消'}
                            </span>
                          </div>
                        </button>
                      ))
                  )}
                </div>
              </div>
            )}

            {/* C. Catalog Product management view */}
            {['beans', 'coldbrew', 'dripbags', 'equipment'].includes(activeTab) && (
              <>
                {/* List header & Quick creation action */}
                <div className="flex items-center justify-between border-b border-[#8C827A]/20 pb-2">
                  <span className="text-[10px] text-[#C5A880] font-mono tracking-widest font-bold uppercase">
                    現存上架商品 ({activeTab === 'beans' ? beans.length : activeTab === 'coldbrew' ? coldBrews.length : activeTab === 'dripbags' ? dripBags.length : equipments.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (activeTab === 'beans') startCreateBean();
                      if (activeTab === 'coldbrew') startCreateColdBrew();
                      if (activeTab === 'dripbags') startCreateDripBag();
                      if (activeTab === 'equipment') startCreateEquipment();
                    }}
                    className="p-1 px-1.5 bg-[#C5A880]/15 text-[#C5A880] hover:bg-[#C5A880]/25 rounded text-[10px] font-bold flex items-center gap-0.5 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3 h-3" /> 新品推出
                  </button>
                </div>

                {/* Dropdown Section for Product Selection */}
                <div className="space-y-3 bg-[#161413]/60 p-3.5 rounded-xl border border-[#8C827A]/20 mt-3">
                  <label className="block text-[10px] text-[#C5A880] font-mono tracking-widest font-bold uppercase mb-1">
                    🎯 選擇欲修改的商品 (SELECT PRODUCT TO EDIT)
                  </label>
                  <div className="relative">
                    <select
                      value={editingId || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (!val) {
                          setEditingId(null);
                          setIsCreatingNew(false);
                          return;
                        }
                        if (activeTab === 'beans') {
                          const bean = beans.find(b => b.id === val);
                          if (bean) startEditBean(bean);
                        } else if (activeTab === 'coldbrew') {
                          const prod = coldBrews.find(p => p.id === val);
                          if (prod) startEditColdBrew(prod);
                        } else if (activeTab === 'dripbags') {
                          const prod = dripBags.find(p => p.id === val);
                          if (prod) startEditDripBag(prod);
                        } else if (activeTab === 'equipment') {
                          const prod = equipments.find(p => p.id === val);
                          if (prod) startEditEquipment(prod);
                        }
                      }}
                      className="w-full bg-[#1A1816] text-[#E5DCD3] border border-[#8C827A]/35 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-[#C5A880] appearance-none cursor-pointer pr-10 font-serif font-bold shadow-sm"
                    >
                      <option value="">-- 請選擇商品 (Select Product to Edit) --</option>
                      {activeTab === 'beans' && beans.map(b => (
                        <option key={b.id} value={b.id}>
                          {b.name} {b.jpName ? `• ${b.jpName}` : ''} (庫存: {b.stock ?? '充足'}) {b.isRestocking ? '[補貨中]' : b.isOutOfStock || (b.stock !== undefined && b.stock <= 0) ? '[已售罄]' : ''}
                        </option>
                      ))}
                      {activeTab === 'coldbrew' && coldBrews.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} {p.volume ? `• ${p.volume}` : ''} (庫存: {p.stock ?? '充足'}) {p.isRestocking ? '[補貨中]' : p.isOutOfStock || (p.stock !== undefined && p.stock <= 0) ? '[已售罄]' : ''}
                        </option>
                      ))}
                      {activeTab === 'dripbags' && dripBags.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} {p.packSize ? `• ${p.packSize}` : ''} (庫存: {p.stock ?? '充足'}) {p.isRestocking ? '[補貨中]' : p.isOutOfStock || (p.stock !== undefined && p.stock <= 0) ? '[已售罄]' : ''}
                        </option>
                      ))}
                      {activeTab === 'equipment' && equipments.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} (庫存: {p.stock ?? '充足'}) {p.isRestocking ? '[補貨中]' : p.isOutOfStock || (p.stock !== undefined && p.stock <= 0) ? '[已售罄]' : ''}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-[#C5A880]">
                      <Sliders className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {editingId && !isCreatingNew && (() => {
                    let currentProduct: { id: string; name: string; stock?: number; isOutOfStock?: boolean; isRestocking?: boolean; subtitle?: string } | null = null;
                    if (activeTab === 'beans') {
                      const bean = beans.find(b => b.id === editingId);
                      if (bean) currentProduct = { id: bean.id, name: bean.name, stock: bean.stock, isOutOfStock: bean.isOutOfStock, isRestocking: bean.isRestocking, subtitle: bean.origin };
                    } else if (activeTab === 'coldbrew') {
                      const prod = coldBrews.find(p => p.id === editingId);
                      if (prod) currentProduct = { id: prod.id, name: prod.name, stock: prod.stock, isOutOfStock: prod.isOutOfStock, isRestocking: prod.isRestocking, subtitle: prod.volume };
                    } else if (activeTab === 'dripbags') {
                      const prod = dripBags.find(p => p.id === editingId);
                      if (prod) currentProduct = { id: prod.id, name: prod.name, stock: prod.stock, isOutOfStock: prod.isOutOfStock, isRestocking: prod.isRestocking, subtitle: prod.packSize };
                    } else if (activeTab === 'equipment') {
                      const prod = equipments.find(p => p.id === editingId);
                      if (prod) currentProduct = { id: prod.id, name: prod.name, stock: prod.stock, isOutOfStock: prod.isOutOfStock, isRestocking: prod.isRestocking, subtitle: prod.jpName };
                    }

                    if (!currentProduct) return null;

                    return (
                      <div className="bg-[#24211E]/90 border border-[#C5A880]/30 rounded-xl p-3 space-y-2.5 shadow-md mt-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-serif font-bold text-xs text-[#E5DCD3] flex items-center gap-1.5 flex-wrap">
                              {currentProduct.name}
                              {currentProduct.isRestocking ? (
                                <span className="bg-amber-950/40 text-amber-300 border border-amber-900/30 font-sans text-[8px] font-bold px-1.5 py-px rounded">
                                  補貨中 (Restocking)
                                </span>
                              ) : currentProduct.isOutOfStock || (currentProduct.stock !== undefined && currentProduct.stock <= 0) ? (
                                <span className="bg-red-950/40 text-red-300 border border-red-900/30 font-sans text-[8px] font-bold px-1.5 py-px rounded">
                                  已售罄 (Out of Stock)
                                </span>
                              ) : (
                                <span className="bg-emerald-950/40 text-emerald-400 border border-emerald-950/30 font-sans text-[8px] font-bold px-1.5 py-px rounded">
                                  庫存: {currentProduct.stock ?? '充足'} (Normal)
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-stone-500 font-mono mt-0.5">
                              {currentProduct.subtitle}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(null);
                            }}
                            className="text-stone-400 hover:text-[#E5DCD3] text-[9px] uppercase font-mono tracking-wider bg-[#1A1816]/75 px-1.5 py-0.5 rounded transition"
                          >
                            重選
                          </button>
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (activeTab === 'beans') {
                                const b = beans.find(x => x.id === editingId);
                                if (b) startEditBean(b);
                              } else if (activeTab === 'coldbrew') {
                                const p = coldBrews.find(x => x.id === editingId);
                                if (p) startEditColdBrew(p);
                              } else if (activeTab === 'dripbags') {
                                const p = dripBags.find(x => x.id === editingId);
                                if (p) startEditDripBag(p);
                              } else if (activeTab === 'equipment') {
                                const p = equipments.find(x => x.id === editingId);
                                if (p) startEditEquipment(p);
                              }
                            }}
                            className="flex-1 py-1.5 px-3 bg-[#C5A880] text-[#1A1816] hover:bg-[#C5A880]/90 text-[10px] font-bold font-serif rounded-lg flex items-center justify-center gap-1 cursor-pointer transition"
                          >
                            <Sliders className="w-3 h-3" /> 編輯商品細節
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (!editingId) return;
                              if (confirm(`確定要刪除「${currentProduct?.name}」嗎？`)) {
                                if (activeTab === 'beans') handleDeleteBean(editingId);
                                if (activeTab === 'coldbrew') handleDeleteColdBrew(editingId);
                                if (activeTab === 'dripbags') handleDeleteDripBag(editingId);
                                if (activeTab === 'equipment') handleDeleteEquipment(editingId);
                                setEditingId(null);
                              }
                            }}
                            className="px-2.5 py-1.5 bg-red-950/20 text-red-400 border border-red-900/15 hover:bg-red-950/40 text-[10px] font-bold font-serif rounded-lg flex items-center justify-center gap-1 cursor-pointer transition"
                            title="刪除"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })()}

                  {!editingId && !isCreatingNew && (
                    <div className="text-center py-3 bg-[#1E1C1A]/20 border border-dashed border-[#8C827A]/15 rounded-xl">
                      <p className="text-[10px] text-stone-500 font-sans leading-relaxed px-1">
                        請於下拉選單中選擇想編輯的商品。
                      </p>
                    </div>
                  )}

                  {isCreatingNew && (
                    <div className="bg-[#C5A880]/5 border border-dashed border-[#C5A880]/30 rounded-xl p-2.5 text-center">
                      <p className="text-[10px] text-[#C5A880] font-sans font-medium">
                        正在新增商品... 請於右側 (手機在下方) 的新品表單中填寫資料。
                      </p>
                      <button
                        type="button"
                        onClick={() => setIsCreatingNew(false)}
                        className="mt-1 text-[9px] font-serif text-[#C5A880] underline hover:text-[#C5A880]/80"
                      >
                        取消新增
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Editor Form (Dynamic edits or creations) */}
        <div className="flex-1 bg-[#24211E]/10 p-4 sm:p-6 md:overflow-y-auto w-full" style={{ WebkitOverflowScrolling: 'touch' }}>
          {activeTab === 'analytics' ? (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Financial Dashboard Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#8C827A]/20 pb-4 gap-4">
                <div>
                  <h3 className="text-base md:text-lg font-serif font-bold text-[#E5DCD3] flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-[#C5A880]" />
                    店鋪主理人 ── 銷售與財務分析看板
                  </h3>
                  <p className="text-[11px] text-stone-400 mt-1">
                    即時讀取全店客流訂單，動態整合手作款品銷售佔比與累計結算營收。
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono text-stone-400 bg-[#1e1c1a] border border-[#8C827A]/20 px-3 py-1.5 rounded-lg self-start">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
                  <span>即時算力已同步 2026/05/30</span>
                </div>
              </div>

              {/* 4 Cards Summary Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Total sales */}
                <div className="bg-[#24211E]/70 border border-[#8C827A]/20 rounded-xl p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-stone-400 text-[10px] font-mono tracking-widest uppercase">
                    <span>總累計預期營收</span>
                    <DollarSign className="w-4 h-4 text-[#C5A880]/70" />
                  </div>
                  <div className="mt-2.5">
                    <span className="text-xl md:text-2xl font-mono text-[#E5DCD3] font-bold">
                      HK$ {totalRevenue}
                    </span>
                    <span className="block text-[9px] text-stone-500 mt-1">
                      (不計已取消，含待核單款)
                    </span>
                  </div>
                </div>

                {/* 2. Paid / Cleared */}
                <div className="bg-[#24211E]/70 border border-[#8C827A]/20 rounded-xl p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-emerald-400/80 text-[10px] font-mono tracking-widest uppercase">
                    <span className="text-emerald-400">已入賬款 (Realized)</span>
                    <Check className="w-4 h-4 text-emerald-400/80" />
                  </div>
                  <div className="mt-2.5">
                    <span className="text-xl md:text-2xl font-mono text-emerald-400 font-bold">
                      HK$ {paidRevenue}
                    </span>
                    <span className="block text-[9px] text-stone-500 mt-1">
                      (已付款 / 已發貨對接)
                    </span>
                  </div>
                </div>

                {/* 3. Pending payment */}
                <div className="bg-[#24211E]/70 border border-[#8C827A]/20 rounded-xl p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-amber-400/80 text-[10px] font-mono tracking-widest uppercase">
                    <span className="text-amber-400">待核實對帳 (Pending)</span>
                    <Clock className="w-4 h-4 text-amber-400/80" />
                  </div>
                  <div className="mt-2.5">
                    <span className="text-xl md:text-2xl font-mono text-amber-400 font-bold">
                      HK$ {pendingRevenue}
                    </span>
                    <span className="block text-[9px] text-stone-500 mt-1">
                      (顧客下單，店主待審)
                    </span>
                  </div>
                </div>

                {/* 4. Total Orders & counts */}
                <div className="bg-[#24211E]/70 border border-[#8C827A]/20 rounded-xl p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-stone-400 text-[10px] font-mono tracking-widest uppercase">
                    <span>累計成交 / 件數</span>
                    <ShoppingCart className="w-4 h-4 text-[#C5A880]/70" />
                  </div>
                  <div className="mt-2.5">
                    <span className="text-xl md:text-2xl font-mono text-[#C5A880] font-bold">
                      {totalOrdersCountValue} 筆單 / {totalItemsCount} 件
                    </span>
                    <span className="block text-[9px] text-stone-500 mt-1">
                      (均單客單價: HK$ {totalRevenue > 0 && totalOrdersCountValue > 0 ? Math.round(totalRevenue / totalOrdersCountValue) : 0})
                    </span>
                  </div>
                </div>
              </div>

              {/* Categoric Sales weight breakdown progress bar */}
              <div className="bg-[#24211E]/80 border border-[#8C827A]/25 rounded-2xl p-5 md:p-6 shadow-md">
                <h4 className="text-xs font-serif font-bold text-[#E5DCD3] tracking-wider mb-4 uppercase">
                  手作商品大類 ── 銷售量佔比 breakdown
                </h4>
                
                {totalItemsCount === 0 ? (
                  <p className="text-stone-500 text-xs py-2">目前尚無預訂計入佔比。</p>
                ) : (
                  <div className="space-y-4">
                    {/* Visual Segment Bar */}
                    <div className="w-full h-3.5 bg-stone-900 rounded-full flex overflow-hidden">
                      {categorySales.beans > 0 && (
                        <div 
                          style={{ width: `${(categorySales.beans / totalItemsCount) * 100}%` }}
                          className="bg-[#C5A880] transition-all duration-500"
                          title={`手作莊園豆: ${categorySales.beans}包`}
                        />
                      )}
                      {categorySales.coldbrew > 0 && (
                        <div 
                          style={{ width: `${(categorySales.coldbrew / totalItemsCount) * 100}%` }}
                          className="bg-sky-500 transition-all duration-500 border-l border-stone-900"
                          title={`低溫冷萃: ${categorySales.coldbrew}瓶`}
                        />
                      )}
                      {categorySales.dripbags > 0 && (
                        <div 
                          style={{ width: `${(categorySales.dripbags / totalItemsCount) * 100}%` }}
                          className="bg-[#8C827A] transition-all duration-500 border-l border-stone-900"
                          title={`精品掛耳包: ${categorySales.dripbags}盒`}
                        />
                      )}
                    </div>

                    {/* Progress indicators items list */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="w-3 h-3 bg-[#C5A880] rounded"></span>
                        <span className="text-stone-300 font-serif font-bold">
                          手烘莊園豆 ({categorySales.beans} 包) ── {Math.round((categorySales.beans / totalItemsCount) * 100)}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="w-3 h-3 bg-sky-500 rounded"></span>
                        <span className="text-stone-300 font-serif font-bold">
                          低溫冰滴瓶 ({categorySales.coldbrew} 瓶) ── {Math.round((categorySales.coldbrew / totalItemsCount) * 100)}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="w-3 h-3 bg-[#8C827A] rounded"></span>
                        <span className="text-stone-300 font-serif font-bold">
                          掛耳精品盒 ({categorySales.dripbags} 盒) ── {Math.round((categorySales.dripbags / totalItemsCount) * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Top selling tables breaking order */}
              <div className="bg-[#24211E]/80 border border-[#8C827A]/25 rounded-2xl p-5 md:p-6 shadow-md">
                <h4 className="text-xs font-serif font-bold text-[#E5DCD3] tracking-wider mb-4 uppercase">
                  熱銷單品排行榜 (PRODUCT SALES RANKING)
                </h4>

                {topSellers.length === 0 ? (
                  <div className="text-center py-6 text-stone-500 text-xs">
                    暫無預計銷售單品排行
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-[#E5DCD3]">
                      <thead>
                        <tr className="border-b border-[#8C827A]/20 text-stone-400 font-serif uppercase tracking-wider text-[10px] pb-2">
                          <th className="pb-3 pl-2">排名 Rank</th>
                          <th className="pb-3">產品大類 Cat</th>
                          <th className="pb-3">產品名稱 Product</th>
                          <th className="pb-3 text-center">累計銷量 Qty</th>
                          <th className="pb-3 text-right pr-2">銷售總經額 Rev</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#8C827A]/10 font-sans">
                        {topSellers.map((seller, idx) => (
                          <tr key={idx} className="hover:bg-[#1E1C1A]/20 transition-colors">
                            <td className="py-3 pl-2 font-mono font-bold text-amber-500 flex items-center gap-1">
                              {idx === 0 ? '👑 1' : idx === 1 ? '🥈 2' : idx === 2 ? '🥉 3' : `  #${idx + 1}`}
                            </td>
                            <td className="py-3">
                              <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                                seller.category === 'beans' ? 'bg-[#C5A880]/15 text-[#C5A880]' :
                                seller.category === 'coldbrew' ? 'bg-sky-950 text-sky-400' :
                                'bg-[#8C827A]/15 text-stone-400'
                              }`}>
                                {seller.category === 'beans' ? '莊園豆' : seller.category === 'coldbrew' ? '冰滴瓶' : '掛耳包'}
                              </span>
                            </td>
                            <td className="py-3 font-bold font-serif">{seller.name}</td>
                            <td className="py-3 text-center font-mono font-bold text-[#E5DCD3]">{seller.count} 件</td>
                            <td className="py-3 text-right pr-2 font-mono font-black text-[#C5A880]">HK$ {seller.revenue}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === 'orders' ? (
            /* 2. Customer orders management detail view */
            (() => {
              const currentOrder = orders.find(o => o.id === selectedOrderId);
              if (!currentOrder) {
                return (
                  <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto space-y-4 py-16">
                    <div className="w-16 h-16 rounded-full bg-[#C5A880]/5 border border-[#C5A880]/15 flex items-center justify-center text-[#C5A880]">
                      <ShoppingCart className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="text-sm font-serif font-semibold text-[#E5DCD3]">
                        請在左側點選一筆預留單查看詳情
                      </h4>
                      <p className="text-xs text-stone-500 mt-1">
                        這裡可以核對顧客 WhatsApp 提交的配貨規格、付款截圖對帳、改寫派遞地址、以及修改配送狀況（待付款 ➔ 已配庫 ➔ 已出貨）。
                      </p>
                    </div>
                  </div>
                );
              }

              return (
                <div className="max-w-3xl mx-auto bg-[#24211E]/80 border border-[#8C827A]/30 rounded-2xl p-6 md:p-8 shadow-xl space-y-6">
                  {/* Order detail card header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#8C827A]/25 pb-4 mb-4 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 border-b border-stone-800 pb-1">
                        <span className="font-mono text-base font-black text-[#C5A880] tracking-wider">
                          {currentOrder.id}
                        </span>
                        <span className="text-[10px] text-stone-500">
                          ({new Date(currentOrder.createdAt).toLocaleDateString()} {new Date(currentOrder.createdAt).toLocaleTimeString()})
                        </span>
                      </div>
                      <h3 className="text-xs text-stone-400 font-sans">
                        顧客保留委託 • 源自: {currentOrder.paymentScreenshot ? 'WhatsApp/自選傳圖' : '網上預錄'}
                      </h3>
                    </div>

                    {/* Status badge and drop control combo */}
                    <div className="flex items-center gap-2 bg-[#1A1816]/80 p-2 rounded-xl border border-[#8C827A]/20 self-start">
                      <span className="text-[10px] text-stone-400 font-serif font-bold whitespace-nowrap">
                        狀態設定：
                      </span>
                      <select
                        value={currentOrder.status}
                        onChange={(e) => handleUpdateOrderStatus(currentOrder.id, e.target.value as any)}
                        className={`text-[11px] font-sans font-bold px-2 py-1 rounded bg-[#1A1816] focus:outline-none focus:border-[#C5A880] ${
                          currentOrder.status === 'PENDING' ? 'text-amber-400' :
                          currentOrder.status === 'CONFIRMED' ? 'text-indigo-400' :
                          currentOrder.status === 'PAID' ? 'text-emerald-400' :
                          currentOrder.status === 'COMPLETED' ? 'text-stone-300' :
                          'text-red-400'
                        }`}
                      >
                        <option value="PENDING">🕒 待核實對帳 (PENDING)</option>
                        <option value="CONFIRMED">🤝 已確認保留等配貨 (CONFIRMED)</option>
                        <option value="PAID">💵 已確認付款確認 (PAID)</option>
                        <option value="COMPLETED">✅ 已交付完成發派 (COMPLETED)</option>
                        <option value="CANCELLED">❌ 已取消退留 (CANCELLED)</option>
                      </select>
                    </div>
                  </div>

                  {/* 2 Column Customer/Delivery Info Widget */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-[#1A1816]/40 p-4 rounded-xl border border-[#8C827A]/15 text-xs text-stone-300">
                    <div className="space-y-2">
                      <h4 className="text-[10px] text-[#C5A880] font-mono tracking-widest font-bold uppercase border-b border-[#8C827A]/10 pb-1">
                        收件人聯絡方式 (CUSTOMER CONTACT)
                      </h4>
                      <div className="grid grid-cols-3 gap-y-1.5 align-middle">
                        <span className="text-stone-500 font-serif">姓名/主稱:</span>
                        <span className="col-span-2 font-bold font-serif">{currentOrder.userName}</span>
                        
                        <span className="text-stone-500 font-serif">電話/Tel:</span>
                        <span className="col-span-2 font-mono font-bold flex flex-wrap items-center gap-1.5">
                          {currentOrder.userPhone}
                          <a 
                            href={`tel:${currentOrder.userPhone}`}
                            className="bg-[#C5A880]/15 hover:bg-[#C5A880]/35 text-[#C5A880] px-1.5 py-0.5 rounded text-[10px]"
                          >
                            撥號
                          </a>
                          <a 
                            href={`https://wa.me/${currentOrder.userPhone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-emerald-950/40 hover:bg-emerald-900 border border-emerald-900/40 text-emerald-400 px-1.5 py-0.5 rounded text-[10px] font-sans"
                          >
                            對接 WhatsApp
                          </a>
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-[10px] text-[#C5A880] font-mono tracking-widest font-bold uppercase border-b border-[#8C827A]/10 pb-1">
                        配送及派遞方式 (SHIPMENT CONFIG)
                      </h4>
                      <div className="grid grid-cols-3 gap-y-1.5">
                        <span className="text-stone-500 font-serif">派發途徑:</span>
                        <span className="col-span-2 font-serif font-black text-[#C5A880]">
                          {currentOrder.deliveryType === 'SF' ? '🚚 順豐速運貨到付款' : 
                           currentOrder.deliveryType === 'Post' ? '✉️ 觀塘常溫硬殼快遞' : 
                           '🚶 工作室自取預留'}
                        </span>
                        
                        <span className="text-stone-500 font-serif">派送詳情:</span>
                        <span className="col-span-2 font-mono text-[11px] leading-relaxed break-all bg-[#1A1816]/70 p-1.5 rounded border border-[#8C827A]/10 text-[#E5DCD3]">
                          {currentOrder.deliveryDetail}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Detail items table */}
                  <div>
                    <h4 className="text-[10px] text-[#C5A880] font-mono tracking-widest font-bold uppercase border-b border-[#8C827A]/20 pb-1.5 mb-2.5">
                      預訂商品細明 (ORDER ITEMS BREAKDOWN)
                    </h4>
                    <div className="divide-y divide-[#8C827A]/15 bg-[#1C1A19]/30 rounded-xl overflow-hidden border border-[#8C827A]/15">
                      {currentOrder.items?.map((it, idx) => (
                        <div key={idx} className="p-3.5 flex items-center justify-between text-xs hover:bg-[#1A1816]/20 transition-colors">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className={`text-[8px] font-mono font-bold px-1.5 py-px rounded uppercase ${
                                it.category === 'beans' ? 'bg-[#C5A880]/15 text-[#C5A880]' :
                                it.category === 'coldbrew' ? 'bg-sky-950 text-sky-400' :
                                'bg-[#8C827A]/15 text-stone-400'
                              }`}>
                                {it.category === 'beans' ? '莊園豆' : it.category === 'coldbrew' ? '冰滴瓶' : '掛耳包'}
                              </span>
                              <span className="font-serif font-bold text-[#E5DCD3] text-sm">
                                {it.name}
                              </span>
                            </div>
                            <div className="text-[10px] text-stone-500 font-mono space-y-0.5">
                              {it.grindSize && <div>研磨深度：<span className="text-stone-400 font-bold">{it.grindSize}</span></div>}
                              {it.note && <div>訂單附註 / 贈言：<span className="text-stone-400 italic">「{it.note}」</span></div>}
                            </div>
                          </div>

                          <div className="text-right font-mono text-[11px] space-y-0.5">
                            <div className="text-stone-400">
                              HK${it.price} × {it.quantity}
                            </div>
                            <div className="font-bold text-[#C5A880]">
                              HK$ {it.price * it.quantity}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Summary math table */}
                  <div className="border-[#8C827A]/15 pt-4 flex flex-col items-end text-xs space-y-1.5 bg-[#24211E]/40 p-4 rounded-xl border border-[#8C827A]/10">
                    <div className="text-stone-400 font-mono flex gap-10 justify-between w-full">
                      <span>商品小計 Subtotal:</span>
                      <span className="w-24 text-right text-stone-300">HK$ {currentOrder.itemsSubtotal || (currentOrder.orderTotal - currentOrder.shippingFee + (currentOrder.discountAmount || 0))}</span>
                    </div>
                    {currentOrder.discountAmount !== undefined && currentOrder.discountAmount > 0 && (
                      <div className="text-emerald-400 font-mono flex gap-10 items-center justify-between w-full border-t border-[#8C827A]/10 pt-1 pb-1">
                        <span className="text-[10.5px] text-left font-serif flex-1 pr-4 text-emerald-400/90 whitespace-normal">
                          🎉 套用優惠碼/折減 ({currentOrder.appliedPromoName || '店舖優惠'}):
                        </span>
                        <span className="w-24 text-right font-bold whitespace-nowrap">-HK$ {currentOrder.discountAmount}</span>
                      </div>
                    )}
                    <div className="text-stone-400 font-mono flex gap-10 justify-between w-full">
                      <span>物流運費 Shipping:</span>
                      <span className="w-24 text-right text-stone-300">HK$ {currentOrder.shippingFee}</span>
                    </div>
                    <div className="text-sm border-t border-[#8C827A]/15 pt-2.5 font-bold flex gap-10 justify-between w-full">
                      <span className="font-serif text-stone-400">委託總額 Grand Total:</span>
                      <span className="w-24 text-right font-mono text-xl text-[#C5A880] font-black border-b border-double border-[#C5A880]">
                        HK$ {currentOrder.orderTotal}
                      </span>
                    </div>
                  </div>

                  {/* Payment screenshot verification (if provided) */}
                  {currentOrder.paymentScreenshot && (
                    <div className="border-t border-[#8C827A]/20 pt-4 space-y-2">
                      <span className="text-[10px] text-[#C5A880] font-mono tracking-widest font-bold uppercase block mb-1">
                        🖼️ 顧客上傳的電子錢包入數紙付款憑證 (Payment Proof)
                      </span>
                      <div className="bg-[#1A1816]/80 p-2.5 rounded-xl border border-[#8C827A]/20 max-w-sm">
                        <img 
                          src={currentOrder.paymentScreenshot} 
                          alt="付款入賬單截圖憑證" 
                          referrerPolicy="no-referrer"
                          className="w-full h-auto rounded-lg object-contain border border-[#8C827A]/25 max-h-[300px]"
                        />
                      </div>
                    </div>
                  )}

                  {/* Dangerous Delete Region */}
                  <div className="border-t border-[#8C827A]/20 pt-5 flex items-center justify-between">
                    <span className="text-[10px] text-stone-500 font-sans">
                      * 點擊更改狀態，變更會即時在本地及線上前台生效。
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteOrder(currentOrder.id)}
                      className="px-4 py-2 bg-red-950/20 text-red-400 hover:bg-red-950/40 border border-red-900/30 font-serif font-bold text-[11px] rounded-lg tracking-wider transition cursor-pointer flex items-center gap-1 hover:text-red-300"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> 永久刪除此委託單
                    </button>
                  </div>
                </div>
              );
            })()
          ) : activeTab === 'promotions' ? (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Promotion Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#8C827A]/25 pb-4 gap-4">
                <div>
                  <h3 className="text-base md:text-lg font-serif font-bold text-[#E5DCD3] flex items-center gap-2">
                    <Tag className="w-5 h-5 text-[#C5A880]" />
                    店鋪促銷優惠管理器 (PROMOTION DESIGNER)
                  </h3>
                  <p className="text-[11px] text-stone-400 mt-1">
                    在此增設及編排方案 A (特定兌換代碼) 以及方案 B (購物袋全自動折扣) 的觸發條件與折減金額。
                  </p>
                </div>
                {!isCreatingPromo && !editingPromoId && (
                  <button
                    type="button"
                    onClick={() => {
                      setPromoForm({
                        name: '',
                        description: '',
                        type: 'COUPON',
                        code: 'DISCOUNT10',
                        discountValue: 10,
                        minSpend: 0,
                        minCount: 0,
                        isActive: true
                      });
                      setIsCreatingPromo(true);
                      setEditingPromoId(null);
                    }}
                    className="bg-[#C5A880] hover:bg-[#C5A880]/85 text-[#1A1816] font-serif tracking-widest text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer shadow-md flex items-center gap-1.5"
                  >
                    🚀 創立新方案 (Add Promo)
                  </button>
                )}
              </div>

              {/* Promo Design Form Panel (Visible when editing or creating) */}
              {(isCreatingPromo || editingPromoId) && (
                <div className="bg-[#24211E] border border-[#8C827A]/30 rounded-2xl p-6 shadow-xl space-y-6 transition-all">
                  <div className="flex items-center justify-between border-b border-[#8C827A]/15 pb-3">
                    <h4 className="text-xs font-mono font-bold tracking-widest text-[#C5A880] uppercase">
                      {editingPromoId ? `🔧 正在修訂方案 ── ${editingPromoId}` : '📝 編排促銷企劃方案'}
                    </h4>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreatingPromo(false);
                        setEditingPromoId(null);
                      }}
                      className="text-stone-400 hover:text-white text-xs cursor-pointer"
                    >
                      取消 (Cancel)
                    </button>
                  </div>

                  <form onSubmit={handleSavePromo} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Name */}
                      <div>
                        <label className="block text-[10px] text-stone-400 font-mono tracking-widest font-bold uppercase mb-1">
                          促銷活動名稱
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="例如：方案B・新店開張大酬賓"
                          value={promoForm.name || ''}
                          onChange={e => setPromoForm(p => ({ ...p, name: e.target.value }))}
                          className="w-full bg-[#1A1816]/70 text-[#E5DCD3] border border-[#8C827A]/35 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#C5A880]"
                        />
                      </div>

                      {/* Type Selection */}
                      <div>
                        <label className="block text-[10px] text-stone-400 font-mono tracking-widest font-bold uppercase mb-1">
                          促銷方案類型 (優惠套用算法)
                        </label>
                        <select
                          value={promoForm.type}
                          onChange={e => {
                            const val = e.target.value as any;
                            setPromoForm(p => ({ 
                              ...p, 
                              type: val,
                              code: val === 'COUPON' ? 'SUMMER88' : undefined
                            }));
                          }}
                          className="w-full bg-[#1A1816] text-[#E5DCD3] border border-[#8C827A]/35 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#C5A880]"
                        >
                          <option value="COUPON">方案 A ── 顧客結賬時輸入優惠折扣碼 (Coupon)</option>
                          <option value="AUTO_SPEND_MINUS">方案 B ── 達到起點消費額 自動立減固定值 (Auto-Spend Minus)</option>
                          <option value="AUTO_SPEND_PERCENT">方案 B ── 達到起點消費額 全單百分比折扣 (Auto-Spend Percent)</option>
                          <option value="AUTO_COUNT_PERCENT">方案 B ── 達到起點件數 全單百分比折扣 (Auto-Count Percent)</option>
                        </select>
                      </div>

                      {/* Code (Coupon Only) */}
                      {promoForm.type === 'COUPON' && (
                        <div>
                          <label className="block text-[10px] text-[#C5A880] font-mono tracking-widest font-bold uppercase mb-1 flex items-center gap-1">
                            🔑 折扣代碼 (Coupon Code)
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="例：COFFEE88"
                            value={promoForm.code || ''}
                            onChange={e => setPromoForm(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                            className="w-full bg-[#1A1816]/70 text-[#E5DCD3] border border-[#C5A880]/50 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#C5A880] font-mono tracking-widest"
                          />
                        </div>
                      )}

                      {/* Discount Value */}
                      <div>
                        <label className="block text-[10px] text-stone-400 font-mono tracking-widest font-bold uppercase mb-1">
                          扣減數值 ({promoForm.type === 'AUTO_SPEND_MINUS' || promoForm.type === 'COUPON' ? 'HK$' : '% 折扣'})
                        </label>
                        <input
                          type="number"
                          required
                          min="1"
                          max={promoForm.type === 'AUTO_SPEND_PERCENT' || promoForm.type === 'AUTO_COUNT_PERCENT' ? '99' : '5000'}
                          value={promoForm.discountValue || 0}
                          onChange={e => setPromoForm(p => ({ ...p, discountValue: parseInt(e.target.value) || 0 }))}
                          className="w-full bg-[#1A1816]/70 text-[#E5DCD3] border border-[#8C827A]/35 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#C5A880]"
                        />
                        <span className="text-[10px] text-stone-500 mt-1 block">
                          {promoForm.type === 'AUTO_SPEND_PERCENT' || promoForm.type === 'AUTO_COUNT_PERCENT' 
                            ? '例如填 5 代表九五折 (Deduct 5%)，填 10 代表九折' 
                            : '指直接減扣的固定港金。例如填 50 即代表全單立減 50 元。'}
                        </span>
                      </div>

                      {/* Min Spend Trigger Condition */}
                      {promoForm.type !== 'AUTO_COUNT_PERCENT' && (
                        <div>
                          <label className="block text-[10px] text-stone-400 font-mono tracking-widest font-bold uppercase mb-1">
                            起點消費港幣限制 (最低消費額)
                          </label>
                          <input
                            type="number"
                            min="0"
                            placeholder="0 代表不設限"
                            value={promoForm.minSpend || 0}
                            onChange={e => setPromoForm(p => ({ ...p, minSpend: parseInt(e.target.value) || 0 }))}
                            className="w-full bg-[#1A1816]/70 text-[#E5DCD3] border border-[#8C827A]/35 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#C5A880]"
                          />
                        </div>
                      )}

                      {/* Min Count Trigger Condition */}
                      {promoForm.type === 'AUTO_COUNT_PERCENT' && (
                        <div>
                          <label className="block text-[10px] text-stone-400 font-mono tracking-widest font-bold uppercase mb-1">
                            起點購買件數限制 (最低件數)
                          </label>
                          <input
                            type="number"
                            min="1"
                            placeholder="例如買滿 3 件"
                            value={promoForm.minCount || 0}
                            onChange={e => setPromoForm(p => ({ ...p, minCount: parseInt(e.target.value) || 0 }))}
                            className="w-full bg-[#1A1816]/70 text-[#E5DCD3] border border-[#8C827A]/35 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#C5A880]"
                          />
                        </div>
                      )}

                      {/* Expiry Date input */}
                      <div>
                        <label className="block text-[10px] text-stone-400 font-mono tracking-widest font-bold uppercase mb-1">
                          ⏳ 方案有效期至 (EXPIRY DATE)
                        </label>
                        <input
                          type="datetime-local"
                          value={promoForm.expiryDate || ''}
                          onChange={e => setPromoForm(p => ({ ...p, expiryDate: e.target.value }))}
                          className="w-full bg-[#1A1816]/70 text-[#E5DCD3] border border-[#8C827A]/35 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#C5A880]"
                        />
                        <span className="text-[10px] text-stone-500 mt-1 block font-sans">
                          留空代表永久有效。若設定了時間，過期後系統將會自動將此優惠改為 OFF 停用。
                        </span>
                      </div>

                      {/* Status Toggle */}
                      <div className="flex items-center space-x-3 pt-3.5">
                        <input
                          type="checkbox"
                          id="is_promo_active"
                          checked={!!promoForm.isActive}
                          onChange={e => setPromoForm(p => ({ ...p, isActive: e.target.checked }))}
                          className="w-4 h-4 rounded text-[#C5A880] focus:ring-[#C5A880] bg-[#1A1816]/70 border-[#8C827A]/35"
                        />
                        <label htmlFor="is_promo_active" className="text-xs font-serif font-bold text-[#E5DCD3] cursor-pointer selection:bg-transparent">
                          即時啟動上架此促銷 (Set Active)
                        </label>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-[10px] text-stone-400 font-mono tracking-widest font-bold uppercase mb-1">
                        促銷優惠描述內容 / 對顧客的宣告文字
                      </label>
                      <textarea
                        required
                        rows={2}
                        placeholder="例：買滿 HK$500 全單即減 HK$50 / 常備全場 Drip Bag 購買 3 件或以上享 95 折"
                        value={promoForm.description || ''}
                        onChange={e => setPromoForm(p => ({ ...p, description: e.target.value }))}
                        className="w-full bg-[#1A1816]/70 text-[#E5DCD3] border border-[#8C827A]/35 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#C5A880]"
                      />
                    </div>

                    <div className="pt-3 border-t border-[#8C827A]/15 flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setIsCreatingPromo(false);
                          setEditingPromoId(null);
                        }}
                        className="px-4 py-2 border border-[#8C827A]/40 text-stone-400 hover:text-white text-xs rounded-xl cursor-pointer"
                      >
                        取消
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-[#C5A880] text-[#1A1816] hover:bg-[#C5A880]/90 font-serif font-semibold text-xs rounded-xl shadow cursor-pointer transition"
                      >
                        儲存企劃 (Save Plan)
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Promo schemes info banners */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#1E1C1A] border border-[#8C827A]/15 p-4 rounded-xl space-y-2">
                  <h4 className="text-xs font-serif font-bold text-[#C5A880] flex items-center gap-1.5 pb-1 border-b border-[#8C827A]/10">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                    方案 A：手動折扣碼兑換 (Coupon System)
                  </h4>
                  <p className="text-[11px] text-stone-400 leading-relaxed">
                    提供專門優惠密鑰予特定熟客或 WhatsApp 社群，顧客於購物預備籃内手動鍵入並點選套用。需至少符合最低限消費港額時才會解鎖扣減。
                  </p>
                </div>
                <div className="bg-[#1E1C1A] border border-[#8C827A]/15 p-4 rounded-xl space-y-2">
                  <h4 className="text-xs font-serif font-bold text-[#E5DCD3] flex items-center gap-1.5 pb-1 border-b border-[#8C827A]/10">
                    <span className="w-1.5 h-1.5 bg-sky-500 rounded-full"></span>
                    方案 B：購物籃條件自動觸發 (Auto Schemes)
                  </h4>
                  <p className="text-[11px] text-stone-400 leading-relaxed">
                    客戶僅需把精品咖啡加入購物袋，系統會在後台自行核實是否滿足「買滿港金起點」或「烘焙件數達標」。如合格即自動呈獻折返。多方案時自動取最優折抵。
                  </p>
                </div>
              </div>

              {/* Promotions table list */}
              <div className="bg-[#1E1C1A] border border-[#8C827A]/20 rounded-2xl overflow-hidden shadow-lg">
                <div className="px-5 py-4 bg-[#24211E] border-b border-[#8C827A]/25 flex items-center justify-between">
                  <span className="text-xs font-mono font-bold tracking-widest text-stone-300">
                    目前店舖配置的企劃項目 ({promotions.length} 個)
                  </span>
                </div>

                {promotions.length === 0 ? (
                  <div className="p-10 text-center text-xs text-stone-500">
                    暫無配置任何優惠方案。按上方「創立新方案」來設計您的第一個優惠吧！
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-[#161413] text-stone-400 text-[10px] font-mono tracking-wider border-b border-[#8C827A]/15">
                          <th className="py-3 px-4">促銷名稱與狀態</th>
                          <th className="py-3 px-4">類型</th>
                          <th className="py-3 px-4">兌換參數與條件</th>
                          <th className="py-3 px-4">折扣額度</th>
                          <th className="py-3 px-4 text-center">上下架狀態</th>
                          <th className="py-3 px-4 text-right">操持編輯</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#8C827A]/10">
                        {promotions.map((p) => (
                          <tr key={p.id} className="hover:bg-[#24211E]/35 transition-colors">
                            <td className="py-3.5 px-4">
                              <div className="space-y-0.5 animate-fade-in">
                                <div className="font-serif font-bold text-[#E5DCD3] flex items-center gap-1.5">
                                  {p.name}
                                </div>
                                <div className="text-[10px] text-stone-400 no-scrollbar">{p.description}</div>
                                {p.expiryDate ? (
                                  <div className="text-[10px] text-[#C5A880] font-mono flex items-center gap-1 mt-1">
                                    <span>⏳ 有效期至:</span>
                                    <span className="bg-[#C5A880]/10 px-1 py-0.5 rounded text-[9px] text-[#C5A880]">{p.expiryDate.replace('T', ' ')}</span>
                                  </div>
                                ) : (
                                  <div className="text-[9px] text-stone-500 font-mono mt-1">⏳ 永久有效</div>
                                )}
                              </div>
                            </td>
                            <td className="py-3.5 px-4 font-mono text-[10px] whitespace-nowrap">
                              {p.type === 'COUPON' ? (
                                <span className="bg-amber-950/40 text-amber-500 border border-amber-900/40 px-1.5 py-0.5 rounded font-serif uppercase text-[9px] font-bold">
                                  方案 A 密碼
                                </span>
                              ) : (
                                <span className="bg-sky-950/40 text-sky-400 border border-sky-900/40 px-1.5 py-0.5 rounded font-serif uppercase text-[9px] font-bold">
                                  方案 B 自動
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 font-sans text-stone-300">
                              <div className="space-y-0.5">
                                {p.code ? (
                                  <div className="font-mono text-[11px] text-[#C5A880] font-bold flex items-center gap-1">
                                    代碼: <span className="underline select-all tracking-widest">{p.code}</span>
                                  </div>
                                ) : null}
                                <div className="text-[10px] text-stone-400 font-mono">
                                  {p.minSpend ? `起點消費: HK$${p.minSpend}` : null}
                                  {p.minCount ? `起點件數: ${p.minCount} 件及以上` : null}
                                  {!p.minSpend && !p.minCount ? '無門檻限制' : null}
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 font-mono font-bold text-[#C5A880] whitespace-nowrap">
                              {p.type === 'AUTO_SPEND_MINUS' || p.type === 'COUPON' 
                                ? `立減 HK$ ${p.discountValue}` 
                                : `扣減比率 ── ${p.discountValue}%`}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <button
                                type="button"
                                onClick={() => handleTogglePromoActive(p.id)}
                                className={`font-mono text-[10px] px-2 py-0.5 rounded-full font-bold cursor-pointer border transition-colors ${
                                  p.isActive
                                    ? 'bg-emerald-950/30 text-emerald-400 border-emerald-900/40 hover:bg-emerald-900/30'
                                    : 'bg-red-950/30 text-red-400 border-red-900/40 hover:bg-red-900/30'
                                }`}
                              >
                                {p.isActive ? '● 運作中 (ON)' : '○ 已擱置 (OFF)'}
                              </button>
                            </td>
                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              <div className="inline-flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPromoForm({ ...p });
                                    setEditingPromoId(p.id);
                                    setIsCreatingPromo(false);
                                  }}
                                  className="text-stone-400 hover:text-white transition cursor-pointer text-[10px] border border-[#8C827A]/30 px-2 py-1 rounded"
                                >
                                  修改 (Edit)
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeletePromo(p.id, p.name)}
                                  className="text-red-400 hover:text-red-300 transition cursor-pointer text-[10px] border border-red-900/30 bg-red-950/10 px-2 py-1 rounded"
                                >
                                  刪除
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
            </div>
          ) : activeTab === 'brand-logo' ? (
            <div className="max-w-xl mx-auto bg-[#24211E]/80 border border-[#8C827A]/30 rounded-2xl p-6 md:p-8 shadow-xl space-y-6">
              <div className="flex items-center gap-2 border-b border-[#8C827A]/25 pb-4">
                <Upload className="w-5 h-5 text-[#C5A880]" />
                <h3 className="text-base font-serif font-bold text-[#E5DCD3]">店家標誌 Logo 上傳與設定</h3>
              </div>

              <p className="text-xs text-stone-300 leading-relaxed">
                自訂您的 Handrip.co 店家標誌。上傳的標誌將即時套用至全站頂端導覽列、頁尾以及首頁大型圓形品牌徽章。
              </p>

              <div className="flex flex-col items-center justify-center p-6 border border-[#8C827A]/20 bg-[#1A1816]/70 rounded-xl space-y-4">
                <span className="text-[10px] text-stone-400 font-mono uppercase tracking-widest">當前標誌預覽</span>
                <div className="p-3 bg-[#1A1816] border border-[#C5A880]/30 rounded-full shadow-lg">
                  <HeadLogo size={120} className="rounded-full" customLogoUrl={customLogoUrl} />
                </div>
                {customLogoUrl && (
                  <button
                    type="button"
                    onClick={() => onUpdateCustomLogoUrl('')}
                    className="text-[11px] text-red-400 hover:text-red-300 transition underline cursor-pointer"
                  >
                    恢復預設標誌
                  </button>
                )}
              </div>

              <div className="space-y-4 pt-4 border-t border-[#8C827A]/20 font-sans">
                <div>
                  <span className="block text-[10px] text-[#C5A880] font-mono uppercase mb-2 tracking-widest font-bold">方法一：直接自訂上傳本地 Logo 圖片</span>
                  <label className="flex items-center justify-center gap-2 border-2 border-dashed border-[#C5A880]/30 hover:border-[#C5A880]/50 bg-[#C5A880]/5 hover:bg-[#C5A880]/10 text-[#C5A880] py-3.5 px-4 rounded-xl text-xs font-serif font-bold cursor-pointer transition">
                    <Upload className="w-4 h-4" />
                    選取您的標誌圖片 (PNG/JPG等)
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => handleImageFileChange(e, (url) => onUpdateCustomLogoUrl(url))}
                    />
                  </label>
                  <span className="block text-[9px] text-stone-500 mt-1">（限制大小：2MB 以下，推薦使用正方形比例 1:1 去背標誌）</span>
                </div>

                <div className="pt-2">
                  <span className="block text-[10px] text-[#C5A880] font-mono uppercase mb-1.5 tracking-widest font-bold">方法二：或貼上外部網址 Logo 圖片 URL</span>
                  <input
                    type="text"
                    placeholder="貼上外部靜態圖片網址，例: https://..."
                    value={customLogoUrl}
                    onChange={e => onUpdateCustomLogoUrl(e.target.value)}
                    className="w-full bg-[#1A1816] text-[#E5DCD3] border border-[#8C827A]/35 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#C5A880]"
                  />
                </div>
              </div>
            </div>
          ) : activeTab === 'payment' ? (
            <div className="max-w-xl mx-auto bg-[#24211E]/80 border border-[#8C827A]/30 rounded-2xl p-6 md:p-8 shadow-xl space-y-6">
              <div className="flex items-center gap-2 border-b border-[#8C827A]/25 pb-4">
                <CreditCard className="w-5 h-5 text-[#C5A880]" />
                <h3 className="text-base font-serif font-bold text-[#E5DCD3]">付款方式設定與 QR Code</h3>
              </div>

              <div className="space-y-6 font-sans border border-[#8C827A]/20 bg-[#161413] rounded-xl p-5 shadow-inner">
                {/* FPS ID & QR */}
                <div className="space-y-3 pb-5 border-b border-[#8C827A]/20">
                  <h4 className="text-sm font-bold text-[#E5DCD3] flex flex-col gap-1">
                    <span className="text-[#C5A880] font-mono tracking-widest text-[10px] uppercase">FPS轉數快設置</span>
                  </h4>
                  
                  <div>
                    <label className="block text-[10px] text-stone-400 font-mono tracking-widest font-bold uppercase mb-1.5">FPS 識別碼 (Phone / SFV ID)</label>
                    <input
                      type="text"
                      value={paymentSettings.fpsId}
                      onChange={(e) => onUpdatePaymentSettings({ ...paymentSettings, fpsId: e.target.value })}
                      placeholder="例: 12345678"
                      className="w-full bg-[#1A1816] text-[#E5DCD3] border border-[#8C827A]/35 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#C5A880]"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[10px] text-stone-400 font-mono tracking-widest font-bold uppercase mb-1.5 mt-3">FPS QR Code圖片上傳或網址</label>
                    {paymentSettings.fpsQrCodeUrl && (
                      <div className="mb-2 relative w-32 h-32 rounded-lg overflow-hidden border border-[#8C827A]/30 bg-black flex -justify-center items-center">
                        <img src={paymentSettings.fpsQrCodeUrl} alt="FPS QR Code" className="w-full h-full object-contain" />
                        <button 
                         onClick={() => onUpdatePaymentSettings({ ...paymentSettings, fpsQrCodeUrl: '' })}
                         className="absolute top-1 right-1 bg-red-500/80 hover:bg-red-500 p-1 rounded text-white shadow-md transition"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    <div className="flex flex-col gap-2">
                       <label className="flex items-center justify-center gap-2 border-2 border-dashed border-[#C5A880]/30 hover:border-[#C5A880]/50 bg-[#C5A880]/5 hover:bg-[#C5A880]/10 text-[#C5A880] py-2 px-3 rounded-lg text-xs font-serif cursor-pointer transition">
                        <Upload className="w-3.5 h-3.5" /> 上傳圖片檔
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => handleImageFileChange(e, (url) => onUpdatePaymentSettings({ ...paymentSettings, fpsQrCodeUrl: url }))}
                        />
                      </label>
                      <input
                        type="text"
                        placeholder="或貼上外部圖片URL"
                        value={paymentSettings.fpsQrCodeUrl}
                        onChange={(e) => onUpdatePaymentSettings({ ...paymentSettings, fpsQrCodeUrl: e.target.value })}
                        className="w-full bg-[#1A1816] text-[#E5DCD3] border border-[#8C827A]/35 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#C5A880]"
                      />
                    </div>
                  </div>
                </div>
                
                {/* PayMe QR */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-[#E5DCD3] flex flex-col gap-1">
                    <span className="text-[#C5A880] font-mono tracking-widest text-[10px] uppercase">PayMe 設置</span>
                  </h4>
                  
                  <div>
                    <label className="block text-[10px] text-stone-400 font-mono tracking-widest font-bold uppercase mb-1.5">PayMe PayLink QR Code圖片上傳或網址</label>
                    {paymentSettings.paymeQrCodeUrl && (
                      <div className="mb-2 relative w-32 h-32 rounded-lg overflow-hidden border border-[#8C827A]/30 bg-black flex -justify-center items-center">
                        <img src={paymentSettings.paymeQrCodeUrl} alt="PayMe QR Code" className="w-full h-full object-contain" />
                        <button 
                         onClick={() => onUpdatePaymentSettings({ ...paymentSettings, paymeQrCodeUrl: '' })}
                         className="absolute top-1 right-1 bg-red-500/80 hover:bg-red-500 p-1 rounded text-white shadow-md transition"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    <div className="flex flex-col gap-2">
                       <label className="flex items-center justify-center gap-2 border-2 border-dashed border-[#C5A880]/30 hover:border-[#C5A880]/50 bg-[#C5A880]/5 hover:bg-[#C5A880]/10 text-[#C5A880] py-2 px-3 rounded-lg text-xs font-serif cursor-pointer transition">
                        <Upload className="w-3.5 h-3.5" /> 上傳圖片檔
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => handleImageFileChange(e, (url) => onUpdatePaymentSettings({ ...paymentSettings, paymeQrCodeUrl: url }))}
                        />
                      </label>
                      <input
                        type="text"
                        placeholder="或貼上外部圖片URL"
                        value={paymentSettings.paymeQrCodeUrl}
                        onChange={(e) => onUpdatePaymentSettings({ ...paymentSettings, paymeQrCodeUrl: e.target.value })}
                        className="w-full bg-[#1A1816] text-[#E5DCD3] border border-[#8C827A]/35 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#C5A880]"
                      />
                    </div>
                  </div>
                </div>

              </div>
            </div>
          ) : !editingId && !isCreatingNew ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#C5A880]/5 border border-[#C5A880]/15 flex items-center justify-center text-[#C5A880]">
                <Settings className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-sm font-serif font-semibold text-[#E5DCD3]">
                  請在左側選擇一件上架商品開始編輯
                </h4>
                <p className="text-xs text-stone-500 mt-1">
                  或者點擊 「新品推出」 按鈕，在當前類別（手作莊園豆 / 低溫冰滴瓶 / 常溫避光掛耳包）下快速創立新季度主推。
                </p>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl w-full mx-auto max-h-[80vh] overflow-y-auto bg-[#24211E]/80 border border-[#8C827A]/30 rounded-2xl p-6 md:p-8 shadow-xl">
              <div className="flex items-center gap-2 border-b border-[#8C827A]/25 pb-4 mb-6">
                <Sliders className="w-5 h-5 text-[#C5A880]" />
                <h3 className="text-base font-serif font-bold text-[#E5DCD3]">
                  {isCreatingNew ? '推出新品 ── 填寫推介參數' : `正在編輯商品 ── ${editingId}`}
                </h3>
              </div>

              {/* DYNAMIC FORM ACCORDING TO CURRENT TAB */}

              {/* BEANS FORM */}
              {activeTab === 'beans' && (
                <form onSubmit={handleSaveBean} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-stone-400 font-mono tracking-widest font-bold uppercase mb-1">
                        產品簡稱 / 豆名 (例: 霞 / 和 / 櫻)
                      </label>
                      <input
                        type="text"
                        required
                        value={beanForm.name || ''}
                        onChange={e => setBeanForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full bg-[#1A1816]/70 text-[#E5DCD3] border border-[#8C827A]/35 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#C5A880]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-stone-400 font-mono tracking-widest font-bold uppercase mb-1">
                        日語副標 / 拼音 (例: 霞 - KASUMI)
                      </label>
                      <input
                        type="text"
                        required
                        value={beanForm.jpName || ''}
                        onChange={e => setBeanForm(prev => ({ ...prev, jpName: e.target.value }))}
                        className="w-full bg-[#1A1816]/70 text-[#E5DCD3] border border-[#8C827A]/35 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#C5A880]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-stone-400 font-mono tracking-widest font-bold uppercase mb-1">
                        原產莊園產地 region (例: 衣索比亞 耶加雪菲)
                      </label>
                      <input
                        type="text"
                        required
                        value={beanForm.origin || ''}
                        onChange={e => setBeanForm(prev => ({ ...prev, origin: e.target.value }))}
                        className="w-full bg-[#1A1816]/70 text-[#E5DCD3] border border-[#8C827A]/35 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#C5A880]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-stone-400 font-mono tracking-widest font-bold uppercase mb-1">
                        精細處理法 process (例: 厭氧蜜處理)
                      </label>
                      <input
                        type="text"
                        required
                        value={beanForm.process || ''}
                        onChange={e => setBeanForm(prev => ({ ...prev, process: e.target.value }))}
                        className="w-full bg-[#1A1816]/70 text-[#E5DCD3] border border-[#8C827A]/35 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#C5A880]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-stone-400 font-mono tracking-widest font-bold uppercase mb-1">
                        單包定價 HK $ (PRICE)
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={beanForm.price || ''}
                        onChange={e => setBeanForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                        className="w-full bg-[#1A1816]/70 text-[#E5DCD3] border border-[#8C827A]/35 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#C5A880]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-stone-400 font-mono tracking-widest font-bold uppercase mb-1">
                        ⚖️ 咖啡豆單包重量 (WEIGHT)
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 200g"
                        value={beanForm.weight || ''}
                        onChange={e => setBeanForm(prev => ({ ...prev, weight: e.target.value }))}
                        className="w-full bg-[#1A1816]/70 text-[#E5DCD3] border border-[#8C827A]/35 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#C5A880]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-stone-400 font-mono tracking-widest font-bold uppercase mb-1">
                        烘焙深度 roast level
                      </label>
                      <div className="grid grid-cols-4 gap-1 mt-1">
                        {(['Light', 'Medium', 'Medium-Dark', 'Dark'] as any).map((opt: any) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => handleRoastLevelChange(opt)}
                            className={`py-2 px-1 text-[10px] font-sans border rounded-lg transition-all ${
                              beanForm.roastLevel === opt
                                ? 'bg-[#C5A880] text-[#1A1816] font-bold border-[#C5A880]'
                                : 'text-stone-400 bg-[#1A1816] border-[#8C827A]/20 hover:text-[#E5DCD3]'
                            }`}
                          >
                            {opt === 'Light' ? '淺焙' : opt === 'Medium' ? '中焙' : opt === 'Medium-Dark' ? '中深' : '深焙'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Stock control section ("控制我貨品的存量") */}
                  <div className="bg-[#1A1816]/90 border border-[#8C827A]/25 rounded-xl p-4 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-1.5 text-xs font-serif font-bold text-[#E5DCD3]">
                        <Package className="w-4 h-4 text-[#C5A880]" />
                        <span>即時庫存控制 (Stock level)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-stone-400 text-xs select-none">狀態標記 :</label>
                        <select
                          value={beanForm.isRestocking ? 'restocking' : beanForm.isOutOfStock ? 'outofstock' : 'normal'}
                          onChange={e => {
                            const val = e.target.value;
                            if (val === 'restocking') {
                              setBeanForm(prev => ({ ...prev, isOutOfStock: false, isRestocking: true }));
                            } else if (val === 'outofstock') {
                              setBeanForm(prev => ({ ...prev, isOutOfStock: true, isRestocking: false }));
                            } else {
                              setBeanForm(prev => ({ ...prev, isOutOfStock: false, isRestocking: false }));
                            }
                          }}
                          className="bg-[#1A1816] text-[#E5DCD3] border border-[#8C827A]/35 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#C5A880]"
                        >
                          <option value="normal">🟢 充足 / 正常販售 (Normal)</option>
                          <option value="outofstock">🔴 已售罄 (Out of Stock)</option>
                          <option value="restocking">🟡 補貨中 (Restocking)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] text-stone-400 font-mono tracking-widest font-bold uppercase mb-1">
                          可用現貨數量 (庫存量)
                        </label>
                        <input
                          type="number"
                          min="0"
                          required
                          value={beanForm.stock ?? 30}
                          onChange={e => setBeanForm(prev => ({ ...prev, stock: Number(e.target.value) }))}
                          className="w-full bg-[#1A1816]/70 text-[#E5DCD3] border border-[#8C827A]/35 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#C5A880]"
                        />
                        <span className="text-[10px] text-stone-500 block mt-1">
                          當可用現貨數量設為 0 時，此商品在前台會自動標記，或可在上方強制標設為「已售罄」或「補貨中」。
                        </span>
                      </div>
                      
                      <div className="text-xs text-stone-400 leading-relaxed font-sans bg-[#1A1816]/40 p-2.5 rounded-lg border border-[#8C827A]/10">
                        <span className="text-[#C5A880] font-bold block mb-1">如何實時補貨？</span>
                        只需調大可用現貨數量，並確保上方「強制已售罄」未勾選，前台按鈕將自動回復為「預留全豆」模式供顧客提交 WhatsApp 預約！
                      </div>
                    </div>
                  </div>

                  {/* Flavor radar sliders ("評分口味從何輸入") */}
                  <div className="bg-[#1a1816]/90 border border-[#8C827A]/25 rounded-xl p-4 space-y-4">
                    <div className="flex items-center gap-1.5 text-xs font-serif font-bold text-[#E5DCD3]">
                      <Sliders className="w-4 h-4 text-[#C5A880]" />
                      <span>口味評分輸入 (0-10 職人評估評級)</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 pt-1">
                      {[
                        { key: 'acid', label: '果酸度 (Acidity)' },
                        { key: 'body', label: '醇厚度 (Body)' },
                        { key: 'sweetness', label: '甜潤感 (Sweetness)' },
                        { key: 'aroma', label: '花香氣 (Aroma)' },
                        { key: 'balance', label: '平衡度 (Balance)' }
                      ].map((item) => {
                        const dim = item.key as keyof SensoryProfile;
                        const currentVal = beanForm.profile ? beanForm.profile[dim] : 5;
                        return (
                          <div key={item.key} className="space-y-1">
                            <div className="flex justify-between text-[11px] font-sans">
                              <span className="text-stone-300 font-medium">{item.label}</span>
                              <span className="text-[#C5A880] font-mono font-bold">{currentVal} / 10</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="10"
                              step="1"
                              value={currentVal}
                              onChange={e => adjustSensory(dim, Number(e.target.value))}
                              className="w-full accent-[#C5A880] h-1.5 bg-[#24211E] rounded-lg cursor-pointer"
                            />
                          </div>
                        );
                      })}
                    </div>
                    <span className="text-[10px] text-stone-500 block mt-1">
                      此處調整的評分口味分數，將直接、實時影響前台 AI Coffee Matchmaker (風味智能配對器) 的權重計算與雷達圖的拉扯形狀。
                    </span>
                  </div>

                  <div>
                    <label className="block text-[10px] text-stone-400 font-mono tracking-widest font-bold uppercase mb-1">
                      產地背後故事與詳細描述 description
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={beanForm.description || ''}
                      onChange={e => setBeanForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full bg-[#1A1816]/70 text-[#E5DCD3] border border-[#8C827A]/35 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#C5A880]"
                    />
                  </div>

                  <div className="bg-[#1A1816]/30 border border-[#8C827A]/20 p-4 rounded-xl space-y-3">
                    <label className="block text-[10px] text-[#C5A880] font-mono tracking-widest font-bold uppercase col-span-5">
                      精品豆自訂上傳圖片 customized bean image
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
                      {/* Preview section */}
                      <div className="md:col-span-2 flex flex-col items-center justify-center border border-[#8C827A]/20 rounded-lg p-2 bg-[#24211E] aspect-video md:h-28 overflow-hidden relative group">
                        {beanForm.imageUrl ? (
                          <>
                            <img
                              src={beanForm.imageUrl}
                              alt="Preview"
                              className="w-full h-full object-cover rounded"
                            />
                            <button
                              type="button"
                              onClick={() => setBeanForm(prev => ({ ...prev, imageUrl: '' }))}
                              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs text-red-500 font-serif font-black transition-opacity cursor-pointer rounded"
                            >
                              移除/更換圖片
                            </button>
                          </>
                        ) : (
                          <div className="text-[10px] text-stone-500 font-sans text-center">
                            未上傳自訂圖片 (將顯現系統預設背景圖)
                          </div>
                        )}
                      </div>

                      {/* Upload & Url Input section */}
                      <div className="md:col-span-3 space-y-3">
                        {/* File Uploader */}
                        <div>
                          <span className="block text-[9px] text-stone-400 font-mono uppercase mb-1 tracking-wider">方法一：上傳圖片檔案 (推薦)</span>
                          <label className="flex items-center justify-center gap-2 border border-dashed border-[#C5A880]/40 bg-[#C5A880]/10 hover:bg-[#C5A880]/15 text-[#C5A880] py-2 px-3 rounded-lg text-xs font-serif font-bold cursor-pointer transition">
                            <Upload className="w-3.5 h-3.5" />
                            選擇電腦 / 手機圖片
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={e => handleImageFileChange(e, (url) => setBeanForm(prev => ({ ...prev, imageUrl: url })))}
                            />
                          </label>
                        </div>

                        {/* URL Direct paste */}
                        <div>
                          <span className="block text-[9px] text-stone-400 font-mono uppercase mb-1 tracking-wider">方法二：直接貼上外部圖片網址</span>
                          <input
                            type="text"
                            placeholder="貼上 https://... 網址"
                            value={beanForm.imageUrl || ''}
                            onChange={e => setBeanForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                            className="w-full bg-[#1A1816] text-[#E5DCD3] border border-[#8C827A]/35 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#C5A880]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-stone-400 font-mono tracking-widest font-bold uppercase mb-1">
                        杯測主要風味 (英文或中文，逗號分隔)
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="例: 白桃花香, 白葡萄甜潤, 伯爵茶尾韻"
                        value={tastingNotesStr}
                        onChange={e => setTastingNotesStr(e.target.value)}
                        className="w-full bg-[#1A1816]/70 text-[#E5DCD3] border border-[#8C827A]/35 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#C5A880]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-stone-400 font-mono tracking-widest font-bold uppercase mb-1">
                        特別宣傳標籤 tags (英文或中文，逗號分隔)
                      </label>
                      <input
                        type="text"
                        placeholder="例: 風味之最, 低氧厭氧, 限量"
                        value={tagsStr}
                        onChange={e => setTagsStr(e.target.value)}
                        className="w-full bg-[#1A1816]/70 text-[#E5DCD3] border border-[#8C827A]/35 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#C5A880]"
                      />
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center justify-end gap-3 border-t border-[#8C827A]/20 pt-5">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(null);
                        setIsCreatingNew(false);
                      }}
                      className="px-5 py-2.5 bg-stone-800 text-stone-300 font-serif font-bold text-xs rounded-xl tracking-widest hover:bg-stone-700 transition"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-[#C5A880] text-[#1A1816] font-serif font-bold text-xs rounded-xl tracking-widest hover:bg-[#C5A880]/90 transition shadow-md flex items-center gap-1.5 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" /> 儲存變更
                    </button>
                  </div>
                </form>
              )}

              {/* COLD BREW FORM */}
              {activeTab === 'coldbrew' && (
                <form onSubmit={handleSaveColdBrew} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-stone-400 font-mono tracking-widest font-bold uppercase mb-1">
                        冷萃名字 name
                      </label>
                      <input
                        type="text"
                        required
                        value={coldBrewForm.name || ''}
                        onChange={e => setColdBrewForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full bg-[#1A1816]/70 text-[#E5DCD3] border border-[#8C827A]/35 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#C5A880]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-stone-400 font-mono tracking-widest font-bold uppercase mb-1">
                        日語副標 / 拼音 jpName
                      </label>
                      <input
                        type="text"
                        required
                        value={coldBrewForm.jpName || ''}
                        onChange={e => setColdBrewForm(prev => ({ ...prev, jpName: e.target.value }))}
                        className="w-full bg-[#1A1816]/70 text-[#E5DCD3] border border-[#8C827A]/35 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#C5A880]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-stone-400 font-mono tracking-widest font-bold uppercase mb-1">
                        淨含量 volume (例: 350ml / 500ml)
                      </label>
                      <input
                        type="text"
                        required
                        value={coldBrewForm.volume || '350ml'}
                        onChange={e => setColdBrewForm(prev => ({ ...prev, volume: e.target.value }))}
                        className="w-full bg-[#1A1816]/70 text-[#E5DCD3] border border-[#8C827A]/35 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#C5A880]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-stone-400 font-mono tracking-widest font-bold uppercase mb-1">
                        單瓶價格 price (HK$)
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={coldBrewForm.price || ''}
                        onChange={e => setColdBrewForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                        className="w-full bg-[#1A1816]/70 text-[#E5DCD3] border border-[#8C827A]/35 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#C5A880]"
                      />
                    </div>
                  </div>

                  {/* Stock control section ("控制我貨品的存量") */}
                  <div className="bg-[#1A1816]/90 border border-[#8C827A]/25 rounded-xl p-4 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-1.5 text-xs font-serif font-bold text-[#E5DCD3]">
                        <Package className="w-4 h-4 text-[#C5A880]" />
                        <span>即時庫存控制 (Cold brew inventory)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-stone-400 text-xs select-none">狀態標記 :</label>
                        <select
                          value={coldBrewForm.isRestocking ? 'restocking' : coldBrewForm.isOutOfStock ? 'outofstock' : 'normal'}
                          onChange={e => {
                            const val = e.target.value;
                            if (val === 'restocking') {
                              setColdBrewForm(prev => ({ ...prev, isOutOfStock: false, isRestocking: true }));
                            } else if (val === 'outofstock') {
                              setColdBrewForm(prev => ({ ...prev, isOutOfStock: true, isRestocking: false }));
                            } else {
                              setColdBrewForm(prev => ({ ...prev, isOutOfStock: false, isRestocking: false }));
                            }
                          }}
                          className="bg-[#1A1816] text-[#E5DCD3] border border-[#8C827A]/35 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#C5A880]"
                        >
                          <option value="normal">🟢 充足 / 正常販售 (Normal)</option>
                          <option value="outofstock">🔴 已售罄 (Out of Stock)</option>
                          <option value="restocking">🟡 補貨中 (Restocking)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] text-stone-400 font-mono tracking-widest font-bold uppercase mb-1">
                          可用冷冰冰現貨量
                        </label>
                        <input
                          type="number"
                          min="0"
                          required
                          value={coldBrewForm.stock ?? 20}
                          onChange={e => setColdBrewForm(prev => ({ ...prev, stock: Number(e.target.value) }))}
                          className="w-full bg-[#1A1816]/70 text-[#E5DCD3] border border-[#8C827A]/35 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#C5A880]"
                        />
                      </div>
                      
                      <div className="text-xs text-stone-400 leading-relaxed font-sans bg-[#1A1816]/40 p-2.5 rounded-lg border border-[#8C827A]/10">
                        冷萃冰滴由於耗時18小時調試低溫成熟與裝箱熟成24小時，庫存變化較快，建議每日晚間對比物理熟成數修正。
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-stone-400 font-mono tracking-widest font-bold uppercase mb-1">
                      冷藏保鮮承諾及貯藏 shelfLife (例: 需 0-4°C 冷藏，發貨後保存期 7 天)
                    </label>
                    <input
                      type="text"
                      required
                      value={coldBrewForm.shelfLife || ''}
                      onChange={e => setColdBrewForm(prev => ({ ...prev, shelfLife: e.target.value }))}
                      className="w-full bg-[#1A1816]/70 text-[#E5DCD3] border border-[#8C827A]/35 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#C5A880]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-stone-400 font-mono tracking-widest font-bold uppercase mb-1">
                      冷萃咖啡描述 description
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={coldBrewForm.description || ''}
                      onChange={e => setColdBrewForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full bg-[#1A1816]/70 text-[#E5DCD3] border border-[#8C827A]/35 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#C5A880]"
                    />
                  </div>

                  <div className="bg-[#1A1816]/30 border border-[#8C827A]/20 p-4 rounded-xl space-y-3">
                    <label className="block text-[10px] text-[#C5A880] font-mono tracking-widest font-bold uppercase col-span-5">
                      冷萃咖啡自訂上傳圖片 customized cold brew image
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
                      {/* Preview section */}
                      <div className="md:col-span-2 flex flex-col items-center justify-center border border-[#8C827A]/20 rounded-lg p-2 bg-[#24211E] aspect-video md:h-28 overflow-hidden relative group">
                        {coldBrewForm.imageUrl ? (
                          <>
                            <img
                              src={coldBrewForm.imageUrl}
                              alt="Preview"
                              className="w-full h-full object-cover rounded"
                            />
                            <button
                              type="button"
                              onClick={() => setColdBrewForm(prev => ({ ...prev, imageUrl: '' }))}
                              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs text-red-500 font-serif font-black transition-opacity cursor-pointer rounded"
                            >
                              移除/更換圖片
                            </button>
                          </>
                        ) : (
                          <div className="text-[10px] text-stone-500 font-sans text-center">
                            未上傳自訂圖片 (將顯現系統預設背景圖)
                          </div>
                        )}
                      </div>

                      {/* Upload & Url Input section */}
                      <div className="md:col-span-3 space-y-3">
                        {/* File Uploader */}
                        <div>
                          <span className="block text-[9px] text-stone-400 font-mono uppercase mb-1 tracking-wider">方法一：上傳圖片檔案 (推薦)</span>
                          <label className="flex items-center justify-center gap-2 border border-dashed border-[#C5A880]/40 bg-[#C5A880]/10 hover:bg-[#C5A880]/15 text-[#C5A880] py-2 px-3 rounded-lg text-xs font-serif font-bold cursor-pointer transition">
                            <Upload className="w-3.5 h-3.5" />
                            選擇電腦 / 手機圖片
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={e => handleImageFileChange(e, (url) => setColdBrewForm(prev => ({ ...prev, imageUrl: url })))}
                            />
                          </label>
                        </div>

                        {/* URL Direct paste */}
                        <div>
                          <span className="block text-[9px] text-stone-400 font-mono uppercase mb-1 tracking-wider">方法二：直接貼上外部圖片網址</span>
                          <input
                            type="text"
                            placeholder="貼上 https://... 網址"
                            value={coldBrewForm.imageUrl || ''}
                            onChange={e => setColdBrewForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                            className="w-full bg-[#1A1816] text-[#E5DCD3] border border-[#8C827A]/35 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#C5A880]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-stone-400 font-mono tracking-widest font-bold uppercase mb-1">
                        冷萃主味/風味特點
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="例: 太妃糖尾韻, 榛果奶油, 黑可可濃郁"
                        value={tastingNotesStr}
                        onChange={e => setTastingNotesStr(e.target.value)}
                        className="w-full bg-[#1A1816]/70 text-[#E5DCD3] border border-[#8C827A]/35 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#C5A880]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-stone-400 font-mono tracking-widest font-bold uppercase mb-1">
                        宣傳特點標籤 tags
                      </label>
                      <input
                        type="text"
                        placeholder="例: 熟成冰滴, 夏日限定, 佐奶首選"
                        value={tagsStr}
                        onChange={e => setTagsStr(e.target.value)}
                        className="w-full bg-[#1A1816]/70 text-[#E5DCD3] border border-[#8C827A]/35 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#C5A880]"
                      />
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center justify-end gap-3 border-t border-[#8C827A]/20 pt-5">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(null);
                        setIsCreatingNew(false);
                      }}
                      className="px-5 py-2.5 bg-stone-800 text-stone-300 font-serif font-bold text-xs rounded-xl tracking-widest hover:bg-stone-700 transition"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-[#C5A880] text-[#1A1816] font-serif font-bold text-xs rounded-xl tracking-widest hover:bg-[#C5A880]/90 transition shadow-md flex items-center gap-1.5 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" /> 儲存變更
                    </button>
                  </div>
                </form>
              )}

              {/* DRIP BAGS FORM */}
              {activeTab === 'dripbags' && (
                <form onSubmit={handleSaveDripBag} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-stone-400 font-mono tracking-widest font-bold uppercase mb-1">
                        產品名字 name
                      </label>
                      <input
                        type="text"
                        required
                        value={dripBagForm.name || ''}
                        onChange={e => setDripBagForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full bg-[#1A1816]/70 text-[#E5DCD3] border border-[#8C827A]/35 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#C5A880]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-stone-400 font-mono tracking-widest font-bold uppercase mb-1">
                        包裝配比/規格 (例: 10包/盒 綜合配比)
                      </label>
                      <input
                        type="text"
                        required
                        value={dripBagForm.packSize || ''}
                        onChange={e => setDripBagForm(prev => ({ ...prev, packSize: e.target.value }))}
                        className="w-full bg-[#1A1816]/70 text-[#E5DCD3] border border-[#8C827A]/35 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#C5A880]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-stone-400 font-mono tracking-widest font-bold uppercase mb-1">
                        禮盒售價 price (HK$)
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={dripBagForm.price || ''}
                        onChange={e => setDripBagForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                        className="w-full bg-[#1A1816]/70 text-[#E5DCD3] border border-[#8C827A]/35 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#C5A880]"
                      />
                    </div>
                  </div>

                  {/* Stock control section ("控制我貨品的存量") */}
                  <div className="bg-[#1A1816]/90 border border-[#8C827A]/25 rounded-xl p-4 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-1.5 text-xs font-serif font-bold text-[#E5DCD3]">
                        <Package className="w-4 h-4 text-[#C5A880]" />
                        <span>即時庫存控制 (Drip bags inventory)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-stone-400 text-xs select-none">狀態標記 :</label>
                        <select
                          value={dripBagForm.isRestocking ? 'restocking' : dripBagForm.isOutOfStock ? 'outofstock' : 'normal'}
                          onChange={e => {
                            const val = e.target.value;
                            if (val === 'restocking') {
                              setDripBagForm(prev => ({ ...prev, isOutOfStock: false, isRestocking: true }));
                            } else if (val === 'outofstock') {
                              setDripBagForm(prev => ({ ...prev, isOutOfStock: true, isRestocking: false }));
                            } else {
                              setDripBagForm(prev => ({ ...prev, isOutOfStock: false, isRestocking: false }));
                            }
                          }}
                          className="bg-[#1A1816] text-[#E5DCD3] border border-[#8C827A]/35 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#C5A880]"
                        >
                          <option value="normal">🟢 充足 / 正常販售 (Normal)</option>
                          <option value="outofstock">🔴 已售罄 (Out of Stock)</option>
                          <option value="restocking">🟡 補貨中 (Restocking)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] text-stone-400 font-mono tracking-widest font-bold uppercase mb-1">
                          可用禮盒庫存量 (盒)
                        </label>
                        <input
                          type="number"
                          min="0"
                          required
                          value={dripBagForm.stock ?? 15}
                          onChange={e => setDripBagForm(prev => ({ ...prev, stock: Number(e.target.value) }))}
                          className="w-full bg-[#1A1816]/70 text-[#E5DCD3] border border-[#8C827A]/35 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#C5A880]"
                        />
                      </div>
                      
                      <div className="text-xs text-stone-400 leading-relaxed font-sans bg-[#1A1816]/40 p-2.5 rounded-lg border border-[#8C827A]/10">
                        掛耳裝氮包避光保存方便出差，但每日手工包裝能力有上限 (單人一般不超20盒)，在此處配置可避免超過團隊每日出單上限。
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-stone-400 font-mono tracking-widest font-bold uppercase mb-1">
                      詳細產品描述 description
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={dripBagForm.description || ''}
                      onChange={e => setDripBagForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full bg-[#1A1816]/70 text-[#E5DCD3] border border-[#8C827A]/35 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#C5A880]"
                    />
                  </div>

                  <div className="bg-[#1A1816]/30 border border-[#8C827A]/20 p-4 rounded-xl space-y-3">
                    <label className="block text-[10px] text-[#C5A880] font-mono tracking-widest font-bold uppercase col-span-5">
                      掛耳咖啡自訂上傳圖片 customized drip bag image
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
                      {/* Preview section */}
                      <div className="md:col-span-2 flex flex-col items-center justify-center border border-[#8C827A]/20 rounded-lg p-2 bg-[#24211E] aspect-video md:h-28 overflow-hidden relative group">
                        {dripBagForm.imageUrl ? (
                          <>
                            <img
                              src={dripBagForm.imageUrl}
                              alt="Preview"
                              className="w-full h-full object-cover rounded"
                            />
                            <button
                              type="button"
                              onClick={() => setDripBagForm(prev => ({ ...prev, imageUrl: '' }))}
                              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs text-red-500 font-serif font-black transition-opacity cursor-pointer rounded"
                            >
                              移除/更換圖片
                            </button>
                          </>
                        ) : (
                          <div className="text-[10px] text-stone-500 font-sans text-center">
                            未上傳自訂圖片 (將顯現系統預設背景圖)
                          </div>
                        )}
                      </div>

                      {/* Upload & Url Input section */}
                      <div className="md:col-span-3 space-y-3">
                        {/* File Uploader */}
                        <div>
                          <span className="block text-[9px] text-stone-400 font-mono uppercase mb-1 tracking-wider">方法一：上傳圖片檔案 (推薦)</span>
                          <label className="flex items-center justify-center gap-2 border border-dashed border-[#C5A880]/40 bg-[#C5A880]/10 hover:bg-[#C5A880]/15 text-[#C5A880] py-2 px-3 rounded-lg text-xs font-serif font-bold cursor-pointer transition">
                            <Upload className="w-3.5 h-3.5" />
                            選擇電腦 / 手機圖片
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={e => handleImageFileChange(e, (url) => setDripBagForm(prev => ({ ...prev, imageUrl: url })))}
                            />
                          </label>
                        </div>

                        {/* URL Direct paste */}
                        <div>
                          <span className="block text-[9px] text-stone-400 font-mono uppercase mb-1 tracking-wider">方法二：直接貼上外部圖片網址</span>
                          <input
                            type="text"
                            placeholder="貼上 https://... 網址"
                            value={dripBagForm.imageUrl || ''}
                            onChange={e => setDripBagForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                            className="w-full bg-[#1A1816] text-[#E5DCD3] border border-[#8C827A]/35 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#C5A880]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-stone-400 font-mono tracking-widest font-bold uppercase mb-1">
                        禮盒特徵/包含精品
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="例: 手沖綜合四大風味, 手作氮氣保鮮"
                        value={tastingNotesStr}
                        onChange={e => setTastingNotesStr(e.target.value)}
                        className="w-full bg-[#1A1816]/70 text-[#E5DCD3] border border-[#8C827A]/35 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#C5A880]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-stone-400 font-mono tracking-widest font-bold uppercase mb-1">
                        廣告標籤 tags
                      </label>
                      <input
                        type="text"
                        placeholder="例: 送禮體面, 精美禮盒"
                        value={tagsStr}
                        onChange={e => setTagsStr(e.target.value)}
                        className="w-full bg-[#1A1816]/70 text-[#E5DCD3] border border-[#8C827A]/35 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#C5A880]"
                      />
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center justify-end gap-3 border-t border-[#8C827A]/20 pt-5">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(null);
                        setIsCreatingNew(false);
                      }}
                      className="px-5 py-2.5 bg-stone-800 text-stone-300 font-serif font-bold text-xs rounded-xl tracking-widest hover:bg-stone-700 transition"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-[#C5A880] text-[#1A1816] font-serif font-bold text-xs rounded-xl tracking-widest hover:bg-[#C5A880]/90 transition shadow-md flex items-center gap-1.5 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" /> 儲存變更
                    </button>
                  </div>
                </form>
              )}

              {/* EQUIPMENT FORM */}
              {activeTab === 'equipment' && (
                <form onSubmit={handleSaveEquipment} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-stone-400 font-mono tracking-widest font-bold uppercase mb-1">
                        產品名字 name
                      </label>
                      <input
                        type="text"
                        required
                        value={equipmentForm.name || ''}
                        onChange={e => setEquipmentForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full bg-[#1A1816]/70 text-[#E5DCD3] border border-[#8C827A]/35 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#C5A880]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-stone-400 font-mono tracking-widest font-bold uppercase mb-1">
                        日語副標 jpName (例: 雅 - MIYABI MANUAL GRINDER)
                      </label>
                      <input
                        type="text"
                        required
                        value={equipmentForm.jpName || ''}
                        onChange={e => setEquipmentForm(prev => ({ ...prev, jpName: e.target.value }))}
                        className="w-full bg-[#1A1816]/70 text-[#E5DCD3] border border-[#8C827A]/35 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#C5A880]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-stone-400 font-mono tracking-widest font-bold uppercase mb-1">
                        器皿售價 price (HK$)
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={equipmentForm.price || ''}
                        onChange={e => setEquipmentForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                        className="w-full bg-[#1A1816]/70 text-[#E5DCD3] border border-[#8C827A]/35 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#C5A880]"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-[10px] text-stone-400 font-mono tracking-widest font-bold uppercase mb-1">
                        產品圖片 product image
                      </label>
                      
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start bg-[#1A1816]/50 border border-[#8C827A]/20 p-4 rounded-xl">
                        {/* Preview section */}
                        <div className="md:col-span-2 flex flex-col items-center justify-center border border-[#8C827A]/20 rounded-lg p-2 bg-[#24211E] aspect-video md:h-28 overflow-hidden relative group">
                          {equipmentForm.imageUrl ? (
                            <>
                              <img
                                src={equipmentForm.imageUrl}
                                alt="Preview"
                                className="w-full h-full object-cover rounded"
                              />
                              <button
                                type="button"
                                onClick={() => setEquipmentForm(prev => ({ ...prev, imageUrl: '' }))}
                                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs text-red-500 font-serif font-black transition-opacity cursor-pointer rounded"
                              >
                                移除/更換圖片
                              </button>
                            </>
                          ) : (
                            <div className="text-[10px] text-stone-500 font-sans text-center">
                              尚未選取或上傳圖片
                            </div>
                          )}
                        </div>

                        {/* Upload & Url Input section */}
                        <div className="md:col-span-3 space-y-3">
                          {/* File Uploader */}
                          <div>
                            <span className="block text-[9px] text-stone-400 font-mono uppercase mb-1 tracking-wider">方法一：上傳圖片檔案 (推薦)</span>
                            <label className="flex items-center justify-center gap-2 border border-dashed border-[#C5A880]/40 bg-[#C5A880]/10 hover:bg-[#C5A880]/15 text-[#C5A880] py-2 px-3 rounded-lg text-xs font-serif font-bold cursor-pointer transition">
                              <Upload className="w-3.5 h-3.5" />
                              選擇電腦 / 手機圖片
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={e => handleImageFileChange(e, (url) => setEquipmentForm(prev => ({ ...prev, imageUrl: url })))}
                              />
                            </label>
                          </div>

                          {/* URL Direct paste */}
                          <div>
                            <span className="block text-[9px] text-stone-400 font-mono uppercase mb-1 tracking-wider">方法二：直接貼上靜態外部圖片網址</span>
                            <input
                              type="text"
                              placeholder="貼上 https://... 網址"
                              value={equipmentForm.imageUrl || ''}
                              onChange={e => setEquipmentForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                              className="w-full bg-[#1A1816] text-[#E5DCD3] border border-[#8C827A]/35 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#C5A880]"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stock control section ("控制我貨品的存量") */}
                  <div className="bg-[#1A1816]/90 border border-[#8C827A]/25 rounded-xl p-4 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-1.5 text-xs font-serif font-bold text-[#E5DCD3]">
                        <Package className="w-4 h-4 text-[#C5A880]" />
                        <span>即時庫存控制 (Equipment inventory)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-stone-400 text-xs select-none">狀態標記 :</label>
                        <select
                          value={equipmentForm.isRestocking ? 'restocking' : equipmentForm.isOutOfStock ? 'outofstock' : 'normal'}
                          onChange={e => {
                            const val = e.target.value;
                            if (val === 'restocking') {
                              setEquipmentForm(prev => ({ ...prev, isOutOfStock: false, isRestocking: true }));
                            } else if (val === 'outofstock') {
                              setEquipmentForm(prev => ({ ...prev, isOutOfStock: true, isRestocking: false }));
                            } else {
                              setEquipmentForm(prev => ({ ...prev, isOutOfStock: false, isRestocking: false }));
                            }
                          }}
                          className="bg-[#1A1816] text-[#E5DCD3] border border-[#8C827A]/35 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#C5A880]"
                        >
                          <option value="normal">🟢 充足 / 正常販售 (Normal)</option>
                          <option value="outofstock">🔴 已售罄 (Out of Stock)</option>
                          <option value="restocking">🟡 補貨中 (Restocking)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] text-stone-400 font-mono tracking-widest font-bold uppercase mb-1">
                          可用用具庫存量 (件)
                        </label>
                        <input
                          type="number"
                          min="0"
                          required
                          value={equipmentForm.stock ?? 10}
                          onChange={e => setEquipmentForm(prev => ({ ...prev, stock: Number(e.target.value) }))}
                          className="w-full bg-[#1A1816]/70 text-[#E5DCD3] border border-[#8C827A]/35 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#C5A880]"
                        />
                      </div>
                      
                      <div className="text-xs text-stone-400 leading-relaxed font-sans bg-[#1A1816]/40 p-2.5 rounded-lg border border-[#8C827A]/10">
                        精品用具供貨較慢，在此處配置可避免超過每日預約出單上限，防超賣。
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-stone-400 font-mono tracking-widest font-bold uppercase mb-1">
                      詳細產品描述 / 介紹 description
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={equipmentForm.description || ''}
                      onChange={e => setEquipmentForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full bg-[#1A1816]/70 text-[#E5DCD3] border border-[#8C827A]/35 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#C5A880]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-stone-400 font-mono tracking-widest font-bold uppercase mb-1">
                      廣告標籤 tags (多個標籤請用英文逗號隔開)
                    </label>
                    <input
                      type="text"
                      placeholder="例: 精鋼刀芯, 垂直落水"
                      value={tagsStr}
                      onChange={e => setTagsStr(e.target.value)}
                      className="w-full bg-[#1A1816]/70 text-[#E5DCD3] border border-[#8C827A]/35 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#C5A880]"
                    />
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center justify-end gap-3 border-t border-[#8C827A]/20 pt-5">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(null);
                        setIsCreatingNew(false);
                      }}
                      className="px-5 py-2.5 bg-stone-800 text-stone-300 font-serif font-bold text-xs rounded-xl tracking-widest hover:bg-stone-700 transition"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-[#C5A880] text-[#1A1816] font-serif font-bold text-xs rounded-xl tracking-widest hover:bg-[#C5A880]/90 transition shadow-md flex items-center gap-1.5 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" /> 儲存變更
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
