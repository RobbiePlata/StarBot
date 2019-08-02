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

    GetClient() {
        if (!this.initialized) { throw new Error("Client could not be initialized") }
        return this.client;
    }
}

module.exports = new ClientHolder();