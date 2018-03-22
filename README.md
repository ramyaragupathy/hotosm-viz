## HOTOSM map-viz
Prototype for [HOTOSM Outreachy project](https://www.outreachy.org/2018-may-august/communities/humanitarian-openstreetmap-team/#create-a-reusable-map-visualization)

## Local development
* `npm install`
* `browserify js/app.js > dist/bundle.js`
* `python -m http.server`

## How does it work?
![working](https://user-images.githubusercontent.com/12103383/37751157-e53a5512-2db6-11e8-87f3-3531a1444fe7.gif)

![image](https://user-images.githubusercontent.com/12103383/37755592-1c4edaae-2dcc-11e8-9e17-77a40eec51c8.png) relations
![image](https://user-images.githubusercontent.com/12103383/37755607-3067b006-2dcc-11e8-8992-ae171be40b41.png) ways
![image](https://user-images.githubusercontent.com/12103383/37755628-4445a6b4-2dcc-11e8-8888-4622d9691c4f.png) nodes

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
Let's dig our question `Hey, show me all the edits made in Bangalore today` to understand which option is better.

This question has three parts to it:
1. `all the edits` - this is inclusive of all the feature types - buildings, highways. This part can be made very specific to say `all building edits` or `all highway edits`
2. `edits made in Bangalore` - question is specific to a place
3. `edits made today` - edits made from the start of the day to the current time. 

All the three factors - kind of features edited, geography and timeframe are variable. We've to choose an option that could fit in these three factors.

Option|Feature filtering|Geography filter|Time filter
------|-----------------|----------------|-----------
Query OpenStreetMap directly from user interface using `Export` option| :heavy_multiplication_x:|only rectangluar bounding box|:heavy_multiplication_x:
OpenStreetMap API|:heavy_multiplication_x:|only rectangluar bounding box|:heavy_multiplication_x:
Overpass (read only API)|:heavy_check_mark:|:heavy_check_mark: (rectangular + polygon)|:heavy_check_mark:
[planet](https://planet.openstreetmap.org/)/[geofabrik](http://download.geofabrik.de/)/[metro extracts](https://mapzen.com/documentation/metro-extracts/)|custom script|custom script|custom script

Obvious choice is Overpass API. In general Overpass is great for:

- Querying features by [OSM tags](https://wiki.openstreetmap.org/wiki/Tags)
- Looking for features that was edited within a time range
- Find features added by a particular user or group of users
- Querying rectangular bounding boxes and polygon boundaries

But before we go ahead, it's necessary to understand limitations to Overpass like:

- Complex queries fetching a large volume of data (>20MB) usually fails
- Queries that span a really large area of the map fails
- Queries that span a bigger timeframe also fails as it involves bulk data
- There's a cap on number of queries that could be sent to Overpass from a particular IP at a given time. If two people from the same Wi-fi network try to query Overpass, only one query is accepted, other automatically fails.

### Implementing Data Extaction

**Geography filter** - Start with a rectangular bounding box form map view, that is get the bounds of the map from the current map view on the right pane. Use this bounds to construct a rectangular bbox This should be extended to accomodate any polygon boundary

```javascript
  let bounds = map.getBounds()
  let north = bounds['_ne'].lat
  let east = bounds['_ne'].lng
  let south = bounds['_sw'].lat
  let west = bounds['_sw'].lng
  let bbox = south + ',' + west + ',' + north + ',' + east
  ```

**Time filter** - Provide two fields to gather start date and end date for the query. Default sets to today's timeframe.

![image](https://user-images.githubusercontent.com/12103383/37754543-ef84723a-2dc7-11e8-9642-306330ccbb52.png)

**Tag filter** - Yet to be implemented

On hitting `Fetch Data`, overpass query is constructed on the fly. Eg:

```https://www.overpass-api.de/api/interpreter?data=[out:xml][timeout:25];(node (changed:'2018-03-21T18:30:01.000Z','2018-03-22T06:25:14.000Z') (12.227550060708552,76.3482848025194,14.011214271757382,78.9857151974922));(way (changed:'2018-03-21T18:30:01.000Z','2018-03-22T06:25:14.000Z')(12.227550060708552,76.3482848025194,14.011214271757382,78.9857151974922));(rel (changed:'2018-03-21T18:30:01.000Z','2018-03-22T06:25:14.000Z') (12.227550060708552,76.3482848025194,14.011214271757382,78.9857151974922));out body;>;out body qt;```

This is sent to the overpass API and the result is obtained in `xml` format. Other options include `json` and `csv` format. Whatever be the format, response data has to be processed further to get `geojson` data. From `xml` format, data is converted to `geojson` using `[osmtogeojson](https://github.com/tyrasd/osmtogeojson)` module.

### Visualising data

Processed data is separated into three layers(node, way, relation) for map viz using [mapbox-gl js](https://www.mapbox.com/mapbox-gl-js/api/) and the count for each geometry is shown in the side bar. 

![image](https://user-images.githubusercontent.com/12103383/37755301-f3dd49e4-2dca-11e8-8b52-c05e4c2ebfc6.png)

![image](https://user-images.githubusercontent.com/12103383/37755592-1c4edaae-2dcc-11e8-9e17-77a40eec51c8.png) relations
![image](https://user-images.githubusercontent.com/12103383/37755607-3067b006-2dcc-11e8-8992-ae171be40b41.png) ways
![image](https://user-images.githubusercontent.com/12103383/37755628-4445a6b4-2dcc-11e8-8888-4622d9691c4f.png) nodes

This layering will change when tag filering comes into play.

**View by geometry/feature** - Each geometry type has a checkbox next to it. Based on what is checked, layers should display/disappear on the map



 
