class ClientHolder {

    TwitchClient = require('twitch').default;
    initialized = false;
    client = null;
    clientid = null;
    accessToken = null;

    async init(clientid, accessToken) {
        if (this.initialized) { throw new Error('Trying to initialize again'); }
        this.client = await this.TwitchClient.withCredentials(clientid, accessToken);
        this.initialized = true;
        console.log("Client Initialized");
        this.clientid = clientid;
        this.accessToken = accessToken;
    }

    getClient() {
        if (!this.initialized) { throw new Error("Client could not be initialized") }
        return this.client;
    }
    
    async restartClient(){
        this.stopClient();
        this.startClient();
    }
    
    async startClient(){
        if(this.initialized){ throw new Error("Client is already on")}
        if(this.clientid === null || this.accessToken === null){ throw new Error("Client must first be initialized")}
        this.init(this.clientid, this.accessToken);
    }
    
    async stopClient(){
        if(!this.initialized){ throw new Error("Client is already stopped")}
        this.client = null;
        this.initialized = false;
        console.log("Client Stopped");
    }
}

module.exports = new ClientHolder();