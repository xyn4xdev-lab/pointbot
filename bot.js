const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, ApplicationIntegrationType, InteractionContextType } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages
    ]
});

const BOT_TOKEN = 'your_bot_token_here';
const CLIENT_ID = 'your_bot_client_id_here';
const OWNER_ID = 'your_discord_user_id_here';

// Data storage (use a database in production)
let pointsData = new Map();
let mods = new Set();

// Register slash commands
const commands = [
    new SlashCommandBuilder()
        .setName('points')
        .setDescription('Check your points or another user\'s points')
        .setIntegrationTypes([ApplicationIntegrationType.UserInstall, ApplicationIntegrationType.GuildInstall])
        .setContexts([InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel])
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to check points for (defaults to you)')
                .setRequired(false)),
    
    new SlashCommandBuilder()
        .setName('addpoints')
        .setDescription('Add points to a user (Mods only)')
        .setIntegrationTypes([ApplicationIntegrationType.UserInstall, ApplicationIntegrationType.GuildInstall])
        .setContexts([InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel])
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to add points to')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('normal')
                .setDescription('Normal points to add')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('officer')
                .setDescription('Officer points to add')
                .setRequired(false)),
    
    new SlashCommandBuilder()
        .setName('removepoints')
        .setDescription('Remove points from a user (Mods only)')
        .setIntegrationTypes([ApplicationIntegrationType.UserInstall, ApplicationIntegrationType.GuildInstall])
        .setContexts([InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel])
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to remove points from')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('normal')
                .setDescription('Normal points to remove')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('officer')
                .setDescription('Officer points to remove')
                .setRequired(false)),
    
    new SlashCommandBuilder()
        .setName('clearpoints')
        .setDescription('Clear all points from a user (Mods only)')
        .setIntegrationTypes([ApplicationIntegrationType.UserInstall, ApplicationIntegrationType.GuildInstall])
        .setContexts([InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel])
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to clear points from')
                .setRequired(true)),
    
    new SlashCommandBuilder()
        .setName('addmod')
        .setDescription('Add a user as mod (Owner only)')
        .setIntegrationTypes([ApplicationIntegrationType.UserInstall, ApplicationIntegrationType.GuildInstall])
        .setContexts([InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel])
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to make mod')
                .setRequired(true)),
    
    new SlashCommandBuilder()
        .setName('removemod')
        .setDescription('Remove a user as mod (Owner only)')
        .setIntegrationTypes([ApplicationIntegrationType.UserInstall, ApplicationIntegrationType.GuildInstall])
        .setContexts([InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel])
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to remove as mod')
                .setRequired(true))
].map(command => command.toJSON());

// Register commands
const rest = new REST({ version: '10' }).setToken(BOT_TOKEN);

async function registerCommands() {
    try {
        console.log('Registering slash commands...');
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
        console.log('Slash commands registered successfully!');
    } catch (error) {
        console.error('Error registering commands:', error);
    }
}

// Helper functions
function ensureUser(userId) {
    if (!pointsData.has(userId)) {
        pointsData.set(userId, {
            normalPoints: 0,
            officerPoints: 0,
            username: 'Unknown'
        });
    }
}

function isMod(userId) {
    return userId === OWNER_ID || mods.has(userId);
}

function isOwner(userId) {
    return userId === OWNER_ID;
}

// Bot events
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    registerCommands();
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName, options, user } = interaction;

    try {
        switch (commandName) {
            case 'points':
                const targetUser = options.getUser('user') || user;
                ensureUser(targetUser.id);
                
                const userData = pointsData.get(targetUser.id);
                userData.username = targetUser.username;
                
                await interaction.reply({
                    content: `**${targetUser.username}'s Points**\n📊 Normal Points: ${userData.normalPoints}\n⭐ Officer Points: ${userData.officerPoints}`,
                    ephemeral: true
                });
                break;

            case 'addpoints':
                if (!isMod(user.id)) {
                    await interaction.reply({ content: '❌ You need to be a mod to use this command!', ephemeral: true });
                    return;
                }

                const addUser = options.getUser('user');
                const normalAdd = options.getInteger('normal');
                const officerAdd = options.getInteger('officer') || 0;

                ensureUser(addUser.id);
                const addData = pointsData.get(addUser.id);
                addData.normalPoints += normalAdd;
                addData.officerPoints += officerAdd;
                addData.username = addUser.username;

                await interaction.reply({
                    content: `✅ Added ${normalAdd} normal points and ${officerAdd} officer points to ${addUser.username}`,
                    ephemeral: true
                });
                break;

            case 'removepoints':
                if (!isMod(user.id)) {
                    await interaction.reply({ content: '❌ You need to be a mod to use this command!', ephemeral: true });
                    return;
                }

                const removeUser = options.getUser('user');
                const normalRemove = options.getInteger('normal');
                const officerRemove = options.getInteger('officer') || 0;

                ensureUser(removeUser.id);
                const removeData = pointsData.get(removeUser.id);
                removeData.normalPoints = Math.max(0, removeData.normalPoints - normalRemove);
                removeData.officerPoints = Math.max(0, removeData.officerPoints - officerRemove);
                removeData.username = removeUser.username;

                await interaction.reply({
                    content: `✅ Removed ${normalRemove} normal points and ${officerRemove} officer points from ${removeUser.username}`,
                    ephemeral: true
                });
                break;

            case 'clearpoints':
                if (!isMod(user.id)) {
                    await interaction.reply({ content: '❌ You need to be a mod to use this command!', ephemeral: true });
                    return;
                }

                const clearUser = options.getUser('user');
                ensureUser(clearUser.id);
                const clearData = pointsData.get(clearUser.id);
                clearData.normalPoints = 0;
                clearData.officerPoints = 0;

                await interaction.reply({
                    content: `✅ Cleared all points for ${clearUser.username}`,
                    ephemeral: true
                });
                break;

            case 'addmod':
                if (!isOwner(user.id)) {
                    await interaction.reply({ content: '❌ Only the owner can use this command!', ephemeral: true });
                    return;
                }

                const newMod = options.getUser('user');
                mods.add(newMod.id);
                await interaction.reply({
                    content: `✅ Added ${newMod.username} as a mod`,
                    ephemeral: true
                });
                break;

            case 'removemod':
                if (!isOwner(user.id)) {
                    await interaction.reply({ content: '❌ Only the owner can use this command!', ephemeral: true });
                    return;
                }

                const removeMod = options.getUser('user');
                mods.delete(removeMod.id);
                await interaction.reply({
                    content: `✅ Removed ${removeMod.username} as a mod`,
                    ephemeral: true
                });
                break;
        }
    } catch (error) {
        console.error('Error handling command:', error);
        await interaction.reply({ content: '❌ An error occurred while processing your command.', ephemeral: true });
    }
});

client.login(BOT_TOKEN);
