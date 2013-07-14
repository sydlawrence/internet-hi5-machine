var five = require("./lib/johnny-five.js"),
    board, servo, sensorTrig,sensorEcho, button;



board = new five.Board();

var highFiving = false;

var io = require('socket.io-client'),
socket = io.connect('dev.syddev.com', {
    port: 8000
});
socket.on('connect', function () { console.log("socket connected"); });

socket.on("message", function(message) {
  if (message === "givehi5") {
    giveHi5();
  }
});


var lastPhotoValue = 0;

var startRotation = 90;
var high5Rotation = 30;


var lastHigh5 = 0;
var minHigh5Delay = 1 * 1000; // max every 10 seconds

var initialValue = undefined;

var photoThreshold = 96;

function checkForHi5(value) {
  console.log(parseInt(value, 10));
  if (initialValue === undefined) {
    return initialValue = value;
  }

  if (value < photoThreshold) {
    console.log(value);
    giveHi5();
  }


  lastPhotoValue = value;
}

function giveHi5() {
  if (highFiving) return;
  highFiving = true;
  var now = (new Date()).getTime();
  if (lastHigh5 + minHigh5Delay > now) return;
  lastHigh5 = now;
  console.log("High 5!");
  var currentRotation = startRotation;
  var rotationDiff = 1;
  if (currentRotation > high5Rotation) {
    rotationDiff = -1;
  }
  var servoInterval = setInterval(function() {
    currentRotation = currentRotation+rotationDiff;
    servo.move(currentRotation);
    if (currentRotation === high5Rotation) {
      clearInterval(servoInterval);
      servo.move(startRotation);
      var t = setTimeout(function() {
        highFiving = false;
      }, 1000);

    }
  },50)


  var t = setTimeout(function() {
    servo.move(startRotation);
  }, 1000);
}

function init() {
  servo.move(startRotation);
}


board.on("ready", function() {

  // Create a new `servo` hardware instance.
  button = new five.Button(7);

  servo = new five.Servo({
    pin: 10,
    range: [ 0, 180 ], // Default: 0-180
    type: "continuous", // Default: "standard". Use "continuous" for continuous rotation servos
    startAt: startRotation, // if you would like the servo to immediately move to a degree
    center: false // overrides startAt if true and moves the servo to the center of the range
  });



  // Inject the `servo` hardware into
  // the Repl instance's context;
  // allows direct command line access
  board.repl.inject({
    servo: servo,
    button: button,
    giveHi5: giveHi5
  });

  init();


  button.on("up", function() {
    console.log("button up");
//    socket.send('givehi5');
  });

  button.on("hold", function() {
    console.log("button still down");
//    socket.send('givehi5');
  });
  button.on("down", function() {
    console.log("button down");
    socket.send('givehi5');
  });

  servo.on("move", function(angle) {
    console.log(angle);
    console.log("move");
  });

});





// References
//
// http://servocity.com/html/hs-7980th_servo.html
