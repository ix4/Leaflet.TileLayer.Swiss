import L from 'leaflet';
import * as epsg from './epsg';
import * as projection from './projection';

// Available resolutions
// Source: https://api3.geo.admin.ch/services/sdiservices.html#wmts
const RESOLUTIONS = [
  4000, 3750, 3500, 3250, 3000, 2750, 2500, 2250, 2000, 1750, 1500, 1250, 1000,
  750, 650, 500, 250, 100, 50, 20, 10, 5, 2.5, 2, 1.5, 1, 0.5, 0.25, 0.1,
];

const CRS = L.Class.extend({
  includes: L.CRS,

  initialize(options) {
    this.code = options.code;
    this.projection = options.projection;

    const origin = this.projection.bounds.getBottomLeft();
    this.transformation = new L.Transformation(1, -origin.x, -1, origin.y);

    this._scales = [256, 512, 1024, 2048, 4096, 8192, 16384, 32768, 65536, 131072, 262144, 524288, 1048576, 2097152, 4194304, 8388608, 16777216, 33554432]; //[...Array(18)].map((_, i) => 256 * (2 ** i)); // RESOLUTIONS.map(resolution => 1 / resolution);
    this._foo = [...Array(18)].map((_, i) => 256 * (2 ** i));

    this.infinite = false;
  },

  scale(zoom) {
    const zoomFloor = Math.floor(zoom);
    if (zoom === zoomFloor) {
      return this._scales[zoom];
    }
    // Non-integer zoom, interpolate @TODO fun
    console.log('scale non-integer');
    const scaleFloor = this._scales[zoomFloor];
    const scaleNext = this._scales[zoomFloor + 1];

    const scaleDiff = scaleNext - scaleFloor;
    const zDiff = (zoom - zoomFloor);
    const oldResult = scaleFloor + scaleDiff * zDiff;

    const scaleFactor = scaleNext / scaleFloor;
    console.log(oldResult, scaleFactor);
    return oldResult;
  },

  zoom(scale) {
    // Find closest number in this._scales, down
    const downScale = this._closestElement(this._scales, scale);
    const downZoom = this._scales.indexOf(downScale);
    // Check if scale is downScale => return array index
    if (scale === downScale) {
      return downZoom;
    }
    if (downScale === undefined) {
      return -Infinity;
    }
    // Interpolate
    console.log('zoom non-integer');
    const nextZoom = downZoom + 1;
    const nextScale = this._scales[nextZoom];
    if (nextScale === undefined) {
      return Infinity;
    }
    const scaleDiff = nextScale - downScale;
    return (scale - downScale) / scaleDiff + downZoom;
  },

  distance(latLng1, latLng2) {
    const point1 = this.project(latLng1);
    const point2 = this.project(latLng2);
    return point1.distanceTo(point2);
  },

  /* Get the closest lowest element in an array */
  _closestElement(array, element) {
    let low;
    for (let i = array.length; i--;) {
      if (array[i] <= element && (low === undefined || low < array[i])) {
        low = array[i];
      }
    }
    return low;
  },
});

export const lv03 = new CRS({
  code: epsg.lv03,
  projection: projection.lv03,
});

export const lv95 = new CRS({
  code: epsg.lv95,
  projection: projection.lv95,
});
