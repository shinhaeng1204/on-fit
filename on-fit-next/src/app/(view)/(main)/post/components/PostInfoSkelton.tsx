import React from "react";
import { Card, CardContent, CardHeader } from "@/components/common/Card";

export default function PostInfoSkeleton() {
  return (
    <Card className="mb-6 animate-pulse">
      <CardHeader>
        {/* 제목 영역 */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-secondary w-12 h-12" />
            <div>
              <div className="h-5 w-40 bg-secondary rounded mb-2" />
              <div className="h-4 w-24 bg-secondary rounded" />
            </div>
          </div>
          <div className="h-6 w-16 bg-secondary rounded" />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 모임 소개 */}
        <div>
          <div className="h-5 w-20 bg-secondary rounded mb-2" />
          <div className="h-4 w-full bg-secondary rounded mb-1" />
          <div className="h-4 w-3/4 bg-secondary rounded" />
        </div>

        {/* 4개 정보 블록 */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg">
            <div className="w-5 h-5 bg-secondary rounded mt-0.5"/>
            <div className="flex-1">
              <div className="h-4 w-16 bg-secondary rounded mb-1"/>
              <div className="h-4 w-24 bg-secondary rounded"/>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg">
            <div className="w-5 h-5 bg-secondary rounded mt-0.5"/>
            <div className="flex-1">
              <div className="h-4 w-16 bg-secondary rounded mb-1"/>
              <div className="h-4 w-24 bg-secondary rounded"/>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg">
            <div className="w-5 h-5 bg-secondary rounded mt-0.5"/>
            <div className="flex-1">
              <div className="h-4 w-16 bg-secondary rounded mb-1"/>
              <div className="h-4 w-24 bg-secondary rounded"/>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg">
            <div className="w-5 h-5 bg-secondary rounded mt-0.5"/>
            <div className="flex-1">
              <div className="h-4 w-16 bg-secondary rounded mb-1"/>
              <div className="h-4 w-24 bg-secondary rounded"/>
            </div>
          </div>
        </div>

        {/* 준비물 / 참가비 */}
        <div className="space-y-3 pt-4 border-t border-border">
          <div>
            <div className="h-4 w-16 bg-secondary rounded mb-1"/>
            <div className="h-4 w-32 bg-secondary rounded"/>
          </div>
          <div>
            <div className="h-4 w-16 bg-secondary rounded mb-1"/>
            <div className="h-4 w-24 bg-secondary rounded" />
          </div>
        </div>

        {/* 참여 버튼 자리 */}
        <div className="h-10 w-full bg-secondary rounded" />
      </CardContent>
    </Card>
  );
}
