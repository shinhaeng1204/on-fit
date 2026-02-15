export interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export interface Profile {
  id: string;
  nickname: string;
  profile_image: string | null;
}

export interface RoomInfoData {
  title: string;
  location: string;
  created_at: string;
  current_participants: number;
  max_participants: number;
  host : Profile
}