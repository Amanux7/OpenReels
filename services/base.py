from abc import ABC, abstractmethod
from typing import Optional, Dict, Any


class VideoGenerationAdapter(ABC):
    """
    Abstract base class representing the Target interface in the Adapter Design Pattern.
    Enforces a common contract for all video generation service adapters.
    """

    @abstractmethod
    async def generate_video(
        self,
        prompt: str,
        image_reference: Optional[str] = None,
        duration: str = "5",
        extra_config: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Submits a video generation task to the external API provider and returns
        the unique request/task tracking ID.

        Args:
            prompt: The text prompt describing the video content.
            image_reference: Optional URL for image-to-video mapping.
            duration: Video length in seconds.
            extra_config: Additional provider-specific settings.

        Returns:
            str: The unique tracking ID provided by the service.
        """
        pass
