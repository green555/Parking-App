"""Script to seed database."""

import os
import json
from random import choice, randint
import crud
from model import db, User, Parking, Rating, Comment, connect_to_db
import server

os.system("dropdb parkings")
os.system('createdb parkings')

connect_to_db(server.app)
db.create_all()

with open('data/ParkingMeters.geojson') as f:
    parking_data = json.loads(f.read())


# Create movies, store them in list so we can use them
# to create fake ratings later

parking_in_db = []
for parking in parking_data['features'][1:1000]:
    # TODO: get the title, overview, and poster_path from the movie
    # dictionary. Then, get the release_date and convert it to a
    # datetime object with datetime.strptime
    prop = parking['properties']
    latitude = prop['latitude']
    longitude = prop['longitude']
    street_name = prop['street_name']
    
    cap_color_dict = {
                        "Grey": "General parking", 
                        "Brown": "Tour bus parking", 
                        "Black": "Motorcycle parking", 
                        "Purple": "Boat trailer parking", 
                        "Green": "Short-term parking", 
                        "Red": "Six-wheeled commercial vehicle",
                        "Yellow": "Commercial vehicle",
                        "Blue": "Accessible parking",
                        "-": "unknown"
                    }
    
    cap_color = prop['cap_color']
    veh_type = cap_color_dict[cap_color] 

    new_parking = crud.create_parking(latitude=latitude, longitude=longitude, street_name=street_name, veh_type=veh_type, metered=True, no_of_spots=1)
    parking_in_db.append(new_parking)

    # TODO: create a movie here and append it to movies_in_db

db.session.add_all(parking_in_db)
db.session.commit()

users_in_db = []
for n in range(10):
    email = f'user{n}@test.com'  # Voila! A unique email!
    password = 'test'
    new_user = crud.create_user(email=email, password=password)
    users_in_db.append(new_user)
    
    user_ratings = []
    for i in range(10):
        
        new_rating = crud.create_rating(user = new_user, parking = choice(parking_in_db), score=randint(1, 5), comment='')
        user_ratings.append(new_rating)
    
    db.session.add_all(user_ratings)
    # model.db.session.commit()
        
db.session.add_all(users_in_db)
db.session.commit()   


