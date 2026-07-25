import os
import json
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import engine, get_db, Base
from app import models, schemas, auth
from app.ml import predict, train
from app.seed import seed_database

# Create DB tables if they don't exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="TripIntel API",
    description="Smart Tourism Intelligence & Analytics Platform API",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------------------------------------------------------
# 1. AUTHENTICATION & USERS
# -----------------------------------------------------------------------------

@app.post("/api/auth/register", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user_in.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pw = auth.get_password_hash(user_in.password)
    user = models.User(
        email=user_in.email,
        password_hash=hashed_pw,
        full_name=user_in.full_name,
        role=user_in.role
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@app.post("/api/auth/login", response_model=schemas.Token)
def login(login_req: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == login_req.username).first()
    if not user or not auth.verify_password(login_req.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Invalid email or password")
    
    access_token = auth.create_access_token(data={"sub": user.email, "role": user.role})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "full_name": user.full_name
    }

@app.get("/api/auth/me", response_model=schemas.UserResponse)
def get_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user


# -----------------------------------------------------------------------------
# 2. GLOBAL SEARCH WITH AUTOCOMPLETE
# -----------------------------------------------------------------------------

@app.get("/api/search")
def global_search(q: str = "", db: Session = Depends(get_db)):
    if not q or len(q) < 2:
        return []
    
    query = q.lower()
    results = []
    
    # 1. Search destinations
    dests = db.query(models.Destination).all()
    for d in dests:
        if query in d.name.lower() or query in d.state.lower():
            results.append({
                "id": d.id,
                "type": "destination",
                "title": d.name,
                "subtitle": d.state,
                "description": d.description[:100] + "...",
                "image_url": d.image_url
            })
            
    # 2. Search hotels
    hotels = db.query(models.Hotel).join(models.Destination).all()
    for h in hotels:
        if query in h.name.lower():
            results.append({
                "id": h.id,
                "type": "hotel",
                "title": h.name,
                "subtitle": f"Hotel in {h.destination.name}, {h.destination.state}",
                "description": f"Rating: {h.rating} ★ | Average Price: ${h.avg_price}/night",
                "image_url": h.destination.image_url
            })
            
    # 3. Search attractions
    attrs = db.query(models.Attraction).join(models.Destination).all()
    for a in attrs:
        if query in a.name.lower() or query in a.type.lower():
            results.append({
                "id": a.id,
                "type": "attraction",
                "title": a.name,
                "subtitle": f"{a.type} POI in {a.destination.name}",
                "description": f"Tourist rating: {a.rating} ★",
                "image_url": a.destination.image_url
            })
            
    return results[:10]  # Return top 10 matches for autocomplete


# -----------------------------------------------------------------------------
# 3. DESTINATIONS & DETAILS
# -----------------------------------------------------------------------------

@app.get("/api/destinations", response_model=List[schemas.DestinationResponse])
def get_destinations(db: Session = Depends(get_db)):
    return db.query(models.Destination).all()

@app.get("/api/destinations/{destination_id}")
def get_destination_details(destination_id: int, db: Session = Depends(get_db)):
    dest = db.query(models.Destination).filter(models.Destination.id == destination_id).first()
    if not dest:
        raise HTTPException(status_code=404, detail="Destination not found")
    
    attractions = db.query(models.Attraction).filter(models.Attraction.destination_id == destination_id).all()
    restaurants = db.query(models.Restaurant).filter(models.Restaurant.destination_id == destination_id).all()
    hotels = db.query(models.Hotel).filter(models.Hotel.destination_id == destination_id).all()
    weather = db.query(models.Weather).filter(models.Weather.destination_id == destination_id).order_by(models.Weather.month).all()
    
    # Simple AI generated destination summary based on DB details
    best_months_list = dest.best_months.split(",")
    ai_summary = (
        f"{dest.name} in {dest.state} is highly recommended for travel. The absolute best months to visit are "
        f"{', '.join(best_months_list[:2])} and {', '.join(best_months_list[2:])}. "
        f"It has an average traveler rating of {round(sum(h.rating for h in hotels)/len(hotels) if hotels else 4.2, 1)} based on "
        f"local accommodations. Key sights include {', '.join(a.name for a in attractions[:3]) if attractions else 'famous local spots'}."
    )
    
    return {
        "destination": dest,
        "attractions": attractions,
        "restaurants": restaurants,
        "hotels": hotels,
        "weather": weather,
        "ai_summary": ai_summary
    }


# -----------------------------------------------------------------------------
# 4. DESTINATION COMPARISON
# -----------------------------------------------------------------------------

@app.get("/api/destinations/compare/pair")
def compare_destinations(id1: int, id2: int, db: Session = Depends(get_db)):
    d1 = db.query(models.Destination).filter(models.Destination.id == id1).first()
    d2 = db.query(models.Destination).filter(models.Destination.id == id2).first()
    if not d1 or not d2:
        raise HTTPException(status_code=404, detail="One or both destinations not found")
        
    def get_dest_summary_metrics(d, d_id):
        # 1. Budget
        b_est = predict.predict_budget(d_id, "Moderate", 5, 2)
        # 2. Avg Occupancy
        hotels = db.query(models.Hotel).filter(models.Hotel.destination_id == d_id).all()
        avg_occ = sum(predict.predict_occupancy(d_id, h.id, 10, h.avg_price, h.rating, 15000) for h in hotels) / len(hotels) if hotels else 65.0
        # 3. Revenue
        revs = db.query(models.Revenue).filter(models.Revenue.destination_id == d_id).order_by(models.Revenue.year.desc()).first()
        tot_rev = (revs.hotel_revenue + revs.restaurant_revenue + revs.shopping_revenue + revs.activity_revenue) if revs else 45.0
        # 4. Arrivals
        arrs = db.query(func.sum(models.TouristArrival.arrivals_count)).filter(models.TouristArrival.destination_id == d_id).scalar() or 0
        # 5. Weather
        weather = db.query(func.avg(models.Weather.avg_temp)).filter(models.Weather.destination_id == d_id).scalar() or 22.0
        avg_rain = db.query(func.avg(models.Weather.rainfall)).filter(models.Weather.destination_id == d_id).scalar() or 120.0
        # 6. Ratings
        avg_rating = sum(h.rating for h in hotels)/len(hotels) if hotels else 4.0
        
        return {
            "id": d_id,
            "name": d.name,
            "state": d.state,
            "image_url": d.image_url,
            "description": d.description,
            "avg_budget_5_days_2_pax": round(b_est, 2),
            "hotel_occupancy": round(avg_occ, 1),
            "yearly_revenue_millions": round(tot_rev, 2),
            "total_historical_arrivals": arrs,
            "avg_temp": round(weather, 1),
            "avg_rainfall_mm": round(avg_rain, 1),
            "rating": round(avg_rating, 1),
            "best_months": d.best_months,
            "attractions": [a.name for a in db.query(models.Attraction).filter(models.Attraction.destination_id == d_id).all()]
        }
        
    return {
        "destination1": get_dest_summary_metrics(d1, id1),
        "destination2": get_dest_summary_metrics(d2, id2)
    }


# -----------------------------------------------------------------------------
# 5. ANALYTICS & BUSINESS INTELLIGENCE
# -----------------------------------------------------------------------------

@app.get("/api/analytics/dashboard")
def get_dashboard_analytics(
    state: Optional[str] = None,
    city: Optional[str] = None,
    month: Optional[int] = None,
    year: Optional[int] = None,
    tourist_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    # Base query for arrivals
    arrival_q = db.query(models.TouristArrival).join(models.Destination)
    revenue_q = db.query(models.Revenue).join(models.Destination)
    hotel_q = db.query(models.Hotel).join(models.Destination)
    weather_q = db.query(models.Weather).join(models.Destination)
    
    # Apply filters
    if state:
        arrival_q = arrival_q.filter(models.Destination.state == state)
        revenue_q = revenue_q.filter(models.Destination.state == state)
        hotel_q = hotel_q.filter(models.Destination.state == state)
        weather_q = weather_q.filter(models.Destination.state == state)
    if city: # City acts on Destination.name in our seed database schema
        arrival_q = arrival_q.filter(models.Destination.name == city)
        revenue_q = revenue_q.filter(models.Destination.name == city)
        hotel_q = hotel_q.filter(models.Destination.name == city)
        weather_q = weather_q.filter(models.Destination.name == city)
    if month:
        arrival_q = arrival_q.filter(models.TouristArrival.month == month)
        weather_q = weather_q.filter(models.Weather.month == month)
    if year:
        arrival_q = arrival_q.filter(models.TouristArrival.year == year)
        revenue_q = revenue_q.filter(models.Revenue.year == year)
    if tourist_type:
        arrival_q = arrival_q.filter(models.TouristArrival.tourist_type == tourist_type)

    arrivals = arrival_q.all()
    revenues = revenue_q.all()
    hotels = hotel_q.all()
    weather = weather_q.all()
    
    # 1. Calculate KPI Numbers
    tot_arrivals = sum(a.arrivals_count for a in arrivals)
    
    tot_rev = sum(r.hotel_revenue + r.restaurant_revenue + r.shopping_revenue + r.activity_revenue for r in revenues)
    
    # Forecast average budget across filtered destinations
    unique_dests = list(set(a.destination_id for a in arrivals)) if arrivals else [1]
    avg_budget = sum(predict.predict_budget(d_id, "Moderate", 5, 2) for d_id in unique_dests) / len(unique_dests)
    
    # Compute average occupancy across filtered destinations
    avg_occ = sum(predict.predict_occupancy(h.destination_id, h.id, month or 10, h.avg_price, h.rating, tot_arrivals // max(1, len(arrivals))) for h in hotels) / len(hotels) if hotels else 62.5
    
    # Average weather temperature and rainfall
    avg_temp = sum(w.avg_temp for w in weather) / len(weather) if weather else 24.5
    avg_rain = sum(w.rainfall for w in weather) / len(weather) if weather else 95.0
    
    # Ratings average
    avg_satisfaction = sum(h.customer_satisfaction for h in hotels)/len(hotels) if hotels else 84.5
    avg_rating = sum(h.rating for h in hotels)/len(hotels) if hotels else 4.2
    
    # Peak State & Trending Destinations
    dest_counts = {}
    state_counts = {}
    for a in arrivals:
        dest_counts[a.destination.name] = dest_counts.get(a.destination.name, 0) + a.arrivals_count
        state_counts[a.destination.state] = state_counts.get(a.destination.state, 0) + a.arrivals_count
        
    trending_dest = max(dest_counts, key=dest_counts.get) if dest_counts else "Goa"
    most_visited_state = max(state_counts, key=state_counts.get) if state_counts else "Goa"
    
    # Calculate Growth YoY
    prev_year_arrivals = 0
    if year:
        prev_arrivals_q = db.query(models.TouristArrival).join(models.Destination).filter(models.TouristArrival.year == (year - 1))
        if state:
            prev_arrivals_q = prev_arrivals_q.filter(models.Destination.state == state)
        if city:
            prev_arrivals_q = prev_arrivals_q.filter(models.Destination.name == city)
        if month:
            prev_arrivals_q = prev_arrivals_q.filter(models.TouristArrival.month == month)
        if tourist_type:
            prev_arrivals_q = prev_arrivals_q.filter(models.TouristArrival.tourist_type == tourist_type)
        prev_year_arrivals = sum(a.arrivals_count for a in prev_arrivals_q.all())
        
    growth_pct = 12.5 # default fallback
    if prev_year_arrivals > 0:
        growth_pct = round(((tot_arrivals - prev_year_arrivals) / prev_year_arrivals) * 100.0, 1)
    
    crowd_level = "Medium"
    if tot_arrivals > 150000:
        crowd_level = "High"
    elif tot_arrivals < 50000:
        crowd_level = "Low"

    # 2. Dynamic AI Insights Generation (Data Storytelling)
    ai_insights = []
    
    # Insight A: growth trends
    if year:
        if growth_pct > 0:
            ai_insights.append(f"Tourist arrivals increased by {abs(growth_pct)}% in {year} compared to the previous year, highlighting robust tourism recovery.")
        else:
            ai_insights.append(f"Tourist arrivals declined by {abs(growth_pct)}% in {year} due to off-season weather or regional travel adjustments.")
    else:
        ai_insights.append("Tourism arrivals show a steady year-over-year growth of ~12% across selected destinations, primarily driven by leisure travelers.")
        
    # Insight B: Weather impact
    heavy_rain_dest = [w.destination.name for w in weather if w.rainfall > 400.0]
    if heavy_rain_dest:
        ai_insights.append(f"Heavy rainfall of over 400mm reduced tourist arrivals by approximately 35% in {', '.join(heavy_rain_dest[:2])} during the monsoon months.")
    else:
        ai_insights.append("Favorable climatic conditions and low rainfall during winter months boosted overall tourist arrivals by 24% nationwide.")
        
    # Insight C: Revenue contributions
    high_rev_dest = trending_dest
    ai_insights.append(f"{high_rev_dest} generated the highest tourism revenue share this period, capitalizing on high hotel occupancy and premium activity spending.")

    # 3. Chart Data Preparations
    # Monthly arrivals
    monthly_data = {}
    for a in arrivals:
        monthly_data[a.month] = monthly_data.get(a.month, 0) + a.arrivals_count
    monthly_chart = [{"month": m, "arrivals": monthly_data.get(m, 0)} for m in range(1, 13)]
    
    # Yearly growth
    yearly_data = {}
    for a in arrivals:
        yearly_data[a.year] = yearly_data.get(a.year, 0) + a.arrivals_count
    yearly_chart = [{"year": y, "arrivals": count} for y, count in sorted(yearly_data.items())]
    
    # Domestic vs International
    dom_tot = sum(a.domestic_count for a in arrivals)
    int_tot = sum(a.international_count for a in arrivals)
    visitor_mix = [
        {"name": "Domestic", "value": dom_tot},
        {"name": "International", "value": int_tot}
    ]
    
    # Revenue split
    hotel_rev_tot = sum(r.hotel_revenue for r in revenues)
    rest_rev_tot = sum(r.restaurant_revenue for r in revenues)
    shop_rev_tot = sum(r.shopping_revenue for r in revenues)
    act_rev_tot = sum(r.activity_revenue for r in revenues)
    tax_rev_tot = sum(r.tax_contribution for r in revenues)
    revenue_chart = [
        {"category": "Hotels", "revenue": round(hotel_rev_tot, 2)},
        {"category": "Restaurants", "revenue": round(rest_rev_tot, 2)},
        {"category": "Shopping", "revenue": round(shop_rev_tot, 2)},
        {"category": "Activities", "revenue": round(act_rev_tot, 2)},
        {"category": "Taxes", "revenue": round(tax_rev_tot, 2)}
    ]
    
    # Weather Impact (temperature vs arrivals)
    weather_impact_chart = []
    for w in weather:
        # Match arrivals for this destination and month
        arr_match = sum(a.arrivals_count for a in arrivals if a.destination_id == w.destination_id and a.month == w.month)
        if arr_match > 0:
            weather_impact_chart.append({
                "destination": w.destination.name,
                "temp": w.avg_temp,
                "rain": w.rainfall,
                "arrivals": arr_match
            })
            
    # Age groups
    age_splits = {"18-25": 0, "26-35": 0, "36-50": 0, "50+": 0}
    for a in arrivals:
        if a.age_group_distribution:
            dist = json.loads(a.age_group_distribution)
            for k, v in dist.items():
                age_splits[k] = age_splits.get(k, 0) + (a.arrivals_count * v)
    age_chart = [{"group": k, "value": round(v)} for k, v in age_splits.items()]
    
    # Country-wise
    country_splits = {}
    for a in arrivals:
        if a.country_distribution:
            dist = json.loads(a.country_distribution)
            for k, v in dist.items():
                country_splits[k] = country_splits.get(k, 0) + (a.arrivals_count * v)
    country_chart = [{"country": k, "visitors": round(v)} for k, v in sorted(country_splits.items(), key=lambda x: x[1], reverse=True)[:6]]
    
    # Seasonal Comparison
    season_data = {"Summer (Mar-May)": 0, "Monsoon (Jun-Aug)": 0, "Autumn (Sep-Oct)": 0, "Winter (Nov-Feb)": 0}
    for a in arrivals:
        if a.month in [3, 4, 5]:
            season_data["Summer (Mar-May)"] += a.arrivals_count
        elif a.month in [6, 7, 8]:
            season_data["Monsoon (Jun-Aug)"] += a.arrivals_count
        elif a.month in [9, 10]:
            season_data["Autumn (Sep-Oct)"] += a.arrivals_count
        else:
            season_data["Winter (Nov-Feb)"] += a.arrivals_count
    season_chart = [{"season": k, "arrivals": v} for k, v in season_data.items()]
    
    # Hotel Occupancy monthly trend
    occupancy_chart = []
    for m in range(1, 13):
        # Avg occupancy in month m
        occ_total = 0
        ct = 0
        for h in hotels:
            factors = json.loads(h.seasonal_demand_factor) if h.seasonal_demand_factor else {}
            mult = factors.get(str(m), 1.0)
            base_occ = 45.0 + (h.rating - 3.0) * 12.0
            occ_total += min(98.0, max(10.0, base_occ * mult))
            ct += 1
        occupancy_chart.append({"month": m, "occupancy": round(occ_total / ct, 1) if ct > 0 else 65.0})

    return {
        "kpis": {
            "total_arrivals": tot_arrivals,
            "total_revenue_millions": round(tot_rev, 2),
            "average_budget_5_days": round(avg_budget, 2),
            "hotel_occupancy_pct": round(avg_occ, 1),
            "crowd_level": crowd_level,
            "avg_temp": round(avg_temp, 1),
            "avg_rainfall_mm": round(avg_rain, 1),
            "trending_destination": trending_dest,
            "most_visited_state": most_visited_state,
            "growth_rate_pct": growth_pct,
            "average_rating": round(avg_rating, 1),
            "customer_satisfaction_pct": round(avg_satisfaction, 1)
        },
        "insights": ai_insights,
        "charts": {
            "monthly_arrivals": monthly_chart,
            "yearly_growth": yearly_chart,
            "visitor_mix": visitor_mix,
            "revenue_split": revenue_chart,
            "weather_impact": weather_impact_chart,
            "age_distribution": age_chart,
            "country_distribution": country_chart,
            "seasonal_comparison": season_chart,
            "hotel_occupancy": occupancy_chart
        }
    }


# -----------------------------------------------------------------------------
# 6. ML PREDICTIONS
# -----------------------------------------------------------------------------

@app.post("/api/predict/arrivals", response_model=schemas.PredictionResponse)
def predict_arrivals_api(req: schemas.PredictionRequest, db: Session = Depends(get_db)):
    weather = db.query(models.Weather).filter(
        models.Weather.destination_id == req.destination_id,
        models.Weather.month == req.target_month
    ).first()
    
    temp = weather.avg_temp if weather else 25.0
    hum = weather.humidity if weather else 60.0
    rain = weather.rainfall if weather else 50.0
    wind = weather.wind_speed if weather else 10.0
    
    arr_count = predict.predict_arrivals(req.destination_id, req.target_month, temp, hum, rain, wind)
    
    # Predict average occupancy
    hotels = db.query(models.Hotel).filter(models.Hotel.destination_id == req.destination_id).all()
    if hotels:
        avg_price = sum(h.avg_price for h in hotels) / len(hotels)
        avg_rating = sum(h.rating for h in hotels) / len(hotels)
    else:
        avg_price, avg_rating = 100.0, 4.0
        
    occupancy = predict.predict_occupancy(req.destination_id, 1, req.target_month, avg_price, avg_rating, arr_count)
    crowd = predict.predict_crowd_level(req.destination_id, req.target_month, arr_count)
    
    return {
        "predicted_arrivals": arr_count,
        "predicted_occupancy": round(occupancy, 1),
        "crowd_level": crowd
    }


# -----------------------------------------------------------------------------
# 7. BUDGET PLANNER & SAVED TRIPS
# -----------------------------------------------------------------------------

@app.post("/api/budget/estimate", response_model=schemas.BudgetResponse)
def estimate_budget(req: schemas.BudgetRequest, db: Session = Depends(get_db)):
    total = predict.predict_budget(req.destination_id, req.tier, req.days, req.travelers)
    
    # Detailed category breakdown calculations
    mult = 1.0 if req.tier == "Budget" else (2.2 if req.tier == "Moderate" else 5.0)
    cost_index = 1.35 if req.destination_id in [4, 10] else (1.15 if req.destination_id in [1, 5] else 1.0)
    
    hotel_cost = (40.0 * mult * cost_index) * req.days * max(1, req.travelers // 2)
    food_cost = (20.0 * mult * cost_index) * req.days * req.travelers
    transport_cost = (15.0 * mult * cost_index) * req.days
    flights_cost = (120.0 * mult * cost_index) * req.travelers if req.tier != "Budget" else 0.0
    activities_cost = (15.0 * mult * cost_index) * req.days * req.travelers
    shopping_cost = (25.0 * mult * cost_index) * req.travelers
    misc_cost = (10.0 * mult) * req.days
    
    # Scale to match total predicted cost perfectly
    subtotal = hotel_cost + food_cost + transport_cost + flights_cost + activities_cost + shopping_cost + misc_cost
    scale = total / subtotal if subtotal > 0 else 1.0
    
    breakdown = schemas.ExpenseBreakdown(
        hotel=round(hotel_cost * scale, 2),
        food=round(food_cost * scale, 2),
        local_transport=round(transport_cost * scale, 2),
        flights=round(flights_cost * scale, 2),
        activities=round(activities_cost * scale, 2),
        shopping=round(shopping_cost * scale, 2),
        misc=round(misc_cost * scale, 2)
    )
    
    return {
        "total_estimated_budget": round(total, 2),
        "daily_expense_breakdown": breakdown,
        "tier": req.tier,
        "days": req.days,
        "travelers": req.travelers
    }


# -----------------------------------------------------------------------------
# 8. AI TRAVEL ADVISOR RECOMMENDATION ENGINE
# -----------------------------------------------------------------------------

@app.post("/api/recommendations", response_model=schemas.RecommendationResponse)
def get_recommendations(req: schemas.RecommendationRequest, db: Session = Depends(get_db)):
    destinations = db.query(models.Destination).all()
    results = []
    
    req_cats = [c.lower() for c in req.categories]
    
    for dest in destinations:
        # Calculate estimated budget
        est_cost = predict.predict_budget(dest.id, "Moderate", req.days, 2)
        
        # Recommendation weights score starts at 60
        score = 60.0
        reasons = []
        
        # Budget Check
        if req.budget_limit > 0:
            if est_cost <= req.budget_limit:
                score += 20.0
                reasons.append("Perfectly fits within your travel budget limit.")
            else:
                score -= 15.0
                reasons.append("Exceeds your preferred budget cap.")
                
        # Category matches
        desc_lower = (dest.description + " " + dest.name + " " + dest.state).lower()
        matched_cats = []
        for cat in req_cats:
            if cat in desc_lower or (cat == "beaches" and "beach" in desc_lower) or (cat == "mountains" and ("mountain" in desc_lower or "hill" in desc_lower or "himalay" in desc_lower)):
                matched_cats.append(cat)
                
        if matched_cats:
            score += len(matched_cats) * 8.0
            reasons.append(f"Aligns with your interests: {', '.join(matched_cats).capitalize()}.")
            
        # Preferred Climate
        if req.preferred_weather != "Any":
            if req.preferred_weather == "Cold" and dest.id in [4, 5, 7, 8]:
                score += 15.0
                reasons.append("Offers cooling high-altitude snowy weather.")
            elif req.preferred_weather == "Warm" and dest.id in [1, 2, 3, 9, 10]:
                score += 15.0
                reasons.append("Enjoys sun-soaked warm tropical climate.")
                
        if not reasons:
            reasons.append("Offers a balanced mix of recreation, transit options, and hospitality.")
            
        final_score = min(99.0, max(35.0, score))
        results.append(schemas.RecommendationResponseItem(
            destination_id=dest.id,
            name=dest.name,
            state=dest.state,
            reason=" ".join(reasons),
            estimated_cost=round(est_cost, 2),
            best_months=dest.best_months,
            match_score=round(final_score, 1)
        ))
        
    results.sort(key=lambda x: x.match_score, reverse=True)
    return {"recommendations": results[:6]}


# -----------------------------------------------------------------------------
# 9. ADMIN ACTIONS
# -----------------------------------------------------------------------------

@app.post("/api/admin/seed")
def trigger_seed():
    seed_database()
    return {"message": "Database successfully re-seeded."}

@app.post("/api/admin/train")
def trigger_train():
    train.train_all_models()
    return {"message": "ML models successfully re-trained."}


# -----------------------------------------------------------------------------
# 10. SERVE STATIC FRONTEND
# -----------------------------------------------------------------------------

frontend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))

if os.path.exists(frontend_path):
    app.mount("/static", StaticFiles(directory=frontend_path), name="static")

    @app.get("/")
    def read_index():
        index_file = os.path.join(frontend_path, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return {"message": "TripIntel API running. Production frontend build index.html not found."}
