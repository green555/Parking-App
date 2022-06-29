"""Server for movie ratings app."""

import os, re
from flask import (Flask, render_template, request, flash, session, jsonify,
                   redirect, url_for)
from model import connect_to_db, db
import crud
from jinja2 import StrictUndefined
import requests
from passlib.hash import argon2

app = Flask(__name__)
app.secret_key = "dev"
app.jinja_env.undefined = StrictUndefined

API_KEY = os.environ['API_KEY']

@app.route('/')
def homepage():
    session.clear()
    return render_template('homepage.html')


@app.route('/get-nearby-meters', methods=['POST'])
def get_nearby_meters():
    
    if request.json.get("street"):
        curr_street = request.json.get("street")
        curr_city = request.json.get("city")
        curr_radius = request.json.get("radius")
        curr_list = request.json.get('i')
        city = curr_city.replace(' ', '+')
        address = curr_street.replace(' ', '+')

        curr_address_url = f'https://maps.googleapis.com/maps/api/geocode/json?address={address},+{city},+CA&key={API_KEY}'

        print("**********", API_KEY)
        print("--------curr_address_url", curr_address_url)        
        response = requests.get(curr_address_url).json()
        
        
        curr_location = response["results"][0]["geometry"]["location"]
        curr_lat = curr_location["lat"]
        curr_lng = curr_location["lng"]
    else:
        curr_lat = request.json.get("lat")
        curr_lng = request.json.get("lng")
        curr_radius = 0.3

    curr_coords = {"lat": curr_lat, "lng": curr_lng}
    parkings = crud.get_parking_by_location(curr_lat, curr_lng, curr_radius)
    
    # parkings.sort(key= ((Parking.latitude - curr_lat) ** 2 + (Parking.longitude - curr_lng) ** 2) )

    parks_info = []
         
    for parking in parkings:
        # print("--------", parking.ratings)
        park_address_url = f'https://maps.googleapis.com/maps/api/geocode/json?latlng={parking.latitude},{parking.longitude}&key={API_KEY}'
        address_result = requests.get(park_address_url).json()

        print("**********", API_KEY)
        print("--------", address_result)
        print("###########", parking.latitude, parking.longitude)
        address = address_result["results"][0]["formatted_address"]
        comments = []
        total_score = 0
        num_of_score = 0
        for entry in parking.ratings:
            comments.append(entry.comment)
            if entry.score:
                total_score += entry.score
                num_of_score += 1

        if num_of_score > 0:
            rate = total_score / num_of_score
        else:
            rate = None
        # print('*************', address)
        park_info = {"lat": parking.latitude, "lng": parking.longitude, 
                    "street_address": address.split(',')[0], 
                    "id": parking.parking_id, 
                    "comment": comments, 
                    "rate": rate,
                    "veh_type": parking.veh_type,
                    "price": parking.price,
                    "capacity": parking.capacity }
        parks_info.append(park_info)
    result_dict = {"data": parks_info, "curr_coords": curr_coords }
    return jsonify(result_dict)




@app.route('/users')
def all_users():
    """get all users"""
    users = crud.get_users()
    return render_template('all_users.html', users=users)


@app.route('/create-new-user', methods=['POST'])
def creat_user():
    """ create new user """

    email_input = request.json.get('email')
    
    if crud.get_user_by_email(email_input) is None:
        password_input = request.json.get('password')
        hashed_password = argon2.hash(password_input)
        new_user = crud.create_user(email_input, hashed_password)
        db.session.add(new_user)
        db.session.commit()
        session['email'] = email_input
        return jsonify({"data": True})
    else:
        return jsonify({"data": False})   

# passwd = raw_input("Enter a password: ")

# hashed = argon2.hash(passwd)

# del passwd

# while True:
#     attempt = raw_input("Verify your password: ")
#     if argon2.verify(attempt, hashed):
#         print("Correct!")
#         break
#     else:
#         print("Incorrect!")   


@app.route('/get-login-info', methods=['POST'])
def login():
    """user log in"""

    login_email = request.json.get('email')
    login_password = request.json.get('password')
    match_user = crud.get_user_by_email(login_email)

    if match_user and argon2.verify(login_password, match_user.password):
    # if match_user and match_user.password == login_password:
        user_id = match_user.user_id
        email = match_user.email
        session['user_id'] = user_id
        session['email'] = email
        return jsonify({"data": True})
    else:
        return jsonify({"data": False})
    # return render_template('homepage.html', user_id=user_id)
    


@app.route('/create-new-comment', methods=['POST'])
def comment_meter():
    """ get movie name and score"""
    comment_list = []
    meterID = request.json.get("meterID")
    score = request.json.get("score")
    # print('score is-------------', score)
    if score == '':
        score = None
    comment = request.json.get("comment")    
    user = crud.get_user_by_id(session['user_id'])
    parking = crud.get_parking_by_id(meterID)
    new_rating = crud.create_rating(parking, user, comment, score)
    db.session.add(new_rating)
    db.session.commit()
    comments = crud.get_ratings_by_meter_id(meterID)
    for comment in comments:
        comment_list.append(comment.comment)
    
    total_score = 0
    num_of_score = 0
    for entry in parking.ratings:
        if entry.score:
            total_score += entry.score
            num_of_score += 1

    if num_of_score > 0:
        rate = round(total_score / num_of_score, 2)
    else:
        rate = None
    # print('****************', comment_list)
    
    return jsonify({"meterID": meterID, "comment_list": comment_list, "rate": rate})


@app.route('/get-meter-details/<meterID>')
def get_meter_details(meterID):

    parking = crud.get_parking_by_id(meterID)
    # print('--------------', parking)

    park_address_url = f'https://maps.googleapis.com/maps/api/geocode/json?latlng={parking.latitude},{parking.longitude}&key={API_KEY}'
    address_result = requests.get(park_address_url).json()
    address = address_result["results"][0]["formatted_address"]
    comments = []
    total_score = 0
    num_of_score = 0
    for entry in parking.ratings:
        comments.append(entry.comment)
        if entry.score:
            total_score += entry.score
            num_of_score += 1

    if num_of_score > 0:
        rate = round(total_score / num_of_score, 2)
    else:
        rate = None
    # print('*************', address)
    park_info = {"lat": parking.latitude, "lng": parking.longitude, 
                "street_address": address.split(',')[0], 
                "id": parking.parking_id, 
                "comment": comments, 
                "rate": rate,
                "capacity": parking.capacity,
                "veh_type": parking.veh_type }

    return jsonify(park_info)



@app.route('/create-web-comment', methods=['POST'])
def comment_web():
    """ write comment and user name in db and show on web"""
   
    web_comment = request.json.get("web_comment")
    # print('############', web_comment)
    user_email = session.get('email', None)
    new_web_comment = crud.create_web_comment(web_comment, user_email)
    db.session.add(new_web_comment)
    db.session.commit()
    new_comment = {
                    "comment_id": new_web_comment.comment_id,
                    "user_email": new_web_comment.user_email,
                    "comment": new_web_comment.comment
                  }
                            
   
    
    return jsonify({"new_web_comment": new_comment})



@app.route('/get-recent-web-comments')
def recent_web_comments():

    recent_web_comments = crud.get_recent_web_comments()
    web_comment_list = []

    for entry in recent_web_comments:
        curr_web_comment = { "comment_id": entry.comment_id, "user_email": entry.user_email, "comment": entry.comment }
        web_comment_list.append(curr_web_comment)

    # print('**************get the most recent web comments!', recent_web_comments)
    return jsonify({"recent_web_comments": web_comment_list})
    
    
@app.route('/clear-session')
def clear_session():
    session.clear()
    return ('', 204)

    

# @app.route('/users/<user_id>')
# def user_detail(user_id):

#     return render_template('user_details.html', user=crud.get_user_by_id(user_id))

if __name__ == "__main__":
    # DebugToolbarExtension(app)
    connect_to_db(app)
    app.run(host="0.0.0.0", debug=True, port=5002)
