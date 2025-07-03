from fastapi import APIRouter, HTTPException, status
from models.auth import LoginRequest, LoginResponse
from services.scraper import perform_login
import traceback

auth_router = APIRouter(tags=["Authentication"])


@auth_router.post("/login", response_model=LoginResponse)
async def login_user(payload: LoginRequest):
    #authenticate user and return token
    try:
        #perform login to get authentication token from third party website
        print(f"DEBUG: Starting login for {payload.username} on {payload.website}")
        token = perform_login(payload.website, payload.username, payload.password)
        print(f"DEBUG: Login successful, token received")
        
        # return authentication data
        response = LoginResponse(
            token=token,
            website=payload.website
        )
        print(f"DEBUG: LoginResponse created successfully")
        
        return response
        
    except ValueError as e:
        print(f"DEBUG: ValueError in login: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}"
        )
    except Exception as e:
        print(f"DEBUG: Unexpected error in login: {str(e)}")
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login process failed: {str(e)}"
        ) 