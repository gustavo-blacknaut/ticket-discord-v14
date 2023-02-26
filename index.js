const { Client, GatewayIntentBits, PermissionsBitField, EmbedBuilder, ChannelType, ActionRowBuilder, ButtonStyle, ButtonBuilder } = require('discord.js');
const client = new Client({intents: [GatewayIntentBits.Guilds,GatewayIntentBits.GuildMessages,GatewayIntentBits.MessageContent,GatewayIntentBits.GuildMembers,], fetchReply: true});

let config = require('./config.json')

client.login(config.token);

client.on('ready', async() => {
    console.log(`Conectei em: ${client.user.tag}!`);

    client.application.commands.create({
        name:'setup',
        description: `Configure o canal do ticket!`,
        dmPermission: false
    })
})

client.on('interactionCreate', async(interaction) => {
    if (interaction.isChatInputCommand()) {
        let embed = new EmbedBuilder()
        .setTitle(config.tituloembed)
        .setDescription(config.descricaoembed)
        .setFooter({ text: config.foo })
        .setColor(config.color)

        let botoes = new ActionRowBuilder()
        .addComponents(
           new ButtonBuilder()
           .setCustomId(`ticket`)
           .setEmoji(`${config.emojibotao}`)
           .setLabel(`${config.botao}`)
           .setStyle(ButtonStyle.Primary)
        )
  
        interaction.channel.send({ embeds: [embed], components: [botoes] })
        return interaction.reply({ content: `mensagem enviada com sucesso!`, ephemeral: true })
    }

    if (interaction.isButton()) {
        if(interaction.customId === 'ticket') {
            await interaction.deferReply({ephemeral: true}).catch(e => console.log(e));

            let achar = interaction.guild.channels.cache.find(c => c.topic === `${interaction.member.id}`)
           if (achar) return interaction.reply({ content: `${interaction.member}, você já tem um ticket aberto em: ${achar}.`, ephemeral: true })
  
            let iniciarticket = new EmbedBuilder()
            .setColor(config.color)
            .setTitle(config.opentickettitulo)
            .setDescription(config.openticketdesc)

            let funcoes = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setCustomId(`fechar`)
                .setLabel(config.botaofecha)
                .setEmoji(config.botaofechaemoji)
                .setStyle(ButtonStyle.Danger),
            )

            interaction.guild.channels.create({
                name: `ticket-${interaction.user.username}`,
                type: ChannelType.GuildText,
                permissionOverwrites: [
                    {
                        id: interaction.guild.id,
                        deny: [PermissionsBitField.Flags.ViewChannel],
                    },
                    {
                        id: interaction.member.id,
                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory],
                    },
                ],
                topic: `${interaction.member.id}`
            })
            .then(async (channel) => {
                let embed = new EmbedBuilder()
                .setColor(config.color)
                .setDescription(config.open + `${channel}`)

                interaction.editReply({ embeds: [embed], ephemeral: true })
                channel.send({ content: `@everyone`, embeds: [iniciarticket], components: [funcoes] })
            })
        }
        if(interaction.customId === 'fechar') {
            interaction.channel.delete()
        }
    }

})
