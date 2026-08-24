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
  
  const [difficultyLevel, setDifficultyLevel] = useState(mountain.difficultyLevel || "");
  const [trailClass, setTrailClass] = useState(mountain.trailClass || "");
  const [description, setDescription] = useState(mountain.description || "");
  
  const [region, setRegion] = useState(mountain.region || "");
  const [islandGroup, setIslandGroup] = useState(mountain.islandGroup || "");

  const [contributorId, setContributorId] = useState(mountain.contributorId || "");
  const [contributorEmail, setContributorEmail] = useState(mountain.contributorEmail || "");
  const [contributorName, setContributorName] = useState(mountain.contributorName || "");

  const [pendingCalibrationsCount, setPendingCalibrationsCount] = useState(mountain.pendingCalibrationsCount?.toString() || "0");
  const [communityVerifications, setCommunityVerifications] = useState(mountain.communityVerifications?.toString() || "0");
  const [isVerifiedByCommunity, setIsVerifiedByCommunity] = useState(mountain.isVerifiedByCommunity ?? false);
  
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
        region,
        islandGroup,
        difficultyLevel,
        trailClass,
        description,
        contributorId,
        contributorEmail,
        contributorName,
        pendingCalibrationsCount: parseInt(pendingCalibrationsCount) || 0,
        communityVerifications: parseInt(communityVerifications) || 0,
        isVerifiedByCommunity,
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
      <div className="glass-panel" style={{ padding: '30px', width: '100%', maxWidth: '500px', margin: '20px', maxHeight: '90vh', overflowY: 'auto' }}>
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

          <div style={{ display: 'flex', gap: '15px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '5px', color: 'hsl(var(--text-secondary))', fontSize: '0.9rem' }}>Region</label>
              <input 
                type="text" className="input-field" value={region} onChange={(e) => setRegion(e.target.value)} 
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '5px', color: 'hsl(var(--text-secondary))', fontSize: '0.9rem' }}>Island Group</label>
              <input 
                type="text" className="input-field" value={islandGroup} onChange={(e) => setIslandGroup(e.target.value)} 
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '15px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '5px', color: 'hsl(var(--text-secondary))', fontSize: '0.9rem' }}>Difficulty</label>
              <input 
                type="text" className="input-field" value={difficultyLevel} onChange={(e) => setDifficultyLevel(e.target.value)} placeholder="e.g., 4/9"
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '5px', color: 'hsl(var(--text-secondary))', fontSize: '0.9rem' }}>Trail Class</label>
              <input 
                type="text" className="input-field" value={trailClass} onChange={(e) => setTrailClass(e.target.value)} placeholder="e.g., Class 1-2"
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', color: 'hsl(var(--text-secondary))', fontSize: '0.9rem' }}>Description</label>
            <textarea 
              className="input-field" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '5px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input 
                type="checkbox" id="isApproved" checked={isApproved} onChange={(e) => setIsApproved(e.target.checked)} 
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <label htmlFor="isApproved" style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.9rem', cursor: 'pointer' }}>Approved Peak</label>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input 
                type="checkbox" id="isVerifiedByCommunity" checked={isVerifiedByCommunity} onChange={(e) => setIsVerifiedByCommunity(e.target.checked)} 
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <label htmlFor="isVerifiedByCommunity" style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.9rem', cursor: 'pointer' }}>Community Verified (GPS)</label>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '15px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '5px', color: 'hsl(var(--text-secondary))', fontSize: '0.9rem' }}>Contributor Name</label>
              <input 
                type="text" className="input-field" value={contributorName} onChange={(e) => setContributorName(e.target.value)} 
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '5px', color: 'hsl(var(--text-secondary))', fontSize: '0.9rem' }}>Contributor Email</label>
              <input 
                type="text" className="input-field" value={contributorEmail} onChange={(e) => setContributorEmail(e.target.value)} 
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '15px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '5px', color: 'hsl(var(--text-secondary))', fontSize: '0.9rem' }}>Contributor ID</label>
              <input 
                type="text" className="input-field" value={contributorId} onChange={(e) => setContributorId(e.target.value)} 
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '5px', color: 'hsl(var(--text-secondary))', fontSize: '0.9rem' }}>Community Verifications</label>
              <input 
                type="number" className="input-field" value={communityVerifications} onChange={(e) => setCommunityVerifications(e.target.value)} 
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', color: 'hsl(var(--text-secondary))', fontSize: '0.9rem' }}>Pending Calibrations Count</label>
            <input 
              type="number" className="input-field" value={pendingCalibrationsCount} onChange={(e) => setPendingCalibrationsCount(e.target.value)} 
            />
          </div>

          <div style={{ padding: '15px', background: 'hsla(var(--surface), 0.5)', borderRadius: '8px', marginTop: '10px' }}>
            <h4 style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Read-Only Metadata</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: 'hsl(var(--text-secondary))', display: 'block' }}>Document ID</span>
                <span style={{ fontFamily: 'monospace' }}>{mountain.id}</span>
              </div>
              <div>
                <span style={{ color: 'hsl(var(--text-secondary))', display: 'block' }}>Created / Approved At</span>
                <span>{mountain.approvedAt ? new Date(mountain.approvedAt.seconds * 1000).toLocaleString() : 'N/A'}</span>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <span style={{ color: 'hsl(var(--text-secondary))', display: 'block' }}>Last Updated</span>
                <span>{mountain.updatedAt ? new Date(mountain.updatedAt.seconds * 1000).toLocaleString() : 'N/A'}</span>
              </div>
            </div>
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
