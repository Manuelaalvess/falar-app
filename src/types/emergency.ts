export interface EmergencyContact {
  id: string;
  name: string;
  relation: string;
  phone: string;
  emoji: string;
}

export interface EmergencySosAlert {
  id: string;
  contactId: string;
  contactName: string;
  mapsUrl: string | null;
  timestamp: number;
}
