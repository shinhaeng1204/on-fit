import React from "react";
import PostInfo from "@/components/post/PostInfo";

const data = {
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
}

export default function Page () {
  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <PostInfo data={data}/>
    </main>
  )
}