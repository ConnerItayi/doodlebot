var fs = require('fs')
  , ini = require('ini')

var config = ini.parse(fs.readFileSync('./config/config.ini', 'utf-8'))


var botid = config.Credentials.BotID;
var bottoken = config.Credentials.Token;
var devID = config.Credentials.UserID;
//NOT your username#xxxx ID, your 17-digit ID you get when turning on dev mode and right clicking on your name and pressing copy ID
//this is used for commands that only the developer should use


var discord = require("discord.js");
var url = require("url");
var ccap = require("ccap");
//readyup.js is just a small little script I wrote to execute a function once multiple async functions have finished.
//ready.wait() tells it that we're waiting for a function, and ready.done() tells it that the function has completed.
var ready = require("./doodle/readyup.js");
//commonly used strings
var texts = require("./doodle/texts.js");

var client = new discord.Client();

//container for command functions
var commands = {};
//container for manual entries
var manual = {};
//container for server configurations (anything put in here will be saved in servers.js)
var servers = {};
//container for assigned captchas
var captchas = {};


function checkDev(message){
	return ((message.author.id) == devID);
}

//Check if the sender of the message is the owner of the server
function checkOwner(message){
	return ((message.author.id == message.guild.owner.id));
}

//Check if the sender of the message has the designated admin role or is the server owner
function checkAdmin(message){
	if(checkOwner(message)){return true;};
	if(message.member == undefined || message.member == null){return false;};
	if(servers[message.guild.id] == undefined){return false;};
	if(servers[message.guild.id].adminRole == undefined){return false;};
	return message.member.roles.has(servers[message.guild.id].adminRole);
}


console.log("Initializing.");
function readyup(){
	//run our routine function every hour
	setInterval(routine, 3600000);
	console.log("Initialization complete.");
}

//set the function to be executed once everything is ready
ready.init(readyup);


console.log("Loading server configurations.");
ready.wait();
//servers.js is where we store all our server configurations
fs.readFile("./doodle/servers.js", "utf8", function(err, data){
	if (err) {
		console.log(err.message);
		process.exit();
	}
	servers = JSON.parse(data);
	console.log("Server configurations loaded.");
	ready.done();
});


ready.wait();
//start up the client
client.on('ready', function(){
  console.log("Client ready.");
  ready.done()
});

//when we get a message
client.on('message', function(message){
	//ignore messages from ourself
	if (message.author.id == botid){return;};
	//log DMs
	if (message.channel.type == "dm"){console.log("[DM ] " + message.author + " @" + message.author.username + " : " +message.content);};
	
	//message was a command, change this '%' if you want to change the command token
	if (message.content[0] == config.Bot.Prefix) {
		//log commands
		console.log("[CMD] " + message.author + " @" + message.author.username + " : " +message.content);
		//get our command arguments
		var args = message.content.split(" ");
		//get our command. remove the beginning token and make it case insensitive
		var cmd = args[0].substring(1).toLowerCase();
		//get just the arguments unsplit
		var input = message.content.slice(cmd.length + 1).trim();
		//does the command even exist?
		if(commands[cmd] != undefined) {
			//execute the command
			commands[cmd](args, message, input);
		}
	}
});


commands = {
	//ping
	ping : function (a,m){
		m.channel.sendMessage("PONG!");
	},
	//repeat message
	echo : function(a, m, inp){
		m.channel.sendMessage(inp);
		m.delete();
	},
	//execute the given javascript
	/*
	exec : function(a,m,inp){
		if(!checkDev(m)){
			m.channel.sendMessage("texts.noPerm");
			return;
		}
		var ret;
		try{
			ret = eval(inp);
			
		}catch(e){
			m.channel.sendMessage("Error:\n"+e.message).catch(function(e){
				m.channel.sendMessage(e);
			});
		}
		ret = String(ret);
		if(ret == ""){ret = "\"\"";};
		m.channel.sendMessage(ret).catch(function(e){
			m.channel.sendMessage(e);
		});
	},
	"%" : function(a,m,inp){
		commands.exec(a,m,inp);
	},*/
	save : function(a,m){
		if(!checkDev(m)){
			m.reply(texts.noPerm);
			return;
		};
		saveData();
	},
	//This command allows you to view past versions of an edited message
	snoop : function(a,m){
		if(a[1] == undefined || a[1] == ""){
			m.reply("You need to supply a message ID to snoop!");
			return;
		}
		m.channel.fetchMessage(a[1])
			.then(function(message){
				var tt = "I found **" + message._edits.length + "** past versions for that message."
				tt += "\n**Current:**\n" + message.content + "\n**Past versions:**";
				for (var i = 0; i < message._edits.length; i++){
					tt += "\n" + message._edits[i].content;
				}
				m.channel.sendMessage(tt);
			})
			.catch(function(err){m.channel.sendMessage("Error:\n"+err.message);});
	},
	//display a manual page
	help : function(a,m){
		if(a[1] == undefined || a[1] == ""){
			var msg = 	".\n"+
						"**Help Manual**\n"+
						"To view a specific manual article use `"+config.Bot.Prefix+"help (page name)` (without parentheseis).\n"+
						"Usages are given as: `"+config.Bot.Prefix+"command (required argument) [optional argument]`\n\n"+
						"**Available manual pages**\n"+
						"(Commands are listed in `code blocks`, non-command pages are *italic*)\n";
			for (i in manual) {
				if(manual[i].nocmd == true){
					msg += "*" + i + "* ";
					continue;
				}
				msg += "`" + i + "` ";
			}
			m.channel.sendMessage(msg);
			return;
		}
		var page = a[1].trim().toLowerCase();
		if(manual[page] == undefined) {
			m.channel.sendMessage("Sorry, I couldnt find that page in the manual!");
			return;
		}
		pp = manual[page];
		var usg = "";
		var aka = "";
		if (pp.usage != undefined && pp.usage != ""){
			usg = "\n**Usage:**\n`%" + page + " " + pp.usage + "`";
		} 
		if (pp.aka != undefined){
			aka = "\n**Aliases:**\n";
			for (var i = 0; i < pp.aka.length; i++) {
				aka += "`" + pp.aka[i] + "` ";
			}
		} 
		m.channel.sendMessage(pp.desc + usg + aka);
	},
	//aka help
	"?" : function(a,m){
		commands.help(a,m);
	},
	//set the role to give admin commands to
	setadminrole : function(a,m){
		if(m.guild == undefined){return;};
		if(m.guild.owner == undefined){return;};
		var rolename = m.content.substr(a[0].length).trim();
		if(servers[m.guild.id] == undefined){servers[m.guild.id] = {};};
		if(rolename == ""){
			if(servers[m.guild.id].adminRole == undefined){
				m.channel.sendMessage("This server does not have an admin role defined.");
				return;
			}
			m.channel.sendMessage("The role for using admin commands is currently `"+m.guild.roles.get(servers[m.guild.id].adminRole).name+"`.");
			return;
		}
		if(!checkOwner(m)){
			m.reply(texts.noPerm);
			return;
		};
		
		var found = false;
		var role = undefined;
		m.guild.roles.forEach(function(v,i){
			if(v.name == rolename.trim()){
				servers[m.guild.id].adminRole = v.id;
				found = true;
				role = v;
			}
		});
		if(found){
			m.channel.sendMessage("Okay, the bot admin role is now `"+role.name+"`.");
			return;
		};
		m.channel.sendMessage("I could not find any role named `"+rolename+"`.");
		
	},
	//set the role to be given to users once they complete a captcha
	setcaptcharole : function(a,m){
		if(m.guild == undefined){return;};
                var rolename = m.content.substr(a[0].length).trim();
                if(servers[m.guild.id] == undefined){servers[m.guild.id] = {};};
                if(rolename == ""){
                        if(servers[m.guild.id].captchaRole == undefined){
                                m.channel.sendMessage("This server does not have a captcha role defined.");
                                return;
                        }
                        m.channel.sendMessage("The role assigned upon completing a captcha is currently `"+m.guild.roles.get(servers[m.guild.id].captchaRole).name+"`.");
                        return;
                }
                if(!checkAdmin(m)){
                        m.reply(texts.noPerm);
                        return;
                };

                var found = false;
                var role = undefined;
                m.guild.roles.forEach(function(v,i){
                        if(v.name == rolename.trim()){
                                servers[m.guild.id].captchaRole = v.id;
                                found = true;
                                role = v;
                        }
                });
                if(found){
                        m.channel.sendMessage("Okay, the captcha role is now `"+role.name+"`.");
                        return;
                };
                m.channel.sendMessage("I could not find any role named `"+rolename+"`.");

	},
	//get a captcha
	captcha : function(a,m){
		var captcha = ccap();
		var ary = captcha.get();
		var text = ary[0];
		var buffer = ary[1];
		m.channel.sendFile(buffer, "captcha.png", m.author.toString());
		captchas[m.author.id] = text;
	},
	//solve the captcha
	solve : function(a,m){
		var guess = m.content.slice(6).toUpperCase().replace(/(\[|\]|\ )/g, "");
		if(m.member == undefined){return;};
		if(captchas[m.author.id] == undefined){
			m.reply("You must first generate a captcha with `%captcha`");
			return;
		}
		if(guess == captchas[m.author.id]){
			m.member.addRole(servers[m.guild.id].captchaRole).catch(
					function(e){
						console.log("Error in solve: "+e.message+"\n(They probably already have the verified role.)");
					}
				);
			return;
		}
		m.reply("Sorry, that is incorrect. `" + guess + "`");
	}
	
};

//manual entries
manual = {
	ping : {
		desc : "Test me by having me send a quick response."
	},
	echo : {
		desc : "Have me repeat whatever you say.",
		usage : "(message to repeat)"
	},
	snoop : {
		desc : "See the past edit versions of a message.",
		usage : "(message id)"
	},
	help : {
		desc : "View the manual.",
		usage : "[page name]",
		aka : ["?"]
	},
	setadminrole : {
		desc : "Can only be used by the server owner. Define the role that has access to admin/mod bot commands.",
		usage : "(role name)"
	},
	setcaptcharole : {
		desc : "Can only be used by bot admins. Define the role to be assigned to users once they solve a captcha.",
		usage : "(role name)"
	},
	captcha : {
		desc : "Generate a captcha to solve."
	},
	solve : {
		desc : "Solve a captcha.",
		usage : "(captcha solution)"
	}
};


console.log("Logging in client.");
//log in the client
client.login(bottoken);

//save stuff that needs to be
function saveData(){
	try{
		console.log("Saving server configurations.");
		var str = JSON.stringify(servers);
		fs.writeFile("./servers.js", str, function(err){
			if(err){
                                console.log("Error saving server configurations:\n"+err.message);
                        }else{
				console.log("Server configuration save complete.");
			}
		});
	}catch(e){
		console.log("Error saving server configurations:\n"+e.message);
	}
};

//routine function
function routine(){
	console.log("----"+Date()+"----");
	saveData();
}

//tell readyup that we're done adding stuff to wait for
ready.finish();
