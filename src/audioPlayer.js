const {
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  VoiceConnectionStatus,
  entersState,
} = require('@discordjs/voice');
const https = require('https');
const GoogleDriveService = require('./googleDrive');

class AudioPlayerManager {
  constructor() {
    this.player = createAudioPlayer();
    this.driveService = new GoogleDriveService();
    this.playlist = [];
    this.currentIndex = 0;
    this.isPlaying = false;
    this.connection = null;
    this.streamTimeout = null;

    this.setupPlayerEvents();
  }

  setupPlayerEvents() {
    this.player.on(AudioPlayerStatus.Idle, () => {
      console.log('🔹 Player status: IDLE');
      if (this.isPlaying && this.currentIndex < this.playlist.length) {
        console.log('📀 Moving to next track...');
        this.playNext();
      } else if (this.isPlaying) {
        console.log('📀 Playlist finished, looping...');
        this.playNext();
      }
    });

    this.player.on(AudioPlayerStatus.Playing, () => {
      console.log('🔹 Player status: PLAYING ✅');
    });

    this.player.on(AudioPlayerStatus.Buffering, () => {
      console.log('🔹 Player status: BUFFERING...');
    });

    this.player.on(AudioPlayerStatus.Paused, () => {
      console.log('🔹 Player status: PAUSED');
    });

    this.player.on(AudioPlayerStatus.AutoPaused, () => {
      console.log('🔹 Player status: AUTO-PAUSED');
    });

    this.player.on('error', (error) => {
      console.error('❌ Audio player error:', error.message);
      console.error('Error details:', error);
      if (this.isPlaying) {
        console.log('⏭️  Skipping to next track due to error...');
        this.currentIndex++;
        setTimeout(() => this.playNext(), 2000);
      }
    });
  }

  async startStream(connection, durationMinutes) {
    this.connection = connection;
    this.isPlaying = true;
    this.currentIndex = 0;

    try {
      this.playlist = await this.driveService.getShuffledPlaylist();
      
      if (this.playlist.length === 0) {
        console.log('No songs available to play.');
        this.stopStream();
        return;
      }

      console.log(`Starting stream with ${this.playlist.length} songs (shuffled)`);
      console.log(`Stream will run for ${durationMinutes} minutes`);

      connection.subscribe(this.player);

      this.playNext();

      this.streamTimeout = setTimeout(() => {
        console.log(`Stream duration of ${durationMinutes} minutes reached. Stopping...`);
        this.stopStream();
      }, durationMinutes * 60 * 1000);

    } catch (error) {
      console.error('Error starting stream:', error.message);
      this.stopStream();
    }
  }

  async playNext() {
    if (!this.isPlaying || this.currentIndex >= this.playlist.length) {
      if (this.isPlaying) {
        console.log('Playlist ended, reshuffling...');
        this.playlist = this.driveService.shuffleArray(this.playlist);
        this.currentIndex = 0;
      } else {
        return;
      }
    }

    const song = this.playlist[this.currentIndex];
    console.log(`\n🎵 Playing (${this.currentIndex + 1}/${this.playlist.length}): ${song.name}`);

    try {
      console.log('📥 Fetching download URL from Google Drive...');
      const downloadUrl = await this.driveService.getDirectDownloadLink(song.id);
      console.log('✅ Download URL obtained');
      
      console.log('🌐 Fetching audio stream from URL...');
      const stream = await new Promise((resolve, reject) => {
        https.get(downloadUrl, (response) => {
          console.log(`📡 HTTP Response: ${response.statusCode}`);
          if (response.statusCode === 200) {
            console.log('✅ Stream acquired successfully');
            resolve(response);
          } else if (response.statusCode === 302 || response.statusCode === 301) {
            console.log(`🔄 Redirect to: ${response.headers.location}`);
            reject(new Error(`Redirect ${response.statusCode} - following...`));
          } else {
            reject(new Error(`HTTP ${response.statusCode}`));
          }
        }).on('error', (err) => {
          console.error('🔴 HTTPS error:', err.message);
          reject(err);
        });
      });

      console.log('🎧 Creating audio resource...');
      const resource = createAudioResource(stream, {
        inlineVolume: true,
      });

      console.log('🔊 Setting volume to 50%...');
      resource.volume.setVolume(0.5);
      
      console.log('▶️  Starting playback...');
      this.player.play(resource);
      this.currentIndex++;
      console.log('✅ Playback started!');
    } catch (error) {
      console.error(`❌ Error playing ${song.name}:`);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      this.currentIndex++;
      setTimeout(() => this.playNext(), 1000);
    }
  }

  stopStream() {
    this.isPlaying = false;
    
    if (this.streamTimeout) {
      clearTimeout(this.streamTimeout);
      this.streamTimeout = null;
    }

    this.player.stop();
    
    if (this.connection) {
      this.connection.destroy();
      this.connection = null;
    }

    console.log('Stream stopped.');
  }
}

module.exports = AudioPlayerManager;
