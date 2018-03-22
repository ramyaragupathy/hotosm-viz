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

### Data Extraction 

This is like questioning OpenStreetMap on `Hey, show me all the edits made in Bangalore today`. This question can be put to OpenStreetMap in several ways. 

1. Query OpenStreetMap directly from user interface using `Export` option
2. [OpenStreetMap API](https://wiki.openstreetmap.org/wiki/API)
3. Use a third party tool like [Overpass](overpass-turbo.eu)
4. Using [planet](https://planet.openstreetmap.org/)/[geofabrik](http://download.geofabrik.de/)/[metro extracts](https://mapzen.com/documentation/metro-extracts/) and then write a script to extract specifc data from downloaded extracts 

All the above options have their merits in different situations. 
Let's dig our question ``Hey, show me all the edits made in Bangalore today` to understand which option is better.

This question has three parts to it:
1. `all the edits` - this is inclusive of all the feature types - buildings, highways. This part can be made very specific to say `all building edits` or `all highway edits`
2. `edits made in Bangalore` - question is specific to a place
3. `edits made today` - edits made from the start of the day to the current time. 

All the three factors - kind of features edited, geography and timeframe are variable. We've to choose an option that could fit in these three factors.

Option|Feature filtering|Geography filter|Time filter
------|-----------------|----------------|-----------
Query OpenStreetMap directly from user interface using `Export` option| :heavy_multiplication_x:|only rectangluar bounding box|:heavy_multiplication_x:
OpenStreetMap API|:heavy_multiplication_x:|only rectangluar bounding box|:heavy_multiplication_x:
Overpass (read only API)|:heavy_check_mark:|:heavy_check_mark:|:heavy_check_mark:
[planet](https://planet.openstreetmap.org/)/[geofabrik](http://download.geofabrik.de/)/[metro extracts](https://mapzen.com/documentation/metro-extracts/)|custom script|custom script|custom script


Overpass is great for:
- Querying features by [OSM tags](https://wiki.openstreetmap.org/wiki/Tags)
- Looking for features that was edited within a time range
- Find features added by a particular user or group of users
- Querying rectangular bounding boxes and polygon boundaries

### Implementing Data Extaction



 
