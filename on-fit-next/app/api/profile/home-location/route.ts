// app/api/profile/home-location/route.ts
import { NextRequest } from 'next/server'
import {
  createSupabaseServerClient,
  requireUserOr401,
  ok,
  fail,
} from '@/lib/route-helpers'
import { z } from 'zod'

const bodySchema = z.object({
  home_lat: z.number(),
  home_lng: z.number(),
  home_region: z.string().min(1),
})

export async function PATCH(req: NextRequest) {
  const supabase = await createSupabaseServerClient()

  // 로그인 유저 확인
  const { ok: hasUser, user, response } = await requireUserOr401(supabase)
  if (!hasUser || !user) return response

  // body 파싱 & 검증
  const json = await req.json().catch(() => null)
  const parsed = bodySchema.safeParse(json)

  if (!parsed.success) {
    return fail('잘못된 요청입니다. (위치 정보 형식 오류)')
  }

  const { home_lat, home_lng, home_region } = parsed.data

  const { error } = await supabase
    .from('profiles')
    .update({
      home_lat,
      home_lng,
      home_region,
    })
    .eq('id', user.id)

  if (error) {
    console.error('update home location error:', error)
    return fail('나의 동네 정보를 저장하는 데 실패했습니다.')
  }

  return ok({
    home_lat,
    home_lng,
    home_region,
  })
}
