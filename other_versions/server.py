"""Server for movie ratings app."""

from flask import (Flask, render_template, request, flash, session, jsonify,
                   redirect, url_for)
from model import connect_to_db, db
import crud, re
from jinja2 import StrictUndefined
import requests

app = Flask(__name__)
app.secret_key = "dev"
app.jinja_env.undefined = StrictUndefined

parks_info = []
@app.route('/')
def homepage():
    #radius = session.get("radius", False)
    radius = session.get("radius", False)
    curr_coords = session.get("curr_coords", False)
    if curr_coords != False:
        curr_lat = curr_coords.get("lat", False)
        curr_lng = curr_coords.get("lng", False)
    
    if radius != False and curr_lat != False and curr_lng != False:
        parkings = crud.get_parking_by_location(curr_lat, curr_lng, radius)
    else:
        parkings = []   
    
    parks_info = []
    for parking in parkings:
        park_address_url = f'https://maps.googleapis.com/maps/api/geocode/json?latlng={parking.latitude},{parking.longitude}&key=AIzaSyD6dcW5pE-CSD_XbsVRPhdEfFHSOanDzYU'
        address_result = requests.get(park_address_url).json()
        address = address_result["results"][0]["formatted_address"]
        # print('*************', address)
        park_info = {"lat": parking.latitude, "lng": parking.longitude, "street_address": address.split(',')[0]}
        parks_info.append(park_info)
    print("***************inside redirected homepage before render_template", session.get("curr_coords", None))
    return render_template('homepage.html', coords={"data": parks_info, "curr_coords": session.get("curr_coords", None)})

# Replace this with routes and view functions!

# @app.route('/api/meters')
# def get_meters():
#     lat = curr_coords["lat"]
#     lng = curr_coords["lng"]
#     parkings = crud.get_parking_by_location(lat, lng, radius)

#     return jsonify({"data": parkings})

@app.route('/track_curr_location', methods=["POST"])
def track_curr_address():
    curr_lat = request.json.get("lat")
    curr_lng = request.json.get("lng")
    curr_coords = {"lat": curr_lat, "lng": curr_lng}
    session["curr_coords"] = curr_coords
    session["radius"] = 0.1
    # session.modified = True
    print('*********inside track_curr_location flask route******', session.get("curr_coords", None))
    return redirect("/")




@app.route('/address', methods=['POST'])
def get_curr_address():
    radius = request.form.get('radius')
    curr_street = request.form.get('street')
    curr_city = request.form.get('city')
    city = curr_city.replace(' ', '+')
    address = curr_street.replace(' ', '+')

    curr_address_url = f'https://maps.googleapis.com/maps/api/geocode/json?address={address},+{city},+CA&key=AIzaSyD6dcW5pE-CSD_XbsVRPhdEfFHSOanDzYU'
    
    response = requests.get(curr_address_url).json()
    
    curr_location = response["results"][0]["geometry"]["location"]
    curr_lat = curr_location["lat"]
    curr_lng = curr_location["lng"]
    curr_coords = {"lat": curr_lat, "lng": curr_lng}
    session["curr_coords"] = curr_coords
    session["radius"] = radius
    # session.modified = True
    return redirect("/")



@app.route('/movies')
def all_movies():
    """get all movies"""
    movies = crud.get_movies()
    return render_template('all_movies.html', movies=movies)

@app.route('/movies/<movie_id>')
def movie_detail(movie_id):

    return render_template('movie_details.html', movie=crud.get_movie_by_id(movie_id))


@app.route('/users')
def all_users():
    """get all users"""
    users = crud.get_users()
    return render_template('all_users.html', users=users)

@app.route('/users', methods=['POST'])
def creat_user():
    """ create new user """

    email_input = request.form.get('email')
    
    if crud.get_user_by_email(email_input) is None:
        password_input = request.form.get('password')
        new_user = crud.create_user(email_input, password_input)
        db.session.add(new_user)
        db.session.commit()
        flash('User created successfully')
    else:
        flash('User already exists. Try again')

    return redirect('/')

@app.route('/login', methods=["GET"])
def show_login():
    if request.args.get('login') == 'login':
        return render_template("login.html")     
    elif  request.args.get('signup') == 'signup':
        return render_template("signup.html")
        

    


@app.route('/login', methods=['POST'])
def login():
    """user log in"""

    login_email = request.form.get('email')
    login_password = request.form.get('password')
    match_user = crud.get_user_by_email(login_email)

    if match_user and match_user.password == login_password:
        user_id = match_user.user_id
        session['user_id'] = user_id
        flash(f'login success as {login_email}!')
    else:
        flash('email or password does not match, try again or create an account')
    
    return render_template('rate_a_movie.html', movies = crud.get_movies())
    # return render_template('homepage.html', user_id=user_id)
    

@app.route('/rate-movie', methods=['POST'])
def rate_movie():
    """ get movie name and score"""
    movie_title = request.form.get("movie")
    score = request.form.get("score")
    movie = crud.get_movie_by_title(movie_title)
    user = crud.get_user_by_id(session['user_id'])

    new_rating = crud.create_rating(movie, user, score)
    db.session.add(new_rating)
    db.session.commit()
    flash('rating successfully added')
    return render_template('rate_a_movie.html', movies = crud.get_movies())


@app.route('/users/<user_id>')
def user_detail(user_id):

    return render_template('user_details.html', user=crud.get_user_by_id(user_id))

if __name__ == "__main__":
    # DebugToolbarExtension(app)
    connect_to_db(app)
    app.run(host="0.0.0.0", debug=True, port=5002)
