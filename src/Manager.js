/**
*
*   Original creator: https://github.com/Androz2091/discord-giveaways
*
**/


const { EventEmitter } = require('events');
const mergeOptions = require('merge-options');
const { writeFile, readFile, exists } = require('fs');
const { promisify } = require('util');
const writeFileAsync = promisify(writeFile);
const existsAsync = promisify(exists);
const readFileAsync = promisify(readFile);
const Discord = require('discord.js');
const { defaultGiveawaysManagerOptions, defaultGiveawaysMessages, defaultGiveawayRerollOptions } = require('./Util');
const Giveaway = require('./Giveaway');
const moment = require('moment')
moment.locale('fr')
const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
};
let shard0;
let shard1;
let shard2;
let actualshard

class GiveawaysManager extends EventEmitter {

    constructor(client, options) {
        super();
        if (!client) throw new Error('Client is a required option.');

        this.client = client;

        this.ready = false;

        this.checking = false;

        this.giveaways = [];

        this.options = mergeOptions(defaultGiveawaysManagerOptions, options);

        this.v12 = this.options.DJSlib === 'v12';
        this._init();
    }

    checkEnd(messageID) {
        return new Promise(async (resolve, reject) => {
        let storageContent = await readFileAsync(this.options.storage);
        let giveaways = await JSON.parse(storageContent);
        if (giveaways.length <= 0) return(console.log('err'));
        this.giveaways = giveaways
            let giveawayData = this.giveaways.find(g => g.messageID === messageID)
            if (!giveawayData) {
                return reject('No giveaway found with ID ' + messageID + '.');
            }
            let giveaway = new Giveaway(this, giveawayData);
            if (!giveaway.channel) {
                return reject('Unable to get the channel of the giveaway with message ID ' + giveaway.messageID + '.');
            }
            await giveaway.fetchMessage().catch(() => {});
            if (!giveaway.message) {
                return reject('Unable to fetch message with ID ' + giveaway.messageID + '.');
            }
            await this._markAsEnded(giveaway.messageID);
            let winners = await giveaway.roll();
            if (winners.length > 0) {
                let formattedWinners = winners.map(w => '<@' + w.id + '>').join(', ');
                let str =
                    giveaway.messages.winners.substr(0, 1).toUpperCase() +
                    giveaway.messages.winners.substr(1, giveaway.messages.winners.length) +
                    ': ' +
                    formattedWinners;
            let date = new Date()
            date.setHours( date.getHours() + 2 );
                let embed = this.v12 ? new Discord.MessageEmbed() : new Discord.MessageEmbed();
                embed
            .setAuthor(`Giveaway terminé!`)
            .setColor(`#EF1106`)
            .setThumbnail('https://cdn.discordapp.com/attachments/682274736306126925/740643197058809856/1596653471717.png')
            .setFooter(`Terminé le: ${moment(date).format('LLLL')}`)
            .addField(`\u200B`, `\n\n🏆 Prix: \`${giveaway.prize}\`\n🏅 Nombre de gagnant: **${giveaway.winnerCount}**\n\nGagnant(s): ${formattedWinners}\n\u200B`)
                await giveaway.message.edit({ embed });
                await giveaway.message.channel.send(
                    giveaway.messages.winMessage
                        .replace('{winners}', formattedWinners)
                        .replace('{prize}', giveaway.prize)
                );
                await this.emit('end', giveaway, winners);
                resolve(winners);
            } else {
                let date = new Date()
                date.setHours( date.getHours() + 2 );
                let embed = this.v12 ? new Discord.MessageEmbed() : new Discord.MessageEmbed();
                embed
            .setAuthor(`Giveaway terminé!`)
            .setThumbnail('https://cdn.discordapp.com/attachments/682274736306126925/740643197058809856/1596653471717.png')
            .setColor(`#EF1106`)
            .setFooter(`Terminé le: ${moment(date).format('LLLL')}`)
            .addField(`\u200B`, `\n\n🏆 Prix: \`${giveaway.prize}\`\n🏅 Nombre de gagnant: **${giveaway.winnerCount}**\n\nAucun gagnant :(\n\u200B`)
                await giveaway.message.edit({ embed });
                await this._markAsEnded(giveaway.messageID);
                await this.emit('end', giveaway, winners);
                resolve();
            }
        });
    }




    end(messageID) {
        return new Promise(async (resolve, reject) => {
        let storageContent = await readFileAsync(this.options.storage);
        let giveaways = await JSON.parse(storageContent);
        if (giveaways.length <= 0) return(console.log('err'));
        this.giveaways = giveaways
            let giveawayData = this.giveaways.find(g => g.messageID === messageID)
            if (!giveawayData) {
                return reject('No giveaway found with ID ' + messageID + '.');
            }
            let giveaway = new Giveaway(this, giveawayData);
            if (!giveaway.channel) {
                return reject('Unable to get the channel of the giveaway with message ID ' + giveaway.messageID + '.');
            }
            if(giveaway.ended === true) {
                return reject('Deéjà terminé');
            }
            await giveaway.fetchMessage().catch(() => {});
            if (!giveaway.message) {
                return reject('Unable to fetch message with ID ' + giveaway.messageID + '.');
            }
            await this._markAsEnded(giveaway.messageID);
            let winners = await giveaway.roll();
            if (winners.length > 0) {
                let formattedWinners = winners.map(w => '<@' + w.id + '>').join(', ');
                let str =
                    giveaway.messages.winners.substr(0, 1).toUpperCase() +
                    giveaway.messages.winners.substr(1, giveaway.messages.winners.length) +
                    ': ' +
                    formattedWinners;
            let date = new Date()
            date.setHours( date.getHours() + 2 );
                let embed = this.v12 ? new Discord.MessageEmbed() : new Discord.MessageEmbed();
                embed
            .setAuthor(`Giveaway terminé!`)
            .setColor(`#EF1106`)
            .setThumbnail('https://cdn.discordapp.com/attachments/682274736306126925/740643197058809856/1596653471717.png')
            .setFooter(`Terminé le: ${moment(date).format('LLLL')}`)
            .addField(`\u200B`, `\n\n🏆 Prix: \`${giveaway.prize}\`\n🏅 Nombre de gagnant: **${giveaway.winnerCount}**\n\nGagnant(s): ${formattedWinners}\n\u200B`)
                await giveaway.message.edit({ embed });
                await giveaway.message.channel.send(
                    giveaway.messages.winMessage
                        .replace('{winners}', formattedWinners)
                        .replace('{prize}', giveaway.prize)
                );
                await this.emit('end', giveaway, winners);
                resolve(winners);
            } else {
                let date = new Date()
                date.setHours( date.getHours() + 2 );
                let embed = this.v12 ? new Discord.MessageEmbed() : new Discord.MessageEmbed();
                embed
            .setAuthor(`Giveaway terminé!`)
            .setThumbnail('https://cdn.discordapp.com/attachments/682274736306126925/740643197058809856/1596653471717.png')
            .setColor(`#EF1106`)
            .setFooter(`Terminé le: ${moment(date).format('LLLL')}`)
            .addField(`\u200B`, `\n\n🏆 Prix: \`${giveaway.prize}\`\n🏅 Nombre de gagnant: **${giveaway.winnerCount}**\n\nAucun gagnant :(\n\u200B`)
                await giveaway.message.edit({ embed });
                await this._markAsEnded(giveaway.messageID);
                await this.emit('end', giveaway, winners);
                resolve();
            }
        });
    }

    start(channel, options = {}) {
        return new Promise(async (resolve, reject) => {

            let storageContent = await readFileAsync(this.options.storage);
            let giveaways = await JSON.parse(storageContent);
            this.giveaways = giveaways
            if (!this.ready) {
                return reject('Chargement du bot...');
            }
            if (!options.messages) {
                options.messages = defaultGiveawaysMessages;
            }
            if (!channel || !channel.id) {
                return reject(`Le salon est introuvable. (${channel})`);
            }
            if (!options.time || isNaN(options.time)) {
                return reject(`La durée doit être un nombre! (${options.time})`);
            }
            if (!options.prize) {
                return reject(`Le prix n'est pas un texte! (${options.prize})`);
            }
            if (!options.winnerCount || isNaN(options.winnerCount)) {
                return reject(`Le nombre de gagnant n'est pas un chiffre (${options.winnerCount})`);
            }
            if(options.isRequiredRole === true && !options.requiredRole) {
                return reject(`Le RequiredRole n'est pas défini`);
            }
            let giveaway;
        if(options.IsRequiredRole === true) {
            giveaway = new Giveaway(this, {
                startAt: Date.now(),
                endAt: Date.now() + options.time,
                winnerCount: options.winnerCount,
                channelID: channel.id,
                guildID: channel.guild.id,
                ended: false,
                IsRequiredRole: true,
                requiredRole: options.requiredRole,
                prize: options.prize,
                hostedBy: (options.hostedBy ? options.hostedBy.toString() : null),
                messages: options.messages,
                reaction: options.reaction,
                botsCanWin: options.botsCanWin,
                exemptPermissions: options.exemptPermissions,
                exemptMembers: options.exemptMembers,
                embedColor: options.embedColor,
                embedColorEnd: options.embedColorEnd,
                reaction: options.reaction
            });
        } else {
            giveaway = new Giveaway(this, {
                startAt: Date.now(),
                endAt: Date.now() + options.time,
                winnerCount: options.winnerCount,
                channelID: channel.id,
                guildID: channel.guild.id,
                ended: false,
                IsRequiredRole: false,
                requiredRole: null,
                prize: options.prize,
                hostedBy: (options.hostedBy ? options.hostedBy.toString() : null),
                messages: options.messages,
                reaction: options.reaction,
                botsCanWin: options.botsCanWin,
                exemptPermissions: options.exemptPermissions,
                exemptMembers: options.exemptMembers,
                embedColor: options.embedColor,
                embedColorEnd: options.embedColorEnd,
                reaction: options.reaction
            });
        }
        	let date = new Date(giveaway.endAt);
        	date.setHours( date.getHours() + 2 );
            let embed;
            giveaway.IsRequiredRole = options.IsRequiredRole
            console.log(`RequiredRole Verification: `  + options.IsRequiredRole)
            if(options.IsRequiredRole === true) {
            embed = new Discord.MessageEmbed();
            embed
            .setAuthor(`Nouveau Giveaway!`)
            .setColor('#10EEE1')
            .setThumbnail('https://cdn.discordapp.com/attachments/682274736306126925/740643196878454834/1596653488174.png')
            .setFooter(`Réagissez avec 🎁 pour participer! | Date de fin: ${moment(date).format('LLLL')}`)
            .addField(`\u200B`, `\n\n🏆 Prix: \`${giveaway.prize}\`\n🏅 Nombre de gagnant: **${giveaway.winnerCount}**\n:clock10: ${giveaway.content}\n:bust_in_silhouette: Rôle requis: <@&${giveaway.requiredRole}>\n\u200B`)
            } else {
            embed = new Discord.MessageEmbed();
            embed
            .setAuthor(`Nouveau Giveaway!`)
            .setColor('#10EEE1')
            .setThumbnail('https://cdn.discordapp.com/attachments/682274736306126925/740643196878454834/1596653488174.png')
            .setFooter(`Réagissez avec 🎁 pour participer! | Date de fin: ${moment(date).format('LLLL')}`)
            .addField(`\u200B`, `\n\n🏆 Prix: \`${giveaway.prize}\`\n🏅 Nombre de gagnant: **${giveaway.winnerCount}**\n:clock10: ${giveaway.content}\n\u200B`)
            }
            let message = await channel.send({ embed });
            await message.react(giveaway.reaction);
            giveaway.messageID = message.id;
            await this.giveaways.push(giveaway);
            await this._saveGiveaway(giveaway);
            resolve(giveaway);
        });
    }

    reroll(messageID, options = {}) {
        return new Promise(async (resolve, reject) => {
        let storageContent = await readFileAsync(this.options.storage);
        let giveaways = await JSON.parse(storageContent);
        if (giveaways.length <= 0) return;
        this.giveaways = giveaways
            options = mergeOptions(defaultGiveawayRerollOptions, options);
            let giveawayData = this.giveaways.find(g => g.messageID === messageID);
            if (!giveawayData) {
                return reject(`Aucun giveaway trouvé avec l'identifiant ` + messageID + '.');
            }
            let giveaway = new Giveaway(this, giveawayData);
            if (!giveaway.ended) {
                return reject(`Ce giveaway n'est pas terminé`);
            }
            if (!giveaway.channel) {
                return reject(`Impossible de trouver le salon comportant le giveaway avec l'id ` + giveaway.messageID + '.');
            }
            await giveaway.fetchMessage().catch(() => {});
            if (!giveaway.message) {
                return reject('Message introuvable avec comme id ' + giveaway.messageID + '.');
            }
            let winners = await giveaway.roll();
            if (winners.length > 0) {
                let formattedWinners = winners.map(w => '<@' + w.id + '>').join(', ');
                giveaway.channel.send(options.messages.congrat.replace('{winners}', formattedWinners));
                resolve(winners);
            } else {
                giveaway.channel.send(options.messages.error);
                resolve(new Array());
            }
        });
    }

    edit(messageID, options = {}) {
        return new Promise(async (resolve, reject) => {
        let storageContent = await readFileAsync(this.options.storage);
        let giveaways = await JSON.parse(storageContent);
        if (giveaways.length <= 0) return;
        this.giveaways = giveaways
            let giveawayData = this.giveaways.find(g => g.messageID === messageID);
            if (!giveawayData) {
                return reject(`Giveaway introuvable`);
            }
            let giveaway = new Giveaway(this, giveawayData);
            if (giveaway.ended) {
                return reject(`Ce giveaway est déjà terminé`);
            }
            if (!giveaway.channel) {
                return reject(`Salon introuvable`);
            }
            await giveaway.fetchMessage().catch(() => {});
            if (!giveaway.message) {
                return reject(`Message introuvable`);
            }
            let modifiedGiveawayData = giveawayData;
            if (options.newWinnerCount) modifiedGiveawayData.winnerCount = options.newWinnerCount;
            if (options.newPrize) modifiedGiveawayData.prize = options.newPrize;
            if (options.addTime) modifiedGiveawayData.endAt = giveawayData.endAt + options.addTime;
            if (options.setEndTimestamp) modifiedGiveawayData.endAt = options.setEndTimestamp;
            let newGiveaway = new Giveaway(this, modifiedGiveawayData);
            this._saveGiveaway(newGiveaway);
            resolve(newGiveaway);
        });
    }

    delete(messageID, doNotDeleteMessage) {
        return new Promise(async (resolve, reject) => {
        let storageContent = await readFileAsync(this.options.storage);
        let giveaways = await JSON.parse(storageContent);
        if (giveaways.length <= 0) return;
        this.giveaways = giveaways
            let giveawayData = this.giveaways.find(g => g.messageID === messageID);
            if (!giveawayData) {
                return reject(`Giveaway introuvable`);
            }
            let giveaway = new Giveaway(this, giveawayData);
            if (!giveaway.channel) {
                return reject(`Salon introuvable`);
            }
            if(!doNotDeleteMessage){
                await giveaway.fetchMessage().catch(() => {});
                if (giveaway.message) {
                    // Delete the giveaway message
                    giveaway.message.delete();
                }
            }
            this.giveaways = this.giveaways.filter(g => g.messageID !== giveawayData.messageID);
            await writeFileAsync(this.options.storage, JSON.stringify(this.giveaways), 'utf-8');
            resolve();
        });
    }

    async _initStorage() {
        let storageExists = await existsAsync(this.options.storage);
        if (!storageExists) {
            await writeFileAsync(this.options.storage, '[]', 'utf-8');
            return [];
        } else {
            let storageContent = await readFileAsync(this.options.storage);
            try {
                let giveaways = await JSON.parse(storageContent);
                if (Array.isArray(giveaways)) {
                    return giveaways;
                } else {
                    throw new SyntaxError('The storage file is not properly formatted.');
                }
            } catch (e) {
                if (e.message === 'Unexpected end of JSON input') {
                    throw new SyntaxError('The storage file is not properly formatted.', e);
                } else {
                    throw e;
                }
            }
        }
    }

    async _saveGiveaway(giveaway) {
        let storageContent = await readFileAsync(this.options.storage);
        let giveaways = await JSON.parse(storageContent);
        this.giveaways = giveaways
        this.giveaways = this.giveaways.filter(g => g.messageID !== giveaway.messageID);
        let giveawayData;
        if(giveaway.IsRequiredRole === true) {
        giveawayData = {
            messageID: giveaway.messageID,
            channelID: giveaway.channelID,
            guildID: giveaway.guildID,
            startAt: giveaway.startAt,
            endAt: giveaway.endAt,
            ended: giveaway.ended,
            winnerCount: giveaway.winnerCount,
            IsRequiredRole: true,
            requiredRole: giveaway.requiredRole,
            prize: giveaway.prize,
            messages: giveaway.messages
        };
        if (giveaway.options.hostedBy) giveawayData.hostedBy = giveaway.options.hostedBy;
        if (giveaway.options.embedColor) giveawayData.embedColor = giveaway.options.embedColor;
        if (giveaway.options.embedColorEnd) giveawayData.embedColorEnd = giveaway.options.embedColorEnd;
        if (giveaway.options.botsCanWin) giveawayData.botsCanWin = giveaway.options.botsCanWin;
        if (giveaway.options.exemptPermissions) giveawayData.exemptPermissions = giveaway.options.exemptPermissions;
        if (giveaway.options.exemptMembers) giveawayData.exemptMembers = giveaway.options.exemptMembers;
        if (giveaway.options.reaction) giveawayData.reaction = giveaway.options.reaction;
        if (giveaway.options.IsRequiredRole) giveawayData.IsRequiredRole = giveaway.options.IsRequiredRole;
    } else {
        giveawayData = {
            messageID: giveaway.messageID,
            channelID: giveaway.channelID,
            guildID: giveaway.guildID,
            startAt: giveaway.startAt,
            endAt: giveaway.endAt,
            ended: giveaway.ended,
            winnerCount: giveaway.winnerCount,
            IsRequiredRole: false,
            requiredRole: giveaway.requiredRole,
            prize: giveaway.prize,
            messages: giveaway.messages
        };
        if (giveaway.options.hostedBy) giveawayData.hostedBy = giveaway.options.hostedBy;
        if (giveaway.options.embedColor) giveawayData.embedColor = giveaway.options.embedColor;
        if (giveaway.options.embedColorEnd) giveawayData.embedColorEnd = giveaway.options.embedColorEnd;
        if (giveaway.options.botsCanWin) giveawayData.botsCanWin = giveaway.options.botsCanWin;
        if (giveaway.options.exemptPermissions) giveawayData.exemptPermissions = giveaway.options.exemptPermissions;
        if (giveaway.options.exemptMembers) giveawayData.exemptMembers = giveaway.options.exemptMembers;
        if (giveaway.options.reaction) giveawayData.reaction = giveaway.options.reaction;
        if (giveaway.options.IsRequiredRole) giveawayData.IsRequiredRole = giveaway.options.IsRequiredRole;
    }
        await this.giveaways.push(giveawayData);
        await writeFileAsync(this.options.storage, JSON.stringify(this.giveaways), 'utf-8');
        return;
    }

    async _markAsEnded(messageID) {
        let storageContent = await readFileAsync(this.options.storage);
        let giveaways = await JSON.parse(storageContent);
        if (giveaways.length <= 0) return;
        this.giveaways = giveaways
        this.giveaways.find(g => g.messageID === messageID).ended = true;
        await writeFileAsync(this.options.storage, JSON.stringify(this.giveaways), 'utf-8');
        return;
    }

    async _checkGiveaway() {
        if(this.options.storage === `./data/storage/0/giveaways.json`) {
            if(shard0 === true) return;
            shard0 = true
        } else if(this.options.storage === `./data/storage/1/giveaways.json`) {
            if(shard1 === true) return;
            shard1 = true
        } else if(this.options.storage === `./data/storage/2/giveaways.json`) {
            if(shard2 === true) return;
            shard2 = true
        }
        let storageContent = await readFileAsync(this.options.storage);
        let giveaways = await JSON.parse(storageContent);
        this.giveaways = giveaways
        if (giveaways.length <= 0) return;
        this.giveaways.forEach(async giveawayData => {
            let giveaway = new Giveaway(this, giveawayData);
            if (giveaway.ended === true) {
                return;
            }
            if (!giveaway.channel) return;
            if (giveaway.remainingTime <= 0) {
                await this.end(giveaway.messageID).catch(e => console.error(e));
                await this._markAsEnded(giveaway.messageID);
                return;
            }
            await giveaway.fetchMessage().catch(() => {});
            if (!giveaway.message) {
                giveaway.ended = true;
                await this._markAsEnded(giveaway.messageID);
                return;
            }
        	let date = new Date(giveaway.endAt);
        	date.setHours( date.getHours() + 2 );
            let embed;
            if(giveaway.options.IsRequiredRole === true) {
            embed = new Discord.MessageEmbed();
            embed
            .setAuthor(`Giveaway en cours!`)
            .setColor('#10EEE1')
            .setThumbnail('https://cdn.discordapp.com/attachments/682274736306126925/740643196878454834/1596653488174.png')
            .setFooter(`Réagissez avec 🎁 pour participer! | Date de fin: ${moment(date).format('LLLL')}`)
            .addField(`\u200B`, `\n\n🏆 Prix: \`${giveaway.prize}\`\n🏅 Nombre de gagnant: **${giveaway.winnerCount}**\n:clock10: ${giveaway.content}\n:bust_in_silhouette: Rôle requis: <@&${giveaway.requiredRole}>\n\u200B`)
            await giveaway.message.edit({ embed });
            } else {
            embed = new Discord.MessageEmbed();
            embed
            .setAuthor(`Giveaway en cours!`)
            .setColor('#10EEE1')
            .setThumbnail('https://cdn.discordapp.com/attachments/682274736306126925/740643196878454834/1596653488174.png')
            .setFooter(`Réagissez avec 🎁 pour participer! | Date de fin: ${moment(date).format('LLLL')}`)
            .addField(`\u200B`, `\n\n🏆 Prix: \`${giveaway.prize}\`\n🏅 Nombre de gagnant: **${giveaway.winnerCount}**\n:clock10: ${giveaway.content}\n\u200B`)
            await giveaway.message.edit({ embed });
            }
            let delay = new Date()
            let delayup = delay + this.options.updateCountdownEvery
            let ending;
            if(giveaway.ended === true) {
                return;
            } else if(delay > giveaway.endAt) {
                console.log('Delay is superior')
                giveaway.ended = true;
                await this.end.call(this, giveaway.messageID);
                await this._markAsEnded(giveaway.messageID);
            } else if(delayup > giveaway.endAt) {
                console.log('Delayup is superior')
                giveaway.ended = true;
                await this.end.call(this, giveaway.messageID);
                await this._markAsEnded(giveaway.messageID);     
            } else if (giveaway.remainingTime < this.options.updateCountdownEvery) {
                console.log('Countdown')
                giveaway.ended = true;
                await this.end.call(this, giveaway.messageID);  
                await this._markAsEnded(giveaway.messageID);
            }


        });
        
    }

    async _init() {
        this.checking = false;
        this.ready = true;
        this.giveaways = await this._initStorage();
        setInterval(async () => {
            if (this.client.readyAt) {
                await this._checkGiveaway();
                setTimeout(async () => {
                    if(this.options.storage === `./data/storage/0/giveaways.json`) {
                        shard0 = false
                    } else if(this.options.storage === `./data/storage/1/giveaways.json`) {
                        shard1 = false
                    } else if(this.options.storage === `./data/storage/2/giveaways.json`) {
                        shard2 = false
                    }
                }, 15000)
            }
        }, 15000);
    
    }
}

module.exports = GiveawaysManager;
