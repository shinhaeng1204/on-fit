import { createSupabaseServerClient } from '@/lib/route-helpers'
import { NextResponse } from 'next/server'

type Ctx = { params: Promise<{ id: string }> }

export async function GET(_: Request, context: Ctx) {
  const { id } = await context.params
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.from('posts').select('*').eq('id', id).single()
  if (error) return NextResponse.json({ ok: false, error }, { status: 404 })
  return NextResponse.json({ ok: true, item: data })
}

export async function PATCH(req: Request, context: Ctx) {
  const { id } = await context.params
  const body = await req.json()
    const supabase = await createSupabaseServerClient();

  const update: Record<string, any> = {}

  if (body.title) update.title = body.title
  if (body.sport) update.sport = body.sport
  if (body.location) update.location = body.location
  if (body.level) update.level = body.level
  if (body.status) update.status = body.status
  if (typeof body.currentParticipants === 'number')
    update.current_participants = body.currentParticipants
  if (typeof body.maxParticipants === 'number')
    update.max_participants = body.maxParticipants

  if (body.date && body.time) {
    update.date_time = new Date(`${body.date}T${body.time}:00+09:00`).toISOString()
  }

  const { data, error } = await supabase
    .from('Fit')
    .update(update)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
  }

  return NextResponse.json({ ok: true, item: data })
}

export async function DELETE(_: Request, context: Ctx) {
  const { id } = await context.params
    const supabase = await createSupabaseServerClient();

  const { error } = await supabase.from('posts').delete().eq('id', id)

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
