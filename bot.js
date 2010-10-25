var irc = require('irc'),
    sys = require('sys'),
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
    });

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

    var links;

    while ((links = reLink.exec(message)) != null) {
        var now = new Date(),
            dateSep = "-",
            timeSep = ":",
            debug = [
                from,
                ': ',
                links[0],
                ' [ ',
                now,
                ' ]'
            ].join('');
        
        sys.puts(debug);
    }
});