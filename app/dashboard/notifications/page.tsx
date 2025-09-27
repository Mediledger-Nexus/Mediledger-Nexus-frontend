"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Calendar, Shield, FileText, Bot } from "lucide-react";
import { useDemoNotifications } from "@/lib/demoStore";

export default function NotificationsPage() {
  const notifications = useDemoNotifications();

  return (
    <div className="p-6">
      <Card className="bg-slate-900/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Bell className="h-5 w-5 text-yellow-400" /> Notifications
          </CardTitle>
          <CardDescription className="text-gray-400">Alerts for records, appointments, AI reminders, and security</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {notifications.map(n => (
              <div key={n.id} className="flex items-start gap-3 p-3 rounded bg-slate-800/50 border border-slate-700/50">
                {n.type === 'appointment' ? (
                  <Calendar className="h-4 w-4 mt-1 text-yellow-400" />
                ) : n.type === 'security' ? (
                  <Shield className="h-4 w-4 mt-1 text-red-400" />
                ) : n.type === 'ai' ? (
                  <Bot className="h-4 w-4 mt-1 text-[#00FF9D]" />
                ) : (
                  <FileText className="h-4 w-4 mt-1 text-cyan-400" />
                )}
                <div>
                  <div className="text-white text-sm">{n.text}</div>
                  <div className="text-xs text-gray-400">{n.time}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
