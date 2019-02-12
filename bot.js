/*
Install Node JS ('install this')
Fill in apikey, botusername, and channelname fields
Go to twitchapps.com/tmi to connect with twitch, paste naked key inside the double quotes
Run 'run.batch' in file explorer
*/

var tmi = require('tmi.js');
apikey = "";
botusername = "OcularPatdownBot";
channelname = "ROOTRob";

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
        cluster: "aws",
        reconnect: true
    },
    identity: {
        username: botusername,
        password: apikey
    },
    channels: [channelname]
};

// Connect to channel
var client = new tmi.client(options);
client.connect();

// Welcome Message
client.on('connected', function(address, port) {
    client.action(channelname, "\"Hey asshole\"");
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

    // Add command to commands.json work on integrating all text after index 2
    if(strArray[0] === ("!add")){
        if(user.username === channelname || user.username === channelname.toLowerCase()){
            console.log(strArray);
            if (strArray.length < 3 || strArray.length > 3){
                console.log("To add a command, type \"!add !command response\"");
                client.action(channelname, "To add a command, type \"!add !command response\"");
            }
            if (strArray.length === 3){
                if (strArray[1].charAt(0) == "!"){
                    var json = constructJson(strArray[1], strArray[2]);
                    var fs = require('fs');
                    fs.writeFile("./commands.json", json, finished);
                    function finished(error){
                        console.log("all set");
                    }
                }
                else{
                    client.action(channelname, "Use an exclamation point for your command");
                }
            }  
            else{
                client.action(channelname, "To add a command, type \"!add !command response\"");
            }
        }
        else{
            client.action(channelname, "\"You can't tell me what to do jabroni\"");
        }
    }

    // Remove command from commands.json GOOD
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
    
    // Add sub message to submessages.json
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

    // Remove command from commands.json
    if(strArray[0] === ("!removesubmessage")){
        if(user.username === channelname.user || user.username === channelname.toLowerCase()){
            if(strArray.length < 2 || strArray.length > 2){
                client.action(channelname, "To remove a submessage, type \"!removesubmessage\"");
            }
            if(strArray.length === 2){
                client.action(channelname, "submessage " + strArray[1] +" removed");
            }
        }
        else{
            client.action(channelname, "Nice try");
        }
    }

    // Add user ban message
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

    // Remove ban message from banmessage.json
    if(strArray[0] === ("!removesubmessage")){
        if(user.username === channelname.user || user.username === channelname.toLowerCase()){
            if(strArray.length < 2 || strArray.length > 2){
                client.action(channelname, "To remove a command, type \"!remove\"");
            }
            if(strArray.length === 2){
                client.action(channelname, "ban message " + strArray[1] +" removed");
            }
        }
        else{
            client.action(channelname, "Nice try");
        }
    }

    // Kill bot
    if(strArray[0] === ("!killbot")){
        if(user.username === channelname || user.username === channelname.toLowerCase()){
            client.action(channelname, "A CROOKED COP! YEAH I GET IT! EVERYONES A CROOKED COP HUH? AM I THE ONLY COP LEFT IN PHILADELPHIA WHO AIN'T CROOKED?!");
            process.exit();
        }
    }

    function constructJson(jsonKey, jsonValue){
        commandsJson[jsonKey] = jsonValue;
        var stringifyJson = JSON.stringify(commandsJson, null, 4);
        console.log(stringifyJson);
        return stringifyJson;
     }
});