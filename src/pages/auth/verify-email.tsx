/**
 * Email Verification Page
 * Verifies email and allows user to set password
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle2, XCircle, Lock } from 'lucide-react';
import { verifyEmail, setPassword } from '@/services/auth.service';
import { toast } from 'sonner';

export default function VerifyEmailPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  
  const [isVerifying, setIsVerifying] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState('');
  const [password, setPasswordValue] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSettingPassword, setIsSettingPassword] = useState(false);

  useEffect(() => {
    if (token) {
      handleVerification();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleVerification = async () => {
    try {
      await verifyEmail(token!);
      setIsVerified(true);
      toast.success('Email verified successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Verification failed';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setIsSettingPassword(true);

    try {
      await setPassword({ token: token!, password });
      toast.success('Password set successfully! You can now log in.');
      navigate('/login');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to set password';
      toast.error(errorMessage);
    } finally {
      setIsSettingPassword(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Email Verification</CardTitle>
          <CardDescription>
            {isVerifying ? 'Verifying your email...' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isVerifying && (
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">Please wait...</p>
            </div>
          )}

          {!isVerifying && error && (
            <div className="flex flex-col items-center space-y-4">
              <XCircle className="h-12 w-12 text-destructive" />
              <div className="text-center">
                <p className="font-medium text-destructive">Verification Failed</p>
                <p className="text-sm text-muted-foreground mt-2">{error}</p>
              </div>
              <Button onClick={() => navigate('/login')} className="mt-4">
                Go to Login
              </Button>
            </div>
          )}

          {!isVerifying && isVerified && (
            <div className="space-y-6">
              <div className="flex flex-col items-center space-y-4">
                <CheckCircle2 className="h-12 w-12 text-green-500" />
                <div className="text-center">
                  <p className="font-medium text-green-600">Email Verified!</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Now set your password to complete account setup
                  </p>
                </div>
              </div>

              <form onSubmit={handleSetPassword} className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPasswordValue(e.target.value)}
                      className="pl-10"
                      required
                      minLength={8}
                      disabled={isSettingPassword}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    At least 8 characters with uppercase, lowercase, and number
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10"
                      required
                      disabled={isSettingPassword}
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSettingPassword}
                >
                  {isSettingPassword ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Setting Password...
                    </>
                  ) : (
                    'Set Password & Continue'
                  )}
                </Button>
              </form>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
