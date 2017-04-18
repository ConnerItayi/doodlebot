# doodlebot
A helpful bot that adds captchas to discord, and a few other things

## What are the requirements for this?
Node and NPM
The installation commands for the requirements are:
`curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -`

`sudo apt-get install -y nodejs`

`sudo apt-get install -y npm`

After Node and NPM are installed, you need to install these:
`sudo npm install  discord.js node-opus ini ccap`

Once that's done you can move on to configuring the bot. This is all dont in the `config.ini`

## Bot ID, Bot Token, and User ID

First of you'll need a bot, follow this nice guide to make one: 
https://github.com/Just-Some-Bots/MusicBot/wiki/FAQ#how-do-i-create-a-bot-account

For the Bot Token, You can find this on your bots app page!

For the User ID, enable developer view in your options (setting->appearance->developer mode)
Right click yourself, and click `Copy ID`

For the Bot ID, it's the same as the User ID but you need it in your server first. Add it by following
this nice guide: https://github.com/Just-Some-Bots/MusicBot/wiki/FAQ#how-do-i-add-my-bot-account-to-a-server
