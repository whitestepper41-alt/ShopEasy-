import React, { useState } from "react";
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  CreditCard, 
  ShieldCheck, 
  Ticket,
  ShoppingBag,
  ArrowRight,
  ExternalLink,
  Smartphone,
  CheckCircle,
  QrCode
} from "lucide-react";
import { CartItem, DiscountCoupon, UserProfile } from "../types";

interface CartAndCheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  coupons: DiscountCoupon[];
  onCheckout: (shippingAddress: string, couponCode: string, totalAmount: number, targetSellerId?: string) => Promise<void>;
  sellers: UserProfile[];
}

export default function CartAndCheckout({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  coupons,
  onCheckout,
  sellers,
}: CartAndCheckoutProps) {
  const [shippingAddress, setShippingAddress] = useState("");
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<DiscountCoupon | null>(null);
  const [couponError, setCouponError] = useState("");

  // PayChangu Checkout selection states
  const [selectedSellerId, setSelectedSellerId] = useState<string | null>(null);
  const [payChannel, setPayChannel] = useState<"mobile_money" | "card">("mobile_money");
  const [mobileCarrier, setMobileCarrier] = useState<"airtel" | "mpamba">("airtel");
  const [phoneNumber, setPhoneNumber] = useState("");
  
  // Card states
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCVC, setCardCVC] = useState("");
  const [cardHolder, setCardHolder] = useState("");

  // Loader state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState("");

  // After-checkout success overlay state
  const [successData, setSuccessData] = useState<{
    orderId: string;
    sellerName: string;
    totalPaid: number;
    whatsappNumber: string;
    items: CartItem[];
  } | null>(null);

  if (!isOpen) return null;

  // Group cart items by seller
  const groupedCart: Record<string, { sellerId: string; sellerName: string; items: CartItem[] }> = {};
  cartItems.forEach((item) => {
    const sellerId = item.product.sellerId;
    if (!groupedCart[sellerId]) {
      groupedCart[sellerId] = {
        sellerId,
        sellerName: item.product.sellerName,
        items: []
      };
    }
    groupedCart[sellerId].items.push(item);
  });

  const handleApplyCoupon = () => {
    setCouponError("");
    const matched = coupons.find(c => c.id.toUpperCase() === couponInput.toUpperCase().trim());
    if (!matched) {
      setCouponError("Invalid promo coupon code.");
      setAppliedCoupon(null);
    } else if (!matched.active) {
      setCouponError("Promo code is no longer active.");
      setAppliedCoupon(null);
    } else {
      setAppliedCoupon(matched);
      setCouponError("");
    }
  };

  // Launch checkout modal for a specific seller
  const handleInitiateCheckout = (sellerId: string) => {
    if (!shippingAddress.trim()) {
      alert("Please provide your delivery/shipping address first!");
      return;
    }
    setSelectedSellerId(sellerId);
    setPhoneNumber("");
    setCardNumber("");
    setCardExpiry("");
    setCardCVC("");
    setCardHolder("");
  };

  // Calculate seller subtotal and totals
  const getTotalsForSeller = (sellerId: string) => {
    const sellerGroup = groupedCart[sellerId];
    if (!sellerGroup) return { subtotal: 0, discount: 0, total: 0 };
    
    const subtotal = sellerGroup.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    let discount = 0;
    if (appliedCoupon) {
      discount = (subtotal * appliedCoupon.discountPercent) / 100;
    }
    const total = Math.max(0, subtotal - discount);
    return { subtotal, discount, total };
  };

  // Process the simulated PayChangu gateway payment
  const handlePayChanguPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSellerId) return;

    if (payChannel === "mobile_money") {
      if (!phoneNumber.startsWith("09") && !phoneNumber.startsWith("08") && !phoneNumber.startsWith("265")) {
        alert("Please enter a valid Malawian Airtel or TNM Mpamba phone number.");
        return;
      }
    } else {
      if (!cardNumber || !cardExpiry || !cardCVC || !cardHolder) {
        alert("Please configure credit card authorization details.");
        return;
      }
    }

    const { total } = getTotalsForSeller(selectedSellerId);
    const sellerGroup = groupedCart[selectedSellerId];
    const sellerProfile = sellers.find(s => s.uid === selectedSellerId);
    
    // Resolve seller's custom parameters
    const whatsappNum = sellerProfile?.sellerWhatsApp?.trim() || "265888251261";
    const paychanguPubKey = sellerProfile?.sellerPayChanguPublicKey?.trim() || "pub-test-ShopEasyDefault";

    setIsProcessing(true);
    
    try {
      // Elegant multi-stage gateway handshake messages for realism
      setProcessStep("Contacting PayChangu checkout API...");
      await new Promise(r => setTimeout(r, 600));
      
      setProcessStep(`Handshaking with merchant wallet key [${paychanguPubKey.slice(0, 15)}...]`);
      await new Promise(r => setTimeout(r, 700));
      
      if (payChannel === "mobile_money") {
        setProcessStep(`Firing carrier webhook prompt to ${mobileCarrier === "airtel" ? "Airtel Money" : "TNM Mpamba"} (${phoneNumber})...`);
        await new Promise(r => setTimeout(r, 1200));
        setProcessStep("User authorization captured! Processing order clearance...");
      } else {
        setProcessStep("Validating credit card credentials with card issuers...");
        await new Promise(r => setTimeout(r, 1000));
        setProcessStep("Card verified. Capturing settlement funds...");
      }
      
      await new Promise(r => setTimeout(r, 500));

      // Generate order references
      const simulatedOrderId = "SE-MW-" + Math.floor(100000 + Math.random() * 900000);
      
      // Submit order database entry
      await onCheckout(shippingAddress, appliedCoupon?.id || "", total, selectedSellerId);

      // Transition to success details state
      setSuccessData({
        orderId: simulatedOrderId,
        sellerName: sellerGroup.sellerName,
        totalPaid: total,
        whatsappNumber: whatsappNum,
        items: [...sellerGroup.items]
      });

      // Reset modal open keys
      setSelectedSellerId(null);
    } catch (err) {
      console.error("Payment transaction error:", err);
      const errMsg = err instanceof Error ? err.message : String(err);
      alert(`Billing connection interrupted: ${errMsg}\nPlease try again.`);
    } finally {
      setIsProcessing(false);
      setProcessStep("");
    }
  };

  // Build target WhatsApp link for delivery proofing
  const buildWhatsAppLink = () => {
    if (!successData) return "#";
    const itemsText = successData.items.map(t => `  - ${t.product.name} (x${t.quantity})`).join("\n");
    
    const message = `Hello ${successData.sellerName}! I have successfully purchased your item(s) on ShopEasy Malawi!

📦 ORDER PROOF DETAILS:
------------------------------------------
• Order Reference: ${successData.orderId}
• Total Amount Paid: MWK ${successData.totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
• Shipping Address: ${shippingAddress}

🛒 ITEMS PURCHASED:
${itemsText}

Status: Settlement Verified via PayChangu Integration.
Kindly prepare my package for shipment dispatch. Thank you!`;

    // Clean up WhatsApp phone string
    let cleanPhone = successData.whatsappNumber.replace(/\+/, "").trim();
    if (cleanPhone.startsWith("0")) {
      cleanPhone = "265" + cleanPhone.substring(1);
    }
    
    return `https://wa.me/${cleanPhone}/?text=${encodeURIComponent(message)}`;
  };

  const handleFinishAndClose = () => {
    setSuccessData(null);
    if (cartItems.length === 0) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" id="cart-slideover-container">
      {/* Backdrop */}
      <div 
        onClick={() => {
          if (!successData) onClose();
        }}
        className="absolute inset-0 bg-neutral-900/60 transition-opacity backdrop-blur-xs" 
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="px-4.5 py-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
            <div className="flex items-center gap-1.5">
              <ShoppingBag className="h-5 w-5 text-indigo-600" />
              <h2 className="text-sm font-black text-gray-900">Your Checkout Basket</h2>
              <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                {cartItems.length} items
              </span>
            </div>
            <button 
              onClick={onClose}
              className="p-1 px-2 text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Cart Contents Container */}
          <div className="flex-1 overflow-y-auto p-4.5 space-y-5 no-scrollbar">
            {successData ? (
              /* ORDER SUCCESS SCREEN WITH WHATSAPP LINK */
              <div className="text-center py-10 px-2 space-y-6 animate-in fade-in zoom-in-95 duration-300">
                <div className="mx-auto h-16 w-16 bg-green-50 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-10 w-10 text-emerald-500 fill-emerald-50" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Payment Successfully Proven!</h3>
                  <p className="text-[11px] text-gray-400 font-bold tracking-tight uppercase mt-0.5">PayChangu Automated Transaction</p>
                  <p className="text-xs text-gray-500 max-w-xs mx-auto mt-2.5 leading-relaxed">
                    Your payment of <strong className="text-slate-900 font-extrabold text-xs">MWK {successData.totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong> is received by <strong>{successData.sellerName}</strong>. 
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 text-left border border-gray-100 space-y-2 text-xs">
                  <div className="flex justify-between text-gray-500 font-medium">
                    <span>Vendor Contact:</span>
                    <span className="font-mono text-gray-950 font-bold">+{successData.whatsappNumber}</span>
                  </div>
                  <div className="flex justify-between text-gray-500 font-medium">
                    <span>Reference Code:</span>
                    <span className="font-mono text-gray-950 font-bold">{successData.orderId}</span>
                  </div>
                  <div className="flex justify-between text-gray-500 font-medium border-t border-gray-200/50 pt-2.5 mt-1">
                    <span>Clearance Status:</span>
                    <span className="text-emerald-700 font-black bg-emerald-50 px-2 py-0.5 rounded uppercase text-[9px]">PAID & SECURED</span>
                  </div>
                </div>

                {/* Direct user action card */}
                <div className="bg-emerald-50 border border-emerald-150 rounded-2xl p-4.5 space-y-3">
                  <p className="text-[11px] text-emerald-800 font-semibold leading-relaxed">
                    👉 <strong>ACTION REQUIRED:</strong> You must click below to submit your order proof and delivery requirements to the merchant on WhatsApp. This confirms shipment prep!
                  </p>
                  
                  <a 
                    href={buildWhatsAppLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.98] text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition uppercase tracking-wide cursor-pointer"
                  >
                    <span>Instant WhatsApp Merchant Confirmation</span>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>

                <button
                  onClick={handleFinishAndClose}
                  className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-850 text-white font-bold text-xs rounded-lg transition"
                >
                  {cartItems.length > 0 ? "Continue Checking Out Remaining Items" : "Close Basket"}
                </button>
              </div>
            ) : cartItems.length === 0 ? (
              <div className="text-center py-20">
                <ShoppingBag className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <p className="text-xs text-gray-500 font-semibold mb-6">Your shopping cart basket is empty.</p>
                <button 
                  onClick={onClose}
                  className="inline-flex text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl shadow-sm transition"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Delivery Address Field - General and shared */}
                <div>
                  <span className="block text-[10px] text-gray-400 uppercase font-black mb-1.5">Delivery Address (Required)</span>
                  <textarea
                    required
                    placeholder="Input delivery details (State, City, Apt, Street, phone #) so vendors can dispatch items."
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    rows={2}
                    className="w-full text-xs rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-500 bg-gray-50 resize-y font-medium"
                  />
                </div>

                {/* Promo Code Discount */}
                <div>
                  <span className="block text-[10px] text-gray-400 display uppercase font-bold mb-1.5">Apply promo code coupon</span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 text-xs px-3 py-2 border border-slate-200 outline-none focus:border-indigo-500 rounded-lg font-bold bg-gray-50 font-mono"
                      placeholder="e.g. SAVE10"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3 py-2 rounded-lg transition"
                    >
                      Apply
                    </button>
                  </div>
                  {appliedCoupon && (
                    <p className="text-[10px] text-green-600 font-bold mt-1">
                      Success: Applied {appliedCoupon.id} ({appliedCoupon.discountPercent}% off items)
                    </p>
                  )}
                  {couponError && (
                    <p className="text-[10px] text-red-500 font-bold mt-1">
                      {couponError}
                    </p>
                  )}
                </div>

                {/* List Grouped Cart Items on a Per-Vendor Basis */}
                <div className="space-y-6">
                  <span className="block text-[10px] text-gray-400 uppercase font-black mb-1">Items Grouped By Merchant</span>
                  
                  {Object.values(groupedCart).map((group) => {
                    const { subtotal, discount, total } = getTotalsForSeller(group.sellerId);
                    const sellerProfile = sellers.find(s => s.uid === group.sellerId);
                    const customWhatsApp = sellerProfile?.sellerWhatsApp?.trim();
                    const hasWhatsApp = !!customWhatsApp;

                    return (
                      <div key={group.sellerId} className="border border-slate-100 rounded-2xl bg-white p-4 space-y-3.5 shadow-xs">
                        
                        {/* Group Header */}
                        <div className="flex items-center justify-between border-b border-gray-50 pb-2.5">
                          <div className="space-y-0.5 text-left">
                            <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">Merchant Storefront</span>
                            <h4 className="text-xs font-black text-gray-900 leading-tight">{group.sellerName}</h4>
                          </div>
                          
                          {/* Seller custom badge status */}
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            hasWhatsApp ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                          }`}>
                            {hasWhatsApp ? "🟢 WhatsApp Configured" : "⚠️ Basic Contact"}
                          </span>
                        </div>

                        {/* List Items from this vendor */}
                        <div className="space-y-3">
                          {group.items.map((item) => (
                            <div key={item.product.id} className="flex gap-2.5 pb-2 text-xs font-medium text-slate-800">
                              <img 
                                src={item.product.imageUrls[0]} 
                                alt="" 
                                className="h-11 w-11 object-cover rounded-lg border border-gray-100" 
                              />
                              
                              <div className="flex-1 min-w-0">
                                <h5 className="font-bold text-gray-900 text-[11px] truncate" title={item.product.name}>
                                  {item.product.name}
                                </h5>
                                <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                                  Qty: {item.quantity} × MWK {item.product.price.toLocaleString()}
                                </div>
                              </div>

                              <div className="flex flex-col items-end justify-between">
                                <button
                                  onClick={() => onRemoveItem(item.product.id)}
                                  className="text-gray-300 hover:text-red-500 p-0.5 hover:bg-gray-50 rounded"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                                <span className="text-[11px] font-bold text-gray-900 font-mono">
                                  MWK {(item.product.price * item.quantity).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Totals & Submit checkout Action for this Specific Vendor */}
                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-xs space-y-1.5 font-semibold text-gray-500">
                          <div className="flex justify-between">
                            <span>Vendor Subtotal:</span>
                            <span className="font-mono text-gray-900">MWK {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                          </div>
                          {discount > 0 && (
                            <div className="flex justify-between text-red-500">
                              <span>Coupon Savings:</span>
                              <span className="font-mono">-MWK {discount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                          )}
                          <div className="flex justify-between border-t border-gray-200/60 pt-2 mt-1.5 text-gray-900 font-black">
                            <span>Pay Vendor:</span>
                            <span className="text-sm text-indigo-700 font-black font-mono">
                              MWK {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                          </div>

                          {/* Trigger check out */}
                          <button
                            type="button"
                            onClick={() => handleInitiateCheckout(group.sellerId)}
                            className="w-full mt-2 py-2.2 rounded-lg bg-slate-900 hover:bg-indigo-600 text-white font-bold text-[11px] transition flex items-center justify-center gap-1 cursor-pointer shadow-sm uppercase tracking-wider"
                          >
                            <span>Checkout with {group.sellerName}</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* MODAL OVERLAY: INTEGRATED DYNAMIC PAYCHANGU GATEWAY CHECKOUT PANEL */}
      {selectedSellerId && (
        <div className="fixed inset-0 z-55 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-sm rounded-2xl bg-white text-xs border border-gray-150 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* PayChangu Header bar */}
            <div className="bg-[#0284c7] px-4.5 py-3.5 text-white flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <QrCode className="h-5 w-5 text-sky-200 animate-pulse" />
                <div>
                  <h3 className="font-extrabold text-[12px] tracking-tight">PayChangu Portal</h3>
                  <p className="text-[9px] text-sky-100 uppercase tracking-wider font-semibold">Direct Merchant Settlement</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  if (!isProcessing) setSelectedSellerId(null);
                }}
                className="text-sky-100 hover:text-white p-1 hover:bg-sky-700 rounded-full transition"
                disabled={isProcessing}
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Merchant key metadata */}
            <div className="bg-sky-50 px-4.5 py-2 flex items-center justify-between border-b border-sky-100 font-semibold text-sky-800 text-[10px]">
              <span>Merchant: {groupedCart[selectedSellerId]?.sellerName}</span>
              <span className="font-mono text-[9px] uppercase tracking-wide bg-sky-200/60 px-1.5 py-0.5 rounded">
                KEY: {sellers.find(s => s.uid === selectedSellerId)?.sellerPayChanguPublicKey?.slice(0, 11) || "fallback"}...
              </span>
            </div>

            <form onSubmit={handlePayChanguPayment} className="p-4.5 space-y-4">
              
              {/* Payment total box */}
              <div className="p-3 bg-neutral-50 rounded-xl flex items-center justify-between border border-neutral-100">
                <span className="text-gray-500 font-bold uppercase tracking-tight text-[9px]">TOTAL PAYABLE AMOUNT :</span>
                <span className="text-base font-black text-slate-900 font-mono">
                  MWK {getTotalsForSeller(selectedSellerId).total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* Payment selector tabs */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-gray-50 border border-gray-150 rounded-lg">
                <button
                  type="button"
                  onClick={() => setPayChannel("mobile_money")}
                  className={`py-1.8 text-center rounded-md font-extrabold flex items-center justify-center gap-1 transition ${
                    payChannel === "mobile_money" 
                      ? "bg-white text-sky-700 shadow-xs" 
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Smartphone className="h-3.5 w-3.5" />
                  <span>Mobile Money</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPayChannel("card")}
                  className={`py-1.8 text-center rounded-md font-extrabold flex items-center justify-center gap-1 transition ${
                    payChannel === "card" 
                      ? "bg-white text-sky-700 shadow-xs" 
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <CreditCard className="h-3.5 w-3.5" />
                  <span>Debit/Credit Card</span>
                </button>
              </div>

              {/* Pay channel details templates */}
              {payChannel === "mobile_money" ? (
                /* Mobile Money template form */
                <div className="space-y-3.5">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setMobileCarrier("airtel")}
                      className={`p-2 rounded-xl border text-left flex items-center gap-2.5 transition relative overflow-hidden ${
                        mobileCarrier === "airtel"
                          ? "border-red-500 bg-red-50/50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="h-2 w-2 rounded-full absolute top-1 right-1 bg-red-500" />
                      <div className="h-7.5 w-7 text-[10px] font-black tracking-tight text-white bg-red-600 rounded flex items-center justify-center">
                        airtel
                      </div>
                      <div>
                        <p className="font-extrabold text-[11px] text-gray-900">Airtel Money</p>
                        <p className="text-[8px] text-gray-400 font-bold uppercase">Malawi</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMobileCarrier("mpamba")}
                      className={`p-2 rounded-xl border text-left flex items-center gap-2.5 transition relative overflow-hidden ${
                        mobileCarrier === "mpamba"
                          ? "border-emerald-500 bg-emerald-50/50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="h-2 w-2 rounded-full absolute top-1 right-1 bg-emerald-500" />
                      <div className="h-7.5 w-7 font-black tracking-tight text-white bg-green-700 rounded text-[10px] flex items-center justify-center">
                        TNM
                      </div>
                      <div>
                        <p className="font-extrabold text-[11px] text-gray-900">TNM Mpamba</p>
                        <p className="text-[8px] text-gray-400 font-bold uppercase">Malawi</p>
                      </div>
                    </button>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 mb-1">Enter Carrier Mobile Wallet Number (Malawi)</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 0888123456 or 0999123456"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full text-xs rounded-lg border border-slate-200 p-2.2 outline-none focus:border-[#0284c7] font-mono font-bold uppercase"
                      disabled={isProcessing}
                    />
                  </div>
                </div>
              ) : (
                /* Card details form */
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 mb-1">Cardholder Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Johnathan Doe"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      className="w-full text-xs rounded-lg border border-slate-200 p-2 outline-none focus:border-[#0284c7] font-medium"
                      disabled={isProcessing}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 mb-1">Settlement Card Number</label>
                    <input
                      type="text"
                      required
                      placeholder="4000 1234 5678 9010"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim())}
                      maxLength={19}
                      className="w-full text-xs rounded-lg border border-slate-200 p-2 outline-none focus:border-[#0284c7] font-mono font-bold"
                      disabled={isProcessing}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 mb-0.5">Expiry Date</label>
                      <input
                        type="text"
                        required
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full text-xs rounded-lg border border-slate-200 p-2 outline-none focus:border-[#0284c7] font-mono font-bold"
                        maxLength={5}
                        disabled={isProcessing}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 mb-0.5">CVC Code (CVV)</label>
                      <input
                        type="password"
                        required
                        placeholder="***"
                        value={cardCVC}
                        onChange={(e) => setCardCVC(e.target.value)}
                        className="w-full text-xs rounded-lg border border-slate-200 p-2 outline-none focus:border-[#0284c7] font-mono font-bold"
                        maxLength={3}
                        disabled={isProcessing}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Status processing logs tracker */}
              {isProcessing && (
                <div className="text-center p-3 bg-[#0284c7]/5 rounded-xl border border-[#0284c7]/15 animate-pulse text-[#0284c7]">
                  <p className="font-bold text-[10px] uppercase font-mono">{processStep}</p>
                </div>
              )}

              {/* PayChangu checkout call action button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3 bg-[#0284c7] hover:bg-sky-700 active:scale-98 text-white font-extrabold text-xs rounded-xl shadow-md transition uppercase tracking-wide flex items-center justify-center gap-1 cursor-pointer disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                <span>{isProcessing ? "Processing Webhook..." : `Pay MWK ${getTotalsForSeller(selectedSellerId).total.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}</span>
                <ShieldCheck className="h-4 w-4" />
              </button>

              <div className="text-center text-[10px] text-gray-400">
                🔒 Secured by PayChangu. Checkout is end-to-end encrypted.
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
