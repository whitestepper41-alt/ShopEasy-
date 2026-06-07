import React, { useState, useRef, useEffect } from "react";
import { 
  ShoppingBag, 
  Search, 
  User, 
  MessageSquare, 
  Sparkles, 
  Heart,
  Shield, 
  Store, 
  LogOut,
  ChevronDown,
  Settings,
  Bell
} from "lucide-react";
import { UserProfile } from "../types";

interface NavbarProps {
  userProfile: UserProfile | null;
  cartCount: number;
  wishlistCount: number;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  onOpenCart: () => void;
  onOpenChat: () => void;
  onLogin: () => void;
  onLogout: () => void;
  currentTab: "browse" | "seller" | "admin" | "orders" | "wishlist";
  setCurrentTab: (tab: "browse" | "seller" | "admin" | "orders" | "wishlist") => void;
  onOpenSellerApply?: () => void;
}

const CATEGORIES = ["All", "Electronics", "Audio", "Wearables", "Home & Living", "Accessories"];

export default function Navbar({
  userProfile,
  cartCount,
  wishlistCount,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  onOpenCart,
  onOpenChat,
  onLogin,
  onLogout,
  currentTab,
  setCurrentTab,
  onOpenSellerApply,
}: NavbarProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/95 backdrop-blur-md">
      {/* Top tiny info strip for authentic system context */}
      <div className="bg-neutral-950 px-4 py-1 text-[10px] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-1.5 overflow-hidden">
            <span className="inline-flex h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-mono tracking-wider text-neutral-300 truncate">
              SHOPEASY SECURE CLOUD GATEWAY • MALAWI
            </span>
          </div>

          <div className="flex items-center gap-3 font-semibold shrink-0">
            {userProfile ? (
              <span className="text-neutral-300 font-mono text-[9px] uppercase tracking-tight">
                SECURED: {userProfile.role}
              </span>
            ) : (
              <span className="text-amber-400 font-semibold text-[9px] uppercase tracking-wider">
                SIGN IN SECURE
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main navigation header (Minimal, polished, AliExpress scale & spacing) */}
      <div className="mx-auto flex max-w-7xl h-14 items-center justify-between px-3 md:px-4">
        
        {/* Brand logo (Left) */}
        <div 
          onClick={() => {
            setCurrentTab("browse");
            setIsProfileOpen(false);
          }}
          className="flex cursor-pointer items-center gap-1.5 transition hover:opacity-90 shrink-0"
          id="navbar-logo"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm shadow-indigo-100">
            <ShoppingBag className="h-4.5 w-4.5" />
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight text-neutral-900 leading-none">
              Shop<span className="text-indigo-600">Easy</span>
            </h1>
            <p className="text-[8px] text-neutral-400 font-semibold">MALAWIAN HUB</p>
          </div>
        </div>

        {/* Catalog Search input - Desktop/Tablet layout in middle */}
        <div className="hidden sm:flex flex-1 max-w-md mx-4 relative" id="search-input-container">
          <input
            type="text"
            placeholder="Search tech items & electronics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs rounded-full border border-slate-200 bg-slate-50 pl-9 pr-4 py-1.5 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
          />
          <Search className="absolute left-3.5 top-2 h-3.5 w-3.5 text-gray-400" />
        </div>

        {/* Right nav trigger icons: Touch-first action buttons */}
        <div className="flex items-center gap-2 md:gap-3.5 shrink-0">
          
          {/* Chat / Conversations Trigger */}
          {userProfile && (
            <button
              onClick={onOpenChat}
              className="relative p-2 text-gray-600 hover:bg-slate-50 hover:text-indigo-600 rounded-full transition cursor-pointer"
              title="Conversations & Support"
            >
              <MessageSquare className="h-5 w-5" />
            </button>
          )}

          {/* Wishlist Icon */}
          {userProfile && (
            <button
              onClick={() => {
                setCurrentTab("wishlist");
                setIsProfileOpen(false);
              }}
              className="relative p-2 text-gray-600 hover:bg-slate-50 hover:text-red-500 rounded-full transition cursor-pointer"
              title="My Wishlist"
            >
              <Heart className={`h-5 w-5 ${currentTab === "wishlist" ? "fill-red-500 text-red-500" : ""}`} />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white leading-none">
                  {wishlistCount}
                </span>
              )}
            </button>
          )}

          {/* Cart Trigger with floating badge (touch friendly) */}
          {userProfile && (
            <button
              onClick={onOpenCart}
              className="relative flex items-center justify-center p-2 rounded-full bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition duration-150 cursor-pointer"
              id="cart-trigger-btn"
            >
              <ShoppingBag className="h-4.5 w-4.5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-indigo-600 text-[9px] font-black text-white ring-2 ring-white">
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {/* Custom Account Dropdown / Menu Trigger */}
          <div className="relative" ref={dropdownRef}>
            {userProfile ? (
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-1 p-1 rounded-full border border-gray-200 bg-gray-50 hover:bg-white transition cursor-pointer"
                id="profile-dropdown-trigger"
              >
                <div className="flex h-6.5 w-6.5 items-center justify-center rounded-full bg-indigo-600 text-white font-extrabold text-[11px] uppercase tracking-wider">
                  {userProfile.username ? userProfile.username.charAt(0) : "U"}
                </div>
                <ChevronDown className={`h-3 w-3 text-gray-500 transition-transform duration-200 ${isProfileOpen ? "rotate-180" : ""}`} />
              </button>
            ) : (
              <button
                onClick={onLogin}
                className="flex items-center gap-1 rounded-full bg-indigo-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm transition hover:bg-indigo-700 cursor-pointer"
                id="navbar-login-btn"
              >
                <User className="h-3 w-3" />
                <span>Sign In</span>
              </button>
            )}

            {/* AliExpress-Style Profile Dropdown containing secondary actions */}
            {isProfileOpen && userProfile && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-gray-100 bg-white p-2 shadow-xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                <div className="px-3 py-2 border-b border-gray-100 mb-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Logged In As</p>
                  <p className="text-xs font-bold text-gray-900 truncate mt-1">{userProfile.username}</p>
                  <p className="text-[10px] text-gray-400 truncate mt-0.5">{userProfile.email}</p>
                  <div className="inline-block mt-1.5 text-[9px] font-black text-indigo-700 uppercase tracking-wide bg-indigo-55/65 px-1.5 py-0.5 rounded">
                    Role: {userProfile.role}
                  </div>
                </div>

                {/* Dropdown Menu Items (Moving secondary actions here) */}
                <div className="space-y-0.5">
                  <button
                    onClick={() => {
                      setCurrentTab("orders");
                      setIsProfileOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-1.8 text-xs font-medium rounded-lg text-left transition ${
                      currentTab === "orders" ? "bg-indigo-50 text-indigo-700 font-bold" : "text-gray-700 hover:bg-slate-50"
                    }`}
                  >
                    <ShoppingBag className="h-3.5 w-3.5 text-neutral-400" />
                    <span>My Orders</span>
                  </button>

                  <button
                    onClick={() => {
                      setCurrentTab("wishlist");
                      setIsProfileOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-1.8 text-xs font-medium rounded-lg text-left transition ${
                      currentTab === "wishlist" ? "bg-indigo-50 text-indigo-700 font-bold" : "text-gray-700 hover:bg-slate-50"
                    }`}
                  >
                    <Heart className="h-3.5 w-3.5 text-neutral-400" />
                    <span>My Wishlist</span>
                  </button>

                  {/* Move role switching pathways inside profile context menu too */}
                  <div className="border-t border-gray-100 my-1"></div>

                  <button
                    onClick={() => {
                      setCurrentTab("browse");
                      setIsProfileOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-1.8 text-xs font-medium rounded-lg text-left transition ${
                      currentTab === "browse" ? "bg-indigo-50 text-indigo-700 font-bold" : "text-gray-700 hover:bg-slate-50"
                    }`}
                  >
                    <ShoppingBag className="h-3.5 w-3.5 text-indigo-500" />
                    <span>Browse Marketplace</span>
                  </button>

                  {/* Apply / Seller Switch */}
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      if (userProfile.role === "buyer") {
                        if (onOpenSellerApply) onOpenSellerApply();
                      } else {
                        setCurrentTab("seller");
                      }
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-1.8 text-xs font-medium rounded-lg text-left transition ${
                      currentTab === "seller" ? "bg-violet-50 text-violet-700 font-bold" : "text-gray-700 hover:bg-slate-50"
                    }`}
                  >
                    <Store className="h-3.5 w-3.5 text-violet-500" />
                    <span>
                      {userProfile.role === "buyer" ? "Become a Seller" : "Seller Dashboard"}
                    </span>
                  </button>

                  {/* Admin dashboard if authorized */}
                  {userProfile.role === "admin" && (
                    <button
                      onClick={() => {
                        setCurrentTab("admin");
                        setIsProfileOpen(false);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-1.8 text-xs font-medium rounded-lg text-left transition ${
                        currentTab === "admin" ? "bg-red-50 text-red-700 font-bold" : "text-gray-700 hover:bg-slate-50"
                      }`}
                    >
                      <Shield className="h-3.5 w-3.5 text-rose-500" />
                      <span>Admin Board</span>
                    </button>
                  )}

                  <div className="border-t border-gray-100 my-1"></div>

                  {/* Logout Trigger */}
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.8 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg text-left transition"
                  >
                    <LogOut className="h-3.5 w-3.5 shrink-0" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AliExpress-inspired Mobile Search Row (Only visible below sm breakpoint) */}
      <div className="px-3 pb-2.5 sm:hidden" id="mobile-search-row">
        <div className="relative">
          <input
            type="text"
            placeholder="Search items, electronics & audio..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs rounded-full border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 outline-none transition focus:border-indigo-500 focus:bg-white"
          />
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
        </div>
      </div>

      {/* Primary Role Tabs Strip below Header row: Responsive tabs that shrink/stack beautifully */}
      {userProfile && (
        <div className="border-t border-gray-100 bg-white">
          <div className="mx-auto max-w-7xl px-3 md:px-4">
            <nav className="flex justify-center sm:justify-start -mb-px space-x-6 overflow-x-auto no-scrollbar py-1 text-center" aria-label="Portal Tabs">
              
              {/* Buyer / Browse tab */}
              <button
                onClick={() => setCurrentTab("browse")}
                className={`pb-2 pt-1 px-1.5 border-b-2 text-[11px] font-black uppercase tracking-wider whitespace-nowrap transition-all duration-150 cursor-pointer ${
                  currentTab === "browse"
                    ? "border-indigo-600 text-indigo-700"
                    : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-200"
                }`}
              >
                Marketplace (Buy)
              </button>

              {/* Seller portal tab */}
              <button
                onClick={() => {
                  if (userProfile.role === "buyer") {
                    if (onOpenSellerApply) onOpenSellerApply();
                  } else {
                    setCurrentTab("seller");
                  }
                }}
                className={`pb-2 pt-1 px-1.5 border-b-2 text-[11px] font-black uppercase tracking-wider whitespace-nowrap transition-all duration-150 cursor-pointer ${
                  currentTab === "seller"
                    ? "border-violet-500 text-violet-700"
                    : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-200"
                }`}
              >
                {userProfile.role === "buyer" ? "Become a Seller 🚀" : "Seller Dashboard"}
              </button>

              {/* Admin board tab (Conditional) */}
              {userProfile.role === "admin" && (
                <button
                  onClick={() => setCurrentTab("admin")}
                  className={`pb-2 pt-1 px-1.5 border-b-2 text-[11px] font-black uppercase tracking-wider whitespace-nowrap transition-all duration-150 cursor-pointer ${
                    currentTab === "admin"
                      ? "border-red-500 text-red-700"
                      : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-200"
                  }`}
                >
                  Admin Portal
                </button>
              )}

              {/* Orders tab on small screens directly as a shortcut tab */}
              <button
                onClick={() => setCurrentTab("orders")}
                className={`pb-2 pt-1 px-1.5 border-b-2 text-[11px] font-black uppercase tracking-wider whitespace-nowrap transition-all duration-150 cursor-pointer ${
                  currentTab === "orders"
                    ? "border-amber-500 text-amber-700"
                    : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-200"
                }`}
              >
                My Orders
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Swipeable Categories Badge strip */}
      <div className="border-t border-gray-55 bg-slate-50/50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3 md:px-4 h-9">
          <div className="flex gap-1 overflow-x-auto no-scrollbar py-0.5 justify-start w-full">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setCurrentTab("browse");
                }}
                className={`text-[11px] px-2.5 py-0.5 rounded-full transition whitespace-nowrap font-medium cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-indigo-600 text-white font-bold shadow-xs"
                    : "text-gray-500 hover:bg-slate-200 hover:text-neutral-900"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-1.5 text-[10px] text-gray-400 font-semibold shrink-0">
            <Sparkles className="h-3 w-3 text-amber-500 animate-pulse" />
            <span>Use coupon <b className="text-indigo-600">SAVE10</b> for 10% off</span>
          </div>
        </div>
      </div>
    </header>
  );
}
