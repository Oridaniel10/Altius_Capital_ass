# Routes package initialization
from .auth import auth_router
from .deals import deals_router

__all__ = ["auth_router", "deals_router"] 