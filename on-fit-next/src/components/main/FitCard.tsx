import { Calendar, Dumbbell, DumbbellIcon, MapPin, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../common/Card";
import StatusBadge from "./StatusBadge";
import Badge from "../common/Badge";
import { Button } from "../common/Button";
import Link from "next/link";
import RecruitStatus from "@/components/common/RecruitStatus";
import React from "react";

type Level = 'bronze' | 'silver' | 'gold' | 'platinum'

interface FitCardProps {
  id: string
  title: string
  status: string
  sport: string
  location: string
  date: string
  time: string
  level: Level
  currentParticipants: number
  maxParticipants: number
}

export default function FitCard({
    id,
    title,
    status,
    sport,
    location,
    date,
    time,
    currentParticipants,
    maxParticipants,
    level,
}: FitCardProps){
    return (
        <Link href={`/post/${id}`}>
        <Card className="group hover:border-primary/50 transition-all duration-300 hover:shadow-glow-primary cursor-pointer">
            <CardHeader className="relative flex-row gap-2">
                <div className="flex items-center rounded-lg bg-primary/10 p-2">
                    <DumbbellIcon className="h-5 text-primary"/>
                </div>
                <div className="flex flex-col">
                    <RecruitStatus className="absolute right-5" type={status} text={status} />
                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{title}</h3>
                    <span className="text-sm text-muted-foreground">{sport}</span>
                </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <MapPin className="text-muted-foreground w-4 h-4"/>
                    <span className="text-muted-foreground text-sm font-semibold">{location}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Calendar className="text-muted-foreground w-4 h-4"/>
                    <span className="text-muted-foreground text-sm font-semibold">{date} {time}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Users className="text-muted-foreground w-4 h-4"/>
                    <span className="text-muted-foreground text-sm font-semibold">{currentParticipants}/{maxParticipants}명</span>
                </div>
                <div className="py-[0.1px] w-full bg-muted-foreground/40 mt-2 backdrop-blur-3xl"></div>

                <div className="flex mt-2 justify-between items-center">
                    <Badge type={level} className="max-h-6"/>
                    <Button variant="sport" size="sm">참여하기</Button>
                </div>
            </CardContent>
        </Card>
        </Link>
    )
}