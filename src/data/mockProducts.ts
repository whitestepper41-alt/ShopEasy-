import { Product } from "../types";

export const INITIAL_MOCK_PRODUCTS: Omit<Product, "createdAt">[] = [
  {
    id: "prod-key",
    name: "HyperGlow RGB Sleek Mechanical Keyboard",
    description: "Compact 75% layout, hot-swappable mechanical red switches, and customizable multi-mode dynamic RGB backlighting. Crafted with a premium aluminum top case for ultimate desktop durability.",
    price: 49.99,
    category: "Electronics",
    imageUrls: ["https://images.unsplash.com/photo-1587829741301-dc798b83add3?q=80&w=600&auto=format&fit=crop"],
    stock: 45,
    sellerId: "bootstrap-seller",
    sellerName: "SuperVolt Technologies",
    averageRating: 4.8,
    reviewCount: 3
  },
  {
    id: "prod-audio",
    name: "RetroWave Wireless ANC Over-Ear Headphones",
    description: "Premium Active Noise Cancellation (ANC), 40-hour deep battery life, high-fidelity audio drivers, and comfortable memory foam ear cups for long-duration listening travel sessions.",
    price: 79.99,
    category: "Audio",
    imageUrls: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop"],
    stock: 20,
    sellerId: "bootstrap-seller",
    sellerName: "SuperVolt Technologies",
    averageRating: 4.5,
    reviewCount: 2
  },
  {
    id: "prod-pulse",
    name: "SmartPulse Fitband Pro - Activity Tracker",
    description: "Real-time blood oxygen monitoring, heart rate telemetry, 24 targeted workout trackers, and continuous sleep analyzer. Fully IP68 waterproof with an beautiful curved AMOLED display.",
    price: 29.99,
    category: "Wearables",
    imageUrls: ["https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?q=80&w=600&auto=format&fit=crop"],
    stock: 80,
    sellerId: "bootstrap-seller-2",
    sellerName: "Quantum Wearables",
    averageRating: 4.2,
    reviewCount: 1
  },
  {
    id: "prod-mouse",
    name: "AeroGlide Ergonomic Wireless Mouse",
    description: "Multi-device wireless connectivity (2.4GHz + dual Bluetooth channels), 4000 DPI adjustable optical sensor, silent clicks, and an beautifully sculpted ergonomic thumb rest.",
    price: 19.99,
    category: "Electronics",
    imageUrls: ["https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=600&auto=format&fit=crop"],
    stock: 50,
    sellerId: "bootstrap-seller-2",
    sellerName: "Quantum Wearables",
    averageRating: 4.6,
    reviewCount: 2
  },
  {
    id: "prod-lumina",
    name: "LuminaDecor Smart LED Hexagon Wall Panels",
    description: "Sleek magnetic modular wall lights. Smart app and voice controls, dynamic rhythm music synching, and millions of ambient colors to customize your ultimate gaming rig background.",
    price: 39.99,
    category: "Home & Living",
    imageUrls: ["https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop"],
    stock: 15,
    sellerId: "bootstrap-seller",
    sellerName: "SuperVolt Technologies",
    averageRating: 5.0,
    reviewCount: 1
  },
  {
    id: "prod-watch",
    name: "ChronoClassic Minimalist Quartz Steel Watch",
    description: "Ultra-thin stainless steel casing matched with a mineral crystal dial. Sophisticated design suited for casual or professional layouts. Water-resistant up to 30 meters.",
    price: 59.99,
    category: "Accessories",
    imageUrls: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop"],
    stock: 25,
    sellerId: "bootstrap-seller-2",
    sellerName: "Quantum Wearables",
    averageRating: 4.7,
    reviewCount: 2
  }
];

export const MOCK_REVIEWS_FOR_SEED = [
  {
    productId: "prod-key",
    comment: "Absolutely amazing keyboard! The red switches feel super smooth and the RGB customization is top notch.",
    rating: 5,
    buyerName: "Sarah Connor"
  },
  {
    productId: "prod-key",
    comment: "Pretty decent for the price. Sturdy build, though software was a bit clunky.",
    rating: 4,
    buyerName: "John Doe"
  },
  {
    productId: "prod-key",
    comment: "Beautiful lighting! Worth every single dollar, shipping was surprisingly fast as well.",
    rating: 5,
    buyerName: "Michael Chang"
  },
  {
    productId: "prod-audio",
    comment: "The Noise cancelling blocks out my office background hum perfectly. Bass response is really deep.",
    rating: 5,
    buyerName: "Alexa Vance"
  },
  {
    productId: "prod-audio",
    comment: "Good headphones but slightly tight on larger heads. Audio profile is crisp.",
    rating: 4,
    buyerName: "David Miller"
  },
  {
    productId: "prod-pulse",
    comment: "Battery drops a bit quick with continuous oxygen readings on, but trackings are super detailed.",
    rating: 4,
    buyerName: "Emma Watson"
  },
  {
    productId: "prod-mouse",
    comment: "Exactly what my wrist needed. Silent clicks are indeed silent. Love the dual Bluetooth connections.",
    rating: 5,
    buyerName: "Robert Downey"
  },
  {
    productId: "prod-mouse",
    comment: "A bit lightweight but tracks very accurately on wood tables.",
    rating: 4,
    buyerName: "Chris Evans"
  },
  {
    productId: "prod-lumina",
    comment: "Phenomenal! My streaming background looks incredible now. Synch to music is incredibly responsive.",
    rating: 5,
    buyerName: "Lidya Croft"
  },
  {
    productId: "prod-watch",
    comment: "Very elegant watch. Received three compliments in my first day wearing it. High quality materials.",
    rating: 5,
    buyerName: "Bruce Wayne"
  },
  {
    productId: "prod-watch",
    comment: "Simple, does the job. Band is a bit stiff at first but breaks in quickly.",
    rating: 4,
    buyerName: "Peter Parker"
  }
];
