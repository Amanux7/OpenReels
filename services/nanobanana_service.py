import logging
import base64
import io
import os
import uuid
import httpx
from typing import Optional, Tuple
from PIL import Image

from google import genai
from google.genai import types

from config import settings
from services.supabase_storage import upload_image_bytes, create_generation_record

logger = logging.getLogger("nanobanana_service")

# Initialize the Google GenAI client if API key is provided
if settings.GOOGLE_API_KEY:
    client = genai.Client(api_key=settings.GOOGLE_API_KEY)
else:
    client = None
    logger.warning("GOOGLE_API_KEY not set. Nano Banana (Gemini Flash Image) will run in Mock Mode.")


async def load_image_from_input(image_input: str) -> Image.Image:
    """
    Decodes reference image from URL or Base64 (with or without data URI header).
    """
    if not image_input:
        raise ValueError("Image input is empty.")

    # 1. Base64 Data URI
    if image_input.startswith("data:image/"):
        try:
            header, base64_data = image_input.split(",", 1)
            image_bytes = base64.b64decode(base64_data)
            return Image.open(io.BytesIO(image_bytes))
        except Exception as e:
            raise ValueError(f"Failed to decode data URI Base64: {str(e)}")
            
    # 2. HTTP/HTTPS URL
    elif image_input.startswith("http://") or image_input.startswith("https://"):
        try:
            async with httpx.AsyncClient() as httpx_client:
                response = await httpx_client.get(image_input)
                response.raise_for_status()
                return Image.open(io.BytesIO(response.content))
        except Exception as e:
            raise ValueError(f"Failed to fetch image from URL: {str(e)}")
            
    # 3. Raw Base64 string fallback
    else:
        try:
            image_bytes = base64.b64decode(image_input)
            return Image.open(io.BytesIO(image_bytes))
        except Exception as e:
            raise ValueError(f"Failed to decode raw Base64 string: {str(e)}")


async def generate_nanobanana_image(
    prompt: str,
    reference_image: Optional[str] = None,
    aspect_ratio: str = "16:9",
    user_id: Optional[str] = None
) -> Tuple[str, str]:
    """
    Generates or edits an image using Gemini 3.1 Flash Image.
    Uploads result to Supabase Storage and records metadata in the database.

    Args:
        prompt: The generation prompt or edit instruction.
        reference_image: Optional Base64 payload or URL for Image-to-Image editing.
        aspect_ratio: Configured aspect ratio (e.g. "16:9", "1:1", "9:16").
        user_id: The UUID of the user triggering the generation.

    Returns:
        Tuple[str, str]: (generation_id, image_url)
    """
    # 1. Handle Mock Mode fallback if client or API key is not configured
    if not client or not settings.GOOGLE_API_KEY:
        logger.warning("Running generate_nanobanana_image in Mock Mode.")
        
        # Load a default mock image
        mock_file = os.path.join("public", "mock-generations", "cyberpunk_city.png")
        if os.path.exists(mock_file):
            with open(mock_file, "rb") as f:
                image_bytes = f.read()
        else:
            # Fallback: create a dummy solid color image using Pillow
            img = Image.new("RGB", (1024, 1024), color=(255, 105, 180)) # Neon Banana Pink
            buffer = io.BytesIO()
            img.save(buffer, format="PNG")
            image_bytes = buffer.getvalue()
            
        filename = f"nanobanana-mock-{uuid.uuid4()}.png"
        image_url = await upload_image_bytes(image_bytes, filename)
        generation_id = await create_generation_record(
            user_id=user_id or "00000000-0000-0000-0000-000000000000",
            prompt=prompt,
            image_url=image_url,
            model_used="gemini-3.1-flash-image (Mock)",
            aspect_ratio=aspect_ratio
        )
        return generation_id, image_url

    # 2. Build model contents
    contents = []
    if reference_image:
        logger.info("Reference image detected. Preparing Image-to-Image request.")
        try:
            pil_image = await load_image_from_input(reference_image)
            contents.append(pil_image)
        except Exception as e:
            logger.error(f"Image loading failed: {str(e)}")
            raise RuntimeError(f"Reference image processing error: {str(e)}")
            
    contents.append(prompt)

    # 3. Call Gemini 3.1 Flash Image model asynchronously
    try:
        logger.info(f"Submitting Gemini 3.1 Flash Image generation: prompt='{prompt}', aspect_ratio={aspect_ratio}")
        
        # Call Google GenAI SDK asynchronously
        response = await client.aio.models.generate_content(
            model='gemini-3.1-flash-image',
            contents=contents,
            config=types.GenerateContentConfig(
                response_modalities=["IMAGE"],
                image_config=types.ImageConfig(
                    aspect_ratio=aspect_ratio
                )
            )
        )
        
        # 4. Extract generated image bytes
        image_bytes = None
        if response.candidates and response.candidates[0].content.parts:
            for part in response.candidates[0].content.parts:
                if part.inline_data:
                    image_bytes = part.inline_data.data
                    break
        
        if not image_bytes:
            raise ValueError("No image data found in Gemini Flash Image response candidates.")
            
        # 5. Upload image and create database record
        filename = f"nanobanana-{uuid.uuid4()}.png"
        image_url = await upload_image_bytes(image_bytes, filename)
        
        generation_id = await create_generation_record(
            user_id=user_id or "00000000-0000-0000-0000-000000000000",
            prompt=prompt,
            image_url=image_url,
            model_used="gemini-3.1-flash-image",
            aspect_ratio=aspect_ratio
        )
        
        return generation_id, image_url

    except Exception as e:
        logger.error(f"Gemini 3.1 Flash Image API call failed: {str(e)}")
        raise RuntimeError(f"Nano Banana image generation failed: {str(e)}")
