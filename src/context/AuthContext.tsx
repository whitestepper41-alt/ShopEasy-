import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../services/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { UserProfile } from "../types";

interface AuthContextType {
  user: User | null;
  role: string | null;
  userProfile: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (u: User) => {
    try {
      const docRef = doc(db, "users", u.uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const profile = snap.data() as UserProfile;
        setUserProfile(profile);
        setRole(profile.role);
      } else {
        // Create default profile if not found
        const isDefaultAdmin = u.email === "whitestepper41@gmail.com";
        const newProfile: UserProfile = {
          uid: u.uid,
          email: u.email || `${u.uid}@demo.com`,
          username: u.displayName || "Marketplace Guest",
          role: isDefaultAdmin ? "admin" : "buyer",
          status: "active",
          createdAt: serverTimestamp(),
        };
        await setDoc(docRef, newProfile);
        setUserProfile(newProfile);
        setRole(newProfile.role);
      }
    } catch (e) {
      console.error("Error setting up/syncing profile layout:", e);
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        await fetchProfile(u);
      } else {
        setUserProfile(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const refreshProfile = async () => {
    if (auth.currentUser) {
      await fetchProfile(auth.currentUser);
    }
  };

  return (
    <AuthContext.Provider value={{ user, role, userProfile, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
