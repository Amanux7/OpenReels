import logging
import uuid
from typing import Optional, Dict, Any
import httpx

from config import settings
from services.base import VideoGenerationAdapter

logger = logging.getLogger("kling_service")


class KlingAdapter(VideoGenerationAdapter):
    """
    Adapter for Kuaishou's Kling AI video generation model.
    """

    async def generate_video(
        self,
        prompt: str,
        image_reference: Optional[str] = None,
        duration: str = "5",
        extra_config: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Adapts the Kling AI video generation process to the VideoGenerationAdapter interface.
        """
        # Kling uses a config dictionary, we construct it from arguments
        kling_config = extra_config.copy() if extra_config else {}
        if image_reference:
            kling_config["image_url"] = image_reference
        kling_config["duration"] = int(duration) if duration.isdigit() else 5
        
        return await generate_kling_video(prompt=prompt, config=kling_config)


async def generate_kling_video(prompt: str, config: Dict[str, Any]) -> str:
    """
    Triggers Kling AI's video generation model using an HTTPX POST request.

    Args:
        prompt: The text prompt for generating the video.
        config: Dictionary containing additional settings (e.g. aspect_ratio, model_name).

    Returns:
        str: The task_id returned by Kling AI.
    """
    # 1. Build webhook callback URL
    callback_url = f"{settings.WEBHOOK_BASE_URL.rstrip('/')}/api/v1/webhooks/kling"
    if settings.WEBHOOK_SECRET:
        callback_url += f"?token={settings.WEBHOOK_SECRET}"

    # 2. Build the POST payload
    payload = {
        "model_name": config.get("model_name", "kling-v3"),
        "prompt": prompt,
        "callback_url": callback_url,
        "aspect_ratio": config.get("aspect_ratio", "16:9"),
        "duration": config.get("duration", 5),
    }

    # Add any other config keys to the payload (e.g., negative_prompt, image_url)
    for key, val in config.items():
        if key not in payload:
            payload[key] = val

    # 3. Check for API key and handle dev environment fallback
    if not settings.KLING_API_KEY:
        logger.warning(
            "KLING_API_KEY is not set. Generating mock Kling task ID."
        )
        mock_id = f"kling-mock-{uuid.uuid4()}"
        logger.info(f"Mock Kling job registered with ID: {mock_id}")
        return mock_id

    # 4. Make HTTPX POST request
    headers = {
        "Authorization": f"Bearer {settings.KLING_API_KEY}",
        "Content-Type": "application/json",
    }
    
    endpoint = f"{settings.KLING_BASE_URL.rstrip('/')}/v1/videos/generations"

    try:
        logger.info(f"Sending async POST to Kling AI: {endpoint} with callback {callback_url}")
        async with httpx.AsyncClient() as client:
            response = await client.post(
                endpoint,
                json=payload,
                headers=headers,
                timeout=30.0
            )
            
            # Raise error for 4xx/5xx status codes
            response.raise_for_status()
            
            data = response.json()
            
            # Extract task ID from Kling's typical response structure
            task_id = data.get("task_id") or data.get("data", {}).get("task_id")
            if not task_id:
                raise ValueError(
                    f"Response does not contain a task_id: {data}"
                )
                
            logger.info(f"Kling task submitted successfully. Task ID: {task_id}")
            return task_id

    except httpx.HTTPStatusError as e:
        logger.error(
            f"Kling AI API returned error status {e.response.status_code}: {e.response.text}"
        )
        raise RuntimeError(
            f"Kling AI API error ({e.response.status_code}): {e.response.text}"
        )
    except Exception as e:
        logger.error(f"HTTPX request to Kling AI failed: {str(e)}")
        raise RuntimeError(f"Kling AI integration error: {str(e)}")
