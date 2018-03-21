
# map-viz
Protoype for HOTOSM Outreachy project

# development
* `npm install`
* `browserify js/app.js > dist/bundle.js`
* `python -m http.server`

# How does it work?
* By default, time period is set for current date and current time
* Map area in view is by default taken to be the bounding box for the query
* Choose the right map view by navigating the map
* Choose in the time period, both start and end period
* On hitting `Submit`, all data changes, within a given time period, over a specific geographic area is obtained from OSM using overpass query. This is then rendered on map.