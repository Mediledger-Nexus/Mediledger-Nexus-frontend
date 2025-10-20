"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SessionManager } from "@/lib/session";
import { getAuditEvents, getAuditStats, AuditEvent, AuditFilter, AuditEventType } from "@/lib/auditTrail";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowLeft, 
  Activity, 
  Search, 
  Filter, 
  Download, 
  Eye,
  Shield,
  User,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Key,
  FileText,
  Brain
} from "lucide-react";

export default function AuditPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [filter, setFilter] = useState<AuditFilter>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);

  useEffect(() => {
    const userSession = SessionManager.getSession();
    if (!userSession || !SessionManager.isAuthenticated()) {
      router.push('/auth');
      return;
    }
    
    setSession(userSession);
    loadAuditData();
    setLoading(false);
  }, [router]);

  const loadAuditData = () => {
    const auditStats = getAuditStats();
    setStats(auditStats);
    
    const auditEvents = getAuditEventsForUser(session?.did);
    setEvents(auditEvents);
  };

  const getAuditEventsForUser = (userDid?: string): AuditEvent[] => {
    if (!userDid) return getAuditEvents();
    
    // Get events where user is the actor or involved in the resource
    const allEvents = getAuditEvents();
    return allEvents.filter(event => 
      event.actor.did === userDid ||
      event.metadata.patientDid === userDid ||
      event.metadata.doctorDid === userDid ||
      event.metadata.sharedWith === userDid
    );
  };

  const applyFilters = () => {
    const currentFilter: AuditFilter = {
      ...filter,
      searchTerm: searchTerm || undefined,
    };
    
    const filteredEvents = getAuditEvents(currentFilter);
    setEvents(filteredEvents);
  };

  const getEventIcon = (type: AuditEventType) => {
    switch (type) {
      case 'user_registration': return <User className="h-4 w-4 text-blue-400" />;
      case 'did_creation': return <Key className="h-4 w-4 text-purple-400" />;
      case 'consent_granted': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'consent_revoked': return <XCircle className="h-4 w-4 text-red-400" />;
      case 'consent_denied': return <XCircle className="h-4 w-4 text-orange-400" />;
      case 'record_created': return <FileText className="h-4 w-4 text-cyan-400" />;
      case 'record_accessed': return <Eye className="h-4 w-4 text-blue-400" />;
      case 'record_updated': return <FileText className="h-4 w-4 text-yellow-400" />;
      case 'record_deleted': return <FileText className="h-4 w-4 text-red-400" />;
      case 'record_shared': return <Shield className="h-4 w-4 text-purple-400" />;
      case 'ai_analysis': return <Brain className="h-4 w-4 text-pink-400" />;
      case 'wallet_connection': return <Key className="h-4 w-4 text-green-400" />;
      case 'emergency_access': return <AlertTriangle className="h-4 w-4 text-red-400" />;
      case 'system_event': return <Activity className="h-4 w-4 text-gray-400" />;
      case 'security_event': return <Shield className="h-4 w-4 text-red-400" />;
      default: return <Activity className="h-4 w-4 text-gray-400" />;
    }
  };

  const getEventColor = (type: AuditEventType) => {
    switch (type) {
      case 'consent_granted': return 'border-green-500/30 bg-green-900/20';
      case 'consent_revoked':
      case 'consent_denied':
      case 'record_deleted':
      case 'security_event': return 'border-red-500/30 bg-red-900/20';
      case 'emergency_access': return 'border-orange-500/30 bg-orange-900/20';
      case 'ai_analysis': return 'border-pink-500/30 bg-pink-900/20';
      case 'record_created':
      case 'record_updated': return 'border-cyan-500/30 bg-cyan-900/20';
      case 'record_accessed': return 'border-blue-500/30 bg-blue-900/20';
      default: return 'border-slate-500/30 bg-slate-900/20';
    }
  };

  const formatEventType = (type: AuditEventType) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading audit trail...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20" />
      
      <div className="relative z-10 container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard')}
              className="border-slate-600 text-gray-400 hover:bg-slate-700/50"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent flex items-center">
                <Activity className="mr-3 h-8 w-8" />
                Audit Trail
              </h1>
              <p className="text-gray-400 mt-2">Complete transparency of all platform activities</p>
            </div>
          </div>
          <Button
            onClick={() => {
              const auditData = getAuditEvents(filter);
              const blob = new Blob([JSON.stringify(auditData, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'mediledger-audit-trail.json';
              a.click();
            }}
            className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
          >
            <Download className="mr-2 h-4 w-4" />
            Export Audit
          </Button>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Events</p>
                    <p className="text-2xl font-bold text-white">{stats.totalEvents}</p>
                  </div>
                  <Activity className="h-8 w-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Recent Activity</p>
                    <p className="text-2xl font-bold text-green-400">{stats.recentActivity}</p>
                    <p className="text-xs text-gray-500">Last 24 hours</p>
                  </div>
                  <Clock className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Critical Events</p>
                    <p className="text-2xl font-bold text-red-400">{stats.criticalEvents}</p>
                    <p className="text-xs text-gray-500">Requires attention</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Your Events</p>
                    <p className="text-2xl font-bold text-cyan-400">{events.length}</p>
                    <p className="text-xs text-gray-500">Personal activity</p>
                  </div>
                  <User className="h-8 w-8 text-cyan-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="bg-slate-900/50 border-slate-700/50 mb-6">
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-slate-800/50 border-slate-600 text-white"
                  />
                </div>
              </div>

              <Select
                value={filter.types?.[0] || 'all'}
                onValueChange={(value) => 
                  setFilter({ ...filter, types: value === 'all' ? undefined : [value as AuditEventType] })
                }
              >
                <SelectTrigger className="w-48 bg-slate-800/50 border-slate-600 text-white">
                  <SelectValue placeholder="Event Type" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="user_registration">User Registration</SelectItem>
                  <SelectItem value="did_creation">DID Creation</SelectItem>
                  <SelectItem value="consent_granted">Consent Granted</SelectItem>
                  <SelectItem value="consent_revoked">Consent Revoked</SelectItem>
                  <SelectItem value="record_created">Record Created</SelectItem>
                  <SelectItem value="record_accessed">Record Accessed</SelectItem>
                  <SelectItem value="ai_analysis">AI Analysis</SelectItem>
                  <SelectItem value="emergency_access">Emergency Access</SelectItem>
                </SelectContent>
              </Select>

              <Button
                onClick={applyFilters}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Filter className="mr-2 h-4 w-4" />
                Apply Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Events List */}
        <div className="space-y-4">
          {events.length === 0 ? (
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardContent className="text-center py-12">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Audit Events Found</h3>
                <p className="text-gray-400">
                  {searchTerm || filter.types ? 'No events match your search criteria.' : 'No audit events have been recorded yet.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            events.map((event) => (
              <Card key={event.id} className={`bg-slate-900/50 border-slate-700/50 hover:border-slate-600/50 transition-colors ${getEventColor(event.type)}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        {getEventIcon(event.type)}
                        <h3 className="text-lg font-semibold text-white">{formatEventType(event.type)}</h3>
                        <Badge variant="outline" className="border-slate-600 text-gray-300">
                          {event.actor.role}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-300 mb-4">{event.action}</p>
                      
                      {event.resource && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-400 mb-1">Resource:</p>
                          <div className="bg-slate-800/50 rounded px-3 py-2">
                            <p className="text-white text-sm">
                              <span className="text-gray-400">{event.resource.type}:</span> {event.resource.id}
                            </p>
                            {event.resource.description && (
                              <p className="text-gray-300 text-xs mt-1">{event.resource.description}</p>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center space-x-6 text-sm text-gray-400">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(event.timestamp).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>{new Date(event.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4" />
                          <span>{event.actor.did.split(':')[3]}</span>
                        </div>
                        {event.hcsSequence && (
                          <div className="flex items-center space-x-2">
                            <Shield className="h-4 w-4" />
                            <span>HCS: {event.hcsSequence.slice(-8)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedEvent(event)}
                      className="border-slate-600 text-gray-300 hover:bg-slate-700/50"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Event Detail Modal */}
        {selectedEvent && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
            <Card className="bg-slate-900 border-slate-700 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center">
                    {getEventIcon(selectedEvent.type)}
                    <span className="ml-2">{formatEventType(selectedEvent.type)}</span>
                  </CardTitle>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedEvent(null)}
                    className="border-slate-600 text-gray-300"
                  >
                    ×
                  </Button>
                </div>
                <CardDescription className="text-gray-400">
                  {selectedEvent.action}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-white font-semibold mb-2">Event Details</h4>
                  <div className="bg-slate-800/50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Event ID:</span>
                      <span className="text-white font-mono text-sm">{selectedEvent.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Actor:</span>
                      <span className="text-white">{selectedEvent.actor.did}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Role:</span>
                      <span className="text-white capitalize">{selectedEvent.actor.role}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Network:</span>
                      <span className="text-white">{selectedEvent.network}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Timestamp:</span>
                      <span className="text-white">{new Date(selectedEvent.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {selectedEvent.resource && (
                  <div>
                    <h4 className="text-white font-semibold mb-2">Resource Information</h4>
                    <div className="bg-slate-800/50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Type:</span>
                        <span className="text-white">{selectedEvent.resource.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">ID:</span>
                        <span className="text-white font-mono text-sm">{selectedEvent.resource.id}</span>
                      </div>
                      {selectedEvent.resource.description && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Description:</span>
                          <span className="text-white">{selectedEvent.resource.description}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {Object.keys(selectedEvent.metadata).length > 0 && (
                  <div>
                    <h4 className="text-white font-semibold mb-2">Metadata</h4>
                    <div className="bg-slate-800/50 rounded-lg p-4">
                      <pre className="text-gray-300 text-sm overflow-x-auto">
                        {JSON.stringify(selectedEvent.metadata, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {selectedEvent.hcsSequence && (
                  <div>
                    <h4 className="text-white font-semibold mb-2">Blockchain Verification</h4>
                    <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-400" />
                        <span className="text-green-400 font-semibold">Verified on Hedera</span>
                      </div>
                      <p className="text-gray-300 text-sm mt-2">
                        HCS Sequence: <code className="text-green-300">{selectedEvent.hcsSequence}</code>
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}


