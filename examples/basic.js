'use strict';

var Swiss = L.TileLayer.Swiss;

var map = L.map('map', {
  crs: Swiss.lv95,
  layers: [new Swiss()],
  maxBounds: Swiss.latLngBounds,
  zoomSnap: 0.25,
});

// Center the map on Bern
map.setView(Swiss.lv95.unproject(L.point(2600000, 1200000)), 16);
