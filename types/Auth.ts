export type LoginResponse = {
  expires_at: number;   // epoch ms (can include decimals)
  token: string;
  user: {
    compareWithPeer: boolean;
    enrolled_units: Array<{
      semester: string;
      unit_code: string;
      unit_id: number;
      unit_name: string;
      genai_permitted: boolean;
    }>;
    name: string;
    username: string;
  };
};
