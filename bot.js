var irc = require('irc'),
    util = require('util'),
    LinkProvider = require('./linkprovider.js').LinkProvider,
    config = {
        name: 'harvestr',
        host: 'irc.redsrc.com',
        channel: '#botmageddon'
    },
    reName = new RegExp(config.name),
    reLink = /(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&amp;:\/~\+#]*\w\-\@?^=%&amp;\/~\+#])?(\s|$)/gi,
    client = new irc.Client(config.host, config.name, {
        userName: config.name,
        realName: config.name,
        channels: [config.channel]
    }),
    linkprovider = new LinkProvider();

// Object spec
// {
//     "_id": "",
//     "url": "",
//     "author": "",
//     "full_message": "",
//     "created_at": ""
// }

client.addListener('message', function (from, to, message) {
    if (reName.test(message)) {
        client.say(config.channel, 'Yarp '+from+'?');
    }

    var links,
        saveLinks = [];

    while ((links = reLink.exec(message)) != null) {
        saveLinks.push({
            "url": links[0],
            "author": from,
            "full_message": message
        });
        console.log('Link found: ' + links[0]);
    }
    
    if (saveLinks.length > 0) {
        util.print('Saving links...');
        linkprovider.save(saveLinks, function(err, links) {
            if (err) {
                console.log('Error: ' + err);
            } else {
                console.log(' [Done!]');
            }
        });
    }
});