'use client'

import { useState } from 'react'
import { Card } from '../common/Card'
import DropBox from '../common/DropBox'
import { Funnel, Search, X, ChevronDown, Home } from 'lucide-react'
import { Button } from '../common/Button'
import { cn } from '@/lib/utils'

export type FilterValue = {
  sport: string
  sido: string
  sigungu: string
  level: string
  keyword: string
}

type FilterProps = {
  value: FilterValue
  onChange: (value: FilterValue) => void
  onReset?: () => void
  sportsOptions: string[]
  sidoOptions: string[]
  sigunguOptions: string[]
  levelOptions: string[]
  onSearch?: (active: boolean) => void
  onMyTownToggle?: (active: boolean) => void
}

export default function Filter({
  value,
  onChange,
  onReset,
  sportsOptions,
  sidoOptions,
  sigunguOptions,
  levelOptions,
  onSearch,
  onMyTownToggle
  
}: FilterProps) {
  const [activeTab, setActiveTab] = useState<'search' | 'filter' | 'my' | null>(null)

  const toggleTab = (tab: 'search' | 'filter' | 'my') => {
    setActiveTab(activeTab === tab ? null : tab)
  }

 


  const handleReset = () => onReset?.()

  return (
    <div className="mx-5 my-4 flex flex-col gap-2">
      {/* =======================  
          Tabs  
      ========================== */}
      <div className="flex gap-2">
        {/* 검색 탭 */}
        <Button
          onClick={() => {
            const next = activeTab === 'search' ? null : 'search'
            toggleTab('search')
            onSearch?.(next === 'search')
            onMyTownToggle?.(false)
          }}
          variant={activeTab === 'search' ? 'default' : 'outline'}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
            activeTab === 'search'
              ? "bg-primary text-primary-foreground border-primary shadow-sm"
              : "bg-card/50 border-border text-muted-foreground hover:text-foreground hover:border-primary/50"
          )}
        >
          <Search className="h-4 w-4" />
          검색
          <ChevronDown
            className={cn(
              "h-3 w-3 transition-transform",
              activeTab === 'search' && "rotate-180"
            )}
          />
        </Button>

        {/* 필터 탭 */}
        <Button
          onClick={() => {
            toggleTab('filter')
            onSearch?.(false)
            onMyTownToggle?.(false)
          }}
          variant={activeTab === 'filter' ? 'default' : 'outline'}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
            activeTab === 'filter'
              ? "bg-primary text-primary-foreground border-primary shadow-sm"
              : "bg-card/50 border-border text-muted-foreground hover:text-foreground hover:border-primary/50"
          )}
        >
          <Funnel className="h-4 w-4" />
          필터
          <ChevronDown
            className={cn(
              "h-3 w-3 transition-transform",
              activeTab === 'filter' && "rotate-180"
            )}
          />
        </Button>
        <Button onClick={() => {
          const next = activeTab === 'my' ? null : 'my'
          toggleTab('my')
          onSearch?.(false)
          onMyTownToggle?.(next === 'my')
          
        }} variant={activeTab === 'my' ? 'default' : 'outline'} className='text-muted-foreground'><Home/>나의 동네</Button>
      </div>
      

      {/* =======================  
          SLIDE DOWN CONTENT  
      ========================== */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-200 ease-out",
          activeTab === 'search' || activeTab === 'filter' ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="p-4 bg-card/50 backdrop-blur-sm rounded-lg border border-border">

          {/* =======================  
              🔍 SEARCH SECTION  
          ========================== */}
          {activeTab === 'search' && (
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

                <input
                  type="text"
                  value={value.keyword}
                  onChange={(e) => onChange({ ...value, keyword: e.target.value })}
                  placeholder="운동 번개 제목으로 검색..."
                  className="w-full h-10 pl-10 pr-10 rounded-md border border-border bg-background/50 text-sm"
                />

                {/* 내부 X 버튼 → Button으로 교체 */}
                {value.keyword.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onChange({ ...value, keyword: "" })}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* =======================  
              🧩 FILTER SECTION  
          ========================== */}
          {activeTab === 'filter' && (
            <div className="flex flex-wrap items-center gap-3">
              <div className="basis-[150px] flex-shrink-0">
                <DropBox
                  options={sportsOptions}
                  value={value.sport}
                  onChange={(v) => onChange({ ...value, sport: v })}
                  placeholder="종목"
                />
              </div>

              <div className="basis-[150px] flex-shrink-0">
                <DropBox
                  options={sidoOptions}
                  value={value.sido}
                  onChange={(v) => onChange({ ...value, sido: v, sigungu: "" })}
                  placeholder="시/도"
                />
              </div>

              <div className="basis-[150px] flex-shrink-0">
                <DropBox
                  options={sigunguOptions}
                  value={value.sigungu}
                  onChange={(v) => onChange({ ...value, sigungu: v })}
                  placeholder="시군구"
                />
              </div>

              <div className="basis-[150px] flex-shrink-0">
                <DropBox
                  options={levelOptions}
                  value={value.level}
                  onChange={(v) => onChange({ ...value, level: v })}
                  placeholder="실력"
                />
              </div>

              {/* 초기화 버튼 */}
              <Button
                variant="ghost"
                size="sm"
                className="h-9"
                onClick={handleReset}
              >
                <div className="flex items-center justify-center gap-1">
                  <X className="h-4 w-4" />
                  초기화
                </div>
              </Button>
            </div>
            
          )}
          
        </div>
        
      </div>
      
    </div>
  )
}
