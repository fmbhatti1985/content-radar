import httpx
import urllib.parse
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_db
from app.models.integration import Integration
from app.core.config import settings

router = APIRouter()

FRONTEND_URL = f"{settings.FRONTEND_URL}/settings/integrations"

@router.get("/")
async def get_integrations(db: AsyncSession = Depends(get_db)):
    """List all connected integrations for the user."""
    stmt = select(Integration)
    result = await db.execute(stmt)
    rows = result.scalars().all()
    
    return [
        {
            "id": row.id,
            "platform": row.platform,
            "account_name": row.account_name,
            "connected_at": row.created_at.isoformat() if row.created_at else None
        }
        for row in rows
    ]

@router.get("/{platform}/login")
async def login_integration(platform: str):
    """Redirects the user to the actual OAuth provider."""
    platform = platform.lower()
    
    if platform == "youtube":
        if not settings.YOUTUBE_CLIENT_ID:
            raise HTTPException(status_code=500, detail="YouTube Client ID not configured in .env")
            
        redirect_uri = f"{settings.BACKEND_URL}/api/v1/integrations/youtube/callback"
        scope = "https://www.googleapis.com/auth/youtube.readonly"
        
        url = (
            "https://accounts.google.com/o/oauth2/v2/auth?"
            f"client_id={settings.YOUTUBE_CLIENT_ID}&"
            f"redirect_uri={urllib.parse.quote(redirect_uri)}&"
            "response_type=code&"
            f"scope={urllib.parse.quote(scope)}&"
            "access_type=offline&"
            "prompt=consent"
        )
        return RedirectResponse(url=url)
        
    elif platform == "tiktok":
        if not settings.TIKTOK_CLIENT_KEY:
            raise HTTPException(status_code=500, detail="TikTok Client Key not configured in .env")
            
        redirect_uri = f"{settings.BACKEND_URL}/api/v1/integrations/tiktok/callback"
        scope = "user.info.basic,video.list"
        
        # TikTok requires a csrf state parameter (we'll just use a static one for MVP)
        state = "tiktok_auth_state"
        
        # TikTok v2 requires PKCE
        code_challenge = "KSQHyPW4Popfp_8hN2bRj4vb76xkRFiuQ6uyZGl_op4"
        
        url = (
            "https://www.tiktok.com/v2/auth/authorize/?"
            f"client_key={settings.TIKTOK_CLIENT_KEY}&"
            "response_type=code&"
            f"scope={urllib.parse.quote(scope)}&"
            f"redirect_uri={urllib.parse.quote(redirect_uri)}&"
            f"state={state}&"
            f"code_challenge={code_challenge}&"
            "code_challenge_method=S256"
        )
        return RedirectResponse(url=url)
        
    elif platform == "facebook":
        if not settings.META_APP_ID:
            raise HTTPException(status_code=500, detail="Meta App ID not configured in .env")
            
        redirect_uri = f"{settings.BACKEND_URL}/api/v1/integrations/facebook/callback"
        scope = "public_profile,pages_show_list,pages_read_engagement,pages_manage_posts"
        state = "facebook_auth_state"
        
        url = (
            "https://www.facebook.com/v18.0/dialog/oauth?"
            f"client_id={settings.META_APP_ID}&"
            f"redirect_uri={urllib.parse.quote(redirect_uri)}&"
            f"state={state}&"
            f"scope={urllib.parse.quote(scope)}"
        )
        return RedirectResponse(url=url)
        
    else:
        # Fallback simulator for other platforms until their keys are ready
        mock_auth_code = f"mock_code_from_{platform}"
        callback_url = f"{settings.BACKEND_URL}/api/v1/integrations/{platform}/callback?code={mock_auth_code}"
        return RedirectResponse(url=callback_url)

@router.get("/{platform}/callback")
async def callback_integration(platform: str, request: Request, db: AsyncSession = Depends(get_db)):
    """Handles the return from the OAuth provider and exchanges code for access token."""
    code = request.query_params.get("code")
    if not code:
        return RedirectResponse(url=f"{FRONTEND_URL}?error=missing_code")

    platform = platform.lower()
    
    if platform == "youtube":
        redirect_uri = f"{settings.BACKEND_URL}/api/v1/integrations/youtube/callback"
        token_url = "https://oauth2.googleapis.com/token"
        
        async with httpx.AsyncClient() as client:
            response = await client.post(token_url, data={
                "client_id": settings.YOUTUBE_CLIENT_ID,
                "client_secret": settings.YOUTUBE_CLIENT_SECRET,
                "code": code,
                "grant_type": "authorization_code",
                "redirect_uri": redirect_uri
            })
            
            token_data = response.json()
            
            if "error" in token_data:
                print("OAuth Error:", token_data)
                return RedirectResponse(url=f"{FRONTEND_URL}?error=oauth_failed")
                
            access_token = token_data.get("access_token")
            refresh_token = token_data.get("refresh_token") # May be None if not prompted
            
            # Use access token to fetch the channel name
            channel_resp = await client.get(
                "https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true",
                headers={"Authorization": f"Bearer {access_token}"}
            )
            channel_data = channel_resp.json()
            
            account_name = "My YouTube Channel"
            if "items" in channel_data and len(channel_data["items"]) > 0:
                account_name = channel_data["items"][0]["snippet"]["title"]

            # Save to DB
            await save_tokens(db, "youtube", access_token, refresh_token, account_name)

    elif platform == "tiktok":
        redirect_uri = f"{settings.BACKEND_URL}/api/v1/integrations/tiktok/callback"
        token_url = "https://open.tiktokapis.com/v2/oauth/token/"
        
        async with httpx.AsyncClient() as client:
            response = await client.post(token_url, data={
                "client_key": settings.TIKTOK_CLIENT_KEY,
                "client_secret": settings.TIKTOK_CLIENT_SECRET,
                "code": code,
                "grant_type": "authorization_code",
                "redirect_uri": redirect_uri,
                "code_verifier": "a_very_long_static_code_verifier_string_for_testing"
            }, headers={"Content-Type": "application/x-www-form-urlencoded"})
            
            token_data = response.json()
            
            if "error" in token_data or "access_token" not in token_data:
                print("TikTok OAuth Error:", token_data)
                return RedirectResponse(url=f"{FRONTEND_URL}?error=oauth_failed")
                
            access_token = token_data.get("access_token")
            refresh_token = token_data.get("refresh_token")
            
            # Use access token to fetch user profile info
            user_resp = await client.get(
                "https://open.tiktokapis.com/v2/user/info/?fields=display_name",
                headers={"Authorization": f"Bearer {access_token}"}
            )
            user_data = user_resp.json()
            
            account_name = "My TikTok Account"
            if "data" in user_data and "user" in user_data["data"]:
                account_name = user_data["data"]["user"].get("display_name", account_name)

            # Save to DB
            await save_tokens(db, "tiktok", access_token, refresh_token, account_name)

    elif platform == "facebook":
        redirect_uri = f"{settings.BACKEND_URL}/api/v1/integrations/facebook/callback"
        token_url = "https://graph.facebook.com/v18.0/oauth/access_token"
        
        async with httpx.AsyncClient() as client:
            response = await client.get(token_url, params={
                "client_id": settings.META_APP_ID,
                "client_secret": settings.META_APP_SECRET,
                "code": code,
                "redirect_uri": redirect_uri
            })
            
            token_data = response.json()
            
            if "error" in token_data:
                print("Facebook OAuth Error:", token_data)
                return RedirectResponse(url=f"{FRONTEND_URL}?error=oauth_failed")
                
            access_token = token_data.get("access_token")
            refresh_token = ""
            
            user_resp = await client.get(
                "https://graph.facebook.com/me?fields=name",
                params={"access_token": access_token}
            )
            user_data = user_resp.json()
            
            account_name = user_data.get("name", "My Facebook Account")

            await save_tokens(db, "facebook", access_token, refresh_token, account_name)

    else:
        # Simulator fallback for others
        await save_tokens(db, platform, f"mock_access_{platform}", f"mock_refresh_{platform}", f"Mock {platform.capitalize()} Account")

    return RedirectResponse(url=f"{FRONTEND_URL}?success={platform}")

async def save_tokens(db: AsyncSession, platform: str, access_token: str, refresh_token: str, account_name: str):
    existing = await db.execute(select(Integration).where(Integration.platform == platform))
    integration = existing.scalar_one_or_none()
    
    if integration:
        integration.access_token = access_token
        if refresh_token: # Only update refresh token if a new one was provided
            integration.refresh_token = refresh_token
        integration.account_name = account_name
    else:
        integration = Integration(
            platform=platform,
            access_token=access_token,
            refresh_token=refresh_token,
            account_name=account_name
        )
        db.add(integration)

    await db.commit()

@router.delete("/{platform}")
async def disconnect_integration(platform: str, db: AsyncSession = Depends(get_db)):
    """Disconnects the platform and deletes the tokens."""
    existing = await db.execute(select(Integration).where(Integration.platform == platform.lower()))
    integration = existing.scalar_one_or_none()
    
    if not integration:
        raise HTTPException(status_code=404, detail="Integration not found")
        
    await db.delete(integration)
    await db.commit()
    
    return {"status": "disconnected", "platform": platform}
