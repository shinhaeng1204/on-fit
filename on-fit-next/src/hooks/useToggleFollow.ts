import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useToggleFollow(profileId: string, userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (isFollowing: boolean) => {
      if (isFollowing) {
        return fetch(`/api/profile-modal/follow?target=${profileId}`, {
          method: "DELETE",
        }).then((r) => r.json());
      } else {
        return fetch(`/api/profile-modal/follow`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ target: profileId }),
        }).then((r) => r.json());
      }
    },

    /** 🔥 Optimistic update */
    onMutate: async (prevIsFollowing) => {
      if (!userId) return;

      // 프로필 캐시 pause
      await queryClient.cancelQueries(["profile", profileId]);

      // 기존 데이터 가져오기
      const prevData = queryClient.getQueryData(["profile", profileId]);

      // 낙관적 업데이트
      queryClient.setQueryData(["profile", profileId], (old: any) => {
        if (!old) return old;

        return {
          ...old,
          followers: prevIsFollowing
            ? (old.followers ?? []).filter((id: string) => id !== userId)
            : [...(old.followers ?? []), userId],
        };
      });

      return { prevData };
    },

    /** 실패 시 rollback */
    onError: (err, _, context) => {
      if (context?.prevData) {
        queryClient.setQueryData(["profile", profileId], context.prevData);
      }
      alert("에러가 발생했습니다.");
    },

    /** 성공 시 refetch */
    onSettled: () => {
      queryClient.invalidateQueries(["profile", profileId]);
    },
  });
}
