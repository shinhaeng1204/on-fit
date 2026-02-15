export type ReviewUser = {
  id: string;
  nickname: string | null;
  profile_image: string | null;
};

export type ReviewRoom = {
  id: string;
  name: string | null;
};

export type Review = {
  id: string;
  reviewer_id: string;
  target_user_id: string;
  room_id: string;
  content: string;
  created_at: string;

  reviewer?: ReviewUser | null;

  room?: ReviewRoom | null;
};
