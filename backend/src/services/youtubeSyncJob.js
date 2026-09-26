import cron from 'node-cron';
import {
  syncVideosToDatabase,
  syncAudiosToDatabase,
} from '../services/youtubeService.js';

cron.schedule( //'0 6,18 * * *', ,
  '0 6,18 * * *',
  async () => {
    
    try {
      await syncVideosToDatabase();
      await syncAudiosToDatabase();
      console.log('YouTube synchronization completed successfully.');
    } catch (error) {
      console.error('YouTube synchronization failed:', error);
    }
  },
  {
    timezone: 'Europe/Berlin',
  }
);