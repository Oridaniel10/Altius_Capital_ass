from fastapi import APIRouter, HTTPException, status
from models.deals import (
    DealsRequest, DealsResponse, Deal,
    FilesRequest, FilesResponse
)
from services.scraper import fetch_deals, download_deal_files

deals_router = APIRouter(tags=["Deals"])


@deals_router.post("/list", response_model=DealsResponse)
async def get_deals_list(payload: DealsRequest):
    #fetch list of available deals using authentication token
    try:
        #fetch deals data from the API
        deals_data = fetch_deals(payload.website, payload.token)
        
        #convert to Deal models
        deals = [Deal(**deal) for deal in deals_data] if deals_data else []
        
        return DealsResponse(
            deals=deals,
            total=len(deals)
        )
        
    except ValueError as e:
        error_message = str(e)
        
        if error_message == "SESSION_CONFLICT":
            # handle session conflict (409) - user logged in from another device
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={
                    "error": "SESSION_CONFLICT",
                    "message": "Your session has been terminated because you logged in from another device. Please log in again."
                }
            )
        elif error_message == "UNAUTHORIZED":
            # handle unauthorized (401) - token invalid or expired
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={
                    "error": "UNAUTHORIZED", 
                    "message": "Your session has expired. Please log in again."
                }
            )
        else:
            # handle other authentication/authorization errors
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Token validation failed: {str(e)}"
            )
    except Exception as e:
        #handle unexpected errors
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching deals: {str(e)}"
        )


@deals_router.post("/{deal_id}/files", response_model=FilesResponse)
async def get_deal_files(deal_id: int, payload: FilesRequest):
    """Fetch files for a specific deal using authentication token"""
    try:
        #validate that deal_id matches the payload
        if deal_id != payload.deal_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Deal ID in URL doesn't match request payload"
            )
        
        #fetch files data from the API
        result = download_deal_files(payload.website, payload.token, payload.deal_id)
        
        return FilesResponse(**result)
        
    except ValueError as e:
        error_message = str(e)
        
        if error_message == "SESSION_CONFLICT":
            # handle session conflict (409) - user logged in from another device
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={
                    "error": "SESSION_CONFLICT",
                    "message": "Your session has been terminated because you logged in from another device. Please log in again."
                }
            )
        elif error_message == "UNAUTHORIZED":
            # handle unauthorized (401) - token invalid or expired
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={
                    "error": "UNAUTHORIZED", 
                    "message": "Your session has expired. Please log in again."
                }
            )
        else:
            # handle other authentication/authorization errors
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Token validation failed: {str(e)}"
            )
    except Exception as e:
        #handle unexpected errors
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching files: {str(e)}"
        ) 