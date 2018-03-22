## HOTOSM map-viz
Prototype for [HOTOSM Outreachy project](https://www.outreachy.org/2018-may-august/communities/humanitarian-openstreetmap-team/#create-a-reusable-map-visualization)

## Local development
* `npm install`
* `browserify js/app.js > dist/bundle.js`
* `python -m http.server`

## How does it work?
![working](https://user-images.githubusercontent.com/12103383/37751157-e53a5512-2db6-11e8-87f3-3531a1444fe7.gif)

* By default, time period is set for current date and current time
* Map area in view is by default taken to be the bounding box for the query
* Choose the right map view by navigating the map
* Choose in the time period, both start and end period
* On hitting `Submit`, all data changes, within a given time period, over a specific geographic area is obtained from OSM using [overpass](https://overpass-turbo.eu/) query. This is then rendered on map.

## Approach

Objective is to view the edits made in a particular geography after a mapping event, something like `Total number of buildings touched` or `Total kms of highways touched`.

This is basically questioning OpenStreetMap on `Hey, show me all the edits made in Bangalore today`. Now this question can be put to OpenStreetMap in several ways. 

1. Query OpenStreetMap directly from user interface using `Export` option
2. [OpenStreetMap API](https://wiki.openstreetmap.org/wiki/API)
3. Use a third party tool like [Overpass](overpass-turbo.eu)
4. Using [planet](https://planet.openstreetmap.org/)/[geofabrik](http://download.geofabrik.de/)/[metro extracts](https://mapzen.com/documentation/metro-extracts/) and then write a script to extract specifc data from downloaded extracts 

All the above options have their merits in different situations. In our case, API requests are the way forward to have the query integrated in a web app. So we've narrowed two options that satisfies our criteria.
`Option 2(OpenStreetMap API) and Option 3 (Overpass)`

OpenStreetMap API is an `editing API` that lets reading and adding contents to OpenStreetMap database. Overpass provides a read-only API, but provides more options to filter out data using [Overpss Query Language](https://wiki.openstreetmap.org/wiki/Overpass_API/Overpass_QL)

Overpass is great for:
- Querying features by OSM tags
- Looking for features that was edited within a time range.
- Find features added by a particular user or group of users.
- Let query run for bot rectangular boudning boxes and polygon boundaries

At present I don't see tags or user specific filtering options with OpenStreetMap API. Also polygon boundaries are not supported.

Polygon boundaries and tag specific filtering are key to HOTOSM visualisation. Based on these two factors, I decided tog o with Overpass API option.


 
