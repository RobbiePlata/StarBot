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
        if (!this.initialized) { throw new Error("Client could not be initialized.") }
        return this.client;
    }
    restartClient(){
        if (!this.initialized){ throw new Error("Client is already off") }
        this.client = null;
        this.initialized = false;
        this.init(this.clientid, this.accessToken);
        console.log("Client Restarted");
    }
    stopClient(){
        if(!this.initialized){ throw new Error("Client is already off")}
        this.client = null;
        console.log("Client Stopped");
    }
}
module.exports = new ClientHolder();