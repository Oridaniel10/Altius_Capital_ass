# Models package initialization
from .auth import LoginRequest, LoginResponse
from .deals import DealsRequest, DealsResponse, FilesRequest, FilesResponse, Deal, FileInfo

__all__ = [
    "LoginRequest",
    "LoginResponse", 
    "DealsRequest",
    "DealsResponse",
    "FilesRequest",
    "FilesResponse",
    "Deal",
    "FileInfo"
] 