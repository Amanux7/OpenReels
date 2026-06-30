import logging
from typing import Dict, Any
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt

from config import settings

logger = logging.getLogger("auth")
security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
    """
    Dependency to validate the incoming JWT token from the authorization header.
    It verifies the token against the Supabase JWT secret (if configured) or decodes
    it for development environments.
    """
    token = credentials.credentials
    
    try:
        if settings.SUPABASE_JWT_SECRET:
            # Supabase tokens are signed with HS256, audience is "authenticated"
            payload = jwt.decode(
                token,
                key=settings.SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                audience="authenticated"
            )
        else:
            logger.warning(
                "SUPABASE_JWT_SECRET is not configured. Decoding JWT token WITHOUT signature verification."
            )
            # In dev mode, let it pass by decoding without signature check
            payload = jwt.decode(token, options={"verify_signature": False})
            
        # Verify required claims
        if "sub" not in payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token is missing user identification claim (sub)."
            )
            
        return {
            "user_id": payload.get("sub"),
            "email": payload.get("email"),
            "role": payload.get("role", "authenticated"),
            "claims": payload
        }
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="The authorization token has expired."
        )
    except jwt.InvalidTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authorization token: {str(e)}"
        )
    except Exception as e:
        logger.error(f"JWT decode error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials."
        )
