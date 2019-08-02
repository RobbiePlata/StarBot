class Initializer{
    constructor(){
        var readline = require('readline-sync');
        var config = require("./Config.json");
        var fs = require('fs');
        var apikey = GetBotAPI();
        var botusername = GetBotUsername();
        var channelname = GetChannelName();
        var clientid = config.App.Channel.clientid;
        var accessToken = GetAccessToken(clientid);
        var replaypath = GetReplayPath();

        Object.defineProperty(this, 'apikey', {
            get: function() {
                return apikey;
            }
        });

        Object.defineProperty(this, 'botusername', {
            get: function() {
                return botusername;
            }
        });

        Object.defineProperty(this, 'channelname', {
            get: function() {
                return channelname;
            }
        });

        Object.defineProperty(this, 'clientid', {
            get: function() {
                return clientid;
            }
        });

        Object.defineProperty(this, 'accessToken', {
            get: function() {
                return accessToken;
            }
        });

        Object.defineProperty(this, 'replaypath', {
            get: function() {
                return replaypath;
            }
        });

        // If botusername is empty, ask user for bot username and write to file
        function GetReplayPath(){
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
        function GetBotUsername(){
        var botusername = config.App.Bot.name;
        if(botusername !== "" && botusername !== undefined){
            return botusername;
        }
        else{
            var bot = readline.question("Bot's Username: ");
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
        function GetAccessToken(){
        var token = config.App.Channel.accessToken;
        // Token is present
        if(token !== "" && token !== undefined){
            return token;
        }
        // Token is not present
        else{
            userTokenRetrieval(); // Open browser for user to enter token
            writeAccessToken(); // Write access token to accesstoken.txt
                try{
                    return token = config.App.Channel.accessToken;
                }catch(err){
                    console.log(err);
                }
            }
        }
    
        // Open web browser for authentication token retrieval
        function UserTokenRetrieval(){
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
        function WriteAccessToken(){
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
        function GetChannelName(){
        var channelname = config.App.Channel.name;
        if(channelname !== "" && channelname !== undefined){
            return channelname;
        }
        else{
            var name = readline.question("Enter your stream channel: ");
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
        function BotAPIRetrieval(){
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
        function GetBotAPI(){
        var botapi = config.App.Bot.apikey;
        if(botapi !== "" && botapi !== undefined){
            return botapi;
        }
        else{
            BotAPIRetrieval();
            var api = readline.question("Enter your Bot's Oauth key: ");
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

    }

}

module.exports = new Initializer();