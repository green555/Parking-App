"""Server for movie ratings app."""

import os, re
from flask import (Flask, render_template, request, flash, session, jsonify,
                   redirect, url_for)
from model import connect_to_db, db
import crud
from jinja2 import StrictUndefined
import requests

app = Flask(__name__)
app.secret_key = "dev"
app.jinja_env.undefined = StrictUndefined

API_KEY = os.environ['API_KEY']

@app.route('/')
def homepage():
    
    return render_template('homepage_2.html')

# Replace this with routes and view functions!

# @app.route('/api/meters')
# def get_meters():
#     lat = curr_coords["lat"]
#     lng = curr_coords["lng"]
#     parkings = crud.get_parking_by_location(lat, lng, radius)

#     return jsonify({"data": parkings})

# @app.route('/track_curr_location', methods=["POST"])
# def track_curr_address():
#     curr_lat = request.json.get("lat")
#     curr_lng = request.json.get("lng")
#     curr_coords = {"lat": curr_lat, "lng": curr_lng}
#     session["curr_coords"] = curr_coords
#     session["radius"] = 0.1
#     # session.modified = True
#     print('*********inside track_curr_location flask route******', session.get("curr_coords", None))
#     return redirect("/")

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
    # begin = i * 20
    # end = (i+1) * 20
    # total = len(sorted_parkings)
    
    # if end <= total:
    #     begin = begin
    #     end = end
    #     list_end = False

    # elif begin <= total:
    #     begin = begin
    #     end = total
    #     list_end = True    

         
    for parking in parkings:
        # print("--------", parking.ratings)
        park_address_url = f'https://maps.googleapis.com/maps/api/geocode/json?latlng={parking.latitude},{parking.longitude}&key={API_KEY}'
        address_result = requests.get(park_address_url).json()
        address = address_result["results"][0]["formatted_address"]
        comments = []
        for entry in parking.ratings:
            comments.append(entry.comment)

        # print('*************', address)
        park_info = {"lat": parking.latitude, "lng": parking.longitude, "street_address": address.split(',')[0], "id": parking.parking_id, "comment": comments}
        parks_info.append(park_info)
    result_dict = {"data": parks_info, "curr_coords": curr_coords }
    return jsonify(result_dict)

    



# @app.route('/movies')
# def all_movies():
#     """get all movies"""
#     movies = crud.get_movies()
#     return render_template('all_movies.html', movies=movies)

# @app.route('/movies/<movie_id>')
# def movie_detail(movie_id):

#     return render_template('movie_details.html', movie=crud.get_movie_by_id(movie_id))


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
        new_user = crud.create_user(email_input, password_input)
        db.session.add(new_user)
        db.session.commit()
        session['email'] = email_input
        return jsonify({"data": True})
    else:
        return jsonify({"data": False})

# @app.route('/login', methods=["GET"])
# def show_login():
#     if request.args.get('login') == 'login':
#         return render_template("login.html")     
#     elif  request.args.get('signup') == 'signup':
#         return render_template("signup.html")
#     elif request.args.get('logoff') == 'logoff':
#         session.clear()
#         return redirect('/')
        

    


@app.route('/get-login-info', methods=['POST'])
def login():
    """user log in"""

    login_email = request.json.get('email')
    login_password = request.json.get('password')
    match_user = crud.get_user_by_email(login_email)

    if match_user and match_user.password == login_password:
        user_id = match_user.user_id
        email = match_user.email
        session['user_id'] = user_id
        session['email'] = email
        return jsonify({"data": True})
    else:
        return jsonify({"data": False})
    # return render_template('homepage.html', user_id=user_id)
    
# @app.route('/signup', methods=['POST'])
# def signup():
#     """user signup"""

#     login_email = request.form.get('email')
#     login_password = request.form.get('password')
#     confirm_password = request.form.get('confirm-password')
#     print(login_email)
#     print(login_password)
#     print(confirm_password)
#     if crud.get_user_by_email(login_email):
#         flash('User exits, Please sign in instead!')
#         session.clear()
#         return redirect('/')
#     elif login_password == confirm_password:
#         crud.create_user(login_email, confirm_password)
#         session['email'] = login_email
#         flash('User created and you are currently login')
#         return redirect('/')
#     else:
#         alert('password does not match, try again')

@app.route('/create-new-comment', methods=['POST'])
def comment_meter():
    """ get movie name and score"""
    meterID = request.json.get("meterID")
    # score = request.json.get("score")
    comment = request.json.get("comment")    
    user = crud.get_user_by_id(session['user_id'])
    parking = crud.get_parking_by_id(meterID)
    new_rating = crud.create_rating(parking, user, comment)
    db.session.add(new_rating)
    db.session.commit()
    
    return ('', 204)


@app.route('/users/<user_id>')
def user_detail(user_id):

    return render_template('user_details.html', user=crud.get_user_by_id(user_id))

if __name__ == "__main__":
    # DebugToolbarExtension(app)
    connect_to_db(app)
    app.run(host="0.0.0.0", debug=True, port=5002)
