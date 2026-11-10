export type Role = "patient" | "admin";

export type InteractionSeverity = "ringan" | "sedang" | "berat" | "tidak diketahui";

export type ConsumptionStatus = "ditempuh" | "lewat" | "dilewati";

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: "laki-laki" | "perempuan" | "";
  role: Role;
  profilePicture?: string;
  createdAt: string;
}

export interface Session {
  userId: string;
  token: string;
  expiresAt: string;
}

export interface NotificationPreferences {
  reminders: boolean;
  email: boolean;
  sms: boolean;
}

export interface MedicationPreferences {
  preferredLanguage: "id";
  units: "metric";
}

export interface Profile extends User {
  notificationPreferences: NotificationPreferences;
  medicationPreferences: MedicationPreferences;
  updatedAt: string;
}

export interface Medication {
  id: string;
  name: string;
  genericName: string;
  brand: string;
  category: string;
  description: string;
  uses: string[];
  dosageForm: string;
  strength: string;
  sideEffects: string[];
  contraindications: string[];
  storage: string;
  imageUrl?: string;
  isPrescription: boolean;
  createdAt: string;
}

export interface Interaction {
  id: string;
  medicationA: string;
  medicationB: string;
  severity: InteractionSeverity;
  description: string;
  recommendation: string;
  createdAt: string;
  source?: string;
  ddinterId?: string;
  originalSeverity?: string;
}

export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  distance: string;
  rating: number;
  isOpen: boolean;
  services: string[];
  imageUrl?: string;
  createdAt?: string;
}

export interface Guide {
  id: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  tags: string[];
  imageUrl?: string;
  image?: File | null;
  createdAt?: string;
}

export interface Reminder {
  id: string;
  userId: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  time: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  createdAt: string;
}

export interface ConsumptionHistory {
  id: string;
  userId: string;
  medicationName: string;
  dosage: string;
  takenAt: string;
  status: ConsumptionStatus;
  note?: string;
}

export interface DemoAccount {
  email: string;
  password: string;
  role: Role;
  fullName: string;
}
