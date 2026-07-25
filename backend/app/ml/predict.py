import os
import joblib
import pandas as pd

MODELS_DIR = os.path.dirname(os.path.abspath(__file__))

def load_model(name: str):
    path = os.path.join(MODELS_DIR, f"{name}.joblib")
    if os.path.exists(path):
        try:
            return joblib.load(path)
        except Exception as e:
            print(f"Error loading ML model {name}: {e}")
    return None

def predict_arrivals(destination_id: int, month: int, avg_temp: float, humidity: float, rainfall: float, wind_speed: float) -> int:
    model = load_model("arrivals_model")
    if model:
        try:
            X = pd.DataFrame([{
                'destination_id': destination_id,
                'month': month,
                'avg_temp': avg_temp,
                'humidity': humidity,
                'rainfall': rainfall,
                'wind_speed': wind_speed
            }])
            pred = model.predict(X)[0]
            return int(max(100, pred))
        except Exception as e:
            print(f"Arrival model inference error: {e}")
            
    # Fallback mathematical model based on month and destination factors
    base = 15000
    month_factors = {
        1: [1.4, 1.3, 1.0, 0.7, 0.6, 0.3, 0.2, 0.3, 0.6, 1.0, 1.3, 1.7], # Goa
        2: [1.3, 1.2, 1.0, 0.8, 0.7, 0.5, 0.4, 0.5, 0.7, 1.0, 1.2, 1.4], # Kerala
        3: [1.5, 1.3, 1.1, 0.7, 0.4, 0.3, 0.3, 0.4, 0.6, 1.1, 1.3, 1.5], # Jaipur
        4: [0.1, 0.2, 0.4, 0.8, 1.3, 1.7, 1.8, 1.6, 1.1, 0.5, 0.2, 0.1], # Ladakh
        5: [1.2, 1.1, 1.2, 1.4, 1.3, 0.8, 0.5, 0.6, 0.9, 1.2, 1.1, 1.0], # Kashmir
        6: [1.2, 1.1, 1.2, 1.3, 1.4, 1.0, 0.5, 0.6, 0.9, 1.3, 1.2, 1.1], # Rishikesh
        7: [0.8, 0.9, 1.1, 1.3, 1.5, 1.6, 1.0, 0.9, 1.2, 1.4, 1.1, 0.8], # Manali
        8: [0.8, 0.9, 1.1, 1.3, 1.5, 1.6, 1.0, 0.9, 1.2, 1.4, 1.1, 0.8], # Shimla
        9: [1.5, 1.3, 1.1, 0.7, 0.4, 0.3, 0.3, 0.4, 0.6, 1.1, 1.3, 1.5], # Udaipur
        10: [1.3, 1.2, 1.0, 0.7, 0.6, 0.4, 0.3, 0.4, 0.6, 1.1, 1.3, 1.5] # Andaman
    }
    
    dest_factor = month_factors.get(destination_id, [1.0] * 12)
    month_idx = max(0, min(11, month - 1))
    factor = dest_factor[month_idx]
    
    # Weather impact
    weather_multiplier = 1.0
    if rainfall > 200.0:
        weather_multiplier *= 0.6 # Heavy rain dampens tourism
    if avg_temp > 38.0:
        weather_multiplier *= 0.7 # Heat wave dampens tourism
        
    return int(base * factor * weather_multiplier)

def predict_occupancy(destination_id: int, hotel_id: int, month: int, avg_price: float, rating: float, arrivals_count: int) -> float:
    model = load_model("occupancy_model")
    if model:
        try:
            X = pd.DataFrame([{
                'destination_id': destination_id,
                'month': month,
                'avg_price': avg_price,
                'rating': rating,
                'arrivals_count': arrivals_count
            }])
            pred = model.predict(X)[0]
            return float(max(5.0, min(100.0, pred)))
        except Exception as e:
            print(f"Occupancy model inference error: {e}")
            
    # Fallback mathematical model
    base_occ = 45.0 + (rating - 3.0) * 12.0
    arrivals_factor = min(35.0, (arrivals_count / 8000.0))
    price_factor = -min(15.0, (avg_price / 250.0))
    
    seasonal_bump = 0.0
    if month in [11, 12, 1, 2]:
        seasonal_bump = 10.0
    elif month in [6, 7, 8]:
        if destination_id in [4, 7, 8]:
            seasonal_bump = 20.0
        elif destination_id in [3, 9]:
            seasonal_bump = -15.0
            
    return float(max(10.0, min(98.0, base_occ + arrivals_factor + price_factor + seasonal_bump)))

def predict_budget(destination_id: int, tier: str, days: int, travelers: int) -> float:
    model = load_model("budget_model")
    if model:
        try:
            X = pd.DataFrame([{
                'destination_id': destination_id,
                'tier': tier,
                'days': days,
                'travelers': travelers
            }])
            pred = model.predict(X)[0]
            return float(max(50.0, pred))
        except Exception as e:
            print(f"Budget model inference error: {e}")
            
    # Fallback mathematical budget calculation
    cost_index = 1.0
    if destination_id in [4, 10]:  # Ladakh, Andaman
        cost_index = 1.35
    elif destination_id in [1, 5]: # Goa, Kashmir
        cost_index = 1.15
    elif destination_id in [6]:    # Rishikesh
        cost_index = 0.8
        
    multiplier = 1.0 if tier == "Budget" else (2.2 if tier == "Moderate" else 5.0)
    
    hotel_cost = (40.0 * multiplier * cost_index) * days * max(1, travelers // 2)
    food_cost = (20.0 * multiplier * cost_index) * days * travelers
    transport_cost = (15.0 * multiplier * cost_index) * days
    flight_cost = (120.0 * multiplier * cost_index) * travelers if tier != "Budget" else 0.0
    activities_cost = (15.0 * multiplier * cost_index) * days * travelers
    shopping_cost = (25.0 * multiplier * cost_index) * travelers
    misc_cost = (10.0 * multiplier) * days
    
    total = hotel_cost + food_cost + transport_cost + flight_cost + activities_cost + shopping_cost + misc_cost
    return float(total)

def predict_crowd_level(destination_id: int, month: int, arrivals_count: int) -> str:
    model = load_model("crowd_model")
    if model:
        try:
            X = pd.DataFrame([{
                'destination_id': destination_id,
                'month': month,
                'arrivals_count': arrivals_count
            }])
            pred = model.predict(X)[0]
            return str(pred)
        except Exception as e:
            print(f"Crowd model inference error: {e}")
            
    if arrivals_count > 25000:
        return "High"
    elif arrivals_count < 12000:
        return "Low"
    else:
        return "Medium"
