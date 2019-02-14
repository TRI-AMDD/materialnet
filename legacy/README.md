# materialnet
Prototype visualization for TRI materials network data

## Build Instructions
1. Install NPM dependencies: `npm install`

2. Build the data: `cd data; python process.py <input_data.csv >../src/edges.json; cd ..`.

2. Build application: `npm run build`

3. Serve application: `npm start`

4. Go to http://localhost:8080
