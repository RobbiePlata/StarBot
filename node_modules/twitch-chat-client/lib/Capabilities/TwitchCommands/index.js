"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ClearChat_1 = require("./MessageTypes/ClearChat");
var HostTarget_1 = require("./MessageTypes/HostTarget");
var Reconnect_1 = require("./MessageTypes/Reconnect");
var RoomState_1 = require("./MessageTypes/RoomState");
var UserNotice_1 = require("./MessageTypes/UserNotice");
var UserState_1 = require("./MessageTypes/UserState");
var Whisper_1 = require("./MessageTypes/Whisper");
/** @private */
var TwitchCommandsCapability = {
    name: 'twitch.tv/commands',
    messageTypes: [ClearChat_1.default, HostTarget_1.default, Reconnect_1.default, RoomState_1.default, UserNotice_1.default, UserState_1.default, Whisper_1.default]
};
exports.default = TwitchCommandsCapability;
//# sourceMappingURL=index.js.map