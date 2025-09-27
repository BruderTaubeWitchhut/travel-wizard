import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { 
  Users, 
  Plus, 
  Copy, 
  Check, 
  Vote,
  Share2,
  Loader2,
  UserPlus,
  Trophy,
  Clock,
  Activity,
  ChevronRight
} from 'lucide-react';

const GroupTravel = () => {
  const { currentUser } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [createGroupLoading, setCreateGroupLoading] = useState(false);
  const [joinGroupLoading, setJoinGroupLoading] = useState(false);

  // Form states
  const [newGroupName, setNewGroupName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [votes, setVotes] = useState([]);
  const [newActivity, setNewActivity] = useState('');

  // Fetch user groups
  const fetchGroups = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/groups/${currentUser.uid}`);
      if (response.ok) {
        const data = await response.json();
        setGroups(data);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch votes for selected group
  const fetchVotes = async (groupId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/groups/${groupId}/votes`);
      if (response.ok) {
        const data = await response.json();
        setVotes(data);
      }
    } catch (error) {
      console.error('Error fetching votes:', error);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      fetchVotes(selectedGroup.id);
      // Poll for vote updates every 5 seconds
      const interval = setInterval(() => fetchVotes(selectedGroup.id), 5000);
      return () => clearInterval(interval);
    }
  }, [selectedGroup]);

  const createGroup = async () => {
    if (!newGroupName.trim()) {
      toast.error('Please enter a group name');
      return;
    }

    setCreateGroupLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/groups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newGroupName,
          creator_id: currentUser.uid
        }),
      });

      if (response.ok) {
        const newGroup = await response.json();
        setGroups([...groups, newGroup]);
        setNewGroupName('');
        toast.success('Group created successfully!');
      } else {
        throw new Error('Failed to create group');
      }
    } catch (error) {
      toast.error('Failed to create group');
    } finally {
      setCreateGroupLoading(false);
    }
  };

  const joinGroup = async () => {
    if (!joinCode.trim()) {
      toast.error('Please enter a group code');
      return;
    }

    setJoinGroupLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/groups/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: joinCode,
          user_id: currentUser.uid
        }),
      });

      if (response.ok) {
        setJoinCode('');
        fetchGroups();
        toast.success('Joined group successfully!');
      } else {
        throw new Error('Group not found');
      }
    } catch (error) {
      toast.error('Failed to join group');
    } finally {
      setJoinGroupLoading(false);
    }
  };

  const voteForActivity = async (activityName) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/groups/${selectedGroup.id}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          group_id: selectedGroup.id,
          activity_name: activityName,
          user_id: currentUser.uid
        }),
      });

      if (response.ok) {
        fetchVotes(selectedGroup.id);
        toast.success('Vote recorded!');
      } else {
        throw new Error('Failed to vote');
      }
    } catch (error) {
      toast.error('Failed to record vote');
    }
  };

  const copyGroupCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Group code copied!');
  };

  const popularActivities = [
    "Visit local museums",
    "Try street food tours", 
    "Beach day activities",
    "Hiking and nature walks",
    "Shopping districts",
    "Nightlife exploration",
    "Cultural performances",
    "Adventure sports"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-medium mb-4">
            <Users className="h-4 w-4 mr-2" />
            Group Travel Planning
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Plan Together,
            <span className="block bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Travel Better
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Create travel groups, invite friends, vote on activities, and let AI help plan your perfect group itinerary
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Groups List */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm" data-testid="groups-panel">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Users className="h-5 w-5 mr-2" />
                  Your Groups
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Create/Join Group */}
                <Tabs defaultValue="create" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-lg">
                    <TabsTrigger 
                      value="create" 
                      className="rounded-md data-[state=active]:bg-white"
                      data-testid="create-group-tab"
                    >
                      Create
                    </TabsTrigger>
                    <TabsTrigger 
                      value="join" 
                      className="rounded-md data-[state=active]:bg-white"
                      data-testid="join-group-tab"
                    >
                      Join
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="create" className="space-y-3 mt-4">
                    <Input
                      placeholder="Group name (e.g., Bali Adventure 2024)"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      className="rounded-lg"
                      data-testid="group-name-input"
                    />
                    <Button
                      onClick={createGroup}
                      disabled={createGroupLoading}
                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-lg"
                      data-testid="create-group-btn"
                    >
                      {createGroupLoading ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</>
                      ) : (
                        <><Plus className="mr-2 h-4 w-4" /> Create Group</>
                      )}
                    </Button>
                  </TabsContent>
                  
                  <TabsContent value="join" className="space-y-3 mt-4">
                    <Input
                      placeholder="Enter group code (e.g., TW123ABC)"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                      className="rounded-lg"
                      data-testid="group-code-input"
                    />
                    <Button
                      onClick={joinGroup}
                      disabled={joinGroupLoading}
                      variant="outline"
                      className="w-full rounded-lg"
                      data-testid="join-group-btn"
                    >
                      {joinGroupLoading ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Joining...</>
                      ) : (
                        <><UserPlus className="mr-2 h-4 w-4" /> Join Group</>
                      )}
                    </Button>
                  </TabsContent>
                </Tabs>

                {/* Groups List */}
                <div className="space-y-3 pt-4 border-t">
                  {loading ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                    </div>
                  ) : groups.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No groups yet</p>
                      <p className="text-xs">Create or join a group to start</p>
                    </div>
                  ) : (
                    groups.map((group) => (
                      <div
                        key={group.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedGroup?.id === group.id
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50'
                        }`}
                        onClick={() => setSelectedGroup(group)}
                        data-testid={`group-item-${group.id}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-900">{group.name}</h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyGroupCode(group.code);
                            }}
                            className="p-1 h-auto"
                            data-testid={`copy-code-btn-${group.id}`}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="flex justify-between items-center">
                          <Badge variant="outline" className="text-xs">
                            {group.code}
                          </Badge>
                          <div className="flex items-center text-xs text-gray-500">
                            <Users className="h-3 w-3 mr-1" />
                            {group.members?.length || 0}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Group Details & Voting */}
          <div className="lg:col-span-2">
            {selectedGroup ? (
              <div className="space-y-6">
                {/* Group Info */}
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-2xl">{selectedGroup.name}</CardTitle>
                        <CardDescription className="flex items-center mt-2">
                          <Share2 className="h-4 w-4 mr-2" />
                          Group Code: <Badge className="ml-2">{selectedGroup.code}</Badge>
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center text-sm text-gray-500 mb-1">
                          <Users className="h-4 w-4 mr-1" />
                          {selectedGroup.members?.length || 0} members
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="h-4 w-4 mr-1" />
                          {votes.length} activities
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                {/* Activities Voting */}
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm" data-testid="voting-panel">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Vote className="h-5 w-5 mr-2 text-emerald-600" />
                      Activity Voting
                    </CardTitle>
                    <CardDescription>
                      Vote on activities for your group trip. Real-time results update automatically.
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    {/* Popular Activities */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Popular Activities:</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {popularActivities.map((activity, index) => {
                          const activityVote = votes.find(v => v.activity_name === activity);
                          const voteCount = activityVote?.votes?.length || 0;
                          const hasVoted = activityVote?.votes?.includes(currentUser.uid);
                          
                          return (
                            <Button
                              key={index}
                              variant={hasVoted ? "default" : "outline"}
                              size="sm"
                              onClick={() => voteForActivity(activity)}
                              className={`justify-between text-left h-auto p-3 ${
                                hasVoted 
                                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white' 
                                  : 'hover:border-emerald-300'
                              }`}
                              data-testid={`activity-vote-btn-${index}`}
                            >
                              <span className="text-sm">{activity}</span>
                              <div className="flex items-center">
                                {hasVoted && <Check className="h-3 w-3 mr-1" />}
                                <Badge 
                                  variant={hasVoted ? "secondary" : "outline"} 
                                  className={hasVoted ? "bg-white/20 text-white" : ""}
                                >
                                  {voteCount}
                                </Badge>
                              </div>
                            </Button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Vote Results */}
                    {votes.length > 0 && (
                      <div className="pt-6 border-t">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                          <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
                          Voting Results
                        </h3>
                        <div className="space-y-3" data-testid="vote-results">
                          {votes
                            .sort((a, b) => (b.votes?.length || 0) - (a.votes?.length || 0))
                            .map((vote, index) => {
                              const voteCount = vote.votes?.length || 0;
                              const maxVotes = Math.max(...votes.map(v => v.votes?.length || 0));
                              const percentage = maxVotes > 0 ? (voteCount / maxVotes) * 100 : 0;
                              
                              return (
                                <div key={vote.id} className="space-y-2">
                                  <div className="flex justify-between items-center">
                                    <span className="font-medium text-gray-900">
                                      {index === 0 && voteCount > 0 && (
                                        <Trophy className="h-4 w-4 inline mr-1 text-yellow-500" />
                                      )}
                                      {vote.activity_name}
                                    </span>
                                    <Badge variant="outline">
                                      {voteCount} vote{voteCount !== 1 ? 's' : ''}
                                    </Badge>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                      className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all duration-300"
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm h-96 flex items-center justify-center">
                <CardContent className="text-center">
                  <Activity className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <CardTitle className="text-xl text-gray-600 mb-2">
                    Select a Group
                  </CardTitle>
                  <CardDescription>
                    Choose a group from the sidebar to start voting on activities and planning your trip together.
                  </CardDescription>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupTravel;