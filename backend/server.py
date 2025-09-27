from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
import firebase_admin
from firebase_admin import credentials, auth
from emergentintegrations.llm.chat import LlmChat, UserMessage
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Initialize Firebase Admin - Mock for demo
# Note: In production, use a real service account key file
MOCK_AUTH = True  # Set to False in production with real Firebase credentials

# Create the main app
app = FastAPI(title="Travel Wizard API")
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# Initialize LLM Chat
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

# Models
class TripGroup(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    code: str
    creator_id: str
    members: List[str] = []
    activities: List[Dict[str, Any]] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
class TripBooking(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    destination: str
    start_date: str
    end_date: str
    activities: List[str] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ChatMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    session_id: str
    message: str
    response: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class MoodDestination(BaseModel):
    name: str
    description: str
    image_url: str
    reasons: List[str]

class ActivityVote(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    group_id: str
    activity_name: str
    votes: List[str] = []  # user IDs who voted
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    firebase_uid: str
    email: str
    name: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Request Models
class CreateGroupRequest(BaseModel):
    name: str
    creator_id: str

class JoinGroupRequest(BaseModel):
    code: str
    user_id: str

class MoodDiscoveryRequest(BaseModel):
    prompt: str
    user_id: str

class ChatRequest(BaseModel):
    message: str
    user_id: str
    session_id: Optional[str] = None

class VoteActivityRequest(BaseModel):
    group_id: str
    activity_name: str
    user_id: str

class CreateBookingRequest(BaseModel):
    user_id: str
    destination: str
    start_date: str
    end_date: str
    activities: List[str] = []

# Authentication middleware
async def verify_firebase_token(token: str = Depends(security)):
    """Mock Firebase token verification for demo"""
    # In production, uncomment and use:
    # try:
    #     decoded_token = auth.verify_id_token(token.credentials)
    #     return decoded_token
    # except Exception as e:
    #     raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")
    
    # Mock user for demo
    return {
        "uid": "demo_user_123",
        "email": "demo@example.com",
        "name": "Demo User"
    }

# Mood-based destination suggestions
def get_mood_destinations(prompt: str) -> List[MoodDestination]:
    """Rule-based mood discovery system"""
    mood_keywords = {
        "adventure": [
            MoodDestination(
                name="New Zealand",
                description="Perfect for thrill-seekers with bungee jumping, skydiving, and hiking adventures.",
                image_url="https://images.unsplash.com/photo-1507097634215-e4d9b5a0fb74?ixlib=rb-4.0.3&w=800",
                reasons=["Adventure sports", "Stunning landscapes", "Hiking trails"]
            ),
            MoodDestination(
                name="Costa Rica",
                description="Zip-lining through rainforests and volcano exploration awaits.",
                image_url="https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?ixlib=rb-4.0.3&w=800",
                reasons=["Rainforest adventures", "Wildlife", "Volcanoes"]
            )
        ],
        "relaxation": [
            MoodDestination(
                name="Maldives",
                description="Crystal clear waters and overwater bungalows for ultimate relaxation.",
                image_url="https://images.unsplash.com/photo-1573843981267-be1999ff37cd?ixlib=rb-4.0.3&w=800",
                reasons=["Beautiful beaches", "Luxury resorts", "Spa treatments"]
            ),
            MoodDestination(
                name="Bali, Indonesia",
                description="Peaceful temples, rice terraces, and wellness retreats.",
                image_url="https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?ixlib=rb-4.0.3&w=800",
                reasons=["Yoga retreats", "Cultural sites", "Tropical paradise"]
            )
        ],
        "culture": [
            MoodDestination(
                name="Kyoto, Japan",
                description="Ancient temples, traditional gardens, and rich cultural heritage.",
                image_url="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?ixlib=rb-4.0.3&w=800",
                reasons=["Historic temples", "Traditional culture", "Beautiful gardens"]
            ),
            MoodDestination(
                name="Rome, Italy",
                description="Colosseum, Vatican, and centuries of art and architecture.",
                image_url="https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?ixlib=rb-4.0.3&w=800",
                reasons=["Ancient history", "Art galleries", "Architecture"]
            )
        ]
    }
    
    prompt_lower = prompt.lower()
    
    # Check for keywords in prompt
    if any(word in prompt_lower for word in ["adventure", "thrill", "extreme", "adrenaline"]):
        return mood_keywords["adventure"]
    elif any(word in prompt_lower for word in ["relax", "peaceful", "spa", "beach", "calm"]):
        return mood_keywords["relaxation"]
    elif any(word in prompt_lower for word in ["culture", "history", "art", "museum", "heritage"]):
        return mood_keywords["culture"]
    elif any(word in prompt_lower for word in ["😎", "🏄‍♂️", "🎢"]):
        return mood_keywords["adventure"]
    elif any(word in prompt_lower for word in ["😌", "🧘‍♀️", "🏝️"]):
        return mood_keywords["relaxation"]
    else:
        # Default mixed suggestions
        return mood_keywords["adventure"][:1] + mood_keywords["relaxation"][:1]

# Routes

@api_router.post("/auth/register", response_model=Dict[str, Any])
async def register_user(user_data: Dict[str, str]):
    """Register a new user"""
    user = User(
        firebase_uid=user_data.get("uid", str(uuid.uuid4())),
        email=user_data["email"],
        name=user_data["name"]
    )
    
    # Convert to dict and handle datetime serialization
    user_dict = user.dict()
    user_dict["created_at"] = user_dict["created_at"].isoformat()
    
    await db.users.insert_one(user_dict)
    return {"message": "User registered successfully", "user_id": user.id}

@api_router.get("/auth/me")
async def get_current_user(current_user: dict = Depends(verify_firebase_token)):
    """Get current user info"""
    return current_user

@api_router.post("/mood-discovery", response_model=List[MoodDestination])
async def discover_destinations(request: MoodDiscoveryRequest):
    """Get destination suggestions based on mood/prompt"""
    destinations = get_mood_destinations(request.prompt)
    return destinations

@api_router.post("/groups", response_model=TripGroup)
async def create_group(request: CreateGroupRequest):
    """Create a new travel group"""
    group_code = f"TW{uuid.uuid4().hex[:6].upper()}"
    
    group = TripGroup(
        name=request.name,
        code=group_code,
        creator_id=request.creator_id,
        members=[request.creator_id]
    )
    
    # Convert to dict and handle datetime serialization
    group_dict = group.dict()
    group_dict["created_at"] = group_dict["created_at"].isoformat()
    
    await db.groups.insert_one(group_dict)
    return group

@api_router.post("/groups/join")
async def join_group(request: JoinGroupRequest):
    """Join a travel group using code"""
    group = await db.groups.find_one({"code": request.code})
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    # Add user to group if not already member
    if request.user_id not in group["members"]:
        await db.groups.update_one(
            {"code": request.code},
            {"$push": {"members": request.user_id}}
        )
    
    return {"message": "Joined group successfully"}

@api_router.get("/groups/{user_id}", response_model=List[TripGroup])
async def get_user_groups(user_id: str):
    """Get groups for a user"""
    groups = await db.groups.find({"members": user_id}).to_list(length=None)
    return [TripGroup(**group) for group in groups]

@api_router.post("/groups/{group_id}/vote")
async def vote_activity(group_id: str, request: VoteActivityRequest):
    """Vote for an activity in a group"""
    # Find existing vote for this activity
    existing_vote = await db.votes.find_one({
        "group_id": group_id,
        "activity_name": request.activity_name
    })
    
    if existing_vote:
        # Update existing vote
        if request.user_id not in existing_vote["votes"]:
            await db.votes.update_one(
                {"_id": existing_vote["_id"]},
                {"$push": {"votes": request.user_id}}
            )
    else:
        # Create new vote
        vote = ActivityVote(
            group_id=group_id,
            activity_name=request.activity_name,
            votes=[request.user_id]
        )
        
        vote_dict = vote.dict()
        vote_dict["created_at"] = vote_dict["created_at"].isoformat()
        
        await db.votes.insert_one(vote_dict)
    
    return {"message": "Vote recorded successfully"}

@api_router.get("/groups/{group_id}/votes")
async def get_group_votes(group_id: str):
    """Get voting results for a group"""
    votes = await db.votes.find({"group_id": group_id}).to_list(length=None)
    # Convert ObjectId to string for JSON serialization
    for vote in votes:
        if '_id' in vote:
            vote['_id'] = str(vote['_id'])
    return votes

@api_router.post("/bookings", response_model=TripBooking)
async def create_booking(request: CreateBookingRequest):
    """Create a trip booking"""
    booking = TripBooking(**request.dict())
    
    booking_dict = booking.dict()
    booking_dict["created_at"] = booking_dict["created_at"].isoformat()
    
    await db.bookings.insert_one(booking_dict)
    return booking

@api_router.get("/bookings/{user_id}", response_model=List[TripBooking])
async def get_user_bookings(user_id: str):
    """Get bookings for a user"""
    bookings = await db.bookings.find({"user_id": user_id}).to_list(length=None)
    return [TripBooking(**booking) for booking in bookings]

@api_router.post("/chat")
async def chat_with_ai(request: ChatRequest):
    """Chat with AI assistant"""
    session_id = request.session_id or str(uuid.uuid4())
    
    try:
        # Initialize LLM Chat
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=session_id,
            system_message="You are TRAVEL-WIZARD, a helpful AI travel assistant. Help users with travel planning, recommendations, and questions about their trips. Be friendly, knowledgeable, and provide practical advice."
        ).with_model("openai", "gpt-4o-mini")
        
        # Create user message
        user_message = UserMessage(text=request.message)
        
        # Get AI response
        response = await chat.send_message(user_message)
        
        # Save chat history
        chat_message = ChatMessage(
            user_id=request.user_id,
            session_id=session_id,
            message=request.message,
            response=response
        )
        
        chat_dict = chat_message.dict()
        chat_dict["timestamp"] = chat_dict["timestamp"].isoformat()
        
        await db.chat_history.insert_one(chat_dict)
        
        return {
            "response": response,
            "session_id": session_id
        }
        
    except Exception as e:
        logging.error(f"Chat error: {str(e)}")
        return {
            "response": "I'm sorry, I'm experiencing technical difficulties. Please try again later.",
            "session_id": session_id
        }

@api_router.get("/chat/history/{user_id}")
async def get_chat_history(user_id: str, session_id: Optional[str] = None):
    """Get chat history for a user"""
    query = {"user_id": user_id}
    if session_id:
        query["session_id"] = session_id
        
    messages = await db.chat_history.find(query).sort("timestamp", -1).limit(20).to_list(length=None)
    return messages

@api_router.get("/dashboard/{user_id}")
async def get_dashboard_data(user_id: str):
    """Get dashboard data for a user"""
    # Get user's bookings
    bookings = await db.bookings.find({"user_id": user_id}).to_list(length=None)
    
    # Get user's groups
    groups = await db.groups.find({"members": user_id}).to_list(length=None)
    
    # Mock weather and tips data
    dashboard_data = {
        "bookings": bookings,
        "groups": groups,
        "daily_digest": {
            "weather": "Sunny, 25°C",
            "reminders": ["Pack sunscreen", "Check passport expiry"],
            "packing_tips": ["Bring comfortable walking shoes", "Pack light layers"]
        }
    }
    
    return dashboard_data

# Health check
@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc)}

# Include router
app.include_router(api_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()