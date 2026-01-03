export type CalendarEventType = 'rok' | 'isporuka' | 'montaza' | 'ostalo';

export interface CalendarEvent {
  id: string;
  userId: string;
  title: string;
  type: CalendarEventType;
  startAt: Date;
  endAt: Date | null;
  allDay: boolean;
  description: string | null;
  relatedEntityType: string | null;
  relatedEntityId: string | null;
  clientId: string | null;
  employeeId: string | null;
  location: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface PublicHoliday {
  id: string;
  userId: string;
  countryCode: string;
  date: string;
  name: string;
  isNonWorking: boolean;
  source: 'auto' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export const eventTypeLabels: Record<CalendarEventType, string> = {
  'rok': 'Rok',
  'isporuka': 'Isporuka',
  'montaza': 'Montaža',
  'ostalo': 'Ostalo',
};

export const eventTypeColors: Record<CalendarEventType, string> = {
  'rok': 'bg-amber-500',
  'isporuka': 'bg-blue-500',
  'montaza': 'bg-green-500',
  'ostalo': 'bg-gray-500',
};
