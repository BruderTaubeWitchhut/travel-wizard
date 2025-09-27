import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { 
  Search, 
  Upload, 
  Sparkles, 
  MapPin, 
  Heart, 
  Loader2,
  Camera,
  Type,
  Smile
} from 'lucide-react';

const MoodDiscovery = () => {
  const { currentUser } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputType, setInputType] = useState('text'); // text, emoji, image

  const handleSearch = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter your mood or preferences');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/mood-discovery`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          user_id: currentUser.uid
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get suggestions');
      }

      const data = await response.json();
      setDestinations(data);
    } catch (error) {
      console.error('Mood discovery error:', error);
      toast.error('Failed to get destination suggestions');
    } finally {
      setLoading(false);
    }
  };

  const suggestionPrompts = [
    { text: "I want adventure and thrill 🎢", emoji: "🏔️" },
    { text: "Looking for peaceful relaxation 🧘‍♀️", emoji: "🏝️" },
    { text: "Interested in culture and history 🏛️", emoji: "🎭" },
    { text: "Beach vibes and sunset 🌅", emoji: "🏖️" },
    { text: "Mountain hiking adventure 🥾", emoji: "⛰️" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4 mr-2" />
            Mood-Based Discovery
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Discover Your Perfect
            <span className="block bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Travel Destination
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Tell us your mood, upload an image, or share emojis - our AI will suggest destinations that match your vibe perfectly
          </p>
        </div>

        {/* Input Methods */}
        <Card className="mb-8 border-0 shadow-xl bg-white/80 backdrop-blur-sm" data-testid="mood-input-card">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <Heart className="h-6 w-6 mr-3 text-pink-500" />
              How are you feeling about your next trip?
            </CardTitle>
            <CardDescription>
              Express your travel mood in your preferred way
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Input Type Selector */}
            <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-fit">
              <Button
                variant={inputType === 'text' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setInputType('text')}
                className="rounded-lg"
                data-testid="text-input-btn"
              >
                <Type className="h-4 w-4 mr-2" />
                Text
              </Button>
              <Button
                variant={inputType === 'emoji' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setInputType('emoji')}
                className="rounded-lg"
                data-testid="emoji-input-btn"
              >
                <Smile className="h-4 w-4 mr-2" />
                Emojis
              </Button>
              <Button
                variant={inputType === 'image' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setInputType('image')}
                className="rounded-lg"
                data-testid="image-input-btn"
              >
                <Camera className="h-4 w-4 mr-2" />
                Image
              </Button>
            </div>

            {/* Text/Emoji Input */}
            {(inputType === 'text' || inputType === 'emoji') && (
              <div className="space-y-4">
                <Textarea
                  placeholder={
                    inputType === 'text' 
                      ? "Describe your ideal travel mood... (e.g., I want to relax on beautiful beaches and enjoy spa treatments)"
                      : "Express your mood with emojis... (e.g., 🏖️😎🌅🧘‍♀️)"
                  }
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-24 text-lg rounded-xl border-gray-200 focus:border-pink-500"
                  data-testid="mood-input-textarea"
                />
                
                {/* Quick Suggestions */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Quick suggestions:</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestionPrompts.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => setPrompt(suggestion.text)}
                        className="rounded-full text-sm hover:bg-pink-50 hover:border-pink-300"
                        data-testid={`suggestion-btn-${index}`}
                      >
                        {suggestion.emoji} {suggestion.text}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Image Upload */}
            {inputType === 'image' && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-pink-400 transition-colors">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg text-gray-600 mb-2">Upload an image that represents your mood</p>
                  <p className="text-sm text-gray-500">JPG, PNG up to 10MB</p>
                  <Button variant="outline" className="mt-4" data-testid="upload-image-btn">
                    <Camera className="h-4 w-4 mr-2" />
                    Choose Image
                  </Button>
                </div>
                <Input
                  placeholder="Or describe the image you uploaded..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="rounded-xl border-gray-200 focus:border-pink-500"
                  data-testid="image-description-input"
                />
              </div>
            )}

            {/* Search Button */}
            <Button
              onClick={handleSearch}
              disabled={loading || !prompt.trim()}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-lg py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              data-testid="discover-destinations-btn"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Discovering destinations...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-5 w-5" />
                  Discover Destinations
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {destinations.length > 0 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Perfect Matches for Your Mood
              </h2>
              <p className="text-gray-600">
                Based on your preferences, here are our top recommendations
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="destinations-grid">
              {destinations.map((destination, index) => (
                <Card 
                  key={index} 
                  className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
                  data-testid={`destination-card-${index}`}
                >
                  <div className="relative">
                    <img
                      src={destination.image_url}
                      alt={destination.name}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <h3 className="text-xl font-bold text-white flex items-center">
                        <MapPin className="h-5 w-5 mr-2" />
                        {destination.name}
                      </h3>
                    </div>
                  </div>
                  
                  <CardContent className="p-6">
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {destination.description}
                    </p>
                    
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-gray-700">Why it matches your mood:</p>
                      <div className="flex flex-wrap gap-2">
                        {destination.reasons.map((reason, reasonIndex) => (
                          <Badge 
                            key={reasonIndex} 
                            variant="secondary"
                            className="bg-pink-100 text-pink-700 hover:bg-pink-200"
                          >
                            {reason}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full mt-4 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl"
                      data-testid={`learn-more-btn-${index}`}
                    >
                      Learn More
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MoodDiscovery;