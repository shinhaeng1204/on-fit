'use client'
import { Card, CardContent, CardHeader } from "../Card";
import { Funnel } from "lucide-react";
import DropBox from "../DropBox";
import { useState } from "react";

const locationOptions = ['전체', '강남구', '서초구', '송파구', '마포구', '용산구', '성동구']
const sportsOptions = ['전체', '배드민턴', '풋살', '농구', '런닝', '클라이밍', '테니스', '탁구']
const levelOptions = ['전체', '브론즈', '실버', '골드', '플래티넘', '다이아']


export default function Filter() {
    const [sport, setSport] = useState<string>('')
    const [location, setLocation] = useState<string>('')
    const [level, setLevel] = useState<string>('')
    return(
        <Card className="mx-5 my-4 bg-card/50 backdrop-blur-sm md:flex md:items-center">
            <CardHeader className="py-3 px-6 md:pr-0">
                <div className="flex items-center gap-2"><Funnel className="text-primary w-4 h-4"/> <h1 className="text-sm font-semibold">필터</h1></div>
            </CardHeader>
            <CardContent className="pb-3 md:py-4">
                <div className="md:flex grid grid-cols-2 gap-2 md:flex-wrap md:gap-3">
                    <DropBox defaultValue = '종목 선택' options={sportsOptions} value={sport} onSelect={setSport}/>
                    <DropBox defaultValue="지역 선택" options={locationOptions} value={location} onSelect={setLocation}/>
                    <DropBox defaultValue="실력 선택" options={levelOptions} value={level} onSelect={setLevel}/>
                </div>
            </CardContent>
        </Card>
    )
}

