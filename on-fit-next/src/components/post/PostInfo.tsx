'use client'

import {Card, CardContent, CardHeader} from "@/components/common/Card";
import {Calendar, Dumbbell, Flag, MapPin, MessageCircle, Users} from "lucide-react";
import RecruitStatus from "@/components/common/RecruitStatus";
import Badge from "@/components/common/Badge";
import {Button} from "@/components/common/Button";
import React, {useEffect, useState} from "react";
import {postType, sportType} from "@/types/post";
import ReportModal from "@/components/post/ReportModal";
import {useParams} from "next/navigation";
import {api} from "@/lib/axios";
import {toKstDate, toKstTime} from "@/lib/dateFormatter";

/*const data = {
  title : '강남 배드민턴 초급자 모집',
  sports : 1,
  status : 'open',
  description : '배드민턴 함께 칠 분들 구합니다! 초급자 환영이고, 재밌게 운동하실 분 오세요. 라켓은 대여 가능합니다.',
  location : '강남구 역삼동 체육관',
  date : '2024년 11월 5일',
  time : '저녁 7:00 PM',
  totalMember : 6,
  currentMember : 3,
  level : 'bronze',
  requirements: '라켓(대여 가능), 운동화',
  fee : '15,000원 (시설비 포함)',
}*/

export default function PostInfo () {
  const {id} = useParams()
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<postType | null>(null)

  useEffect(() => {
    let mounted = true;
    (async () => {
      try{
        setLoading(true)
        setError(null)

        const res = await api.get(`/api/posts/${id}`)
        console.log(res)
        if(!mounted) return
        setData(res.data.item)
      } catch (e: any) {
        if(!mounted) return
        setError(e?.response?.data?.error ?? e.message ?? '알 수 없는 오류')
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          {/* 제목/설명/아이콘 */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10">
                <Dumbbell className="h-6 w-6 text-primary"/>
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-1">{data?.title}</h1>
                {/* 차후 API 추가 후 수정 필요*/}
                <p className="text-muted-foreground">{data?.sport}</p>
              </div>
            </div>
             {/*모집 상태*/}
            <RecruitStatus type={data?.status} text={data?.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
           {/*모임 소개*/}
          <div>
            <h3 className="font-semibold mb-2">모임소개</h3>
            <p className="text-muted-foreground leading-relaxed">
              {data?.description}
            </p>
          </div>
           {/*모임 정보*/}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg">
              <MapPin className="h-5 w-5 text-primary mt-0.5"/>
              <div>
                <p className="text-sm font-medium mb-1">장소</p>
                <p className="text-sm text-muted-foreground">{data?.location}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg">
              <Calendar className="h-5 w-5 text-primary mt-0.5"/>
              <div>
                <p className="text-sm font-medium mb-1">일정</p>
                <p className="text-sm text-muted-foreground">{`${toKstDate(data?.date_time)} ${toKstTime(data?.date_time)}` }</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg">
              <Users className="h-5 w-5 text-primary mt-0.5"/>
              <div>
                <p className="text-sm font-medium mb-1">인원</p>
                <p className="text-sm text-muted-foreground">{data?.current_participants}/{data?.max_participants}명</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg">
              <Dumbbell className="h-5 w-5 text-primary mt-0.5"/>
              <div>
                <p className="text-sm font-medium mb-1">실력</p>
                <p className="text-sm text-muted-foreground">
                  {/* TODO : 차후 API 추가 후 수정 필요*/}
                  <Badge type={'bronze'}/>
                </p>
              </div>
            </div>
          </div>
           {/*추가 정보*/}
          <div className="space-y-3 pt-4 border-t border-border">
            {data?.equipment ? (
              <div>
                <p className="text-sm font-medium mb-1">준비물</p>
                <p className="text-sm text-muted-foreground">{data?.equipment}</p>
              </div>
            ) : <></>}
            {data?.fee ? (
              <div>
                <p className="text-sm font-medium mb-1">참가비</p>
                <p className="text-sm text-muted-foreground">{data?.fee}</p>
              </div>
            ): <></>}

          </div>
          {/*참여, 신고*/}
          <div className="flex gap-3 pt-4">
            <Button size="lg" href={'/'} fullWidth="true" leftIcon={<MessageCircle />} className="cursor-pointer">참여하기</Button>
            <Button
              variant='sport'
              size="lg"
              className="cursor-pointer"
              onClick={() => setIsOpen(true)}
            ><Flag /></Button>
          </div>
        </CardContent>
      </Card>
      <ReportModal isOpen={isOpen} onClose={() => setIsOpen(false)}/>
    </>
  )
}