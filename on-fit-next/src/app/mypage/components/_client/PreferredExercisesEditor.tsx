'use client';

import { useState } from 'react';
import { Button } from '@/components/common/Button';
import { updatePreferencesArray } from '@/app/mypage/actions';
import { Plus, X, Pencil, Check } from 'lucide-react';
import { useToast } from '@/app/mypage/components/Toast';

type Props = {
  initial: string[];
  options: string[]; // 👈 Supabase에서 내려준 운동 리스트
};

export default function PreferredExercisesEditor({ initial, options }: Props) {
  const { show } = useToast?.() ?? { show: () => {} };
  const [editing, setEditing] = useState(false);
  const [tags, setTags] = useState<string[]>(initial);
  const [draft, setDraft] = useState<string[]>(initial);
  const [selected, setSelected] = useState<string>(''); // 👈 셀렉트 박스에서 선택된 값
  const [saving, setSaving] = useState(false);

  const addTag = (raw: string) => {
    const v = raw.trim();
    if (!v) return;
    if (draft.includes(v)) return; // 중복 방지
    setDraft((d) => [...d, v]);
    setSelected('');
  };

  const removeTag = (v: string) => {
    setDraft((d) => d.filter((x) => x !== v));
  };

  const startEdit = () => {
    setDraft(tags);
    setSelected('');
    setEditing(true);
  };

  const cancelEdit = () => {
    setDraft(tags);
    setSelected('');
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

  // =======================
  // 보기 모드
  // =======================
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

  // =======================
  // 편집 모드
  // =======================
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

      {/* 드롭다운 + 버튼들 */}
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="flex-1 min-w-0 rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
        >
          <option value="">운동을 선택해주세요</option>
          {availableOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>

        {/* 태그 추가 버튼 */}
        <Button
          type="button"
          size="sm"
          onClick={() => selected && addTag(selected)}
          disabled={!selected}
          className="shrink-0"
        >
          <Plus className="h-4 w-4 mr-1" />
          
        </Button>

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
