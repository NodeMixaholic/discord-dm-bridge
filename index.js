const MatrixClient = require("matrix-bot-sdk").MatrixClient;
const AutojoinRoomsMixin = require("matrix-bot-sdk").AutojoinRoomsMixin;
const Discord = require('discord.js');
const clientd = new Discord.Client(
    {fetchAllMembers: true}
);
const clientm = new MatrixClient("https://bot-server-here.example.org", "matrix key here");
AutojoinRoomsMixin.setupOnClient(clientm);
var currentRoomId = "!roomID@example.org"

function msleep(n) {
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, n);
}
function sleep(n) {
    msleep(n*1000);
}

// To listen for room messages (m.room.message) only:
clientm.on("room.message", (roomId, event) => {
    if (roomId == currentRoomId) {
        if (!event["content"]) return;
        console.log(event["sender"] + " says " + event["content"]["body"]);
        let body = event["content"]["body"];
        let sender = event["sender"];
        var eventId = event["event_id"];
        console.log(eventId)
        if (sender === "@user:example.org") {
            let args = body.split("|")

            if (body.startsWith("!dm")) {
                clientd.users.cache.get(args[2]).send(args[1])
                clientm.sendNotice(currentRoomId, "sent!")
            } else if (body == "!redactMe") {
                console.log("please?")
            } else if (body == "!list") {
                let list = clientd.guilds.cache.get("discordServerIdHere")
                list.members.cache.each(member => {
                    clientm.sendNotice(currentRoomId, `${String(member.displayName)} is id ${String(member.id)}`);
                }); 
            }
            clientm.redactEvent(roomId, eventId, "RemovedByBot")
        }
}

});

clientd.on('ready', () => {
	console.log(`Ready!`);
});

clientd.on('message', message => {
    if (message.channel.type === 'dm') {
        let username = message.author.username;
        let id = message.author.id;
        if (username != null) {
            clientm.sendNotice(currentRoomId, `${username} (${id}) - ${message.content}`);
        }
    }
});

clientm.start().then(() => clientd.login('discord key here'));
