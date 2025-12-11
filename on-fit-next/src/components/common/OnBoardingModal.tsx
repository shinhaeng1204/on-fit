'use client'
import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "./Dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselApi,
} from "./Carousel"
import { Button } from "./Button";
import { Users, MapPin, Plus, Calendar, MessageCircle, Trophy } from "lucide-react";

interface OnboardingSlide {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const slides: OnboardingSlide[] = [
  {
    icon: <Users className="w-16 h-16 text-primary" />,
    title: "운동 번개에 오신 것을 환영합니다!",
    description: "같은 동네에서 운동할 사람들을 쉽게 찾고 \n함께 운동해보세요.",
  },
  {
    icon: <MapPin className="w-16 h-16 text-primary" />,
    title: "위치 기반 필터링",
    description: "처음에는 현재 위치를 기준으로 5km 반경의 \n운동 번개가 표시돼요. 필터나 검색 라벨을 사용해 다른 지역의 번개도 찾아보세요!",
  },
  {
    icon: <MapPin className="w-16 h-16 text-primary" />,
    title: "나의 동네",
    description: "‘나의 동네’ 버튼을 누르면 프로필에서 \n설정한 동네를 기준으로 5km 반경의 \n운동 번개가 자동으로 필터링돼요.",
  },
  {
    icon: <Plus className="w-16 h-16 text-primary" />,
    title: "번개 모임 참여하기",
    description: "원하는 운동, 시간, 장소를 선택해서 번개 모임을 \n직접 만들어보세요.",
  },
  {
    icon: <Calendar className="w-16 h-16 text-primary" />,
    title: "운동 달력",
    description: "참여하고있는 운동, 주최한 운동, 팔로잉하고 있는 사람들이 주최한 운동을 달력으로 한눈에 보세요.",
  },
  {
    icon: <MessageCircle className="w-16 h-16 text-primary" />,
    title: "함께 소통하기",
    description: "참여한 모임의 그룹 채팅방에서 다른 참가자들과 \n소통할 수 있어요.",
  },
  {
    icon: <Trophy className="w-16 h-16 text-primary" />,
    title: "뱃지를 모아보세요",
    description: "참여 횟수에 따라 브론즈, 실버, 골드, 플래티넘 \n뱃지를 획득할 수 있어요!",
  },
];

interface OnboardingModalProps {
  isNewUser: boolean;
}

export function OnboardingModal({ isNewUser }: OnboardingModalProps) {
  const [open, setOpen] = useState(false);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (isNewUser) {
      setOpen(true);
    }
  }, [isNewUser]);

  useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const handleClose = () => {
    localStorage.setItem("hasSeenOnboarding", "true");
    setOpen(false);
  };

  const handleNext = () => {
    if (current === slides.length - 1) {
      handleClose();
    } else {
      api?.scrollNext();
    }
  };

  const handlePrev = () => {
  if (current === 0) {
    // 첫 번째 슬라이드에서는 그냥 아무것도 안 함
    return;
  } else {
    api?.scrollPrev();
  }
};

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="max-w-[600px] w-full p-0 gap-0 h-auto overflow-hidden">
        <Carousel setApi={setApi} className="w-[600px]">
          <CarouselContent>
            {slides.map((slide, index) => (
              <CarouselItem key={index}>
                <div className="flex flex-col items-center justify-center p-8 text-center min-h-[320px]">
                  <div className="mb-6 flex justify-center w-full">{slide.icon}</div>
                  <h2 className="text-xl font-bold mb-3 w-full">{slide.title}</h2>
                  <p className="text-muted-foreground text-sm leading-relaxed w-full max-w-[280px] mx-auto whitespace-pre-line">
                    {slide.description}
                  </p>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        <div className="p-4 border-t border-border">
          {/* Dots indicator */}
          <div className="flex justify-center gap-2 mb-4">
            {slides.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-colors cursor-pointer ${
                  current === index ? "bg-primary" : "bg-muted"
                }`}
                onClick={() => api?.scrollTo(index)}
              />
            ))}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={handlePrev}>
              이전
            </Button>
            <Button className="flex-1" onClick={handleNext}>
              {current === slides.length - 1 ? "시작하기" : "다음"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
