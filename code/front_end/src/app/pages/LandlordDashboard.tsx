import { useState, useEffect, useRef, useMemo } from 'react';
import { 
  PlusCircle, Edit, Trash2, Home, TrendingUp, Users, Calendar, 
  CheckCircle, XCircle, Phone, MessageSquare, Mail,
  Navigation, MapPin, ExternalLink, Loader2, Search
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { API_BASE_URL } from '../../config';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix for default marker icons in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

function MapController({ center }: { center?: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    // Invalidate size in case dialog just opened
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);
    return () => clearTimeout(timer);
  }, [map]);

  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, Math.max(map.getZoom(), 15));
    }
  }, [center, map]);

  return null;
}

function LocationPicker({ 
  position, 
  setPosition 
}: { 
  position: { lat: number; lng: number } | undefined; 
  setPosition: (pos: { lat: number; lng: number }) => void;
}) {
  useMapEvents({
    click(e) {
      setPosition({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });

  const markerRef = useRef<any>(null);
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const latlng = marker.getLatLng();
          setPosition({ lat: latlng.lat, lng: latlng.lng });
        }
      },
    }),
    [setPosition]
  );

  return position ? (
    <Marker 
      draggable={true} 
      eventHandlers={eventHandlers} 
      position={[position.lat, position.lng]} 
      ref={markerRef} 
    />
  ) : null;
}

export function LandlordDashboard() {
  const [listings, setListings] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'listings' | 'bookings'>('overview');

  const fetchListings = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/stays/landlord/my-listings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        // Map backend fields to what the frontend expects (id vs stay_id, address vs location, and add dummy images)
        const formattedData = data.map((stay: any) => ({
          ...stay,
          id: stay.stay_id.toString(),
          location: stay.address,
          facilities: stay.facilities ? stay.facilities.split(',').map((f: string) => f.trim()) : [],
          rating: stay.rating !== undefined && Number(stay.rating) > 0 ? Number(stay.rating) : 0,
          review_count: stay.review_count !== undefined ? Number(stay.review_count) : 0,
          distance: 'Unknown distance', // Dummy distance
          availability: stay.availability || 'Available',
          price: Number(stay.price),
          roomType: stay.roomType || 'Single',
          gender: stay.gender || 'Any',
        }));
        setListings(formattedData);
      }
    } catch (error) {
      console.error('Failed to fetch listings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user.id) return;
      
      const response = await fetch(`${API_BASE_URL}/api/bookings/landlord/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user.id) return;
      
      const response = await fetch(`${API_BASE_URL}/api/messages/landlord/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const handleSendReply = async (messageId: number) => {
    if (!replyText.trim()) {
      alert("Please enter a reply.");
      return;
    }
    setIsSubmittingReply(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/messages/${messageId}/reply`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply_text: replyText.trim() })
      });

      const data = await response.json();
      if (response.ok) {
        alert("Reply sent successfully!");
        setReplyingMessageId(null);
        setReplyText('');
        fetchMessages();
      } else {
        alert(data.error || "Failed to send reply.");
      }
    } catch (error) {
      console.error("Failed to send reply:", error);
      alert("An error occurred while sending the reply.");
    } finally {
      setIsSubmittingReply(false);
    }
  };

  useEffect(() => {
    fetchListings();
    fetchBookings();
    fetchMessages();
  }, []);

  const defaultListing = {
    title: '',
    location: '',
    price: '',
    roomType: 'Single',
    gender: 'Any',
    facilities: '',
    description: '',
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
    map_url: '',
    availability: 'Available'
  };

  const [newListing, setNewListing] = useState(defaultListing);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [mapSearchQuery, setMapSearchQuery] = useState('');
  const [isSearchingMap, setIsSearchingMap] = useState(false);

  // Helper to reverse geocode coordinates into a readable address
  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      if (res.ok) {
        const data = await res.json();
        return data.display_name || '';
      }
    } catch (err) {
      console.error('Reverse geocode error:', err);
    }
    return '';
  };

  // 1. Get Current Location from browser GPS
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const googleUrl = `https://www.google.com/maps?q=${lat},${lng}`;

        let detectedAddress = '';
        try {
          detectedAddress = await reverseGeocode(lat, lng);
        } catch (_) {}

        setNewListing((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lng,
          map_url: googleUrl,
          location: prev.location || detectedAddress.split(',').slice(0, 3).join(', ') || prev.location
        }));

        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        alert(`Could not detect location: ${err.message}. Please click on the map to set location.`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // 2. Search place or area on map
  const handleSearchOnMap = async () => {
    if (!mapSearchQuery.trim()) return;
    setIsSearchingMap(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(mapSearchQuery.trim())}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lng = parseFloat(data[0].lon);
          const googleUrl = `https://www.google.com/maps?q=${lat},${lng}`;

          setNewListing((prev) => ({
            ...prev,
            latitude: lat,
            longitude: lng,
            map_url: googleUrl,
            location: prev.location || data[0].display_name.split(',').slice(0, 3).join(', ')
          }));
        } else {
          alert('Location not found. Try entering a nearby town or landmark.');
        }
      }
    } catch (err) {
      console.error('Search error:', err);
      alert('Failed to search location.');
    } finally {
      setIsSearchingMap(false);
    }
  };

  // 3. When position is updated via map click or dragging the marker
  const handleMapPositionChange = (pos: { lat: number; lng: number }) => {
    const googleUrl = `https://www.google.com/maps?q=${pos.lat},${pos.lng}`;
    setNewListing((prev) => ({
      ...prev,
      latitude: pos.lat,
      longitude: pos.lng,
      map_url: googleUrl
    }));
  };

  const handleOpenAdd = () => {
    setIsEditMode(false);
    setEditingId(null);
    setNewListing(defaultListing);
    setImageFile(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (listing: any) => {
    setIsEditMode(true);
    setEditingId(listing.id);
    setNewListing({
      title: listing.title,
      location: listing.location,
      price: listing.price.toString(),
      roomType: listing.roomType,
      gender: listing.gender,
      facilities: Array.isArray(listing.facilities) ? listing.facilities.join(', ') : listing.facilities,
      description: listing.description,
      latitude: listing.latitude,
      longitude: listing.longitude,
      map_url: listing.map_url || '',
      availability: listing.availability || 'Available'
    });
    setImageFile(null);
    setIsDialogOpen(true);
  };

  const handleSaveListing = async () => {
    if (isEditMode && editingId) {
      try {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('title', newListing.title);
        formData.append('description', newListing.description);
        formData.append('price', newListing.price.toString());
        formData.append('address', newListing.location);
        formData.append('latitude', (newListing.latitude || 6.9271).toString());
        formData.append('longitude', (newListing.longitude || 79.8612).toString());
        formData.append('roomType', newListing.roomType);
        formData.append('gender', newListing.gender);
        formData.append('facilities', newListing.facilities);
        formData.append('availability', (newListing as any).availability || 'Available');
        if (newListing.map_url) {
            formData.append('map_url', newListing.map_url);
        }
        if (imageFile) {
            formData.append('image', imageFile);
        }

        const response = await fetch(`${API_BASE_URL}/api/stays/${editingId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        if (response.ok) {
          alert('Listing updated successfully!');
          fetchListings(); // Refresh the list
          setIsDialogOpen(false);
        } else {
          const data = await response.json();
          alert(`Error: ${data.error}`);
        }
      } catch (error) {
        console.error('Failed to update listing:', error);
        alert('Failed to update listing. Please try again.');
      }
    } else {
      try {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('title', newListing.title);
        formData.append('description', newListing.description);
        formData.append('price', newListing.price.toString());
        formData.append('address', newListing.location);
        formData.append('latitude', (newListing.latitude || 6.9271).toString());
        formData.append('longitude', (newListing.longitude || 79.8612).toString());
        formData.append('roomType', newListing.roomType);
        formData.append('gender', newListing.gender);
        formData.append('facilities', newListing.facilities);
        formData.append('availability', 'Available');
        if (newListing.map_url) {
            formData.append('map_url', newListing.map_url);
        }
        if (imageFile) {
            formData.append('image', imageFile);
        }

        const response = await fetch(`${API_BASE_URL}/api/stays`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        if (response.ok) {
          alert('Listing added successfully!');
          fetchListings(); // Refresh the list
          setIsDialogOpen(false);
        } else {
          const data = await response.json();
          alert(`Error: ${data.error}`);
        }
      } catch (error) {
        console.error('Failed to save listing:', error);
        alert('Failed to save listing. Please try again.');
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this listing?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/stays/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          setListings(listings.filter((l) => l.id !== id));
        } else {
          const data = await response.json();
          alert(`Error: ${data.error}`);
        }
      } catch (error) {
        console.error('Failed to delete listing:', error);
        alert('Failed to delete listing. Please try again.');
      }
    }
  };

  const handleUpdateBookingStatus = async (requestId: number, status: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/bookings/${requestId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        alert(`Booking ${status} successfully!`);
        fetchBookings(); // Refresh the bookings list
        fetchListings(); // Refresh the listings list
      } else {
        const data = await response.json();
        alert(data.error || "Failed to update booking status.");
      }
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("An error occurred.");
    }
  };

  const stats = [
    { label: 'Total Listings', value: listings.length, icon: Home, color: '#1a7a6e', bg: '#e8f5f3' },
    { label: 'Available', value: listings.filter((l) => l.availability === 'Available').length, icon: TrendingUp, color: '#52b788', bg: '#d8f3dc' },
    { label: 'Pending Bookings', value: bookings.filter((b) => b.status === 'pending').length, icon: Calendar, color: '#e07b39', bg: '#fdf0e8' },
    { label: 'Messages', value: messages.length, icon: MessageSquare, color: '#1a7a6e', bg: '#e8f5f3' },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f7fafa' }}>

      {/* Page Header */}
      <div className="py-10" style={{ background: 'linear-gradient(135deg, #0d1f1d 0%, #1a7a6e 100%)' }}>
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium tracking-widest uppercase mb-2" style={{ color: '#52b788' }}>Dashboard</p>
              <h1 className="text-4xl font-normal text-white" style={{ fontFamily: "'DM Serif Display', serif" }}>
                Landlord Dashboard
              </h1>
              <p className="mt-2" style={{ color: 'rgba(255,255,255,0.65)' }}>Manage your boarding place listings</p>
            </div>

            {localStorage.getItem('user') && JSON.parse(localStorage.getItem('user') as string).role === 'landlord' && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="gap-2 font-semibold flex-shrink-0" style={{ backgroundColor: '#e07b39', color: 'white', border: 'none' }} onClick={handleOpenAdd}>
                    <PlusCircle className="w-5 h-5" />
                    Add Listing
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle style={{ fontFamily: "'DM Serif Display', serif", fontSize: '22px', fontWeight: 400 }}>
                      {isEditMode ? 'Edit Boarding Place' : 'Add New Boarding Place'}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-2">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input id="title" placeholder="e.g., Comfortable Single Room Near Campus"
                        value={newListing.title} onChange={(e) => setNewListing({ ...newListing, title: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="location">Location</Label>
                        <Input id="location" placeholder="e.g., Peradeniya"
                          value={newListing.location} onChange={(e) => setNewListing({ ...newListing, location: e.target.value })} />
                      </div>
                      <div>
                        <Label htmlFor="price">Monthly Price (Rs.)</Label>
                        <Input id="price" type="number" placeholder="e.g., 12000"
                          value={newListing.price} onChange={(e) => setNewListing({ ...newListing, price: e.target.value })} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Room Type</Label>
                        <Select value={newListing.roomType} onValueChange={(value) => setNewListing({ ...newListing, roomType: value })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Single">Single</SelectItem>
                            <SelectItem value="Double">Double</SelectItem>
                            <SelectItem value="Triple">Triple</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Gender Preference</Label>
                        <Select value={newListing.gender} onValueChange={(value) => setNewListing({ ...newListing, gender: value })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Any">Any</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="facilities">Facilities (comma-separated)</Label>
                      <Input id="facilities" placeholder="e.g., WiFi, Kitchen, Parking, Study Table"
                        value={newListing.facilities} onChange={(e) => setNewListing({ ...newListing, facilities: e.target.value })} />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea id="description" placeholder="Describe your boarding place…" rows={4}
                        value={newListing.description} onChange={(e) => setNewListing({ ...newListing, description: e.target.value })} />
                    </div>
                    <div>
                      <Label htmlFor="image">Upload Image</Label>
                      <Input id="image" type="file" accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setImageFile(e.target.files[0]);
                          }
                        }} />
                    </div>
                    {/* Location & Map Section */}
                    <div className="space-y-3 pt-3 pb-1 border-t" style={{ borderColor: 'rgba(26,122,110,0.15)' }}>
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <Label className="text-sm font-semibold" style={{ color: '#0d1f1d' }}>
                            Property Location & Map Pin
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Click or drag the marker, or tap the button to use your device's GPS.
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleUseCurrentLocation}
                          disabled={isLocating}
                          className="gap-1.5 text-xs font-semibold flex-shrink-0"
                          style={{ borderColor: '#1a7a6e', color: '#1a7a6e' }}
                        >
                          {isLocating ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              Detecting GPS...
                            </>
                          ) : (
                            <>
                              <Navigation className="w-3.5 h-3.5" />
                              Use Current Location
                            </>
                          )}
                        </Button>
                      </div>

                      {/* Quick Search on Map */}
                      <div className="flex gap-2">
                        <Input
                          placeholder="Search town/landmark (e.g. Peradeniya, Hindagala, Kandy)"
                          value={mapSearchQuery}
                          onChange={(e) => setMapSearchQuery(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleSearchOnMap();
                            }
                          }}
                          className="text-xs"
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={handleSearchOnMap}
                          disabled={isSearchingMap || !mapSearchQuery.trim()}
                          className="gap-1 text-xs font-medium"
                        >
                          {isSearchingMap ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                          Search
                        </Button>
                      </div>

                      {/* Interactive Map */}
                      <div className="h-[260px] rounded-xl overflow-hidden border relative" style={{ borderColor: 'rgba(26,122,110,0.2)' }}>
                        <MapContainer 
                          center={[newListing.latitude || 7.2549, newListing.longitude || 80.5974]} 
                          zoom={newListing.latitude ? 15 : 13} 
                          style={{ height: '100%', width: '100%', zIndex: 0 }}
                        >
                          <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                          />
                          <MapController 
                            center={newListing.latitude && newListing.longitude ? [newListing.latitude, newListing.longitude] : undefined} 
                          />
                          <LocationPicker
                            position={newListing.latitude && newListing.longitude ? { lat: newListing.latitude, lng: newListing.longitude } : undefined}
                            setPosition={handleMapPositionChange}
                          />
                        </MapContainer>
                      </div>

                      {/* Pinned Coordinates Badge and Open in Google Maps Link */}
                      <div className="flex flex-wrap items-center justify-between text-xs gap-2 pt-1">
                        {newListing.latitude && newListing.longitude ? (
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              📍 Pinned: {newListing.latitude.toFixed(5)}, {newListing.longitude.toFixed(5)}
                            </span>
                            <span className="text-gray-400">• Drag marker to adjust</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">
                            Click on the map or drag the pin to set the exact coordinates.
                          </span>
                        )}

                        {newListing.latitude && newListing.longitude && (
                          <a
                            href={`https://www.google.com/maps?q=${newListing.latitude},${newListing.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-semibold text-teal-700 hover:text-teal-800 hover:underline"
                          >
                            <span>Open in Google Maps</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>

                      {/* Google Maps URL Field (Auto-populated from pin) */}
                      <div>
                        <Label htmlFor="map_url" className="text-xs text-gray-600">
                          Google Maps Link (Auto-generated from your pin)
                        </Label>
                        <Input 
                          id="map_url" 
                          placeholder="Auto-generated when you select or adjust location on the map"
                          value={newListing.map_url}
                          onChange={(e) => setNewListing({ ...newListing, map_url: e.target.value })}
                          className="text-xs mt-1" 
                        />
                      </div>
                    </div>

                    <Button onClick={handleSaveListing} className="w-full font-semibold" style={{ backgroundColor: '#1a7a6e', color: 'white', border: 'none' }}>
                      {isEditMode ? 'Save Changes' : 'Add Listing'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">

        {/* Navigation Tabs */}
        <div className="flex border-b mb-8 gap-2" style={{ borderColor: 'rgba(26,122,110,0.12)' }}>
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 px-6 text-sm font-semibold border-b-2 transition-all duration-200 ${
              activeTab === 'overview'
                ? 'text-teal-700 font-bold border-teal-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            style={activeTab === 'overview' ? { borderColor: '#1a7a6e', color: '#1a7a6e' } : {}}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('listings')}
            className={`pb-3 px-6 text-sm font-semibold border-b-2 transition-all duration-200 ${
              activeTab === 'listings'
                ? 'text-teal-700 font-bold border-teal-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            style={activeTab === 'listings' ? { borderColor: '#1a7a6e', color: '#1a7a6e' } : {}}
          >
            My Listings ({listings.length})
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`pb-3 px-6 text-sm font-semibold border-b-2 transition-all duration-200 ${
              activeTab === 'bookings'
                ? 'text-teal-700 font-bold border-teal-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            style={activeTab === 'bookings' ? { borderColor: '#1a7a6e', color: '#1a7a6e' } : {}}
          >
            Booking Requests ({bookings.length})
          </button>
        </div>

        {/* Overview Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {stats.map(({ label, value, icon: Icon, color, bg }) => (
                <Card key={label} className="shadow-sm border-0" style={{ border: '1px solid rgba(26,122,110,0.1)' }}>
                  <CardContent className="pt-5 pb-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm mb-1" style={{ color: '#5a7874' }}>{label}</p>
                        <p className="text-3xl font-bold" style={{ color, fontFamily: "'DM Serif Display', serif" }}>{value}</p>
                      </div>
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: bg }}>
                        <Icon className="w-6 h-6" style={{ color }} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Summary / Welcome Card */}
            <Card className="shadow-sm border-0 p-6" style={{ border: '1px solid rgba(26,122,110,0.1)', backgroundColor: 'white' }}>
              <h2 className="text-2xl font-normal mb-2" style={{ fontFamily: "'DM Serif Display', serif", color: '#0d1f1d' }}>
                Welcome to your dashboard
              </h2>
              <p className="text-sm text-gray-600 max-w-2xl mb-4">
                Here you can manage your active boarding place listings, track statistics, and review bookings requested by students.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => setActiveTab('listings')} style={{ backgroundColor: '#1a7a6e', color: 'white' }}>
                  Manage Listings
                </Button>
                <Button variant="outline" onClick={() => setActiveTab('bookings')} style={{ borderColor: 'rgba(26,122,110,0.25)', color: '#1a7a6e' }}>
                  View Bookings
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Booking Requests Tab Content */}
        {activeTab === 'bookings' && (
          <div>
            {bookings.length > 0 ? (
              <Card className="shadow-sm border-0 mb-8" style={{ border: '1px solid rgba(26,122,110,0.1)' }}>
                <CardHeader className="pb-4 border-b" style={{ borderColor: 'rgba(26,122,110,0.1)' }}>
                  <CardTitle style={{ fontFamily: "'DM Serif Display', serif", fontWeight: 400, fontSize: '22px', color: '#0d1f1d' }}>
                    Recent Booking Requests
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-gray-50 border-b" style={{ borderColor: 'rgba(26,122,110,0.1)' }}>
                        <tr>
                          <th className="px-6 py-4 font-medium text-gray-500">Student</th>
                          <th className="px-6 py-4 font-medium text-gray-500">Contact</th>
                          <th className="px-6 py-4 font-medium text-gray-500">Listing</th>
                          <th className="px-6 py-4 font-medium text-gray-500">Date</th>
                          <th className="px-6 py-4 font-medium text-gray-500">Status</th>
                          <th className="px-6 py-4 font-medium text-gray-500 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y" style={{ borderColor: 'rgba(26,122,110,0.1)' }}>
                        {bookings.map((booking) => (
                          <tr key={booking.request_id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 font-medium" style={{ color: '#0d1f1d' }}>{booking.student_name}</td>
                            <td className="px-6 py-4 text-gray-600">
                              <div>{booking.student_phone}</div>
                              <div className="text-xs text-gray-500">{booking.student_email}</div>
                            </td>
                            <td className="px-6 py-4" style={{ color: '#1a7a6e' }}>
                              <div className="font-semibold">{booking.title}</div>
                              {booking.address && (
                                <div className="text-xs text-gray-500 mt-0.5">{booking.address}</div>
                              )}
                              {(booking.latitude != null && booking.longitude != null && !isNaN(Number(booking.latitude)) && !isNaN(Number(booking.longitude))) ? (
                                <div className="w-32 h-20 overflow-hidden rounded-lg border mt-1.5 relative z-0">
                                  <MapContainer center={[Number(booking.latitude), Number(booking.longitude)]} zoom={13} style={{ height: '100%', width: '100%', zIndex: 0 }} zoomControl={false} dragging={false} scrollWheelZoom={false}>
                                    <TileLayer
                                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                                      url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                                    />
                                    <Marker position={[Number(booking.latitude), Number(booking.longitude)]} />
                                  </MapContainer>
                                </div>
                              ) : booking.map_url ? (
                                <div className="w-32 h-20 overflow-hidden rounded-lg border mt-1.5" dangerouslySetInnerHTML={{ __html: booking.map_url.replace(/width="\d+"/, 'width="100%"').replace(/height="\d+"/, 'height="100%"') }} />
                              ) : null}
                            </td>
                            <td className="px-6 py-4 text-gray-600">
                              {new Date(booking.request_date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0"
                                style={
                                  booking.status === 'pending' ? { backgroundColor: '#fdf0e8', color: '#e07b39' } :
                                  booking.status === 'approved' ? { backgroundColor: '#d8f3dc', color: '#1a5c30' } :
                                  { backgroundColor: '#fee2e2', color: '#991b1b' }
                                }>
                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              {booking.status === 'pending' ? (
                                <div className="flex justify-end gap-2">
                                  <Button size="sm" variant="outline" className="gap-1 h-8 text-xs bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 border-green-200" onClick={() => handleUpdateBookingStatus(booking.request_id, 'approved')}>
                                    <CheckCircle className="w-3.5 h-3.5" /> Approve
                                  </Button>
                                  <Button size="sm" variant="outline" className="gap-1 h-8 text-xs bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 border-red-200" onClick={() => handleUpdateBookingStatus(booking.request_id, 'rejected')}>
                                    <XCircle className="w-3.5 h-3.5" /> Reject
                                  </Button>
                                </div>
                              ) : (
                                <span className="text-xs text-gray-400">Resolved</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-sm border-0 p-16 text-center" style={{ border: '1px solid rgba(26,122,110,0.1)' }}>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#fdf0e8' }}>
                  <Calendar className="w-8 h-8" style={{ color: '#e07b39' }} />
                </div>
                <h3 className="font-semibold mb-1" style={{ color: '#0d1f1d' }}>No bookings yet</h3>
                <p className="text-sm" style={{ color: '#5a7874' }}>Any requests made by students will appear here.</p>
              </Card>
            )}
          </div>
        )}

        {/* Messages Tab Content */}
        {activeTab === 'messages' && (
          <div>
            {messages.length > 0 ? (
              <div className="space-y-4">
                {messages.map((msg) => (
                  <Card key={msg.message_id} className="shadow-sm border-0" style={{ border: '1px solid rgba(26,122,110,0.1)' }}>
                    <CardContent className="pt-5 pb-5">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0" style={{ backgroundColor: '#1a7a6e' }}>
                            {msg.sender_name ? msg.sender_name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <h3 className="font-semibold text-base" style={{ color: '#0d1f1d' }}>{msg.sender_name}</h3>
                            <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                              <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-teal-600" /> {msg.sender_email}</span>
                              {msg.stay_title && (
                                <span className="font-medium px-2 py-0.5 rounded" style={{ backgroundColor: '#e8f5f3', color: '#1a7a6e' }}>
                                  Listing: {msg.stay_title}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-gray-400 flex-shrink-0">
                          {new Date(msg.created_at).toLocaleString()}
                        </span>
                      </div>

                      <div className="p-4 rounded-xl text-sm leading-relaxed mb-3" style={{ backgroundColor: '#f7fafa', border: '1px solid rgba(26,122,110,0.08)', color: '#2b3e3c' }}>
                        {msg.message}
                      </div>

                      {/* Display Reply or Reply Input */}
                      {msg.reply_text ? (
                        <div className="p-4 rounded-xl text-sm leading-relaxed mt-3" style={{ backgroundColor: '#e8f5f3', border: '1px solid rgba(26,122,110,0.2)' }}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-xs text-teal-800 uppercase tracking-wider">Your Reply</span>
                            {msg.replied_at && (
                              <span className="text-[11px] text-teal-600">{new Date(msg.replied_at).toLocaleString()}</span>
                            )}
                          </div>
                          <p className="text-gray-800">{msg.reply_text}</p>
                        </div>
                      ) : replyingMessageId === msg.message_id ? (
                        <div className="mt-3 space-y-2">
                          <Textarea
                            placeholder="Type your reply here..."
                            rows={3}
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            className="w-full text-sm"
                          />
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => { setReplyingMessageId(null); setReplyText(''); }}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              style={{ backgroundColor: '#1a7a6e', color: 'white', border: 'none' }}
                              onClick={() => handleSendReply(msg.message_id)}
                              disabled={isSubmittingReply || !replyText.trim()}
                            >
                              {isSubmittingReply ? 'Sending...' : 'Send Reply'}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-3 flex justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1 text-xs"
                            style={{ borderColor: '#1a7a6e', color: '#1a7a6e' }}
                            onClick={() => { setReplyingMessageId(msg.message_id); setReplyText(''); }}
                          >
                            Reply to Student
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="shadow-sm border-0 p-16 text-center" style={{ border: '1px solid rgba(26,122,110,0.1)' }}>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#e8f5f3' }}>
                  <MessageSquare className="w-8 h-8" style={{ color: '#1a7a6e' }} />
                </div>
                <h3 className="font-semibold mb-1" style={{ color: '#0d1f1d' }}>No messages yet</h3>
                <p className="text-sm" style={{ color: '#5a7874' }}>Messages sent by students inquiring about your listings will appear here.</p>
              </Card>
            )}
          </div>
        )}

        {/* Listings Tab Content */}
        {activeTab === 'listings' && (
          <Card className="shadow-sm border-0" style={{ border: '1px solid rgba(26,122,110,0.1)' }}>
            <CardHeader className="pb-4">
              <CardTitle style={{ fontFamily: "'DM Serif Display', serif", fontWeight: 400, fontSize: '22px', color: '#0d1f1d' }}>
                Your Listings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {listings.map((listing) => (
                  <div key={listing.id} className="flex items-start gap-4 p-4 rounded-xl transition-shadow hover:shadow-md" style={{ border: '1px solid rgba(26,122,110,0.1)', backgroundColor: 'white' }}>
                    <div className="w-32 flex-shrink-0 flex flex-col gap-2">
                      <div className="w-full h-24 overflow-hidden rounded-xl">
                        <img src={listing.image_url || 'https://via.placeholder.com/150'} alt={listing.title} className="w-full h-full object-cover" />
                      </div>
                      {(listing.latitude != null && listing.longitude != null && !isNaN(Number(listing.latitude)) && !isNaN(Number(listing.longitude))) ? (
                        <div className="w-full h-24 overflow-hidden rounded-xl border">
                          <MapContainer center={[Number(listing.latitude), Number(listing.longitude)]} zoom={13} style={{ height: '100%', width: '100%', zIndex: 0 }} zoomControl={false} dragging={false} scrollWheelZoom={false}>
                            <TileLayer
                              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                            />
                            <Marker position={[Number(listing.latitude), Number(listing.longitude)]} />
                          </MapContainer>
                        </div>
                      ) : listing.map_url ? (
                        <div className="w-full h-24 overflow-hidden rounded-xl border" dangerouslySetInnerHTML={{ __html: listing.map_url.replace(/width="\d+"/, 'width="100%"').replace(/height="\d+"/, 'height="100%"') }} />
                      ) : null}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2 gap-2">
                        <div>
                          <h3 className="font-semibold" style={{ color: '#0d1f1d' }}>{listing.title}</h3>
                          <p className="text-sm" style={{ color: '#5a7874' }}>{listing.location}</p>
                        </div>
                        <span
                          className="px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0"
                          style={
                            listing.availability === 'Available'
                              ? { backgroundColor: '#d8f3dc', color: '#1a5c30' }
                              : { backgroundColor: '#eff6f5', color: '#5a7874' }
                          }
                        >
                          {listing.availability}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-4">
                        {[
                          { label: 'Price', value: `Rs. ${listing.price.toLocaleString()}/mo` },
                          { label: 'Room Type', value: listing.roomType },
                          { label: 'Gender', value: listing.gender },
                          { label: 'Rating', value: listing.rating > 0 ? `⭐ ${listing.rating.toFixed(1)}` : '⭐ New' },
                        ].map(({ label, value }) => (
                          <div key={label}>
                            <p className="text-xs mb-0.5" style={{ color: '#5a7874' }}>{label}</p>
                            <p className="font-semibold text-sm" style={{ color: '#0d1f1d' }}>{value}</p>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="gap-1.5 text-xs" style={{ borderColor: 'rgba(26,122,110,0.25)', color: '#1a7a6e' }} onClick={() => handleEdit(listing)}>
                          <Edit className="w-3.5 h-3.5" /> Edit
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1.5 text-xs" style={{ borderColor: 'rgba(212,24,61,0.25)', color: '#d4183d' }}
                          onClick={() => handleDelete(listing.id)}>
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {isLoading ? (
                  <div className="text-center py-16">
                    <p className="text-sm" style={{ color: '#5a7874' }}>Loading listings...</p>
                  </div>
                ) : listings.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#e8f5f3' }}>
                      <Home className="w-8 h-8" style={{ color: '#1a7a6e' }} />
                    </div>
                    <h3 className="font-semibold mb-1" style={{ color: '#0d1f1d' }}>No listings yet</h3>
                    <p className="text-sm" style={{ color: '#5a7874' }}>Click "Add Listing" to create your first listing</p>
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
