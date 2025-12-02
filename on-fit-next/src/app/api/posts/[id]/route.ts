// src/app/api/posts/[id]/route.ts
import { createSupabaseServerClient } from '@/lib/route-helpers';
import { NextResponse } from 'next/server';

type Ctx = { params: Promise<{ id: string }> };

// 단일 게시글 조회
export async function GET(_: Request, context: Ctx) {
  const { id } = await context.params;
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from('posts')
    .select(
      `
      *,
      profiles:author_id(
        *
      )
    `,
    )
    .eq('id', id)
    .single();

  if (error) {
    return NextResponse.json({ ok: false, error }, { status: 404 });
  }

  return NextResponse.json({ ok: true, item: data });
}

// 게시글 수정
export async function PATCH(req: Request, context: Ctx) {
  const { id } = await context.params;
  const body = await req.json();
  const supabase = await createSupabaseServerClient();

  const update: Record<string, any> = {};

  if (body.title) update.title = body.title;
  if (body.sport) update.sport = body.sport;
  if (body.location) update.location = body.location;
  if (body.level) update.level = body.level;
  if (body.status) update.status = body.status;
  if (typeof body.currentParticipants === 'number')
    update.current_participants = body.currentParticipants;
  if (typeof body.maxParticipants === 'number')
    update.max_participants = body.maxParticipants;

  if (body.date && body.time) {
    update.date_time = new Date(`${body.date}T${body.time}:00+09:00`).toISOString();
  }

  const { data, error } = await supabase
    // ⚠️ 원래 코드가 'Fit' 테이블을 쓰고 있었음
    // 실제 테이블명이 posts라면 from('posts')로 바꾸는 게 맞고,
    // Fit 테이블이 따로 있다면 이 부분만 다시 맞춰줘야 함
    .from('Fit')
    .update(update)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, item: data });
}

// 게시글 삭제 (내가 만든 글만, 소프트 삭제)
export async function DELETE(_: Request, context: Ctx) {
  const { id } = await context.params;
  const supabase = await createSupabaseServerClient();

  // 1) 로그인 유저 확인
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  // 2) 내가 만든 글인지 확인 (author_id 기준)
  const { data: post, error: fetchError } = await supabase
    .from('posts')
    .select('id, author_id')
    .eq('id', id)
    .single();

  if (fetchError || !post) {
    return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });
  }

  if (post.author_id !== user.id) {
    return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 });
  }

  // 3) 소프트 삭제 (is_deleted 플래그만 true로)
  const { error: updateError } = await supabase
    .from('posts')
    .update({ is_deleted: true })
    .eq('id', id);

  if (updateError) {
    return NextResponse.json({ ok: false, error: updateError.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
