import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import apiConnectService from '../../../utils/apiConnectService';
import { getProviderById } from '../../../utils/apiProviders';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('Processing your authorization...');
  const [providerName, setProviderName] = useState<string>('');

  useEffect(() => {
    const processOAuthCallback = async () => {
      try {
        // Get URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const providerId = urlParams.get('provider_id');
        const error = urlParams.get('error');

        // Check for errors
        if (error) {
          setStatus('error');
          setMessage(`Authorization failed: ${error}`);
          return;
        }

        // Validate required parameters
        if (!code || !providerId) {
          setStatus('error');
          setMessage('Missing required parameters');
          return;
        }

        // Get provider details
        const provider = getProviderById(providerId);
        if (!provider) {
          setStatus('error');
          setMessage('Unknown provider');
          return;
        }

        setProviderName(provider.name);

        // Complete OAuth flow
        const tokenResponse = await apiConnectService.completeOAuth(
          provider,
          code
        );

        // Create a new connection
        const connection = apiConnectService.createConnection({
          providerId: provider.id,
          userId: 'user-123', // In a real app, this would be the actual user ID
          name: `${provider.name} Connection`,
          status: 'active',
          credentials: {
            accessToken: tokenResponse.accessToken,
            refreshToken: tokenResponse.refreshToken,
            expiresIn: tokenResponse.expiresIn,
            tokenType: tokenResponse.tokenType,
            scope: tokenResponse.scope,
            receivedAt: tokenResponse.receivedAt
          }
        });

        // Success
        setStatus('success');
        setMessage(`Successfully connected to ${provider.name}`);
        
        // Notify parent window if this is in a popup
        if (window.opener) {
          window.opener.postMessage({
            type: 'oauth-success',
            providerId: provider.id,
            connectionId: connection.id
          }, window.location.origin);
        }

        // Redirect after a short delay
        setTimeout(() => {
          navigate('/api-mcp');
        }, 3000);
      } catch (error) {
        console.error('OAuth callback error:', error);
        setStatus('error');
        setMessage('Failed to complete authorization. Please try again.');
      }
    };

    processOAuthCallback();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle className="text-center">
            {status === 'loading' && 'Authorizing...'}
            {status === 'success' && 'Authorization Successful'}
            {status === 'error' && 'Authorization Failed'}
          </CardTitle>
          <CardDescription className="text-center">
            {providerName ? `Connecting to ${providerName}` : 'Connecting to service'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-6">
          {status === 'loading' && (
            <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />
          )}
          {status === 'success' && (
            <CheckCircle className="h-16 w-16 text-green-500" />
          )}
          {status === 'error' && (
            <XCircle className="h-16 w-16 text-red-500" />
          )}
          <p className="mt-4 text-center text-gray-600">{message}</p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button 
            variant={status === 'error' ? 'default' : 'outline'} 
            onClick={() => navigate('/api-mcp')}
          >
            {status === 'error' ? 'Try Again' : 'Return to Connections'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
