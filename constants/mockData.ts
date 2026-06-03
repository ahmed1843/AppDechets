export const MOCK_TRUCK_LOCATION = {
  latitude: 48.8566,
  longitude: 2.3522,
  heading: 45,
  speed: 28, // km/h
  lastUpdated: "2 sec ago",
};

export const MOCK_ROUTES = [
  { id: "R1", name: "Sector A — North", stops: 12, completed: 7, eta: "14 min" },
  { id: "R2", name: "Sector B — West", stops: 9, completed: 0, eta: "Pending" },
];

export const MOCK_ALERTS = [
  {
    id: "A1",
    type: "approaching",
    message: "Truck arriving in ~14 minutes",
    timestamp: "10:32 AM",
  },
  {
    id: "A2",
    type: "completed",
    message: "Collection completed at Stop #7",
    timestamp: "09:48 AM",
  },
  {
    id: "A3",
    type: "delay",
    message: "Slight delay on Sector A due to traffic",
    timestamp: "09:10 AM",
  },
];

export const MOCK_DRIVER = {
  name: "Marc Dupont",
  badge: "DRV-0042",
  truck: "TRK-204",
  shift: "06:00 — 14:00",
};
