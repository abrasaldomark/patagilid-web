"use client";

// src/app/page.tsx
// This is the main entry point (home page) of our Next.js application.
// We use the "use client" directive because we are utilizing React hooks (useAuth).

import React from "react";
import { useAuth } from "@/context/AuthContext";
import MountainsTable from "@/components/MountainsTable";
import ApprovalsTable from "@/components/ApprovalsTable";

export default function Home() {
  // We extract the authentication state from our custom context hook.
  const { user, loading, loginWithGoogle, logout } = useAuth();

  // 1. Loading State
  // While Firebase is figuring out if we are logged in, we show a simple loading indicator.
  if (loading) {
    return (
      <main style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}>
        <p>Loading PataGilid Admin...</p>
      </main>
    );
  }

  // 2. Unauthenticated State (Login Screen)
  // If there is no user logged in, we display the login UI.
  if (!user) {
    return (
      <main style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}>
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', maxWidth: '400px' }}>
          <h1 style={{ marginBottom: '10px' }}>PataGilid Admin</h1>
          <p style={{ color: 'hsl(var(--text-secondary))', marginBottom: '30px' }}>
            Please sign in with your Google account to access the dashboard.
          </p>
          <button onClick={loginWithGoogle} className="btn-primary" style={{ width: '100%' }}>
            Sign in with Google
          </button>
        </div>
        {/* The mesh background is applied globally via layout or here to add visual flair */}
        <div className="bg-mesh"></div>
      </main>
    );
  }

  // 3. Admin Verification
  // We hard-block access to only the authorized admin emails.
  const ADMIN_EMAILS = ["devmarkabrasaldo@gmail.com", "abrasaldomark@gmail.com"];
  
  if (user.email && !ADMIN_EMAILS.includes(user.email)) {
    return (
      <main style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', maxWidth: '400px' }}>
          <h2 style={{ color: 'hsl(var(--danger))', marginBottom: '15px' }}>Access Denied</h2>
          <p style={{ color: 'hsl(var(--text-secondary))', marginBottom: '25px' }}>
            Your account ({user.email}) does not have administrative privileges for this dashboard.
          </p>
          <button onClick={logout} className="btn-primary" style={{ width: '100%', background: 'transparent', border: '1px solid hsl(var(--danger))', color: 'hsl(var(--danger))', boxShadow: 'none' }}>
            Sign Out
          </button>
        </div>
        <div className="bg-mesh"></div>
      </main>
    );
  }

  // 4. Authenticated State (Dashboard Home)
  // If the user is logged in (and verified), they see the actual dashboard content.
  return (
    <main style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="bg-mesh"></div>
      
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <h1>Dashboard</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ color: 'hsl(var(--text-secondary))' }}>{user.email}</span>
          <button onClick={logout} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
            Sign Out
          </button>
        </div>
      </header>

      {/* 
        We render the ApprovalsTable to handle pending custom mountains and calibrations.
      */}
      <ApprovalsTable />

      {/* 
        This is where we render the MountainsTable component.
        It encapsulates all the logic for fetching and displaying our data.
      */}
      <MountainsTable />
    </main>
  );
}
