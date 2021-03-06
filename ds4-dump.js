#!/usr/bin/env node


'use strict';

var _ = require('lodash');
var hid = require('node-hid');
var ds4 = require('./index.js');
var play = require('play');
var T = require('timbre');
var fs = require('fs'),
  path = require("path");
var Speaker = require('speaker');

var app = require('express')();
var http = require('http').Server(app);

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

/*var io = require('socket.io')(http);
io.on('connection', function(socket) {
  console.log('a user connected');*/

  var parseDS4HIDData = ds4.parseDS4HIDData;

  var devices = hid.devices();
  var controller = _(devices).filter(isDS4HID).first();

  if (!controller) {
    throw new Error('Could not find desired controller.');
  }

  var hidDevice = new hid.HID(controller.path);
  var offset = 0;

  if (isBluetoothHID(controller)) {
    offset = 2;
    hidDevice.getFeatureReport(0x04, 66);
  }

  //var soundSets =
  var setList = [];
  var trackSelected = 1;

  var soundSets = fs.readdirSync("./sounds/").length - 1;
  console.log(soundSets);
  //soundSets2 = f

  for (var i = 0; i < soundSets; i++) {
    console.log("looped!");
    console.log(i);
    setList.push(i + 1);
  }

  var soundSet = setList[0];
  console.log(setList);

  /*BOOLEAN BUTTONS
    dPadUp
    dPadRight
    dPadDown
    dPadLeft
    cross
    circle
    square
    triangle
    l1
    l2
    r1
    r2
    l3
    r3
    share
    options
    trackPadButton
    psButton
    trackPadTouch0Active
    trackPadTouch1Active
  */

  var cache = {};

  /*
   * 0 = (not down)
   * 2 = press
   * 1 = release
   * 3 = (down)
   */


  function buttonPressed(button, state) {
    var out = (state[button] << 1) | cache[button];
    cache[button] = state[button];
    return out;
  }


  function playSound(soundNumber, set) {
    play.sound('./sounds/' + set + '/' + soundNumber + ".wav");
  }


  function trackSelect(track) {
    trackSelected = track;
    console.log("track " + track + " selected.");
  }

  hidDevice.on('data', function(buf) {
    var state = parseDS4HIDData(buf.slice(offset));

    var cross = buttonPressed("cross", state);
    var circle = buttonPressed("circle", state);
    var square = buttonPressed("square", state);
    var triangle = buttonPressed("triangle", state);
    var dPadUp = buttonPressed("dPadUp", state);
    var dPadRight = buttonPressed("dPadRight", state);
    var dPadDown = buttonPressed("dPadDown", state);
    var dPadLeft = buttonPressed("dPadLeft", state);
    var l1 = buttonPressed("l1", state);
    var l2 = buttonPressed("l2", state);
    var r1 = buttonPressed("r1", state);
    var r2 = buttonPressed("r2", state);
    var l3 = buttonPressed("l3", state);
    var r3 = buttonPressed("r3", state);
    var share = buttonPressed("share", state);
    var options = buttonPressed("options", state);
    var trackPadButton = buttonPressed("trackPadButton", state);
    var psButton = buttonPressed("psButton", state);
    var trackPadTouch0Active = buttonPressed("trackPadTouch0Active",
      state);
    var trackPadTouch1Active = buttonPressed("trackPadTouch1Active",
      state);

    if (r1 == 2) {
      //console.log("setlengt length -1" + setList[setList.length - 1]);
      console.log("old soundset is " + soundSet);
      if (soundSet == setList.length) {
        soundSet = setList[0];
        console.log("new soundset is 1");
      } else {
        soundSet = setList[soundSet];
        console.log("new soundset is " + soundSet);
      }

    }

    if (l1 == 2) {
      console.log("old soundset is " + soundSet);
      if (soundSet == 1) {
        soundSet = setList.length;
        console.log("new soundset is " + setList.length);
      } else {
        soundSet = setList[soundSet - 2];
        console.log("new soundset is " + soundSet);
      }

    }

    if (cross == 2) {
      console.log("cross pressed.");
      playSound(1, soundSet);
      //socket.emit("color_1", "LOL NERD");
    }
    if (cross == 1) {
      console.log("cross released.");
    }

    if (circle == 2) {
      console.log("circle pressed.");
      playSound(2, soundSet);
      //socket.emit("color_2", "LOL NERD");
    }
    if (circle == 1) {
      console.log("cross released.");
    }

    if (triangle == 2) {
      console.log("square pressed.");
      playSound(3, soundSet);
      //socket.emit("color_3", "LOL NERD");
    }
    if (triangle == 1) {
      console.log("triangle released.");
    }

    if (square == 2) {
      console.log("triangle pressed.");
      playSound(4, soundSet);
      //socket.emit("color_4", "LOL NERD");
    }
    if (square == 1) {
      console.log("square released.");
    }

    if (dPadDown == 2) {
      trackSelect("1");
    }
    if (dPadRight == 2) {
      trackSelect("2");
    }
    if (dPadUp == 2) {
      trackSelect("3");
    }
    if (dPadLeft == 2) {
      trackSelect("4");
    }

    var trackPadTouch0X = parseDS4HIDData(buf.slice(offset)).trackPadTouch0X;
    var trackPadTouch0Y = parseDS4HIDData(buf.slice(offset)).trackPadTouch0Y;
    var r2Analog = parseDS4HIDData(buf.slice(offset)).r2Analog;

    //if(r2==3){
    //console.log(r2Analog / 255);

    /*AAif(r2==3){

      var synthSpeaker = new Speaker({
         channels: 2,          // 2 channels
        bitDepth: 16,         // 16-bit samples
        sampleRate: 44100     // 44,100 Hz sample rate
      });
      //var sin = T("sin").stdin.pipe(synthSpeaker);

sin.set({freq:880});
    }
//}
  if(trackPadTouch0Active){
   // T("sin", {freq:400, mul:trackPadTouch0X}).play();
    console.log(trackPadTouch0X+" / "+trackPadTouch0Y);
  }

if(!trackPadTouch0Active){
    //console.log("touchpad up");
  }

*/
  });

/*
  if (soundSet==1) {
    if(parseDS4HIDData(buf.slice(offset)).r1){
    soundSet=2;
    console.log(soundSet);

    //wasCross = parseDS4HIDData(buf.slice(offset)).cross;
   	 }
    if(parseDS4HIDData(buf.slice(offset)).l1){
    soundSet=3;
    console.log(soundSet);

    //wasCross = parseDS4HIDData(buf.slice(offset)).cross;
    }
};

if (soundSet==2) {
    if(parseDS4HIDData(buf.slice(offset)).r1){
    soundSet=3;
    console.log(soundSet);

   	 }
    if(parseDS4HIDData(buf.slice(offset)).l1){
    soundSet=1;
    console.log(soundSet);

    }
};

if (soundSet==3) {
    if(parseDS4HIDData(buf.slice(offset)).r1){
    soundSet=1;
    console.log(soundSet);

   	 }
    if(parseDS4HIDData(buf.slice(offset)).l1){
    soundSet=2;
    console.log(soundSet);

    //wasCross = parseDS4HIDData(buf.slice(offset)).cross;
    }
};*/

// HIDDesciptor -> Boolean
function isDS4HID(descriptor) {
  return descriptor.vendorId == 1356 && descriptor.productId == 1476;
}

// HIDDesciptor -> Boolean
function isBluetoothHID(descriptor) {
  return descriptor.path.match(/^Bluetooth/);
}

// HIDDesciptor -> Boolean
function isUSBHID(descriptor) {
  return descriptor.path.match(/^USB/);
}

http.listen(3000, function() {
    console.log('listening on *:3000');
  });
