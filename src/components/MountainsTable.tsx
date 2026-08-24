"use client";

// src/components/MountainsTable.tsx
// This component displays a list of all approved mountains in a beautiful, glassmorphic table.
// It also provides a way to edit a mountain.

import React, { useEffect, useState } from "react";
import { collection, query, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { Mountain } from "@/types/mountain";
import EditMountainModal from "./EditMountainModal";

export default function MountainsTable() {
  const [mountains, setMountains] = useState<Mountain[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Sorting State
  type SortField = "name" | "elevation" | "status" | "updatedAt";
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  
  // State for controlling the Edit Modal
  const [editingMountain, setEditingMountain] = useState<Mountain | null>(null);

  // We abstract the fetching logic into a function so we can call it initially AND after an edit
  const fetchMountains = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "mountains"));
      const querySnapshot = await getDocs(q);
      
      const fetchedMountains: Mountain[] = [];
      querySnapshot.forEach((doc) => {
        fetchedMountains.push({ id: doc.id, ...doc.data() } as Mountain);
      });

      fetchedMountains.sort((a, b) => a.name.localeCompare(b.name));
      setMountains(fetchedMountains);
    } catch (error) {
      console.error("Error fetching mountains: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMountains();
  }, []);

  const handleEditClick = (mountain: Mountain) => {
    setEditingMountain(mountain);
  };

  const handleModalClose = () => {
    setEditingMountain(null);
  };

  const handleModalSaved = () => {
    setEditingMountain(null);
    fetchMountains(); // Refresh the table data
  };

  const handleDeleteClick = async (mountainId: string, mountainName: string) => {
    if (window.confirm(`Are you sure you want to delete ${mountainName}? This action cannot be undone.`)) {
      try {
        await deleteDoc(doc(db, "mountains", mountainId));
        fetchMountains(); // Refresh the table data after deletion
      } catch (error) {
        console.error("Error deleting mountain:", error);
        alert("Failed to delete mountain. Ensure you have permission.");
      }
    }
  };

  if (loading && mountains.length === 0) {
    return <p style={{ color: 'hsl(var(--text-secondary))' }}>Loading mountains data...</p>;
  }

  // Filter mountains based on search query (case-insensitive)
  let processedMountains = mountains.filter(mountain => 
    mountain.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort mountains
  processedMountains.sort((a, b) => {
    let comparison = 0;
    if (sortField === "name") {
      comparison = a.name.localeCompare(b.name);
    } else if (sortField === "elevation") {
      const aElev = a.elevationMASL ?? 0;
      const bElev = b.elevationMASL ?? 0;
      comparison = aElev - bElev;
    } else if (sortField === "status") {
      const aStatus = a.isApproved === false ? 0 : 1;
      const bStatus = b.isApproved === false ? 0 : 1;
      comparison = aStatus - bStatus;
    } else if (sortField === "updatedAt") {
      // Sort by updated time (using Firebase timestamp seconds)
      const aTime = a.updatedAt?.seconds || 0;
      const bTime = b.updatedAt?.seconds || 0;
      return sortDirection === "asc" ? aTime - bTime : bTime - aTime;
    }
    return sortDirection === "asc" ? comparison : -comparison;
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return " ↕";
    return sortDirection === "asc" ? " ↑" : " ↓";
  };

  return (
    <div className="glass-panel" style={{ overflow: 'hidden', marginTop: '20px' }}>
      <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <h2 style={{ fontSize: '1.2rem' }}>All Mountains</h2>
        </div>
        <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
          <input 
            type="text" 
            placeholder="Search mountains..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field"
            style={{ paddingLeft: '35px' }}
          />
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>
            🔍
          </span>
        </div>
      </div>
      
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'hsla(var(--surface), 0.5)' }}>
              <th 
                onClick={() => handleSort("name")}
                style={{ padding: '15px 20px', color: 'hsl(var(--text-secondary))', fontWeight: '500', cursor: 'pointer', userSelect: 'none' }}
              >
                Name{getSortIcon("name")}
              </th>
              <th 
                onClick={() => handleSort("elevation")}
                style={{ padding: '15px 20px', color: 'hsl(var(--text-secondary))', fontWeight: '500', cursor: 'pointer', userSelect: 'none' }}
              >
                Elevation (MASL){getSortIcon("elevation")}
              </th>
              <th style={{ padding: '15px 20px', color: 'hsl(var(--text-secondary))', fontWeight: '500' }}>Location</th>
              <th 
                onClick={() => handleSort("status")}
                style={{ padding: '15px 20px', color: 'hsl(var(--text-secondary))', fontWeight: '500', cursor: 'pointer', userSelect: 'none' }}
              >
                Status{getSortIcon("status")}
              </th>
              <th 
                onClick={() => handleSort("updatedAt")}
                style={{ padding: '15px 20px', color: 'hsl(var(--text-secondary))', fontWeight: '500', cursor: 'pointer', userSelect: 'none' }}
              >
                Last Updated{getSortIcon("updatedAt")}
              </th>
              <th style={{ padding: '15px 20px', color: 'hsl(var(--text-secondary))', fontWeight: '500' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {processedMountains.length > 0 ? (
              processedMountains.map((mountain) => (
                <tr key={mountain.id} style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ padding: '15px 20px' }}>{mountain.name}</td>
                  <td style={{ padding: '15px 20px' }}>
                    {mountain.elevationMASL != null ? `${mountain.elevationMASL}m` : <span style={{ color: 'hsl(var(--text-secondary))' }}>N/A</span>}
                  </td>
                  <td style={{ padding: '15px 20px', color: 'hsl(var(--text-secondary))' }}>
                    {mountain.latitude != null && mountain.longitude != null 
                      ? (
                          <a 
                            href={`https://www.google.com/maps?q=${mountain.latitude},${mountain.longitude}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ color: 'hsl(var(--primary))', textDecoration: 'underline' }}
                          >
                            {mountain.latitude.toFixed(4)}, {mountain.longitude.toFixed(4)}
                          </a>
                        )
                      : 'N/A'}
                  </td>
                  <td style={{ padding: '15px 20px' }}>
                    {mountain.isApproved === false ? (
                      <span style={{ color: 'hsl(var(--danger))', fontSize: '0.85rem', padding: '4px 8px', borderRadius: '4px', backgroundColor: 'hsla(var(--danger), 0.1)' }}>Pending</span>
                    ) : (
                      <span style={{ color: 'hsl(var(--success))', fontSize: '0.85rem', padding: '4px 8px', borderRadius: '4px', backgroundColor: 'hsla(var(--success), 0.1)' }}>Approved</span>
                    )}
                  </td>
                  <td style={{ padding: '15px 20px', color: 'hsl(var(--text-secondary))', fontSize: '0.9rem' }}>
                    {mountain.updatedAt ? new Date(mountain.updatedAt.seconds * 1000).toLocaleString() : '-'}
                  </td>
                  <td style={{ padding: '15px 20px', display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => handleEditClick(mountain)}
                      className="btn-primary" 
                      style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(mountain.id, mountain.name)}
                      className="btn-primary" 
                      style={{ padding: '6px 12px', fontSize: '0.8rem', background: 'hsl(var(--danger))', color: '#fff', border: 'none', boxShadow: 'none' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} style={{ padding: '30px', textAlign: 'center', color: 'hsl(var(--text-secondary))' }}>
                  No mountains found matching "{searchQuery}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 
        If editingMountain is not null, it means the user clicked 'Edit' on a mountain.
        We render the modal overlay and pass down the necessary props.
      */}
      {editingMountain && (
        <EditMountainModal 
          mountain={editingMountain} 
          onClose={handleModalClose} 
          onSaved={handleModalSaved} 
        />
      )}
    </div>
  );
}
