# Deploy to Railway

## Quick Start

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Deploy on Railway**
   - Go to https://railway.app
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Railway will auto-detect and deploy!

3. **Set Environment Variables**
   In Railway dashboard → Variables tab, add:
   - `DISCORD_TOKEN` - Your Discord bot token
   - `CLIENT_ID` - Discord application client ID
   - `GUILD_ID` - Discord server ID
   - `VOICE_CHANNEL_ID` - Voice channel ID for streaming
   - `GOOGLE_API_KEY` - Google API key
   - `GOOGLE_DRIVE_FOLDER_ID` - Folder ID containing MP3 files

4. **Register Commands**
   After first deployment, go to Railway logs and check if commands registered automatically.
   If not, you can trigger registration manually.

5. **Test**
   Run `/radiotest` in your Discord server!

## Pricing
- $5/month subscription
- Includes $5 credit monthly
- Perfect for 24/7 Discord bots

## Support
Discord voice streaming requires:
- `sodium-native` (for encryption)
- `opusscript` (for audio encoding)
- `ffmpeg-static` (for audio processing)

All dependencies install automatically on Railway! 🎉
