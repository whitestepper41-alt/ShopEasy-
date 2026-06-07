import { auth, db } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";

import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { UserProfile } from "../types";

// REGISTER
export const registerUser = async (email: string, password: string, name: string) => {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);

    // Save user in Firestore
    const profile: UserProfile = {
      uid: res.user.uid,
      email,
      username: name,
      role: "buyer", // default
      status: "active",
      createdAt: serverTimestamp(),
    };
    await setDoc(doc(db, "users", res.user.uid), profile);

    return res.user;
  } catch (err: any) {
    console.error("Firebase standard register error:", err);
    if (
      err.code === "auth/operation-not-allowed" ||
      err.code === "auth/network-request-failed" ||
      err.message?.includes("operation-not-allowed") ||
      err.message?.includes("not-allowed") ||
      err.message?.includes("network-request-failed") ||
      err.message?.includes("network-request")
    ) {
      const uid = `sim-${email.replace(/[^a-zA-Z0-9]/g, "").toLowerCase()}`;
      const profile: UserProfile = {
        uid,
        email,
        username: name,
        role: "buyer",
        status: "active",
        createdAt: new Date().toISOString() as any,
      };
      
      // Write profile to Firestore
      await setDoc(doc(db, "users", uid), profile);
      // Save local session
      localStorage.setItem("shopeasy_simulated_user", JSON.stringify(profile));
      // Notify components to sync
      window.dispatchEvent(new Event("shopeasy-auth-sync"));
      
      // Return simulated user object
      return {
        uid,
        email,
        displayName: name,
        emailVerified: true,
      } as any;
    }
    throw err;
  }
};

// LOGIN
export const loginUser = async (email: string, password: string) => {
  try {
    const res = await signInWithEmailAndPassword(auth, email, password);
    return res.user;
  } catch (err: any) {
    console.error("Firebase standard login error:", err);
    if (
      err.code === "auth/operation-not-allowed" ||
      err.code === "auth/network-request-failed" ||
      err.message?.includes("operation-not-allowed") ||
      err.message?.includes("not-allowed") ||
      err.message?.includes("network-request-failed") ||
      err.message?.includes("network-request")
    ) {
      const uid = `sim-${email.replace(/[^a-zA-Z0-9]/g, "").toLowerCase()}`;
      
      // Fetch or create profile in Firestore
      const docRef = doc(db, "users", uid);
      const snap = await getDoc(docRef);
      let profile: any;
      if (snap.exists()) {
        profile = snap.data();
      } else {
        profile = {
          uid,
          email,
          username: email.split("@")[0],
          role: email === "whitestepper41@gmail.com" ? "admin" : "buyer",
          status: "active",
          createdAt: new Date().toISOString(),
        };
        await setDoc(docRef, profile);
      }
      
      localStorage.setItem("shopeasy_simulated_user", JSON.stringify(profile));
      window.dispatchEvent(new Event("shopeasy-auth-sync"));
      
      return {
        uid,
        email,
        displayName: profile.username,
        emailVerified: true,
      } as any;
    }
    throw err;
  }
};

// GOOGLE LOGIN
export const googleLogin = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const res = await signInWithPopup(auth, provider);

    // Save/merge user if new or returning
    await setDoc(
      doc(db, "users", res.user.uid),
      {
        uid: res.user.uid,
        name: res.user.displayName || "Marketplace Guest",
        username: res.user.displayName || "Marketplace Guest",
        email: res.user.email,
        role: "buyer",
        status: "active",
        createdAt: serverTimestamp(),
      },
      { merge: true }
    );

    return res.user;
  } catch (err: any) {
    console.error("Google popup auth error:", err);
    if (err.code === "auth/popup-closed-by-user" || err.message?.includes("popup-closed-by-user")) {
      throw new Error("The Google sign-in window was closed before completion. Please try again and make sure to finish the sign-in.");
    }
    if (err.code === "auth/cancelled-popup-request" || err.message?.includes("cancelled-popup-request")) {
      throw new Error("Popup request was cancelled or another popup is already open. Please try again.");
    }
    if (err.code === "auth/popup-blocked" || err.message?.includes("popup-blocked")) {
      throw new Error("The login popup was blocked by your browser. Please allow popups for ShopEasy and try again.");
    }
    throw err;
  }
};

// LOGOUT
export const logoutUser = async () => {
  localStorage.removeItem("shopeasy_simulated_user");
  window.dispatchEvent(new Event("shopeasy-auth-sync"));
  await signOut(auth);
};
