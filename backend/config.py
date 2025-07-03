import os
from typing import Dict
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Configuration class that loads from environment variables"""
    
    # ---------------------------------------- website settings ----------------------------------------
    FO1_BASE_URL: str = os.getenv("FO1_BASE_URL", "https://fo1.api.altius.finance")
    FO2_BASE_URL: str = os.getenv("FO2_BASE_URL", "https://fo2.api.altius.finance")
    
    FO1_WEBSITE_URL: str = os.getenv("FO1_WEBSITE_URL", "https://fo1.altius.finance")
    FO2_WEBSITE_URL: str = os.getenv("FO2_WEBSITE_URL", "https://fo2.altius.finance")
    
    # ---------------------------------------- api endpoints ----------------------------------------
    LOGIN_ENDPOINT: str = os.getenv("LOGIN_ENDPOINT", "/api/v0.0.2/login")
    DEALS_LIST_ENDPOINT: str = os.getenv("DEALS_LIST_ENDPOINT", "/api/v0.0.2/deals-list")
    DEALS_CARDS_ENDPOINT: str = os.getenv("DEALS_CARDS_ENDPOINT", "/api/v0.0.2/deals-cards")
    DEALS_FILES_ENDPOINT: str = os.getenv("DEALS_FILES_ENDPOINT", "/api/v0.0.3/deals/{deal_id}/files")
    DEALS_FILTERS_ENDPOINT: str = os.getenv("DEALS_FILTERS_ENDPOINT", "/api/v0.0.3/deals-filters")
    
    # ---------------------------------------- http settings ----------------------------------------
    USER_AGENT: str = os.getenv(
        "USER_AGENT", 
        "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Mobile Safari/537.36"
    )
    REQUEST_TIMEOUT: int = int(os.getenv("REQUEST_TIMEOUT", "30"))
    MAX_RETRIES: int = int(os.getenv("MAX_RETRIES", "3"))
    
    # ---------------------------------------- api settings ----------------------------------------
    CONTENT_TYPE: str = os.getenv("CONTENT_TYPE", "application/json")
    ACCEPT_TYPE: str = os.getenv("ACCEPT_TYPE", "application/json")
    TOKEN_COOKIE_NAME: str = os.getenv("TOKEN_COOKIE_NAME", "Authorization2")
    
    # ---------------------------------------- debug settings ----------------------------------------
    DEBUG_MODE: bool = os.getenv("DEBUG_MODE", "True").lower() == "true"
    LOG_API_REQUESTS: bool = os.getenv("LOG_API_REQUESTS", "True").lower() == "true"
    
    # ---------------------------------------- helper methods ----------------------------------------
    
    @classmethod
    def get_base_url(cls, website: str) -> str:
        """Get base URL for specified website"""
        url_mapping = {
            "fo1": cls.FO1_BASE_URL,
            "fo2": cls.FO2_BASE_URL
        }
        
        if website not in url_mapping:
            raise ValueError(f"Unsupported website: {website}. Supported: {list(url_mapping.keys())}")
        
        return url_mapping[website]
    
    @classmethod
    def get_website_url(cls, website: str) -> str:
        #get website URL for specified website
        url_mapping = {
            "fo1": cls.FO1_WEBSITE_URL,
            "fo2": cls.FO2_WEBSITE_URL
        }
        
        if website not in url_mapping:
            raise ValueError(f"Unsupported website: {website}. Supported: {list(url_mapping.keys())}")
        
        return url_mapping[website]
    
    @classmethod
    def get_common_headers(cls, website: str) -> Dict[str, str]:
        #get common headers for API requests
        website_url = cls.get_website_url(website)
        
        return {
            "User-Agent": cls.USER_AGENT,
            "Accept": cls.ACCEPT_TYPE,
            "Content-Type": cls.CONTENT_TYPE,
            "Origin": website_url,
            "Referer": f"{website_url}/"
        }
    
    @classmethod
    def get_endpoint_url(cls, website: str, endpoint: str, **kwargs) -> str:
        #get full URL for specific endpoint
        base_url = cls.get_base_url(website)
        formatted_endpoint = endpoint.format(**kwargs)
        return f"{base_url}{formatted_endpoint}"
    
    @classmethod
    def is_debug_enabled(cls) -> bool:
        return cls.DEBUG_MODE
    
    @classmethod
    def should_log_requests(cls) -> bool:
        return cls.LOG_API_REQUESTS


#global config
config = Config() 