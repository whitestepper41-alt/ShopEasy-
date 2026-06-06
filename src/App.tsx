import React, { useState, useEffect } from "react";
import { 
  ShoppingBag, 
  Store, 
  ShieldAlert, 
  Heart, 
  SlidersHorizontal, 
  Star, 
  ArrowLeft, 
  CheckCircle,
  MessageSquare,
  Info,
  X,
  Sparkles,
  Award,
  RefreshCw,
  Gift,
  ShoppingCart,
  MessageCircleOff
} from "lucide-react";
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  signInAnonymously
} from "firebase/auth";
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  addDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  writeBatch, 
  serverTimestamp,
  updateDoc
} from "firebase/firestore";

import { db, auth, handleFirestoreError, OperationType } from "./firebase";
import { 
  UserProfile, 
  UserRole, 
  Product, 
  Order, 
  Review, 
  DiscountCoupon, 
  CartItem, 
  ChatThread 
} from "./types";

// Seeding lists
import { INITIAL_MOCK_PRODUCTS, MOCK_REVIEWS_FOR_SEED } from "./data/mockProducts";

// Component modules
import Navbar from "./components/Navbar";
import ProductCard from "./components/ProductCard";
import SellerDashboard from "./components/SellerDashboard";
import AdminDashboard from "./components/AdminDashboard";
import CartAndCheckout from "./components/CartAndCheckout";
import ChatWindow from "./components/ChatWindow";
import Login from "./pages/Login";

export default function App() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<DiscountCoupon[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  
  // Browsing/Filter UX UI States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortOption, setSortOption] = useState<"default" | "low-high" | "high-low" | "popular">("default");
  
  // Navigation states state
  const [currentTab, setCurrentTab] = useState<"browse" | "seller" | "admin" | "orders" | "wishlist">("browse");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  
  // Review form states
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  // Wishlist and Cart
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // Sliding Overlays
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChatThreadId, setActiveChatThreadId] = useState<string | null>(null);

  // Status banners banner
  const [simLoginsOpen, setSimLoginsOpen] = useState(true);

  // 1. Core authentication listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Sync custom user profile from Firestore
        const userDocRef = doc(db, "users", user.uid);
        try {
          const snapshot = await getDoc(userDocRef);
          if (snapshot.exists()) {
            setUserProfile(snapshot.data() as UserProfile);
          } else {
            // New register defaults structure
            const isDefaultAdmin = user.email === "whitestepper41@gmail.com";
            const newProfile: UserProfile = {
              uid: user.uid,
              email: user.email || `${user.uid}@demo.com`,
              username: user.displayName || "Marketplace Guest",
              role: isDefaultAdmin ? "admin" : "buyer",
              status: "active",
              createdAt: serverTimestamp(),
            };
            await setDoc(userDocRef, newProfile);
            setUserProfile(newProfile);
          }
        } catch (e) {
          console.error("Auth profile syncing err: ", e);
        }
      } else {
        setUserProfile(null);
      }
      setAuthLoading(false);
    });

    return () => unsub();
  }, []);

  // 2. Fetch products collection continuously
  useEffect(() => {
    const path = "products";
    const q = query(collection(db, path), orderBy("createdAt", "desc"));
    
    const unsub = onSnapshot(q, (snapshot) => {
      const items: Product[] = [];
      snapshot.forEach(doc => {
        items.push({ id: doc.id, ...doc.data() } as Product);
      });
      setProducts(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });

    return () => unsub();
  }, []);

  // 3. Fetch orders collection continuously
  useEffect(() => {
    if (!userProfile) {
      setOrders([]);
      return;
    }
    const path = "orders";
    let q = query(collection(db, path), orderBy("createdAt", "desc"));

    const unsub = onSnapshot(q, (snapshot) => {
      const items: Order[] = [];
      snapshot.forEach(doc => {
        items.push({ id: doc.id, ...doc.data() } as Order);
      });
      setOrders(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });

    return () => unsub();
  }, [userProfile]);

  // 4. Fetch discount coupons
  useEffect(() => {
    if (!userProfile) {
      setCoupons([]);
      return;
    }
    const path = "coupons";
    const q = query(collection(db, path), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const items: DiscountCoupon[] = [];
      snapshot.forEach(doc => {
        items.push({ id: doc.id, ...doc.data() } as DiscountCoupon);
      });
      setCoupons(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });

    return () => unsub();
  }, [userProfile]);

  // 5. Fetch user directories (Admins only)
  useEffect(() => {
    if (!userProfile || userProfile.role !== "admin") {
      setUsers([]);
      return;
    }
    const path = "users";
    const q = query(collection(db, path), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const items: UserProfile[] = [];
      snapshot.forEach(doc => {
        items.push({ ...doc.data(), uid: doc.id } as UserProfile);
      });
      setUsers(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });

    return () => unsub();
  }, [userProfile]);

  // 6. Fetch reviews for selected product details
  useEffect(() => {
    if (!selectedProduct) {
      setReviews([]);
      return;
    }
    const path = "reviews";
    const q = query(
      collection(db, path), 
      where("productId", "==", selectedProduct.id)
    );
    
    const unsub = onSnapshot(q, (snapshot) => {
      const items: Review[] = [];
      snapshot.forEach(doc => {
        items.push({ id: doc.id, ...doc.data() } as Review);
      });
      setReviews(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });

    return () => unsub();
  }, [selectedProduct]);

  // OAuth Google Popup logins
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      setSimLoginsOpen(false);
    } catch (e) {
      console.error("Google Auth error login: ", e);
      alert("Sign-in popup was blocked. Try using the quick simulation login panel underneath!");
    }
  };

  // Switch tabs cleanly
  const handleSignout = async () => {
    await signOut(auth);
    setUserProfile(null);
    setCurrentTab("browse");
    setCart([]);
  };

  // Multi-profile Sandbox Quick login simulations
  const handleSimulatedLogin = async (simType: "buyer" | "seller" | "admin") => {
    setAuthLoading(true);
    try {
      // 1. Sign in anonymously with Firebase to generate a valid real unique token
      const cred = await signInAnonymously(auth);
      const uid = cred.user.uid;

      // 2. Assemble simulation profiles
      let profilePayload: UserProfile;

      if (simType === "admin") {
        profilePayload = {
          uid,
          email: "whitestepper41@gmail.com", // Rule-validated bootstrapping admin
          username: "Administrator (QA Mode)",
          role: "admin",
          status: "active",
          createdAt: serverTimestamp()
        };
      } else if (simType === "seller") {
        profilePayload = {
          uid,
          email: "supervolt.vendor@demo.com",
          username: "SuperVolt Manager",
          role: "seller",
          status: "active", // Already approved
          sellerName: "SuperVolt Technologies",
          sellerDescription: "Supreme distributor of state-of-the-art gaming keyboards and multi-mode custom mechanical keys.",
          earnings: 0,
          createdAt: serverTimestamp()
        };
      } else {
        profilePayload = {
          uid,
          email: "client.demo@demo.com",
          username: "John Demobuyer",
          role: "buyer",
          status: "active",
          createdAt: serverTimestamp()
        };
      }

      await setDoc(doc(db, "users", uid), profilePayload);
      setUserProfile(profilePayload);
      setSimLoginsOpen(false);
    } catch (e) {
      console.error(e);
      alert("Simulation setup failed: " + e);
    } finally {
      setAuthLoading(false);
    }
  };

  // Sandbox Role Switching Switcher
  const handleSwitchSandboxRole = async (targetRole: "buyer" | "seller" | "admin") => {
    if (!userProfile) return;
    try {
      const docRef = doc(db, "users", userProfile.uid);
      const updates: Partial<UserProfile> = {
        role: targetRole,
      };

      if (targetRole === "seller" && !userProfile.sellerName) {
        updates.sellerName = "My Merchant Store";
        updates.sellerDescription = "Standard seller general store.";
        updates.status = "active";
      }

      await updateDoc(docRef, updates);
      setUserProfile((prev) => prev ? { ...prev, ...updates } : null);
      setCurrentTab(targetRole === "buyer" ? "browse" : targetRole);
    } catch (e) {
      console.error("Role switch error", e);
    }
  };

  // Add Product (Seller)
  const handleAddProduct = async (productData: any) => {
    if (!userProfile) return;
    const path = "products";
    try {
      const newRef = doc(collection(db, path));
      const fullDoc = {
        id: newRef.id,
        ...productData,
        sellerId: userProfile.uid,
        sellerName: userProfile.sellerName || "Unnamed Store",
        averageRating: 0,
        reviewCount: 0,
        createdAt: serverTimestamp()
      };
      await setDoc(newRef, fullDoc);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  // Edit Product (Seller)
  const handleEditProduct = async (productId: string, productData: any) => {
    const path = `products/${productId}`;
    try {
      await updateDoc(doc(db, "products", productId), productData);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  // Delete Product (Seller or Admin)
  const handleDeleteProduct = async (productId: string) => {
    const path = `products/${productId}`;
    try {
      await setDoc(doc(db, "products", productId), { stock: 0 }, { merge: true }); // Sofdel or zero stock
      alert("Item stock set to zero and retired.");
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  // Remove completely (Admin Only)
  const handleRemoveProductAdmin = async (productId: string) => {
    const path = `products/${productId}`;
    try {
      await setDoc(doc(db, "products", productId), { stock: 0 }); // retire
      alert("Item cleared by system operator.");
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  // Authorize registered seller storefronts
  const handleApproveSeller = async (sellerUid: string) => {
    const path = `users/${sellerUid}`;
    try {
      await updateDoc(doc(db, "users", sellerUid), { status: "active" });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  // Disapprove registered seller
  const handleRejectSeller = async (sellerUid: string) => {
    const path = `users/${sellerUid}`;
    try {
      await updateDoc(doc(db, "users", sellerUid), { status: "rejected" });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  // Seller orders status adjustments
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    const path = `orders/${orderId}`;
    try {
      await updateDoc(doc(db, "orders", orderId), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  // Seller profile modification
  const handleUpdateSellerDetails = async (details: { sellerName: string; sellerDescription: string }) => {
    if (!userProfile) return;
    const path = `users/${userProfile.uid}`;
    try {
      await updateDoc(doc(db, "users", userProfile.uid), details);
      setUserProfile(prev => prev ? { ...prev, ...details } : null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  // Checkout mechanism
  const handleCheckout = async (shippingAddress: string, couponCode: string, totalAmount: number) => {
    if (!userProfile) return;
    const path = "orders";
    try {
      const orderRef = doc(collection(db, path));
      
      const orderItems = cart.map(item => ({
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        sellerId: item.product.sellerId,
      }));

      const newOrder: Order = {
        id: orderRef.id,
        buyerId: userProfile.uid,
        buyerEmail: userProfile.email,
        items: orderItems,
        totalAmount,
        paymentStatus: "paid", // Instantly completed paid checkout simulation
        status: "paid",
        shippingAddress,
        couponCode: couponCode || undefined,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // 1. Create order
      await setDoc(orderRef, newOrder);

      // 2. Adjust inventories in products
      for (const item of cart) {
        const productRef = doc(db, "products", item.productId);
        const newStock = Math.max(0, item.product.stock - item.quantity);
        await updateDoc(productRef, { stock: newStock });
      }

      setCart([]);
      alert("Order processed successfully! Your simulated Stripe payment was validated.");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  // Admin coupon assembly
  const handleAddCoupon = async (code: string, percent: number) => {
    const path = `coupons/${code}`;
    try {
      await setDoc(doc(db, "coupons", code), {
        id: code,
        discountPercent: percent,
        active: true,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  const handleToggleCoupon = async (couponId: string, active: boolean) => {
    const path = `coupons/${couponId}`;
    try {
      await updateDoc(doc(db, "coupons", couponId), { active });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  // AliExpress Catalog Seeding triggers
  const handleSeedDefaultCatalog = async () => {
    const batch = writeBatch(db);
    
    // 1. Seed Products
    INITIAL_MOCK_PRODUCTS.forEach(p => {
      const ref = doc(db, "products", p.id);
      batch.set(ref, {
        ...p,
        createdAt: serverTimestamp()
      });
    });

    // 2. Seed Reviews
    MOCK_REVIEWS_FOR_SEED.forEach((rev, index) => {
      const ref = doc(db, "reviews", `review-seed-${index}`);
      batch.set(ref, {
        id: `review-seed-${index}`,
        ...rev,
        buyerId: `buyer-seed-${index}`,
        createdAt: serverTimestamp()
      });
    });

    // 3. Seed Default Coupon SAVE10 & ALI50
    const save10Ref = doc(db, "coupons", "SAVE10");
    batch.set(save10Ref, { id: "SAVE10", discountPercent: 10, active: true, createdAt: serverTimestamp() });
    const ali50Ref = doc(db, "coupons", "ALI50");
    batch.set(ali50Ref, { id: "ALI50", discountPercent: 50, active: true, createdAt: serverTimestamp() });

    try {
      await batch.commit();
      alert("AliExpress database seeded successfully with 6 products, demo ratings, and SAVE10 vouchers!");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "products");
    }
  };

  // Reviews submission
  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile || !selectedProduct) return;
    if (!reviewComment.trim()) return;

    const reviewId = `rev-${userProfile.uid}-${Date.now()}`;
    const rPath = `reviews/${reviewId}`;

    try {
      const newReview = {
        id: reviewId,
        productId: selectedProduct.id,
        rating: reviewRating,
        comment: reviewComment.trim(),
        buyerId: userProfile.uid,
        buyerName: userProfile.username,
        createdAt: serverTimestamp()
      };

      // 1. Create review
      await setDoc(doc(db, "reviews", reviewId), newReview);

      // 2. Recalculate averageRating and reviewCount inside product doc
      const relatedReviews = [...reviews, newReview as any];
      const newReviewCount = relatedReviews.length;
      const newAverage = relatedReviews.reduce((sum, r) => sum + r.rating, 0) / newReviewCount;

      const pPath = `products/${selectedProduct.id}`;
      await updateDoc(doc(db, "products", selectedProduct.id), {
        averageRating: parseFloat(newAverage.toFixed(1)),
        reviewCount: newReviewCount
      });

      // Update product overlay panel state
      setSelectedProduct((prev) => prev ? {
        ...prev,
        averageRating: parseFloat(newAverage.toFixed(1)),
        reviewCount: newReviewCount
      } : null);

      setReviewComment("");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, rPath);
    }
  };

  // Chat initiation with Seller on demand
  const handleInitiateChatWithSeller = async (sellerId: string, sellerName: string) => {
    if (!userProfile) {
      alert("Please sign in or use simulation buttons to initiate chats.");
      return;
    }

    if (userProfile.uid === sellerId) {
      alert("You cannot initiate a conversation with your own seller profile.");
      return;
    }

    const chatId = `chat-${userProfile.uid}-${sellerId}`;
    const path = `chats/${chatId}`;

    try {
      // Check if thread document already exists
      const threadRef = doc(db, "chats", chatId);
      const snapshot = await getDoc(threadRef);

      if (!snapshot.exists()) {
        const payload = {
          id: chatId,
          buyerId: userProfile.uid,
          buyerName: userProfile.username,
          sellerId,
          sellerName,
          lastMessage: "Initiated a conversation channel",
          updatedAt: serverTimestamp()
        };
        await setDoc(threadRef, payload);
      }

      setActiveChatThreadId(chatId);
      setIsChatOpen(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  // Cart operations helper
  const handleAddToCart = (product: Product) => {
    if (product.stock <= 0) {
      alert("This item is currently out of stock!");
      return;
    }
    
    setCart((prev) => {
      const idx = prev.findIndex(item => item.product.id === product.id);
      if (idx > -1) {
        const currentQty = prev[idx].quantity;
        if (currentQty >= product.stock) {
          alert(`Cannot purchase more items than listed stock (${product.stock} units).`);
          return prev;
        }
        const cloned = [...prev];
        cloned[idx] = { ...cloned[idx], quantity: currentQty + 1 };
        return cloned;
      } else {
        return [...prev, { product, quantity: 1 }];
      }
    });

    setIsCartOpen(true);
  };

  const handleUpdateCartQuantity = (productId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveCartItem(productId);
      return;
    }
    setCart((prev) => {
      const idx = prev.findIndex(item => item.product.id === productId);
      if (idx > -1) {
        if (newQty > prev[idx].product.stock) {
          alert(`Cannot select more than listed stock (${prev[idx].product.stock}).`);
          return prev;
        }
        const cloned = [...prev];
        cloned[idx] = { ...cloned[idx], quantity: newQty };
        return cloned;
      }
      return prev;
    });
  };

  const handleRemoveCartItem = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const handleToggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      const exists = prev.some(item => item.id === product.id);
      if (exists) {
        return prev.filter(item => item.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
  };

  // Filter and sort mechanics listings
  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = selectedCategory === "All" || p.category === selectedCategory;
    return matchSearch && matchCat;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortOption === "low-high") return a.price - b.price;
    if (sortOption === "high-low") return b.price - a.price;
    if (sortOption === "popular") return b.reviewCount - a.reviewCount;
    return 0; // Default sorting
  });

  if (authLoading) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-gray-50 text-xs text-gray-500 font-semibold">
        <RefreshCw className="h-10 w-10 text-indigo-600 animate-spin mb-4" />
        <span>Authenticating with Secure Gateway...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans antialiased text-gray-800">
      
      {/* Dynamic Simulated Quick login drawer toggle micro banner */}
      {simLoginsOpen && !userProfile && (
        <div className="bg-indigo-600 px-4 py-3 text-white text-xs border-b border-indigo-700">
          <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-3 font-semibold">
            <div className="flex items-center gap-2 text-center sm:text-left">
              <Award className="h-5 w-5 animate-bounce-slow text-yellow-300" />
              <span>TEST PORTAL: Log in with pre-loaded mock profiles to audit Buyer, Seller dashboards instantly.</span>
            </div>
            <div className="flex gap-2 text-[11px] font-black">
              <button 
                onClick={() => handleSimulatedLogin("buyer")}
                className="bg-neutral-900 border border-neutral-700 hover:bg-neutral-800 px-3 py-1.5 rounded-lg text-white"
              >
                Simulate Buyer
              </button>
              <button 
                onClick={() => handleSimulatedLogin("seller")}
                className="bg-neutral-900 border border-neutral-700 hover:bg-neutral-800 px-3 py-1.5 rounded-lg text-white"
              >
                Simulate Seller (SuperVolt)
              </button>
              <button 
                onClick={() => handleSimulatedLogin("admin")}
                className="bg-neutral-900 border border-neutral-700 hover:bg-neutral-800 px-3 py-1.5 rounded-lg text-white"
              >
                Simulate Admin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        userProfile={userProfile}
        cartCount={cart.reduce((sum, i) => sum + i.quantity, 0)}
        wishlistCount={wishlist.length}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenChat={() => {
          if (!userProfile) {
            alert("Please sign in or use simulate quick buttons to spawn chat window.");
            return;
          }
          setIsChatOpen(true);
        }}
        onLogin={handleGoogleLogin}
        onLogout={handleSignout}
        onSwitchRole={handleSwitchSandboxRole}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
      />

      {/* Main container fluid layout */}
      <main className="mx-auto flex-1 w-full max-w-7xl p-4 lg:p-6 mb-12">
        {/* If user is completely unauthenticated */}
        {!userProfile ? (
          <Login onSimulateLogin={handleSimulatedLogin} />
        ) : (
          <>
            {/* If authenticated user: Render target page components based on tab route */}
            
            {/* 1. SELLER PORTAL TAB */}
            {currentTab === "seller" && userProfile.role === "seller" && (
              <SellerDashboard
                sellerProfile={userProfile}
                products={products}
                orders={orders}
                onAddProduct={handleAddProduct}
                onEditProduct={handleEditProduct}
                onDeleteProduct={handleDeleteProduct}
                onUpdateOrderStatus={handleUpdateOrderStatus}
                onUpdateSellerDetails={handleUpdateSellerDetails}
              />
            )}

            {/* 2. ADMIN CONTROL TAB */}
            {currentTab === "admin" && userProfile.role === "admin" && (
              <AdminDashboard
                adminProfile={userProfile}
                users={users}
                products={products}
                orders={orders}
                coupons={coupons}
                onApproveSeller={handleApproveSeller}
                onRejectSeller={handleRejectSeller}
                onRemoveProduct={handleRemoveProductAdmin}
                onSeedDefaultCatalog={handleSeedDefaultCatalog}
                onAddCoupon={handleAddCoupon}
                onToggleCoupon={handleToggleCoupon}
              />
            )}

            {/* 3. ORDER HISTORY TAB */}
            {currentTab === "orders" && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs">
                <div className="flex items-center gap-2 mb-4 border-b border-gray-50 pb-3">
                  <h2 className="text-base font-black text-neutral-900">My Purchase Receipts</h2>
                  <span className="text-xs bg-gray-100 text-gray-500 font-bold px-2 py-0.5 rounded-full">
                    {orders.filter(o => o.buyerId === userProfile.uid).length} orders
                  </span>
                </div>

                {orders.filter(o => o.buyerId === userProfile.uid).length === 0 ? (
                  <p className="text-xs text-gray-400 py-12 text-center">No purchases logged. Try buying items in browse tab!</p>
                ) : (
                  <div className="space-y-4">
                    {orders.filter(o => o.buyerId === userProfile.uid).map((order) => (
                      <div key={order.id} className="border border-gray-100 rounded-xl p-4 hover:shadow-xs transition">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-3 border-b border-gray-50 text-[11px] font-bold">
                          <div>
                            <span className="text-gray-400 font-medium">RECEIPT REF:</span> <span className="font-mono text-gray-700">{order.id}</span>
                          </div>
                          <div className="flex gap-2 items-center">
                            <span className="bg-green-100 text-green-700 rounded px-1.5 py-0.5 text-[10px] uppercase">
                              Simulated payment: {order.paymentStatus}
                            </span>
                            <span className="bg-indigo-50 text-indigo-700 rounded px-1.5 py-0.5 text-[10px] uppercase">
                              Dispatch status: {order.status}
                            </span>
                          </div>
                        </div>

                        <div className="py-3 text-xs space-y-2">
                          <p className="font-bold text-gray-400 uppercase text-[10px] tracking-wider">Packaged Items</p>
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between font-medium">
                              <span>{item.name} <span className="text-gray-400">x{item.quantity}</span></span>
                              <span>${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>

                        <div className="pt-2.5 border-t border-gray-50 flex items-center justify-between text-xs font-bold text-gray-800">
                          <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Delivery Address</p>
                            <p className="text-xs text-gray-500 font-medium">{order.shippingAddress || "Electronic checkout Delivery."}</p>
                          </div>
                          <div>
                            <span className="text-neutral-500">Gross Total:</span>
                            <span className="text-indigo-600 text-sm font-black ml-1.5">${order.totalAmount.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 4. WISHLIST TAB */}
            {currentTab === "wishlist" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500 fill-red-500" />
                  <h2 className="text-base font-black text-neutral-900">My Saved Wishlist</h2>
                </div>

                {wishlist.length === 0 ? (
                  <p className="text-xs text-gray-400 py-10 bg-white border border-gray-100 rounded-xl text-center">Your wishlist is empty. Tap hearts on product cards to list items.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {wishlist.map((p) => (
                      <ProductCard
                        key={p.id}
                        product={p}
                        onAddToCart={handleAddToCart}
                        onViewDetails={setSelectedProduct}
                        isWishlisted={true}
                        onToggleWishlist={handleToggleWishlist}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 5. DEFAULT BROWSE CATALOG PAGE */}
            {currentTab === "browse" && (
              <div className="space-y-6">
                
                {/* Visual discount promotion banner card */}
                {products.length > 0 && (
                  <div className="bg-gradient-to-r from-indigo-500 via-indigo-600 to-slate-700 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
                    <div className="space-y-1 z-10">
                      <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full w-fit">
                        <Sparkles className="h-3 w-3 text-yellow-300" />
                        <span>Limited Time Promo Deals</span>
                      </div>
                      <h2 className="text-xl md:text-2xl font-black tracking-tight">ShopEasy Winter Bonanza!</h2>
                      <p className="text-xs text-indigo-50 max-w-lg font-medium">Use code <b className="bg-white/20 px-1 border border-white/40 rounded">SAVE10</b> to redeem active 10% off final amounts during simulated checkout!</p>
                    </div>

                    <div className="z-10 rounded-xl bg-black/10 border border-white/20 p-2 text-center text-xs backdrop-blur-xs flex items-center gap-2">
                      <Gift className="h-5 w-5 text-yellow-300" />
                      <div className="text-left">
                        <p className="font-extrabold text-[11px]">Promo Code: SAVE10</p>
                        <p className="text-[10px] text-indigo-100 font-medium">Active for all catalog listings</p>
                      </div>
                    </div>

                    {/* background styling details */}
                    <div className="absolute right-0 bottom-0 h-40 w-40 bg-white/10 rounded-full translate-x-12 translate-y-12 shrink-0 select-none"></div>
                  </div>
                )}

                {/* Search filters sort alignments */}
                <div className="bg-white border border-gray-100 p-4.5 rounded-2xl shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs font-semibold">
                  
                  {/* Category info */}
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Filtering:</span>
                    <span className="bg-indigo-600 text-white rounded-full px-2.5 py-0.5 capitalize">{selectedCategory} Category</span>
                    {searchQuery && (
                      <span className="bg-gray-100 text-gray-500 border border-gray-200 rounded-full px-2.5 py-0.5">Matching: "{searchQuery}"</span>
                    )}
                  </div>

                  {/* Sort selector */}
                  <div className="flex items-center gap-2 self-stretch md:self-auto justify-between border-t md:border-t-0 border-gray-100 pt-3 md:pt-0">
                    <div className="flex items-center gap-1.5 text-gray-405">
                      <SlidersHorizontal className="h-4 w-4" />
                      <span>Sort Options:</span>
                    </div>
                    <select
                      value={sortOption}
                      onChange={(e) => setSortOption(e.target.value as any)}
                      className="border border-slate-200 rounded-lg p-2 bg-slate-50 outline-none font-bold text-gray-700 text-xs focus:border-indigo-500"
                    >
                      <option value="default">Default Listings</option>
                      <option value="low-high">Price: Low to High</option>
                      <option value="high-low">Price: High to Low</option>
                      <option value="popular">Review count</option>
                    </select>
                  </div>
                </div>

                {/* Products Grid items */}
                {sortedProducts.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 p-6 shadow-xs max-w-xl mx-auto">
                    <ShoppingCart className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                    <h3 className="font-bold text-gray-700 text-sm">No items found matching configurations</h3>
                    <p className="text-xs text-gray-400 mt-1 mb-6">Database has 0 listed products or filtering criteria got cleared.</p>
                    {userProfile.role === "admin" ? (
                      <button
                        onClick={handleSeedDefaultCatalog}
                        className="bg-red-600 hover:bg-red-700 text-white font-black text-xs px-5 py-2.5 rounded-xl transition"
                      >
                        Seed Database Immediately
                      </button>
                    ) : (
                      <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-700 text-xs">
                        Tip: Change role to <b>Admin</b> in the top black Sandbox View to seed the catalog.
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                    {sortedProducts.map((p) => (
                      <ProductCard
                        key={p.id}
                        product={p}
                        onAddToCart={handleAddToCart}
                        onViewDetails={setSelectedProduct}
                        isWishlisted={wishlist.some(item => item.id === p.id)}
                        onToggleWishlist={handleToggleWishlist}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* FOOTER SECTION */}
      <footer className="mt-auto border-t border-gray-150 bg-neutral-900 text-gray-400 text-xs py-8 px-4 font-semibold">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center md:text-left">
            <h4 className="text-white text-sm font-black">ShopEasy Incorporated</h4>
            <p className="text-gray-400 font-medium text-[11px]">AliExpress Style Multi-vendor Sandbox Environment</p>
          </div>
          
          <div className="flex gap-4.5 flex-wrap justify-center text-[11px] font-bold">
            <span className="text-neutral-500">Node JS + Firebase SDK</span>
            <span>•</span>
            <span className="text-neutral-500">Stripe Payment Simulation</span>
            <span>•</span>
            <span className="text-indigo-400">ABAC Rules Safeguarded</span>
          </div>
        </div>
      </footer>

      {/* OVERLAY: PRODUCT DETAIL SPECIFICATION SHEET DRAWERS */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-3xl rounded-2xl bg-white shadow-2xl overflow-y-auto max-h-[90vh] border border-gray-150 animate-in fade-in zoom-in-95 duration-200 no-scrollbar">
            
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute right-4 top-4 z-10 text-gray-400 bg-white/90 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition shadow-sm"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex flex-col lg:flex-row gap-6 p-6">
              {/* Product specifications media column */}
              <div className="lg:w-1/2 space-y-3 shrink-0">
                <img 
                  src={selectedProduct.imageUrls[0]} 
                  alt="" 
                  className="rounded-xl object-contain bg-neutral-50 border border-gray-100 aspect-square w-full" 
                  referrerPolicy="no-referrer"
                />
                
                <div className="flex items-center gap-1 text-[11px] text-gray-400 py-1 font-bold uppercase justify-center bg-gray-50 border rounded-lg border-gray-150">
                  <span>Guaranteed by Seller Storefront</span>
                </div>
              </div>

              {/* Specs meta columns */}
              <div className="flex-1 flex flex-col justify-between text-xs font-semibold leading-relaxed">
                <div>
                  <div className="flex justify-between items-start pt-2">
                    <span className="bg-indigo-50 text-indigo-700 text-[10px] px-2.5 py-0.5 rounded-full uppercase font-black">
                      {selectedProduct.category}
                    </span>
                    <span className="text-gray-400 font-bold uppercase text-[10px] tracking-wider">SKU: {selectedProduct.id}</span>
                  </div>

                  <h3 className="text-base md:text-lg font-black text-neutral-900 mt-2 mb-2 leading-tight">
                    {selectedProduct.name}
                  </h3>

                  {/* Rating panel */}
                  <div className="flex items-center gap-1.5 mb-3">
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-4.5 w-4.5 ${i < Math.floor(selectedProduct.averageRating) ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
                      ))}
                    </div>
                    <span className="text-sm font-black text-neutral-800">{selectedProduct.averageRating.toFixed(1)}</span>
                    <span className="text-gray-400">({selectedProduct.reviewCount} customer reviews)</span>
                  </div>

                  {/* Details price Tag design */}
                  <div className="bg-indigo-50/50 p-4 border border-indigo-100/40 rounded-xl mb-4">
                    <div className="flex justify-between items-baseline">
                      <div>
                        <span className="text-xs text-gray-500 font-semibold leading-none">Deal Price</span>
                        <div className="flex items-baseline">
                          <span className="text-lg font-black text-indigo-600">$</span>
                          <span className="text-2xl font-black text-slate-900">{selectedProduct.price.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="block text-[10px] uppercase font-bold text-gray-400">Stock Availability</span>
                        <span className={`font-mono text-sm font-black ${selectedProduct.stock > 0 ? "text-emerald-600" : "text-red-500"}`}>
                          {selectedProduct.stock > 0 ? `${selectedProduct.stock} Units Left` : "OUT OF STOCK"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-500 text-xs font-medium leading-relaxed mb-6">
                    {selectedProduct.description || "Detailed specifications for this AliExpress marketplace catalog item."}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-100 space-y-3.5 mt-auto">
                  
                  {/* Vendor contact controls */}
                  <div className="bg-gray-50 p-3 rounded-lg border flex justify-between items-center text-[11px]">
                    <div>
                      <span className="block text-gray-400 font-bold uppercase text-[9px]">Platform Vendor</span>
                      <span className="font-extrabold text-violet-700">{selectedProduct.sellerName}</span>
                    </div>

                    <button
                      onClick={() => handleInitiateChatWithSeller(selectedProduct.sellerId, selectedProduct.sellerName)}
                      className="inline-flex items-center gap-1 text-violet-700 hover:text-white bg-violet-50 hover:bg-violet-600 border border-violet-200 hover:border-violet-600 px-3 py-1.8 rounded font-black transition-all"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>Chat with Seller</span>
                    </button>
                  </div>

                  <div className="flex gap-2.5">
                    <button
                      onClick={() => {
                        handleToggleWishlist(selectedProduct);
                      }}
                      className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-extrabold hover:bg-gray-50 transition uppercase tracking-wide flex items-center justify-center gap-1.5"
                    >
                      <Heart className={`h-4.5 w-4.5 ${wishlist.some(i => i.id === selectedProduct.id) ? "fill-red-500 text-red-500" : ""}`} />
                      <span>{wishlist.some(i => i.id === selectedProduct.id) ? "Saved to Wishlist" : "Add to Wishlist"}</span>
                    </button>
                    <button
                      onClick={() => {
                        handleAddToCart(selectedProduct);
                        setSelectedProduct(null);
                      }}
                      className="flex-1 py-3 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-black hover:shadow text-xs transition uppercase tracking-wide flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ShoppingCart className="h-4.5 w-4.5" />
                      <span>Add to Basket</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Comprehensive star reviews thread detail section */}
            <div className="p-6 bg-slate-50 border-t border-gray-150">
              <h4 className="text-sm font-black text-gray-800 mb-4 border-b border-gray-200 pb-2 flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400 animate-spin" />
                <span>Historic Star Ratings & Feeds ({reviews.length})</span>
              </h4>

              {/* Review submit forms (Buyers Only) */}
              {userProfile.role === "buyer" && (
                <form onSubmit={handleAddReview} className="bg-white rounded-xl border border-gray-150 p-4.5 text-xs mb-6 space-y-3.5">
                  <span className="block text-[11px] text-gray-400 font-extrabold uppercase">Write a product review</span>
                  <div className="flex items-center gap-4.5">
                    <span className="font-bold text-gray-500">Product Rating:</span>
                    <div className="flex gap-1 border border-gray-150 bg-gray-50 p-1.5 rounded-lg">
                      {[1, 2, 3, 4, 5].map((starVal) => (
                        <button
                          key={starVal}
                          type="button"
                          onClick={() => setReviewRating(starVal)}
                          className={`p-0.5 hover:scale-110 transition ${reviewRating >= starVal ? "text-amber-400" : "text-gray-200"}`}
                        >
                          <Star className="h-5 w-5 fill-current" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <textarea
                      required
                      rows={2.5}
                      placeholder="Comment on dispatch speed, sizing, rgb features options, sound fidelity..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="w-full text-xs rounded-lg border border-slate-200 p-2.5 outline-none focus:border-indigo-500 bg-gray-50 resize-y"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="bg-slate-900 hover:bg-indigo-600 text-white px-5 py-2 rounded-xl transition text-xs font-black hover:shadow"
                    >
                      Submit Review
                    </button>
                  </div>
                </form>
              )}

              {/* List reviews */}
              {reviews.length === 0 ? (
                <p className="text-xs text-gray-400 py-4 text-center">No reviews written for this product yet.</p>
              ) : (
                <div className="space-y-3">
                  {reviews.map((r) => (
                    <div key={r.id} className="bg-white rounded-xl border border-gray-150 p-4 shadow-2xs">
                      <div className="flex justify-between items-start mb-2.5">
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-neutral-900">{r.buyerName}</span>
                          <span className="block text-[9px] text-gray-400">Verified platform receipt</span>
                        </div>
                        <div className="flex text-amber-400">
                          {[...Array(r.rating)].map((_, i) => (
                            <Star key={i} className="h-3.2 w-3.2 fill-current" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 font-medium leading-relaxed">{r.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* OVERLAY: SLIDE OVER CHECKOUT CART */}
      <CartAndCheckout
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        coupons={coupons}
        onCheckout={handleCheckout}
      />

      {/* OVERLAY: LIVE MESSENGER CHAT POPUP */}
      <ChatWindow
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        currentUser={userProfile}
        activeThreadId={activeChatThreadId}
        onSelectThread={setActiveChatThreadId}
      />

    </div>
  );
}
