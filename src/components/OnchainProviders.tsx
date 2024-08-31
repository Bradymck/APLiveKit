'use client';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { base } from 'viem/chains';
import { WagmiProvider } from 'wagmi';
import { NEXT_PUBLIC_CDP_API_KEY } from '../config';
import { config } from '../wagmi';
import { LiveKitRoom } from '@livekit/components-react';
import { useEffect, useState } from 'react';
import { Room } from 'livekit-client';

const queryClient = new QueryClient();

type Props = { children: React.ReactNode };

function OnchainProviders({ children }: Props) {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    async function getToken() {
      try {
        const resp = await fetch('/api/get-participant-token');
        const data = await resp.json();
        setToken(data.token);
      } catch (e) {
        console.error(e);
      }
    }
    getToken();
  }, []);

  if (!token) {
    return <div>Getting token...</div>;
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider apiKey={NEXT_PUBLIC_CDP_API_KEY} chain={base}>
          <RainbowKitProvider modalSize="compact">
            <LiveKitRoom
              token={token}
              serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
              connect={true}
            >
              {children}
            </LiveKitRoom>
          </RainbowKitProvider>
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default OnchainProviders;
