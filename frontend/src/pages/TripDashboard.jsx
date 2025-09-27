import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { 
  Plane, 
  Calendar, 
  MapPin, 
  Sun, 
  AlertCircle, 
  Package, 
  Plus,
  Loader2,
  MessageSquare,
  TrendingUp,
  Users,
  CheckCircle2,
  Clock,
  Activity,
  Globe,
  Camera,
  Star
} from 'lucide-react';

const TripDashboard = () => {
  const { currentUser } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [createBookingOpen, setCreateBookingOpen] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    destination: '',
    start_date: '',
    end_date: '',
    activities: []
  });

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/dashboard/${currentUser.uid}`);
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const createBooking = async () => {
    if (!bookingForm.destination || !bookingForm.start_date || !bookingForm.end_date) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...bookingForm,
          user_id: currentUser.uid,
          activities: bookingForm.activities.filter(a => a.trim())
        }),
      });

      if (response.ok) {
        setCreateBookingOpen(false);
        setBookingForm({ destination: '', start_date: '', end_date: '', activities: [] });
        fetchDashboardData();
        toast.success('Trip booking created successfully!');
      } else {
        throw new Error('Failed to create booking');
      }
    } catch (error) {
      toast.error('Failed to create booking');
    }
  };

  const addActivity = () => {
    setBookingForm({
      ...bookingForm,
      activities: [...bookingForm.activities, '']
    });
  };

  const updateActivity = (index, value) => {
    const newActivities = [...bookingForm.activities];
    newActivities[index] = value;
    setBookingForm({
      ...bookingForm,
      activities: newActivities
    });
  };

  const removeActivity = (index) => {
    const newActivities = bookingForm.activities.filter((_, i) => i !== index);
    setBookingForm({
      ...bookingForm,
      activities: newActivities
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Trip Dashboard
            </h1>
            <p className="text-gray-600">
              Manage your travels, get daily insights, and stay organized
            </p>
          </div>
          
          <Dialog open={createBookingOpen} onOpenChange={setCreateBookingOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 mt-4 sm:mt-0" data-testid="create-trip-btn">
                <Plus className="mr-2 h-4 w-4" />
                Create Trip
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md" data-testid="create-trip-dialog">
              <DialogHeader>
                <DialogTitle>Create New Trip</DialogTitle>
                <DialogDescription>
                  Add details for your upcoming travel booking
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="destination">Destination *</Label>
                  <Input
                    id="destination"
                    placeholder="e.g., Paris, France"
                    value={bookingForm.destination}
                    onChange={(e) => setBookingForm({...bookingForm, destination: e.target.value})}
                    data-testid="destination-input"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_date">Start Date *</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={bookingForm.start_date}
                      onChange={(e) => setBookingForm({...bookingForm, start_date: e.target.value})}
                      data-testid="start-date-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_date">End Date *</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={bookingForm.end_date}
                      onChange={(e) => setBookingForm({...bookingForm, end_date: e.target.value})}
                      data-testid="end-date-input"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Activities (Optional)</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addActivity} data-testid="add-activity-btn">
                      <Plus className="h-3 w-3 mr-1" />
                      Add
                    </Button>
                  </div>
                  {bookingForm.activities.map((activity, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="e.g., Visit Eiffel Tower"
                        value={activity}
                        onChange={(e) => updateActivity(index, e.target.value)}
                        data-testid={`activity-input-${index}`}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeActivity(index)}
                        className="px-2"
                        data-testid={`remove-activity-${index}`}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              
              <DialogFooter>
                <Button type="submit" onClick={createBooking} data-testid="create-booking-btn">
                  Create Booking
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Daily Digest */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm mb-6" data-testid="daily-digest-card">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Sun className="h-5 w-5 mr-2 text-yellow-500" />
                  Daily Digest
                </CardTitle>
                <CardDescription>Your travel updates for today</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Weather */}
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
                  <div className="flex items-center">
                    <Sun className="h-6 w-6 text-yellow-500 mr-3" />
                    <div>
                      <p className="font-semibold text-gray-900">Weather</p>
                      <p className="text-sm text-gray-600">{dashboardData?.daily_digest?.weather || 'Sunny, 25°C'}</p>
                    </div>
                  </div>
                </div>

                {/* Reminders */}
                <div className="space-y-2">
                  <div className="flex items-center">
                    <AlertCircle className="h-4 w-4 text-orange-500 mr-2" />
                    <span className="font-medium text-gray-900">Reminders</span>
                  </div>
                  {(dashboardData?.daily_digest?.reminders || []).map((reminder, index) => (
                    <div key={index} className="flex items-center p-2 bg-orange-50 rounded text-sm" data-testid={`reminder-${index}`}>
                      <CheckCircle2 className="h-4 w-4 text-orange-500 mr-2" />
                      {reminder}
                    </div>
                  ))}
                </div>

                {/* Packing Tips */}
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Package className="h-4 w-4 text-green-500 mr-2" />
                    <span className="font-medium text-gray-900">Packing Tips</span>
                  </div>
                  {(dashboardData?.daily_digest?.packing_tips || []).map((tip, index) => (
                    <div key={index} className="flex items-center p-2 bg-green-50 rounded text-sm" data-testid={`packing-tip-${index}`}>
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                      {tip}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm" data-testid="quick-stats-card">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <TrendingUp className="h-5 w-5 mr-2 text-indigo-500" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-indigo-600">
                      {dashboardData?.bookings?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Active Trips</div>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg">
                    <div className="text-2xl font-bold text-emerald-600">
                      {dashboardData?.groups?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Group Plans</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="bookings" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-sm p-1 rounded-xl shadow-lg">
                <TabsTrigger 
                  value="bookings" 
                  className="rounded-lg data-[state=active]:bg-indigo-500 data-[state=active]:text-white"
                  data-testid="bookings-tab"
                >
                  <Plane className="h-4 w-4 mr-2" />
                  My Trips
                </TabsTrigger>
                <TabsTrigger 
                  value="groups" 
                  className="rounded-lg data-[state=active]:bg-emerald-500 data-[state=active]:text-white"
                  data-testid="groups-tab"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Group Plans
                </TabsTrigger>
              </TabsList>

              {/* Bookings Tab */}
              <TabsContent value="bookings" className="space-y-4" data-testid="bookings-content">
                {(!dashboardData?.bookings || dashboardData.bookings.length === 0) ? (
                  <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                    <CardContent className="text-center py-12">
                      <Plane className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <CardTitle className="text-xl text-gray-600 mb-2">No Trips Yet</CardTitle>
                      <CardDescription className="mb-4">
                        Create your first trip booking to start tracking your travel plans
                      </CardDescription>
                      <Button 
                        onClick={() => setCreateBookingOpen(true)}
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Create Your First Trip
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4" data-testid="bookings-list">
                    {dashboardData.bookings.map((booking) => (
                      <Card key={booking.id} className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300" data-testid={`booking-${booking.id}`}>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="flex items-center text-xl">
                                <MapPin className="h-5 w-5 mr-2 text-indigo-500" />
                                {booking.destination}
                              </CardTitle>
                              <CardDescription className="flex items-center mt-1">
                                <Calendar className="h-4 w-4 mr-2" />
                                {booking.start_date} - {booking.end_date}
                              </CardDescription>
                            </div>
                            <Badge variant="outline" className="bg-indigo-50 text-indigo-700">
                              Active
                            </Badge>
                          </div>
                        </CardHeader>
                        
                        <CardContent>
                          {booking.activities && booking.activities.length > 0 && (
                            <div className="space-y-2">
                              <p className="font-medium text-gray-900 flex items-center">
                                <Activity className="h-4 w-4 mr-2" />
                                Planned Activities:
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {booking.activities.map((activity, index) => (
                                  <Badge key={index} variant="secondary" className="bg-purple-100 text-purple-700">
                                    {activity}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Groups Tab */}
              <TabsContent value="groups" className="space-y-4" data-testid="groups-content">
                {(!dashboardData?.groups || dashboardData.groups.length === 0) ? (
                  <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                    <CardContent className="text-center py-12">
                      <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <CardTitle className="text-xl text-gray-600 mb-2">No Group Plans</CardTitle>
                      <CardDescription className="mb-4">
                        Join or create travel groups to plan trips with friends
                      </CardDescription>
                      <Button 
                        onClick={() => window.location.href = '/group-travel'}
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                      >
                        <Users className="mr-2 h-4 w-4" />
                        Explore Group Travel
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4" data-testid="groups-list">
                    {dashboardData.groups.map((group) => (
                      <Card key={group.id} className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300" data-testid={`group-${group.id}`}>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="flex items-center text-xl">
                                <Users className="h-5 w-5 mr-2 text-emerald-500" />
                                {group.name}
                              </CardTitle>
                              <CardDescription className="mt-1">
                                Group Code: <Badge variant="outline">{group.code}</Badge>
                              </CardDescription>
                            </div>
                            <div className="text-right">
                              <Badge className="bg-emerald-100 text-emerald-700">
                                {group.members?.length || 0} members
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        
                        <CardContent>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">
                              Created {new Date(group.created_at).toLocaleDateString()}
                            </span>
                            <Button variant="outline" size="sm">
                              View Group
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripDashboard;