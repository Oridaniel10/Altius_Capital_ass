from pydantic import BaseModel
from typing import List, Optional


class Deal(BaseModel):
    #Model representing a single deal
    id: int
    title: str
    created_at: str
    firm: Optional[str] = ""
    asset_class: Optional[str] = "General"
    deal_status: Optional[str] = "Unknown"
    currency: Optional[str] = "USD"
    user_id: Optional[int] = 0
    deal_capital_seeker_email: Optional[str] = ""


class FileInfo(BaseModel):
    #model representing file information
    id: int | str
    name: str
    size: int
    url: str
    type: Optional[str] = ""
    download_url: str
    created_at: Optional[str] = ""
    state: Optional[str] = ""


class DealsRequest(BaseModel):
    #request model for fetching deals
    website: str
    token: str


class DealsResponse(BaseModel):
    #response model for deals list
    deals: List[Deal]
    total: int


class FilesRequest(BaseModel):
    """Request model for fetching deal files"""
    website: str
    token: str
    deal_id: int


class FilesResponse(BaseModel):
    """Response model for deal files"""
    files: List[FileInfo]
    total: int
    error: Optional[str] = None 