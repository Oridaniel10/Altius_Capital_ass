"""Website scraper service for Altius Capital authentication and data fetching"""

import requests
from typing import List, Dict, Any
from config import config




#perform login and return authorization token
def perform_login(website: str, username: str, password: str) -> str:
    #authenticate user and return authorization token
    login_url = config.get_endpoint_url(website, config.LOGIN_ENDPOINT)
    headers = config.get_common_headers(website)

    login_data = {
        "email": username,
        "password": password
    }

    if config.should_log_requests():
        print(f"DEBUG: Login request to {login_url}")

    #api request to login and get token
    response = requests.post(
        login_url, 
        json=login_data, 
        headers=headers,
        timeout=config.REQUEST_TIMEOUT
    )
    
    if response.status_code != 200:
        if config.is_debug_enabled():
            print(f"DEBUG: Login failed with status {response.status_code}")
        raise ValueError("Invalid credentials or login failed")

    #extract token from cookies
    token = response.cookies.get(config.TOKEN_COOKIE_NAME)
    if not token:
        if config.is_debug_enabled():
            print("DEBUG: Authentication token not found in cookies")
        raise ValueError("Authentication token not received")

    if config.should_log_requests():
        print("DEBUG: Login successful, token received")

    return token

def fetch_deals(website: str, token: str) -> List[Dict[str, Any]]:
    """
    3-step process:
    1. Get deals list (ID + title)
    2. Get all cards  
    3. Filter cards to return only those that appear in the list
    """
    headers = config.get_common_headers(website)
    base_url = config.get_base_url(website)
    
    # STEP 1: Get deals list (ID + title)
    list_url = f"{base_url}{config.DEALS_LIST_ENDPOINT}"
    try:
        if config.should_log_requests():
            print(f"DEBUG: STEP 1 - Fetching deals list from {list_url}")
        
        list_response = requests.post(
            list_url,
            json={"filters": {}},
            headers=headers,
            cookies={config.TOKEN_COOKIE_NAME: token},
            timeout=config.REQUEST_TIMEOUT
        )
        
        if list_response.status_code == 409:
            if config.is_debug_enabled():
                print(f"DEBUG: Session conflict detected (409) - user logged in from another device")
            raise ValueError("SESSION_CONFLICT")
        elif list_response.status_code == 401:
            if config.is_debug_enabled():
                print(f"DEBUG: Unauthorized (401) - token invalid or expired")
            raise ValueError("UNAUTHORIZED")
        elif list_response.status_code != 200:
            if config.is_debug_enabled():
                print(f"DEBUG: Failed to fetch deals list: {list_response.status_code}")
            return []
        
        list_data = list_response.json()
        deal_list = list_data.get("data", [])
        
        # Save IDs and titles from list
        list_deals = {}  # id -> title mapping
        for deal in deal_list:
            if "id" in deal:
                list_deals[deal["id"]] = deal.get("title", "Unnamed Deal")
        
        if config.should_log_requests():
            print(f"DEBUG: STEP 1 Complete - Got {len(list_deals)} deals from list")
            
    except ValueError as e:
        # Re-raise specific errors for the API to handle
        raise e
    except Exception as e:
        if config.is_debug_enabled():
            print(f"DEBUG: STEP 1 Failed: {str(e)}")
        return []
    
    # STEP 2: Get all cards in one request
    cards_url = f"{base_url}{config.DEALS_CARDS_ENDPOINT}"
    try:
        if config.should_log_requests():
            print(f"DEBUG: STEP 2 - Fetching all cards from {cards_url}")
        
        cards_response = requests.post(
            cards_url,
            json={"filters": {}},
            headers=headers,
            cookies={config.TOKEN_COOKIE_NAME: token},
            timeout=config.REQUEST_TIMEOUT
        )
        
        if cards_response.status_code == 409:
            if config.is_debug_enabled():
                print(f"DEBUG: Session conflict detected (409) - user logged in from another device")
            raise ValueError("SESSION_CONFLICT")
        elif cards_response.status_code == 401:
            if config.is_debug_enabled():
                print(f"DEBUG: Unauthorized (401) - token invalid or expired")
            raise ValueError("UNAUTHORIZED")
        elif cards_response.status_code != 200:
            if config.is_debug_enabled():
                print(f"DEBUG: Failed to fetch cards: {cards_response.status_code}")
            return []
        
        cards_data = cards_response.json()
        all_cards = _parse_deals_response(cards_data)
        
        if config.should_log_requests():
            print(f"DEBUG: STEP 2 Complete - Got {len(all_cards)} total cards")
            
    except ValueError as e:
        # Re-raise specific errors for the API to handle
        raise e
    except Exception as e:
        if config.is_debug_enabled():
            print(f"DEBUG: STEP 2 Failed: {str(e)}")
        return []
    
    # STEP 3: Filter cards - return only those that appear in the list
    filtered_deals = []
    for card in all_cards:
        card_id = card.get("id")
        if card_id in list_deals:
            filtered_deals.append(card)
    
    if config.should_log_requests():
        print(f"DEBUG: STEP 3 Complete - Filtered to {len(filtered_deals)} deals that appear in list")
    
    return filtered_deals





def download_deal_files(website: str, token: str, deal_id: int) -> Dict[str, Any]:
    #fetch files for a specific deal
    files_url = config.get_endpoint_url(website, config.DEALS_FILES_ENDPOINT, deal_id=deal_id)
    headers = config.get_common_headers(website)
    
    try:
        if config.should_log_requests():
            print(f"DEBUG: Fetching files for deal {deal_id} from {files_url}")
        
        response = requests.get(
            files_url,
            headers=headers,
            cookies={config.TOKEN_COOKIE_NAME: token},
            timeout=config.REQUEST_TIMEOUT
        )
        
        if config.should_log_requests():
            print(f"DEBUG: Files response status: {response.status_code}")
        
        if response.status_code == 409:
            if config.is_debug_enabled():
                print(f"DEBUG: Session conflict detected (409) - user logged in from another device")
            raise ValueError("SESSION_CONFLICT")
        elif response.status_code == 401:
            if config.is_debug_enabled():
                print(f"DEBUG: Unauthorized (401) - token invalid or expired")
            raise ValueError("UNAUTHORIZED")
        elif response.status_code != 200:
            error_msg = f"Failed to fetch files (status: {response.status_code})"
            if config.is_debug_enabled():
                print(f"DEBUG: {error_msg}")
            return {
                "error": error_msg,
                "files": [],
                "total": 0
            }
        
        data = response.json()
        files = _parse_files_response(data)
        
        if config.should_log_requests():
            print(f"DEBUG: Successfully fetched {len(files)} files")
        return {
            "files": files,
            "total": len(files),
            "error": None
        }
        
    except ValueError as e:
        # re-raise specific errors for the API to handle
        raise e
    except Exception as e:
        error_msg = f"Error fetching files: {str(e)}"
        if config.is_debug_enabled():
            print(f"DEBUG: {error_msg}")
        return {
            "error": error_msg,
            "files": [],
            "total": 0
        }


def _parse_deals_response(data: Dict[str, Any]) -> List[Dict[str, Any]]:
    #parse deals response into standardized format
    if not isinstance(data, dict) or 'data' not in data:
        return []
    
    deals_data = data['data']
    if not deals_data:
        return []
    
    deals = []
    
    #handle deals-cards format (with pagination)
    if 'current_page' in data:
        for deal in deals_data:
            simplified_deal = {
                "id": deal.get("id"),
                "title": deal.get("title", "Unnamed Deal"),
                "created_at": deal.get("created_at", ""),
                "firm": deal.get("deal_owner_value", ""),
                "asset_class": deal.get("asset_class", {}).get("name", "General") if deal.get("asset_class") else "General",
                "deal_status": deal.get("status", {}).get("name", "Unknown") if deal.get("status") else "Unknown",
                "currency": deal.get("currencies", [{}])[0].get("value", "USD") if deal.get("currencies") else "USD",
                "user_id": deal.get("user_id", 0),
                "deal_capital_seeker_email": ""
            }
            deals.append(simplified_deal)
    
    #handle deals-list format (simple list)
    else:
        deals = deals_data
    
    return deals


def _parse_files_response(data: Dict[str, Any]) -> List[Dict[str, Any]]:
    #parse files response into standardized format
    if not isinstance(data, dict) or 'data' not in data:
        return []
    
    files_data = data['data']
    if not files_data:
        return []
    
    files = []
    
    #handle dict format (file_id -> file_info)
    if isinstance(files_data, dict):
        for file_id, file_item in files_data.items():
            if isinstance(file_item, dict):
                files.append({
                    "id": file_item.get("id", file_id),
                    "name": file_item.get("name", "Unknown"),
                    "size": file_item.get("size_in_bytes", 0),
                    "url": file_item.get("file_url", ""),
                    "type": file_item.get("type", ""),
                    "download_url": file_item.get("file_url", ""),
                    "created_at": file_item.get("created_at", ""),
                    "state": file_item.get("state", "")
                })
    
    #handle list format
    elif isinstance(files_data, list):
        for file_item in files_data:
            if isinstance(file_item, dict):
                files.append({
                    "id": file_item.get("id"),
                    "name": file_item.get("name", "Unknown"),
                    "size": file_item.get("size_in_bytes", 0),
                    "url": file_item.get("file_url", ""),
                    "type": file_item.get("type", ""),
                    "download_url": file_item.get("file_url", ""),
                    "created_at": file_item.get("created_at", ""),
                    "state": file_item.get("state", "")
                })
    
    return files
