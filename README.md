# doodlebot
A helpful bot that adds captchas to discord, and a few other things made by Haicat and mostly made slightly more end-user friendly by ConnerItayi.

## What are the requirements for this?
Node, NPM, Discord.JS, Node-Opus, INI, and CCAP.
Simply run `depenencies.sh` and you're good to go!

Once that's done you can move on to configuring the bot. This is all done in the `config.ini`

## Bot ID, Bot Token, and User ID

First of you'll need a bot, follow this nice guide to make one: 
https://github.com/Just-Some-Bots/MusicBot/wiki/FAQ#how-do-i-create-a-bot-account

For the Bot Token, You can find this on your bots app page!

For the User ID, enable developer view in your options (setting->appearance->developer mode)
Right click yourself, and click `Copy ID`

For the Bot ID, it's the same as the User ID but you need it in your server first. Add it by following
this nice guide: https://github.com/Just-Some-Bots/MusicBot/wiki/FAQ#how-do-i-add-my-bot-account-to-a-server

## Optional Things

Optionally, you can change the command prefix in `config.ini`, but as default it is `%`

## Roles

The roles section of `config.ini` is for the commands `setadminrole` and `setcaptcharole`, use those commands to set those configs.
