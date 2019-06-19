class ClientHolder {
    TwitchClient = require('twitch').default;
    initialized = false;
    client = null;
    async init(clientid, accessToken) {
        if (this.initialized) { throw new Error('Trying to initialize more than once'); }
        this.client = await this.TwitchClient.withCredentials(clientid, accessToken);
        this.initialized = true;
        console.log("Client Initialized")
    }
    getClient() {
        if (!this.initialized) { throw new Error("Client could not be initialized.") }
        return this.client;
    }
}
module.exports = new ClientHolder();