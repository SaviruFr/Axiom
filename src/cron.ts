import cron from 'node-cron';
import { updatePhishingDatabase } from './tasks/updatePhishingDb';

// Run every 24 hours at midnight
cron.schedule('0 0 * * *', async () => {
  console.log('Starting scheduled phishing database update...');
  await updatePhishingDatabase();
});
