"use client";

// src/components/EditMountainModal.tsx
// This component provides a glassmorphic modal overlay to edit a mountain's details.

import React, { useState } from "react";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase/config";
import { Mountain } from "@/types/mountain";

interface EditMountainModalProps {
  mountain: Mountain;
  onClose: () => void;
  onSaved: () => void;
}

export default function EditMountainModal({ mountain, onClose, onSaved }: EditMountainModalProps) {
  const [name, setName] = useState(mountain.name || "");
  const [elevation, setElevation] = useState(mountain.elevationMASL?.toString() || "");
  const [latitude, setLatitude] = useState(mountain.latitude?.toString() || "");
  const [longitude, setLongitude] = useState(mountain.longitude?.toString() || "");
  const [referenceUrl, setReferenceUrl] = useState(mountain.referenceLink ?? "");
  const [isApproved, setIsApproved] = useState(mountain.isApproved ?? true);
  
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mountain.id) return;
    
    setIsSaving(true);
    setError(null);

    try {
      // Create a reference to the specific mountain document
      const mountainRef = doc(db, "mountains", mountain.id);
      
      const parsedElev = parseFloat(elevation);
      const parsedLat = parseFloat(latitude);
      const parsedLon = parseFloat(longitude);
      
      // We update the document with the new values using strictly the mobile schema.
      const updateData: any = {
        name,
        elevationMASL: parsedElev,
        latitude: parsedLat,
        longitude: parsedLon,
        referenceLink: referenceUrl,
        isApproved,
        updatedAt: serverTimestamp() // Set the Last Updated time automatically
      };
      
      // If it's being approved for the first time
      if (isApproved && !mountain.isApproved) {
        updateData.approvedAt = serverTimestamp();
      }

      await updateDoc(mountainRef, updateData);

      // Call the success callback
      onSaved();
    } catch (err: any) {
      console.error("Error updating mountain", err);
      setError(err.message || "Failed to update mountain.");
      setIsSaving(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      zIndex: 1000
    }}>
      <div className="glass-panel" style={{ padding: '30px', width: '100%', maxWidth: '500px', margin: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Edit Mountain</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'hsl(var(--text-secondary))', cursor: 'pointer', fontSize: '1.2rem' }}>
            &times;
          </button>
        </div>

        {error && <div style={{ color: 'hsl(var(--danger))', marginBottom: '15px' }}>{error}</div>}

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', color: 'hsl(var(--text-secondary))', fontSize: '0.9rem' }}>Name</label>
            <input 
              type="text" className="input-field" value={name} onChange={(e) => setName(e.target.value)} required 
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', color: 'hsl(var(--text-secondary))', fontSize: '0.9rem' }}>Elevation (m)</label>
            <input 
              type="number" className="input-field" value={elevation} onChange={(e) => setElevation(e.target.value)} required 
            />
          </div>

          <div style={{ display: 'flex', gap: '15px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '5px', color: 'hsl(var(--text-secondary))', fontSize: '0.9rem' }}>Latitude</label>
              <input 
                type="number" step="any" className="input-field" value={latitude} onChange={(e) => setLatitude(e.target.value)} required 
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '5px', color: 'hsl(var(--text-secondary))', fontSize: '0.9rem' }}>Longitude</label>
              <input 
                type="number" step="any" className="input-field" value={longitude} onChange={(e) => setLongitude(e.target.value)} required 
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', color: 'hsl(var(--text-secondary))', fontSize: '0.9rem' }}>Reference URL</label>
            <input 
              type="url" className="input-field" value={referenceUrl} onChange={(e) => setReferenceUrl(e.target.value)} 
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={onClose} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid var(--border)', color: 'white', borderRadius: '8px', cursor: 'pointer' }}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
