import { api } from '@/lib/axios';

export async function deleteActivity(id: string) {
  return api.delete(`/api/mypage/activities/${id}`);
}
