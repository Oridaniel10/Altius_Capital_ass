from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    #request model for user login
    username: EmailStr  #use EmailStr for proper email validation
    password: str
    website: str


class LoginResponse(BaseModel):
    #response model for successful login - only authentication data
    token: str
    website: str 