'use client';

import { useState } from 'react';
import { Button } from '@/components/common/Button';
import { updatePreferencesArray } from '@/app/(view)/(main)/mypage/actions';
import { X, Pencil, Check } from 'lucide-react'; // 👈 Plus 제거
import { useToast } from '@/app/(view)/(main)/mypage/components/Toast';

type Props = {
  initial: string[];
  options: string[]; // 👈 Supabase에서 내려준 운동 리스트
};

export default function PreferredExercisesEditor({ initial, options }: Props) {
  const { show } = useToast?.() ?? { show: () => {} };
  const [editing, setEditing] = useState(false);
  const [tags, setTags] = useState<string[]>(initial);
  const [draft, setDraft] = useState<string[]>(initial);
  const [saving, setSaving] = useState(false); // 👈 selected 제거

  const addTag = (raw: string) => {
    const v = raw.trim();
    if (!v) return;
    if (draft.includes(v)) return; // 중복 방지
    setDraft((d) => [...d, v]);
  };

  const removeTag = (v: string) => {
    setDraft((d) => d.filter((x) => x !== v));
  };

  const startEdit = () => {
    setDraft(tags);
    setEditing(true);
  };

  const cancelEdit = () => {
    setDraft(tags);
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

  // pill UI 공통
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

  // 이미 선택된 태그는 드롭다운에서 숨기기
  const availableOptions = options.filter((opt) => !draft.includes(opt));

  // 보기 모드
  if (!editing) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {tags.length ? (
            tags.map((t) => <Pill key={t}>{t}</Pill>)
          ) : (
            <span className="text-sm text-muted-foreground">선호 운동 정보 없음</span>
          )}
        </div>
        <Button type="button" variant="ghost" onClick={startEdit} className="p-1.5 gap-0">
          <Pencil className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  // 드롭다운에서 선택하면 바로 추가
  const handleSelectChange: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    const value = e.target.value;
    if (!value) return;
    addTag(value);
    // value를 ""로 고정해두기 때문에 선택 후 자동으로 placeholder로 돌아감
  };

  // 편집 모드
  return (
    <div className="space-y-3">
      {/* 선택된 태그들 */}
      <div className="flex flex-wrap gap-2">
        {draft.map((t) => (
          <Pill key={t} onRemove={() => removeTag(t)}>
            {t}
          </Pill>
        ))}
      </div>

      {/* 드롭다운 + 저장/취소 */}
      <div className="flex flex-wrap items-center gap-2">
        <select
          value="" // 항상 placeholder 상태
          onChange={handleSelectChange}
          className="flex-1 min-w-0 rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
        >
          <option value="">운동을 선택해주세요</option>
          {availableOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>

        {/* 저장 버튼 */}
        <Button
          type="button"
          size="sm"
          variant="default"
          onClick={save}
          disabled={saving}
          className="shrink-0"
        >
          <Check className="h-4 w-4 mr-1" />
        </Button>

        {/* 취소 버튼 */}
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
