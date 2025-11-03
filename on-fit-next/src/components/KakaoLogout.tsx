'use client'
export default function KakaoLogout(){

    //로컬스토리지에 아까 저장한 회원 토큰 삭제
    const handleLgout = ()=>{
        localStorage.removeItem('access_token')
    }

    const logoutParam = new URLSearchParams({
        client_id:"50f5edb620ccf07aca7fc0d12debbb11",
        logout_redirect_uri:"http://localhost:3000/logout"
    })
    return (
        <a href={`https://kauth.kakao.com/oauth/logout?${logoutParam.toString()}`}
        onClick={handleLgout}>로그아웃</a>
    )
}