export interface UserProfile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  email: string | null;
  credit_balance: number;
  tier: 'free' | 'pro' | 'max';
  created_at: string;
  updated_at: string;
}

export type GenerationStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type GenerationType = 'image' | 'video';

export interface GenerationParams {
  prompt: string;
  negative_prompt?: string;
  aspect_ratio: string;
  model_used: string;
  image_reference?: string;
  num_inference_steps?: number;
  guidance_scale?: number;
  seed?: number;
  width?: number;
  height?: number;
}

export interface Generation {
  id: string;
  user_id: string;
  prompt: string;
  negative_prompt: string;
  image_url: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  model_used: string;
  generation_type: GenerationType;
  parameters: GenerationParams;
  aspect_ratio: string;
  seed: number | null;
  status: GenerationStatus;
  error_message: string | null;
  credits_used: number;
  is_public: boolean;
  likes_count: number;
  remix_count: number;
  remixed_from: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface CreditTransaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'signup_bonus' | 'purchase' | 'generation' | 'refund' | 'bonus';
  description: string | null;
  generation_id: string | null;
  stripe_payment_id: string | null;
  balance_after: number;
  created_at: string;
}

export interface ModelConfig {
  id: string;
  name: string;
  description: string;
  type: GenerationType;
  cost_credits: number;
  thumbnail: string;
}
