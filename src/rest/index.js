export function fetchStructure(name) {
  return fetch(`sample-data/structures/${name}.cjson`)
    .then(res => {
      return res.json();
    });
}
