'use client'
import { useEffect, useState } from "react";
import Link from "next/link";
import {Button} from "@/components/common/Button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/common/Card";
import StatusBadge from "@/components/main/StatusBadge";
import {Calendar as CalendarIcon,ArrowLeft,ChevronLeft,ChevronRight,Sparkles, ChevronsLeftRight} from "lucide-react";
import { cn } from "@/lib/utils";
import BottomNav from "@/components/common/BottomNav";

type EventType = "participated" | "hosting" | "following";

interface CalendarEvent {
  id: string;
  date: Date;
  title: string;
  sport: string;
  time: string;
  type: EventType;
}

  const monthNames = [
    "1월", "2월", "3월", "4월", "5월", "6월",
    "7월", "8월", "9월", "10월", "11월", "12월"
  ];

  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];

  const typeColors: Record<EventType, string> = {
    participated:
      "bg-primary/10 border-primary/50 text-primary hover:bg-primary/20 hover:border-primary",
    hosting:
      "bg-accent/10 border-accent/50 text-accent hover:bg-accent/20 hover:border-accent",
    following:
      "bg-warning/10 border-warning/50 text-warning hover:bg-warning/20 hover:border-warning",
  };

  const typeLabels: Record<EventType, string> = {
    participated: "참여 중",
    hosting: "주최",
    following: "팔로우",
  };

  const today = new Date();

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    return {
      daysInMonth: lastDay.getDate(),
      startingDayOfWeek: firstDay.getDay(),
    };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  // 이번 달 범위로 API 호출
  useEffect(() => {
    const y = currentDate.getFullYear();
    const m = currentDate.getMonth();
    const from = new Date(y, m, 1, 0, 0, 0, 0).toISOString();
    const to = new Date(y, m + 1, 0, 23, 59, 59, 999).toISOString();

    setLoading(true);
    setErrMsg(null);

    (async () => {
      try {
        const res = await fetch(`/api/calendar?from=${from}&to=${to}`, {
          credentials: "include", //같은 오리진의 HttpOnly 쿠키(로그인 토큰 등)를 함께 보낸다.
        });
        const json = await res.json();
        if (!json?.ok) {
          setErrMsg(json?.message || "일정을 불러오지 못했습니다.");
          setEvents([]);
          return;
        }
        const mapped: CalendarEvent[] = (json.items ?? []).map((p: any) => {
          const d = new Date(p.date);
          const hhmm = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          console.log(d)
          return {
            id: p.id,
            date: d,
            title: p.title ?? "",
            sport: p.sport ?? "기타",
            time: hhmm,
            // 지금은 모두 'hosting'으로; 필요하면 서버에서 type 내려주거나 로직 추가
            type: "hosting",
          };
        });
        setEvents(mapped);
      } catch (e) {
        setErrMsg("네트워크 오류가 발생했습니다.");
        setEvents([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [currentDate]);

  const getEventsForDay = (day: number) => {
    return events.filter((event) => {
      return (
        event.date.getDate() === day &&
        event.date.getMonth() === currentDate.getMonth() &&
        event.date.getFullYear() === currentDate.getFullYear()
      );
    });
  };

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                뒤로
              </Button>
            </Link>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              <span className="bg-gradient-brand bg-clip-text text-transparent">운동 달력</span>
            </h1>
            <div className="w-20" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <Card className="bg-gradeient-to-r from-primary/5 to-accent/5">
          <div className="flex items-center justify-between">
            <Button variant="outline" size="icon" onClick={previousMonth} className="hover:bg-primary/10 hover:border-primary transition-all">
              <ChevronLeft className="h-5 w-5" />
            </Button> 

            <CardTitle className="text-2xl font-bold bg-gradient-brand bg-clip-text text-transparent flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              {currentDate.getFullYear()}년 {monthNames[currentDate.getMonth()]}
            </CardTitle>

            <Button variant="outline" size="icon" onClick={nextMonth} className="hover:bg-primary/10 hover:border-primary transition-all">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          <CardHeader>
            {loading && (
                <div className="mb-3 text-sm text-muted-foreground">일정을 불러오는 중...</div>
            )}
            {errMsg && !loading && (
                <div className="mb-3 text-sm text-destructive">{errMsg}</div>
            )}

            <div className="grid grid-cols-7 gap-2 mb-2">
                {dayNames.map((day, index)=>(
                  <div
                    key={day}
                    className={cn("text-center text-sm font-semibold py-2",
                        index===0 ? "text-destructive" : "text-muted-foreground"
                    )}
                  > {day}
                  </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {Array.from({length:startingDayOfWeek}).map((_, index)=>(
                <div key={`empty-${index}`} className="aspect-square" />
              ))}

              {Array.from({length:daysInMonth}).map((_, index)=>{
                const day = index+1;
                const cellDate = new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth(),
                    day
                );
                const eventsForDay = getEventsForDay(day);
                const isToday = isSameDay(cellDate, today)
                return (
                  <div 
                    key={day}
                    className={cn(
                      "aspect-square p-2 rounded-lg border-2 transition-all duration-300 cursor-pointer",
                      "hover:border-primary hover:shadow-lg hover:scale-105 hover:-translate-y-1",
                      isToday
                        ? "bg-gradient-to-br from-primary/20 to-accent/10 border-primary shadow-glow-primary"
                        : "bg-card border-border hover:bf-primary/5",
                      eventsForDay.length > 0 && !isToday && "ring-2 ring-primary/30"
                    )}
                  >
                    <div className="flex flex-col h-full">
                      <span 
                        className={cn(
                            "text-sm font-medium mb-1",
                            isToday && "text-primary font-bold text-base"
                        )}
                      >
                        {day}
                      </span>
                      <div className="flex-1 space-y-1 overflow-hidden">
                        {eventsForDay.slice(0,2).map((event)=>(
                          <Link key={event.id} href={`/post/${event.id}`}>
                            <div 
                              className={cn(
                                "text-xs px-2 py-1 rounded-md border font-medium truncate transition-all duration-200",
                                "hover:scale-110 hover:shadow-md",
                                typeColors[event.type]
                              )}
                              title={`${event.title || event.sport} ${event.time}`}
                            >
                                {event.sport}
                            </div>
                          </Link>
                        ))}
                        {eventsForDay.length > 2 && (
                          <div className="text-xs text-muted-foreground font-semibold flex items-center gap-1" >
                            <Sparkles className="h-3 w-3" />
                            +{eventsForDay.length-2}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardHeader>
        </Card>

        <Card className="mb-6 border-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              범례
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {Object.entries(typeLabels).map(([type, label])=>(
                <div key={type} className="flex items-center gap-2 px-3 py-2 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors" >
                  <div className={cn(
                    "w-5 h-5 rounded-md border-2 shadow-sm",
                    typeColors[type as EventType].split(" ").slice(0,2).join(" ")
                  )}
                  />
                  <span className="text-sm font-medium">{label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
            <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-primary" />
                다가오는 일정
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {events
                .filter((event)=> event.date >=new Date())
                .sort((a,b)=>a.date.getTime() - b.date.getTime())
                .map((event)=>(
                    <Link key={event.id} href={`/post/${event.id}`}>
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-secondary/30 to-secondary/10 
                      rounded-lg border-2 border-transparent hover:border-primary hover:shadow-lg transition-all duration-300 hover:scale=[1.02]">
                        <div>
                          <p className="font-semibold mb-1">{event.title || event.sport}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <CalendarIcon className="h-3 w-3" />
                            {event.date.getMonth()+1}월 {event.date.getDate()}일 {event.time}
                          </p>
                        </div>
                        <StatusBadge
                          variant={
                            event.type === "hosting"
                              ? "default"
                              :event.type === "participated"
                              ?"success"
                              : "warning"
                          }
                        >
                            {typeLabels[event.type]}
                        </StatusBadge>
                      </div>
                    </Link>
                ))}
                {events.filter((e)=> e.date >= new Date()).length === 0 && (
                    <p className="text-sm text-muted-foreground">다가오는 일정이 없습니다.</p>
                )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}