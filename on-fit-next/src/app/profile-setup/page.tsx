'use client'
import StatusBadge from "@/components/main/StatusBadge"
import { Button } from "@/components/common/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/common/Card"
import { Input } from "@/components/common/Input"
import { Dumbbell, MapPin, User } from "lucide-react"
import { useRouter } from "next/navigation"
import {useState} from "react"
import { sbClient } from "@/lib/supabase-client"


const ProfileSetup = ()=>{
    const router = useRouter()
    const [nickname, setNickname] =useState("")
    const [location, setLocation] = useState("")
    const [selectedExercises, setSelectedExercises] = useState<string[]>([]) 
    const [loading, setLoading] = useState(false)

    const exercises = [
    "축구", "농구", "야구", "배구", "테니스", 
    "배드민턴", "탁구", "러닝", "등산", "자전거",
    "수영", "헬스", "요가", "필라테스", "클라이밍"
    ]

    const toggleExercise = (exercise:string) =>{
        setSelectedExercises(prev =>
            prev.includes(exercise)
                ? prev.filter(e=>e!==exercise)
                :[...prev, exercise]
        )
    }

    const handleSubmit = async (e:React.FormEvent)=>{
        e.preventDefault()
        setLoading(true)

        const {data:{user}, error:useError} = await sbClient.auth.getUser()

        if(useError || !user){
            alert("로그인이 필요합니다.")
            router.push("/login")
            return
        }

        const {error} = await sbClient
            .from ("profiles")
            .update({
                nickname,
                location,
                sport_preference: selectedExercises,
                updated_at: new Date(),
            })
            .eq("id", user.id)
        setLoading(false)

        if(error){
            console.error("프로필 저장 오류: ", error)
            alert("프로필 저장 중 오류가 발생했습니다.")
        } else {
            alert("프로필이 저장되었습니다.")
            router.push("/")
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">프로필 설정</CardTitle>
                    <CardDescription>
                        서비스를 시작하기 전에 프로필을 설정해주세요
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/*닉네임*/}
                        <div className="space-y-2">
                            <label htmlFor="nickname" className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                닉네임
                            </label>
                            <Input
                                id="nickname"
                                placeholder="닉네임을 입력하세요"
                                value={nickname}
                                onChange={(e)=>setNickname(e.target.value)}
                            />
                        </div>
                        {/*동네*/}
                        <div className="spcae-y-2">
                            <label htmlFor="location" className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                나의 동네
                            </label>
                            <Input  
                                id="location"
                                placeholder="예: 강남구, 서초동"
                                value={location}
                                onChange={(e)=>setLocation(e.target.value)}
                            />
                        </div>
                        {/*선호하는 운동*/}
                        <div className="space-y-3">
                            <label className="flex items-center gap-2">
                                <Dumbbell className="w-4 h-4" />
                                선호하는 운동
                            </label>
                            <p className="text-sm text-muted-foreground">
                                관심있는 운동을 선택해주세요 (여러 개 선택 가능)
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {exercises.map((exercise)=>(
                                    <StatusBadge
                                        key={exercise}
                                        variant={selectedExercises.includes(exercise) ? "default" : "outline"}
                                        className="cursor-pointer hover:scale-105 transition-transform"
                                        onClick={() => toggleExercise(exercise)}
                                    >
                                        {exercise}
                                    </StatusBadge>
                                ))}
                            </div>
                            {selectedExercises.length > 0 && (
                                <p className="text-sm text-muted-foreground">
                                    선택됨: {selectedExercises.length}개
                                </p>
                            )}
                        </div>
                        <Button type="submit" className="w-full" size="lg">
                            시작하기
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

export default ProfileSetup