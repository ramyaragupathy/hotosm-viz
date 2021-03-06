const osmtogeojson = require('osmtogeojson')
const util = require('util')
const moment = require('moment')
const geojsonMerge = require('@mapbox/geojson-merge')
const terraformer = require('terraformer')

// Initialising map

mapboxgl.accessToken = 'pk.eyJ1IjoicnVtYyIsImEiOiJjamJhdHJzODUxMGUyMnFub2l3cTlmMTJnIn0.hTkMVvU1xz2StHhaEYuMIA'
let map = new mapboxgl.Map({
  container: 'map', // container id
  style: 'mapbox://styles/mapbox/light-v9',
  center: [-122.2014, 37.7758],
  zoom: 9,
  hash: true,
  attributionControl: false
})

// Adding navigation controls

// geocoder
let geocoder = new MapboxGeocoder({
  accessToken: mapboxgl.accessToken
})
map.addControl(geocoder)

// zoom
let nav = new mapboxgl.NavigationControl()
map.addControl(nav, 'top-left')

// position attribution to bottom-left
map.addControl(new mapboxgl.AttributionControl(), 'bottom-left')

$('#fromdate').val(moment().format('YYYY-MM-DD[T]00:00:01'))
$('#todate').val(moment().format('YYYY-MM-DD[T]HH:mm:ss'))

// Set initial values

let prevGeojson = ''
let formData = {}
let overpassDataSource = {
  'type': 'FeatureCollection',
  'features': []
}

let head = '[out:xml][timeout:25];'
let q = head + '(node %s (%s));(way %s(%s));(rel %s (%s));out body;>;out body qt;'
map.on('load', function () {
  map.addSource('overpassDataSource', {type: 'geojson', data: overpassDataSource})
})

// Functions

/**
 * This function frames the overpass query based on the map view and timeframe
 * @param {string} bbox - space separated polygon coordinates (lat1 lng1 lat2 lng2 ... latn lngn)
 *
 * @returns {string} url - overpass query for fetching data
 **/

function getQuery (bbox) {
  if (bbox) {
    //bbox = 'poly:"' + bbox + '"'
    bbox = bbox[1] + ',' + bbox[0] + ',' + bbox[3] + ',' + bbox[2]
  } else {
    let bounds = map.getBounds()
    let north = bounds['_ne'].lat
    let east = bounds['_ne'].lng
    let south = bounds['_sw'].lat
    let west = bounds['_sw'].lng
    bbox = south + ',' + west + ',' + north + ',' + east
  }

  let overpassDate

  if (formData.fromDate != '' && formData.toDate != '') {
    overpassDate = "(changed:'" + formData.fromDate + "','" + formData.toDate + "')"
  } else if (formData.fromDate != '' && formData.toDate === '') {
    overpassDate = "(changed:'" + formData.fromDate + "')"
  }

  // for osm 'https://api.openstreetmap.org/api/0.6/map?bbox='+bbox;

  let query = util.format(q, overpassDate, bbox, overpassDate, bbox, overpassDate, bbox)
  let url = 'https://www.overpass-api.de/api/interpreter?data=' + query

  return url
}

/**
 * Invokes getQuery() function to frame the overpass query
 * Fetches data using the overpass query
 * Converts XML data to geojson
 * Adds three layers using geojson data
 * Adds a legend & geometry count to the page
 *
 **/

function getData (url) {
  if (!url) { url = getQuery() }
  $('.loading').css('display', 'inline-block')
  $.ajax(url)
    .done(function (data) {
      let geojson = osmtogeojson(data)
      let ways = geojson.features.filter(function (item) {
        if (item.id.startsWith('way')) {
          return item
        }
      })
      let rels = geojson.features.filter(function (item) {
        if (item.id.startsWith('relation')) {
          return item
        }
      })
      let nodes = geojson.features.filter(function (item) {
        if (item.id.startsWith('node')) {
          return item
        }
      })
      map.getSource('overpassDataSource').setData(geojson)
      map.addLayer({
        'id': 'node',
        'type': 'circle',
        'source': 'overpassDataSource',
        'paint': {
          'circle-radius': 4,
          'circle-color': '#8C5E58',
          'circle-opacity': 0.4
        },
        'filter': ['==', '$type', 'Point']
      })
      map.addLayer({
        'id': 'way',
        'type': 'line',
        'source': 'overpassDataSource',
        'paint': {
          'line-color': '#FF7E6B',
          'line-opacity': 0.4
        },
        'filter': ['==', '$type', 'LineString']
      })
      map.addLayer({
        'id': 'area',
        'type': 'fill',
        'source': 'overpassDataSource',
        'paint': {
          'fill-color': '#F6E27F',
          'fill-opacity': 0.4
        },
        'filter': ['==', '$type', 'Polygon']
      })

      let countStr = `<p><h3>Feature breakdown:</h3>
      <input type="checkbox"  name="node" id="node" checked="true">
      <label for="node"> Nodes: ${nodes.length} </label><br>
      <input type="checkbox" name="way" id="way" checked="true">
      <label for="way"> Ways: ${ways.length} </label><br>
      <input type="checkbox" name="rel" id="rel" checked="true">
      <label for="rel"> Relations: ${rels.length} </label>
      </p>`
      document.getElementById('count').classList.add('fill-gray')
      document.getElementById('count').innerHTML = countStr
      document.getElementById('map-legend').style.display = 'block'
      $('.loading').css('display', 'none')
    })
    .fail(function () {
      errorNotice('Too much data to fetch, zoom in further')
    })
}

/**
 * Displays error messages for fetch data failures
 *
 * @param {string} message - custom error message for different scenarios
 * @param {number} time - time in milliseconds
 **/

function errorNotice (message, time) {
  $('.note').css('display', 'block')
  $('.note p').text(message)
  if (time) {
    window.setTimeout(function () {
      $('.note').css('display', 'none')
    }, time)
  } else {
    window.setTimeout(function () {
      $('.note').css('display', 'none')
    }, 2000)
  }
}

/**
 * Construct URL to request a particular project details
 *
 * @returns {string} url - project specific url to fetch details
 **/

function getProjQuery () {
  let projectID = document.getElementById('projects').value
  let url = 'https://tasks.hotosm.org/api/v1/project/' + projectID + '?as_file=false'
  return url
}

/**
 * Fetches complete details of a particular HOTOSM project
 *
 **/

function getProjDetails () {
  let url = getProjQuery()
  console.log('From projDetails: ', url)
  $.ajax(url)
    .done(function (data) {
      let multiPolygon = data.areaOfInterest
      let entities = data.mappingTypes
      let count = 0
      console.log(entities)
      console.log(multiPolygon)
      multiPolygon.coordinates.forEach(function (coords) {
        count++
        let polygon = {'type': 'Polygon', 'coordinates': coords}
        // let bbox = ''
        // coords.forEach(function (item) {
        //   item.forEach(function (subItem) {
        //     bbox += subItem[1] + ' ' + subItem[0]
        //   })
        // })
        console.log(JSON.stringify(polygon))
        console.log(count)
        let polygonTerraform = new terraformer.Primitive(polygon)
        let polygonBbox = polygonTerraform.bbox()
        console.log('bbox of a polygon ', polygonBbox)
        let polygonUrl = getQuery(polygonBbox)
        console.log(polygonUrl)
        $.ajax(polygonUrl)
          .done(function (data) {
            let geojson = osmtogeojson(data)
            var mergedStream = geojsonMerge.merge([ prevGeojson, geojson.features ])
            mergedStream.pipe(process.stdout)
            console.log(mergedStream)

          })
          .fail(function () {
            errorNotice('Too much data to fetch, zoom in further')
          })
      }
      )
    })
    .fail(function () {
    })
}

// Fetch Data on Click

$('#submit').on('click', function () {
  document.getElementById('count').innerHTML = ''
  document.getElementById('count').classList.remove('fill-gray')
  let zoom = map.getZoom()
  if (zoom >= 5) {
    formData = {
      'fromDate': moment($('#fromdate').val()).utc().toISOString(),
      'toDate': moment($('#todate').val()).utc().toISOString()
    }
    getProjDetails()

    // getData()
  } else {
    errorNotice('Zoom in further to fetch results')
  }
})
