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
        return;
    }
    
    var links;

    while ((links = reLink.exec(message)) != null) {
        var postedUrl = links[0];
        console.log('Link posted: ' + postedUrl);
        linkprovider.findByUrl(postedUrl, function(err, result) {
            if (!result) {
                util.print('Saving link '+postedUrl+'...');
                linkprovider.save({
                    "url": postedUrl,
                    "author": from,
                    "full_message": message,
                    "count": 1
                }, function(err, links) {
                    if (err) {
                        console.log(' [ FAILED ]');
                        console.log('Error: ' + err);
                    } else {
                        console.log(' [ DONE ]');
                    }
                });
            } else {
                client.say(config.channel, [
                    "Ring ring, ",
                    from,
                    ". ",
                    result.author,
                    " posted that link on ",
                    result.created_at,
                    "."
                ].join(''));
                util.print('Updating link count for '+result.url+'...');
                result.count = parseInt(result.count, 10) + 1;
                linkprovider.update({
                    "url": result.url
                }, result, function(err) {
                    if (err) {
                        console.log(' [ FAILED ]');
                        console.log('Error: ' + err);
                    } else {
                        console.log(' [ DONE ]');
                    }
                });
            }
        });
    }
});