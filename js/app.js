const osmtogeojson = require('osmtogeojson')
const util = require('util')
const moment = require('moment')

mapboxgl.accessToken = 'pk.eyJ1IjoicnVtYyIsImEiOiJjamJhdHJzODUxMGUyMnFub2l3cTlmMTJnIn0.hTkMVvU1xz2StHhaEYuMIA'
let map = new mapboxgl.Map({
  container: 'map', // container id
  style: 'mapbox://styles/mapbox/light-v9', // stylesheet location
  center: [-74.50, 40], // starting position [lng, lat]
  zoom: 9, // starting zoom
  hash: true
})
map.addControl(new MapboxGeocoder({
  accessToken: mapboxgl.accessToken
}))
var nav = new mapboxgl.NavigationControl()
map.addControl(nav, 'top-left')

$('#fromdate').val(moment().format('YYYY-MM-DD[T]00:00:01'))
$('#todate').val(moment().format('YYYY-MM-DD[T]HH:mm:ss'))

var formData = {}
var overpassDataSource = {
  'type': 'FeatureCollection',
  'features': []
}

let head = '[out:xml][timeout:25];'
let q = head + '(node %s (%s));(way %s(%s));(rel %s (%s));out body;>;out body qt;'
map.on('load', function () {
  map.addSource('overpassDataSource', {type: 'geojson', data: overpassDataSource})
})

function getQuery () {
  let bounds = map.getBounds()
  let north = bounds['_ne'].lat
  let east = bounds['_ne'].lng
  let south = bounds['_sw'].lat
  let west = bounds['_sw'].lng
  let bbox = south + ',' + west + ',' + north + ',' + east

  if (formData.fromDate != '' && formData.toDate != '') {
    overpassDate = "(changed:'" + formData.fromDate + "','" + formData.toDate + "')"
  } else if (formData.fromDate != '' && formData.toDate === '') {
    overpassDate = "(changed:'" + formData.fromDate + "')"
  }

  // for osm 'https://api.openstreetmap.org/api/0.6/map?bbox='+bbox;

  query += bbox
  var query = util.format(q, overpassDate, bbox, overpassDate, bbox, overpassDate, bbox)
  var url = 'https://www.overpass-api.de/api/interpreter?data=' + query

  return url
}

function getData (callback) {
  var url = getQuery()
  $('.loading').css('display', 'inline-block')
  $.ajax(url)
    .done(function (data) {
      console.log('osm ', data)
      var geojson = osmtogeojson(data)
      console.log('osm to geojson ', geojson)
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

      $('.loading').css('display', 'none')
    })
    .fail(function () {
    })
}

$('#submit').on('click', function () {
  formData = {
    'fromDate': moment($('#fromdate').val()).utc().toISOString(),
    'toDate': moment($('#todate').val()).utc().toISOString()
  }
  var url = getQuery()
  console.log('from submit before fetching ', url)
  getData()
  // console.log('from submit after conversion ', data)
})
