import { ModelConfig, Generation } from './types';

export const MODELS: ModelConfig[] = [
  {
    id: 'flux-schnell',
    name: 'Flux.1 Schnell',
    description: 'Ultra-fast, high-quality images. Best for quick prototyping.',
    type: 'image',
    cost_credits: 1,
    thumbnail: '/mock-generations/cyberpunk_city.png'
  },
  {
    id: 'sdxl',
    name: 'SDXL 1.0',
    description: 'Stable Diffusion XL. Excellent prompt adherence and photorealism.',
    type: 'image',
    cost_credits: 1,
    thumbnail: '/mock-generations/mystical_forest.png'
  },
  {
    id: 'flux-dev',
    name: 'Flux.1 Dev',
    description: 'Base model for complex prompt adherence, high detail, and photorealistic text.',
    type: 'image',
    cost_credits: 2,
    thumbnail: '/mock-generations/futuristic_astronaut.png'
  },
  {
    id: 'google-imagen',
    name: 'Google Imagen 3.0',
    description: "Google's state-of-the-art photorealistic image generation model.",
    type: 'image',
    cost_credits: 3,
    thumbnail: '/mock-generations/mystical_forest.png'
  },
  {
    id: 'nanobanana',
    name: 'Nano Banana (Gemini 3.1 Flash Image)',
    description: 'Ultra-fast, responsive Google model for text-to-image and editing.',
    type: 'image',
    cost_credits: 2,
    thumbnail: '/mock-generations/cyberpunk_city.png'
  },
  {
    id: 'svd',
    name: 'Stable Video Diffusion',
    description: 'Create cinematic 3-4 second video clips from images or prompts.',
    type: 'video',
    cost_credits: 5,
    thumbnail: '/mock-generations/steampunk_watch.png'
  },
  {
    id: 'seedance',
    name: 'Seedance 2.0 (Fal.ai)',
    description: "ByteDance's premium cinematic video generation.",
    type: 'video',
    cost_credits: 8,
    thumbnail: '/mock-generations/steampunk_watch.png'
  },
  {
    id: 'kling',
    name: 'Kling AI',
    description: 'Next-gen video generation with realistic textures and motion.',
    type: 'video',
    cost_credits: 7,
    thumbnail: '/mock-generations/futuristic_astronaut.png'
  }
];

export const ASPECT_RATIOS = [
  { label: '1:1 Square', value: '1:1', width: 1024, height: 1024, icon: 'Square' },
  { label: '16:9 Cinema', value: '16:9', width: 1344, height: 768, icon: 'Tv' },
  { label: '9:16 Portrait', value: '9:16', width: 768, height: 1344, icon: 'Smartphone' },
  { label: '4:3 Photo', value: '4:3', width: 1152, height: 864, icon: 'Image' },
  { label: '21:9 Ultra-Wide', value: '21:9', width: 1536, height: 648, icon: 'Monitor' }
];

export const MOCK_GENERATION_HISTORY: Generation[] = [
  {
    id: 'gen-1',
    user_id: 'user-1',
    prompt: 'Stunning cyberpunk metropolis at night with glowing neon billboards, flying vehicles, rain-slicked streets reflecting vibrant purple and cyan lights, cinematic composition, photorealistic, 8k resolution.',
    negative_prompt: 'blurry, low quality, distorted, extra limbs',
    image_url: '/mock-generations/cyberpunk_city.png',
    video_url: null,
    thumbnail_url: '/mock-generations/cyberpunk_city.png',
    model_used: 'flux-schnell',
    generation_type: 'image',
    parameters: {
      prompt: 'Stunning cyberpunk metropolis at night with glowing neon billboards, flying vehicles, rain-slicked streets reflecting vibrant purple and cyan lights, cinematic composition, photorealistic, 8k resolution.',
      negative_prompt: 'blurry, low quality, distorted, extra limbs',
      aspect_ratio: '16:9',
      model_used: 'flux-schnell',
      num_inference_steps: 28,
      guidance_scale: 7.5,
      seed: 4892019348
    },
    aspect_ratio: '16:9',
    seed: 4892019348,
    status: 'completed',
    error_message: null,
    credits_used: 1,
    is_public: true,
    likes_count: 24,
    remix_count: 3,
    remixed_from: null,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
    completed_at: new Date(Date.now() - 3600000 * 2 + 5000).toISOString()
  },
  {
    id: 'gen-2',
    user_id: 'user-1',
    prompt: 'Enchanted mystical forest at twilight, glowing bioluminescent mushrooms and flowers, ancient gnarled trees with roots glowing, fireflies drifting in the air, a small sparkling stream running through, magical atmosphere, hyper-detailed, fantasy art.',
    negative_prompt: 'ugly, deformed, noise, watermark',
    image_url: '/mock-generations/mystical_forest.png',
    video_url: null,
    thumbnail_url: '/mock-generations/mystical_forest.png',
    model_used: 'sdxl',
    generation_type: 'image',
    parameters: {
      prompt: 'Enchanted mystical forest at twilight, glowing bioluminescent mushrooms and flowers, ancient gnarled trees with roots glowing, fireflies drifting in the air, a small sparkling stream running through, magical atmosphere, hyper-detailed, fantasy art.',
      negative_prompt: 'ugly, deformed, noise, watermark',
      aspect_ratio: '1:1',
      model_used: 'sdxl',
      num_inference_steps: 30,
      guidance_scale: 8.0,
      seed: 1029384756
    },
    aspect_ratio: '1:1',
    seed: 1029384756,
    status: 'completed',
    error_message: null,
    credits_used: 1,
    is_public: true,
    likes_count: 42,
    remix_count: 8,
    remixed_from: null,
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(), // 5 hours ago
    completed_at: new Date(Date.now() - 3600000 * 5 + 8000).toISOString()
  },
  {
    id: 'gen-3',
    user_id: 'user-1',
    prompt: 'Futuristic astronaut standing on a rust-colored alien planet looking at a giant gas giant planet in the sky, nebula background, gold visor reflecting the stars, cinematic lighting, epic scale, concept art.',
    negative_prompt: 'text, logo, crop, duplicate',
    image_url: '/mock-generations/futuristic_astronaut.png',
    video_url: null,
    thumbnail_url: '/mock-generations/futuristic_astronaut.png',
    model_used: 'flux-dev',
    generation_type: 'image',
    parameters: {
      prompt: 'Futuristic astronaut standing on a rust-colored alien planet looking at a giant gas giant planet in the sky, nebula background, gold visor reflecting the stars, cinematic lighting, epic scale, concept art.',
      negative_prompt: 'text, logo, crop, duplicate',
      aspect_ratio: '9:16',
      model_used: 'flux-dev',
      num_inference_steps: 40,
      guidance_scale: 6.5,
      seed: 9876543210
    },
    aspect_ratio: '9:16',
    seed: 9876543210,
    status: 'completed',
    error_message: null,
    credits_used: 2,
    is_public: false,
    likes_count: 0,
    remix_count: 0,
    remixed_from: null,
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(), // 12 hours ago
    completed_at: new Date(Date.now() - 3600000 * 12 + 12000).toISOString()
  },
  {
    id: 'gen-4',
    user_id: 'user-1',
    prompt: 'Ornate steampunk pocket watch resting on dark velvet, brass and copper gears visible, intricate filigree, soft golden light, dust motes floating in rays of light, macro photography, depth of field.',
    negative_prompt: 'painting, cartoon, digital art, illustration',
    image_url: '/mock-generations/steampunk_watch.png',
    video_url: null,
    thumbnail_url: '/mock-generations/steampunk_watch.png',
    model_used: 'flux-schnell',
    generation_type: 'image',
    parameters: {
      prompt: 'Ornate steampunk pocket watch resting on dark velvet, brass and copper gears visible, intricate filigree, soft golden light, dust motes floating in rays of light, macro photography, depth of field.',
      negative_prompt: 'painting, cartoon, digital art, illustration',
      aspect_ratio: '4:3',
      model_used: 'flux-schnell',
      num_inference_steps: 25,
      guidance_scale: 7.0,
      seed: 5544332211
    },
    aspect_ratio: '4:3',
    seed: 5544332211,
    status: 'completed',
    error_message: null,
    credits_used: 1,
    is_public: true,
    likes_count: 15,
    remix_count: 1,
    remixed_from: null,
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(), // 1 day ago
    completed_at: new Date(Date.now() - 3600000 * 24 + 4000).toISOString()
  }
];
