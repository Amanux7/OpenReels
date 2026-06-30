import logging
import uuid
from typing import Optional, Dict, Any
import fal_client

from config import settings
from services.base import VideoGenerationAdapter

logger = logging.getLogger("seedance_service")


class SeedanceAdapter(VideoGenerationAdapter):
    """
    Adapter for ByteDance's Seedance 2.0 (via Fal.ai) video generation model.
    """

    async def generate_video(
        self,
        prompt: str,
        image_reference: Optional[str] = None,
        duration: str = "5",
        extra_config: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Adapts the Seedance 2.0 model generation process to the VideoGenerationAdapter interface.
        """
        return await generate_seedance_video(
            prompt=prompt,
            image_reference=image_reference,
            duration=duration
        )


async def generate_seedance_video(
    prompt: str,
    image_reference: Optional[str] = None,
    duration: str = "5"
) -> str:
    """
    Submits a video generation task to Fal.ai's Seedance 2.0 endpoint.

    Args:
        prompt: Text description of the desired video.
        image_reference: Optional image URL for image-to-video conditioning.
        duration: Video duration in seconds (default is "5").

    Returns:
        str: The tracking request ID from Fal.ai.
    """
    # 1. Define model arguments
    arguments = {
        "prompt": prompt,
        "duration": int(duration) if duration.isdigit() else 5,
    }

    if image_reference:
        arguments["image_url"] = image_reference

    # 2. Build the webhook URL pointing to the FastAPI microservice webhook endpoint
    webhook_url = f"{settings.WEBHOOK_BASE_URL.rstrip('/')}/api/v1/webhooks/seedance"
    if settings.WEBHOOK_SECRET:
        webhook_url += f"?token={settings.WEBHOOK_SECRET}"

    # 3. Check for FAL Key and fall back to mock in development if missing
    if not settings.FAL_API_KEY:
        logger.warning(
            "FAL_API_KEY is not set. Generating mock Seedance tracking ID."
        )
        mock_id = f"seedance-mock-{uuid.uuid4()}"
        logger.info(f"Mock Seedance job registered with ID: {mock_id}")
        return mock_id

    try:
        logger.info(f"Submitting Seedance video generation. Webhook: {webhook_url}")
        # Submit async request using fal-client
        handler = await fal_client.submit_async(
            "bytedance/seedance-2.0/text-to-video",
            arguments=arguments,
            webhook_url=webhook_url
        )
        
        request_id = handler.request_id
        logger.info(f"Seedance task submitted successfully. Request ID: {request_id}")
        return request_id

    except Exception as e:
        logger.error(f"Fal.ai Seedance generation submission failed: {str(e)}")
        raise RuntimeError(f"Seedance generation submission failed: {str(e)}")
