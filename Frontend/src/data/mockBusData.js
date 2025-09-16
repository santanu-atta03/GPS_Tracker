export const mockBusData = {
  'BUS001': {
    id: 'BUS001',
    name: 'Green Express',
    driverName: 'Rajesh Kumar',
    driverPhone: '+91 98765 43210',
    startTime: '08:30 AM',
    destinationTime: '10:15 AM',
    expectedTime: '09:45 AM',
    route: [
      { coordinates: [88.3639, 22.5726], name: 'Kolkata Station' },
      { coordinates: [88.3700, 22.5800], name: 'Sealdah' },
      { coordinates: [88.3750, 22.5850], name: 'Dumdum' },
      { coordinates: [88.3800, 22.5900], name: 'Barrackpore' }
    ],
    currentLocation: [88.3750, 22.5850],
    status: 'On Route'
  },
  'BUS002': {
    id: 'BUS002',
    name: 'City Rider',
    driverName: 'Amit Singh',
    driverPhone: '+91 87654 32109',
    startTime: '09:00 AM',
    destinationTime: '11:30 AM',
    expectedTime: '10:20 AM',
    route: [
      { coordinates: [88.3500, 22.5600], name: 'Esplanade' },
      { coordinates: [88.3600, 22.5700], name: 'Park Street' },
      { coordinates: [88.3700, 22.5800], name: 'Sealdah' }
    ],
    currentLocation: [88.3600, 22.5700],
    status: 'Delayed'
  }
};

export const routes = [
  { from: 'Kolkata Station', to: 'Barrackpore', buses: ['BUS001'] },
  { from: 'Kolkata Station', to: 'Sealdah', buses: ['BUS001'] },
  { from: 'Kolkata Station', to: 'Dumdum', buses: ['BUS001'] },
  { from: 'Esplanade', to: 'Sealdah', buses: ['BUS002'] },
  { from: 'Esplanade', to: 'Park Street', buses: ['BUS002'] },
  { from: 'Park Street', to: 'Sealdah', buses: ['BUS002'] },
  { from: 'Park Street', to: 'Dumdum', buses: ['BUS001', 'BUS002'] },
  { from: 'Sealdah', to: 'Dumdum', buses: ['BUS001'] },
  { from: 'Sealdah', to: 'Barrackpore', buses: ['BUS001'] },
  { from: 'Dumdum', to: 'Barrackpore', buses: ['BUS001'] }
];
