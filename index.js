const { Client, GatewayIntentBits, Events } = require('discord.js');
const {
  joinVoiceChannel,
  VoiceConnectionStatus,
  entersState,
} = require('@discordjs/voice');
const cron = require('node-cron');
const config = require('./config');
const AudioPlayerManager = require('./src/audioPlayer');

class RadioBot {
  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
      ],
    });

    this.audioManager = new AudioPlayerManager();
    this.setupEventHandlers();
    this.scheduleStreams();
  }

  setupEventHandlers() {
    this.client.once(Events.ClientReady, () => {
      console.log(`✅ Sacred26 Radio is online!`);
      console.log(`Logged in as: ${this.client.user.tag}`);
      console.log(`Connected to guild: ${this.client.guilds.cache.first()?.name || 'Unknown'}`);
      console.log('---');
      console.log('📅 Scheduled streams:');
      Object.entries(config.schedule).forEach(([day, cronTime]) => {
        console.log(`  ${day.charAt(0).toUpperCase() + day.slice(1)}: ${cronTime}`);
      });
      console.log('---');
    });

    this.client.on(Events.InteractionCreate, async (interaction) => {
      if (!interaction.isChatInputCommand()) return;

      if (interaction.commandName === 'radiotest') {
        await interaction.reply({ 
          content: '🎵 Starting stream...', 
          flags: 64 
        }).catch(e => console.error('Failed to reply to interaction:', e));
        
        console.log(`\n🧪 Manual test stream triggered by ${interaction.user.tag}`);
        
        this.startRadioStream().catch(error => {
          console.error('Error starting stream:', error.message);
        });
      }
    });

    this.client.on('error', (error) => {
      console.error('Discord client error:', error);
    });
  }

  scheduleStreams() {
    Object.entries(config.schedule).forEach(([day, cronExpression]) => {
      if (cron.validate(cronExpression)) {
        cron.schedule(cronExpression, () => {
          console.log(`\n🎵 Scheduled stream triggered for ${day}`);
          this.startRadioStream();
        });
        console.log(`Scheduled ${day}: ${cronExpression}`);
      } else {
        console.error(`Invalid cron expression for ${day}: ${cronExpression}`);
      }
    });
  }

  async startRadioStream() {
    try {
      const guild = await this.client.guilds.fetch(config.discord.guildId);
      const channel = await guild.channels.fetch(config.discord.voiceChannelId);

      if (!channel || channel.type !== 2) {
        console.error('Voice channel not found or invalid.');
        return;
      }

      const permissions = channel.permissionsFor(this.client.user);
      console.log(`Joining voice channel: ${channel.name}`);
      console.log('📋 Bot permissions:', {
        viewChannel: permissions.has('ViewChannel'),
        connect: permissions.has('Connect'),
        speak: permissions.has('Speak'),
      });

      const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: guild.id,
        adapterCreator: guild.voiceAdapterCreator,
        selfDeaf: false,
        selfMute: false,
      });

      connection.on('stateChange', (oldState, newState) => {
        console.log(`🔄 Voice state: ${oldState.status} → ${newState.status}`);
        
        if (newState.status === VoiceConnectionStatus.Disconnected || 
            newState.status === VoiceConnectionStatus.Destroyed) {
          console.log('❌ Connection failed. Reason:', newState.reason);
          if (newState.closeCode) {
            console.log('Close code:', newState.closeCode);
          }
        }
      });

      connection.on('error', (error) => {
        console.error('❌ Voice connection error:', error);
      });

      try {
        console.log('Waiting for voice connection to be ready (60s timeout)...');
        await entersState(connection, VoiceConnectionStatus.Ready, 60_000);
        console.log('✅ Voice connection established successfully.');

        await this.audioManager.startStream(connection, config.streamDuration);
      } catch (error) {
        console.error('❌ Failed to establish voice connection:');
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        console.error('Connection state:', connection.state.status);
        connection.destroy();
        throw error;
      }
    } catch (error) {
      console.error('Error starting radio stream:', error.message);
    }
  }

  async start() {
    try {
      await this.client.login(config.discord.token);
    } catch (error) {
      console.error('Failed to login to Discord:', error.message);
      process.exit(1);
    }
  }
}

const bot = new RadioBot();
bot.start();

process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down Sacred26 Radio...');
  bot.audioManager.stopStream();
  bot.client.destroy();
  process.exit(0);
});
