from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import databutton as db
import requests
import json
from app.auth import AuthorizedUser

router = APIRouter()

# Gemini API configuration
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent"

# Message schemas
class Message(BaseModel):
    role: str  # 'user' or 'model'
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]
    temperature: Optional[float] = 0.7
    max_output_tokens: Optional[int] = 800

class ChatResponse(BaseModel):
    response: str
    
@router.post("/chat")
async def chat_with_gemini(request: ChatRequest, user: AuthorizedUser):
    """
    Chat with the Gemini API.
    This endpoint forwards the request to Gemini API and returns the response.
    """
    try:
        # Get API key from secrets
        api_key = db.secrets.get("GEMINI_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="GEMINI_API_KEY not configured")
        
        # Convert our messages format to Gemini format
        formatted_messages = []
        for msg in request.messages:
            if msg.role == "user":
                formatted_messages.append({"role": "user", "parts": [{"text": msg.content}]})
            elif msg.role == "model":
                formatted_messages.append({"role": "model", "parts": [{"text": msg.content}]})
        
        # Prepare request payload
        payload = {
            "contents": formatted_messages,
            "generationConfig": {
                "temperature": request.temperature,
                "maxOutputTokens": request.max_output_tokens,
                "topP": 0.95,
                "topK": 40
            }
        }
        
        # Make request to Gemini API
        response = requests.post(
            f"{GEMINI_API_URL}?key={api_key}",
            headers={"Content-Type": "application/json"},
            data=json.dumps(payload)
        )
        
        # Check for errors
        if response.status_code != 200:
            print(f"Gemini API error: {response.status_code} - {response.text}")
            raise HTTPException(
                status_code=response.status_code, 
                detail=f"Gemini API error: {response.text}"
            )
        
        # Parse response
        response_data = response.json()
        
        # Extract the generated text
        generated_text = ""
        if ("candidates" in response_data and 
            len(response_data["candidates"]) > 0 and 
            "content" in response_data["candidates"][0] and
            "parts" in response_data["candidates"][0]["content"] and
            len(response_data["candidates"][0]["content"]["parts"]) > 0 and
            "text" in response_data["candidates"][0]["content"]["parts"][0]):
            
            generated_text = response_data["candidates"][0]["content"]["parts"][0]["text"]
        else:
            # Handle unexpected response format
            print(f"Unexpected Gemini API response format: {response_data}")
            raise HTTPException(status_code=500, detail="Unexpected response format from Gemini API")
        
        return ChatResponse(response=generated_text)
        
    except Exception as e:
        print(f"Error in chat_with_gemini: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
