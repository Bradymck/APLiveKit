'use client';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base, baseSepolia } from 'viem/chains';
import { NEXT_PUBLIC_WC_PROJECT_ID } from './config';

export const config = getDefaultConfig({
  appName: 'onchainkit',
  projectId: NEXT_PUBLIC_WC_PROJECT_ID || 'f7de8b298cd5be2d5e002dcbcb554f2e',
  chains: [base, baseSepolia],
  ssr: true,
});