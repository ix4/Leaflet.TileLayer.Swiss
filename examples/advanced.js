'use strict';

var swissMap = L.tileLayer.swiss();

var swissImage = L.tileLayer.swiss({
  layer: 'ch.swisstopo.swissimage',
  maxNativeZoom: 28
});

var map = L.map('map', {
  crs: L.TileLayer.Swiss.lv95,
  layers: [swissMap],
  maxBounds: L.TileLayer.Swiss.latLngBounds
});

// Set zoom level such that all of Switzerland is visible
map.fitBounds([
  [5.96, 45.82],
  [10.49, 47.81]
]);

var baseMaps = {
  'National Maps (color)': swissMap,
  'SWISSIMAGE': swissImage
};

var overlayMaps = {
  'Hiking in Switzerland': L.tileLayer.swiss({
    format: 'png',
    layer: 'ch.astra.wanderland',
    maxNativeZoom: 26
  }),
  'Cycling in Switzerland': L.tileLayer.swiss({
    format: 'png',
    layer: 'ch.astra.veloland',
    maxNativeZoom: 26
  }),
  'Mountainbiking in Switzerland': L.tileLayer.swiss({
    format: 'png',
    layer: 'ch.astra.mountainbikeland',
    maxNativeZoom: 26
  }),
  'Skating in Switzerland': L.tileLayer.swiss({
    format: 'png',
    layer: 'ch.astra.skatingland',
    maxNativeZoom: 26
  }),
};

L.control.layers(baseMaps, overlayMaps).addTo(map);
