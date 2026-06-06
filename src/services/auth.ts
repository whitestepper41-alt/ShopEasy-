import { auth, db } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";

import { doc, setDoc, serverTimestamp } from "firebase/firestore";

// REGISTER
export const registerUser = async (email: string, password: string, name: string) => {
  const res = await createUserWithEmailAndPassword(auth, email, password);

  // Save user in Firestore
  await setDoc(doc(db, "users", res.user.uid), {
    uid: res.user.uid,
    name,
    username: name,
    email,
    role: "buyer", // default
    status: "active",
    createdAt: serverTimestamp(),
  });

  return res.user;
};

// LOGIN
export const loginUser = async (email: string, password: string) => {
  const res = await signInWithEmailAndPassword(auth, email, password);
  return res.user;
};

// GOOGLE LOGIN
export const googleLogin = async () => {
  const provider = new GoogleAuthProvider();
  const res = await signInWithPopup(auth, provider);

  // Save user if new
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
};

// LOGOUT
export const logoutUser = () => signOut(auth);
