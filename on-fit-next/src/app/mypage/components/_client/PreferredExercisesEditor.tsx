'use client';

import { useState } from 'react';
import { Button } from '@/components/common/Button';
import { updatePreferencesArray } from '@/app/mypage/actions';
import { Plus, X, Pencil, Check } from 'lucide-react'; // ✅ RotateCcw 제거
import { useToast } from '@/app/mypage/components/Toast';

type Props = { initial: string[] };

export default function PreferredExercisesEditor({ initial }: Props) {
  const { show } = useToast?.() ?? { show: () => {} };
  const [editing, setEditing] = useState(false);
  const [tags, setTags] = useState<string[]>(initial);
  const [draft, setDraft] = useState<string[]>(initial);
  const [input, setInput] = useState('');
  const [saving, setSaving] = useState(false);

  const addTag = (raw: string) => {
    const v = raw.trim();
    if (!v) return;
    if (draft.includes(v)) return;
    setDraft((d) => [...d, v]);
    setInput('');
  };

  const removeTag = (v: string) => {
    setDraft((d) => d.filter((x) => x !== v));
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
  // ✅ 한글 입력 조합 중이면 아무 것도 하지 않음
  if (e.nativeEvent.isComposing) return;

  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault();
    addTag(e.currentTarget.value); // ✅ 여기서도 input 대신 현재 값 사용
  }

  if (e.key === 'Backspace' && e.currentTarget.value === '' && draft.length) {
    removeTag(draft[draft.length - 1]);
  }
};

  const startEdit = () => {
    setDraft(tags);
    setEditing(true);
  };

  const cancelEdit = () => {
    setDraft(tags);
    setInput('');
    setEditing(false);
  };

  const save = async () => {
    try {
      setSaving(true);
      await updatePreferencesArray(draft);
      setTags(draft);
      setEditing(false);
      show?.('선호 운동이 저장됐어요.');
    } catch (e) {
      console.error(e);
      show?.('저장에 실패했어요. 잠시 후 다시 시도해 주세요.');
    } finally {
      setSaving(false);
    }
  };

  // 공통 뱃지 톤에 맞춘 pill
  const Pill = ({ children, onRemove }: { children: React.ReactNode; onRemove?: () => void }) => (
    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-card/50 px-3 py-1 text-sm">
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label="삭제"
          className="opacity-70 hover:opacity-100"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );

  if (!editing) {
    // 보기 모드
    return (
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {tags.length ? (
            tags.map((t) => <Pill key={t}>{t}</Pill>)
          ) : (
            <span className="text-sm text-muted-foreground">선호 운동 정보 없음</span>
          )}
        </div>
      <Button
  type="button"
  variant="ghost"
  onClick={startEdit}
  className="p-1.5 gap-0"
>
  <Pencil className="h-4 w-4" />
</Button>

      </div>
    );
  }

  // 편집 모드
return (
  <div className="space-y-3">
    <div className="flex flex-wrap gap-2">
      {draft.map((t) => (
        <Pill key={t} onRemove={() => removeTag(t)}>
          {t}
        </Pill>
      ))}
    </div>

    {/* ✅ 한 줄에 정렬 + Card 밖으로 안 튀어나가게 */}
    <div className="flex items-center gap-2">
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="입력해주세요"
        className="flex-1 min-w-0 rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
        aria-label="선호 운동 추가"
        maxLength={20}
      />
      <Button
        type="button"
        size="sm"
        onClick={() => addTag(input)}
        className="shrink-0"
      >
        <Plus className="h-4 w-4 mr-1" />
      </Button>
      <Button
        type="button"
        size="sm"
        variant="default"
        onClick={save}
        disabled={saving}
        className="shrink-0"
      >
        <Check className="h-4 w-4 mr-1" />
        {saving ? '저장중…' : ''}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={cancelEdit}
        className="shrink-0"
      >
        <X className="h-4 w-4 mr-1" />
      </Button>
    </div>
  </div>
);

}
