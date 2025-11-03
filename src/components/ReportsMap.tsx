'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Report } from '@/lib/reports';
import { StatusBadge } from '@/components/StatusBadge';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface ReportsMapProps {
  reports: Report[];
}

export function ReportsMap({ reports }: ReportsMapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Filter reports with valid coordinates
  const reportsWithCoords = reports.filter(r => r.latitude && r.longitude);

  if (!isMounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reports Map</CardTitle>
          <CardDescription>Loading map...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[500px] bg-muted rounded-lg animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  if (reportsWithCoords.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reports Map</CardTitle>
          <CardDescription>No reports with location data available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[500px] bg-muted rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground">No location data to display</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate center point (average of all coordinates)
  const centerLat = reportsWithCoords.reduce((sum, r) => sum + (r.latitude || 0), 0) / reportsWithCoords.length;
  const centerLng = reportsWithCoords.reduce((sum, r) => sum + (r.longitude || 0), 0) / reportsWithCoords.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reports Map</CardTitle>
        <CardDescription>
          Visualize report locations on the map ({reportsWithCoords.length} location{reportsWithCoords.length !== 1 ? 's' : ''})
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[500px] rounded-lg overflow-hidden border">
          <MapContainer
            center={[centerLat, centerLng]}
            zoom={12}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {reportsWithCoords.map((report) => (
              <Marker
                key={report.id}
                position={[report.latitude!, report.longitude!]}
              >
                <Popup>
                  <div className="space-y-2">
                    <img
                      src={report.image_url}
                      alt="Report"
                      className="w-32 h-24 object-cover rounded"
                    />
                    <h4 className="font-semibold">{report.location}</h4>
                    <p className="text-sm">{report.description}</p>
                    <div className="flex items-center justify-between">
                      <StatusBadge status={report.status} />
                      <span className="text-xs text-muted-foreground">
                        {report.user_name}
                      </span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </CardContent>
    </Card>
  );
}
