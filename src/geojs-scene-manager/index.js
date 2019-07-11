import geo from 'geojs';

import './tooltip.css';

export class GeoJSSceneManager {
  constructor({el, dp}) {
    this.parent = el;
    this.initScene(dp);
  }

  initScene(dp) {
    const degrees = dp.nodeDegrees(2020);

    let nodes = {};
    dp.nodeNames().forEach(name => {
      const pos = dp.nodePosition(name);
      nodes[name] = {
        x: pos.x,
        y: pos.y,
        degree: degrees[name],
      };
    });

    const xs = Object.values(nodes).map(d => d.x);
    const ys = Object.values(nodes).map(d => d.y);

    const bounds = {
      minx: Math.min(...xs),
      maxx: Math.max(...xs),
      miny: Math.min(...ys),
      maxy: Math.max(...ys),
    };

    let params = geo.util.pixelCoordinateParams(this.parent, bounds.maxx - bounds.minx, bounds.maxy - bounds.miny);

    // the utility function assumes top left is 0, 0.  Move it to minx, miny.
    params.map.maxBounds.left += bounds.minx;
    params.map.maxBounds.top += bounds.miny;
    params.map.maxBounds.right += bounds.minx;
    params.map.maxBounds.bottom += bounds.miny;
    params.map.center.x += bounds.minx;
    params.map.center.y += bounds.miny;

    // inflate the bounds to add a border
    const maxwh = Math.max(bounds.maxx - bounds.minx, bounds.maxy - bounds.miny);
    const factor = 0.5;
    params.map.maxBounds.left -= maxwh * factor;
    params.map.maxBounds.top -= maxwh * factor;
    params.map.maxBounds.right += maxwh * factor;
    params.map.maxBounds.bottom += maxwh * factor;

    // allow zoomming in until 1 unit of space is 2^(value) bigger.
    params.map.max += 3;
    params.map.min -= 3;

    const map = geo.map(params.map);

    const layer = map.createLayer('feature', {
      features: [
        'point',
        'line',
      ],
    });

    const edges = dp.edges;
    const lines = layer.createFeature('line')
      .data(edges)
      .style({
        position: name => nodes[name],
        width: 1,
        strokeColor: 'black',
        strokeOpacity: 0.1,
      });

    const points = layer.createFeature('point', {
      // primitiveShape: 'triangle',
      style: {
        strokeColor: 'black',
        fillColor: 'gray',
        strokeOpacity: 0.5,
        fillOpacity: 0.5,
        radius: name => Math.max(2, Math.sqrt(nodes[name].degree)),
      },
      position: name => nodes[name],
    })
      .data(Object.keys(nodes));

    const ui = map.createLayer('ui', {
      zIndex: 2,
    });

    const tooltip = ui.createWidget('dom', {
      position: {
        x: 0,
        y: 0,
      },
    });

    const tooltipElem = tooltip.canvas();
    tooltipElem.setAttribute('id', 'tooltip');
    tooltipElem.classList.toggle('hidden', true);
    tooltipElem.style['pointer-events'] = 'none';

    let onNode = false;

    points.geoOn(geo.event.feature.mouseon, evt => {
      onNode = true;

      const name = evt.data;
      const node = nodes[name];

      tooltip.position(evt.mouse.geo);
      tooltipElem.innerText = name;
      tooltipElem.classList.toggle('hidden', false);
    });
    points.geoOn(geo.event.feature.mousemove, evt => {
      tooltip.position(evt.mouse.geo);
    });
    points.geoOn(geo.event.feature.mouseoff, evt => {
      onNode = false;

      tooltipElem.classList.toggle('hidden', true);
    });

    lines.geoOn(geo.event.feature.mouseon, evt => {
      if (onNode) {
        return;
      }

      const text = `${evt.data[0]} - ${evt.data[1]}`;

      tooltip.position(evt.mouse.geo);
      tooltipElem.innerText = text;
      tooltipElem.classList.toggle('hidden', false);
    });
    lines.geoOn(geo.event.feature.mousemove, evt => {
      tooltip.position(evt.mouse.geo);
    });
    lines.geoOn(geo.event.feature.mouseoff, evt => {
      if (onNode) {
        return;
      }

      tooltipElem.classList.toggle('hidden', true);
    });

    map.draw();
  }

  expand () {}
  setLinkOpacity () {}
  hideAfter () {}
  setDegreeSize () {}
  pickName () {}
  display () {}
  undisplay () {}
  linksVisible () {}
  setNightMode () {}
  setBooleanColor () {}
  setDiscoveryColor () {}
  setUndiscoveredColor () {}
  setPropertyColor () {}
  render () {}
  resize () {}
  pick () {}
  moveCamera () {}
  clear () {}
}