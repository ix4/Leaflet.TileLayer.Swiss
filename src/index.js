import L from 'leaflet';
import { lv03, lv95 } from 'swissgrid';

const Projection = {
  bounds: L.bounds(L.point(2420000, 1030000), L.point(2900000, 1350000)),
  project: ({ lng, lat }) => {
    const [E, N] = lv95.project([lng, lat]);
    return L.point(E, N);
  },
  unproject: ({ x: E, y: N }) => {
    const [lng, lat] = lv95.unproject([E, N]);
    return L.latLng(lat, lng);
  },
};

const CRS = L.Class.extend({
  includes: L.CRS,

  options: {
    transformation: new L.Transformation(1, 0, -1, 0),
  },

  initialize(options) {
    this.projection = Projection;

    L.setOptions(this, options);

    if (this.options.origin) {
      this.transformation = new L.Transformation(1, -this.options.origin[0], -1, this.options.origin[1]);
    }

    if (this.options.scales) {
      this._scales = this.options.scales;
    } else if (this.options.resolutions) {
      this._scales = [];
      for (let i = this.options.resolutions.length - 1; i >= 0; i--) {
        if (this.options.resolutions[i]) {
          this._scales[i] = 1 / this.options.resolutions[i];
        }
      }
    }

    this.infinite = !this.options.bounds;
  },

  scale(zoom) {
    const iZoom = Math.floor(zoom);
    if (zoom === iZoom) {
      return this._scales[zoom];
    }
    // Non-integer zoom, interpolate
    const baseScale = this._scales[iZoom];
    const nextScale = this._scales[iZoom + 1];
    const scaleDiff = nextScale - baseScale;
    const zDiff = (zoom - iZoom);
    return baseScale + scaleDiff * zDiff;
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
    const nextZoom = downZoom + 1;
    const nextScale = this._scales[nextZoom];
    if (nextScale === undefined) {
      return Infinity;
    }
    const scaleDiff = nextScale - downScale;
    return (scale - downScale) / scaleDiff + downZoom;
  },

  distance: L.CRS.Earth.distance,

  R: L.CRS.Earth.R,

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

// Available resolutions
// Source: https://api3.geo.admin.ch/services/sdiservices.html#wmts
const resolutions = [
  4000, 3750, 3500, 3250, 3000, 2750, 2500, 2250, 2000, 1750, 1500, 1250, 1000,
  750, 650, 500, 250, 100, 50, 20, 10, 5, 2.5, 2, 1.5, 1, 0.5, 0.25, 0.1,
];

function makeCrs(options) {
  const bounds = L.bounds(options.min, options.max);
  const origin = [options.min.x, options.max.y];
  return new CRS({
    bounds,
    origin,
    resolutions,
  });
}

const EPSG_2056 = makeCrs({
  // Bounding box for tiles in EPSG:2056
  // Source: https://wmts.geo.admin.ch/EPSG/2056/1.0.0/WMTSCapabilities.xml
  min: L.point(2420000, 1030000),
  max: L.point(2900000, 1350000),
});
const project2056 = latLng => EPSG_2056.projection.project(latLng);
const unproject2056 = point => EPSG_2056.projection.unproject(point);

/*
const EPSG_21781 = makeCrs({
  // Bounding box for tiles in EPSG:21781
  // Source: https://wmts.geo.admin.ch/EPSG/21781/1.0.0/WMTSCapabilities.xml
  min: L.point(420000, 30000),
  max: L.point(900000, 350000),
});
const project21781 = latLng => EPSG_21781.projection.project(latLng);
const unproject21781 = point => EPSG_21781.projection.unproject(point);
*/

const latLngBounds = L.latLngBounds(
  unproject2056(EPSG_2056.options.bounds.min),
  unproject2056(EPSG_2056.options.bounds.max),
);

const URLS = {
  'EPSG:2056': 'https://wmts{s}.geo.admin.ch/1.0.0/{layer}/default/{timestamp}/2056/{z}/{x}/{y}.{format}',
  'EPSG:21781': 'https://wmts{s}.geo.admin.ch/1.0.0/{layer}/default/{timestamp}/21781/{z}/{y}/{x}.{format}',
};

const Swiss = L.TileLayer.extend({
  options: {
    attribution: '<a href="https://www.swisstopo.admin.ch/en/home.html" target="_blank">swisstopo</a>',
    bounds: latLngBounds,
    crs: EPSG_2056,
    format: 'jpeg',
    layer: 'ch.swisstopo.pixelkarte-farbe',
    maxZoom: 27,
    minZoom: 0,
    subdomains: '0123456789',
    timestamp: 'current',
  },
  initialize(options) {
    L.setOptions(this, options);
    const url = URLS['EPSG:2056'];
    L.TileLayer.prototype.initialize.call(this, url, this.options);
  },
});

Swiss.latLngBounds = latLngBounds;
Swiss.EPSG_2056 = EPSG_2056;
Swiss.project_2056 = project2056;
Swiss.unproject_2056 = unproject2056;
/*
Swiss.EPSG_21781 = EPSG_21781;
Swiss.project_21781 = project21781;
Swiss.unproject_21781 = unproject21781;
*/

L.tileLayer.swiss = options => new Swiss(options);

export default Swiss;
