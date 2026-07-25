from sqlalchemy import Column, Integer, String, Float, ForeignKey, Text, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(String, default="Tourist")  # Tourist, Business Analyst, Tourism Administrator
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    reviews = relationship("Review", back_populates="user", cascade="all, delete-orphan")
    trips = relationship("Trip", back_populates="user", cascade="all, delete-orphan")


class Destination(Base):
    __tablename__ = "destinations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    state = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    image_url = Column(String, nullable=True)
    best_months = Column(String, nullable=False)  # Comma separated e.g. "October,November,December"
    transport_options = Column(Text, nullable=True)  # JSON string list
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)

    hotels = relationship("Hotel", back_populates="destination", cascade="all, delete-orphan")
    arrivals = relationship("TouristArrival", back_populates="destination", cascade="all, delete-orphan")
    revenue = relationship("Revenue", back_populates="destination", cascade="all, delete-orphan")
    weather = relationship("Weather", back_populates="destination", cascade="all, delete-orphan")
    attractions = relationship("Attraction", back_populates="destination", cascade="all, delete-orphan")
    restaurants = relationship("Restaurant", back_populates="destination", cascade="all, delete-orphan")
    trips = relationship("Trip", back_populates="destination", cascade="all, delete-orphan")


class Hotel(Base):
    __tablename__ = "hotels"

    id = Column(Integer, primary_key=True, index=True)
    destination_id = Column(Integer, ForeignKey("destinations.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    avg_price = Column(Float, nullable=False)  # Per night
    rating = Column(Float, default=4.0)
    total_rooms = Column(Integer, default=50)
    weekend_occupancy_factor = Column(Float, default=1.2)
    seasonal_demand_factor = Column(Text, nullable=True)  # JSON string
    customer_satisfaction = Column(Float, default=85.0)

    destination = relationship("Destination", back_populates="hotels")


class TouristArrival(Base):
    __tablename__ = "tourist_arrivals"

    id = Column(Integer, primary_key=True, index=True)
    destination_id = Column(Integer, ForeignKey("destinations.id", ondelete="CASCADE"), nullable=False)
    year = Column(Integer, nullable=False)
    month = Column(Integer, nullable=False)  # 1 to 12
    arrivals_count = Column(Integer, nullable=False)
    domestic_count = Column(Integer, nullable=False)
    international_count = Column(Integer, nullable=False)
    tourist_type = Column(String, nullable=True)  # Leisure, Business, Spiritual
    age_group_distribution = Column(Text, nullable=True)  # JSON string
    country_distribution = Column(Text, nullable=True)  # JSON string

    destination = relationship("Destination", back_populates="arrivals")


class Revenue(Base):
    __tablename__ = "revenues"

    id = Column(Integer, primary_key=True, index=True)
    destination_id = Column(Integer, ForeignKey("destinations.id", ondelete="CASCADE"), nullable=False)
    year = Column(Integer, nullable=False)
    hotel_revenue = Column(Float, nullable=False)  # In USD Millions or INR Crores
    restaurant_revenue = Column(Float, nullable=False)
    shopping_revenue = Column(Float, nullable=False)
    activity_revenue = Column(Float, nullable=False)
    tax_contribution = Column(Float, nullable=False)

    destination = relationship("Destination", back_populates="revenue")


class Weather(Base):
    __tablename__ = "weather"

    id = Column(Integer, primary_key=True, index=True)
    destination_id = Column(Integer, ForeignKey("destinations.id", ondelete="CASCADE"), nullable=False)
    month = Column(Integer, nullable=False)  # 1 to 12
    avg_temp = Column(Float, nullable=False)  # C
    humidity = Column(Float, nullable=False)  # %
    rainfall = Column(Float, nullable=False)  # mm
    wind_speed = Column(Float, nullable=False)  # km/h

    destination = relationship("Destination", back_populates="weather")


class Attraction(Base):
    __tablename__ = "attractions"

    id = Column(Integer, primary_key=True, index=True)
    destination_id = Column(Integer, ForeignKey("destinations.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)  # Historical, Nature, Adventure, Spiritual
    rating = Column(Float, default=4.0)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)

    destination = relationship("Destination", back_populates="attractions")


class Restaurant(Base):
    __tablename__ = "restaurants"

    id = Column(Integer, primary_key=True, index=True)
    destination_id = Column(Integer, ForeignKey("destinations.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    cuisine = Column(String, nullable=False)
    rating = Column(Float, default=4.0)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)

    destination = relationship("Destination", back_populates="restaurants")


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    type = Column(String, nullable=False)  # "destination", "hotel", "restaurant"
    target_id = Column(Integer, nullable=False)
    rating = Column(Integer, nullable=False)
    comment = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="reviews")


class Budget(Base):
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True, index=True)
    destination_name = Column(String, nullable=False)
    tier = Column(String, nullable=False)  # Budget, Moderate, Luxury
    hotel_cost = Column(Float, nullable=False)
    food_cost = Column(Float, nullable=False)
    local_transport_cost = Column(Float, nullable=False)
    flights_cost = Column(Float, nullable=False)
    activities_cost = Column(Float, nullable=False)
    shopping_cost = Column(Float, nullable=False)
    misc_cost = Column(Float, nullable=False)


class Trip(Base):
    __tablename__ = "trips"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    destination_id = Column(Integer, ForeignKey("destinations.id", ondelete="CASCADE"), nullable=False)
    days = Column(Integer, nullable=False)
    travelers = Column(Integer, nullable=False)
    tier = Column(String, nullable=False)  # Budget, Moderate, Luxury
    total_cost = Column(Float, nullable=False)
    breakdown_json = Column(Text, nullable=False)  # JSON representation
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="trips")
    destination = relationship("Destination", back_populates="trips")


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    destination_id = Column(Integer, nullable=False)
    target_month = Column(Integer, nullable=False)
    predicted_arrivals = Column(Integer, nullable=False)
    predicted_occupancy = Column(Float, nullable=False)
    crowd_level = Column(String, nullable=False)  # Low, Medium, High
    created_at = Column(DateTime(timezone=True), server_default=func.now())
