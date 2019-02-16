/*
Install Node JS ('install this')
Run 'run.batch' in file explorer
*/

tmi = require('tmi.js');
twitchClient = require('twitch').default;
fs = require('fs');
var readline = require('readline-sync');

apikey = getBotAPI();
botusername = getBotUsername();
channelname = getChannelName();

var clientid = fs.readFileSync('./clientid.txt','utf8');
const accessToken = getAccessToken(clientid);
twitchClient = twitchClient.withCredentials(clientid, accessToken);

console.log("clientid: " + clientid);
console.log("apikey: " + apikey);
console.log("Access token: " + accessToken);

// require json directories
var commandsJson = require("./commands.json");
var banmessagesJson = require("./banmessages.json");
var submessagesJson = require("./submessages.json");

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

// Write 
function writeToFile(filepath, data){
    fs.writeFile(filepath, data, function(err) {
        if(err) {
            return console.log(err);
        }
        console.log("The file was saved!");
    }); 
}

// Get botusername
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


function botAPIRetreival(){
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

function getBotAPI(){
    var botapi = fs.readFileSync('./botapi.txt','utf8');
    if(botapi !== ""){
        return botapi;
    }
    else{
        botAPIRetreival();
        console.log("A window as been launched to retreive your key");
        api = readline.question("What is your bot's key?");
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
function writeAccessToken(){
    var key = readline.question("What is main channel's authentication key?");
    fs.writeFileSync("./accesstoken.txt", key, function(err) {
    if(err) {
        return console.log(err);
    }
    console.log("Key saved");
    }); 
}

// If bot alive
var alive = true;

// Connect to channel
var client = new tmi.client(options);

client.connect();

//client.on('ping', () => console.log('[PING] Received ping.'));

function printCommands(json){
    console.log("Current Commands: \n");
    Object.keys(json).forEach(function(key) {
        console.log(key + ': ' + json[key])
    })
    console.log("\nOnly + " + channelname + " has edit authority in chat:");
    console.log("!Welcome to change welcome message");
    console.log("To add commands !add !command message");
    console.log("To remove commands !remove !command");
    console.log("To add sub message, !addsubmessage message");
    console.log("To add ban message !addbanmessage message");
};

// Welcome Message
client.on('connected', function(address, port) {
    console.log("Welcome " + channelname + ", " + botusername + " is online!\n");
    client.action(channelname, "\"Hey asshole\"");
    printCommands(commandsJson);
    
});

// Hosted
client.on("hosted", (channel, username, viewers, autohost) => {
    client.action(channelname, "\"IM CULTIVATING MASS\"")
});

// Subscription
client.on("subscription", (channel, username, method, message, userstate) => {
    client.action(channelname, "\"Hey-o! What’s up, bitches!\"")
});

// Ban
client.on("ban", (channel, username, reason) => {
    client.action(channelname, "\"" + username + " Dies (Part 1)\"")
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
        console.log(strArray.length);
    }catch(err){
        console.log(err);
    }

    // Change Welcome
    if(strArray[0] === ("!welcome")){

    }

    // Add command to commands.json
    if(strArray[0] === ("!add")){
        if(user.username === channelname || user.username === channelname.toLowerCase()){
            console.log(strArray);
            if (strArray.length < 3){
                client.action(channelname, "Command format: \"!add !command message\"");
            }
            else if (strArray[1].charAt(0) == "!"){
                var sentenceArray = strArray.slice(); // Clone array
                sentenceArray.shift();
                sentenceArray.shift();
                console.log(sentenceArray);
                var json = constructJson(strArray[1], sentenceArray.join(" ").toString());
                var fs = require('fs');
                fs.writeFile("./commands.json", json, finished);
                function finished(error){
                    console.log("Command added");
                }
            }
            else{
                client.action(channelname, "Use an exclamation point for your command");
            }
        }
        else{
            client.action(channelname, "\"You can't tell me what to do jabroni\"");
        }
    }

    // Remove command from commands.json GOOD NOT FINISHED
    if(strArray[0] === ("!remove")){
        if(user.username === channelname.user || user.username === channelname.toLowerCase()){
            if(strArray.length < 2 || strArray.length > 2){
                client.action(channelname, "To remove a command, type \"!remove\"");
            }
            if(strArray.length === 2){
                client.action(channelname, "command " + strArray[1] +" removed");
            }
        }
        else{
            client.action(channelname, "Nice try jabroni");
        }
    }
    
    // Add sub message to submessages.json NOT FINISHED
    if(strArray[0] === ("!addsubmessage")){
        if(user.username === channelname || user.username === channelname.toLowerCase()){
            
            if (strArray.length < 2 || strArray.length > 3){
                client.action(channelname, "To add a command, type \"!addsubmessage\"");
            }
            if (strArray.length === 3){
                client.action(channelname, "!" + strArray[1] + " submessage added!");
            }   
        }
        else{
            client.action(channelname, "Nice try");
        }
    }

    // Add user ban message NOT FINISHED
    if(strArray[0] === ("!addbanmessage")){
        if(user.username === channelname.user || user.username === channelname.toLowerCase()){
            messageMinusExclamation = message.replace('/!/g','');
            var strArray = messageMinusExclamation.split(" ");
            if(strArray.length < 2 || strArray.length > 2){
                client.action(channelname, "To add a ban message, type \"!addbanmessage\"");
            }
            if(strArray.length === 2){
                client.action(channelname, strArray[1] + " has been added as as a ban message");
            }
        }
        else{
            client.action(channelname, "Nice try");
        }
    }
    
    // Respond with Starcraft II opponent of streamer NOT FINISHED
    if(strArray[0] === ("!opponent")){
        // client.action(channelname, opponent string);
    }

    // Bot kill NOT FINISHED
    if(strArray[0] === ("!off")){
        if(user.username === channelname || user.username === channelname.toLowerCase()){
            client.action(channelname, "I'll just regress, because I feel I've made myself perfectly redundant");
        }
    }

    // Bot alive NOT FINISHED
    if(strArray[0] === ("!on")){
        if(user.username === channelname || user.username === channelname.toLowerCase()){
            client.action(channelname, "A CROOKED COP! YEAH I GET IT! EVERYONES A CROOKED COP HUH? AM I THE ONLY COP LEFT IN PHILADELPHIA WHO AIN'T CROOKED?!");
        }
    }

    // Return stringified json entry
    function constructJson(jsonKey, jsonValue){
        commandsJson[jsonKey] = jsonValue;
        var stringifyJson = JSON.stringify(commandsJson, null, 4);
        console.log(stringifyJson);
        return stringifyJson;
    }

});