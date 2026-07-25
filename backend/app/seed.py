import json
import random
from sqlalchemy.orm import Session
from app.database import engine, SessionLocal, Base
from app.models import User, Destination, Hotel, TouristArrival, Revenue, Weather, Attraction, Restaurant, Review, Budget
from app.auth import get_password_hash

def seed_database():
    db = SessionLocal()
    try:
        print("Re-creating all database tables...")
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)

        print("Seeding users...")
        pw_hash = get_password_hash("Password123")
        
        users = [
            User(email="tourist@tripintel.com", password_hash=pw_hash, full_name="John Tourist", role="Tourist"),
            User(email="analyst@tripintel.com", password_hash=pw_hash, full_name="Sarah Analyst", role="Business Analyst"),
            User(email="admin@tripintel.com", password_hash=pw_hash, full_name="Alex Admin", role="Tourism Administrator")
        ]
        db.add_all(users)
        db.commit()

        print("Seeding destinations...")
        destinations_data = [
            {
                "name": "Goa",
                "state": "Goa",
                "description": "Famous for its pristine beaches, vibrant nightlife, Portuguese heritage, and delicious seafood.",
                "image_url": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=60",
                "best_months": "November,December,January,February",
                "transport_options": json.dumps(["Flight", "Train", "Bus", "Car"]),
                "lat": 15.2993,
                "lng": 74.1240
            },
            {
                "name": "Kerala",
                "state": "Kerala",
                "description": "Known as 'God's Own Country', famous for its tranquil backwaters, houseboats, tea gardens, and spice plantations.",
                "image_url": "https://images.unsplash.com/photo-1542856391-010fb87dcfed?w=800&auto=format&fit=crop&q=60",
                "best_months": "September,October,November,December,January,February",
                "transport_options": json.dumps(["Flight", "Train", "Bus", "Car"]),
                "lat": 10.8505,
                "lng": 76.2711
            },
            {
                "name": "Jaipur",
                "state": "Rajasthan",
                "description": "The 'Pink City' of India, boasting majestic forts, opulent palaces, and a rich cultural heritage.",
                "image_url": "https://images.unsplash.com/photo-1477584322904-48618db530c2?w=800&auto=format&fit=crop&q=60",
                "best_months": "October,November,December,January,February,March",
                "transport_options": json.dumps(["Flight", "Train", "Bus", "Car"]),
                "lat": 26.9124,
                "lng": 75.7873
            },
            {
                "name": "Ladakh",
                "state": "Ladakh (UT)",
                "description": "A high-altitude cold desert famous for its dramatic mountain landscapes, pristine lakes, and Buddhist monasteries.",
                "image_url": "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=800&auto=format&fit=crop&q=60",
                "best_months": "June,July,August,September",
                "transport_options": json.dumps(["Flight", "Car", "Bike"]),
                "lat": 34.1526,
                "lng": 77.5771
            },
            {
                "name": "Kashmir",
                "state": "Jammu and Kashmir",
                "description": "Often described as 'Paradise on Earth', famous for Dal Lake houseboats, shikaras, snowfields, and gardens.",
                "image_url": "https://images.unsplash.com/photo-1566837945700-30057527ade0?w=800&auto=format&fit=crop&q=60",
                "best_months": "March,April,May,October,November,December",
                "transport_options": json.dumps(["Flight", "Train", "Car"]),
                "lat": 34.0837,
                "lng": 74.7973
            },
            {
                "name": "Rishikesh",
                "state": "Uttarakhand",
                "description": "The 'Yoga Capital of the World', situated on the banks of the Ganges, known for spirituality and white-water rafting.",
                "image_url": "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&auto=format&fit=crop&q=60",
                "best_months": "September,October,November,March,April,May",
                "transport_options": json.dumps(["Train", "Bus", "Car"]),
                "lat": 30.0869,
                "lng": 78.2676
            },
            {
                "name": "Manali",
                "state": "Himachal Pradesh",
                "description": "A popular high-altitude Himalayan resort town, ideal for backpacking, skiing, and adventure sports.",
                "image_url": "https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800&auto=format&fit=crop&q=60",
                "best_months": "March,April,May,June,October,November,December",
                "transport_options": json.dumps(["Bus", "Car"]),
                "lat": 32.2396,
                "lng": 77.1887
            },
            {
                "name": "Shimla",
                "state": "Himachal Pradesh",
                "description": "The summer capital of British India, known for its colonial architecture, Mall Road, and toy train.",
                "image_url": "https://images.unsplash.com/photo-1571501679680-de32f141a1ab?w=800&auto=format&fit=crop&q=60",
                "best_months": "March,April,May,June,October,November,December",
                "transport_options": json.dumps(["Train", "Bus", "Car"]),
                "lat": 31.1048,
                "lng": 77.1734
            },
            {
                "name": "Udaipur",
                "state": "Rajasthan",
                "description": "The 'City of Lakes', famous for its majestic palaces floating in the center of historic lakes.",
                "image_url": "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800&auto=format&fit=crop&q=60",
                "best_months": "October,November,December,January,February,March",
                "transport_options": json.dumps(["Flight", "Train", "Bus", "Car"]),
                "lat": 24.5854,
                "lng": 73.7125
            },
            {
                "name": "Andaman Islands",
                "state": "Andaman and Nicobar Islands",
                "description": "An archipelago in the Bay of Bengal, known for white-sand beaches, coral reefs, scuba diving, and history.",
                "image_url": "https://images.unsplash.com/photo-1589392687870-ee214820bc21?w=800&auto=format&fit=crop&q=60",
                "best_months": "November,December,January,February,March,April",
                "transport_options": json.dumps(["Flight", "Ship"]),
                "lat": 11.7401,
                "lng": 92.6586
            }
        ]

        destinations = []
        for d in destinations_data:
            dest = Destination(**d)
            db.add(dest)
            destinations.append(dest)
        db.commit()

        # Refresh destinations to get IDs
        for d in destinations:
            db.refresh(d)

        print("Seeding hotels...")
        hotels_data = [
            # Goa
            {"destination_id": 1, "name": "Taj Exotica Resort & Spa", "avg_price": 280.0, "rating": 4.8, "total_rooms": 140, "customer_satisfaction": 94.0},
            {"destination_id": 1, "name": "Baga Beach Breeze Inn", "avg_price": 45.0, "rating": 3.9, "total_rooms": 40, "customer_satisfaction": 78.0},
            {"destination_id": 1, "name": "Seaside Glasshouse Villa", "avg_price": 130.0, "rating": 4.4, "total_rooms": 25, "customer_satisfaction": 86.0},
            # Kerala
            {"destination_id": 2, "name": "Kumarakom Lake Resort", "avg_price": 220.0, "rating": 4.7, "total_rooms": 80, "customer_satisfaction": 91.0},
            {"destination_id": 2, "name": "Munnar Tea Hills Homestay", "avg_price": 35.0, "rating": 4.2, "total_rooms": 15, "customer_satisfaction": 88.0},
            # Jaipur
            {"destination_id": 3, "name": "The Rambagh Palace", "avg_price": 350.0, "rating": 4.9, "total_rooms": 78, "customer_satisfaction": 96.0},
            {"destination_id": 3, "name": "Heritage Haveli Mansion", "avg_price": 75.0, "rating": 4.3, "total_rooms": 45, "customer_satisfaction": 84.0},
            # Ladakh
            {"destination_id": 4, "name": "The Grand Dragon Ladakh", "avg_price": 150.0, "rating": 4.6, "total_rooms": 76, "customer_satisfaction": 89.0},
            {"destination_id": 4, "name": "Pangong Lake Eco-Camps", "avg_price": 55.0, "rating": 4.0, "total_rooms": 30, "customer_satisfaction": 80.0},
            # Kashmir
            {"destination_id": 5, "name": "The Lalit Grand Palace Srinagar", "avg_price": 210.0, "rating": 4.7, "total_rooms": 113, "customer_satisfaction": 92.0},
            {"destination_id": 5, "name": "Dal Lake Royal Houseboat", "avg_price": 90.0, "rating": 4.5, "total_rooms": 10, "customer_satisfaction": 90.0},
            # Rishikesh
            {"destination_id": 6, "name": "Ananda in the Himalayas", "avg_price": 400.0, "rating": 4.9, "total_rooms": 70, "customer_satisfaction": 95.0},
            {"destination_id": 6, "name": "Ganga Edge Backpacker Hostel", "avg_price": 15.0, "rating": 4.1, "total_rooms": 60, "customer_satisfaction": 82.0},
            # Manali
            {"destination_id": 7, "name": "Solang Valley Ski Resort", "avg_price": 120.0, "rating": 4.4, "total_rooms": 50, "customer_satisfaction": 87.0},
            {"destination_id": 7, "name": "Snow View Wooden Cabins", "avg_price": 50.0, "rating": 4.2, "total_rooms": 20, "customer_satisfaction": 85.0},
            # Shimla
            {"destination_id": 8, "name": "Wildflower Hall Oberoi", "avg_price": 380.0, "rating": 4.9, "total_rooms": 85, "customer_satisfaction": 97.0},
            {"destination_id": 8, "name": "Pine Crest Family Lodge", "avg_price": 60.0, "rating": 4.1, "total_rooms": 35, "customer_satisfaction": 81.0},
            # Udaipur
            {"destination_id": 9, "name": "The Taj Lake Palace", "avg_price": 450.0, "rating": 4.9, "total_rooms": 83, "customer_satisfaction": 98.0},
            {"destination_id": 9, "name": "Lakeview Heritage Pension", "avg_price": 40.0, "rating": 4.2, "total_rooms": 18, "customer_satisfaction": 86.0},
            # Andaman
            {"destination_id": 10, "name": "Taj Exotica Resort Havelock", "avg_price": 320.0, "rating": 4.8, "total_rooms": 72, "customer_satisfaction": 93.0},
            {"destination_id": 10, "name": "Barefoot at Havelock Eco Lodge", "avg_price": 140.0, "rating": 4.5, "total_rooms": 31, "customer_satisfaction": 89.0}
        ]

        for h in hotels_data:
            # Generate monthly demand multipliers (JSON)
            multipliers = {}
            for m in range(1, 13):
                if m in [11, 12, 1, 2]:
                    multipliers[m] = 1.3
                elif m in [6, 7, 8]:
                    multipliers[m] = 0.6 if h["destination_id"] != 4 else 1.6  # Ladakh peaks in summer
                else:
                    multipliers[m] = 1.0
            h["seasonal_demand_factor"] = json.dumps(multipliers)
            db.add(Hotel(**h))
        db.commit()

        print("Seeding weather data (all 12 months for each destination)...")
        weather_templates = {
            1: {"temp": [27, 28, 29, 31, 32, 29, 27, 27, 28, 29, 28, 27], "humidity": [70, 72, 73, 75, 78, 88, 92, 90, 85, 80, 75, 70], "rain": [2, 1, 2, 10, 80, 800, 950, 700, 350, 120, 25, 5], "wind": [10, 11, 12, 13, 14, 18, 20, 19, 15, 12, 10, 9]},
            2: {"temp": [27, 28, 29, 30, 29, 27, 26, 26, 27, 27, 27, 27], "humidity": [75, 76, 78, 80, 82, 90, 93, 91, 88, 85, 80, 76], "rain": [15, 20, 40, 110, 280, 680, 720, 410, 280, 290, 180, 30], "wind": [8, 9, 10, 11, 10, 13, 14, 13, 11, 9, 8, 8]},
            3: {"temp": [15, 18, 24, 30, 35, 36, 31, 29, 29, 27, 21, 16], "humidity": [45, 40, 35, 30, 35, 50, 70, 75, 68, 50, 45, 48], "rain": [5, 6, 4, 3, 12, 55, 220, 240, 90, 15, 4, 3], "wind": [8, 9, 11, 12, 14, 15, 13, 12, 10, 8, 7, 8]},
            4: {"temp": [-8, -5, 1, 7, 12, 16, 19, 18, 14, 7, 0, -5], "humidity": [35, 38, 40, 42, 45, 43, 48, 50, 46, 40, 36, 34], "rain": [3, 2, 4, 5, 6, 4, 12, 15, 8, 3, 2, 2], "wind": [12, 13, 14, 16, 17, 15, 13, 12, 11, 12, 13, 11]},
            5: {"temp": [2, 4, 9, 15, 19, 23, 25, 24, 21, 15, 9, 4], "humidity": [80, 78, 72, 65, 62, 58, 65, 70, 68, 72, 75, 80], "rain": [50, 65, 90, 85, 60, 40, 70, 80, 45, 25, 30, 45], "wind": [6, 7, 8, 9, 10, 9, 8, 7, 7, 6, 6, 6]},
            6: {"temp": [13, 16, 22, 28, 32, 31, 27, 26, 25, 22, 17, 13], "humidity": [55, 52, 45, 40, 45, 65, 82, 85, 78, 60, 52, 54], "rain": [15, 20, 25, 30, 70, 280, 490, 450, 190, 45, 10, 8], "wind": [7, 8, 9, 10, 11, 10, 8, 7, 8, 7, 7, 7]},
            7: {"temp": [4, 6, 11, 16, 20, 22, 21, 20, 18, 13, 8, 5], "humidity": [60, 58, 55, 50, 52, 60, 78, 80, 72, 62, 58, 60], "rain": [40, 45, 60, 55, 65, 110, 310, 290, 130, 40, 15, 30], "wind": [8, 9, 10, 11, 12, 11, 9, 8, 9, 8, 8, 8]},
            8: {"temp": [6, 8, 12, 17, 20, 21, 19, 18, 17, 14, 10, 7], "humidity": [65, 62, 58, 52, 55, 68, 85, 88, 78, 65, 60, 62], "rain": [60, 65, 75, 65, 75, 160, 380, 340, 150, 45, 15, 25], "wind": [9, 10, 11, 12, 13, 11, 9, 8, 9, 8, 8, 9]},
            9: {"temp": [16, 19, 25, 30, 33, 32, 28, 27, 27, 26, 21, 17], "humidity": [48, 43, 38, 35, 40, 55, 75, 79, 72, 55, 48, 50], "rain": [3, 2, 2, 4, 10, 80, 260, 240, 95, 12, 3, 2], "wind": [8, 9, 10, 11, 13, 14, 12, 11, 9, 8, 7, 8]},
            10: {"temp": [26, 26, 27, 28, 29, 28, 27, 27, 27, 27, 27, 26], "humidity": [76, 75, 77, 78, 81, 86, 88, 87, 86, 84, 80, 78], "rain": [40, 25, 20, 70, 350, 520, 450, 410, 480, 320, 220, 110], "wind": [12, 13, 14, 15, 18, 20, 21, 19, 16, 14, 13, 12]}
        }

        for dest_id, data in weather_templates.items():
            for m in range(1, 13):
                idx = m - 1
                weather_rec = Weather(
                    destination_id=dest_id,
                    month=m,
                    avg_temp=float(data["temp"][idx]),
                    humidity=float(data["humidity"][idx]),
                    rainfall=float(data["rain"][idx]),
                    wind_speed=float(data["wind"][idx])
                )
                db.add(weather_rec)
        db.commit()

        print("Seeding attractions and restaurants...")
        # Attractions
        attractions_data = [
            # Goa
            {"destination_id": 1, "name": "Baga Beach", "type": "Nature", "rating": 4.5, "lat": 15.5522, "lng": 73.7516},
            {"destination_id": 1, "name": "Basilica of Bom Jesus", "type": "Historical", "rating": 4.7, "lat": 15.5009, "lng": 73.9116},
            {"destination_id": 1, "name": "Dudhsagar Falls", "type": "Nature", "rating": 4.6, "lat": 15.3126, "lng": 74.3142},
            # Kerala
            {"destination_id": 2, "name": "Alappuzha Backwaters", "type": "Nature", "rating": 4.8, "lat": 9.4981, "lng": 76.3388},
            {"destination_id": 2, "name": "Eravikulam National Park", "type": "Nature", "rating": 4.5, "lat": 10.1500, "lng": 77.0800},
            # Jaipur
            {"destination_id": 3, "name": "Amer Fort", "type": "Historical", "rating": 4.8, "lat": 26.9855, "lng": 75.8513},
            {"destination_id": 3, "name": "Hawa Mahal", "type": "Historical", "rating": 4.6, "lat": 26.9239, "lng": 75.8267},
            # Ladakh
            {"destination_id": 4, "name": "Pangong Tso Lake", "type": "Nature", "rating": 4.9, "lat": 33.7595, "lng": 78.6674},
            {"destination_id": 4, "name": "Thiksey Monastery", "type": "Spiritual", "rating": 4.7, "lat": 34.0560, "lng": 77.6667},
            # Kashmir
            {"destination_id": 5, "name": "Shalimar Bagh", "type": "Historical", "rating": 4.6, "lat": 34.1415, "lng": 74.8732},
            {"destination_id": 5, "name": "Gulmarg Gondola Ride", "type": "Adventure", "rating": 4.8, "lat": 34.0485, "lng": 74.3805},
            # Rishikesh
            {"destination_id": 6, "name": "Laxman Jhula", "type": "Spiritual", "rating": 4.5, "lat": 30.1299, "lng": 78.3248},
            {"destination_id": 6, "name": "Triveni Ghat", "type": "Spiritual", "rating": 4.6, "lat": 30.1190, "lng": 78.3120},
            # Manali
            {"destination_id": 7, "name": "Solang Valley", "type": "Adventure", "rating": 4.6, "lat": 32.3160, "lng": 77.1605},
            {"destination_id": 7, "name": "Hadimba Temple", "type": "Spiritual", "rating": 4.5, "lat": 32.2475, "lng": 77.1795},
            # Shimla
            {"destination_id": 8, "name": "Jakhoo Temple", "type": "Spiritual", "rating": 4.4, "lat": 31.1009, "lng": 77.1852},
            {"destination_id": 8, "name": "The Ridge", "type": "Historical", "rating": 4.5, "lat": 31.1044, "lng": 77.1742},
            # Udaipur
            {"destination_id": 9, "name": "City Palace Udaipur", "type": "Historical", "rating": 4.8, "lat": 24.5764, "lng": 73.6835},
            {"destination_id": 9, "name": "Lake Pichola", "type": "Nature", "rating": 4.7, "lat": 24.5684, "lng": 73.6766},
            # Andaman
            {"destination_id": 10, "name": "Radhanagar Beach", "type": "Nature", "rating": 4.9, "lat": 11.9839, "lng": 92.9568},
            {"destination_id": 10, "name": "Cellular Jail National Memorial", "type": "Historical", "rating": 4.7, "lat": 11.6738, "lng": 92.7479}
        ]

        for attr in attractions_data:
            db.add(Attraction(**attr))

        # Restaurants
        restaurants_data = [
            # Goa
            {"destination_id": 1, "name": "Curlies Beach Shack", "cuisine": "Seafood & Goan", "rating": 4.2, "lat": 15.5434, "lng": 73.7410},
            {"destination_id": 1, "name": "Thalassa Greek Restaurant", "cuisine": "Mediterranean", "rating": 4.6, "lat": 15.6022, "lng": 73.7345},
            # Kerala
            {"destination_id": 2, "name": "Villa Maya", "cuisine": "Traditional Keralite", "rating": 4.7, "lat": 8.4839, "lng": 76.9424},
            {"destination_id": 2, "name": "Fort House Restaurant", "cuisine": "Seafood", "rating": 4.3, "lat": 9.9678, "lng": 76.2488},
            # Jaipur
            {"destination_id": 3, "name": "LMB Restaurant", "cuisine": "Rajasthani Thali", "rating": 4.4, "lat": 26.9189, "lng": 75.8282},
            {"destination_id": 3, "name": "Suvarna Mahal", "cuisine": "Royal Fine Dining", "rating": 4.8, "lat": 26.8980, "lng": 75.8118},
            # Rishikesh
            {"destination_id": 6, "name": "Little Buddha Cafe", "cuisine": "Multi-cuisine Vegetarian", "rating": 4.4, "lat": 30.1292, "lng": 78.3241},
            {"destination_id": 6, "name": "Chotiwala Restaurant", "cuisine": "North Indian", "rating": 4.1, "lat": 30.1218, "lng": 78.3145}
        ]

        for rest in restaurants_data:
            db.add(Restaurant(**rest))
        db.commit()

        print("Seeding historical Tourist Arrivals (5 Years, monthly, 2021 to 2025)...")
        tourist_types = ["Leisure", "Business", "Spiritual"]
        age_groups_template = {"18-25": 0.20, "26-35": 0.40, "36-50": 0.25, "50+": 0.15}
        country_distribution_template = {"Domestic": 0.85, "USA": 0.04, "UK": 0.03, "Germany": 0.02, "France": 0.02, "Others": 0.04}
        
        arrivals_list = []
        for dest in destinations:
            if dest.name == "Goa":
                base_yearly = 350000
                primary_type = "Leisure"
            elif dest.name == "Kerala":
                base_yearly = 280000
                primary_type = "Leisure"
            elif dest.name == "Jaipur":
                base_yearly = 300000
                primary_type = "Leisure"
            elif dest.name == "Rishikesh":
                base_yearly = 150000
                primary_type = "Spiritual"
            elif dest.name == "Ladakh":
                base_yearly = 80000
                primary_type = "Leisure"
            elif dest.name == "Kashmir":
                base_yearly = 200000
                primary_type = "Leisure"
            elif dest.name in ["Manali", "Shimla"]:
                base_yearly = 180000
                primary_type = "Leisure"
            elif dest.name == "Udaipur":
                base_yearly = 160000
                primary_type = "Leisure"
            else: # Andaman
                base_yearly = 100000
                primary_type = "Leisure"
                
            for year in range(2021, 2026):
                year_multiplier = 0.7 if year == 2021 else (0.85 if year == 2022 else (1.0 if year == 2023 else (1.12 if year == 2024 else 1.25)))
                
                for month in range(1, 13):
                    m_idx = month - 1
                    
                    if dest.name == "Goa":
                        month_mult = [1.4, 1.3, 1.0, 0.7, 0.6, 0.3, 0.2, 0.3, 0.6, 1.0, 1.3, 1.7][m_idx]
                    elif dest.name == "Kerala":
                        month_mult = [1.3, 1.2, 1.0, 0.8, 0.7, 0.5, 0.4, 0.5, 0.7, 1.0, 1.2, 1.4][m_idx]
                    elif dest.name in ["Jaipur", "Udaipur"]:
                        month_mult = [1.5, 1.3, 1.1, 0.7, 0.4, 0.3, 0.3, 0.4, 0.6, 1.1, 1.3, 1.5][m_idx]
                    elif dest.name == "Ladakh":
                        month_mult = [0.1, 0.2, 0.4, 0.8, 1.3, 1.7, 1.8, 1.6, 1.1, 0.5, 0.2, 0.1][m_idx]
                    elif dest.name == "Kashmir":
                        month_mult = [1.2, 1.1, 1.2, 1.4, 1.3, 0.8, 0.5, 0.6, 0.9, 1.2, 1.1, 1.0][m_idx]
                    elif dest.name in ["Manali", "Shimla"]:
                        month_mult = [0.8, 0.9, 1.1, 1.3, 1.5, 1.6, 1.0, 0.9, 1.2, 1.4, 1.1, 0.8][m_idx]
                    elif dest.name == "Rishikesh":
                        month_mult = [1.2, 1.1, 1.2, 1.3, 1.4, 1.0, 0.5, 0.6, 0.9, 1.3, 1.2, 1.1][m_idx]
                    else: # Andaman
                        month_mult = [1.3, 1.2, 1.0, 0.7, 0.6, 0.4, 0.3, 0.4, 0.6, 1.1, 1.3, 1.5][m_idx]
                        
                    monthly_base = (base_yearly / 12.0) * year_multiplier * month_mult
                    arrivals_count = int(monthly_base + random.randint(-500, 500))
                    arrivals_count = max(100, arrivals_count)
                    
                    intl_rate = 0.22 if dest.name in ["Goa", "Kerala", "Jaipur"] else 0.08
                    if month in [6, 7, 8] and dest.name != "Ladakh":
                        intl_rate *= 0.4
                        
                    international = int(arrivals_count * intl_rate)
                    domestic = arrivals_count - international
                    
                    age_dist = age_groups_template.copy()
                    if dest.name == "Rishikesh":
                        age_dist = {"18-25": 0.25, "26-35": 0.35, "36-50": 0.20, "50+": 0.20}
                        
                    country_dist = country_distribution_template.copy()
                    if dest.name == "Goa":
                        country_dist = {"Domestic": 0.75, "Russia": 0.10, "UK": 0.05, "Israel": 0.03, "Germany": 0.02, "Others": 0.05}
                    elif dest.name == "Jaipur":
                        country_dist = {"Domestic": 0.80, "France": 0.05, "USA": 0.05, "UK": 0.04, "Japan": 0.02, "Others": 0.04}
                        
                    t_type = primary_type
                    if random.random() > 0.8:
                        t_type = random.choice(tourist_types)
                        
                    arrival_rec = TouristArrival(
                        destination_id=dest.id,
                        year=year,
                        month=month,
                        arrivals_count=arrivals_count,
                        domestic_count=domestic,
                        international_count=international,
                        tourist_type=t_type,
                        age_group_distribution=json.dumps(age_dist),
                        country_distribution=json.dumps(country_dist)
                    )
                    arrivals_list.append(arrival_rec)
        db.add_all(arrivals_list)
        db.commit()

        print("Seeding yearly revenues (5 Years, 2021 to 2025)...")
        revenues_list = []
        for dest in destinations:
            if dest.name == "Goa":
                base_rev = 80.0
            elif dest.name == "Kerala":
                base_rev = 65.0
            elif dest.name == "Jaipur":
                base_rev = 70.0
            elif dest.name == "Rishikesh":
                base_rev = 25.0
            elif dest.name == "Ladakh":
                base_rev = 18.0
            elif dest.name == "Kashmir":
                base_rev = 40.0
            elif dest.name in ["Manali", "Shimla"]:
                base_rev = 30.0
            elif dest.name == "Udaipur":
                base_rev = 35.0
            else: # Andaman
                base_rev = 28.0
                
            for year in range(2021, 2026):
                year_multiplier = 0.65 if year == 2021 else (0.82 if year == 2022 else (1.0 if year == 2023 else (1.15 if year == 2024 else 1.30)))
                
                tot_rev = base_rev * year_multiplier
                hotel_rev = tot_rev * 0.40
                restaurant_rev = tot_rev * 0.20
                shopping_rev = tot_rev * 0.18
                activity_rev = tot_rev * 0.12
                tax_cont = tot_rev * 0.10
                
                rev_rec = Revenue(
                    destination_id=dest.id,
                    year=year,
                    hotel_revenue=round(hotel_rev, 2),
                    restaurant_revenue=round(restaurant_rev, 2),
                    shopping_revenue=round(shopping_rev, 2),
                    activity_revenue=round(activity_rev, 2),
                    tax_contribution=round(tax_cont, 2)
                )
                revenues_list.append(rev_rec)
        db.add_all(revenues_list)
        db.commit()

        print("Seeding reviews...")
        reviews_data = [
            {"user_id": 1, "type": "destination", "target_id": 1, "rating": 5, "comment": "Goa beaches are absolutely beautiful! Best visiting time is around December."},
            {"user_id": 1, "type": "destination", "target_id": 3, "rating": 4, "comment": "Forts in Jaipur are amazing. It does get very hot in summer, though!"},
            {"user_id": 1, "type": "hotel", "target_id": 1, "rating": 5, "comment": "Taj Exotica is a dream resort! Amazing services and beach access."},
            {"user_id": 1, "type": "hotel", "target_id": 2, "rating": 3, "comment": "Decent stay near Baga beach. Budget friendly but rooms were slightly small."}
        ]
        for rev in reviews_data:
            db.add(Review(**rev))
            
        print("Seeding budget templates...")
        budgets_data = [
            {"destination_name": "Goa", "tier": "Budget", "hotel_cost": 25, "food_cost": 15, "local_transport_cost": 10, "flights_cost": 0, "activities_cost": 10, "shopping_cost": 15, "misc_cost": 8},
            {"destination_name": "Goa", "tier": "Moderate", "hotel_cost": 75, "food_cost": 35, "local_transport_cost": 25, "flights_cost": 120, "activities_cost": 30, "shopping_cost": 40, "misc_cost": 15},
            {"destination_name": "Goa", "tier": "Luxury", "hotel_cost": 250, "food_cost": 80, "local_transport_cost": 60, "flights_cost": 300, "activities_cost": 90, "shopping_cost": 120, "misc_cost": 40},
            
            {"destination_name": "Kerala", "tier": "Budget", "hotel_cost": 20, "food_cost": 15, "local_transport_cost": 8, "flights_cost": 0, "activities_cost": 10, "shopping_cost": 15, "misc_cost": 5},
            {"destination_name": "Kerala", "tier": "Moderate", "hotel_cost": 65, "food_cost": 30, "local_transport_cost": 20, "flights_cost": 110, "activities_cost": 25, "shopping_cost": 35, "misc_cost": 12},
            {"destination_name": "Kerala", "tier": "Luxury", "hotel_cost": 200, "food_cost": 70, "local_transport_cost": 50, "flights_cost": 280, "activities_cost": 80, "shopping_cost": 100, "misc_cost": 30},

            {"destination_name": "Jaipur", "tier": "Budget", "hotel_cost": 20, "food_cost": 12, "local_transport_cost": 8, "flights_cost": 0, "activities_cost": 8, "shopping_cost": 20, "misc_cost": 6},
            {"destination_name": "Jaipur", "tier": "Moderate", "hotel_cost": 60, "food_cost": 30, "local_transport_cost": 20, "flights_cost": 100, "activities_cost": 25, "shopping_cost": 60, "misc_cost": 12},
            {"destination_name": "Jaipur", "tier": "Luxury", "hotel_cost": 280, "food_cost": 75, "local_transport_cost": 50, "flights_cost": 250, "activities_cost": 75, "shopping_cost": 180, "misc_cost": 35}
        ]
        for bg in budgets_data:
            db.add(Budget(**bg))
            
        db.commit()
        print("Database successfully seeded with comprehensive datasets.")
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
