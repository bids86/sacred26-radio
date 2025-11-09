const { google } = require('googleapis');
const config = require('../config');

class GoogleDriveService {
  constructor() {
    this.drive = google.drive({
      version: 'v3',
      auth: config.googleDrive.apiKey,
    });
  }

  async listMP3Files() {
    try {
      const response = await this.drive.files.list({
        q: `'${config.googleDrive.folderId}' in parents and mimeType='audio/mpeg' and trashed=false`,
        fields: 'files(id, name, webContentLink)',
        orderBy: 'name',
      });

      const files = response.data.files;
      if (!files || files.length === 0) {
        console.log('No MP3 files found in the Google Drive folder.');
        return [];
      }

      console.log(`Found ${files.length} MP3 files in Google Drive.`);
      return files;
    } catch (error) {
      console.error('Error fetching files from Google Drive:', error.message);
      throw error;
    }
  }

  async getDirectDownloadLink(fileId) {
    try {
      const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${config.googleDrive.apiKey}`;
      return url;
    } catch (error) {
      console.error('Error generating download link:', error.message);
      throw error;
    }
  }

  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  async getShuffledPlaylist() {
    const files = await this.listMP3Files();
    return this.shuffleArray(files);
  }
}

module.exports = GoogleDriveService;
