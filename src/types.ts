/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SensoryProfile {
  acid: number;      // 0-10: 果酸度 / Acidity
  body: number;      // 0-10: 醇厚度 / Body
  sweetness: number; // 0-10: 甜度 / Sweetness
  aroma: number;     // 0-10: 香氣 / Aroma
  balance: number;   // 0-10: 平衡感 / Balance
}

export type CoffeeCategory = 'beans' | 'coldbrew' | 'dripbags' | 'equipment' | 'custom';

export interface CoffeeBean {
  id: string;
  name: string;
  jpName: string;
  origin: string;
  process: string;   // 處理法 e.g. 日曬 / 水洗 / 厭氧
  roastLevel: 'Light' | 'Medium' | 'Medium-Dark' | 'Dark';
  roastLevelZH: string;
  tastingNotes: string[];
  description: string;
  price: number;     // HKD e.g. 138 (for 200g)
  imageSeed: string; // for custom stylized vector placeholders
  imageUrl?: string;  // support direct image URLs
  profile: SensoryProfile;
  tags: string[];    // e.g. ['限量', '人氣', '手作']
  isOutOfStock?: boolean;
  isRestocking?: boolean;
  stock?: number;
  weight?: string;
}

export interface ColdBrewProduct {
  id: string;
  name: string;
  jpName: string;
  volume: string;    // e.g. 350ml
  description: string;
  price: number;     // HKD e.g. 48
  tastingNotes: string[];
  shelfLife: string; // e.g. 需冷藏 0-4°C，保存期 7 天
  tags: string[];
  imageSeed: string;
  imageUrl?: string;  // support direct image URLs
  isOutOfStock?: boolean;
  isRestocking?: boolean;
  stock?: number;
}

export interface DripBagProduct {
  id: string;
  name: string;
  packSize: string;  // e.g. 10包/盒
  description: string;
  price: number;     // HKD e.g. 128
  tastingNotes: string[];
  tags: string[];
  imageSeed: string;
  imageUrl?: string;  // support direct image URLs
  isOutOfStock?: boolean;
  isRestocking?: boolean;
  stock?: number;
}

export interface EquipmentProduct {
  id: string;
  name: string;
  jpName?: string;
  price: number;
  description: string;
  imageUrl?: string;  // support direct image URLs
  imageSeed?: string; // or stylized representation/fallback seed
  tags?: string[];
  isOutOfStock?: boolean;
  isRestocking?: boolean;
  stock?: number;
}

export interface OrderItem {
  id: string; // combination of product ID and options
  productId: string;
  name: string;
  category: CoffeeCategory;
  price: number;
  quantity: number;
  grindSize?: string; // only for beans
  packSize?: string;  // for drip bags
  note?: string;
}

export interface UserInquiry {
  name: string;
  phone: string;
  deliveryType: 'SF' | 'Post' | 'Pickup'; // 順豐自取 / 本地郵寄 / 工作室預約
  sfCode: string; // 順豐站 / 智能櫃代碼
  postalAddress: string; // 本地郵寄地址
  pickupTime: string; // 預約自取時間
  notes: string;
}

export interface CustomerOrder {
  id: string;
  createdAt: string; // ISO string
  userName: string;
  userPhone: string;
  deliveryType: 'SF' | 'Post' | 'Pickup';
  deliveryDetail: string;
  customNotes?: string;
  items: OrderItem[];
  itemsSubtotal: number;
  shippingFee: number;
  discountAmount?: number; // 折扣金額 (New field)
  appliedPromoName?: string; // 應用的優惠方案名稱 (New field)
  orderTotal: number;
  status: 'PENDING' | 'CONFIRMED' | 'PAID' | 'COMPLETED' | 'CANCELLED';
  paymentScreenshot?: string;
}

export interface ShopPromotion {
  id: string;
  name: string; // E.g., "限時全店自動滿額立減"
  type: 'COUPON' | 'AUTO_SPEND_MINUS' | 'AUTO_SPEND_PERCENT' | 'AUTO_COUNT_PERCENT';
  code?: string; // Only for COUPON
  minSpend?: number; // Minimum order subtotal
  minCount?: number; // Minimum item quantity
  discountValue: number; // E.g., 50 for HK$50 off, or 10 for 10% off (e.g. price * 0.9)
  isActive: boolean;
  description: string;
  expiryDate?: string; // Optioanl expiry date & time string
}

export interface PaymentSettings {
  fpsId: string;
  fpsQrCodeUrl: string;
  paymeQrCodeUrl: string;
}


