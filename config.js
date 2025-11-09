require('dotenv').config();

module.exports = {
  discord: {
    token: process.env.DISCORD_TOKEN,
    guildId: process.env.GUILD_ID,
    voiceChannelId: process.env.VOICE_CHANNEL_ID,
  },
  googleDrive: {
    folderId: process.env.GOOGLE_DRIVE_FOLDER_ID,
    apiKey: process.env.GOOGLE_API_KEY,
  },
  schedule: {
    monday: process.env.SCHEDULE_MONDAY || '0 14 * * 1',
    tuesday: process.env.SCHEDULE_TUESDAY || '0 18 * * 2',
    wednesday: process.env.SCHEDULE_WEDNESDAY || '0 12 * * 3',
    thursday: process.env.SCHEDULE_THURSDAY || '0 16 * * 4',
    friday: process.env.SCHEDULE_FRIDAY || '0 20 * * 5',
    saturday: process.env.SCHEDULE_SATURDAY || '0 15 * * 6',
    sunday: process.env.SCHEDULE_SUNDAY || '0 17 * * 0',
  },
  streamDuration: parseInt(process.env.STREAM_DURATION) || 60,
};
