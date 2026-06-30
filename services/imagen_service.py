import logging
import io
import os
import uuid
from typing import Optional, Tuple
from PIL import Image

from google import genai
from google.genai import types

from config import settings
from services.supabase_storage import upload_image_bytes, create_generation_record

logger = logging.getLogger("imagen_service")

# Initialize the Google GenAI client if API key is provided
if settings.GOOGLE_API_KEY:
    client = genai.Client(api_key=settings.GOOGLE_API_KEY)
else:
    client = None
    logger.warning("GOOGLE_API_KEY not set. Google Imagen will run in Mock Mode.")


async def generate_imagen_image(
    prompt: str,
    aspect_ratio: str = "1:1",
    user_id: Optional[str] = None
) -> Tuple[str, str]:
    """
    Generates an image using Google Imagen 3.0.
    Uploads the output to Supabase Storage and records metadata in the database.

    Args:
        prompt: The text prompt describing the image.
        aspect_ratio: Configured aspect ratio (e.g. "1:1", "3:4", "4:3", "9:16", "16:9").
        user_id: The UUID of the user triggering the generation.

    Returns:
        Tuple[str, str]: (generation_id, image_url)
    """
    # 1. Handle Mock Mode fallback if client or API key is not configured
    if not client or not settings.GOOGLE_API_KEY:
        logger.warning("Running generate_imagen_image in Mock Mode.")
        
        # Load a default mock image
        mock_file = os.path.join("public", "mock-generations", "mystical_forest.png")
        if os.path.exists(mock_file):
            with open(mock_file, "rb") as f:
                image_bytes = f.read()
        else:
            # Fallback: create a dummy solid color image using Pillow
            img = Image.new("RGB", (1024, 1024), color=(34, 139, 34)) # Forest Green
            buffer = io.BytesIO()
            img.save(buffer, format="PNG")
            image_bytes = buffer.getvalue()
            
        filename = f"imagen-mock-{uuid.uuid4()}.png"
        image_url = await upload_image_bytes(image_bytes, filename)
        generation_id = await create_generation_record(
            user_id=user_id or "00000000-0000-0000-0000-000000000000",
            prompt=prompt,
            image_url=image_url,
            model_used="imagen-3.0-generate-002 (Mock)",
            aspect_ratio=aspect_ratio
        )
        return generation_id, image_url

    # 2. Call Google Imagen model asynchronously via GenAI SDK
    try:
        logger.info(f"Submitting Google Imagen generation: prompt='{prompt}', aspect_ratio={aspect_ratio}")
        
        # Call Google GenAI SDK asynchronously
        response = await client.aio.models.generate_images(
            model='imagen-3.0-generate-002',
            prompt=prompt,
            config=types.GenerateImagesConfig(
                number_of_images=1,
                aspect_ratio=aspect_ratio,
                output_mime_type="image/png"
            )
        )
        
        # 3. Extract generated image bytes
        if not response.generated_images:
            raise ValueError("No images generated in Imagen response.")
            
        generated_img_obj = response.generated_images[0]
        
        # In Google GenAI SDK, generated_image.image could be a PIL Image or bytes.
        # We handle both formats robustly.
        if isinstance(generated_img_obj.image, bytes):
            image_bytes = generated_img_obj.image
        else:
            # Assume it is a PIL Image object
            buffer = io.BytesIO()
            generated_img_obj.image.save(buffer, format="PNG")
            image_bytes = buffer.getvalue()
            
        # 4. Upload image and create database record
        filename = f"imagen-{uuid.uuid4()}.png"
        image_url = await upload_image_bytes(image_bytes, filename)
        
        generation_id = await create_generation_record(
            user_id=user_id or "00000000-0000-0000-0000-000000000000",
            prompt=prompt,
            image_url=image_url,
            model_used="imagen-3.0-generate-002",
            aspect_ratio=aspect_ratio
        )
        
        return generation_id, image_url

    except Exception as e:
        logger.error(f"Google Imagen API call failed: {str(e)}")
        raise RuntimeError(f"Imagen image generation failed: {str(e)}")
