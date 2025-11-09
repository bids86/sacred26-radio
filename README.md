# Sacred26 Radio - Discord Music Bot

A Discord bot that automatically streams shuffled MP3 music from Google Drive to a voice channel for 1 hour daily at scheduled times.

## Features

- 🎵 Streams MP3 files from Google Drive
- 📅 Automated daily streams at specific times (cron scheduling)
- 🔀 Shuffles playlist before each stream
- ⏱️ 60-minute stream duration
- 🎮 Manual test command (`/radiotest`)
- 🔒 Ephemeral command responses (invisible to others)

## Quick Deploy to Railway ⚡

### Prerequisites
- Discord bot token ([Discord Developer Portal](https://discord.com/developers/applications))
- Google Drive API key
- Google Drive folder with MP3 files (public access)
- GitHub account

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### Step 2: Deploy on Railway
1. Go to **[railway.app](https://railway.app)**
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your repository
4. Railway will auto-detect and deploy!

### Step 3: Configure Environment Variables
In Railway dashboard → **Variables** tab, add:

| Variable | Description |
|----------|-------------|
| `DISCORD_TOKEN` | Bot token from Discord Developer Portal |
| `CLIENT_ID` | Discord application client ID |
| `GUILD_ID` | Your Discord server ID (enable Developer Mode → right-click server → Copy ID) |
| `VOICE_CHANNEL_ID` | Voice channel ID for streaming |
| `GOOGLE_API_KEY` | Google Cloud API key |
| `GOOGLE_DRIVE_FOLDER_ID` | Folder ID containing MP3s |

**Schedule variables** (optional - defaults provided):
- `SCHEDULE_MONDAY` through `SCHEDULE_SUNDAY` (cron format)

### Step 4: Register Commands
```bash
# Run once after first deployment
node register-commands.js
```

### Step 5: Test
Run `/radiotest` in your Discord server!

---

## Local Development (Optional)

```bash
npm install
cp .env.example .env
# Edit .env with your credentials
node register-commands.js
npm start
```

## Using the Bot

### Manual Test Command

Use `/radiotest` in Discord to manually trigger a test stream:
- Type `/radiotest` in any text channel
- The bot will immediately join the voice channel and start streaming
- Only you will see the command confirmation (ephemeral response)
- Stream runs for 1 hour just like scheduled streams

### Schedule Configuration

Edit the schedule in your `.env` file using cron syntax:

```
SCHEDULE_MONDAY=0 14 * * 1     # 2:00 PM on Monday
SCHEDULE_TUESDAY=0 18 * * 2    # 6:00 PM on Tuesday
SCHEDULE_WEDNESDAY=0 12 * * 3  # 12:00 PM on Wednesday
SCHEDULE_THURSDAY=0 16 * * 4   # 4:00 PM on Thursday
SCHEDULE_FRIDAY=0 20 * * 5     # 8:00 PM on Friday
SCHEDULE_SATURDAY=0 15 * * 6   # 3:00 PM on Saturday
SCHEDULE_SUNDAY=0 17 * * 0     # 5:00 PM on Sunday
```

## How It Works

1. Bot connects to Discord when started
2. Schedules are loaded from configuration
3. At scheduled times, bot:
   - Joins the configured voice channel
   - Fetches MP3 files from Google Drive
   - Shuffles the playlist
   - Streams audio for the configured duration (default: 60 minutes)
   - Automatically disconnects after stream ends

## Project Structure

```
.
├── index.js                 # Main bot entry point
├── config.js                # Configuration management
├── register-commands.js     # Slash command registration
├── src/
│   ├── audioPlayer.js      # Audio streaming logic
│   └── googleDrive.js      # Google Drive integration
├── Procfile                # Railway deployment config
└── package.json            # Dependencies
```

## Commands

### `/radiotest`
Manually trigger a stream for testing (response visible only to you)

## Pricing

**Railway.app**: $5/month (includes $5 monthly credit)

## Why Railway?

Replit's NixOS environment has compilation issues with native encryption libraries (`sodium-native`) required for Discord voice streaming. Railway compiles these dependencies correctly out of the box.

## Support

For detailed deployment instructions, see [RAILWAY_DEPLOY.md](./RAILWAY_DEPLOY.md)

## License

MIT
