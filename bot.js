var irc = require('irc'),
    util = require('util'),
    LinkProvider = require('./linkprovider.js').LinkProvider,
    config = require('./config.js').config,
    reName = new RegExp(config.name),
    reLink = /(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&amp;:\/~\+#]*\w\-\@?^=%&amp;\/~\+#])?/gi,
    client = new irc.Client(config.host, config.name, {
        userName: config.name,
        realName: config.name,
        channels: [config.channel]
    }),
    linkprovider = new LinkProvider();

console.log('');
console.log('HarvestrBot "'+ config.name + '" logged into: ');
console.log('  Host: ' + config.host);
console.log('  Channel: ' + config.channel);
console.log('');

client.addListener('message', function (from, to, message) {
    if (reName.test(message)) {
        client.say(config.channel, 'Yarp '+from+'?');
    }

    var links,
        saveLinks = [],
        updateLinks = [];

    while ((links = reLink.exec(message)) != null) {
        console.log('Link found: ' + links[0]);
        linkprovider.findByUrl(links[0], function(err, result) {
            if (!result) {
                console.log(util.inspect(this));
                saveLinks.push({
                    "url": links[0],
                    "author": from,
                    "full_message": message,
                    "count": 1
                });
            } else {
                var message = [
                    "Ring ring, ",
                    from,
                    ". ",
                    result.author,
                    " posted that link on ",
                    result.created_at,
                    "."
                ].join('');
                client.say(config.channel, message);
                updateLinks.push({
                    "url": result.url,
                    "count": parseInt(result.count, 10) + 1
                });
                
                console.log(util.inspect(updateLinks));
            }
        }, this);
    }
    
    if (saveLinks.length > 0) {
        util.print('Saving links...');
        linkprovider.save(saveLinks, function(err, links) {
            if (err) {
                console.log(' [ FAILED ]');
                console.log('Error: ' + err);
            } else {
                console.log(' [ DONE ]');
            }
        });
    }
    
    if (updateLinks.length > 0) {
        for (var i = 0, j = updateLinks.length; i < j; i++) {
            util.print('Updating link count for '+updateLinks[i].url+'...');
            linkprovider.update({
                "url": updateLinks[i].url
            }, {
                "count": updateLinks[i].count
            }, function(err) {
                if (err) {
                    console.log(' [ FAILED ]');
                    console.log('Error: ' + err);
                } else {
                    console.log(' [ DONE ]');
                }
            });
        }
    }
});