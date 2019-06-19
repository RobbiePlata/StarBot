/// Robert Plata
/// Latest 6.2.2019 11:55pm
/// Flexible Twitch Bot for use with Starcraft II
/// Utilized by professional Starcraft players to enhance the viewers' experience

// Dependencies
var ClientHolder = require('./ClientHolder');
var tmi = require('tmi.js');
var fs = require('fs');
var readline = require('readline-sync');
var pirateSpeak = require('pirate-speak');
var config = require("./config.json");

// twitch-tmi information
apikey = getBotAPI();
botusername = getBotUsername();
channelname = getChannelName();
replaypath = getReplayPath();

// twitch-api and game information
var clientid = config.App.Channel.clientid;
const accessToken = getAccessToken(clientid);
(async() => {
    await ClientHolder.init(clientid, accessToken);
})();
sc2server = config.App.Game.region; // Sets a constraint on the selectable sc2unmasked accounts

// Twitch Information
var options = {
    options: {
        debug: true
    },
    connection: {
        reconnect: true
    },
    identity: {
        username: botusername,
        password: apikey    
    },
    channels: [channelname]
};

// 15 minutes = 900000
var messageInterval = {
    time: 900000,
    get interval(){
        return messageInterval.time;
    },
    set interval(value) {
      this.time = value * 60000;
    }
};

// If botusername is empty, ask user for bot username and write to file
function getReplayPath(){
    var path = config.App.Game.path;
    if(path !== "" && path !== undefined){
        return path.replace(/\\/g, "/");
    }
    else{
        path = readline.question("What is the path of your Starcraft II replay folder?");
        config.App.Game.path = path.replace(/\\/g, "/");
        fs.writeFileSync("./config.json", JSON.stringify(config, null, 4), function(err) {
            if(err) {
                return console.log(err);
            }
            console.log("Path saved. If you made a mistake, you can change it later in config.json");
            }); 
            try{
                return config.App.Game.path;
            }catch(err){
                console.log(err);
            }
    }
}

// If botusername is empty, ask user for bot username and write to file
function getBotUsername(){
    var botusername = config.App.Bot.name;
    if(botusername !== "" && botusername !== undefined){
        return botusername;
    }
    else{
        bot = readline.question("Bot's Username: ");
        config.App.Bot.name = bot;
        fs.writeFileSync("./config.json", JSON.stringify(config, null, 4), function(err) {
            if(err) {
                return console.log(err);
            }
            console.log("Username saved");
            }); 
            try{
                return config.App.Bot.name;
            }catch(err){
                console.log(err);
            }
    }
}

// Get user access token
function getAccessToken(){
    var token = config.App.Channel.accessToken;
    // Token is present
    if(token !== "" && token !== undefined){
        return token;
    }
    // Token is not present
    else{
        userTokenRetreival(); // Open browser for user to enter token
        writeAccessToken(); // Write access token to accesstoken.txt
            try{
                return token = config.App.Channel.accessToken;
            }catch(err){
                console.log(err);
            }
        }
}

// Open web browser for authentication token retrieval
function userTokenRetreival(){
    var opn = require('opn');
        opn("https://twitch.center/token", {
        wait: true
    }).then(function(cp) {
        //console.log('child process:',cp);
        //console.log('worked');
    }).catch(function(err) {
        //console.error(err);
    });
}

// Write authentication token to file
function writeAccessToken(){
    var key = readline.question("Check all scopes, generate token, then enter the code here: ");
    config.App.Channel.accessToken = key;
        fs.writeFileSync("./config.json", JSON.stringify(config, null, 4), function(err) {
            if(err) {
                return console.log(err);
            }
            console.log("Access Token saved");
        });
        try{
            return config.App.Channel.accessToken;
        }catch(err){
            console.log(err);
        }
}

// If channelname is empty, ask user for channelname & write channelname to file
function getChannelName(){
    var channelname = config.App.Channel.name;
    if(channelname !== "" && channelname !== undefined){
        return channelname;
    }
    else{
        name = readline.question("Enter your stream channel: ");
        config.App.Channel.name = name;
        fs.writeFileSync("./config.json", JSON.stringify(config, null, 4), function(err) {
            if(err) {
                return console.log(err);
            }
            console.log("Username saved");
            }); 
            try{
                return config.App.Channel.name;
            }catch(err){
                console.log(err);
            }
    }
}

// Open web browser for user api confirmation and retrieval
function botAPIRetrieval(){
    var opn = require('opn');
        opn("https://twitchapps.com/tmi", {
        wait: true
    }).then(function(cp) {
        //console.log('child process:',cp);
        //console.log('worked');
    }).catch(function(err) {
        //console.error(err);
    });
}

// If botapi is empty, ask user for prompt user for bot api and write to file
function getBotAPI(){
    var botapi = config.App.Bot.apikey;
    if(botapi !== "" && botapi !== undefined){
        return botapi;
    }
    else{
        botAPIRetrieval();
        api = readline.question("Enter your Bot's Oauth key: ");
        config.App.Bot.apikey = api;
        fs.writeFileSync("./config.json", JSON.stringify(config, null, 4), function(err) {
            if(err) {
                return console.log(err);
            }
            console.log("Bot API key saved");
            }); 
            try{
                return config.App.Bot.apikey;
            }catch(err){
                console.log(err);
            }
    }
}

// Check if stream is live
async function isStreamLive(userName) {
    client = ClientHolder.getClient();
	const user = await client.helix.users.getUserByName(userName);
	if (!user) {
		return false;
	}
	return user.getStream();
}

// Get uptime using the current time minus the startDate of stream (in milliseconds) then convert to standard time form
async function getUpTime(){
    if (await isStreamLive(channelname)){
        client = ClientHolder.getClient();
        const user = await client.helix.users.getUserByName(channelname);
        const stream = user.getStream();
        var start = stream.startDate; // Start date
        var currentTime = new Date(); // Current time
        msdifference = (currentTime - start); // Difference
        output = convertUptime(msdifference);
        if(output.day === 0 && output.hour === 0 && output.minutes === 0){
            chat.action(channelname, channelname + " has been live for " + output.seconds + " seconds");
        }
        else if(output.day === 0 && output.hour === 0){
            chat.action(channelname, channelname + " has been live for " + output.minutes + " minutes " + output.seconds + " seconds");
        }
        else if(output.day === 0){
            chat.action(channelname, channelname + " has been live for " + output.hour + " hours " + output.minutes + " minutes " + output.seconds + " seconds");
        }
        else if(output.day === 1){
            chat.action(channelname, channelname + " has been live for " + output.day + " day " + output.hour + " hours " + output.minutes + " minutes " + output.seconds + " seconds");
        }
        else{
            chat.action(channelname, channelname + " has been live for " + output.day + " days" + output.hour + " hours " + output.minutes + " minutes " + output.seconds + " seconds");
        }
    }
    else{
        chat.action(channelname, "Stream is not live");
    }
}

// Convert milliseconds into uptime literal
function convertUptime(milliseconds) {
    var day, hour, minutes, seconds;
    seconds = Math.floor(milliseconds / 1000);
    minutes = Math.floor(seconds / 60);
    seconds = seconds % 60;
    hour = Math.floor(minutes / 60);
    minutes = minutes % 60;
    day = Math.floor(hour / 24);
    hour = hour % 24;
    return {
        day: day,
        hour: hour,
        minutes: minutes,
        seconds: seconds
    };
}

async function shoutout(name){
    try{
        if(await isStreamLive(name)){
            client = ClientHolder.getClient();
            const user = await client.users.getUserByName(name);
            const channel = await user.getChannel();
            chat.action(channelname, "Give " + channel.displayName + " a follow at twitch.tv/" + channel.displayName + " They're live right now playing " + channel.game);
        }
        else{
            chat.action(channelname, "Give " + name + " a follow at twitch.tv/" + name);
        }
    } catch (err) { console.log(err) }
}

// Search Sc2Unmasked and return MMRs of two players
async function searchSC2Unmasked(player1, player2, callback){
    http = require('http');
    var player1search = "http://sc2unmasked.com/API/Player?name=" + player1.name + "&server=" + sc2server + "&race=" + getMatchup(player1.race).toLowerCase();
    var player2search = "http://sc2unmasked.com/API/Player?name=" + player2.name + "&server=" + sc2server + "&race=" + getMatchup(player2.race).toLowerCase();
    async function getMMR(playerdata, player, callback){
        mmr = 0;
        for (i = 0; i < playerdata.players.length; i++){
            if(playerdata.players[i].acc_name == player.name && playerdata.players[i].server == sc2server && playerdata.players[i].mmr > mmr){
                mmr = playerdata.players[i].mmr;
            }
        }
        callback(mmr);
    }

    async function requestSC2Unmasked(playersearch, player, callback){
        http.get(playersearch, (resp) => {
            playerdatastr ="";
            resp.on('data', (chunk) => {
                playerdatastr += chunk;
            });
            
            resp.on('end', () => {
                if(playerdatastr != ""){
                    playerdata = JSON.parse(playerdatastr);
                    mmr = getMMR(playerdata, player, function(mmr){
                        callback(mmr);
                    })
                }
                else{
                    callback("?","?");
                }
            });
    
            }).on("error", (err) => {
                console.log(err);
                mmr1 = "?";
                callback(mmr);
            });
    }

    mmr1 = requestSC2Unmasked(player1search, player1, function(mmr1){
        mmr2 = requestSC2Unmasked(player2search, player2, function(mmr2){
            callback(mmr1, mmr2);
        })
    })
}

// Get starcraft opponent if you're running this application locally
async function getOpponent(){
    http = require('http');
    var gameurl = "http://localhost:6119/game"; //StarCraft 2 Port
    http.get(gameurl, (resp) => {
        resp.on('data', (chunk) => {
            data = JSON.parse(chunk);
        });
        resp.on('end', () => {
            console.log(data);
            searchSC2Unmasked(data.players[0], data.players[1], function(mmr1, mmr2){
                if(data.isReplay == false){
                    console.log(mmr1, mmr2);
                    players = data.players;
                    player1 = players[0];
                    player1race = getMatchup(player1.race);
                    player2 = players[1];
                    player2race = getMatchup(player2.race);
                    chat.action(channelname, player1.name + " (" + player1race + "), " + mmr1 + " MMR" + " VS " + player2.name + " (" + player2race  + "), " + mmr2 + " MMR");
                }
                else{
                    chat.action(channelname, channelname + " is in not in a game, or is in a replay");
                }
            });
        });
        
        }).on("error", (err) => {
          console.log("Starcraft needs to be open");
          chat.action(channelname, "StarCraft must be open");
        });
}

// Get Starcraft II matchup
function getMatchup(race){
    if(race == "Prot"){
        race = 'P';
    }
    if(race == "Zerg"){
        race = 'Z';
    }
    if(race == "Terr"){
        race = 'T';
    }
    return race;
}

// Connect to channel
var chat = new tmi.client(options);

chat.connect(channelname); 

try{
    var {PythonShell} = require('python-shell') // Allow the execution of python script
    PythonShell.run('Stats Updater.py', null, function (err) {
        console.log("Recording records..")
        if (err) throw err;
      });
} catch { }

//client.on('ping', () => console.log('[PING] Received ping.'));
function printCommands(){
    try{
        commands = config.Commands;
        console.log("\nCurrent Commands:");
        console.log("!shoutout twitchname");
        console.log("!add !command message");
        console.log("!remove !command");
        console.log("!addmessage message")
        console.log("!addsub message");
        console.log("!addban message");
        console.log("!uptime");
        console.log("!addhostmessage");
        console.log("!addwelcome");
        console.log("");
        Object.keys(commands).forEach(function(key) {
            console.log(key + ': ' + commands[key])
        })
    } catch { }
};

// Welcome Message
chat.on('connected', function(address, port) {
    try{
        console.log("Welcome " + channelname + ", " + botusername + " is online!\n");
        var welcomemessages = config.Alerts.WelcomeMessages;
        var random = Math.floor(Math.random() * Object.keys(welcomemessages).length);
        var welcomemessage = welcomemessages[random];
        chat.action(channelname, welcomemessage);
        printCommands();
    } catch { }
});

// Cycle through messages every set interval
try{
    if(Object.keys(config.Alerts.Messages).length !== 0){
        count = Math.floor(Math.random() * Object.keys(config.Alerts.Messages).length); // Start count on a random number (So first message is random)
        setInterval(() => {
            messages = config.Alerts.Messages // (Allow newly added commands to be recognized every interval)
            if(count <= Object.keys(messages).length - 1){
                chat.action(channelname, config.Alerts.Messages[count]);
            }
            else{
                count = 0;
                chat.action(channelname, config.Alerts.Messages[count]);
            }
            count = count + 1;
        }, messageInterval.interval); 
    }
} catch { }

// Hosted
chat.on("hosted", (channel, username, viewers, autohost) => {
    if(Object.keys(config.Alerts.HostMessages).length !== 0){
        try{
            var hostmessages = config.Alerts.HostMessages;
            var random = Math.floor(Math.random() * Object.keys(hostmessages).length);
            var hostmessage = hostmessages[random];
            strArrayMessage = hostmessage.split(" ");
            for(index = 0; index < strArrayMessage.length; index ++){
                if(strArrayMessage[index].toLowerCase() == "user"){
                    strArrayMessage[index] = username;
                }
                if(strArrayMessage[index].toLowerCase() == "viewers"){
                    strArrayMessage[index] = viewers;
                }
            }
            strArrayMessage = strArrayMessage.join(" ");
            chat.action(channelname, strArrayMessage);
        } catch { }
    }
});

// Subscription
chat.on("subscription", function (channel, username, message, userstate) {
    try{
        var submessages = config.Alerts.Submessages;
        var random = Math.floor(Math.random() * Object.keys(submessages).length);
        var submessage = submessages[random];
        strArrayMessage = submessage.split(" ");
        //console.log(strArrayMessage);
        for(index = 0; index < strArrayMessage.length; index ++){
            if(strArrayMessage[index].toLowerCase() == "user"){
                strArrayMessage[index] = username;
            }
        }
        strArrayMessage = strArrayMessage.join(" ");
        chat.action(channelname, strArrayMessage);
    } catch { }
});

// Resub
chat.on("resub", function (channel, username, months, message) {
    try{
        var submessages = config.Alerts.Submessages;
        var random = Math.floor(Math.random() * Object.keys(submessages).length);
        var resubmessage = submessages[random];
        strArrayMessage = resubmessage.split(" ");
        for(index = 0; index < strArrayMessage.length; index ++){
            if(strArrayMessage[index].toLowerCase() == "user"){
                strArrayMessage[index] = username;
            }
        }
        strArrayMessage = strArrayMessage.join(" ");
        chat.action(channelname, strArrayMessage);
    } catch { }
});

// Ban
chat.on("ban", (channel, username, reason) => {
    try{
        var banmessages = config.Alerts.BanMessages;
        var random = Math.floor(Math.random() * Object.keys(banmessages).length);
        var banmessage = banmessages[random];
        strArrayMessage = banmessage.split(" ");
        for(index = 0; index < strArrayMessage.length; index ++){
            if(strArrayMessage[index].toLowerCase() == "user"){
                strArrayMessage[index] = username;
            }
        }
        strArrayMessage = strArrayMessage.join(" ");
        chat.action(channelname, strArrayMessage);    
    } catch { }
});

// Commands
chat.on('chat', function(channel, user, message, self){   
    
    // Respond to user command using commands
    try{
        if(config.Commands.hasOwnProperty(message)){
            try{
                chat.action(channelname, config.Commands[message]);       
            }catch(error){
                console.log(error);
            }
        }
    } catch { }
    
    // Replace exclamation point and create string array
    try{
        messageMinusExclamation = message.replace('/!/g','');
        var strArray = messageMinusExclamation.split(" ");
    }catch(err){
        console.log(err);
    }

    // Get Uptime
    if(strArray[0] === ("!uptime")){
        try{
            getUpTime(); // TODO get object and post uptime to chat
        } catch { }
    }
    
    // Respond with Starcraft II opponent of streamer NOT FINISHED
    if(strArray[0] === ("!opponent")){
        try{
            getOpponent();
        } catch { }
    }

    // Execute Replay Renamer.py script
    if(strArray[0] === ("!replaypack")){
        try{
            if(user.username === channelname || user.username === channelname.toLowerCase()){
                chat.action(channelname, "Working on it");
                PythonShell.run('Renamer.py', null, function (err) {
                    if (err) throw err;
                    chat.action(channelname, "Replaypack finished");
                  });
                }
        } catch { }
    }

    // Add command to commands
    if(strArray[0] === ("!add")){
        try{
            if(user.username === channelname || user.username === channelname.toLowerCase()){
                if (strArray.length < 3){
                    chat.action(channelname, "Command format: \"!add !command message\"");
                }
                else if (strArray[1].charAt(0) == "!"){
                    var sentenceArray = strArray.slice(); // Clone array
                    sentenceArray.shift();
                    sentenceArray.shift();
                    config.Commands[strArray[1]] = sentenceArray.join(" ").toString();
                    fs.writeFileSync("./config.json", JSON.stringify(config, null, 4), finished());
                    function finished(error){
                        chat.action(channelname, "command " + strArray[1] +" added");
                    }
                }
                else{
                    chat.action(channelname, "Use an exclamation point at the start of the command you want to add");
                }
            }
            else{
                chat.action(channelname, "You can't tell me what to do");
            }
        } catch { }
    }

    // Remove command from commands
    if(strArray[0] === ("!remove")){
        try{
            if(user.username === channelname.user || user.username === channelname.toLowerCase()){
                if(strArray.length < 2 || strArray.length > 2){
                    chat.action(channelname, "To remove a command, type \"!remove\"");
                }
                if(strArray.length === 2){
                    if(strArray[1].charAt(0) == "!"){
                        delete config.Commands[strArray[1]];
                        strConfig = JSON.stringify(config, null, 4);
                        fs.writeFileSync("./config.json", strConfig, finished());
                        function finished(error){
                            chat.action(channelname, "command " + strArray[1] +" removed");
                        }
                    }
                    else{
                        chat.action(channelname, "Use an exclamation point at the start of the command you want to remove");
                    }
                }
            }
            else{
                chat.action(channelname, "You can't tell me what to do");
            }
        } catch { }
    }
    
    // Add sub message
    if(strArray[0] === ("!addsub")){
        try{
            if(user.username === channelname || user.username === channelname.toLowerCase()){
                if (strArray.length < 2){
                    chat.action(channelname, "To add a sub message type \"!addsub message here\"");
                }
                else if (strArray.length >= 2){
                    var sentenceArray = strArray.slice(); // Clone array
                    sentenceArray.shift();
                    keyvalue = Object.keys(config.Alerts.SubMessages).length;
                    config.Alerts.SubMessages[keyvalue] = sentenceArray.join(" ").toString();
                    fs.writeFileSync("./config.json", JSON.stringify(config, null, 4), finished());
                    function finished(error){
                        chat.action(channelname, sentenceArray.join(" ") + " submessage added!");
                    }
                }   
            }
            else{
                chat.action(channelname, "You can't tell me what to do");
            }
        } catch { }
        
    }

    // Add user ban message
    if(strArray[0] === ("!addban")){
        try{
            if(user.username === channelname || user.username === channelname.toLowerCase()){
                if (strArray.length < 2){
                    chat.action(channelname, "To add a sub message type \"!addsub message here\"");
                }
                else if (strArray.length >= 2){
                    var sentenceArray = strArray.slice(); // Clone array
                    sentenceArray.shift();
                    keyvalue = Object.keys(config.Alerts.BanMessages).length;
                    config.Alerts.BanMessages[keyvalue] = sentenceArray.join(" ").toString();
                    fs.writeFileSync("./config.json", JSON.stringify(config, null, 4), finished());
                    function finished(error){
                        chat.action(channelname, sentenceArray.join(" ") + " banmessage added!");
                    }
                }   
            }
            else{
                chat.action(channelname, "You can't tell me what to do");
            }
        } catch { }
    }

    // Add periodic message 
    if(strArray[0] === ("!addmessage")){
        try{
            if(user.username === channelname || user.username === channelname.toLowerCase()){
                if (strArray.length < 2){
                    chat.action(channelname, "To add a sub message type \"!add message here\"");
                }
                else if (strArray.length >= 2){
                }
            }
            else{
                chat.action(channelname, "You can't tell me what to do");
            }
        } catch { }
    }

    // Remove sub message
    if(strArray[0] === ("!removesub")){
        try{

        } catch { }
    }

    // Remove user ban message
    if(strArray[0] === ("!removeban")){
        try{

        } catch { }
    }

    // Remove periodic message 
    if(strArray[0] === ("!removemessage")){
        try{

        } catch { }
    }

    // Add messages that appear everytime you start the bot
    if(strArray[0] === ("!addwelcome")){
        try{
            if(user.username === channelname || user.username === channelname.toLowerCase()){
                if(strArray.length < 2){
                    chat.action(channelname, "To change your welcome message, type \"!addwelcome message here\"");
                }
                else if(strArray.length >= 2){
                    var sentenceArray = strArray.slice(); // Clone array
                    sentenceArray.shift();
                    keyvalue = Object.keys(config.Alerts.WelcomeMessages).length;
                    config.Alerts.WelcomeMessage[keyvalue] = sentenceArray.join(" ").toString();
                    fs.writeFileSync("./config.json", JSON.stringify(config, null, 4), finished());
                    function finished(error){
                        chat.action(channelname, sentenceArray.join(" ") + " welcomemessage added!");
                    }
                }
            }
            else{
                chat.action(channelname, "You can't tell me what to do");
            }
        } catch { }
    }

    // Add messages that appears every host
    if(strArray[0] === ("!addhostmessage")){
        try{
            if(user.username === channelname || user.username === channelname.toLowerCase()){
                if(strArray.length < 2){
                    chat.action(channelname, "To add a host message, type \"!addhostmessage message here\"");
                }
                else if(strArray.length >= 2){
                    var sentenceArray = strArray.slice(); // Clone array
                    sentenceArray.shift();
                    keyvalue = Object.keys(config.Alerts.HostMessages).length;
                    config.Alerts.HostMessages[keyvalue] = sentenceArray.join(" ").toString();
                    fs.writeFileSync("./config.json", JSON.stringify(config, null, 4), finished());
                    function finished(error){
                        chat.action(channelname, sentenceArray.join(" ") + " host message added!");
                    }
                }
            }
            else{
                chat.action(channelname, "You can't tell me what to do");
            }
        } catch { }
    }

    // Add message that appears every messageInterval
    if(strArray[0] === ("!shoutout")){
        try{
            if(user.username === channelname || user.username === channelname.toLowerCase()){
                if (strArray.length < 2){
                    chat.action(channelname, "Shoutout who?");
                }
                else if (strArray.length == 2){
                    shoutout(strArray[1]);
                }
            }
        } catch { }
        
    }

    // Add message that appears every messageInterval
    if(strArray[0] === ("!pirate")){
        try{
            if (strArray.length < 2){
                chat.action(channelname, "To talk like a pirate type \"!pirate message here\"");
            }
            else if (strArray.length >= 2){
                var sentenceArray = strArray.slice(); // Clone array
                sentenceArray.shift();
                chat.action(channelname, pirateSpeak.translate(sentenceArray.join(" ")));
            }   
        } catch { }
    }

    // Kill chat bot while keeping other functionality
    if(strArray[0] === ("!killbot")){
        try{
            if(user.username === channelname || user.username === channelname.toLowerCase()){
                chat.action(channelname, "Goodbye");
                chat = null;
            }
        } catch { }
    }

});