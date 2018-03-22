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

Objective is to view the number of edits made in a particular geography after a mapping event, something like `Total number of buildings touched` or `Total length of highways touched`.

 
