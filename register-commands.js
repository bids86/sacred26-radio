require('dotenv').config();
const { REST, Routes } = require('discord.js');
const config = require('./config');

const commands = [
  {
    name: 'radiotest',
    description: 'Manually trigger a test stream of Sacred26 Radio',
  },
];

const rest = new REST({ version: '10' }).setToken(config.discord.token);

(async () => {
  try {
    console.log('Registering slash commands...');

    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID || 'CLIENT_ID_PLACEHOLDER', config.discord.guildId),
      { body: commands },
    );

    console.log('✅ Successfully registered /radiotest command!');
  } catch (error) {
    console.error('Error registering commands:', error);
  }
})();
