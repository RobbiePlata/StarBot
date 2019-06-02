// Dependencies
tmi = require('tmi.js');
twitchClient = require('twitch').default;
fs = require('fs');
var readline = require('readline-sync');
var pirateSpeak = require('pirate-speak');

// twitch-tmi information
apikey = getBotAPI();
botusername = getBotUsername();
channelname = getChannelName();

// twitch-api information
var clientid = fs.readFileSync('./clientid.txt','utf8');
const accessToken = getAccessToken(clientid);
twitchClient = twitchClient.withCredentials(clientid, accessToken); 

// require json directories
var commandsJson = require("./commands.json");
var banmessagesJson = require("./banmessages.json");
var submessagesJson = require("./submessages.json");
var messagesJson = require("./messages.json");

sc2server = 'us'; // Sets a constraint on the selectable sc2unmasked accounts

/*
console.log("clientid: " + clientid);
console.log("apikey: " + apikey);
console.log("Access token: " + accessToken);
*/

var {PythonShell} = require('python-shell') // Allow the execution of python script
PythonShell.run('Stats Updater.py', null, function (err) {
    console.log("Recording records..")
    if (err) throw err;
  });

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

// Write out data to path
function writeToFile(filepath, data){
    fs.writeFile(filepath, data, function(err) {
        if(err) {
            return console.log(err);
        }
        console.log("The file was saved!");
    }); 
}

// If botusername is empty, ask user for bot username and write to file
function getBotUsername(){
    var botusername = fs.readFileSync('./botusername.txt','utf8');
    if(botusername !== ""){
        return botusername;
    }
    else{
        bot = readline.question("What is your bot's twitch username?");
        fs.writeFileSync("./botusername.txt", bot, function(err) {
            if(err) {
                return console.log(err);
            }
            console.log("Key saved");
            }); 
            try{
                return bot = fs.readFileSync('./botusername.txt','utf8');
            }catch(err){
                console.log(err);
            }
    }
}

// Get user access token
function getAccessToken(){
    var token = fs.readFileSync('./accesstoken.txt','utf8');
    // Token is present
    if(token !== ""){
        return token;
    }
    // Token is not present
    else{
        userTokenRetreival(); // Open browser for user to enter token
        writeAccessToken(); // Write access token to accesstoken.txt
            try{
                return token = fs.readFileSync('./accesstoken.txt','utf8');
            }catch(err){
                console.log(err);
            }
        }
}

// If channelname is empty, ask user for channelname & write channelname to file
function getChannelName(){
    var channelname = fs.readFileSync('./channelname.txt','utf8');
    if(channelname !== ""){
        return channelname;
    }
    else{
        name = readline.question("What is your stream channel?");
        fs.writeFileSync("./channelname.txt", name, function(err) {
            if(err) {
                return console.log(err);
            }
            console.log("name saved");
            }); 
            try{
                return bot = fs.readFileSync('./channelname.txt','utf8');
            }catch(err){
                console.log(err);
            }
    }

}

// Open chrome browser for user api confirmation and retrieval
function botAPIRetrieval(){
    var opn = require('opn');
        opn("https://twitchapps.com/tmi", {
        app: 'Chrome',
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
    var botapi = fs.readFileSync('./botapi.txt','utf8');
    if(botapi !== ""){
        return botapi;
    }
    else{
        botAPIRetrieval();
        console.log("A window as been launched to retrieve your key");
        api = readline.question("What is your bot's oath key?");
        fs.writeFileSync("./botapi.txt", api, function(err) {
            if(err) {
                return console.log(err);
            }
            console.log("Key saved");
            }); 
            try{
                return bot = fs.readFileSync('./botapi.txt','utf8');
            }catch(err){
                console.log(err);
            }
    }

}

// Open chrome browser for authentication token retrieval
function userTokenRetreival(){
    var opn = require('opn');
        opn("https://twitchtokengenerator.com/", {
        app: 'Chrome',
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
    var key = readline.question("What is main channel's authentication key?");
    fs.writeFileSync("./accesstoken.txt", key, function(err) {
    if(err) {
        return console.log(err);
    }
    console.log("Key saved");
    }); 
}

// Check if stream is live
async function isStreamLive(userName) {
	const user = await twitchClient.users.getUserByName(userName);
	if (!user) {
		return false;
	}
	return await user.getStream() !== null;
}

// Get uptime using the current time minus the startDate of stream (in milliseconds) then convert to standard time form
async function getUpTime(){
    if (await isStreamLive(channelname)){
        const user = await twitchClient.users.getUserByName(channelname);
        const stream = await user.getStream();
        var start = stream.startDate; // Start date
        var currentTime = new Date(); // Current time
        msdifference = (currentTime - start); // Difference
        output = convertUptime(msdifference);
        if(output.day === 0 && output.hour === 0 && output.minutes === 0){
            client.action(channelname, channelname + " has been live for " + output.seconds + " seconds");
        }
        else if(output.day === 0 && output.hour === 0){
            client.action(channelname, channelname + " has been live for " + output.minutes + " minutes " + output.seconds + " seconds");
        }
        else if(output.day === 0){
            client.action(channelname, channelname + " has been live for " + output.hour + " hours " + output.minutes + " minutes " + output.seconds + " seconds");
        }
        else if(output.day === 1){
            client.action(channelname, channelname + " has been live for " + output.day + " day " + output.hour + " hours " + output.minutes + " minutes " + output.seconds + " seconds");
        }
        else{
            client.action(channelname, channelname + " has been live for " + output.day + " days" + output.hour + " hours " + output.minutes + " minutes " + output.seconds + " seconds");
        }
    }
    else{
        client.action(channelname, "Stream is not live");
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

// Give me advice
async function advice(){
    https = require('https');
    var adviceapi = "https://api.adviceslip.com/advice";
    https.get(adviceapi, (resp) => {
        resp.on('data', (chunk) => {
            data = JSON.parse(chunk);
        });
        resp.on('end', () => {
            console.log(data.slip.advice);
            client.action(channelname, data.slip.advice);
        }).on("error", (err) => {
            client.action(channelname, "No advice for you");
          });
        });
}

async function shoutout(name){
    try{
        if(await isStreamLive(name)){
            const user = await twitchClient.users.getUserByName(name);
            const channel = await user.getChannel();
            client.action(channelname, "Give " + channel.displayName + " a follow at twitch.tv/" + channel.displayName + " They're live right now playing " + channel.game);
        }
        else{
            client.action(channelname, "Give " + name + " a follow at twitch.tv/" + name);
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
                    client.action(channelname, player1.name + " (" + player1race + "), " + mmr1 + " MMR" + " VS " + player2.name + " (" + player2race  + "), " + mmr2 + " MMR");
                }
                else{
                    client.action(channelname, channelname + " is in not in a game, or is in a replay");
                }
            });
        });
        
        }).on("error", (err) => {
          console.log("Starcraft needs to be open");
          client.action(channelname, "StarCraft must be open");
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

// Return stringified json entry
function constructJson(jsonKey, jsonValue){
    commandsJson[jsonKey] = jsonValue;
    var stringifyJson = JSON.stringify(commandsJson, null, 4);
    return stringifyJson;
}

// Connect to channel
var client = new tmi.client(options);

client.connect(channelname); 

//client.on('ping', () => console.log('[PING] Received ping.'));
function printCommands(json){
    console.log("\nCurrent Commands:");
    console.log("!shoutout twitchname");
    console.log("!add !command message");
    console.log("!remove !command");
    console.log("!addmessage message")
    console.log("!addsub message");
    console.log("!addban message");
    console.log("!uptime");
    console.log("");
    Object.keys(json).forEach(function(key) {
        console.log(key + ': ' + json[key])
    })
};

// Welcome Message
client.on('connected', function(address, port) {
    console.log("Welcome " + channelname + ", " + botusername + " is online!\n");
    client.action(channelname, "o7");
    printCommands(commandsJson);
    
});

// Cycle through messages every set interval
count = Math.floor(Math.random() * Object.keys(messagesJson).length); // Start count on a random number (So first message is random)
setInterval(() => {
    messages = require('./messages.json'); // (Allow newly added commands to be recognized every interval)
    if(count <= Object.keys(messages).length - 1){
        client.action(channelname, messagesJson[count]);
    }
    else{
        count = 0;
        client.action(channelname, messagesJson[count]);
    }
    count = count + 1;
}, messageInterval.interval); 

// Hosted
client.on("hosted", (channel, username, viewers, autohost) => {
    client.action(channelname, "\"IM CULTIVATING MASS\"")
});

// Subscription
client.on("subscription", function (channel, username, message, userstate) {
    var submessagesJson = require("./submessages.json");
    var random = Math.floor(Math.random() * Object.keys(submessagesJson).length);
    var message = submessagesJson[random];
    strArrayMessage = message.split(" ");
    //console.log(strArrayMessage);
    for(index = 0; index < strArrayMessage.length; index ++){
        if(strArrayMessage[index].toLowerCase() == "user"){
            strArrayMessage[index] = username;
        }
    }
    strArrayMessage = strArrayMessage.join(" ");
    client.action(channelname, strArrayMessage);
});

// Resub
client.on("resub", function (channel, username, months, message) {
    var submessagesJson = require("./submessages.json");
    var random = Math.floor(Math.random() * Object.keys(submessagesJson).length);
    var message = submessagesJson[random];
    strArrayMessage = message.split(" ");
    for(index = 0; index < strArrayMessage.length; index ++){
        if(strArrayMessage[index].toLowerCase() == "user"){
            strArrayMessage[index] = username;
        }
    }
    strArrayMessage = strArrayMessage.join(" ");
    client.action(channelname, strArrayMessage);
});

// Ban
client.on("ban", (channel, username, reason) => {
    var banmessagesJson = require("./banmessages.json");
    var random = Math.floor(Math.random() * Object.keys(banmessagesJson).length);
    var message = banmessagesJson[random];
    strArrayMessage = message.split(" ");
    for(index = 0; index < strArrayMessage.length; index ++){
        if(strArrayMessage[index].toLowerCase() == "user"){
            strArrayMessage[index] = username;
        }
    }
    strArrayMessage = strArrayMessage.join(" ");
    client.action(channelname, strArrayMessage);    
});

// Commands
client.on('chat', function(channel, user, message, self){
    
    // Respond to user command using commands.json
    if(commandsJson.hasOwnProperty(message)){
        try{
            client.action(channelname, commandsJson[message]);       
        }catch(error){
            console.log(error);
        }
    }

    // Replace exclamation point and create string array
    try{
        messageMinusExclamation = message.replace('/!/g','');
        var strArray = messageMinusExclamation.split(" ");
    }catch(err){
        console.log(err);
    }

    // Get Uptime
    if(strArray[0] === ("!uptime")){
        getUpTime(); // TODO get object and post uptime to chat
    }
    
    // Respond with Starcraft II opponent of streamer NOT FINISHED
    if(strArray[0] === ("!opponent")){
        getOpponent();
    }

    // Execute Replay renamer.py script
    if(strArray[0] === ("!replaypack")){
        if(user.username === channelname || user.username === channelname.toLowerCase()){
        client.action(channelname, "Working on it");
        PythonShell.run('renamer.py', null, function (err) {
            if (err) throw err;
            client.action(channelname, "Replaypack finished");
          });
        }
    }

    // Add command to commands.json
    if(strArray[0] === ("!add")){
        if(user.username === channelname || user.username === channelname.toLowerCase()){
            if (strArray.length < 3){
                client.action(channelname, "Command format: \"!add !command message\"");
            }
            else if (strArray[1].charAt(0) == "!"){
                var sentenceArray = strArray.slice(); // Clone array
                sentenceArray.shift();
                sentenceArray.shift();
                var json = constructJson(strArray[1], sentenceArray.join(" ").toString());
                fs.writeFileSync("./commands.json", json, finished());
                function finished(error){
                    client.action(channelname, "command " + strArray[1] +" added");
                }
            }
            else{
                client.action(channelname, "Use an exclamation point at the start of the command you want to add");
            }
        }
        else{
            client.action(channelname, "You can't tell me what to do");
        }
    }

    // Remove command from commands.json
    if(strArray[0] === ("!remove")){
        if(user.username === channelname.user || user.username === channelname.toLowerCase()){
            if(strArray.length < 2 || strArray.length > 2){
                client.action(channelname, "To remove a command, type \"!remove\"");
            }
            if(strArray.length === 2){
                if(strArray[1].charAt(0) == "!"){
                    delete commandsJson[strArray[1]];
                    strJson = JSON.stringify(commandsJson, null, 4);
                    fs.writeFileSync("./commands.json", strJson, finished());
                    function finished(error){
                        client.action(channelname, "command " + strArray[1] +" removed");
                    }
                }
                else{
                    client.action(channelname, "Use an exclamation point at the start of the command you want to remove");
                }
            }
        }
        else{
            client.action(channelname, "You can't tell me what to do");
        }
    }
    
    // Add sub message
    if(strArray[0] === ("!addsub")){
        if(user.username === channelname || user.username === channelname.toLowerCase()){
            if (strArray.length < 2){
                client.action(channelname, "To add a sub message type \"!addsub message here\"");
            }
            else if (strArray.length >= 2){
                var sentenceArray = strArray.slice(); // Clone array
                sentenceArray.shift();
                keyvalue = Object.keys(submessagesJson).length;
                submessagesJson[keyvalue] = sentenceArray.join(" ");
                strJson = JSON.stringify(submessagesJson, null, 4);
                fs.writeFileSync("./submessages.json", strJson, finished());
                function finished(error){
                    client.action(channelname, sentenceArray.join(" ") + " submessage added!");
                }
            }   
        }
        else{
            client.action(channelname, "You can't tell me what to do");
        }
    }

    // Add user ban message
    if(strArray[0] === ("!addban")){
        if(user.username === channelname || user.username === channelname.toLowerCase()){
            if (strArray.length < 2){
                client.action(channelname, "To add a ban message type \"!addban message here\"");
            }
            else if (strArray.length >= 2){
                var sentenceArray = strArray.slice(); // Clone array
                sentenceArray.shift();
                keyvalue = Object.keys(banmessagesJson).length;
                banmessagesJson[keyvalue] = sentenceArray.join(" ");
                strJson = JSON.stringify(banmessagesJson, null, 4);
                fs.writeFileSync("./banmessages.json", strJson, finished());
                function finished(error){
                    client.action(channelname, sentenceArray.join(" ") + " submessage added!");
                }
            }   
        }
        else{
            client.action(channelname, "You can't tell me what to do");
        }
    }

    // Add periodic message 
    if(strArray[0] === ("!addmessage")){
        if(user.username === channelname || user.username === channelname.toLowerCase()){
            if (strArray.length < 2){
                client.action(channelname, "To add a message type \"!addmessage message here\"");
            }
            else if (strArray.length >= 2){
                var sentenceArray = strArray.slice(); // Clone array
                sentenceArray.shift();
                keyvalue = Object.keys(messagesJson).length;
                messagesJson[keyvalue] = sentenceArray.join(" ");
                strJson = JSON.stringify(messagesJson, null, 4);
                fs.writeFileSync("./messages.json", strJson, finished());
                function finished(error){
                    client.action(channelname, sentenceArray.join(" ") + " message added!");
                }
            }   
        }
        else{
            client.action(channelname, "You can't tell me what to do");
        }
    }

    // Remove sub message
    if(strArray[0] === ("!removesub")){
    }

    // Remove user ban message
    if(strArray[0] === ("!removeban")){
    }

    // Remove periodic message 
    if(strArray[0] === ("!removemessage")){
    }

    // Add message that appears every messageInterval
    if(strArray[0] === ("!shoutout")){
        if(user.username === channelname || user.username === channelname.toLowerCase()){
            if (strArray.length < 2){
                client.action(channelname, "Shoutout who?");
            }
            else if (strArray.length == 2){
                shoutout(strArray[1]);
            }
        }
    }

    // Add message that appears every messageInterval
    if(strArray[0] === ("!pirate")){
        if (strArray.length < 2){
            client.action(channelname, "To talk like a pirate type \"!pirate message here\"");
        }
        else if (strArray.length >= 2){
            var sentenceArray = strArray.slice(); // Clone array
            sentenceArray.shift();
            client.action(channelname, pirateSpeak.translate(sentenceArray.join(" ")));
        }   
    }
});