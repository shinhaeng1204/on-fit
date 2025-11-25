export type Review = {
  id: string;
  reviewer_id: string;
  target_user_id: string;
  room_id: string;
  content: string;
  created_at: string;

  reviewer?: {
    id: string;
    nickname: string;
    profile_image?: string | null;
  };

  room?: {
    id: string;
    name?: string | null;
  };
};
