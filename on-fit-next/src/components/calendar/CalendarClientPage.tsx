'use client'
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/common/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/common/Card";
import StatusBadge from "@/components/common/StatusBadge";
import { Calendar as CalendarIcon, ArrowLeft, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/common/Dialog";

type EventType = "member" | "hosting" | "following" | "none";

interface CalendarEvent {
  id: string;
  date: Date;
  title: string;
  sport: string;
  time: string;
  type: EventType;
}

const monthNames = [
  "1월","2월","3월","4월","5월","6월",
  "7월","8월","9월","10월","11월","12월"
];

const dayNames = ["일","월","화","수","목","금","토"];

const typeColors: Record<EventType, string> = {
  hosting: "bg-primary/10 border-primary/50 text-primary",
  member: "bg-accent/10 border-accent/50 text-accent",
  following: "bg-warning/10 border-warning/50 text-warning",
  none: ""
};

const typeLabels: Record<EventType, string> = {
  member: "참여 중",
  hosting: "주최",
  following: "팔로우",
  none: ""
};

export default function CalendarClientPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const today = new Date();

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    return {
      daysInMonth: last.getDate(),
      startingDayOfWeek: first.getDay(),
    };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);

  const previousMonth = () =>
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));

  const nextMonth = () =>
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));

  // API 로드
  useEffect(() => {
    const y = currentDate.getFullYear();
    const m = currentDate.getMonth();

    const from = new Date(y, m, 1).toISOString();
    const to = new Date(y, m + 1, 0, 23, 59, 59).toISOString();

    setLoading(true);
    setErrMsg(null);

    (async () => {
      try {
        const res = await fetch(`/api/calendar?from=${from}&to=${to}`, {
          credentials: "include",
        });
        const json = await res.json();

        if (!json.ok) {
          setErrMsg(json.message || "일정을 불러오지 못했습니다.");
          setEvents([]);
          return;
        }

        const mapped = (json.items ?? []).map((p: any) => {
          const d = new Date(p.date);
          return {
            id: p.id,
            date: d,
            title: p.title || "",
            sport: p.sport || "기타",
            time: d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            type: (p.type ?? "member") as EventType
          };
        });
        setEvents(mapped);
      } catch {
        setErrMsg("네트워크 오류가 발생했습니다.");
        setEvents([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [currentDate]);

  const getEventsForDay = (day: number) =>
    events.filter(e =>
      e.type !== "none" &&
      e.date.getFullYear() === currentDate.getFullYear() &&
      e.date.getMonth() === currentDate.getMonth() &&
      e.date.getDate() === day
    );

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  return (
    <div className="min-h-screen bg-background">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <Button
              href="/"
              variant="ghost"
              size="sm"
              className="-ml-2 gap-1 sm:gap-2"
              leftIcon={<ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />}
            >
              뒤로
            </Button>

            <h1 className="text-lg sm:text-xl font-bold flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              <span className="bg-gradient-brand bg-clip-text text-transparent">운동 달력</span>
            </h1>

            <div className="w-8 sm:w-20" />
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-6xl">

        {/* CALENDAR */}
        <Card className="mb-4 sm:mb-6 border sm:border-2 shadow-lg">
          {/* MONTH HEADER */}
          <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 px-3 py-2 sm:px-6 sm:py-4">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="icon"
                onClick={previousMonth}
                className="h-7 w-7 sm:h-10 sm:w-10"
              >
                <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>

              <CardTitle className="text-base sm:text-2xl font-bold bg-gradient-brand bg-clip-text text-transparent flex items-center gap-1 sm:gap-2">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                {currentDate.getFullYear()}년 {monthNames[currentDate.getMonth()]}
              </CardTitle>

              <Button
                variant="outline"
                size="icon"
                onClick={nextMonth}
                className="h-7 w-7 sm:h-10 sm:w-10"
              >
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-3 sm:p-6">

            {/* DAY LABEL ROW */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-1 sm:mb-2">
              {dayNames.map((day, idx) => (
                <div
                  key={day}
                  className={cn(
                    "text-center text-xs sm:text-sm font-semibold py-1 sm:py-2",
                    idx === 0 ? "text-destructive" : "text-muted-foreground"
                  )}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* CALENDAR GRID */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2">

              {/* EMPTY CELLS */}
              {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                <div key={i} className="aspect-square" />
              ))}

              {/* DAYS */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const cellDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                const dayEvents = getEventsForDay(day);
                const isToday = isSameDay(cellDate, today);

                return (
                  <div
                    key={day}
                    onClick={() => { setSelectedDate(day); setIsDialogOpen(true); }}
                    className={cn(
                      "aspect-square p-1 sm:p-2 rounded-md sm:rounded-lg border sm:border-2 transition-all cursor-pointer",
                      "hover:border-primary hover:shadow-lg",
                      isToday
                        ? "bg-gradient-to-br from-primary/20 to-accent/10 border-primary"
                        : "bg-card border-border hover:bg-primary/5",
                      dayEvents.length > 0 && !isToday && "ring-1 sm:ring-2 ring-primary/30"
                    )}
                  >
                    <div className="flex flex-col h-full">

                      {/* 날짜 */}
                      <span
                        className={cn(
                          "text-xs sm:text-sm font-medium",
                          isToday && "text-primary font-bold text-sm sm:text-base"
                        )}
                      >
                        {day}
                      </span>

                      {/* 모바일: 점 표시 */}
                      <div className="flex gap-0.5 mt-auto sm:hidden">
                        {dayEvents.slice(0, 3).map(e => (
                          <div
                            key={e.id}
                            className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              e.type === "hosting" && "bg-primary",
                              e.type === "member" && "bg-accent",
                              e.type === "following" && "bg-warning"
                            )}
                          />
                        ))}
                      </div>

                      {/* 데스크탑: 라벨 표시 */}
                      <div className="hidden sm:flex flex-col gap-1 mt-1">
                        {dayEvents.slice(0, 2).map(e => (
                          <div
                            key={e.id}
                            className={cn(
                              "text-xs px-2 py-1 rounded-md border truncate",
                              typeColors[e.type]
                            )}
                          >
                            {e.sport}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Sparkles className="h-3 w-3" />
                            +{dayEvents.length - 2}
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* LEGEND */}
        <Card className="mb-4 sm:mb-6 border sm:border-2">
          <CardHeader className="px-3 py-2 sm:px-6 sm:py-4">
            <CardTitle className="text-sm sm:text-lg flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              범례
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="flex flex-wrap gap-2 sm:gap-4">
              {Object.entries(typeLabels)
                .filter(([t]) => t !== "none")
                .map(([type, label]) => (
                  <div
                    key={type}
                    className="flex items-center gap-1 sm:gap-2 px-2 py-1.5 sm:px-3 sm:py-2 bg-secondary/30 rounded-lg"
                  >
                    <div
                      className={cn(
                        "w-3 h-3 sm:w-5 sm:h-5 rounded-md border sm:border-2 shadow-sm",
                        typeColors[type as EventType].split(" ").slice(0, 2).join(" ")
                      )}
                    />
                    <span className="text-xs sm:text-sm font-medium">{label}</span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* DIALOG */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-2xl flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                {selectedDate &&
                  `${currentDate.getFullYear()}년 ${monthNames[currentDate.getMonth()]} ${selectedDate}일 일정`}
              </DialogTitle>
            </DialogHeader>

            <div className="mt-2 sm:mt-4">
              {selectedDate && getEventsForDay(selectedDate).length > 0 ? (
                <div className="space-y-2 sm:space-y-3">
                  {getEventsForDay(selectedDate).map((event) => (
                    <Link
                      href={`/post/${event.id}`}
                      key={event.id}
                      onClick={() => setIsDialogOpen(false)}
                    >
                      <div className="p-3 sm:p-4 bg-gradient-to-r from-accent/10 to-primary/5 rounded-lg border border-transparent hover:border-accent transition-all">
                        <p className="font-semibold mb-1 text-sm sm:text-lg">{event.title}</p>
                        <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="h-3 sm:h-4 w-3 sm:w-4" />
                            {event.time}
                          </span>
                          <span className="text-primary font-medium">{event.sport}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 sm:py-12 text-sm sm:text-lg text-muted-foreground">
                  일정이 없습니다
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* UPCOMING EVENTS */}
        <Card className="border sm:border-2">
          <CardHeader className="px-3 py-2 sm:px-6 sm:py-4 bg-gradient-to-r from-primary/5 to-accent/5">
            <CardTitle className="text-sm sm:text-lg flex items-center gap-2">
              <CalendarIcon className="h-4 sm:h-5 w-4 sm:w-5 text-primary" />
              다가오는 일정
            </CardTitle>
          </CardHeader>

          <CardContent className="p-3 sm:pt-6 sm:px-6">
            <div className="space-y-2 sm:space-y-3">
              {events
                .filter(e => e.type !== "none" && e.date >= new Date())
                .sort((a, b) => a.date.getTime() - b.date.getTime())
                .map(event => (
                  <Link key={event.id} href={`/post/${event.id}`}>
                    <div className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-secondary/30 to-secondary/10 rounded-lg border border-transparent hover:border-primary transition-all">
                      <div>
                        <p className="font-semibold text-sm sm:text-base mb-1">{event.title}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1">
                          <CalendarIcon className="h-3 w-3" />
                          {event.date.getMonth() + 1}월 {event.date.getDate()}일 {event.time}
                        </p>
                      </div>

                      <StatusBadge
                        variant={
                          event.type === "hosting"
                            ? "default"
                            : event.type === "member"
                            ? "success"
                            : "warning"
                        }
                        className="text-xs sm:text-sm px-2 py-0.5 sm:px-3 sm:py-1"
                      >
                        {typeLabels[event.type]}
                      </StatusBadge>
                    </div>
                  </Link>
                ))}

              {events.filter(e => e.date >= new Date()).length === 0 && (
                <p className="text-xs sm:text-sm text-muted-foreground">다가오는 일정이 없습니다.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}