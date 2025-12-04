// src/app/api/posts/[id]/route.ts
import {createSupabaseServerClient, requireUserOr401, toISOFromKST} from '@/lib/route-helpers';
import { NextResponse } from 'next/server';
import {fail} from "node:assert";

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
  const supabase = await createSupabaseServerClient();

  // 0) Body 파싱
  let b: any;
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "INVALID_JSON_BODY" }, { status: 400 });
  }

  // 1) 로그인 유저 확인
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  // 2) 내가 만든 글인지 확인
  const { data: post, error: fetchError } = await supabase
    .from("posts")
    .select("id, author_id")
    .eq("id", id)
    .single();

  if (fetchError || !post) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  if (post.author_id !== user.id) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  // 3) 날짜+시간 → date_time 변환
  const dateISO = toISOFromKST(b.date, b.time);
  if (!dateISO) return fail("잘못된 날짜/시간 형식", 400);

  // 4) 필요 값만 payload에 넣기 (undefined → 무시됨)
  const payload = {
    sport: String(b.sport),
    title: String(b.title),
    location: String(b.location),
    date_time: dateISO,
    level: b.level ?? "브론즈",
    status: b.status ?? "모집중",
    current_participants: Number(b.currentParticipants ?? 1),
    max_participants: Math.max(1, Number(b.maxParticipants ?? 1)),
    author_id: user.id, // RLS가 체크
    description: b.description ?? "",
    requirement: b.requirement ?? "",
    fee: b.fee ?? "",
  };

  // 5) DB 업데이트
  const { error } = await supabase.from("posts").update(payload).eq("id", id);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, updated: true });
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
