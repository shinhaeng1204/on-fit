// src/types/kakao.maps.d.ts
export {}

declare global {
  interface Window {
    kakao: any;  // 지도 SDK 전역 객체
  }
  // (선택) 전역 kakao 식별자도 쓰고 싶다면:
  // const kakao: any
}
