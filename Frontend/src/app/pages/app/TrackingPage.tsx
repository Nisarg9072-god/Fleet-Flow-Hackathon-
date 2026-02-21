import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Search, Filter, MapPin, Navigation, Clock } from 'lucide-react';

declare global {
  interface Window {
    google: any;
  }
}

export const TrackingPage = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const vehicles = [
    {
      id: 'A-247',
      name: 'Truck A-247',
      driver: 'Mike Johnson',
      status: 'active',
      speed: 55,
      location: { lat: 37.7749, lng: -122.4194 },
      eta: '15 min',
    },
    {
      id: 'B-189',
      name: 'Van B-189',
      driver: 'Sarah Williams',
      status: 'active',
      speed: 42,
      location: { lat: 37.7849, lng: -122.4094 },
      eta: '22 min',
    },
    {
      id: 'C-334',
      name: 'Truck C-334',
      driver: 'David Chen',
      status: 'idle',
      speed: 0,
      location: { lat: 37.7649, lng: -122.4294 },
      eta: 'Stopped',
    },
    {
      id: 'D-112',
      name: 'Truck D-112',
      driver: 'Emily Davis',
      status: 'active',
      speed: 48,
      location: { lat: 37.7949, lng: -122.3994 },
      eta: '8 min',
    },
  ];

  useEffect(() => {
    const loadGoogleMaps = () => {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY_HERE';
      
      if (window.google && window.google.maps) {
        initMap();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
      script.async = true;
      script.defer = true;
      script.onload = () => initMap();
      document.head.appendChild(script);
    };

    const initMap = () => {
      if (!mapRef.current) return;

      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center: { lat: 37.7749, lng: -122.4194 },
        zoom: 12,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }],
          },
        ],
      });

      setMap(mapInstance);

      // Add markers for each vehicle
      vehicles.forEach((vehicle) => {
        const marker = new window.google.maps.Marker({
          position: vehicle.location,
          map: mapInstance,
          title: vehicle.name,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: vehicle.status === 'active' ? '#10b981' : '#6b7280',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          },
        });

        marker.addListener('click', () => {
          setSelectedVehicle(vehicle);
          mapInstance.panTo(vehicle.location);
        });
      });
    };

    loadGoogleMaps();
  }, []);

  const filteredVehicles = vehicles.filter(
    (vehicle) =>
      vehicle.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.driver.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Fleet Tracking</h2>
          
          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search vehicles or drivers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Filter Button */}
          <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filter</span>
          </button>
        </div>

        {/* Vehicle List */}
        <div className="flex-1 overflow-y-auto">
          {filteredVehicles.map((vehicle) => (
            <motion.div
              key={vehicle.id}
              whileHover={{ backgroundColor: '#f9fafb' }}
              onClick={() => {
                setSelectedVehicle(vehicle);
                if (map) {
                  map.panTo(vehicle.location);
                  map.setZoom(15);
                }
              }}
              className={`p-4 border-b border-gray-200 cursor-pointer transition-colors ${
                selectedVehicle?.id === vehicle.id ? 'bg-indigo-50' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    vehicle.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                  }`} />
                  <span className="font-semibold text-gray-900">{vehicle.name}</span>
                </div>
                <span className="text-sm text-gray-500">{vehicle.eta}</span>
              </div>
              <div className="ml-5 space-y-1">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-3.5 h-3.5 mr-1.5" />
                  <span>{vehicle.driver}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Navigation className="w-3.5 h-3.5 mr-1.5" />
                  <span>{vehicle.speed} mph</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {vehicles.filter((v) => v.status === 'active').length}
              </div>
              <div className="text-xs text-gray-600">Active</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {vehicles.filter((v) => v.status === 'idle').length}
              </div>
              <div className="text-xs text-gray-600">Idle</div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        <div ref={mapRef} className="w-full h-full" />

        {/* Selected Vehicle Info Card */}
        {selectedVehicle && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-6 left-6 right-6 bg-white rounded-xl shadow-xl border border-gray-200 p-6 max-w-md"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {selectedVehicle.name}
                </h3>
                <p className="text-sm text-gray-600">Driver: {selectedVehicle.driver}</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                selectedVehicle.status === 'active'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {selectedVehicle.status === 'active' ? 'Active' : 'Idle'}
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">Speed</div>
                <div className="text-xl font-bold text-gray-900">{selectedVehicle.speed} mph</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">ETA</div>
                <div className="text-xl font-bold text-gray-900">{selectedVehicle.eta}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Status</div>
                <div className="text-xl font-bold text-indigo-600">On Route</div>
              </div>
            </div>

            <button
              onClick={() => setSelectedVehicle(null)}
              className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium transition-colors"
            >
              Close
            </button>
          </motion.div>
        )}

        {/* No API Key Warning */}
        {!import.meta.env.VITE_GOOGLE_MAPS_API_KEY && (
          <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-orange-100 border border-orange-300 text-orange-800 px-6 py-3 rounded-lg shadow-lg">
            <p className="text-sm font-medium">
              Add VITE_GOOGLE_MAPS_API_KEY to your environment variables to enable maps
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
