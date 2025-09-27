"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Hospital, Search, User, MapPin } from "lucide-react";

export default function ProvidersPage() {
  const providers = [
    { id: 'doc-1', name: 'Dr. Sarah Chen', specialization: 'Cardiology', location: 'Lagos', verified: true },
    { id: 'doc-2', name: 'Dr. Adebayo Li', specialization: 'General Practice', location: 'Abuja', verified: true },
  ];

  return (
    <div className="p-6">
      <Card className="bg-slate-900/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Hospital className="h-5 w-5 text-purple-400" /> Doctors & Hospitals
          </CardTitle>
          <CardDescription className="text-gray-400">Find verified providers and share records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input placeholder="Find Hospital or Doctor" className="bg-slate-800/50 border-slate-600 text-white" />
            <Button className="bg-gradient-to-r from-purple-600 to-cyan-600"><Search className="h-4 w-4" /></Button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {providers.map(p => (
              <div key={p.id} className="p-4 rounded bg-slate-800/50 border border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white flex items-center gap-2">
                      <User className="h-4 w-4 text-cyan-400" /> {p.name}
                      <span className="text-xs text-green-400">{p.verified ? 'Verified' : ''}</span>
                    </div>
                    <div className="text-xs text-gray-400 flex items-center gap-1"><MapPin className="h-3 w-3" /> {p.location} • {p.specialization}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10" size="sm">View Profile</Button>
                    <Button variant="outline" className="border-green-400 text-green-400 hover:bg-green-400/10" size="sm">Request Appt</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
