import logging
import uuid
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List, Tuple
import httpx

from config import settings

logger = logging.getLogger("services.db_sync_service")


def is_valid_uuid(val: str) -> bool:
    """Helper to check if a string is a valid UUID."""
    try:
        uuid.UUID(val)
        return True
    except ValueError:
        return False


class DatabaseSyncService:
    """
    Service class to handle all asynchronous updates to Supabase generations,
    user profiles, and credit transactions.
    """

    @classmethod
    def _get_headers(cls) -> Dict[str, str]:
        """Generate authorization headers for Supabase REST API requests."""
        if not settings.SUPABASE_KEY:
            logger.warning("SUPABASE_KEY is missing from configuration settings.")
        return {
            "apikey": settings.SUPABASE_KEY or "",
            "Authorization": f"Bearer {settings.SUPABASE_KEY or ''}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }

    @classmethod
    async def get_user_profile(cls, user_id: str) -> Dict[str, Any]:
        """
        Fetches the user's profile metadata, including credit balance.
        """
        if not settings.SUPABASE_URL:
            logger.error("SUPABASE_URL not configured.")
            raise ValueError("SUPABASE_URL not configured.")

        url = f"{settings.SUPABASE_URL.rstrip('/')}/rest/v1/profiles?id=eq.{user_id}"
        headers = cls._get_headers()

        try:
            logger.info(f"Fetching profile for user: {user_id}")
            async with httpx.AsyncClient() as client:
                response = await client.get(url, headers=headers, timeout=15.0)
                response.raise_for_status()
                profiles = response.json()
                
                if not profiles or not isinstance(profiles, list):
                    raise ValueError(f"Profile not found for user {user_id}")
                
                return profiles[0]
        except Exception as e:
            logger.error(f"Error fetching user profile for {user_id}: {str(e)}")
            raise

    @classmethod
    async def create_pending_generation(
        cls,
        user_id: str,
        prompt: str,
        negative_prompt: str,
        model_used: str,
        generation_type: str,
        aspect_ratio: str,
        seed: Optional[int],
        credits_used: int,
        parameters: Optional[Dict[str, Any]] = None
    ) -> Tuple[str, Optional[str]]:
        """
        Deducts credits, creates a pending generation record, and logs the transaction.
        Returns a tuple of (generation_id, error_message).
        """
        if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
            logger.warning("Supabase credentials not fully configured. Running in local mock mode.")
            mock_gen_id = str(uuid.uuid4())
            return mock_gen_id, None

        # 1. Fetch user profile to verify credits
        try:
            profile = await cls.get_user_profile(user_id)
            current_balance = profile.get("credit_balance", 0)
            if current_balance < credits_used:
                logger.error(f"Insufficient credits for user {user_id}. Available: {current_balance}, Required: {credits_used}")
                return "", f"Insufficient credits. Available: {current_balance}, Required: {credits_used}"
        except Exception as e:
            logger.error(f"Failed to verify credits: {str(e)}")
            return "", f"Failed to verify user profile: {str(e)}"

        # 2. Insert pending generation record
        headers = cls._get_headers()
        gen_url = f"{settings.SUPABASE_URL.rstrip('/')}/rest/v1/generations"
        
        # Prepare parameters payload
        params_payload = parameters.copy() if parameters else {}
        
        gen_payload = {
            "user_id": user_id,
            "prompt": prompt,
            "negative_prompt": negative_prompt,
            "model_used": model_used,
            "generation_type": generation_type,
            "parameters": params_payload,
            "aspect_ratio": aspect_ratio,
            "seed": seed,
            "status": "pending",
            "credits_used": credits_used,
            "is_public": False,
            "task_id": params_payload.get("task_id")
        }

        generation_id = ""
        try:
            logger.info(f"Inserting pending generation for user {user_id}")
            async with httpx.AsyncClient() as client:
                response = await client.post(gen_url, json=gen_payload, headers=headers, timeout=15.0)
                response.raise_for_status()
                records = response.json()
                if records and isinstance(records, list) and len(records) > 0:
                    generation_id = str(records[0].get("id"))
                    logger.info(f"Created pending generation. ID: {generation_id}")
                else:
                    raise ValueError("Empty response on generation creation.")
        except Exception as e:
            logger.error(f"Database insert of pending generation failed: {str(e)}")
            return "", f"Database failed to register pending generation: {str(e)}"

        # 3. Deduct credits from user's profile
        new_balance = max(0, current_balance - credits_used)
        profile_url = f"{settings.SUPABASE_URL.rstrip('/')}/rest/v1/profiles?id=eq.{user_id}"
        
        try:
            logger.info(f"Deducting {credits_used} credits from user {user_id}. New balance: {new_balance}")
            async with httpx.AsyncClient() as client:
                response = await client.patch(profile_url, json={"credit_balance": new_balance}, headers=headers, timeout=15.0)
                response.raise_for_status()
        except Exception as e:
            logger.error(f"Failed to deduct credits for user {user_id} in profile: {str(e)}")
            # Rollback: delete the pending generation record
            await cls._delete_generation(generation_id)
            return "", f"Failed to deduct credits: {str(e)}"

        # 4. Insert transaction audit log
        txn_url = f"{settings.SUPABASE_URL.rstrip('/')}/rest/v1/credit_transactions"
        txn_payload = {
            "user_id": user_id,
            "amount": -credits_used,
            "type": "generation",
            "description": f"Deducted for video generation using {model_used}",
            "generation_id": generation_id,
            "balance_after": new_balance
        }
        
        try:
            logger.info(f"Logging credit deduction transaction for user {user_id}")
            async with httpx.AsyncClient() as client:
                response = await client.post(txn_url, json=txn_payload, headers=headers, timeout=15.0)
                response.raise_for_status()
        except Exception as e:
            # We don't roll back credit deduction if log fail, to avoid inconsistencies, but we log the warning
            logger.error(f"Failed to record credit transaction log for user {user_id}: {str(e)}")

        return generation_id, None

    @classmethod
    async def _delete_generation(cls, generation_id: str) -> None:
        """Helper to remove a generation (used for rollbacks)."""
        if not generation_id or not settings.SUPABASE_URL:
            return
        url = f"{settings.SUPABASE_URL.rstrip('/')}/rest/v1/generations?id=eq.{generation_id}"
        headers = cls._get_headers()
        try:
            async with httpx.AsyncClient() as client:
                await client.delete(url, headers=headers, timeout=15.0)
                logger.info(f"Rollback: deleted generation {generation_id}")
        except Exception as e:
            logger.error(f"Failed to delete generation during rollback: {str(e)}")

    @classmethod
    async def update_generation_status(
        cls,
        task_id: str,
        status: str,
        output_url: Optional[str] = None,
        error_message: Optional[str] = None
    ) -> bool:
        """
        Updates the status of a generation record based on callback task ID.
        If status is 'failed', triggers a credit refund.
        """
        if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
            logger.warning(f"Supabase not configured. Mock updating status for {task_id} to {status}.")
            return True

        headers = cls._get_headers()
        
        # 1. Look up the generation record matching the task_id
        # Build logical OR query: matches database UUID id, task_id column, or parameters jsonb task_id
        if is_valid_uuid(task_id):
            query = f"or=(id.eq.{task_id},task_id.eq.{task_id},parameters->>task_id.eq.{task_id})"
        else:
            query = f"or=(task_id.eq.{task_id},parameters->>task_id.eq.{task_id})"
            
        gen_url = f"{settings.SUPABASE_URL.rstrip('/')}/rest/v1/generations?{query}"
        
        try:
            logger.info(f"Querying generation record for task ID: {task_id}")
            async with httpx.AsyncClient() as client:
                response = await client.get(gen_url, headers=headers, timeout=15.0)
                response.raise_for_status()
                records = response.json()
                
                if not records or not isinstance(records, list):
                    logger.error(f"No generation record found for task ID: {task_id}")
                    return False
                
                generation = records[0]
                generation_id = generation.get("id")
                user_id = generation.get("user_id")
                credits_used = generation.get("credits_used", 0)
                logger.info(f"Found generation record {generation_id} for user {user_id}")
        except Exception as e:
            logger.error(f"Failed to query generation matching task {task_id}: {str(e)}")
            return False

        # 2. Update generation status
        patch_payload = {
            "status": status,
            "completed_at": datetime.now(timezone.utc).isoformat()
        }
        
        if status == "completed" and output_url:
            patch_payload["video_url"] = output_url
            # Use same URL for thumbnail to show in history, or extract preview
            patch_payload["thumbnail_url"] = output_url
        elif status == "failed":
            patch_payload["error_message"] = error_message or "Unknown provider failure."

        update_url = f"{settings.SUPABASE_URL.rstrip('/')}/rest/v1/generations?id=eq.{generation_id}"
        
        try:
            logger.info(f"Updating generation {generation_id} to status: {status}")
            async with httpx.AsyncClient() as client:
                patch_response = await client.patch(update_url, json=patch_payload, headers=headers, timeout=15.0)
                patch_response.raise_for_status()
                logger.info(f"Successfully updated generation {generation_id} to {status}")
        except Exception as e:
            logger.error(f"Failed to update generation status in DB for {generation_id}: {str(e)}")
            return False

        # 3. Handle credit refund on failure
        if status == "failed":
            if credits_used > 0:
                logger.info(f"Initiating credit refund of {credits_used} credits for user {user_id}")
                try:
                    await cls.refund_credits(user_id, credits_used, generation_id)
                except Exception as e:
                    logger.error(f"Credit refund failed for user {user_id}, generation {generation_id}: {str(e)}")
            else:
                logger.info(f"No credits to refund for generation {generation_id}")

        return True

    @classmethod
    async def refund_credits(cls, user_id: str, amount: int, generation_id: str) -> None:
        """
        Refunds the specified amount of credits to the user profile and logs it.
        """
        headers = cls._get_headers()
        
        # 1. Fetch current profile
        profile = await cls.get_user_profile(user_id)
        current_balance = profile.get("credit_balance", 0)
        new_balance = current_balance + amount

        # 2. Update profile
        profile_url = f"{settings.SUPABASE_URL.rstrip('/')}/rest/v1/profiles?id=eq.{user_id}"
        async with httpx.AsyncClient() as client:
            logger.info(f"Refunding {amount} credits to user {user_id}. New balance: {new_balance}")
            response = await client.patch(profile_url, json={"credit_balance": new_balance}, headers=headers, timeout=15.0)
            response.raise_for_status()

        # 3. Record refund transaction audit log
        txn_url = f"{settings.SUPABASE_URL.rstrip('/')}/rest/v1/credit_transactions"
        txn_payload = {
            "user_id": user_id,
            "amount": amount,
            "type": "refund",
            "description": f"Refunded credits for failed generation {generation_id}",
            "generation_id": generation_id,
            "balance_after": new_balance
        }
        
        try:
            async with httpx.AsyncClient() as client:
                txn_response = await client.post(txn_url, json=txn_payload, headers=headers, timeout=15.0)
                txn_response.raise_for_status()
                logger.info(f"Successfully recorded refund transaction log for user {user_id}")
        except Exception as e:
            logger.error(f"Failed to record refund transaction log: {str(e)}")
