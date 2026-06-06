import React from "react";
import { 
  ShoppingBag, 
  Search, 
  User, 
  MessageSquare, 
  Sparkles, 
  Heart,
  Shield, 
  Store, 
  LogOut 
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
  onSwitchRole: (role: "buyer" | "seller" | "admin") => void;
  currentTab: "browse" | "seller" | "admin" | "orders" | "wishlist";
  setCurrentTab: (tab: "browse" | "seller" | "admin" | "orders" | "wishlist") => void;
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
  onSwitchRole,
  currentTab,
  setCurrentTab,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/95 backdrop-blur-md">
      {/* Top microbar for simulation controls & notifications */}
      <div className="bg-neutral-900 px-4 py-1.5 text-xs text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            <span className="font-mono text-[10px] tracking-wider text-neutral-300">
              SHOPEASY SECURE CLOUD GATEWAY
            </span>
          </div>

          <div className="flex items-center gap-4">
            {userProfile ? (
              <div className="flex items-center gap-2">
                <span className="text-neutral-400">Sandbox View:</span>
                <div className="flex gap-1.5">
                  <button 
                    onClick={() => onSwitchRole("buyer")}
                    className={`rounded px-1.5 py-0.5 font-semibold transition ${
                      userProfile.role === "buyer" 
                        ? "bg-indigo-600 text-white" 
                        : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                    }`}
                  >
                    Buyer
                  </button>
                  <button 
                    onClick={() => onSwitchRole("seller")}
                    className={`rounded px-1.5 py-0.5 font-semibold transition ${
                      userProfile.role === "seller" 
                        ? "bg-violet-500 text-white" 
                        : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                    }`}
                  >
                    Seller
                  </button>
                  <button 
                    onClick={() => onSwitchRole("admin")}
                    className={`rounded px-1.5 py-0.5 font-semibold transition ${
                      userProfile.role === "admin" 
                        ? "bg-red-500 text-white" 
                        : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                    }`}
                  >
                    Admin
                  </button>
                </div>
              </div>
            ) : (
              <span className="text-amber-400 font-semibold text-[11px]">
                Sign in with the Google Account or Dev Mode to start shopping
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4">
        {/* Brand logo */}
        <div 
          onClick={() => setCurrentTab("browse")}
          className="flex cursor-pointer items-center gap-2 transition hover:opacity-90"
          id="navbar-logo"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-100">
            <ShoppingBag className="h-5.5 w-5.5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-neutral-900">
              Shop<span className="text-indigo-600">Easy</span>
            </h1>
            <p className="text-[10px] text-neutral-400 font-medium">AliExpress Marketplace</p>
          </div>
        </div>

        {/* Global Catalog Search Search */}
        <div className="hidden md:flex flex-1 max-w-lg mx-8 relative" id="search-input-container">
          <input
            type="text"
            placeholder="Search thousands of tech items, watches & electronics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-sm rounded-full border border-slate-200 bg-slate-100/70 pl-11 pr-4 py-2.5 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
          />
          <Search className="absolute left-4 top-3 h-4 w-4 text-gray-400" />
        </div>

        {/* Right nav triggers */}
        <div className="flex items-center gap-4">
          {userProfile && userProfile.role === "seller" && (
            <button
              onClick={() => setCurrentTab("seller")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
                currentTab === "seller"
                  ? "bg-violet-50 border-violet-200 text-violet-700"
                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Store className="h-4 w-4" />
              <span>Seller Panel</span>
            </button>
          )}

          {userProfile && userProfile.role === "admin" && (
            <button
              onClick={() => setCurrentTab("admin")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
                currentTab === "admin"
                  ? "bg-red-50 border-red-200 text-red-700"
                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Shield className="h-4 w-4" />
              <span>Admin Panel</span>
            </button>
          )}

          {userProfile && (
            <button
              onClick={() => setCurrentTab("orders")}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                currentTab === "orders" ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              My Orders
            </button>
          )}

          {/* Chat Hub */}
          {userProfile && (
            <button
              onClick={onOpenChat}
              className="relative p-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition"
              title="Conversations & Support"
            >
              <MessageSquare className="h-5 w-5" />
            </button>
          )}

          {/* Wishlist */}
          {userProfile && (
            <button
              onClick={() => setCurrentTab("wishlist")}
              className="relative p-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition"
              title="My Wishlist"
            >
              <Heart className={`h-5 w-5 ${currentTab === "wishlist" ? "fill-red-500 text-red-500" : ""}`} />
              {wishlistCount > 0 && (
                <span className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {wishlistCount}
                </span>
              )}
            </button>
          )}

          {/* Cart triggers */}
          {userProfile && (
            <button
              onClick={onOpenCart}
              className="relative flex items-center justify-center p-2.5 rounded-full bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition shadow-sm"
              id="cart-trigger-btn"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-black text-white shadow-sm ring-2 ring-white animate-bounce-slow">
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {/* Login / Auth info */}
          <div className="border-l border-gray-100 pl-4 flex items-center gap-3">
            {userProfile ? (
              <div className="flex items-center gap-2">
                <div className="hidden lg:flex flex-col text-right">
                  <span className="text-xs font-semibold text-gray-900">{userProfile.username}</span>
                  <span className="text-[10px] font-medium text-gray-400 capitalize bg-gray-100 px-1 border border-gray-200 rounded self-end mt-0.5">
                    {userProfile.role}
                  </span>
                </div>
                <button
                  onClick={onLogout}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition"
                  title="Logout"
                  id="navbar-logout-btn"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onLogin}
                className="flex items-center gap-1.5 rounded-full bg-indigo-600 px-4.5 py-1.8 text-xs font-semibold text-white shadow-md shadow-indigo-100 transition hover:bg-indigo-700"
                id="navbar-login-btn"
              >
                <User className="h-4 w-4" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Categories sub-bar bar */}
      <div className="border-t border-gray-50 bg-gray-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 h-10">
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setCurrentTab("browse");
                }}
                className={`text-xs px-3 py-1 rounded-full transition whitespace-nowrap font-medium ${
                  selectedCategory === cat
                    ? "bg-indigo-600 text-white font-semibold shadow-sm"
                    : "text-gray-500 hover:bg-slate-200 hover:text-gray-900"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-1 text-[11px] text-gray-400 font-medium">
            <Sparkles className="h-3 w-3 text-amber-500 animate-pulse" />
            <span>AliExpress Deals Auto-applied: Use coupon <b>SAVE10</b> for 10% off</span>
          </div>
        </div>
      </div>
    </header>
  );
}
