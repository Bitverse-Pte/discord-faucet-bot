const { error, exception } = require('console');
const { Error } = require('mongoose');
const { sendDropTo } = require('./commands/faucet.js');

const path = require('path'),
    dotenv = require('dotenv').config(),
    db = require("./db/connection.js"),
    Discord = require("discord.js"),
    faucet = require("./commands/faucet.js"),
    middleware = require("./middlewares/discord.js");


const client = new Discord.Client();
const prefix = "$";

client.on("message", function (message) {
    const CHANNEL_ID = process.env.CHANNEL_ID;
    if (message.channel.id !== CHANNEL_ID) return;
    const botChannel = client.channels.cache.get(CHANNEL_ID);
    if (message.author.bot) return;
    if (!message.author.client.user.verified) return;
    if (!message.content.startsWith(prefix)) return;

    const commandBody = message.content.slice(prefix.length);
    const args = commandBody.split(' ');
    const command = args.shift().toLowerCase();

    if (command === "ping") {
        botChannel.send(`Pong!`);
        return
    }
    else if (command === "address" && process.env.FAUCET_ADDRESS) {
        botChannel.send(process.env.FAUCET_ADDRESS);
        return
    }
    else if (command === "faucet") {
        console.log('faucet:', args[0]);
        // TODO: need to check balance
        if (args[0] && args[0].length === 42 && args[0].slice(0, 2) === "0x") {       
            middleware.hasReceivedDrop(message.author, args[0]).then(
                res => {
                    if (!res.canClaim && res._doc.hasReceivedFromFaucet) {
                        botChannel.send(`<@${message.author.id}> You already used the faucet, try agin tomorrow`);
                        return
                    }
                    sendDrop()
                }
            )

            function sendDrop() {
                middleware.dropPending(message.author).then(
                    botChannel.send(`Sending...`)
                )
                faucet.sendDropTo(args[0]).then(obj => {
                    if (obj["hash"]) {
                        botChannel.send(`
                          > <@${message.author.id}>
                          > send amount: 20 TELE
                          > receiver: ${args[0]}
https://evm-explorer.testnet.teleport.network/tx/${obj["hash"]}
                        `)
                    }
                    else {
                        throw error
                    };
                }).catch(error => {
                  console.log('faucet error: ', error);
                  botChannel.send(`<@${message.author.id}> too many requests, please try again`)
                  middleware.dropFailed(message.author);
                  return
                })
            }
        }
        // else if(tempBalance<=0.011){
        //     botChannel.send(`Not enough TELE in the faucet`)
        // }
        else { botChannel.send(`Input the address correctly`); return }
    }

    else if (command === "balance") {
        faucet.getBalance().then(balance => {
            botChannel.send(`The faucet has: ${balance} TELE`)
            return
        })
    }

    else if (command === "help") {
        botChannel.send('Faucet cmd -> `$faucet [address]`');
	}
	else {
		botChannel.send(`use $help`);
	}

});

client.login(process.env.BOT_TOKEN);


