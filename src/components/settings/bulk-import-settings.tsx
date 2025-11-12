import { useAutomatedEmailAccounts } from "@/hooks/useEmailAccounts";
import type { EmailAccount } from "@/hooks/useEmailAccounts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Download, Calendar, AlertCircle, CheckCircle, Info } from "lucide-react";
import { useState } from "react";
import { API_BASE_URL } from "@/config/api";

const API_URL = API_BASE_URL; // API_BASE_URL already includes /api

interface BulkImportResult {
  success: boolean;
  totalEmails: number;
  processed: number;
  applicationsCreated: number;
  skipped: number;
  errors: number;
  message?: string;
}

export function BulkImportSettings() {
  const { data: emailAccounts, loading: accountsLoading } = useAutomatedEmailAccounts();
  
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [maxEmails, setMaxEmails] = useState<number>(500);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<BulkImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Calculate suggested date range (8 months ago to today)
  const getSuggestedDates = () => {
    const today = new Date();
    const eightMonthsAgo = new Date();
    eightMonthsAgo.setMonth(today.getMonth() - 8);
    
    return {
      start: eightMonthsAgo.toISOString().split('T')[0],
      end: today.toISOString().split('T')[0]
    };
  };

  const handleSetSuggestedDates = () => {
    const dates = getSuggestedDates();
    setStartDate(dates.start);
    setEndDate(dates.end);
  };

  const handleBulkImport = async () => {
    // Validation
    if (!selectedAccountId) {
      setError("Please select an email account");
      return;
    }
    if (!startDate || !endDate) {
      setError("Please select both start and end dates");
      return;
    }
    if (new Date(startDate) >= new Date(endDate)) {
      setError("Start date must be before end date");
      return;
    }
    if (maxEmails < 1 || maxEmails > 2000) {
      setError("Max emails must be between 1 and 2000");
      return;
    }

    setError(null);
    setImportResult(null);
    setIsImporting(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/emails/automation/bulk-import`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            accountId: selectedAccountId,
            startDate,
            endDate,
            maxEmails
          })
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to perform bulk import");
      }

      setImportResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to perform bulk import");
    } finally {
      setIsImporting(false);
    }
  };

  const calculateProgress = () => {
    if (!importResult) return 0;
    if (importResult.totalEmails === 0) return 100;
    return (importResult.processed / importResult.totalEmails) * 100;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Bulk Historic Email Import
          </CardTitle>
          <CardDescription>
            Process historical emails from the past 8-12 months to import candidate applications.
            This is a one-time operation that uses the same validation as regular email automation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Information Alert */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>How it works:</strong> This tool fetches emails from the selected date range
              and processes them as if they came through regular email automation. It will:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Skip emails that are replies to existing threads</li>
                <li>Check for duplicate applications (by email address)</li>
                <li>Upload resume and video files to cloud storage</li>
                <li>Parse resumes using AI</li>
                <li>Create applications with source marked as "email_automation"</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Email Account Selection */}
          <div className="space-y-2">
            <Label htmlFor="email-account">Email Account</Label>
            <Select
              value={selectedAccountId}
              onValueChange={setSelectedAccountId}
              disabled={accountsLoading || isImporting}
            >
              <SelectTrigger id="email-account">
                <SelectValue placeholder="Select an email account" />
              </SelectTrigger>
              <SelectContent>
                {emailAccounts.map((account: EmailAccount) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.email} - {account.displayName || "N/A"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {emailAccounts.length === 0 && !accountsLoading && (
              <p className="text-xs text-muted-foreground">
                No automated email accounts found. Add one in the Email Monitoring tab.
              </p>
            )}
          </div>

          {/* Date Range Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Start Date
              </Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={isImporting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                End Date
              </Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={isImporting}
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSetSuggestedDates}
              disabled={isImporting}
            >
              Use Last 8 Months
            </Button>
            <p className="text-xs text-muted-foreground">
              (Recommended: {getSuggestedDates().start} to {getSuggestedDates().end})
            </p>
          </div>

          {/* Max Emails */}
          <div className="space-y-2">
            <Label htmlFor="max-emails">Maximum Emails to Process</Label>
            <Input
              id="max-emails"
              type="number"
              min={1}
              max={2000}
              value={maxEmails}
              onChange={(e) => setMaxEmails(parseInt(e.target.value) || 500)}
              disabled={isImporting}
            />
            <p className="text-xs text-muted-foreground">
              Limit the number of emails to process in this batch (1-2000). Default: 500
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Progress Display */}
          {isImporting && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Processing emails...</span>
                <span className="font-medium">Please wait</span>
              </div>
              <Progress value={100} className="animate-pulse" />
              <p className="text-xs text-muted-foreground text-center">
                This may take several minutes depending on the number of emails.
              </p>
            </div>
          )}

          {/* Results Display */}
          {importResult && !isImporting && (
            <Alert variant={importResult.success ? "default" : "destructive"}>
              {importResult.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-semibold">
                    {importResult.success ? "Import Completed" : "Import Failed"}
                  </p>
                  {importResult.message && (
                    <p className="text-sm">{importResult.message}</p>
                  )}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-3 text-sm">
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-xs">Total Emails</p>
                      <p className="font-semibold text-lg">{importResult.totalEmails}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-xs">Processed</p>
                      <p className="font-semibold text-lg">{importResult.processed}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-xs">Created</p>
                      <p className="font-semibold text-lg text-green-600">
                        {importResult.applicationsCreated}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-xs">Skipped</p>
                      <p className="font-semibold text-lg text-yellow-600">
                        {importResult.skipped}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-xs">Errors</p>
                      <p className="font-semibold text-lg text-red-600">
                        {importResult.errors}
                      </p>
                    </div>
                  </div>
                  {importResult.processed > 0 && (
                    <Progress value={calculateProgress()} className="mt-3" />
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Action Button */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {selectedAccountId && startDate && endDate && (
                <p>
                  Ready to import from{" "}
                  <span className="font-medium">
                    {emailAccounts.find((a: EmailAccount) => a.id === selectedAccountId)?.email}
                  </span>
                </p>
              )}
            </div>
            <Button
              onClick={handleBulkImport}
              disabled={!selectedAccountId || !startDate || !endDate || isImporting}
              className="min-w-[200px]"
            >
              {isImporting ? (
                <>Processing...</>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Start Bulk Import
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Warning Card */}
      <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
        <CardHeader>
          <CardTitle className="text-yellow-800 dark:text-yellow-300 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Important Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-yellow-900 dark:text-yellow-200">
          <ul className="list-disc list-inside space-y-1">
            <li>This is a <strong>one-time batch operation</strong>, not a recurring job</li>
            <li>Only processes <strong>application emails</strong>, skips replies to existing threads</li>
            <li>Duplicate applications (same email) will be automatically skipped</li>
            <li>Large imports may take several minutes to complete</li>
            <li>All imported applications will have source marked as "email_automation"</li>
            <li>Files (resumes/videos) will be uploaded to cloud storage</li>
            <li>AI parsing will be performed on all resumes</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
