import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmailTemplatesSettings } from "@/components/settings/email-templates-settings";
import { EmailMonitoringSettings } from "@/components/settings/email-monitoring-settings";
import { Settings, Mail, Activity } from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("email-templates");

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Settings className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Settings</h2>
                  <p className="text-muted-foreground">
                    Manage your application settings and preferences
                  </p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="h-11 p-1 bg-card border border-border w-fit">
                <TabsTrigger 
                  value="email-templates" 
                  className="px-6 data-[state=active]:bg-primary data-[state=active]:!text-white data-[state=inactive]:text-muted-foreground"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email Templates
                </TabsTrigger>
                <TabsTrigger 
                  value="email-monitoring" 
                  className="px-6 data-[state=active]:bg-primary data-[state=active]:!text-white data-[state=inactive]:text-muted-foreground"
                >
                  <Activity className="h-4 w-4 mr-2" />
                  Email Monitoring
                </TabsTrigger>
              </TabsList>

              <TabsContent value="email-templates" className="mt-6">
                <EmailTemplatesSettings />
              </TabsContent>

              <TabsContent value="email-monitoring" className="mt-6">
                <EmailMonitoringSettings />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
