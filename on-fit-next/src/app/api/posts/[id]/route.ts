import { NextResponse } from 'next/server'
import { sbAdmin } from '@/lib/supabase-admin'

type Ctx = { params: { id: string } }

export async function GET(_: Request, { params }: Ctx) {
  const { data, error } = await sbAdmin.from('Fit').select('*').eq('id', params.id).single()
  if (error) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 })
  return NextResponse.json({ ok: true, item: data })
}

export async function PATCH(req: Request, { params }: Ctx) {
  const body = await req.json()
  const update: Record<string, any> = {}
  if (body.sport) update.sport = body.sport
  if (body.title) update.title = body.title
  if (body.location) update.location = body.location
  if (body.level) update.level = body.level
  if (body.status) update.status = body.status
  if (typeof body.currentParticipants === 'number') update.current_participants = body.currentParticipants
  if (typeof body.maxParticipants === 'number') update.max_participants = body.maxParticipants
  if (body.date && body.time) {
    update.date_time = new Date(`${body.date}T${body.time}:00+09:00`).toISOString()
  }

  const { data, error } = await sbAdmin.from('Fit').update(update).eq('id', params.id).select().single()
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true, item: data })
}

export async function DELETE(_: Request, { params }: Ctx) {
  const { error } = await sbAdmin.from('Fit').delete().eq('id', params.id)
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
