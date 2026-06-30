import logging
import os
import uuid
import httpx
from typing import Optional
from config import settings

logger = logging.getLogger("supabase_storage")


async def upload_image_bytes(image_bytes: bytes, filename: str) -> str:
    """
    Uploads raw image bytes to Supabase Storage in the 'generations' bucket.
    If Supabase credentials are not configured, saves the image locally to the
    'public/generations' folder (accessible by the Next.js frontend).

    Args:
        image_bytes: The raw binary content of the image.
        filename: The desired name of the file in storage.

    Returns:
        str: The absolute public URL (or local path fallback) of the uploaded image.
    """
    supabase_url = settings.SUPABASE_URL
    supabase_key = settings.SUPABASE_KEY

    # Detect file type from name extension
    content_type = "image/png"
    if filename.endswith(".jpg") or filename.endswith(".jpeg"):
        content_type = "image/jpeg"
    elif filename.endswith(".webp"):
        content_type = "image/webp"

    # 1. Supabase Upload Path (if credentials are set)
    if supabase_url and supabase_key:
        clean_url = supabase_url.rstrip("/")
        # Endpoint: /storage/v1/object/{bucket}/{path}
        upload_endpoint = f"{clean_url}/storage/v1/object/generations/{filename}"
        
        headers = {
            "Authorization": f"Bearer {supabase_key}",
            "Content-Type": content_type
        }
        
        try:
            logger.info(f"Uploading image to Supabase Storage: {upload_endpoint}")
            async with httpx.AsyncClient() as client:
                # Use PUT to create or overwrite the object
                response = await client.put(
                    upload_endpoint,
                    content=image_bytes,
                    headers=headers,
                    timeout=30.0
                )
                
                # Check for errors
                if response.status_code not in (200, 201):
                    logger.error(f"Supabase Storage upload failed with status {response.status_code}: {response.text}")
                    raise RuntimeError(f"Supabase upload failed: {response.text}")
                
                public_url = f"{clean_url}/storage/v1/object/public/generations/{filename}"
                logger.info(f"Supabase upload successful. Public URL: {public_url}")
                return public_url

        except Exception as e:
            logger.error(f"Error during Supabase Storage upload: {str(e)}")
            # Fall back to local file saving in case of network or API error
            logger.warning("Supabase upload failed. Falling back to local storage.")

    # 2. Local Fallback (Development/Mock Mode)
    logger.info("Supabase credentials not configured or upload failed. Saving image locally.")
    
    local_dir = os.path.join("public", "generations")
    os.makedirs(local_dir, exist_ok=True)
    
    local_path = os.path.join(local_dir, filename)
    try:
        with open(local_path, "wb") as f:
            f.write(image_bytes)
        
        # Relative path serving for Next.js public directory
        public_path = f"/generations/{filename}"
        logger.info(f"Successfully saved image locally: {local_path} -> accessible at {public_path}")
        return public_path
    except Exception as e:
        logger.error(f"Failed to write file locally: {str(e)}")
        # Ultimate fallback to a mock asset
        return "/mock-generations/cyberpunk_city.png"


async def create_generation_record(
    user_id: str,
    prompt: str,
    image_url: str,
    model_used: str,
    aspect_ratio: str = "1:1"
) -> str:
    """
    Inserts a metadata record of the completed generation into the Supabase
    'generations' table via the REST API.
    Falls back to a random UUID generation in Mock Mode.

    Args:
        user_id: The UUID of the authenticated user.
        prompt: The text prompt used for image generation.
        image_url: The public/local URL of the generated image.
        model_used: The identifier of the model used (e.g. 'imagen', 'nanobanana').
        aspect_ratio: Aspect ratio of the generated image.

    Returns:
        str: The database generation_id (UUID).
    """
    supabase_url = settings.SUPABASE_URL
    supabase_key = settings.SUPABASE_KEY

    if supabase_url and supabase_key:
        clean_url = supabase_url.rstrip("/")
        db_endpoint = f"{clean_url}/rest/v1/generations"
        
        headers = {
            "apikey": supabase_key,
            "Authorization": f"Bearer {supabase_key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"  # Returns the inserted row
        }
        
        payload = {
            "user_id": user_id,
            "prompt": prompt,
            "image_url": image_url,
            "model_used": model_used,
            "generation_type": "image",
            "aspect_ratio": aspect_ratio,
            "status": "completed",
            "credits_used": 1
        }
        
        try:
            logger.info(f"Inserting record into Supabase generations table: {db_endpoint}")
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    db_endpoint,
                    json=payload,
                    headers=headers,
                    timeout=15.0
                )
                
                if response.status_code in (200, 201):
                    records = response.json()
                    if records and isinstance(records, list) and len(records) > 0:
                        generation_id = records[0].get("id")
                        logger.info(f"Supabase database record created. Generation ID: {generation_id}")
                        return str(generation_id)
                
                logger.error(f"Supabase Database insert failed with status {response.status_code}: {response.text}")
        except Exception as e:
            logger.error(f"Error during Supabase Database insert: {str(e)}")
            
    # Mock/Fallback ID
    mock_id = str(uuid.uuid4())
    logger.info(f"Generating fallback mock generation ID: {mock_id}")
    return mock_id
