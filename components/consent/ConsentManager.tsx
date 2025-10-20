"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Shield, 
  Clock, 
  UserCheck, 
  UserX, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Calendar,
  Key,
  Eye,
  FileText
} from "lucide-react";
import { 
  getPatientConsents, 
  getPendingConsentRequests, 
  grantConsent, 
  revokeConsent, 
  denyConsentRequest,
  checkExpiredConsents,
  getAuditTrail,
  ConsentGrant,
  ConsentRequest
} from "@/lib/consentManager";
import { SessionManager } from "@/lib/session";

export function ConsentManager() {
  const [activeConsents, setActiveConsents] = useState<ConsentGrant[]>([]);
  const [pendingRequests, setPendingRequests] = useState<ConsentRequest[]>([]);
  const [auditTrail, setAuditTrail] = useState<any[]>([]);
  const [selectedConsent, setSelectedConsent] = useState<ConsentGrant | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<ConsentRequest | null>(null);
  const [showRevokeDialog, setShowRevokeDialog] = useState(false);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [customExpiryDays, setCustomExpiryDays] = useState(30);
  const [denyReason, setDenyReason] = useState("");
  const session = SessionManager.getSession();

  useEffect(() => {
    loadConsentData();
    // Check for expired consents
    checkExpiredConsents();
  }, []);

  const loadConsentData = () => {
    if (!session?.did) return;

    const consents = getPatientConsents(session.did);
    const requests = getPendingConsentRequests(session.did);
    const audit = getAuditTrail(session.did);

    setActiveConsents(consents);
    setPendingRequests(requests);
    setAuditTrail(audit);
  };

  const handleGrantConsent = async (requestId: string) => {
    try {
      await grantConsent(requestId, session.did, customExpiryDays);
      loadConsentData();
      setShowRequestDialog(false);
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error granting consent:', error);
    }
  };

  const handleDenyConsent = async (requestId: string) => {
    try {
      await denyConsentRequest(requestId, session.did, denyReason);
      loadConsentData();
      setShowRequestDialog(false);
      setSelectedRequest(null);
      setDenyReason("");
    } catch (error) {
      console.error('Error denying consent:', error);
    }
  };

  const handleRevokeConsent = async (consentId: string) => {
    try {
      await revokeConsent(consentId, session.did);
      loadConsentData();
      setShowRevokeDialog(false);
      setSelectedConsent(null);
    } catch (error) {
      console.error('Error revoking consent:', error);
    }
  };

  const getPermissionIcon = (permission: string) => {
    switch (permission) {
      case 'read_records': return <Eye className="h-4 w-4" />;
      case 'write_notes': return <FileText className="h-4 w-4" />;
      case 'prescribe_medication': return <Key className="h-4 w-4" />;
      case 'view_history': return <Calendar className="h-4 w-4" />;
      case 'emergency_access': return <AlertTriangle className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const getPermissionColor = (permission: string) => {
    switch (permission) {
      case 'read_records': return 'bg-blue-600';
      case 'write_notes': return 'bg-green-600';
      case 'prescribe_medication': return 'bg-purple-600';
      case 'view_history': return 'bg-orange-600';
      case 'emergency_access': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const formatExpiryDate = (dateString?: string) => {
    if (!dateString) return 'No expiry';
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Expired';
    if (diffDays === 0) return 'Expires today';
    if (diffDays === 1) return 'Expires tomorrow';
    return `Expires in ${diffDays} days`;
  };

  const getExpiryColor = (dateString?: string) => {
    if (!dateString) return 'text-gray-400';
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'text-red-400';
    if (diffDays <= 3) return 'text-yellow-400';
    if (diffDays <= 7) return 'text-orange-400';
    return 'text-green-400';
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="active" className="space-y-6">
        <TabsList className="bg-slate-900/50 border-slate-700/50">
          <TabsTrigger value="active">Active Consents</TabsTrigger>
          <TabsTrigger value="requests">Pending Requests</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Active Consents</h3>
            <Badge variant="outline" className="border-green-400 text-green-400">
              {activeConsents.length} Active
            </Badge>
          </div>

          {activeConsents.length === 0 ? (
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardContent className="text-center py-12">
                <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">No active consents found</p>
                <p className="text-gray-500 text-sm">Doctors will need your permission to access your records</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {activeConsents.map((consent) => (
                <Card key={consent.id} className="bg-slate-900/50 border-slate-700/50">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h4 className="text-lg font-semibold text-white">Dr. {consent.doctorDid.split(':')[3]}</h4>
                          <Badge variant="outline" className="border-green-400 text-green-400">
                            Active
                          </Badge>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center space-x-2 text-sm text-gray-400">
                            <Calendar className="h-4 w-4" />
                            <span>Granted: {new Date(consent.grantedAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm">
                            <Clock className="h-4 w-4" />
                            <span className={getExpiryColor(consent.expiresAt)}>
                              {formatExpiryDate(consent.expiresAt)}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm text-gray-300 font-medium">Permissions:</p>
                          <div className="flex flex-wrap gap-2">
                            {consent.permissions.map((permission, index) => (
                              <Badge 
                                key={index} 
                                className={`${getPermissionColor(permission.type)} text-white`}
                              >
                                <span className="flex items-center space-x-1">
                                  {getPermissionIcon(permission.type)}
                                  <span>{permission.type.replace('_', ' ')}</span>
                                </span>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedConsent(consent);
                            setShowRevokeDialog(true);
                          }}
                          className="border-red-400 text-red-400 hover:bg-red-400/10"
                        >
                          <UserX className="h-4 w-4 mr-2" />
                          Revoke
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Pending Requests</h3>
            <Badge variant="outline" className="border-yellow-400 text-yellow-400">
              {pendingRequests.length} Pending
            </Badge>
          </div>

          {pendingRequests.length === 0 ? (
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardContent className="text-center py-12">
                <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">No pending consent requests</p>
                <p className="text-gray-500 text-sm">Doctors will appear here when they request access</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <Card key={request.id} className="bg-slate-900/50 border-slate-700/50">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h4 className="text-lg font-semibold text-white">Dr. {request.doctorDid.split(':')[3]}</h4>
                          <Badge variant="outline" className="border-yellow-400 text-yellow-400">
                            Pending
                          </Badge>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center space-x-2 text-sm text-gray-400">
                            <Calendar className="h-4 w-4" />
                            <span>Requested: {new Date(request.requestDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-400">
                            <Clock className="h-4 w-4" />
                            <span>Expires in: {request.expiryDays} days</span>
                          </div>
                          {request.message && (
                            <p className="text-sm text-gray-300 mt-2 italic">"{request.message}"</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm text-gray-300 font-medium">Requested Permissions:</p>
                          <div className="flex flex-wrap gap-2">
                            {request.requestedPermissions.map((permission, index) => (
                              <Badge 
                                key={index} 
                                className={`${getPermissionColor(permission.type)} text-white`}
                              >
                                <span className="flex items-center space-x-1">
                                  {getPermissionIcon(permission.type)}
                                  <span>{permission.type.replace('_', ' ')}</span>
                                </span>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowRequestDialog(true);
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Review
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Audit Trail</h3>
            <Badge variant="outline" className="border-cyan-400 text-cyan-400">
              {auditTrail.length} Events
            </Badge>
          </div>

          <div className="space-y-3">
            {auditTrail.map((audit, index) => (
              <Card key={index} className="bg-slate-900/50 border-slate-700/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Badge 
                          variant="outline" 
                          className={`border-${audit.action.includes('grant') ? 'green' : audit.action.includes('deny') || audit.action.includes('revoke') ? 'red' : 'blue'}-400 text-${audit.action.includes('grant') ? 'green' : audit.action.includes('deny') || audit.action.includes('revoke') ? 'red' : 'blue'}-400`}
                        >
                          {audit.action.replace(/_/g, ' ')}
                        </Badge>
                        <span className="text-sm text-gray-400">
                          {new Date(audit.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm">
                        {audit.action.includes('grant') && 'Consent granted to doctor'}
                        {audit.action.includes('deny') && 'Consent request denied'}
                        {audit.action.includes('revoke') && 'Consent revoked'}
                        {audit.action.includes('request') && 'New consent request received'}
                        {audit.action.includes('expire') && 'Consent expired'}
                      </p>
                    </div>
                    {audit.hcsSequence && (
                      <Badge variant="outline" className="border-cyan-400 text-cyan-400">
                        HCS: {audit.hcsSequence.slice(-8)}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Revoke Consent Dialog */}
      <Dialog open={showRevokeDialog} onOpenChange={setShowRevokeDialog}>
        <DialogContent className="bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Revoke Consent</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to revoke this doctor's access to your medical records?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRevokeDialog(false)}
              className="border-slate-600 text-gray-300"
            >
              Cancel
            </Button>
            <Button
              onClick={() => selectedConsent && handleRevokeConsent(selectedConsent.id)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <UserX className="h-4 w-4 mr-2" />
              Revoke Access
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Request Dialog */}
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent className="bg-slate-900 border-slate-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Review Consent Request</DialogTitle>
            <DialogDescription className="text-gray-400">
              A doctor is requesting access to your medical records. Please review the details and decide.
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-white">Doctor</Label>
                  <p className="text-gray-300">Dr. {selectedRequest.doctorDid.split(':')[3]}</p>
                </div>

                <div>
                  <Label className="text-white">Requested Permissions</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedRequest.requestedPermissions.map((permission, index) => (
                      <Badge 
                        key={index} 
                        className={`${getPermissionColor(permission.type)} text-white`}
                      >
                        <span className="flex items-center space-x-1">
                          {getPermissionIcon(permission.type)}
                          <span>{permission.type.replace('_', ' ')}</span>
                        </span>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="expiryDays" className="text-white">Consent Duration (Days)</Label>
                  <Input
                    id="expiryDays"
                    type="number"
                    min="1"
                    max="365"
                    value={customExpiryDays}
                    onChange={(e) => setCustomExpiryDays(parseInt(e.target.value))}
                    className="bg-slate-800 border-slate-600 text-white mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="denyReason" className="text-white">Reason for Denial (if denying)</Label>
                  <Textarea
                    id="denyReason"
                    placeholder="Optional reason for denying access..."
                    value={denyReason}
                    onChange={(e) => setDenyReason(e.target.value)}
                    className="bg-slate-800 border-slate-600 text-white mt-1"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowRequestDialog(false)}
                  className="border-slate-600 text-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleDenyConsent(selectedRequest.id)}
                  variant="outline"
                  className="border-red-400 text-red-400 hover:bg-red-400/10"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Deny
                </Button>
                <Button
                  onClick={() => handleGrantConsent(selectedRequest.id)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Grant Access
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
