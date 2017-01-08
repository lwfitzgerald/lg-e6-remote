const winston = require('winston');
winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, {timestamp: true});
const keypress = require('keypress');
keypress(process.stdin);

var lgtv = require("lgtv2")({
    url: 'ws://' + process.argv[2] + ':3000'
});

function logOp(message) {
    return () => {
        Promise.resolve(winston.log('info', message));
    };
}

function sleepOp(time) {
    return sleep.bind(null, time);
}

function sleep(time) {
    return new Promise(resolve => {
        winston.log('info', 'Sleeping for ' + time + 'ms');
        setTimeout(() => {
            winston.log('info', 'Sleep complete');
            resolve();
        }, time);
    });
}

function sendButtonOp(sock, button) {
    return sendButton.bind(null, sock, button);
}

function sendButton(sock, button) {
    return new Promise(resolve => {
        winston.log('info', 'Sending ' + button);
        sock.send('button', {name: button});
        resolve();
    });
};

function chanDownOp(sock) {
    return sendChanDown.bind(null, sock);
}

function sendChanDown(sock) {
    return new Promise(resolve => {
        winston.log('info', 'Sending channel down');
        lgtv.request('ssap://tv/channelDown');
        resolve();
    });
}

function interactive(sock) {
    // listen for the "keypress" event
    process.stdin.on('keypress', function (ch, key) {
        winston.log('info', '"' + key.name + '" pressed');
        if (key.ctrl && key.name === 'c') {
            process.stdin.pause();
            process.exit(0);
        } else {
            var button = key.name.toUpperCase();
            if (button === 'RETURN') {
                button = 'ENTER';
            } else if (button === 'BACKSPACE' || button === 'ESCAPE') {
                button = 'BACK';
            }

            if (button === 'S') {
                openSettings(sock);
            } else if (button === 'M') {
                openMenu(sock);
            } else {
                sendButton(sock, button);
            }
        }
    });

    process.stdin.setRawMode(true);
    process.stdin.resume(); 
}

function openMenu(sock) {
    winston.log('info', 'Opening App menu');
    return sendButton(sock, 'HOME')
}

function openSettings(sock) {
    const pictureModeWait = 90;

    winston.log('info', 'Opening settings');
    lgtv.request('ssap://com.webos.applicationManager/launch', {id: 'com.webos.app.accessibility'});

    console.log('\nSwitching to Picture settings menu');
    sleep(2400)
    .then(sendButtonOp(sock, 'DOWN'))
    .then(sleepOp(1500))
    .then(sendButtonOp(sock, 'RIGHT'))

    .then(logOp('\nSwitching to Picture mode settings menu'))
    .then(sleepOp(200))
    .then(sendButtonOp(sock, 'ENTER'))

    .then(logOp('\nSwitching to Expert Controls menu'))
    .then(sleepOp(1500))
    .then(chanDownOp())
    .then(chanDownOp())
    .then(sleepOp(80))
    .then(sleepOp(pictureModeWait))
    .then(sendButtonOp(sock, 'UP'))
    .then(sleepOp(pictureModeWait))
    .then(sendButtonOp(sock, 'UP'))
    .then(sleepOp(pictureModeWait))
    .then(sendButtonOp(sock, 'UP'))
    .then(sleepOp(90))
    .then(sendButtonOp(sock, 'ENTER'))

    .then(logOp('\nSwitching to White Balance menu'))
    .then(sleepOp(1300))
    .then(sendButtonOp(sock, 'DOWN'))
    .then(sleepOp(pictureModeWait))
    .then(sendButtonOp(sock, 'DOWN'))
    .then(sleepOp(pictureModeWait))
    .then(sendButtonOp(sock, 'DOWN'))
    .then(sleepOp(pictureModeWait))
    .then(sendButtonOp(sock, 'DOWN'))
    .then(sleepOp(pictureModeWait))
    .then(sendButtonOp(sock, 'DOWN'))
    .then(sleepOp(pictureModeWait))
    .then(sendButtonOp(sock, 'DOWN'))
    .then(sleepOp(90))
    .then(sendButtonOp(sock, 'ENTER'));
}

function openSettingsOld(sock) {
    const pictureModeWait = 90;
    
    openMenu(sock)
    .then(sleepOp(100))

    .then(logOp('\nSwitching to Side menu'))
    .then(sendButtonOp(sock, 'UP'))
    .then(sendButtonOp(sock, 'UP'))
    .then(sendButtonOp(sock, 'UP'))
    .then(sendButtonOp(sock, 'ENTER'))

    .then(logOp('\nSwitching to Settings menu'))
    .then(sleepOp(800))
    .then(sendButtonOp(sock, 'UP'))
    .then(sendButtonOp(sock, 'ENTER'))

    .then(logOp('\nSwitching to Picture settings menu'))
    .then(sleepOp(3400))
    .then(sendButtonOp(sock, 'RIGHT'))

    .then(logOp('\nSwitching to Picture mode settings menu'))
    .then(sleepOp(200))
    .then(sendButtonOp(sock, 'ENTER'))

    .then(logOp('\nSwitching to Expert Controls menu'))
    .then(sleepOp(1500))
    .then(chanDownOp())
    .then(chanDownOp())
    .then(sleepOp(80))
    .then(sleepOp(pictureModeWait))
    .then(sendButtonOp(sock, 'UP'))
    .then(sleepOp(pictureModeWait))
    .then(sendButtonOp(sock, 'UP'))
    .then(sleepOp(pictureModeWait))
    .then(sendButtonOp(sock, 'UP'))
    .then(sleepOp(80))
    .then(sendButtonOp(sock, 'ENTER'))

    .then(logOp('\nSwtching to White Balance menu'))
    .then(sleepOp(1500))
    .then(sendButtonOp(sock, 'DOWN'))
    .then(sleepOp(pictureModeWait))
    .then(sendButtonOp(sock, 'DOWN'))
    .then(sleepOp(pictureModeWait))
    .then(sendButtonOp(sock, 'DOWN'))
    .then(sleepOp(pictureModeWait))
    .then(sendButtonOp(sock, 'DOWN'))
    .then(sleepOp(pictureModeWait))
    .then(sendButtonOp(sock, 'DOWN'))
    .then(sleepOp(pictureModeWait))
    .then(sendButtonOp(sock, 'DOWN'))
    .then(sleepOp(80))
    .then(sendButtonOp(sock, 'ENTER'))
}

lgtv.on('connect', function () {
    winston.log('info', 'Connected');

    lgtv.getSocket(
        'ssap://com.webos.service.networkinput/getPointerInputSocket',
        function(err, sock) {
            if (!err) {
                interactive(sock);
            }
        }
    );
});
