from flask import Flask
from flask import render_template
from pymongo import MongoClient
import json

app = Flask(__name__)

MONGODB_HOST = 'localhost'
MONGODB_PORT = 27017
DBS_NAME = 'earthquakes'
COLLECTION_NAME = 'project2'


@app.route("/")
def index():
    """
    A Flask view to serve the main dashboard page.
    """
    return render_template("index.html")


@app.route("/earthquakes/project2")
def quake_projects():
    """
    A Flask view to serve the project data from
    MongoDB in JSON format.
    """

    # A constant that defines the record fields that we wish to retrieve.
    FIELDS = {
        '_id': False, 'YEAR': True, 'FOCAL_DEPTH': True,
        'EQ_PRIMARY': True, 'EQ_MAG_MW': True,
        'EQ_MAG_MS': True, 'EQ_MAG_MB': True, 'COUNTRY': True, 'LOCATION_NAME': True,
        'LATITUDE': True, 'LONGITUDE': True,
        'TOTAL_DEATHS': True, 'TOTAL_INJURIES': True, 'TOTAL_HOUSES_DESTROYED': True,
        'TOTAL_HOUSES_DAMAGED': True
    }

    # Open a connection to MongoDB using a with statement such that the
    # connection will be closed as soon as we exit the with statement
    with MongoClient(MONGODB_HOST, MONGODB_PORT) as conn:
        # Define which collection we wish to access
        collection = conn[DBS_NAME][COLLECTION_NAME]
        # Retrieve a result set only with the fields defined in FIELDS
        # and limit the the results to 55000
        projects = collection.find({'TOTAL_DEATHS' : {'$gt':10, '$lt':10000}}, projection=FIELDS, limit=55000)
        # Convert projects to a list in a JSON object and return the JSON data
        return json.dumps(list(projects))



if __name__ == "__main__":
    app.run(debug=True)
