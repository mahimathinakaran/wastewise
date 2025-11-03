import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { reportsAPI } from '../lib/api';
import { toast } from 'sonner';
import { 
  Loader2, 
  MapPin, 
  MessageSquare,
  X,
  Image as ImageIcon,
  Clock,
  User,
  Mail,
  Map as MapIcon,
  Filter
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Button } from '../components/ui/Button';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons by status
const createCustomIcon = (color) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

const statusIcons = {
  pending: createCustomIcon('#eab308'),
  in_progress: createCustomIcon('#3b82f6'),
  completed: createCustomIcon('#22c55e'),
};

// Component to recenter map
function RecenterMap({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.setView(coords, 13);
    }
  }, [coords, map]);
  return null;
}

export default function AdminDashboard() {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showMapView, setShowMapView] = useState(false);
  const [adminComment, setAdminComment] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [mapCenter, setMapCenter] = useState([51.505, -0.09]); // Default London

  useEffect(() => {
    loadReports();
  }, []);

  useEffect(() => {
    filterReports();
  }, [statusFilter, reports]);

  const loadReports = async () => {
    setIsLoading(true);
    try {
      const data = await reportsAPI.getAllReports();
      setReports(data);
      
      // Set map center to first report location if available
      if (data.length > 0 && data[0].location) {
        const coords = extractCoordinates(data[0].location);
        if (coords) {
          setMapCenter(coords);
        }
      }
    } catch (error) {
      toast.error('Failed to load reports');
    } finally {
      setIsLoading(false);
    }
  };

  const filterReports = () => {
    if (statusFilter === 'all') {
      setFilteredReports(reports);
    } else {
      setFilteredReports(reports.filter(r => r.status === statusFilter));
    }
  };

  // Extract coordinates from location string
  const extractCoordinates = (location) => {
    // Try to extract lat/lng from location string
    // Format could be: "Lat: 51.505, Lng: -0.09" or just a place name
    const latMatch = location.match(/lat:\s*(-?\d+\.?\d*)/i);
    const lngMatch = location.match(/lng:\s*(-?\d+\.?\d*)/i);
    
    if (latMatch && lngMatch) {
      return [parseFloat(latMatch[1]), parseFloat(lngMatch[1])];
    }
    
    // Default coordinates if can't extract (you might want to geocode the location)
    return null;
  };

  const handleStatusUpdate = async (reportId, status) => {
    setIsUpdating(true);
    try {
      await reportsAPI.updateReport(reportId, { status });
      toast.success('Status updated successfully');
      await loadReports();
      
      // Update selected report if modal is open
      if (selectedReport && selectedReport._id === reportId) {
        setSelectedReport({ ...selectedReport, status });
      }
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!adminComment.trim() || !selectedReport) return;

    setIsUpdating(true);
    try {
      await reportsAPI.updateReport(selectedReport._id, { 
        admin_comment: adminComment 
      });
      toast.success('Comment added successfully');
      await loadReports();
      setAdminComment('');
      
      // Update selected report
      setSelectedReport({ ...selectedReport, admin_comment: adminComment });
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setIsUpdating(false);
    }
  };

  const openDetailsModal = (report) => {
    setSelectedReport(report);
    setAdminComment(report.admin_comment || '');
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedReport(null);
    setAdminComment('');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'in_progress': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      default: return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
              <p className="text-muted-foreground">
                Manage all waste management reports
              </p>
            </div>
            
            {/* View Toggle */}
            <div className="flex items-center space-x-3 mt-4 md:mt-0">
              <Button
                onClick={() => setShowMapView(false)}
                variant={!showMapView ? 'default' : 'outline'}
                className={!showMapView ? 'bg-green-600 hover:bg-green-700' : ''}
              >
                <Filter className="w-4 h-4 mr-2" />
                Table View
              </Button>
              <Button
                onClick={() => setShowMapView(true)}
                variant={showMapView ? 'default' : 'outline'}
                className={showMapView ? 'bg-green-600 hover:bg-green-700' : ''}
              >
                <MapIcon className="w-4 h-4 mr-2" />
                Map View
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-card border rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Total Reports</p>
              <p className="text-3xl font-bold">{reports.length}</p>
            </div>
            <div className="bg-card border rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Pending</p>
              <p className="text-3xl font-bold text-yellow-600">
                {reports.filter(r => r.status === 'pending').length}
              </p>
            </div>
            <div className="bg-card border rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">In Progress</p>
              <p className="text-3xl font-bold text-blue-600">
                {reports.filter(r => r.status === 'in_progress').length}
              </p>
            </div>
            <div className="bg-card border rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Completed</p>
              <p className="text-3xl font-bold text-green-600">
                {reports.filter(r => r.status === 'completed').length}
              </p>
            </div>
          </div>

          {/* Status Filter */}
          {!showMapView && (
            <div className="mb-6">
              <label className="text-sm font-medium mr-3">Filter by Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-background"
              >
                <option value="all">All Reports</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-green-600" />
            </div>
          ) : (
            <>
              {/* Table View */}
              {!showMapView && (
                <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b bg-muted/50">
                        <tr>
                          <th className="text-left p-4 font-semibold">Image</th>
                          <th className="text-left p-4 font-semibold">Location</th>
                          <th className="text-left p-4 font-semibold">User</th>
                          <th className="text-left p-4 font-semibold">Description</th>
                          <th className="text-left p-4 font-semibold">Status</th>
                          <th className="text-left p-4 font-semibold">Date</th>
                          <th className="text-left p-4 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredReports.length === 0 ? (
                          <tr>
                            <td colSpan="7" className="p-8 text-center text-muted-foreground">
                              No reports found
                            </td>
                          </tr>
                        ) : (
                          filteredReports.map((report) => (
                            <tr key={report._id} className="border-b hover:bg-muted/30 transition-colors">
                              <td className="p-4">
                                {report.image_url && (
                                  <img 
                                    src={`http://localhost:8000${report.image_url}`}
                                    alt="Report"
                                    className="w-16 h-16 object-cover rounded-lg cursor-pointer hover:opacity-80"
                                    onClick={() => openDetailsModal(report)}
                                  />
                                )}
                              </td>
                              <td className="p-4">
                                <div className="flex items-start space-x-2">
                                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                  <span className="text-sm">{report.location}</span>
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="flex items-start space-x-2">
                                  <User className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                  <div>
                                    <p className="text-sm font-medium">{report.user_name}</p>
                                    <p className="text-xs text-muted-foreground">{report.user_email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4 max-w-xs">
                                <p className="text-sm truncate">{report.description}</p>
                              </td>
                              <td className="p-4">
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                                  {report.status.replace('_', ' ').toUpperCase()}
                                </span>
                              </td>
                              <td className="p-4">
                                <div className="flex items-start space-x-2">
                                  <Clock className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                  <span className="text-xs text-muted-foreground">
                                    {formatDate(report.timestamp)}
                                  </span>
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center space-x-2">
                                  <select
                                    onChange={(e) => handleStatusUpdate(report._id, e.target.value)}
                                    className="px-3 py-1 border rounded-md text-sm bg-background"
                                    value={report.status}
                                    disabled={isUpdating}
                                  >
                                    <option value="pending">Pending</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                  </select>
                                  <Button
                                    onClick={() => openDetailsModal(report)}
                                    variant="outline"
                                    size="sm"
                                  >
                                    <MessageSquare className="w-4 h-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Map View */}
              {showMapView && (
                <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
                  <div style={{ height: '600px' }}>
                    <MapContainer 
                      center={mapCenter} 
                      zoom={13} 
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <RecenterMap coords={mapCenter} />
                      {reports.map((report) => {
                        const coords = extractCoordinates(report.location);
                        if (!coords) return null;
                        
                        return (
                          <Marker 
                            key={report._id} 
                            position={coords}
                            icon={statusIcons[report.status]}
                          >
                            <Popup>
                              <div className="p-2">
                                <h3 className="font-semibold mb-1">{report.location}</h3>
                                <p className="text-sm text-gray-600 mb-2">{report.description}</p>
                                <p className="text-xs text-gray-500 mb-2">By: {report.user_name}</p>
                                <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(report.status)}`}>
                                  {report.status.replace('_', ' ').toUpperCase()}
                                </span>
                                <button
                                  onClick={() => openDetailsModal(report)}
                                  className="mt-2 w-full px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                                >
                                  View Details
                                </button>
                              </div>
                            </Popup>
                          </Marker>
                        );
                      })}
                    </MapContainer>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-card z-10">
              <h2 className="text-2xl font-bold">Report Details</h2>
              <button
                onClick={closeDetailsModal}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Image */}
              {selectedReport.image_url && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <div className="flex items-center space-x-2">
                      <ImageIcon className="w-4 h-4 text-muted-foreground" />
                      <span>Uploaded Image</span>
                    </div>
                  </label>
                  <img 
                    src={`http://localhost:8000${selectedReport.image_url}`}
                    alt="Report"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
              )}

              {/* Location */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>Location</span>
                  </div>
                </label>
                <p className="text-lg px-4 py-2 bg-muted rounded-lg">{selectedReport.location}</p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <p className="px-4 py-3 bg-muted rounded-lg">{selectedReport.description}</p>
              </div>

              {/* User Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span>Reported By</span>
                    </div>
                  </label>
                  <p className="px-4 py-2 bg-muted rounded-lg">{selectedReport.user_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span>Email</span>
                    </div>
                  </label>
                  <p className="px-4 py-2 bg-muted rounded-lg text-sm">{selectedReport.user_email}</p>
                </div>
              </div>

              {/* Status Update */}
              <div>
                <label className="block text-sm font-medium mb-2">Update Status</label>
                <select
                  onChange={(e) => handleStatusUpdate(selectedReport._id, e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-background"
                  value={selectedReport.status}
                  disabled={isUpdating}
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              {/* Admin Comment */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4 text-muted-foreground" />
                    <span>Admin Comment</span>
                  </div>
                </label>
                <form onSubmit={handleCommentSubmit}>
                  <textarea
                    value={adminComment}
                    onChange={(e) => setAdminComment(e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-background min-h-[100px]"
                    placeholder="Add a comment for the user..."
                  />
                  <div className="flex items-center space-x-3 mt-3">
                    <Button
                      type="submit"
                      disabled={isUpdating || !adminComment.trim()}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isUpdating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Comment'
                      )}
                    </Button>
                    {selectedReport.admin_comment && (
                      <p className="text-sm text-muted-foreground">
                        Previous: "{selectedReport.admin_comment}"
                      </p>
                    )}
                  </div>
                </form>
              </div>

              {/* Timestamp */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>Submitted</span>
                  </div>
                </label>
                <p className="px-4 py-2 bg-muted rounded-lg">{formatDate(selectedReport.timestamp)}</p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t">
              <Button onClick={closeDetailsModal} variant="outline">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}