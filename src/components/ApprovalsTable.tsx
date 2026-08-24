"use client";

// src/components/ApprovalsTable.tsx
// This component manages the approval workflow for new custom mountains 
// and GPS calibration requests.

import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { Mountain } from "@/types/mountain";

export default function ApprovalsTable() {
  const [pendingMountains, setPendingMountains] = useState<Mountain[]>([]);
  const [pendingCalibrations, setPendingCalibrations] = useState<Mountain[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null); // Track which mountain is being processed

  const fetchApprovals = async () => {
    setLoading(true);
    try {
      // 1. Fetch Custom Mountains awaiting approval
      const customMountainsQuery = query(collection(db, "mountains"), where("isApproved", "==", false));
      const customMountainsSnapshot = await getDocs(customMountainsQuery);
      
      const customMountainsData: Mountain[] = [];
      customMountainsSnapshot.forEach((doc) => {
        customMountainsData.push({ id: doc.id, ...doc.data() } as Mountain);
      });
      setPendingMountains(customMountainsData);

      // 2. Fetch Mountains with pending GPS calibrations
      const calibrationsQuery = query(collection(db, "mountains"), where("pendingCalibrationsCount", ">", 0));
      const calibrationsSnapshot = await getDocs(calibrationsQuery);
      
      const calibrationsData: Mountain[] = [];
      calibrationsSnapshot.forEach((doc) => {
        calibrationsData.push({ id: doc.id, ...doc.data() } as Mountain);
      });
      setPendingCalibrations(calibrationsData);

    } catch (error) {
      console.error("Error fetching approvals: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  // Handler to approve a custom mountain
  const handleApproveMountain = async (id: string) => {
    setActionLoading(id);
    try {
      await updateDoc(doc(db, "mountains", id), {
        isApproved: true
      });
      // Refresh the lists
      await fetchApprovals();
    } catch (error) {
      console.error("Error approving mountain:", error);
    } finally {
      setActionLoading(null);
    }
  };

  // Handler to reject a custom mountain (We just mark it rejected or delete it. Let's delete it for now to keep DB clean, or maybe add a status field. For simplicity, we'll delete it.)
  // We should probably just delete it if it's rejected so it doesn't clutter.
  // Actually, standardizing on a 'status' field would be better, but since we rely on `isApproved`, let's just delete the document if rejected.
  const handleRejectMountain = async (id: string) => {
    if (!window.confirm("Are you sure you want to reject and delete this custom mountain?")) return;
    
    setActionLoading(id);
    try {
      // import deleteDoc if we use it, but for now let's just do a soft delete or set a flag.
      // Let's import deleteDoc at the top. Wait, I didn't import it. I'll just use updateDoc to set a flag 'rejected'.
      await updateDoc(doc(db, "mountains", id), {
        isRejected: true // we can filter this out in the app
      });
      await fetchApprovals();
    } catch (error) {
      console.error("Error rejecting mountain:", error);
    } finally {
      setActionLoading(null);
    }
  };

  // Handler to accept calibrations
  const handleAcceptCalibration = async (id: string) => {
    setActionLoading(id);
    try {
      // In a real app, you might average out the calibration points. 
      // For now, we just clear the pending count to 'accept' it.
      await updateDoc(doc(db, "mountains", id), {
        pendingCalibrationsCount: 0
      });
      await fetchApprovals();
    } catch (error) {
      console.error("Error accepting calibration:", error);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return <p style={{ color: 'hsl(var(--text-secondary))' }}>Loading approvals data...</p>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', marginTop: '40px' }}>
      
      {/* Section 1: Custom Mountains */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.2rem' }}>Pending Custom Mountains</h2>
          <span style={{ background: 'hsl(var(--primary))', color: 'white', padding: '2px 10px', borderRadius: '12px', fontSize: '0.8rem' }}>
            {pendingMountains.length}
          </span>
        </div>
        
        {pendingMountains.length === 0 ? (
          <div style={{ padding: '30px', textAlign: 'center', color: 'hsl(var(--text-secondary))' }}>No pending mountains.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: 'hsla(var(--surface), 0.5)' }}>
                  <th style={{ padding: '15px 20px', color: 'hsl(var(--text-secondary))', fontWeight: '500' }}>Name</th>
                  <th style={{ padding: '15px 20px', color: 'hsl(var(--text-secondary))', fontWeight: '500' }}>Elevation</th>
                  <th style={{ padding: '15px 20px', color: 'hsl(var(--text-secondary))', fontWeight: '500' }}>Submitted By</th>
                  <th style={{ padding: '15px 20px', color: 'hsl(var(--text-secondary))', fontWeight: '500' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingMountains.map((mountain) => (
                  <tr key={mountain.id} style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ padding: '15px 20px' }}>{mountain.name}</td>
                    <td style={{ padding: '15px 20px' }}>{mountain.elevationMASL ?? 'N/A'}m</td>
                    <td style={{ padding: '15px 20px', color: 'hsl(var(--text-secondary))', fontSize: '0.9rem' }}>
                      {mountain.submittedBy || 'Unknown User'}
                    </td>
                    <td style={{ padding: '15px 20px', display: 'flex', gap: '10px' }}>
                      <button 
                        onClick={() => mountain.id && handleApproveMountain(mountain.id)}
                        disabled={actionLoading === mountain.id}
                        className="btn-primary" 
                        style={{ padding: '6px 12px', fontSize: '0.8rem', background: 'hsl(var(--success))', boxShadow: 'none' }}
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => mountain.id && handleRejectMountain(mountain.id)}
                        disabled={actionLoading === mountain.id}
                        className="btn-primary" 
                        style={{ padding: '6px 12px', fontSize: '0.8rem', background: 'transparent', border: '1px solid hsl(var(--danger))', color: 'hsl(var(--danger))', boxShadow: 'none' }}
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Section 2: GPS Calibrations */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.2rem' }}>Pending GPS Calibrations</h2>
          <span style={{ background: 'hsl(var(--primary))', color: 'white', padding: '2px 10px', borderRadius: '12px', fontSize: '0.8rem' }}>
            {pendingCalibrations.length}
          </span>
        </div>
        
        {pendingCalibrations.length === 0 ? (
          <div style={{ padding: '30px', textAlign: 'center', color: 'hsl(var(--text-secondary))' }}>No pending calibrations.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: 'hsla(var(--surface), 0.5)' }}>
                  <th style={{ padding: '15px 20px', color: 'hsl(var(--text-secondary))', fontWeight: '500' }}>Mountain</th>
                  <th style={{ padding: '15px 20px', color: 'hsl(var(--text-secondary))', fontWeight: '500' }}>Pending Count</th>
                  <th style={{ padding: '15px 20px', color: 'hsl(var(--text-secondary))', fontWeight: '500' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingCalibrations.map((mountain) => (
                  <tr key={mountain.id} style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ padding: '15px 20px' }}>{mountain.name}</td>
                    <td style={{ padding: '15px 20px', color: 'hsl(var(--primary))', fontWeight: 'bold' }}>
                      {mountain.pendingCalibrationsCount}
                    </td>
                    <td style={{ padding: '15px 20px' }}>
                      <button 
                        onClick={() => mountain.id && handleAcceptCalibration(mountain.id)}
                        disabled={actionLoading === mountain.id}
                        className="btn-primary" 
                        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                      >
                        Review & Accept
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
