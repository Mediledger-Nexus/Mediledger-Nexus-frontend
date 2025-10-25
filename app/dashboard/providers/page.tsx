"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Hospital, Search, User, MapPin, Phone, Star, Clock, AlertTriangle, Video, MessageCircle, Shield } from "lucide-react";

// Mock data for doctors and hospitals
const doctors = [
  { id: 'doc-1', name: 'Dr. Sarah Chen', specialization: 'Cardiology', experience: '12 years', hospital: 'Lagos General', languages: 'English, Yoruba', consultation: 'Virtual/In-Person', location: { lat: 6.5244, lng: 3.3792 }, rating: 4.8, verified: true, availability: 'Available Now' },
  { id: 'doc-2', name: 'Dr. Adebayo Li', specialization: 'General Practice', experience: '8 years', hospital: 'Abuja Medical Center', languages: 'English, Hausa', consultation: 'In-Person', location: { lat: 9.0765, lng: 8.6753 }, rating: 4.6, verified: true, availability: 'In Consultation' },
  { id: 'doc-3', name: 'Dr. Maria Santos', specialization: 'Neurology', experience: '15 years', hospital: 'International Clinic', languages: 'English, Spanish', consultation: 'Virtual', location: { lat: 6.4654, lng: 3.4064 }, rating: 4.9, verified: true, availability: 'Offline' },
];

const hospitals = [
  { id: 'hosp-1', name: 'Lagos General Hospital', specialty: 'Cardiology, Emergency', location: { lat: 6.5244, lng: 3.3792 }, departments: ['Cardiology', 'Emergency', 'Surgery'], hours: '24/7', insurance: 'NHIS, Private', labs: true, pharmacy: true },
  { id: 'hosp-2', name: 'Abuja Medical Center', specialty: 'General, Pediatrics', location: { lat: 9.0765, lng: 8.6753 }, departments: ['General Medicine', 'Pediatrics'], hours: '8AM-8PM', insurance: 'NHIS', labs: true, pharmacy: false },
];

// Simple world map URL for react-simple-maps
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@1/countries-110m.json";

export default function ProvidersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [emergencyMode, setEmergencyMode] = useState(false);

  // AI-powered matching
  useEffect(() => {
    const generateSuggestion = async () => {
      if (searchQuery) {
        try {
          const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: "llama3-70b-8192",
              messages: [{
                role: "system",
                content: "You are Léa, a health assistant. Suggest the best doctor based on symptoms or needs. Keep it concise."
              }, {
                role: "user",
                content: `Based on "${searchQuery}", suggest a doctor from: ${doctors.map(d => `${d.name} (${d.specialization})`).join(', ')}.`
              }],
              temperature: 0.7
            })
          });

          if (response.ok) {
            const data = await response.json();
            setAiSuggestion(data.choices[0]?.message?.content || 'No suggestions available.');
          } else {
            setAiSuggestion('AI suggestions unavailable. Please try searching manually.');
          }
        } catch (error) {
          setAiSuggestion('AI suggestions unavailable. Please try searching manually.');
        }
      }
    };
    generateSuggestion();
  }, [searchQuery]);

  const filteredDoctors = doctors.filter(d =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.specialization.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredHospitals = hospitals.filter(h =>
    h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.specialty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Emergency Quick Action */}
      <Card className="bg-red-900/20 border-red-700/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-red-400" />
              <div>
                <p className="text-white font-medium">Emergency? Get Help Now</p>
                <p className="text-red-300 text-sm">Connect to nearest hospital instantly</p>
              </div>
            </div>
            <Button className="bg-red-600 hover:bg-red-700" onClick={() => setEmergencyMode(!emergencyMode)}>
              {emergencyMode ? 'Cancel Emergency' : 'Emergency Call'}
            </Button>
          </div>
          {emergencyMode && (
            <div className="mt-4 p-3 bg-red-800/30 rounded">
              <p className="text-white">Calling nearest emergency services... Ambulance en route (ETA: 10-15 min)</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="directory" className="space-y-4">
        <TabsList className="bg-slate-800/50">
          <TabsTrigger value="directory">Doctor Directory</TabsTrigger>
          <TabsTrigger value="map">Hospital Map</TabsTrigger>
          <TabsTrigger value="ai-matching">AI Matching</TabsTrigger>
          <TabsTrigger value="collaboration">Collaboration</TabsTrigger>
        </TabsList>

        <TabsContent value="directory" className="space-y-4">
          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Search className="h-5 w-5 text-purple-400" /> Verified Doctor Directory
              </CardTitle>
              <CardDescription className="text-gray-400">Search and connect with on-chain verified doctors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-6">
                <Input
                  placeholder="Search by name, specialization, or location"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-slate-800/50 border-slate-600 text-white"
                />
                <Button className="bg-gradient-to-r from-purple-600 to-cyan-600">
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              {aiSuggestion && (
                <Card className="bg-cyan-900/20 border-cyan-700/50 mb-4">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4 text-cyan-400" />
                      <span className="text-cyan-400 font-medium">AI Recommendation</span>
                    </div>
                    <p className="text-white">{aiSuggestion}</p>
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDoctors.map(d => (
                  <Card key={d.id} className="bg-slate-800/50 border-slate-700/50 hover:border-purple-500/50 transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <User className="h-5 w-5 text-cyan-400" />
                          <span className="text-white font-semibold">{d.name}</span>
                          <Badge className="bg-green-500/20 text-green-400">Verified</Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-400 fill-current" />
                          <span className="text-xs text-gray-400">{d.rating}</span>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <p className="text-gray-400">Specialization: <span className="text-white">{d.specialization}</span></p>
                        <p className="text-gray-400">Experience: <span className="text-white">{d.experience}</span></p>
                        <p className="text-gray-400">Hospital: <span className="text-white">{d.hospital}</span></p>
                        <p className="text-gray-400">Languages: <span className="text-white">{d.languages}</span></p>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-400">{d.availability}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10" size="sm">View Profile</Button>
                        <Button variant="outline" className="border-green-400 text-green-400 hover:bg-green-400/10" size="sm">Book Appointment</Button>
                        <Button variant="outline" className="border-purple-400 text-purple-400 hover:bg-purple-400/10" size="sm">
                          <Video className="h-3 w-3 mr-1" /> Call
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Hospital Details Section */}
          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Hospital className="h-5 w-5 text-purple-400" /> Hospital Service Overview
              </CardTitle>
              <CardDescription className="text-gray-400">Detailed information about partnered hospitals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredHospitals.map(h => (
                  <Card key={h.id} className="bg-slate-800/50 border-slate-700/50">
                    <CardContent className="p-4">
                      <h3 className="text-white font-semibold mb-2">{h.name}</h3>
                      <p className="text-gray-400 text-sm mb-3">{h.specialty}</p>
                      <div className="space-y-2 text-sm">
                        <p className="text-gray-400">Departments: <span className="text-white">{h.departments.join(', ')}</span></p>
                        <p className="text-gray-400">Hours: <span className="text-white">{h.hours}</span></p>
                        <p className="text-gray-400">Insurance: <span className="text-white">{h.insurance}</span></p>
                        <div className="flex gap-2">
                          <Badge className={h.labs ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                            {h.labs ? 'On-Site Labs' : 'No Labs'}
                          </Badge>
                          <Badge className={h.pharmacy ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                            {h.pharmacy ? 'Pharmacy' : 'No Pharmacy'}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10" size="sm">View Details</Button>
                        <Button variant="outline" className="border-green-400 text-green-400 hover:bg-green-400/10" size="sm">Book Visit</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Appointment Booking Section */}
          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Clock className="h-5 w-5 text-purple-400" /> Appointment Booking System
              </CardTitle>
              <CardDescription className="text-gray-400">Schedule appointments with real-time availability</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <h3 className="text-white font-medium">Quick Book</h3>
                  <div className="space-y-2">
                    <Input placeholder="Select Doctor" className="bg-slate-800/50 border-slate-600 text-white" />
                    <Input type="date" className="bg-slate-800/50 border-slate-600 text-white" />
                    <Input placeholder="Preferred Time" className="bg-slate-800/50 border-slate-600 text-white" />
                  </div>
                  <Button className="bg-gradient-to-r from-green-600 to-blue-600">Book Appointment</Button>
                </div>
                <div className="space-y-4">
                  <h3 className="text-white font-medium">Availability Indicators</h3>
                  <div className="space-y-2">
                    {doctors.map(d => (
                      <div key={d.id} className="flex items-center justify-between p-2 bg-slate-800/50 rounded">
                        <span className="text-white text-sm">{d.name}</span>
                        <Badge className={`text-xs ${d.availability === 'Available Now' ? 'bg-green-500/20 text-green-400' : d.availability === 'In Consultation' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                          {d.availability}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feedback System */}
          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Star className="h-5 w-5 text-purple-400" /> Feedback & Report System
              </CardTitle>
              <CardDescription className="text-gray-400">Leave reviews and report issues</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input placeholder="Select Doctor or Hospital" className="bg-slate-800/50 border-slate-600 text-white" />
                  <Button variant="outline" className="border-yellow-400 text-yellow-400 hover:bg-yellow-400/10">Rate</Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-slate-800/50 border-slate-700/50">
                    <CardContent className="p-4">
                      <h3 className="text-white font-medium mb-2">Leave Review</h3>
                      <div className="flex gap-1 mb-3">
                        {[1,2,3,4,5].map(i => (
                          <Star key={i} className="h-4 w-4 text-yellow-400 fill-current cursor-pointer" />
                        ))}
                      </div>
                      <Input placeholder="Your review..." className="bg-slate-800/50 border-slate-600 text-white mb-2" />
                      <Button className="bg-gradient-to-r from-yellow-600 to-orange-600">Submit Review</Button>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-800/50 border-slate-700/50">
                    <CardContent className="p-4">
                      <h3 className="text-white font-medium mb-2">Report Issue</h3>
                      <Input placeholder="Describe the issue..." className="bg-slate-800/50 border-slate-600 text-white mb-2" />
                      <Button variant="outline" className="border-red-400 text-red-400 hover:bg-red-400/10">Report</Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="map" className="space-y-4">
          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <MapPin className="h-5 w-5 text-purple-400" /> Hospital Network Map
              </CardTitle>
              <CardDescription className="text-gray-400">Interactive map of partnered hospitals with filters</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Input placeholder="Filter by specialty or location" className="bg-slate-800/50 border-slate-600 text-white" />
                <Button className="bg-gradient-to-r from-purple-600 to-cyan-600">Filter</Button>
              </div>
              <div className="h-[400px] md:h-[500px] bg-slate-800/50 rounded border border-slate-700/50 overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6d1Xp4Z1z4z6Xz8&q=Nigeria&zoom=6"
                  className="w-full h-full"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-matching" className="space-y-4">
          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-400" /> AI-Powered Doctor Matching
              </CardTitle>
              <CardDescription className="text-gray-400">Get personalized recommendations based on your health data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-cyan-900/20 border border-cyan-700/50 rounded">
                  <h3 className="text-cyan-400 font-medium mb-2">Based on your search: "{searchQuery}"</h3>
                  <p className="text-white">{aiSuggestion || 'Enter a search term to get AI suggestions.'}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredDoctors.slice(0, 3).map(d => (
                    <Card key={d.id} className="bg-slate-800/50 border-slate-700/50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-4 w-4 text-cyan-400" />
                          <span className="text-white font-semibold">{d.name}</span>
                          <Badge className="bg-green-500/20 text-green-400">Match</Badge>
                        </div>
                        <p className="text-gray-400 text-sm">{d.specialization} • {d.experience}</p>
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" variant="outline" className="border-cyan-400 text-cyan-400">Connect Now</Button>
                          <Button size="sm" variant="outline" className="border-purple-400 text-purple-400">
                            <MessageCircle className="h-3 w-3 mr-1" /> Chat
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Secure Communication Section */}
                <Card className="bg-slate-900/50 border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <MessageCircle className="h-5 w-5 text-purple-400" /> Secure Communication Channel
                    </CardTitle>
                    <CardDescription className="text-gray-400">Encrypted chat and video calls with NFT-based consent</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <Input placeholder="Select Doctor to Chat" className="bg-slate-800/50 border-slate-600 text-white" />
                        <Button className="bg-gradient-to-r from-purple-600 to-pink-600">Start Chat</Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="bg-slate-800/50 border-slate-700/50">
                          <CardContent className="p-4">
                            <h3 className="text-white font-medium mb-2">Video Call</h3>
                            <p className="text-gray-400 text-sm mb-3">Secure telemedicine sessions</p>
                            <Button variant="outline" className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10">
                              <Video className="h-3 w-3 mr-1" /> Start Video
                            </Button>
                          </CardContent>
                        </Card>
                        <Card className="bg-slate-800/50 border-slate-700/50">
                          <CardContent className="p-4">
                            <h3 className="text-white font-medium mb-2">Share Records</h3>
                            <p className="text-gray-400 text-sm mb-3">Via NFT-based consent</p>
                            <Button variant="outline" className="border-green-400 text-green-400 hover:bg-green-400/10">
                              <Shield className="h-3 w-3 mr-1" /> Share Securely
                            </Button>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="collaboration" className="space-y-4">
          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-purple-400" /> Medical Collaboration Tools
              </CardTitle>
              <CardDescription className="text-gray-400">Collaborate with multiple doctors on patient cases</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-slate-800/50 border-slate-700/50">
                    <CardContent className="p-4">
                      <h3 className="text-white font-medium mb-2">Cross-Border Consultation</h3>
                      <p className="text-gray-400 text-sm mb-3">Connect with international specialists</p>
                      <div className="space-y-2">
                        <Input placeholder="Specialty Needed" className="bg-slate-800/50 border-slate-600 text-white" />
                        <Input placeholder="Preferred Country" className="bg-slate-800/50 border-slate-600 text-white" />
                      </div>
                      <Button className="mt-3 bg-gradient-to-r from-blue-600 to-purple-600">Find Specialists</Button>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-800/50 border-slate-700/50">
                    <CardContent className="p-4">
                      <h3 className="text-white font-medium mb-2">Multi-Doctor Collaboration</h3>
                      <p className="text-gray-400 text-sm mb-3">On-chain case collaboration</p>
                      <div className="space-y-2">
                        <Input placeholder="Case ID" className="bg-slate-800/50 border-slate-600 text-white" />
                        <Input placeholder="Invite Doctor DID" className="bg-slate-800/50 border-slate-600 text-white" />
                      </div>
                      <Button className="mt-3 bg-gradient-to-r from-green-600 to-blue-600">Invite to Collaborate</Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Emergency Contact Section */}
                <Card className="bg-red-900/20 border-red-700/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="h-6 w-6 text-red-400" />
                        <div>
                          <p className="text-white font-medium">Emergency Contact System</p>
                          <p className="text-red-300 text-sm">Quick access to emergency services</p>
                        </div>
                      </div>
                      <Button className="bg-red-600 hover:bg-red-700" onClick={() => setEmergencyMode(!emergencyMode)}>
                        {emergencyMode ? 'Cancel Emergency' : 'Emergency Help'}
                      </Button>
                    </div>
                    {emergencyMode && (
                      <div className="mt-4 p-3 bg-red-800/30 rounded">
                        <p className="text-white">Emergency services notified. Ambulance en route (ETA: 5-10 min)</p>
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" variant="outline" className="border-cyan-400 text-cyan-400">Call Hospital</Button>
                          <Button size="sm" variant="outline" className="border-purple-400 text-purple-400">Share Location</Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
