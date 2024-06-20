import React, { useState, useEffect } from "react";
import { Container, Dropdown, Navbar } from "react-bootstrap";
import Papa from "papaparse";
import { BarChart, Bar, XAxis, YAxis, Legend } from 'recharts';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [warehouses, setWarehouses] = useState([]);
  const [transportVolumes, setTransportVolumes] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [selectedOrigins, setSelectedOrigins] = useState([]);
  const [selectedDestinations, setSelectedDestinations] = useState([]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF4563', '#83A6ED', '#8884D8', '#8DD1E1', '#82CA9D'];

  useEffect(() => {
    Papa.parse("/Warehouses.csv", {
      download: true,
      header: true,
      delimiter: ";",
      complete: (results) => {
        setWarehouses(results.data);
      }
    });

    Papa.parse("/Transport-Volumes.csv", {
      download: true,
      header: true,
      delimiter: ";",
      complete: (results) => {
        setTransportVolumes(results.data);
      }
    });
  }, []);

  const materials = [...new Set(transportVolumes.map(item => item.Material))];
  const origins = [...new Set(transportVolumes.map(item => item.Origin))];
  const destinations = [...new Set(transportVolumes.map(item => item.Destination))];

  const filteredTransportVolumes = transportVolumes.filter(item =>
    (selectedMaterials.length === 0 || selectedMaterials.includes(item.Material)) &&
    (selectedOrigins.length === 0 || selectedOrigins.includes(item.Origin)) &&
    (selectedDestinations.length === 0 || selectedDestinations.includes(item.Destination))
  );

  // Preparing data for the stacked bar chart
  const dataForChart = [];
  origins.forEach(origin => {
    const originData = { origin };
    destinations.forEach(destination => {
      const transportVolume = filteredTransportVolumes
        .filter(item => item.Origin === origin && item.Destination === destination)
        .reduce((acc, item) => acc + parseFloat(item['Transport Volume']), 0);
      originData[destination] = transportVolume;
    });
    dataForChart.push(originData);
  });

  return (
    <>
      <Navbar bg="dark" data-bs-theme="dark">
        <Container>
          <Navbar.Brand>Factory Location Optimization</Navbar.Brand>
        </Container>
      </Navbar>

      <Container>
        <Dropdown className="mt-4" onSelect={(eventKey) => setSelectedMaterials(eventKey.split(','))}>
          <Dropdown.Toggle variant="success" id="dropdown-materials">
            Materials
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {materials.map((material, index) => (
              <Dropdown.Item key={index} eventKey={material}>{material}</Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>

        <Dropdown className="mt-2" onSelect={(eventKey) => setSelectedOrigins(eventKey.split(','))}>
          <Dropdown.Toggle variant="primary" id="dropdown-origins">
            Origins
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {origins.map((origin, index) => (
              <Dropdown.Item key={index} eventKey={origin}>{origin}</Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>

        <Dropdown className="mt-2" onSelect={(eventKey) => setSelectedDestinations(eventKey.split(','))}>
          <Dropdown.Toggle variant="info" id="dropdown-destinations">
            Destinations
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {destinations.map((destination, index) => (
              <Dropdown.Item key={index} eventKey={destination}>{destination}</Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>

        <div className="mt-4">
          <BarChart width={900} height={400} data={dataForChart}>
            <XAxis dataKey="origin" />
            <YAxis />
            <Legend />
            {destinations.map((destination, index) => (
              <Bar key={index} dataKey={destination} stackId="a" fill={COLORS[index % COLORS.length]} />
            ))}
          </BarChart>
        </div>

      </Container>
    </>
  );
}
export default App;