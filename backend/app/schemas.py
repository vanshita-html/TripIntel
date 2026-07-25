from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime

# --- Authentication & Users ---
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    full_name: str

class TokenData(BaseModel):
    email: Optional[str] = None


# --- Destinations ---
class DestinationBase(BaseModel):
    name: str
    state: str
    description: str
    image_url: Optional[str] = None
    best_months: str
    transport_options: Optional[str] = None
    lat: float
    lng: float

class DestinationCreate(DestinationBase):
    pass

class DestinationResponse(DestinationBase):
    id: int

    class Config:
        from_attributes = True


# --- Attractions & Restaurants ---
class AttractionResponse(BaseModel):
    id: int
    destination_id: int
    name: str
    type: str
    rating: float
    lat: float
    lng: float

    class Config:
        from_attributes = True

class RestaurantResponse(BaseModel):
    id: int
    destination_id: int
    name: str
    cuisine: str
    rating: float
    lat: float
    lng: float

    class Config:
        from_attributes = True


# --- Hotels ---
class HotelBase(BaseModel):
    name: str
    avg_price: float
    rating: float
    total_rooms: int
    weekend_occupancy_factor: float
    seasonal_demand_factor: Optional[str] = None
    customer_satisfaction: float

class HotelCreate(HotelBase):
    destination_id: int

class HotelResponse(HotelBase):
    id: int
    destination_id: int

    class Config:
        from_attributes = True


# --- Reviews ---
class ReviewCreate(BaseModel):
    type: str  # "destination", "hotel", "restaurant"
    target_id: int
    rating: int
    comment: str

class ReviewResponse(ReviewCreate):
    id: int
    user_id: int
    user_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# --- Weather & Revenue ---
class WeatherResponse(BaseModel):
    id: int
    destination_id: int
    month: int
    avg_temp: float
    humidity: float
    rainfall: float
    wind_speed: float

    class Config:
        from_attributes = True

class RevenueResponse(BaseModel):
    id: int
    destination_id: int
    year: int
    hotel_revenue: float
    restaurant_revenue: float
    shopping_revenue: float
    activity_revenue: float
    tax_contribution: float

    class Config:
        from_attributes = True


# --- Budget Planner & Trip ---
class BudgetRequest(BaseModel):
    destination_id: int
    days: int
    travelers: int
    tier: str  # "Budget", "Moderate", "Luxury"

class ExpenseBreakdown(BaseModel):
    hotel: float
    food: float
    local_transport: float
    flights: float
    activities: float
    shopping: float
    misc: float

class BudgetResponse(BaseModel):
    total_estimated_budget: float
    daily_expense_breakdown: ExpenseBreakdown
    tier: str
    days: int
    travelers: int

class TripCreate(BaseModel):
    destination_id: int
    days: int
    travelers: int
    tier: str
    total_cost: float
    breakdown_json: str
    notes: Optional[str] = None

class TripResponse(BaseModel):
    id: int
    user_id: int
    destination_id: int
    days: int
    travelers: int
    tier: str
    total_cost: float
    breakdown_json: str
    notes: Optional[str] = None
    created_at: datetime
    destination_name: Optional[str] = None

    class Config:
        from_attributes = True


# --- ML & Analytics Predictions ---
class PredictionRequest(BaseModel):
    destination_id: int
    target_month: int

class PredictionResponse(BaseModel):
    predicted_arrivals: int
    predicted_occupancy: float
    crowd_level: str

# --- AI Travel Recommendation ---
class RecommendationRequest(BaseModel):
    budget_limit: float
    days: int
    preferred_weather: str  # "Cold", "Warm", "Rainy", "Any"
    categories: List[str]

class RecommendationResponseItem(BaseModel):
    destination_id: int
    name: str
    state: str
    reason: str
    estimated_cost: float
    best_months: str
    match_score: float

class RecommendationResponse(BaseModel):
    recommendations: List[RecommendationResponseItem]
