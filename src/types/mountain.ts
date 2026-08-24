// src/types/mountain.ts
// This defines the structure of a Mountain document as it exists in our Firestore database.
// Using TypeScript interfaces helps prevent typos and gives us auto-completion in the editor.

export interface Location {
    latitude: number;
    longitude: number;
  }
  
export interface Mountain {
    id?: string; // Document ID in Firestore
    name: string;
    
    elevationMASL?: number;
    latitude?: number;
    longitude?: number;
    
    region?: string;
    islandGroup?: string;
    
    difficultyLevel?: string;
    trailClass?: string;
    description?: string;
    referenceLink?: string; // Mobile schema

    
    // Approval system fields
    isApproved?: boolean;
    contributorId?: string; // User ID who submitted
    contributorEmail?: string;
    contributorName?: string;
    approvedAt?: any; // Firestore Timestamp or ISO string
    updatedAt?: any; // Firestore Timestamp
    
    // Calibration system fields
    isVerifiedByCommunity?: boolean;
    communityVerifications?: number;
    pendingCalibrationsCount?: number;
  }
