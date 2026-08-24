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
    
    difficulty?: string;
    description?: string;
    referenceLink?: string; // Mobile schema


    
    // Approval system fields
    isApproved?: boolean;
    submittedBy?: string; // User ID who submitted
    approvedAt?: any; // Firestore Timestamp or ISO string
    updatedAt?: any; // Firestore Timestamp
    
    // Calibration system fields
    pendingCalibrationsCount?: number;
  }
