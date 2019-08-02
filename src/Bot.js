/**  Robert Plata
 *  Latest 7.21.2019 12:20pm
 *  Flexible Twitch Bot for use with Starcraft II
 *  Utilized by professional Starcraft players to enhance the viewers' experience
 *  @TODO
 *  Change configuration to accomidate environment variables for important keys
 *  Split program classes for modularity
 *  Integrate Angular to create Twitch-chat/Bot browser environment
 */
 
// Dependencies
var tmi = require('tmi.js');
var fs = require('fs');
var Config = require("./Config.json");
var Initializer = require("./Initializer");
var BotHelper = require("./BotHelper");
var PirateSpeak = require('pirate-speak');

// twitch-api and game information
sc2server = Config.App.Game.region; // Sets a constraint on the selectable sc2unmasked accounts

var channelname = Initializer.channelname;

// Twitch Information
var options = {
    options: {
        debug: true
    },
    connection: {
        reconnect: true
    },
    identity: {
        username: Initializer.botusername,
        password: Initializer.apikey    
    },
    channels: [Initializer.channelname]
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

// Connect to channel
var chat = new tmi.client(options);

chat.connect(channelname); 

// Start Python Stats
try{
    var {PythonShell} = require('python-shell') // Allow the execution of python script
    PythonShell.run(__dirname + '/Stats.py', null, function (err) {
        console.log("Recording records..")
        if (err) throw err;
      });
} catch {  }

// Welcome Message
chat.on('connected', function(address, port) {
    try{
        console.log("Welcome " + channelname + ", " + botusername + " is online!\n");
        var welcomemessages = Config.Alerts.WelcomeMessages;
        var random = Math.floor(Math.random() * Object.keys(welcomemessages).length);
        var welcomemessage = welcomemessages[random];
        chat.action(channelname, welcomemessage);
        BotHelper.PrintCommands();
    } catch { }
});

// Cycle through messages every set interval
try{
    if(Object.keys(Config.Alerts.Messages).length !== 0){
        count = Math.floor(Math.random() * Object.keys(Config.Alerts.Messages).length); // Start count on a random number (So first message is random)
        setInterval(() => {
            messages = Config.Alerts.Messages // (Allow newly added commands to be recognized every interval)
            if(count <= Object.keys(messages).length - 1){
                chat.action(channelname, Config.Alerts.Messages[count]);
            }
            else{
                count = 0;
                chat.action(channelname, Config.Alerts.Messages[count]);
            }
            count = count + 1;
        }, messageInterval.interval); 
    }
} catch { }

// Hosted
chat.on("hosted", (channel, username, viewers, autohost) => {
    if(Object.keys(Config.Alerts.HostMessages).length !== 0){
        try{
            var hostmessages = Config.Alerts.HostMessages;
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
        var submessages = Config.Alerts.Submessages;
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
        var submessages = Config.Alerts.Submessages;
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
        var banmessages = Config.Alerts.BanMessages;
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
        if(Config.Commands.hasOwnProperty(message)){
            try{
                chat.action(channelname, Config.Commands[message]);       
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
            (async() => {
                BotHelper.GetUptime(channelname, function(uptime){
                    chat.action(channelname, uptime);
                }); // TODO get object and post uptime to chat
                
            })();
        } catch { }
    }
    
    // Respond with Starcraft II opponent of streamer NOT FINISHED
    if(strArray[0] === ("!opponent")){  
        (async() => {
            await BotHelper.GetOpponent();
        })();
    }

    // Execute Replay Renamer.py script
    if(strArray[0] === ("!replaypack")){
        try{
            if(user.username === channelname || user.username === channelname.toLowerCase()){
                chat.action(channelname, "Working on it");
                PythonShell.run(__dirname + '/Renamer.py', null, function (err) {
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
                    Config.Commands[strArray[1]] = sentenceArray.join(" ").toString();
                    fs.writeFileSync("./config.json", JSON.stringify(Config, null, 4), finished());
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
                        delete Config.Commands[strArray[1]];
                        strConfig = JSON.stringify(Config, null, 4);
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
                    keyvalue = Object.keys(Config.Alerts.SubMessages).length;
                    Config.Alerts.SubMessages[keyvalue] = sentenceArray.join(" ").toString();
                    fs.writeFileSync("./config.json", JSON.stringify(Config, null, 4), finished());
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
                    keyvalue = Object.keys(Config.Alerts.BanMessages).length;
                    Config.Alerts.BanMessages[keyvalue] = sentenceArray.join(" ").toString();
                    fs.writeFileSync("./config.json", JSON.stringify(Config, null, 4), finished());
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
                    var sentenceArray = strArray.slice(); // Clone array
                    sentenceArray.shift();
                    keyvalue = Object.keys(Config.Alerts.Messages).length;
                    Config.Alerts.Messages[keyvalue] = sentenceArray.join(" ").toString();
                    fs.writeFileSync("./config.json", JSON.stringify(Config, null, 4), finished());
                    function finished(error){
                        chat.action(channelname, sentenceArray.join(" ") + " message added!");
                    }
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
                    keyvalue = Object.keys(Config.Alerts.WelcomeMessages).length;
                    Config.Alerts.WelcomeMessage[keyvalue] = sentenceArray.join(" ").toString();
                    fs.writeFileSync("./config.json", JSON.stringify(Config, null, 4), finished());
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
                    keyvalue = Object.keys(Config.Alerts.HostMessages).length;
                    Config.Alerts.HostMessages[keyvalue] = sentenceArray.join(" ").toString();
                    fs.writeFileSync("./config.json", JSON.stringify(Config, null, 4), finished());
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
                    (async() => {
                        BotHelper.Shoutout(strArray[1], function(shoutout){
                            chat.action(channelname, shoutout);
                        });
                    })();
                    
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
                chat.action(channelname, PirateSpeak.translate(sentenceArray.join(" ")));
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