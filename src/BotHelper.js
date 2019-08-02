class BotHelper{
    
    // Dependencies
    Config = require('./Config.json');
    ClientHolder = require('./ClientHolder');
    initializer = require('./Initializer');
    client = this.InitializeClient();

    async InitializeClient(){
        await this.ClientHolder.init(this.initializer.clientid, this.initializer.accessToken);
    }

    /** Check if stream is currently online
     * @param {*} username 
     */
    async isStreamLive(username) {
        var client = this.ClientHolder.GetClient();
        const user = await client.helix.users.getUserByName(username);
        if (!user) {
            return false;
        }
        return user.getStream();
    }

    /** Get uptime using the current time minus the startDate of stream (in milliseconds) then convert to standard time form
     * @param {*} channelname 
     */
    async GetUptime(channelname, callback){
        if (await this.isStreamLive(channelname)){
            var client = this.ClientHolder.GetClient();
            const user = await client.helix.users.getUserByName(channelname);
            const stream = user.getStream();
            var start = stream.startDate; // Start date
            var currentTime = new Date(); // Current time
            msdifference = (currentTime - start); // Difference
            output = convertUptime(msdifference);
            if(output.day === 0 && output.hour === 0 && output.minutes === 0){
                callback(channelname + " has been live for " + output.seconds + " seconds");
            }
            else if(output.day === 0 && output.hour === 0){
                callback(channelname + " has been live for " + output.minutes + " minutes " + output.seconds + " seconds");
            }
            else if(output.day === 0){
                callback(channelname + " has been live for " + output.hour + " hours " + output.minutes + " minutes " + output.seconds + " seconds");
            }
            else if(output.day === 1){
                callback(channelname + " has been live for " + output.day + " day " + output.hour + " hours " + output.minutes + " minutes " + output.seconds + " seconds");
            }
            else{
                callback(channelname + " has been live for " + output.day + " days" + output.hour + " hours " + output.minutes + " minutes " + output.seconds + " seconds");
            }
        }
        else{
            callback("Stream is not live");
        }
    }

    /** Convert milliseconds into uptime literal
     * 
     * @param {*} milliseconds 
     */
    async ConvertUptime(milliseconds) {
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

    /** Shoutout streamer. If they are currently live, post information about the game they are playing
     * 
     * @param {*} name 
     */
    async Shoutout(name, callback){
        try{
            if(await this.isStreamLive(name)){
                var client = this.ClientHolder.GetClient();
                const user = await client.helix.users.getUserByName(name);
                const channel = await user.getChannel(); ///////////////////////////////
                callback("Give " + channel.displayName + " a follow at twitch.tv/" + channel.displayName + " They're live right now playing " + channel.game);
            }
            else{
                callback("Give " + name + " a follow at twitch.tv/" + name);
            }
        } catch (err) { console.log(err); }
    }

    /** Search Sc2Unmasked and return MMRs of two players
     * 
     * @param {*} player1 
     * @param {*} player2 
     * @param {*} callback 
     */
    async SearchSC2Unmasked(player1, player2, callback){
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
                    //console.log(err);
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

    /** Get Starcraft opponent if the application is running locally
     * 
     */
    async GetOpponent(){
        http = require('http');
        var gameurl = "http://localhost:6119/game"; //StarCraft 2 Port
        http.get(gameurl, (resp) => {
            resp.on('data', (chunk) => {
                data = JSON.parse(chunk);
            });
            resp.on('end', () => {
                //console.log(data);
                searchSC2Unmasked(data.players[0], data.players[1], function(mmr1, mmr2){
                    if(data.isReplay == false){
                        //console.log(mmr1, mmr2);
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

    /** Get Starcraft II matchup
     * 
     * @param {*} race 
     */
    async GetMatchup(race){
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

    // Print current hardcoded commands and custom commands
    async PrintCommands(){
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


}

module.exports = new BotHelper();