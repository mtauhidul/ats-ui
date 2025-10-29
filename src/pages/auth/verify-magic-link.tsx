/**
 * Magic Link Verify Page
 * Automatically verifies magic link and logs user in
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { verifyMagicLink } from '@/services/auth.service';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import * as authUtils from '@/lib/auth-utils';

export default function VerifyMagicLinkPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { refreshToken } = useAuth();
  
  const [isVerifying, setIsVerifying] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (token) {
      handleVerification();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleVerification = async () => {
    try {
      const response = await verifyMagicLink(token!);
      
      // Save tokens
      if (response.data.accessToken) {
        authUtils.setAccessToken(response.data.accessToken);
      }
      if (response.data.refreshToken) {
        authUtils.setRefreshToken(response.data.refreshToken);
      }

      setIsSuccess(true);
      toast.success('Logged in successfully!');
      
      // Refresh auth context
      await refreshToken();
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Invalid or expired magic link';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Magic Link Verification</CardTitle>
        </CardHeader>
        <CardContent>
          {isVerifying && (
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">Verifying your magic link...</p>
            </div>
          )}

          {!isVerifying && error && (
            <div className="flex flex-col items-center space-y-4">
              <XCircle className="h-12 w-12 text-destructive" />
              <div className="text-center">
                <p className="font-medium text-destructive">Verification Failed</p>
                <p className="text-sm text-muted-foreground mt-2">{error}</p>
              </div>
              <Button onClick={() => navigate('/magic-link')} className="mt-4">
                Request New Magic Link
              </Button>
            </div>
          )}

          {!isVerifying && isSuccess && (
            <div className="flex flex-col items-center space-y-4">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
              <div className="text-center">
                <p className="font-medium text-green-600">Success!</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Redirecting to dashboard...
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
