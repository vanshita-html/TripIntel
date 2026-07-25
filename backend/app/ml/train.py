import os
import joblib
import pandas as pd
import numpy as np
from sqlalchemy.orm import Session
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from app.database import SessionLocal
from app.models import TouristArrival, Weather, Hotel, Destination

# Create directory to store trained models
MODELS_DIR = os.path.dirname(os.path.abspath(__file__))

def train_all_models():
    db = SessionLocal()
    try:
        print("Starting machine learning model training...")
        
        # 1. Train Tourist Arrival Prediction Model
        train_arrivals_model(db)
        
        # 2. Train Hotel Occupancy Prediction Model
        train_occupancy_model(db)
        
        # 3. Train Budget Estimation Model
        train_budget_model(db)
        
        # 4. Train Crowd Level Classification Model
        train_crowd_model(db)
        
        print("All machine learning models successfully trained and exported.")
    except Exception as e:
        print(f"Error training models: {e}")
    finally:
        db.close()

def train_arrivals_model(db: Session):
    print("Training Tourist Arrival Predictor...")
    query = db.query(
        TouristArrival.destination_id,
        TouristArrival.month,
        TouristArrival.arrivals_count,
        Weather.avg_temp,
        Weather.humidity,
        Weather.rainfall,
        Weather.wind_speed
    ).join(
        Weather, 
        (TouristArrival.destination_id == Weather.destination_id) & 
        (TouristArrival.month == Weather.month)
    )
    
    data = query.all()
    if not data:
        print("No historical arrivals data found. Skipping model training.")
        return
        
    df = pd.DataFrame(data, columns=[
        'destination_id', 'month', 'arrivals_count', 
        'avg_temp', 'humidity', 'rainfall', 'wind_speed'
    ])
    
    X = df[['destination_id', 'month', 'avg_temp', 'humidity', 'rainfall', 'wind_speed']]
    y = df['arrivals_count']
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('cat', OneHotEncoder(handle_unknown='ignore'), ['destination_id', 'month'])
        ],
        remainder='passthrough'
    )
    
    pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('model', RandomForestRegressor(n_estimators=50, random_state=42))
    ])
    
    pipeline.fit(X, y)
    joblib.dump(pipeline, os.path.join(MODELS_DIR, "arrivals_model.joblib"))
    print("Saved arrivals_model.joblib")

def train_occupancy_model(db: Session):
    print("Training Hotel Occupancy Predictor...")
    hotels = db.query(Hotel).all()
    arrivals = db.query(TouristArrival).all()
    
    if not hotels or not arrivals:
        print("Insufficient hotel/arrivals data. Skipping occupancy model.")
        return
        
    records = []
    for arr in arrivals:
        dest_hotels = [h for h in hotels if h.destination_id == arr.destination_id]
        for hotel in dest_hotels:
            base_occupancy = 50.0 + (hotel.rating - 3.5) * 15.0
            arrival_effect = min(30.0, (arr.arrivals_count / 10000.0))
            price_effect = -min(15.0, (hotel.avg_price / 300.0))
            
            # Combine and clip between 10% and 98%
            occupancy = np.clip(base_occupancy + arrival_effect + price_effect, 10.0, 98.0)
            
            records.append({
                'destination_id': arr.destination_id,
                'hotel_id': hotel.id,
                'month': arr.month,
                'avg_price': hotel.avg_price,
                'rating': hotel.rating,
                'arrivals_count': arr.arrivals_count,
                'occupancy': occupancy
            })
            
    df = pd.DataFrame(records)
    X = df[['destination_id', 'month', 'avg_price', 'rating', 'arrivals_count']]
    y = df['occupancy']
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('cat', OneHotEncoder(handle_unknown='ignore'), ['destination_id', 'month'])
        ],
        remainder='passthrough'
    )
    
    pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('model', RandomForestRegressor(n_estimators=50, random_state=42))
    ])
    
    pipeline.fit(X, y)
    joblib.dump(pipeline, os.path.join(MODELS_DIR, "occupancy_model.joblib"))
    print("Saved occupancy_model.joblib")

def train_budget_model(db: Session):
    print("Training Budget Predictor...")
    destinations = db.query(Destination).all()
    if not destinations:
        print("No destinations found. Skipping budget model.")
        return
        
    records = []
    tiers = ["Budget", "Moderate", "Luxury"]
    
    for dest in destinations:
        cost_index = 1.0
        if "Ladakh" in dest.name or "Andaman" in dest.name:
            cost_index = 1.3
        elif "Goa" in dest.name or "Kashmir" in dest.name:
            cost_index = 1.15
        elif "Rishikesh" in dest.name:
            cost_index = 0.85
            
        for tier in tiers:
            multiplier = 1.0 if tier == "Budget" else (2.2 if tier == "Moderate" else 5.0)
            
            for days in range(1, 15):
                for travelers in range(1, 10):
                    hotel_cost = (40.0 * multiplier * cost_index) * days * max(1, travelers // 2)
                    food_cost = (20.0 * multiplier * cost_index) * days * travelers
                    transport_cost = (15.0 * multiplier * cost_index) * days
                    flight_cost = (100.0 * multiplier * cost_index) * travelers if tier != "Budget" else 0.0
                    activities_cost = (15.0 * multiplier * cost_index) * days * travelers
                    shopping_cost = (25.0 * multiplier * cost_index) * travelers
                    misc_cost = (10.0 * multiplier) * days
                    
                    total = hotel_cost + food_cost + transport_cost + flight_cost + activities_cost + shopping_cost + misc_cost
                    
                    records.append({
                        'destination_id': dest.id,
                        'tier': tier,
                        'days': days,
                        'travelers': travelers,
                        'total_cost': total
                    })
                    
    df = pd.DataFrame(records)
    X = df[['destination_id', 'tier', 'days', 'travelers']]
    y = df['total_cost']
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('cat', OneHotEncoder(handle_unknown='ignore'), ['destination_id', 'tier'])
        ],
        remainder='passthrough'
    )
    
    pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('model', RandomForestRegressor(n_estimators=30, random_state=42))
    ])
    
    pipeline.fit(X, y)
    joblib.dump(pipeline, os.path.join(MODELS_DIR, "budget_model.joblib"))
    print("Saved budget_model.joblib")

def train_crowd_model(db: Session):
    print("Training Crowd Level Classifier...")
    arrivals = db.query(TouristArrival).all()
    if not arrivals:
        print("No tourist arrivals data. Skipping crowd level model.")
        return
        
    df = pd.DataFrame([{
        'destination_id': arr.destination_id,
        'month': arr.month,
        'arrivals_count': arr.arrivals_count
    } for arr in arrivals])
    
    medians = df.groupby('destination_id')['arrivals_count'].transform('median')
    ratios = df['arrivals_count'] / medians
    
    crowd_levels = []
    for r in ratios:
        if r < 0.85:
            crowd_levels.append("Low")
        elif r > 1.15:
            crowd_levels.append("High")
        else:
            crowd_levels.append("Medium")
            
    df['crowd_level'] = crowd_levels
    
    X = df[['destination_id', 'month', 'arrivals_count']]
    y = df['crowd_level']
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('cat', OneHotEncoder(handle_unknown='ignore'), ['destination_id', 'month'])
        ],
        remainder='passthrough'
    )
    
    pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('model', RandomForestClassifier(n_estimators=30, random_state=42))
    ])
    
    pipeline.fit(X, y)
    joblib.dump(pipeline, os.path.join(MODELS_DIR, "crowd_model.joblib"))
    print("Saved crowd_model.joblib")

if __name__ == "__main__":
    train_all_models()
