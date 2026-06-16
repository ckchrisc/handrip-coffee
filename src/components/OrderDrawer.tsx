/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { OrderItem, UserInquiry, CustomerOrder, ShopPromotion, PaymentSettings } from '../types';
import { HK_AREAS } from '../data';
import { ShoppingCart, Send, MapPin, Check, Trash2, Calendar, FileSpreadsheet, X, Tag, Lock, Upload, CreditCard } from 'lucide-react';
import StripePaymentWrapper from './StripePayment';

interface OrderDrawerProps {
  items: OrderItem[];
  onRemoveItem: (id: string) => void;
  onClearOrder: () => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
  isOpen: boolean;
  onClose: () => void;
  onPlaceOrder: (order: CustomerOrder) => void;
  promotions?: ShopPromotion[];
  paymentSettings?: PaymentSettings;
}

export default function OrderDrawer({
  items,
  onRemoveItem,
  onClearOrder,
  onUpdateQuantity,
  isOpen,
  onClose,
  onPlaceOrder,
  promotions = [],
  paymentSettings
}: OrderDrawerProps) {
  // Form input states
  const [userName, setUserName] = useState<string>('');
  const [userPhone, setUserPhone] = useState<string>('');
  const [deliveryType, setDeliveryType] = useState<'SF' | 'Post' | 'Pickup'>('SF');
  const [sfRegion, setSfRegion] = useState<string>('香港島');
  const [sfStation, setSfStation] = useState<string>('銅鑼灣 (Causeway Bay)');
  const [sfCodeInput, setSfCodeInput] = useState<string>('');
  const [postalAddress, setPostalAddress] = useState<string>('');
  const [pickupTime, setPickupTime] = useState<string>('2026-05-30T14:00');
  const [customNotes, setCustomNotes] = useState<string>('');

  // Submit states
  const [isSheetsSubmitting, setIsSheetsSubmitting] = useState<boolean>(false);
  const [sheetsSuccess, setSheetsSuccess] = useState<boolean>(false);
  const [assignedId, setAssignedId] = useState<string>('');

  // Coupon promo state (方案 A)
  const [couponCode, setCouponCode] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<ShopPromotion | null>(null);
  const [couponError, setCouponError] = useState<string>('');

  // Checkout layout states
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'checkout_details'>('cart');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [paymentMethod, setPaymentMethod] = useState<'FPS' | 'PayMe' | 'CreditCard'>('FPS');
  const [paymentProofUrl, setPaymentProofUrl] = useState<string>('');
  const [cardName, setCardName] = useState<string>('');
  const [cardNumber, setCardNumber] = useState<string>('');
  const [cardExpiry, setCardExpiry] = useState<string>('');
  const [cardCvc, setCardCvc] = useState<string>('');
  const [isCreditCardPaid, setIsCreditCardPaid] = useState<boolean>(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);

  const handlePaymentProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('上傳圖片容量過大（限制 2MB 以下），請進行壓縮或選擇較小圖片，以確保存載順暢。');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === 'string') {
          setPaymentProofUrl(event.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  // Calculate prices
  const itemsSubtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemsTotalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Auto Promotions (方案 B) Logic:
  const nowTime = new Date();
  const activeAutoPromos = promotions.filter(p => {
    const isAct = p.isActive;
    const isNotExpired = !p.expiryDate || nowTime <= new Date(p.expiryDate);
    return isAct && isNotExpired && p.type !== 'COUPON';
  });
  let bestAutoPromo: ShopPromotion | null = null;
  let autoDiscountVal = 0;

  activeAutoPromos.forEach(promo => {
    let matches = false;
    let computedDiscount = 0;

    if (promo.type === 'AUTO_SPEND_MINUS' && promo.minSpend !== undefined && itemsSubtotal >= promo.minSpend) {
      matches = true;
      computedDiscount = promo.discountValue;
    } else if (promo.type === 'AUTO_SPEND_PERCENT' && promo.minSpend !== undefined && itemsSubtotal >= promo.minSpend) {
      matches = true;
      computedDiscount = Math.round(itemsSubtotal * (promo.discountValue / 100));
    } else if (promo.type === 'AUTO_COUNT_PERCENT' && promo.minCount !== undefined && itemsTotalCount >= promo.minCount) {
      matches = true;
      computedDiscount = Math.round(itemsSubtotal * (promo.discountValue / 100));
    }

    if (matches && computedDiscount > autoDiscountVal) {
      autoDiscountVal = computedDiscount;
      bestAutoPromo = promo;
    }
  });

  // Coupon (方案 A) Logic:
  let couponDiscountVal = 0;
  if (appliedCoupon) {
    const minS = appliedCoupon.minSpend ?? 0;
    if (itemsSubtotal >= minS) {
      couponDiscountVal = appliedCoupon.discountValue;
    } else {
      // automatically remove if subtotal drops
      setAppliedCoupon(null);
    }
  }

  const finalDiscountAmount = autoDiscountVal + couponDiscountVal;
  const isFreeShipping = itemsSubtotal >= 350;
  const shippingFee = deliveryType === 'Pickup' ? 0 : (isFreeShipping ? 0 : 30);
  const orderTotal = Math.max(0, itemsSubtotal + shippingFee - finalDiscountAmount);

  const handleUpdateQty = (id: string, dir: 'up' | 'down', current: number) => {
    const nextQ = dir === 'up' ? current + 1 : current - 1;
    if (nextQ >= 1) {
      onUpdateQuantity(id, nextQ);
    }
  };

  // Integrated checkout and order placement handler
  const executeOrderPlacement = (paymentMethodOverride?: 'FPS' | 'PayMe' | 'CreditCard', overrideProofUrl?: string) => {
    const appliedPromoNames = [
      bestAutoPromo ? (bestAutoPromo as ShopPromotion).name : null,
      appliedCoupon ? `[優惠碼 ${appliedCoupon.code}] ${appliedCoupon.name}` : null
    ].filter(Boolean).join(' + ');

    const actId = `HRC-${Math.floor(Math.random() * 90000 + 10000)}`;
    setAssignedId(actId);
    
    let deliveryDetail = '';
    if (deliveryType === 'SF') {
      deliveryDetail = `順豐速運 [${sfRegion} - ${sfStation}] ${sfCodeInput ? `(網點代號: ${sfCodeInput})` : ''}`;
    } else if (deliveryType === 'Post') {
      deliveryDetail = `郵政快遞 [香港本地]: ${postalAddress}`;
    } else {
      deliveryDetail = `自取預定時間: ${pickupTime.replace('T', ' ')}`;
    }

    const newOrder: CustomerOrder = {
      id: actId,
      createdAt: new Date().toISOString(),
      userName,
      userPhone,
      deliveryType,
      deliveryDetail,
      customNotes: customNotes || '',
      items: [...items],
      itemsSubtotal,
      shippingFee,
      discountAmount: finalDiscountAmount,
      appliedPromoName: appliedPromoNames || undefined,
      orderTotal,
      status: (paymentMethod === 'CreditCard' || paymentMethodOverride === 'CreditCard') ? 'PAID' : 'PENDING'
    };

    onPlaceOrder(newOrder);
    setSheetsSuccess(true);
    
    // Construct and direct user to WhatsApp
    const targetPromoNames = appliedPromoNames;
    const targetMethod = paymentMethodOverride || paymentMethod;
    const isCcPaid = (paymentMethod === 'CreditCard' || paymentMethodOverride === 'CreditCard');

    const idStr = actId ? `【預購單編號: #${actId}】` : '';
    
    let msg = `您好 Handrip Co.！我已在數位展示廳配置好了專屬精品咖啡預留單 ${idStr}\n\n`;
    msg += `━━━━━━━━━━━━━━━\n`;
    msg += `【我的精品預購清單】\n`;
    
    items.forEach((item, index) => {
      msg += `${index + 1}. 【${item.name}】`;
      if (item.category === 'beans' && item.grindSize) {
        msg += ` (${item.grindSize})`;
      } else if (item.category === 'custom' && item.grindSize) {
        msg += ` (研磨：${item.grindSize})`;
      }
      msg += ` x${item.quantity} \n`;
      if (item.note) {
        msg += `   ↳ ${item.note}\n`;
      }
      msg += `   單價: HK$${item.price} • 小計: HK$${item.price * item.quantity}\n\n`;
    });

    msg += `━━━━━━━━━━━━━━━\n`;
    msg += `【送貨與收件資訊】\n`;
    msg += `• 訂購姓名：${userName}\n`;
    msg += `• 聯絡電話：${userPhone}\n`;
    
    if (deliveryType === 'SF') {
      msg += `• 配送方式：順豐速運自取 (S.F. Express Point)\n`;
      msg += `• 順豐取件點：${sfRegion} - ${sfStation}\n`;
      if (sfCodeInput) {
        msg += `• 網格站碼/智能櫃代碼：${sfCodeInput}\n`;
      }
    } else if (deliveryType === 'Post') {
      msg += `• 配送方式：香港郵寄 (本地郵政快遞/掛號)\n`;
      msg += `• 郵寄地址：${postalAddress}\n`;
    } else {
      msg += `• 配送方式：工作室預訂自取 (Studio Pickup)\n`;
      msg += `• 預留取件時段：${pickupTime.replace('T', ' ')}\n`;
    }

    if (customNotes) {
      msg += `• 特別備註：${customNotes}\n`;
    }

    msg += `\n【財務合計及付款細節】\n`;
    msg += `• 產品小計：HK$ ${itemsSubtotal}\n`;
    if (finalDiscountAmount > 0) {
      msg += `• 專屬折扣：-HK$ ${finalDiscountAmount} (${targetPromoNames})\n`;
    }
    msg += `• 本地運費：HK$ ${shippingFee} ${isFreeShipping && deliveryType !== 'Pickup' ? '(已享滿 $350 免運節約)' : ''}\n`;
    msg += `• 應付總額：HK$ ${orderTotal}\n`;
    msg += `• 付款方式：在線確認付款 (${targetMethod === 'FPS' ? '轉數快 FPS' : targetMethod === 'PayMe' ? 'PayMe' : '信用卡支付'})\n`;
    
    if (isCcPaid) {
      msg += `• 付款憑證：【信用卡已十足支付成功，持卡人: ${cardName || userName}】\n`;
    } else if (overrideProofUrl || paymentProofUrl) {
      msg += `• 付款憑證：【已成功附隨上傳轉帳截圖憑證照片】\n`;
    } else {
      msg += `• 付款憑證：【線上手動離線對帳】\n`;
    }
    msg += `━━━━━━━━━━━━━━━\n`;
    msg += `【烘焙職人鮮度承諾】：所有全豆皆為下單烘焙，極速 48h 發貨！請核對並確認我的配額。謝謝！`;

    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
  };

  const triggerWhatsApp = (reservationId?: string) => {
    // Left as compatibility wrapper
    const finalId = reservationId || assignedId;
    if (finalId) {
      executeOrderPlacement();
    }
  };

  const handlePayNow = () => {
    if (!userName.trim() || !userPhone.trim()) {
      alert('請填寫姓名與聯絡電話，以便烘焙師能第一時間為您核對並預留咖啡款式！');
      return;
    }
    if (deliveryType === 'Post' && !postalAddress.trim()) {
      alert('請填寫郵寄送貨地址！');
      return;
    }

    if (paymentMethod === 'FPS' || paymentMethod === 'PayMe') {
      if (!paymentProofUrl) {
        alert('請先上傳付費憑證截圖圖片（以便會計為您極速核對與出貨）！');
        return;
      }
    } else if (paymentMethod === 'CreditCard') {
      if (!cardName.trim() || cardNumber.replace(/\s+/g, '').length < 15 || cardExpiry.length < 5 || cardCvc.length < 3) {
        alert('請填寫完整正確的信用卡持卡人姓名、卡號、有效期及三位數 CVC 安全代碼！');
        return;
      }
      
      setIsProcessingPayment(true);
      setTimeout(() => {
        setIsProcessingPayment(false);
        setIsCreditCardPaid(true);
        executeOrderPlacement('CreditCard');
      }, 1500);
      return;
    }

    executeOrderPlacement();
  };

  const currentRegionStations = HK_AREAS.find(a => a.region === sfRegion)?.stations || [];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10 md:pl-16">
        <div className="w-screen max-w-lg md:max-w-xl bg-[#1A1816] border-l border-[#8C827A]/40 flex flex-col shadow-2xl relative">
          
          {/* Header */}
          <div className="px-6 py-5 bg-[#24211E] text-[#E5DCD3] flex items-center justify-between border-b border-[#8C827A]/30">
            <div className="flex items-center space-x-2.5">
              <ShoppingCart className="w-5 h-5 text-[#C5A880]" />
              <h3 className="text-lg font-serif tracking-widest font-semibold">
                您的精品預購籃 (BASKET)
              </h3>
              <span className="bg-[#C5A880] text-[10px] font-mono px-2 py-0.5 rounded-full font-bold text-[#1A1816]">
                {items.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-[#E5DCD3]/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {!sheetsSuccess ? (
              /* 1. Checkout Form */
              items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                  <ShoppingCart className="w-12 h-12 text-[#8C827A] stroke-1" />
                  <div>
                    <p className="font-serif text-[#E5DCD3] font-medium text-sm">
                      預購籃是空的 (Empty Basket)
                    </p>
                    <p className="text-xs text-[#8C827A] mt-1 max-w-[280px]">
                      您可以從上方的職人風味調配盤匹配，或在下方產品區挑選精品咖啡與掛耳包！
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {checkoutStep === 'cart' ? (
                    <>
                      <div className="space-y-3.5">
                        <div className="flex justify-between items-center pb-2 border-b border-[#8C827A]/30">
                      <span className="text-[10px] font-bold text-[#8C827A] tracking-widest uppercase">
                        品項細節 (INVENTORIES)
                      </span>
                      <button
                        onClick={onClearOrder}
                        className="text-[10px] text-red-400 hover:underline flex items-center gap-1 font-mono font-medium cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" /> 清空全部
                      </button>
                    </div>

                    <div className="flex flex-col-reverse gap-3 max-h-[220px] overflow-y-auto pr-1" style={{ WebkitOverflowScrolling: 'touch' }}>
                      {items.slice().reverse().map((item) => (
                        <div
                          key={item.id}
                          className="bg-[#24211E] rounded-xl border border-[#8C827A]/40 p-3.5 flex items-start gap-4 relative shadow-sm"
                        >
                          <button
                            onClick={() => onRemoveItem(item.id)}
                            className="absolute top-2.5 right-2.5 text-stone-500 hover:text-red-400 p-1 cursor-pointer transition"
                            title="移出"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold font-serif ${
                                item.category === 'custom' 
                                  ? 'bg-[#C5A880]/15 text-[#C5A880] border border-[#C5A880]/20' 
                                  : 'bg-[#8C827A]/25 text-[#E5DCD3]'
                              }`}>
                                {item.category === 'beans' ? '手烘豆' : item.category === 'coldbrew' ? '冷萃冰滴' : item.category === 'custom' ? '客製特調' : '掛耳包'}
                              </span>
                              <span className="text-xs font-serif font-bold text-[#E5DCD3] max-w-[190px] truncate">
                                {item.name}
                              </span>
                            </div>
                            
                            {(item.grindSize || item.note) && (
                              <div className="text-[10px] text-stone-400 font-sans leading-tight">
                                {item.grindSize && <span>研磨形式: {item.grindSize}</span>}
                                {item.note && <p className="mt-0.5 text-[#C5A880]/90 italic">{item.note}</p>}
                              </div>
                            )}

                            <div className="text-xs font-mono font-bold text-stone-300">
                              HK$ {item.price} <span className="text-[10px] font-normal text-stone-500">/ 件</span>
                            </div>
                          </div>

                          {/* Quantity tools */}
                          <div className="flex items-center border border-stone-800 rounded bg-[#1A1816] self-end mt-2">
                            <button
                              type="button"
                              onClick={() => handleUpdateQty(item.id, 'down', item.quantity)}
                              className="px-2 py-1 text-[11px] text-stone-400 hover:bg-stone-800 font-bold cursor-pointer"
                            >
                              -
                            </button>
                            <span className="px-2.5 text-xs font-mono font-bold text-[#E5DCD3]">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateQty(item.id, 'up', item.quantity)}
                              className="px-2 py-1 text-[11px] text-stone-400 hover:bg-stone-800 font-bold cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Customer Information (RESERVATION DATA) */}
                  <div className="space-y-4 border-t border-[#8C827A]/30 pt-5">
                    <span className="text-[10px] font-bold text-[#8C827A] tracking-widest uppercase block">
                      預留人資訊及送件配置 (RESERVATION DATA)
                    </span>

                    <div className="grid grid-cols-2 gap-3.5">
                      <div className="space-y-1">
                        <label className="block text-xs font-medium text-[#E5DCD3]">
                          姓名 <span className="text-[#C5A880]">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                          placeholder="陳大文"
                          className="w-full text-xs bg-[#24211E] border border-[#8C827A]/50 rounded-xl px-3 py-2 text-[#E5DCD3] focus:outline-none focus:border-[#C5A880] placeholder-stone-600"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-medium text-[#E5DCD3]">
                          香港聯絡電話 <span className="text-[#C5A880]">*</span>
                        </label>
                        <input
                          type="tel"
                          required
                          value={userPhone}
                          onChange={(e) => setUserPhone(e.target.value)}
                          placeholder="90001234"
                          className="w-full text-xs bg-[#24211E] border border-[#8C827A]/50 rounded-xl px-3 py-2 text-[#E5DCD3] focus:outline-none focus:border-[#C5A880] placeholder-stone-600"
                        />
                      </div>
                    </div>

                    {/* Delivery Options tabs */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-[#E5DCD3]">
                        配送形式 (Delivery Options)
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { type: 'SF', label: '順豊速運' },
                          { type: 'Post', label: '郵政快遞' },
                          { type: 'Pickup', label: '工作室自取' }
                        ].map((opt) => (
                          <button
                            key={opt.type}
                            type="button"
                            onClick={() => setDeliveryType(opt.type as 'SF' | 'Post' | 'Pickup')}
                            className={`py-2 text-[11px] font-serif rounded-lg border transition-all cursor-pointer ${
                              deliveryType === opt.type
                                ? 'bg-[#C5A880] border-[#C5A880] text-[#1A1816] font-semibold shadow-inner'
                                : 'border-[#8C827A]/50 text-[#E5DCD3] bg-[#24211E] hover:bg-[#8C827A]/15'
                            }`}
                          >
                            {opt.type === 'SF' ? '順豐速運' : opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Dynamic Delivery Parameters fields */}
                    {deliveryType === 'SF' && (
                      <div className="p-4 rounded-xl border border-dashed border-[#8C827A]/60 bg-[#8C827A]/10 space-y-3.5 animate-fade-in">
                        <div className="flex items-center gap-1 text-xs font-serif font-semibold text-[#C5A880]">
                          <MapPin className="w-3.5 h-3.5" /> 順豐取件點 (全港滿 $350 免郵)
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <span className="text-[10px] text-stone-400 font-medium font-sans">區域 Region</span>
                            <select
                              value={sfRegion}
                              onChange={(e) => {
                                setSfRegion(e.target.value);
                                const nextStations = HK_AREAS.find(a => a.region === e.target.value)?.stations || [];
                                setSfStation(nextStations[0] || '');
                              }}
                              className="w-full text-xs bg-[#24211E] border border-[#8C827A]/50 rounded py-1 px-1.5 text-[#E5DCD3] focus:outline-none focus:border-[#C5A880]"
                            >
                              {HK_AREAS.map((a) => (
                                <option key={a.region} value={a.region}>
                                  {a.region}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] text-stone-400 font-medium font-sans">常見服務點 Station</span>
                            <select
                              value={sfStation}
                              onChange={(e) => setSfStation(e.target.value)}
                              className="w-full text-xs bg-[#24211E] border border-[#8C827A]/50 rounded py-1 px-1.5 text-[#E5DCD3] focus:outline-none focus:border-[#C5A880]"
                            >
                              {currentRegionStations.map((station) => (
                                <option key={station} value={station}>
                                  {station}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] text-stone-400 font-medium block font-sans">
                            順豐櫃/站網點代號 (選填 - 填寫如 852TLL 幫助更精準送達)
                          </span>
                          <input
                            type="text"
                            value={sfCodeInput}
                            onChange={(e) => setSfCodeInput(e.target.value)}
                            placeholder="例如: 852TLL"
                            className="w-full text-xs bg-[#24211E] border border-[#8C827A]/50 rounded px-2.5 py-1 text-[#E5DCD3] focus:outline-none focus:border-[#C5A880] placeholder-stone-700"
                          />
                        </div>
                      </div>
                    )}

                    {deliveryType === 'Post' && (
                      <div className="p-4 rounded-xl border border-dashed border-[#8C827A]/60 bg-[#8C827A]/10 space-y-2 animate-fade-in">
                        <div className="flex items-center gap-1 text-xs font-serif font-semibold text-[#C5A880]">
                          <MapPin className="w-3.5 h-3.5" /> 郵寄送貨地址
                        </div>
                        <textarea
                          required
                          rows={2}
                          value={postalAddress}
                          onChange={(e) => setPostalAddress(e.target.value)}
                          placeholder="香港島/九龍/新界 街道、大廈、樓層及室號碼 ..."
                          className="w-full text-xs bg-[#24211E] border border-[#8C827A]/50 rounded p-2.5 text-[#E5DCD3] focus:outline-none focus:border-[#C5A880] placeholder-stone-600 leading-normal"
                        />
                      </div>
                    )}

                    {deliveryType === 'Pickup' && (
                      <div className="p-4 rounded-xl border border-dashed border-[#8C827A]/60 bg-[#8C827A]/10 space-y-2.5 animate-fade-in">
                        <div className="flex items-center gap-1.5 text-xs font-serif font-semibold text-[#C5A880]">
                          <Calendar className="w-3.5 h-3.5" /> 工作室取件時間預定 (免運費 / 0手續費)
                        </div>
                        <div>
                          <p className="text-[10px] text-stone-400 leading-relaxed mb-1.5 font-sans font-medium">
                            主理人將在預約時間為您悉心沖泡一杯迎賓濃縮。工作室地址：九龍觀塘觀塘道（近 MTR 步行 3 分鐘，詳細定位將與訂購確認信一併發送）。
                          </p>
                          <input
                            type="datetime-local"
                            value={pickupTime}
                            onChange={(e) => setPickupTime(e.target.value)}
                            className="text-xs bg-[#24211E] border border-[#8C827A]/50 rounded p-1.5 w-full font-mono text-[#E5DCD3] focus:outline-none focus:border-[#C5A880]"
                          />
                        </div>
                      </div>
                    )}

                    {/* Additional Note */}
                    <div className="space-y-1">
                      <span className="block text-xs font-medium text-[#E5DCD3]">特別備註 (Special Request)</span>
                      <input
                        type="text"
                        value={customNotes}
                        onChange={(e) => setCustomNotes(e.target.value)}
                        placeholder="例如：請幫忙密封雙倍避光、配手沖磨卡等..."
                        className="w-full text-xs bg-[#24211E] border border-[#8C827A]/50 rounded-xl px-3.5 py-2 text-[#E5DCD3] focus:outline-none focus:border-[#C5A880] placeholder-stone-600"
                      />
                    </div>
                  </div>

                  {/* Promo & Coupon Card (Moved from bottom to scrollable section!) */}
                  <div className="bg-[#24211E] rounded-xl border border-[#8C827A]/30 p-4.5 space-y-3 shadow-sm pt-4">
                    <span className="text-[10px] font-bold text-[#C5A880] tracking-widest uppercase block mb-1">
                      🎟️ 專屬節約優惠 (PROMOTIONS & DISCOUNTS)
                    </span>
                    
                    {/* Applied Auto Promotion Segment (方案B) */}
                    {bestAutoPromo ? (
                      <div className="flex items-center justify-between text-xs text-[#C5A880] border-b border-[#8C827A]/15 pb-2.5">
                        <span className="flex items-center gap-1.5 font-serif font-medium">
                          <span className="bg-[#C5A880] text-[#1A1816] text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">自動 B</span>
                          {bestAutoPromo.name}
                        </span>
                        <span className="font-mono font-bold">-HK$ {autoDiscountVal}</span>
                      </div>
                    ) : (
                      <div className="text-[10px] text-stone-400 font-sans border-b border-[#8C827A]/15 pb-2.5 flex items-center justify-between">
                        <span className="flex items-center gap-1 text-stone-500">🔖 方案 B 自動優惠：</span>
                        <span className="text-[#C5A880]/90 font-serif">滿額扣減或多件折扣折扣！</span>
                      </div>
                    )}

                    {/* Coupon Code Input Segment (方案A) */}
                    <div className="space-y-1.5">
                      <span className="text-[9px] text-stone-400 font-sans font-bold tracking-wider block flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5 text-[#C5A880]" /> 輸入折扣碼 / 方案 A 優惠折扣碼
                      </span>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="例：COFFEE88"
                          value={couponCode}
                          onChange={(e) => {
                            setCouponCode(e.target.value);
                            setCouponError('');
                          }}
                          disabled={!!appliedCoupon}
                          className="flex-1 bg-[#1A1816] border border-[#8C827A]/30 text-[#EDDED4] rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-[#C5A880] font-mono text-center uppercase tracking-widest disabled:opacity-50"
                        />
                        {appliedCoupon ? (
                          <button
                            type="button"
                            onClick={() => {
                              setAppliedCoupon(null);
                              setCouponCode('');
                            }}
                            className="bg-red-950/40 border border-red-800 text-red-200 hover:bg-red-900/40 text-[10px] font-sans px-2.5 rounded-lg cursor-pointer transition-colors"
                          >
                            移除
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              const codeUpper = couponCode.trim().toUpperCase();
                              const nowTime = new Date();
                              const coupon = promotions.find(p => {
                                const isMatch = p.type === 'COUPON' && p.code?.toUpperCase() === codeUpper;
                                const isAct = p.isActive;
                                const isNotExpired = !p.expiryDate || nowTime <= new Date(p.expiryDate);
                                return isMatch && isAct && isNotExpired;
                              });
                              if (coupon) {
                                const minS = coupon.minSpend ?? 0;
                                if (itemsSubtotal >= minS) {
                                  setAppliedCoupon(coupon);
                                  setCouponError('');
                                } else {
                                  setCouponError(`此代碼需買滿 HK$ ${minS} 啟用（尚欠 HK$ ${minS - itemsSubtotal}）`);
                                }
                              } else {
                                setCouponError('無效、失效或未啟動之優惠碼！');
                              }
                            }}
                            className="bg-[#C5A880] hover:bg-[#C5A880]/85 text-[#1A1816] font-serif tracking-wide text-xs px-3.5 rounded-lg font-bold cursor-pointer transition-colors whitespace-nowrap"
                          >
                            套用
                          </button>
                        )}
                      </div>
                      {couponError && (
                        <p className="text-[9px] text-red-400 font-sans">{couponError}</p>
                      )}
                      {appliedCoupon && (
                        <p className="text-[10px] text-emerald-400 font-sans font-medium flex items-center gap-1 animate-pulse">
                          <Check className="w-3.5 h-3.5 text-emerald-400" /> 已成功套用折扣: -HK$ {couponDiscountVal}
                        </p>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setCheckoutStep('cart')}
                    className="flex items-center gap-1.5 text-xs text-[#C5A880] hover:underline font-serif tracking-wider cursor-pointer mb-4"
                  >
                    ← 返回修改預購籃或收件資訊
                  </button>

                  {/* Product details (產品資料) for checkout_details */}
                  <div className="bg-[#24211E]/95 border border-[#8C827A]/30 rounded-xl p-4.5 space-y-4 shadow-sm mb-4">
                    <span className="text-[10px] text-[#C5A880] tracking-widest font-mono font-bold uppercase block pb-1 border-b border-[#8C827A]/20">
                      📋 預購產品清單 (ORDER SUMMARY)
                    </span>
                    <div className="flex flex-col-reverse gap-3">
                      {items.slice().reverse().map((item) => (
                        <div key={item.id} className="flex justify-between items-start text-xs text-stone-300">
                          <div>
                            <span className="font-bold text-stone-200">{item.name}</span>
                            {item.grindSize && <span className="ml-1 text-[#8C827A]">({item.grindSize})</span>}
                            <span className="ml-2 font-mono text-[#C5A880]">x{item.quantity}</span>
                          </div>
                          <span className="font-mono pt-0.5">HK$ {item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment Selection Container & Inline Forms */}
                  <div className="bg-[#24211E]/95 border border-[#8C827A]/30 rounded-xl p-4.5 space-y-4 shadow-sm">
                    <span className="text-[10px] text-[#C5A880] tracking-widest font-mono font-bold uppercase block">
                      💳 選擇您的付款方式 (CHOOSE PAYMENT METHOD)
                    </span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: 'FPS', label: '轉數快 FPS', icon: '⚡' },
                        { id: 'PayMe', label: 'PayMe 付款', icon: '🔴' },
                        { id: 'CreditCard', label: '信用卡付款', icon: '💳' }
                      ].map((method) => (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => {
                            setPaymentMethod(method.id as any);
                            setPaymentProofUrl('');
                            setIsCreditCardPaid(false);
                          }}
                          className={`py-3 rounded-lg border flex flex-col items-center justify-center gap-1 transition-all text-center cursor-pointer ${
                            paymentMethod === method.id
                              ? 'bg-[#C5A880] border-[#C5A880] text-[#1A1816] font-extrabold shadow transform scale-[1.03] duration-200'
                              : 'bg-[#1A1816] border-[#8C827A]/25 text-stone-300 hover:bg-[#8C827A]/10'
                          }`}
                        >
                          <span className="text-sm">{method.icon}</span>
                          <span className="text-[9px] font-bold font-serif leading-none tracking-wider whitespace-nowrap">{method.label}</span>
                        </button>
                      ))}
                    </div>

                    {/* Reusable Payment Interfaces rendered inline inside the single page */}
                    {paymentMethod === 'FPS' && (
                      <div className="bg-[#1A1816] border border-[#8C827A]/20 rounded-xl p-3.5 space-y-3.5 animate-fade-in text-center leading-normal">
                        <div className="space-y-1">
                          <p className="text-[11px] text-stone-300">請轉帳確切金額至以下 Handrip 轉數快識別號：</p>
                          
                          <div className={`p-3 bg-[#24211E] rounded-lg border border-dashed border-[#C5A880]/30 ${paymentSettings?.fpsQrCodeUrl ? 'flex gap-4 items-center justify-center' : 'space-y-1'}`}>
                            {paymentSettings?.fpsQrCodeUrl && (
                              <div className="w-20 h-20 flex-shrink-0 bg-white p-1 rounded-lg">
                                <img src={paymentSettings.fpsQrCodeUrl} className="w-full h-full object-contain" alt="FPS QR" />
                              </div>
                            )}
                            <div className="text-left flex-1">
                              <div className="text-[9px] text-stone-500 font-sans">轉數快 FPS 識別碼 (FPS-ID)</div>
                              <div className="text-lg font-mono font-black text-[#C5A880] tracking-wider select-all">{paymentSettings?.fpsId || '10245899'}</div>
                              <div className="text-[9px] text-[#E5DCD3] font-serif">收款人戶名: <span className="font-bold">Handrip Co., Limited</span></div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2 pt-2 border-t border-[#8C827A]/15 text-left">
                          <span className="block text-[9px] text-[#C5A880] font-mono tracking-widest font-bold uppercase">📂 上傳付款憑證圖片 / 交易截圖 *</span>
                          <div className="flex items-center gap-3 bg-[#24211E] p-3 rounded-xl border border-[#8C827A]/20">
                            <label className="flex-shrink-0 bg-[#C5A880] hover:bg-[#C5A880]/85 text-[#1A1816] text-[10px] font-serif font-black px-4 py-2 rounded-lg cursor-pointer transition shadow">
                              選擇圖片
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handlePaymentProofChange}
                              />
                            </label>
                            <div className="flex-1 min-w-0">
                              {paymentProofUrl ? (
                                <div className="flex items-center gap-1.5">
                                  <div className="w-8 h-8 rounded border border-stone-700 overflow-hidden bg-stone-900 select-none">
                                    <img src={paymentProofUrl} className="w-full h-full object-cover" alt="Proof" />
                                  </div>
                                  <span className="text-[10px] text-emerald-400 font-sans truncate font-medium">截圖憑證已載入成功 ✓</span>
                                </div>
                              ) : (
                                <span className="text-[10px] text-stone-500 font-sans block">未選取收據（請上傳以利快速校對）</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {paymentMethod === 'PayMe' && (
                      <div className="bg-[#1A1816] border border-[#8C827A]/20 rounded-xl p-3.5 space-y-3.5 animate-fade-in text-center leading-normal">
                        <div className="space-y-1">
                          <p className="text-[11px] text-stone-300 font-sans">請直接掃描 QR Code 或按下方連結開啟 PayMe 付款：</p>
                          
                          <div className="flex flex-col items-center justify-center p-3 bg-[#24211E] rounded-lg border border-dashed border-red-900/30 gap-2">
                            {paymentSettings?.paymeQrCodeUrl ? (
                              <div className="w-40 h-40 bg-white p-2 rounded-lg border border-stone-200 shadow-md">
                                <img src={paymentSettings.paymeQrCodeUrl} alt="PayMe Scan" className="w-full h-full object-contain" />
                              </div>
                            ) : (
                              <div className="w-18 h-18 bg-white p-1 rounded-lg border border-stone-200 flex items-center justify-center relative shadow mb-1">
                                <div className="w-16 h-16 bg-[#FF003C] rounded flex flex-col items-center justify-center p-1.5 text-white relative overflow-hidden flex-shrink-0">
                                  <div className="w-5 h-5 bg-white text-[#FF003C] font-black text-[9px] rounded-full flex items-center justify-center shadow">P</div>
                                  <span className="text-[5px] font-sans font-bold tracking-widest mt-1">HANDRIP CO.</span>
                                </div>
                              </div>
                            )}
                            
                            <button
                              type="button"
                              onClick={() => window.open('https://payme.hsbc/handripco', '_blank')}
                              className="text-[11px] text-[#C5A880] hover:underline cursor-pointer font-serif flex items-center gap-1 font-bold"
                            >
                              🔴 點此前往手機 PayMe 付款 ↗
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2 pt-2 border-t border-[#8C827A]/15 text-left">
                          <span className="block text-[9px] text-[#C5A880] font-mono tracking-widest font-bold uppercase">📂 上傳付款憑證圖片 / 交易截圖 *</span>
                          <div className="flex items-center gap-3 bg-[#24211E] p-3 rounded-xl border border-[#8C827A]/20">
                            <label className="flex-shrink-0 bg-[#C5A880] hover:bg-[#C5A880]/85 text-[#1A1816] text-[10px] font-serif font-black px-4 py-2 rounded-lg cursor-pointer transition shadow">
                              選擇圖片
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handlePaymentProofChange}
                              />
                            </label>
                            <div className="flex-1 min-w-0">
                              {paymentProofUrl ? (
                                <div className="flex items-center gap-1.5">
                                  <div className="w-8 h-8 rounded border border-stone-700 overflow-hidden bg-stone-900">
                                    <img src={paymentProofUrl} className="w-full h-full object-cover" alt="Proof" />
                                  </div>
                                  <span className="text-[10px] text-emerald-400 font-sans truncate font-medium">截圖憑證已載入成功 ✓</span>
                                </div>
                              ) : (
                                <span className="text-[10px] text-stone-500 font-sans block">未選取收據（請上傳以利快速校對）</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {paymentMethod === 'CreditCard' && (
                      <div className="bg-[#1A1816] border border-[#8C827A]/20 rounded-xl space-y-3 font-sans animate-fade-in text-left mt-2">
                        <StripePaymentWrapper
                          amount={orderTotal}
                          onSuccess={() => {
                            setIsCreditCardPaid(true);
                            executeOrderPlacement('CreditCard');
                          }}
                          onCancel={() => {
                            setPaymentMethod('FPS');
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Totals & Pay button for checkout_details inside scrollable area to avoid 2 layers */}
                  <div className="pt-2 space-y-4">
                    <div className="bg-[#24211E]/95 border border-[#8C827A]/30 rounded-xl p-4.5 space-y-3 shadow-sm">
                      <div className="flex justify-between text-stone-400 text-xs">
                        <span>產品合計 (Subtotal)</span>
                        <span className="font-mono">HK$ {itemsSubtotal}</span>
                      </div>
                      
                      {finalDiscountAmount > 0 && (
                        <div className="flex justify-between text-emerald-400 font-medium text-xs">
                          <span>專屬優惠折減 (Discounts)</span>
                          <span className="font-mono">-HK$ {finalDiscountAmount}</span>
                        </div>
                      )}

                      <div className="flex justify-between text-stone-400 items-center text-xs">
                        <span className="flex items-center gap-1">
                          本地配送運費
                          {isFreeShipping && deliveryType !== 'Pickup' && (
                            <span className="bg-[#C5A880] text-[8px] font-mono font-bold px-1.5 py-0.2 rounded-full uppercase scale-90 text-[#1A1816]">
                              經免
                            </span>
                          )}
                        </span>
                        <span className="font-mono">
                          {deliveryType === 'Pickup' ? 'HK$ 0' : (isFreeShipping ? '免郵 (HK$ 0)' : `HK$ ${shippingFee}`)}
                        </span>
                      </div>
                      {deliveryType === 'SF' && !isFreeShipping && (
                        <div className="text-[9px] text-[#8C827A] text-right font-sans">
                          *全單滿 HK$350 即可解鎖全港免運
                        </div>
                      )}
                      <div className="flex justify-between text-sm font-serif font-bold text-[#E5DCD3] pt-2.5 border-t border-white/5 mx-[-1px]">
                        <span className="tracking-wider text-stone-200">應付金額 (GRAND TOTAL)</span>
                        <span className="font-mono text-base text-[#C5A880] font-bold">HK$ {orderTotal}</span>
                      </div>
                    </div>

                    {paymentMethod !== 'CreditCard' && (
                      <>
                        <button
                          type="button"
                          onClick={handlePayNow}
                          disabled={isProcessingPayment}
                          className="w-full bg-[#C5A880] hover:bg-[#C5A880]/90 text-[#1A1816] font-serif tracking-widest text-[#1a1816] text-sm font-black py-4 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          <Lock className="w-4 h-4" />
                          {isProcessingPayment ? '處理付款中...' : '確認付款及完成預訂'}
                        </button>
                        
                        <div className="text-center text-[9px] text-[#8C827A]">
                          溫馨提示：若使用 FPS/PayMe，請於上方上傳付款憑證，我們將立即為您安排發貨。
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}
            </>
          )
        ) : (
              /* Success Confirmation */
              <div className="p-5 rounded-2xl bg-[#24211E]/90 border border-[#8C827A]/40 shadow space-y-5 text-center animate-fade-in mt-4">
                <div className="w-12 h-12 bg-green-950/40 text-green-400 rounded-full flex-shrink-0 flex items-center justify-center mx-auto border border-green-800/60 shadow">
                  <Check className="w-6 h-6" />
                </div>
                <div className="space-y-1.5 leading-normal">
                  <h4 className="font-serif font-bold text-base text-[#E5DCD3]">
                    精品預留及付款明細註冊成功!
                  </h4>
                  <p className="font-mono text-xs text-[#C5A880] font-black tracking-widest bg-[#161413] py-1 rounded w-max mx-auto px-4 border border-stone-800 shadow-inner">
                    編號 ID: {assignedId}
                  </p>
                  <p className="text-xs text-stone-300 max-w-sm leading-relaxed mx-auto font-sans">
                    細緻研磨形式、收派地址及聯絡資訊已妥善預留入庫。請務必再次拉起下方 WhatsApp 按鈕發送付款回執至 Handrip 行動對帳處，主理人即刻安排空運鮮焙發貨！
                  </p>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      triggerWhatsApp(assignedId);
                    }}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-serif text-xs font-black py-3 rounded-xl tracking-wider flex items-center justify-center gap-2 shadow-lg cursor-pointer transform hover:-translate-y-0.5 transition"
                  >
                    <Send className="w-4 h-4" /> 一鍵發送至 WhatsApp 手動對帳訂購
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSheetsSuccess(false);
                      onClearOrder();
                      onClose();
                    }}
                    className="w-full border border-[#8C827A]/30 bg-[#1A1816] hover:bg-[#24211E]/80 text-[#8C827A] text-xs py-2 rounded-xl cursor-pointer"
                  >
                    關閉並尋覓探索新風味
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Checkout Footer (Totals layout and Pay Now button for Cart step ONLY) */}
          {items.length > 0 && !sheetsSuccess && checkoutStep === 'cart' && (
            <div className="p-6 bg-[#24211E] text-[#E5DCD3] border-t border-[#8C827A]/30 space-y-4 flex-shrink-0">
               
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-stone-400">
                  <span>產品合計 (Subtotal)</span>
                  <span className="font-mono">HK$ {itemsSubtotal}</span>
                </div>
                
                {finalDiscountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-medium">
                    <span>專屬優惠折減 (Discounts)</span>
                    <span className="font-mono">-HK$ {finalDiscountAmount}</span>
                  </div>
                )}

                <div className="flex justify-between text-stone-400 items-center">
                  <span className="flex items-center gap-1">
                    本地配送運費
                    {isFreeShipping && deliveryType !== 'Pickup' && (
                      <span className="bg-[#C5A880] text-[8px] font-mono font-bold px-1.5 py-0.2 rounded-full uppercase scale-90 text-[#1A1816]">
                        經免
                      </span>
                    )}
                  </span>
                  <span className="font-mono">
                    {deliveryType === 'Pickup' ? 'HK$ 0' : (isFreeShipping ? '免郵 (HK$ 0)' : `HK$ ${shippingFee}`)}
                  </span>
                </div>
                {deliveryType === 'SF' && !isFreeShipping && (
                  <div className="text-[9px] text-[#8C827A] text-right font-sans">
                    *全單滿 HK$350 即可解鎖全港免運
                  </div>
                )}
                <div className="flex justify-between text-sm font-serif font-bold text-[#E5DCD3] pt-2 border-t border-white/5 mx-[-1px]">
                  <span className="tracking-wider text-stone-200">應付金額 (GRAND TOTAL)</span>
                  <span className="font-mono text-base text-[#C5A880] font-bold">HK$ {orderTotal}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!userName.trim() || !userPhone.trim()) {
                    alert('請填寫姓名與聯絡電話，以便烘焙師能第一時間為您核對並預留咖啡款式！');
                    return;
                  }
                  if (deliveryType === 'Post' && !postalAddress.trim()) {
                    alert('請填寫郵寄送貨地址！');
                    return;
                  }
                  setCheckoutStep('checkout_details');
                  setTimeout(() => {
                    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                  }, 50);
                }}
                className="w-full bg-[#C5A880] hover:bg-[#C5A880]/85 text-[#1A1816] font-serif tracking-widest text-[#1a1816] text-sm font-black py-4 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                立即付款 (Pay Now)
              </button>
              
              <div className="text-center text-[9px] text-[#8C827A]">
                0% 手續費 • 無信用卡流出風險 • 完全保證職人手動親切校對
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
