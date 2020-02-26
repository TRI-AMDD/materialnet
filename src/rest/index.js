export function fetchJSON (path) {
  return fetch(path)
    .then(async res => {
      const text = await res.text();
      let json;
      try {
        json = JSON.parse(text);
      } catch (e) {
        json = null;
      }

      return json;
    });
}

export function fetchStructure(name) {
  return fetch(`sample-data/structures/${name}.cjson`)
    .then(async res => {
      const text = await res.text();
      let json;
      try {
        json = JSON.parse(text);
      } catch (e) {
        json = null;
      }

      return json;
    });
}
