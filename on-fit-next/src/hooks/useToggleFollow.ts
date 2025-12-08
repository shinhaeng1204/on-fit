import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useToggleFollow(profileId: string, userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (isFollowing: boolean) => {
      if (isFollowing) {
        return fetch(`/api/profile-modal/follow?target=${profileId}`, {
          method: "DELETE",
        }).then((r) => r.json());
      }

      return fetch(`/api/profile-modal/follow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: profileId }),
      }).then((r) => r.json());
    },

    onMutate: async (prevIsFollowing) => {
      if (!userId) return;

      // 🔥 정확한 v5 API
      await queryClient.cancelQueries({ queryKey: ["profile", profileId] });

      // 🔥 getQueryData는 배열만 받음
      const prevData = queryClient.getQueryData<{
        followers: string[];
        isFollowing: boolean;
      }>(["profile", profileId]);

      // 👉 낙관적 업데이트
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

    onError: (_err, _vars, context) => {
      if (context?.prevData) {
        queryClient.setQueryData(["profile", profileId], context.prevData);
      }
      alert("에러가 발생했습니다.");
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", profileId] });
      queryClient.invalidateQueries({ queryKey: ["post-host"] });
    },
  });
}
