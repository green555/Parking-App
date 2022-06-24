"""Models for movie ratings app."""

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


# Replace this with your code!


def connect_to_db(flask_app, db_uri="postgresql:///parkings", echo=True):
    flask_app.config["SQLALCHEMY_DATABASE_URI"] = db_uri
    flask_app.config["SQLALCHEMY_ECHO"] = echo
    flask_app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db.app = flask_app
    db.init_app(flask_app)

    print("Connected to the db!")

class User(db.Model):
    """A user."""

    __tablename__ = "users"

    user_id = db.Column(db.Integer,
                        autoincrement=True,
                        primary_key=True)
    email = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(20), nullable=False)

    # ratings = a list of Rating objects
    
    def __repr__(self):
        return f'<User user_id={self.user_id} email={self.email} password={self.password}>'

class Parking(db.Model):
    """A user."""

    __tablename__ = "parkings"

    parking_id = db.Column(db.Integer,
                        autoincrement=True,
                        primary_key=True)
    
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    on_street = db.Column(db.Boolean, nullable=True)
    metered = db.Column(db.Boolean, nullable=True)
    street_name = db.Column(db.String, nullable=True)
    max_time = db.Column(db.Integer, nullable=True)
    no_of_spots = db.Column(db.Integer, nullable=True)
    is_available = db.Column(db.Boolean, nullable=True)
    veh_type = db.Column(db.String, nullable=True)
    zipcode = db.Column(db.Integer, nullable=True)

    
    # example: datetime(2022, 12, 22, 0, 0)
    # ratings = a list of Rating objects
    
    def __repr__(self):
        return f"""
        <Parking:\tparking_id={self.parking_id}\tmetered={self.metered}\tlatitude={self.latitude}\tlogitude={self.longitude}>
        """


class Rating(db.Model):
    """A user."""

    __tablename__ = "ratings"

    rating_id = db.Column(db.Integer,
                        autoincrement=True,
                        primary_key=True)
    parking_id = db.Column(db.Integer, db.ForeignKey('parkings.parking_id'))
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'))
    score = db.Column(db.Integer, nullable=True)
    comment = db.Column(db.Text)

    parking = db.relationship('Parking', backref='ratings')
    user = db.relationship("User", backref="ratings")
    
    def __repr__(self):
        return f'<Rating: rating_id={self.rating_id} score={self.score} parking_id={self.parking_id} user_id={self.user_id}>'


class Comment(db.Model):
    """Comments of the APP overall."""

    __tablename__ = "comments"

    comment_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    comment = db.Column(db.Text)
    user_email = db.Column(db.Text, default='anonymous')

    # user = db.relationship("User", backref="comments")

    def __repr__(self):
        return f'<Comment: comment={self.comment}, user_email={self.user_email}>'
        

        
if __name__ == "__main__":
    from server import app

    # Call connect_to_db(app, echo=False) if your program output gets
    # too annoying; this will tell SQLAlchemy not to print out every
    # query it executes.

    connect_to_db(app)
