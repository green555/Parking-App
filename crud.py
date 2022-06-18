from model import db, User, Parking, Rating, Comment, connect_to_db


def create_user(email, password):
    """Create and return a new user."""

    user = User(email=email, password=password)

    return user

def get_users():
    return User.query.all()

def get_user_by_id(user_id):
    return User.query.get(user_id)

def get_ave_ratings_by_meter_id(meter_id):
    all = Rating.query.filter(Rating.parking_id == meter_id).all()
    total = 0
    for rate in all:
        total += rate.score
    return total / len(all)
    
def get_user_by_email(email):
    return User.query.filter(User.email == email).first()

def create_web_comment(comment, user_email="anonymouse"):
    web_comment = Comment(comment = comment, user_email = user_email)
    return web_comment

def create_parking(latitude, longitude, metered, street_name, no_of_spots, max_time=None, is_available=None, zipcode=None):
    """Create and return a new parking."""

    parking = Parking(
            latitude=latitude, 
            longitude=longitude, 
            metered=metered, 
            street_name=street_name,
            max_time=max_time,
            no_of_spots=no_of_spots,
            is_available=is_available,
            zipcode=zipcode            
            )

    return parking

def get_parkings():
    return Parking.query.all()

def get_parking_by_id(id):
    return Parking.query.get(id)

def get_parking_by_metered(metered):
    return Parking.query.filter(Parking.metered == metered).all()

def get_recent_web_comments():
    return db.session.query(Comment).order_by(Comment.comment_id.desc()).limit(20).all()

def get_parking_by_location(curr_lat, curr_lng, radius):

    print("*****", radius)
    dis_lat = float(radius) / 69
    dis_lng = float(radius) / 53
    min_lat = curr_lat - dis_lat
    max_lat = curr_lat + dis_lat
    min_lng = curr_lng - dis_lng
    max_lng = curr_lng + dis_lng

    
    return Parking.query.options(db.joinedload("ratings"))\
            .filter(((Parking.latitude > min_lat)&(Parking.latitude < max_lat)) & ((Parking.longitude > min_lng)&(Parking.longitude < max_lng)))\
            .order_by((Parking.latitude - curr_lat)*(Parking.latitude - curr_lat) + (Parking.longitude - curr_lng)*(Parking.longitude - curr_lng))\
            .limit(20).all()

   
    # Human.query.options(db.joinedload("animals")).get(5).animals

def create_rating(parking, user, comment, score=None):
    """ create rating instance and return a new rating"""
    # rate = Rating(movie_id = movie.movie_id, user_id = user.user_id, score=score)
    rate = Rating(parking = parking, user = user, comment = comment, score=score)
    #movie on the left of = is the attribute name, movie on the right of= is movie instance
    return rate



if __name__ == '__main__':
    from server import app
    connect_to_db(app)