
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

import apiClient from '../client';

const INSTALLATION_ID_KEY = 'appInstallationId';

async function getInstallationId(): Promise<string> {
  let installationId = await SecureStore.getItemAsync(
    INSTALLATION_ID_KEY
  );

  if (!installationId) {
    installationId = Crypto.randomUUID();

    await SecureStore.setItemAsync(
      INSTALLATION_ID_KEY,
      installationId
    );
  }

  return installationId;
}

export async function registerInstallation(): Promise<void> {
  try {
    const installationId = await getInstallationId();

    await apiClient.post('/api/app-installations/register', {
      installation_id: installationId,
      platform: Platform.OS,
      app_version: Constants.expoConfig?.version ?? '1.0.0',
    });
  } catch (error) {
    console.error('Installation registration failed:', error);
  }
}
