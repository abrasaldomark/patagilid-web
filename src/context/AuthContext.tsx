"use client";

// src/context/AuthContext.tsx
// This file sets up a React Context to manage authentication state globally.
// This allows any component in our app to easily access the current logged-in user.

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { auth } from "@/firebase/config";

// We define the shape of our context data using TypeScript.
// It includes the current user (if any), a loading state, and our login/logout functions.
interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

// We create the context with an initial undefined value.
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// The AuthProvider component wraps our app and provides the authentication state to all its children.
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // useEffect runs once when the component mounts.
  // We use it to set up an observer on the Firebase auth state.
  useEffect(() => {
    // onAuthStateChanged fires whenever the user logs in or out.
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      // Once we know the auth state (either user or null), we are no longer loading.
      setLoading(false);
    });

    // We return the unsubscribe function to clean up the listener if this component unmounts.
    return () => unsubscribe();
  }, []);

  // Function to handle Google sign-in
  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google", error);
      // In a real app, you might want to show a toast or alert to the user here.
    }
  };

  // Function to handle signing out
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  // We provide the state and functions to the rest of the app via the context Provider.
  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// A custom hook to make it easy for other components to access the auth context.
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
