import logging
from typing import Optional
import google.generativeai as genai

from config import settings

logger = logging.getLogger("gemini_service")

# Configure Google Generative AI SDK if API key is provided
if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)
else:
    logger.warning("GEMINI_API_KEY is not configured. Gemini services will run in Mock mode.")


async def enhance_prompt_with_flash(user_prompt: str, target_model: str) -> str:
    """
    Asynchronously rewrites a short user prompt into a highly detailed,
    comma-separated cinematic prompt optimized specifically for the target model.

    Args:
        user_prompt: The initial short prompt from the user.
        target_model: The name of the target video model ('seedance' or 'kling').

    Returns:
        str: The enhanced cinematic prompt.
    """
    target = target_model.strip().lower()
    
    # 1. Determine prompt enhancement instructions based on the model
    if "seedance" in target:
        system_instruction = (
            "You are a professional cinematic prompt engineer for AI video generation. "
            "Rewrite the user's short prompt into a highly detailed, comma-separated cinematic prompt "
            "optimized for Seedance 2.0. "
            "Focus heavily on camera movements (e.g. slow crane shot, dramatic tracking, smooth pan, zoom), "
            "continuity, cinematic aspect ratios, lens type, lighting style (e.g. volumetric, rim lighting, anamorphic flare), "
            "and motion detail. "
            "Output ONLY the enhanced prompt as a single paragraph. "
            "Do not include any preamble, explanations, notes, or markdown formatting."
        )
    else:  # Default/Kling
        system_instruction = (
            "You are a professional cinematic prompt engineer for AI video generation. "
            "Rewrite the user's short prompt into a highly detailed, comma-separated cinematic prompt "
            "optimized for Kling AI. "
            "Focus on intricate visual aesthetics, hyper-realistic textures, dynamic actions, characters, "
            "scene composition, and cinematic environment details (e.g. 8k resolution, raytracing, unreal engine render). "
            "Output ONLY the enhanced prompt as a single paragraph. "
            "Do not include any preamble, explanations, notes, or markdown formatting."
        )

    # 2. Check for Gemini API key and handle fallback mock mode
    if not settings.GEMINI_API_KEY:
        logger.warning(
            f"Gemini API key not found. Performing mock prompt enhancement for target model: {target_model}"
        )
        if "seedance" in target:
            return (
                f"{user_prompt}, cinematic slow-motion crane shot, "
                f"volumetric lighting, highly detailed camera movements, "
                f"smooth transitions, photorealistic 8k, Seedance 2.0 optimized"
            )
        else:
            return (
                f"{user_prompt}, hyper-realistic textures, 8k resolution, "
                f"ray-traced shadows, dynamic lighting, cinematic framing, "
                f"Kling AI optimized"
            )

    # 3. Call Gemini 1.5 Flash Model
    try:
        model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            system_instruction=system_instruction
        )
        
        logger.info(f"Sending prompt to Gemini 1.5 Flash for target model: {target}")
        response = await model.generate_content_async(
            user_prompt,
            generation_config={"temperature": 0.7}
        )
        
        enhanced_text = response.text.strip()
        
        # Strip any accidental markdown formatting the model might generate
        if enhanced_text.startswith("```"):
            enhanced_text = enhanced_text.replace("```", "").strip()
        if enhanced_text.startswith("enhanced prompt:"):
            enhanced_text = enhanced_text.split("enhanced prompt:")[-1].strip()
            
        logger.info("Prompt enhanced successfully by Gemini.")
        return enhanced_text

    except Exception as e:
        logger.error(f"Gemini prompt enhancement failed: {str(e)}")
        # Graceful degradation fallback
        return f"{user_prompt}, detailed cinematic render, professional lighting, 8k resolution"
