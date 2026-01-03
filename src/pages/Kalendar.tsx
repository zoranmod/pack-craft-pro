import { useState, useMemo, useEffect } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO,
  startOfDay,
  addWeeks,
  subWeeks,
} from 'date-fns';
import { hr } from 'date-fns/locale';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  List,
  Grid3X3,
  Columns,
  Filter,
  MapPin,
  Clock,
  FileText,
  Truck,
  Wrench,
  Flag,
  Star,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toggle } from '@/components/ui/toggle';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { useCalendarEvents, useCreateCalendarEvent, useUpdateCalendarEvent, useDeleteCalendarEvent } from '@/hooks/useCalendarEvents';
import { usePublicHolidays, useEnsureHolidays } from '@/hooks/usePublicHolidays';
import { CalendarEvent, CalendarEventType, eventTypeLabels, eventTypeColors, PublicHoliday } from '@/types/calendar';
import { useNavigate } from 'react-router-dom';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';

type ViewMode = 'month' | 'week' | 'day' | 'agenda';

const Kalendar = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);
  
  // Filters
  const [showRok, setShowRok] = useState(true);
  const [showIsporuka, setShowIsporuka] = useState(true);
  const [showMontaza, setShowMontaza] = useState(true);
  const [showHolidays, setShowHolidays] = useState(true);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    type: 'ostalo' as CalendarEventType,
    startAt: '',
    endAt: '',
    allDay: true,
    description: '',
    location: '',
  });

  const currentYear = currentDate.getFullYear();
  
  // Calculate date range based on view
  const dateRange = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    return {
      start: startOfWeek(monthStart, { weekStartsOn: 1 }),
      end: endOfWeek(monthEnd, { weekStartsOn: 1 }),
    };
  }, [currentDate]);

  const { data: events = [], isLoading: eventsLoading } = useCalendarEvents(dateRange.start, dateRange.end);
  const { data: holidays = [], isLoading: holidaysLoading } = usePublicHolidays(currentYear);
  const ensureHolidays = useEnsureHolidays();
  const createEvent = useCreateCalendarEvent();
  const updateEvent = useUpdateCalendarEvent();
  const deleteEvent = useDeleteCalendarEvent();

  // Ensure holidays exist for current year
  useEffect(() => {
    if (currentYear) {
      ensureHolidays.mutate(currentYear);
    }
  }, [currentYear]);

  // Filter events based on toggles
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      if (event.type === 'rok' && !showRok) return false;
      if (event.type === 'isporuka' && !showIsporuka) return false;
      if (event.type === 'montaza' && !showMontaza) return false;
      return true;
    });
  }, [events, showRok, showIsporuka, showMontaza]);

  // Get events for a specific day
  const getEventsForDay = (date: Date) => {
    return filteredEvents.filter(event => isSameDay(event.startAt, date));
  };

  // Get holiday for a specific day
  const getHolidayForDay = (date: Date): PublicHoliday | undefined => {
    if (!showHolidays) return undefined;
    const dateStr = format(date, 'yyyy-MM-dd');
    return holidays.find(h => h.date === dateStr);
  };

  // Navigate between periods
  const goToPrevious = () => {
    if (viewMode === 'month') {
      setCurrentDate(subMonths(currentDate, 1));
    } else if (viewMode === 'week') {
      setCurrentDate(subWeeks(currentDate, 1));
    } else {
      setCurrentDate(addDays(currentDate, -1));
    }
  };

  const goToNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    } else if (viewMode === 'week') {
      setCurrentDate(addWeeks(currentDate, 1));
    } else {
      setCurrentDate(addDays(currentDate, 1));
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Handle event click
  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setFormData({
      title: event.title,
      type: event.type,
      startAt: format(event.startAt, "yyyy-MM-dd'T'HH:mm"),
      endAt: event.endAt ? format(event.endAt, "yyyy-MM-dd'T'HH:mm") : '',
      allDay: event.allDay,
      description: event.description || '',
      location: event.location || '',
    });
    setIsCreateMode(false);
    setIsEventDialogOpen(true);
  };

  // Handle day click to create new event
  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setFormData({
      title: '',
      type: 'ostalo',
      startAt: format(date, "yyyy-MM-dd'T'09:00"),
      endAt: '',
      allDay: true,
      description: '',
      location: '',
    });
    setSelectedEvent(null);
    setIsCreateMode(true);
    setIsEventDialogOpen(true);
  };

  // Handle create new button
  const handleCreateNew = () => {
    const today = new Date();
    setFormData({
      title: '',
      type: 'ostalo',
      startAt: format(today, "yyyy-MM-dd'T'09:00"),
      endAt: '',
      allDay: true,
      description: '',
      location: '',
    });
    setSelectedEvent(null);
    setIsCreateMode(true);
    setIsEventDialogOpen(true);
  };

  // Save event
  const handleSaveEvent = () => {
    if (!formData.title || !formData.startAt) return;

    const eventData = {
      title: formData.title,
      type: formData.type,
      startAt: new Date(formData.startAt),
      endAt: formData.endAt ? new Date(formData.endAt) : null,
      allDay: formData.allDay,
      description: formData.description || undefined,
      location: formData.location || undefined,
    };

    if (isCreateMode) {
      createEvent.mutate(eventData, {
        onSuccess: () => setIsEventDialogOpen(false),
      });
    } else if (selectedEvent) {
      updateEvent.mutate(
        { id: selectedEvent.id, ...eventData },
        { onSuccess: () => setIsEventDialogOpen(false) }
      );
    }
  };

  // Delete event
  const handleDeleteEvent = () => {
    if (selectedEvent) {
      deleteEvent.mutate(selectedEvent.id, {
        onSuccess: () => setIsEventDialogOpen(false),
      });
    }
  };

  // Navigate to related document
  const handleNavigateToDocument = () => {
    if (selectedEvent?.relatedEntityId) {
      navigate(`/documents/${selectedEvent.relatedEntityId}`);
    }
  };

  // Render calendar grid
  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const days: Date[] = [];
    let day = startDate;
    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }

    const weekDays = ['Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub', 'Ned'];

    return (
      <div className="bg-card rounded-lg border">
        <div className="grid grid-cols-7 border-b">
          {weekDays.map((dayName, i) => (
            <div
              key={dayName}
              className={cn(
                "py-2 text-center text-sm font-medium text-muted-foreground",
                i === 5 || i === 6 ? "text-red-500/70" : ""
              )}
            >
              {dayName}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((date, i) => {
            const dayEvents = getEventsForDay(date);
            const holiday = getHolidayForDay(date);
            const isCurrentMonth = isSameMonth(date, currentDate);
            const isSunday = date.getDay() === 0;
            const isSaturday = date.getDay() === 6;

            return (
              <div
                key={i}
                onClick={() => handleDayClick(date)}
                className={cn(
                  "min-h-[100px] border-b border-r p-1 cursor-pointer hover:bg-muted/50 transition-colors",
                  !isCurrentMonth && "bg-muted/20 text-muted-foreground",
                  (isSunday || isSaturday) && "bg-muted/30",
                  holiday && "bg-rose-50 dark:bg-rose-950/20"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={cn(
                      "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full",
                      isToday(date) && "bg-primary text-primary-foreground",
                      (isSunday || isSaturday) && !isToday(date) && "text-red-500"
                    )}
                  >
                    {format(date, 'd')}
                  </span>
                  {holiday && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="p-0.5">
                          <Star className="h-3.5 w-3.5 text-rose-500 fill-rose-500" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-2">
                        <p className="text-sm font-medium">{holiday.name}</p>
                        <p className="text-xs text-muted-foreground">Neradni dan</p>
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
                <div className="space-y-0.5">
                  {dayEvents.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEventClick(event);
                      }}
                      className={cn(
                        "text-xs px-1.5 py-0.5 rounded truncate text-white cursor-pointer hover:opacity-80",
                        eventTypeColors[event.type]
                      )}
                    >
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-muted-foreground px-1">
                      +{dayEvents.length - 3} više
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render agenda/list view
  const renderAgendaView = () => {
    const sortedEvents = [...filteredEvents].sort(
      (a, b) => a.startAt.getTime() - b.startAt.getTime()
    );

    const groupedByDate = sortedEvents.reduce((acc, event) => {
      const dateKey = format(event.startAt, 'yyyy-MM-dd');
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(event);
      return acc;
    }, {} as Record<string, CalendarEvent[]>);

    // Also add holidays to agenda
    const holidayDates = holidays
      .filter(h => showHolidays)
      .reduce((acc, h) => {
        acc[h.date] = h;
        return acc;
      }, {} as Record<string, PublicHoliday>);

    const allDates = [...new Set([...Object.keys(groupedByDate), ...Object.keys(holidayDates)])].sort();

    if (allDates.length === 0) {
      return (
        <Card>
          <CardContent className="py-12 text-center">
            <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nema događaja za prikaz</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        {allDates.map((dateKey) => {
          const dayEvents = groupedByDate[dateKey] || [];
          const holiday = holidayDates[dateKey];
          const date = parseISO(dateKey);

          return (
            <Card key={dateKey}>
              <CardHeader className="py-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <span
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm",
                      isToday(date) ? "bg-primary text-primary-foreground" : "bg-muted"
                    )}
                  >
                    {format(date, 'd')}
                  </span>
                  <span>{format(date, 'EEEE, d. MMMM yyyy.', { locale: hr })}</span>
                  {holiday && (
                    <Badge variant="outline" className="ml-auto text-rose-600 border-rose-300">
                      <Star className="h-3 w-3 mr-1 fill-rose-500" />
                      {holiday.name}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              {dayEvents.length > 0 && (
                <CardContent className="pt-0 space-y-2">
                  {dayEvents.map((event) => (
                    <div
                      key={event.id}
                      onClick={() => handleEventClick(event)}
                      className="flex items-center gap-3 p-2 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                    >
                      <div
                        className={cn("w-1 h-10 rounded-full", eventTypeColors[event.type])}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{event.title}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="secondary" className="text-xs">
                            {eventTypeLabels[event.type]}
                          </Badge>
                          {!event.allDay && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {format(event.startAt, 'HH:mm')}
                            </span>
                          )}
                          {event.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {event.location}
                            </span>
                          )}
                        </div>
                      </div>
                      {event.relatedEntityId && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/documents/${event.relatedEntityId}`);
                          }}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    );
  };

  const getEventIcon = (type: CalendarEventType) => {
    switch (type) {
      case 'rok':
        return <Flag className="h-4 w-4" />;
      case 'isporuka':
        return <Truck className="h-4 w-4" />;
      case 'montaza':
        return <Wrench className="h-4 w-4" />;
      default:
        return <CalendarIcon className="h-4 w-4" />;
    }
  };

  const isLoading = eventsLoading || holidaysLoading;

  return (
    <MainLayout title="Kalendar" subtitle="Pregled rokova, isporuka i montaža">
      <div className="space-y-4">
        {/* Header controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={goToPrevious}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={goToToday}>
              Danas
            </Button>
            <Button variant="outline" size="icon" onClick={goToNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-semibold ml-2">
              {format(currentDate, 'MMMM yyyy', { locale: hr })}
            </h2>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* View mode tabs */}
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
              <TabsList>
                <TabsTrigger value="month" className="gap-1">
                  <Grid3X3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Mjesec</span>
                </TabsTrigger>
                <TabsTrigger value="agenda" className="gap-1">
                  <List className="h-4 w-4" />
                  <span className="hidden sm:inline">Agenda</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <Button onClick={handleCreateNew}>
              <Plus className="h-4 w-4 mr-2" />
              Novi događaj
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-muted-foreground mr-2">
            <Filter className="h-4 w-4 inline mr-1" />
            Filteri:
          </span>
          <Toggle
            pressed={showRok}
            onPressedChange={setShowRok}
            size="sm"
            className={cn("gap-1", showRok && "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200")}
          >
            <Flag className="h-3 w-3" />
            Rokovi
          </Toggle>
          <Toggle
            pressed={showIsporuka}
            onPressedChange={setShowIsporuka}
            size="sm"
            className={cn("gap-1", showIsporuka && "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200")}
          >
            <Truck className="h-3 w-3" />
            Isporuke
          </Toggle>
          <Toggle
            pressed={showMontaza}
            onPressedChange={setShowMontaza}
            size="sm"
            className={cn("gap-1", showMontaza && "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200")}
          >
            <Wrench className="h-3 w-3" />
            Montaže
          </Toggle>
          <Toggle
            pressed={showHolidays}
            onPressedChange={setShowHolidays}
            size="sm"
            className={cn("gap-1", showHolidays && "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200")}
          >
            <Star className="h-3 w-3" />
            Blagdani
          </Toggle>
        </div>

        {/* Calendar content */}
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-[400px] w-full" />
          </div>
        ) : (
          <>
            {viewMode === 'month' && renderMonthView()}
            {viewMode === 'agenda' && renderAgendaView()}
          </>
        )}
      </div>

      {/* Event dialog */}
      <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isCreateMode ? 'Novi događaj' : 'Uredi događaj'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Naslov *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Naziv događaja"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Vrsta</Label>
              <Select
                value={formData.type}
                onValueChange={(v) => setFormData({ ...formData, type: v as CalendarEventType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rok">
                    <span className="flex items-center gap-2">
                      <Flag className="h-4 w-4 text-amber-500" />
                      Rok
                    </span>
                  </SelectItem>
                  <SelectItem value="isporuka">
                    <span className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-blue-500" />
                      Isporuka
                    </span>
                  </SelectItem>
                  <SelectItem value="montaza">
                    <span className="flex items-center gap-2">
                      <Wrench className="h-4 w-4 text-green-500" />
                      Montaža
                    </span>
                  </SelectItem>
                  <SelectItem value="ostalo">
                    <span className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-gray-500" />
                      Ostalo
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="allDay"
                checked={formData.allDay}
                onCheckedChange={(checked) => setFormData({ ...formData, allDay: checked })}
              />
              <Label htmlFor="allDay">Cijeli dan</Label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startAt">Početak *</Label>
                <Input
                  id="startAt"
                  type={formData.allDay ? 'date' : 'datetime-local'}
                  value={formData.allDay ? formData.startAt.split('T')[0] : formData.startAt}
                  onChange={(e) => setFormData({ ...formData, startAt: formData.allDay ? e.target.value + 'T09:00' : e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endAt">Završetak</Label>
                <Input
                  id="endAt"
                  type={formData.allDay ? 'date' : 'datetime-local'}
                  value={formData.allDay ? formData.endAt.split('T')[0] : formData.endAt}
                  onChange={(e) => setFormData({ ...formData, endAt: formData.allDay ? e.target.value + 'T17:00' : e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Lokacija</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Adresa ili mjesto"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Opis</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Dodatne napomene..."
                rows={3}
              />
            </div>

            {selectedEvent?.relatedEntityId && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleNavigateToDocument}
              >
                <FileText className="h-4 w-4 mr-2" />
                Otvori povezani dokument
              </Button>
            )}

            <div className="flex gap-2 pt-2">
              {!isCreateMode && selectedEvent && !selectedEvent.relatedEntityId && (
                <Button type="button" variant="destructive" onClick={handleDeleteEvent}>
                  Obriši
                </Button>
              )}
              <div className="flex-1" />
              <Button type="button" variant="outline" onClick={() => setIsEventDialogOpen(false)}>
                Odustani
              </Button>
              <Button
                onClick={handleSaveEvent}
                disabled={!formData.title || !formData.startAt || createEvent.isPending || updateEvent.isPending}
              >
                {createEvent.isPending || updateEvent.isPending ? 'Spremanje...' : 'Spremi'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Kalendar;
