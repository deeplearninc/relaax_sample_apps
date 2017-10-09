/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.l = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };

/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};

/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};

/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 17);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

function logging() {
}

logging.log_level = {
  DEBUG: 1,
  INFO:  2,
  ERROR: 3
}

logging.__config__ = {
  to_console: true,
  log_level: logging.log_level.DEBUG,
  logging_element_id: null,
  max_buffer_size: 10240
}

logging.__buffer__ = ""

logging.config = function(
  logging_element_id=null, write_to_console=true, 
  log_level=logging.log_level.DEBUG, max_buffer_size=10240) {
  config = logging.__config__
  config.to_console = write_to_console
  config.log_level = log_level
  config.logging_element_id = logging_element_id
  config.max_buffer_size = max_buffer_size
}

logging._write = function(log_level, args) {
  var config = logging.__config__
  
  if (log_level >= config.log_level) {
    if (config.to_console)
      console.log.apply(console, args)

    if ((config.logging_element_id != null) && (args.length > 0)) {
      if (logging.__buffer__.length > config.max_buffer_size) {
        var len = logging.__buffer__.length
        logging.__buffer__ = logging.__buffer__.substring(len-config.max_buffer_size, len)
      }
      for (i = 0; i < args.length; i++) {
        var arg = args[i]
        if (Array.isArray(arg))
          arg = JSON.stringify(arg) 
        logging.__buffer__ += arg
      }
      logging.__buffer__ += '</br>'
      document.getElementById(config.logging_element_id).innerHTML = logging.__buffer__ 
    }
  }
}

logging.error = function() {
  logging._write(logging.log_level.ERROR, arguments)
}

logging.debug = function() {
  logging._write(logging.log_level.DEBUG, arguments)
}

logging.info = function() {
  logging._write(logging.log_level.INFO, arguments)
}

module.exports = logging;


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

var color = __webpack_require__(2),
    sensors = __webpack_require__(12),
    tc = __webpack_require__(13);

function car(world, opt) {
    this.options = {
        sensors: [

            { type: 'distance', angle: -45, length: 5 },
            { type: 'distance', angle: -30, length: 5 },
            { type: 'distance', angle: -15, length: 5 },
            { type: 'distance', angle: +0, length: 5 },
            { type: 'distance', angle: +15, length: 5 },
            { type: 'distance', angle: +30, length: 5 },
            { type: 'distance', angle: +45, length: 5 },

            { type: 'distance', angle: -225, length: 3 },
            { type: 'distance', angle: -195, length: 3 },
            { type: 'distance', angle: -180, length: 5 },
            { type: 'distance', angle: -165, length: 3 },
            { type: 'distance', angle: -135, length: 3 },

            { type: 'distance', angle: -10, length: 10 },
            { type: 'distance', angle: -3, length: 10 },
            { type: 'distance', angle: +0, length: 10 },
            { type: 'distance', angle: +3, length: 10 },
            { type: 'distance', angle: +10, length: 10 },

            { type: 'distance', angle: +90, length: 7 },
            { type: 'distance', angle: -90, length: 7 },

            { type: 'speed' }

        ]
    };

    this.maxSteer = Math.PI / 7
    this.maxEngineForce = 10
    this.maxBrakeForce = 5
    this.maxBackwardForce = 2
    this.linearDamping = 0.5

    this.continuous = true

    this.contact = 0
    this.impact = 0

    this.world = world

    this.init()
};

car.TYPE = 2

car.prototype.init = function () {
    this.createPhysicalBody()

    this.sensors = sensors.build(this, this.options.sensors)
    this.speed = this.sensors[this.sensors.length - 1]

    this.states = 0 // sensor dimensonality

    for (var i = 0; i < this.sensors.length; i++) {
        this.states += this.sensors[i].dimensions
    }
    
    this.punishment = 0
    this.timer = 0.0
};

car.prototype.createPhysicalBody = function () {
    // Create a dynamic body for the chassis
    this.chassisBody = new p2.Body({
        mass: 1,
        damping: 0.2,
        angularDamping: 0.3
    });

    this.wheels = {}
    this.chassisBody.color = color.randomPastelHex();
    this.chassisBody.car = true;
    this.chassisBody.damping = this.linearDamping;

    var boxShape = new p2.Box({ width: 0.5, height: 1 });
    boxShape.entity = 2

    this.chassisBody.addShape(boxShape);
    this.chassisBody.gl_create = (function (sprite, r) {
        this.overlay = new PIXI.Graphics();
        this.overlay.visible = true;

        sprite.addChild(this.overlay);

        var wheels = new PIXI.Graphics()
        sprite.addChild(wheels)

        var w = 0.12, h = 0.22
        var space = 0.07
        var col = "#" + this.chassisBody.color.toString(16)
            col = parseInt(tc(col).darken(50).toHex(), 16)
        var alpha = 0.35, alphal = 0.9

        var tl = new PIXI.Graphics()
        var tr = new PIXI.Graphics()

        tl.beginFill(col, alpha)
        tl.position.x = -0.25
        tl.position.y = 0.5 - h / 2 - space
        tl.drawRect(-w / 2, -h / 2, w, h)
        tl.endFill()

        tr.beginFill(col, alpha)
        tr.position.x = 0.25
        tr.position.y = 0.5 - h / 2 - space
        tr.drawRect(-w / 2, -h / 2, w, h)
        tr.endFill()

        this.wheels.topLeft = tl
        this.wheels.topRight = tr

        wheels.addChild(tl)
        wheels.addChild(tr)

        wheels.beginFill(col, alpha)
        // wheels.lineStyle(0.01, col, alphal)
        wheels.drawRect(-0.25 - w / 2, -0.5 + space, w, h)
        wheels.endFill()

        wheels.beginFill(col, alpha)
        // wheels.lineStyle(0.01, col, alphal)
        wheels.drawRect(0.25 - w / 2, -0.5 + space, w, h)
        wheels.endFill()
    }).bind(this); 

    // Create the vehicle
    this.vehicle = new p2.TopDownVehicle(this.chassisBody);

    // Add one front wheel and one back wheel - we don't actually need four :)
    this.frontWheel = this.vehicle.addWheel({
        localPosition: [0, 0.5] // front
    });
    this.frontWheel.setSideFriction(50);

    // Back wheel
    this.backWheel = this.vehicle.addWheel({
        localPosition: [0, -0.5] // back
    })
    this.backWheel.setSideFriction(45) // Less side friction on back wheel makes it easier to drift
};

car.prototype.updateSensors = function () {
    var data = new Float64Array(this.states)
    for (var i = 0, k = 0; i < this.sensors.length; k += this.sensors[i].dimensions, i++) {
        this.sensors[i].update()
        data.set(this.sensors[i].read(), k)
    }

    if (k !== this.states) {
        throw 'unexpected';
    }

    this.drawSensors()

    return data
};


car.prototype.drawSensors = function () {
    if (this.overlay.visible !== true) {
        return ;
    }

    this.overlay.clear();

    for (var i = 0; i < this.sensors.length; i++) {
        this.sensors[i].draw(this.overlay);
    }
};

car.prototype.addToWorld = function () {
    this.chassisBody.position[0] = (Math.random() - .5) * this.world.size.w
    this.chassisBody.position[1] = (Math.random() - .5) * this.world.size.h
    this.chassisBody.angle = (Math.random() * 2.0 - 1.0) * Math.PI

    this.world.p2.addBody(this.chassisBody)
    this.vehicle.addToWorld(this.world.p2)

   this.world.p2.on("beginContact", (event) => {

        if ((event.bodyA === this.chassisBody || event.bodyB === this.chassisBody)) {
            // this.onContact( Math.pow(this.chassisBody.velocity[1], 2) + Math.pow(this.chassisBody.velocity[0], 2) );
            console.log("beginContact: " + this.contact)
            this.contact++;
        }

   });

   this.world.p2.on("endContact", (event) => {

        if ((event.bodyA === this.chassisBody || event.bodyB === this.chassisBody)) {
            console.log("endContact: " + this.contact)
            this.contact--;
        }

   })

   this.world.p2.on("impact", (event) => {

        if ((event.bodyA === this.chassisBody || event.bodyB === this.chassisBody)) {
            console.log("impact!!!!")
            this.impact = Math.sqrt(Math.pow(this.chassisBody.velocity[0], 2) + Math.pow(this.chassisBody.velocity[1], 2))
        }

   })
};

car.prototype.handleKeyInput = function (k) {
    // Steer value zero means straight forward. Positive is left and negative right.
    // this.frontWheel.steerValue = this.maxSteer * (k.getN(37) - k.getN(39));

    // // Engine force forward
    // this.backWheel.engineForce = k.getN(38) * this.maxEngineForce;
    // this.backWheel.setBrakeForce(0);

    // if(k.get(40)) {
    //     if(this.backWheel.getSpeed() > 0.1){
    //         // Moving forward - add some brake force to slow down
    //         this.backWheel.setBrakeForce(this.maxBrakeForce);
    //     } else {
    //         // Moving backwards - reverse the engine force
    //         this.backWheel.setBrakeForce(0);
    //         this.backWheel.engineForce = -this.maxBackwardForce;
    //     }
    // }

    if (k.getD(83) === 1) {
        this.overlay.visible = !this.overlay.visible;
    }
};

car.prototype.handle = function (throttle, handlebar) {

    // Steer value zero means straight forward. Positive is left and negative right.
    this.frontWheel.steerValue = this.maxSteer * handlebar

    // Engine force forward
    var force = throttle * this.maxEngineForce
    if (force < 0) {

        if (this.backWheel.getSpeed() > 0.1) {
            this.backWheel.setBrakeForce(-throttle * this.maxBrakeForce)
            this.backWheel.engineForce = 0.0
        }

        else {
            this.backWheel.setBrakeForce(0)
            this.backWheel.engineForce = throttle * this.maxBackwardForce
        }

    }

    else {
        this.backWheel.setBrakeForce(0)
        this.backWheel.engineForce = force
    }

    this.wheels.topLeft.rotation = this.frontWheel.steerValue * 0.7071067812
    this.wheels.topRight.rotation = this.frontWheel.steerValue * 0.7071067812
};


module.exports = car;

/***/ }),
/* 2 */
/***/ (function(module, exports) {

//http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
}
function rgbToHex(r, g, b) {
    return parseInt(componentToHex(r) + componentToHex(g) + componentToHex(b), 16);
}
//http://stackoverflow.com/questions/43044/algorithm-to-randomly-generate-an-aesthetically-pleasing-color-palette
function randomPastelHex(){
    var mix = [255,255,255];
    var red =   Math.floor(Math.random()*256);
    var green = Math.floor(Math.random()*256);
    var blue =  Math.floor(Math.random()*256);

    // mix the color
    red =   Math.floor((red +   3*mix[0]) / 4);
    green = Math.floor((green + 3*mix[1]) / 4);
    blue =  Math.floor((blue +  3*mix[2]) / 4);

    return rgbToHex(red,green,blue);
}


module.exports = {
    randomPastelHex: randomPastelHex,
    rgbToHex: rgbToHex
};

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

var wspipe = __webpack_require__(4)
var log = __webpack_require__(0)

client.__wspipe__ = null
client.__sid__ = 0 // channel allocated to a client over WS pipe

function client(url, consumer) {
  this.sid = client.__sid__
  client.__sid__ += 1
  this.consumer = consumer
  if (client.__wspipe__ == null) {
    client.__wspipe__ = new wspipe(url)
  }
  client.__wspipe__.subscribe(this.sid, this)
}

client.prototype._callconsumer = function(f) {
    if (typeof this.consumer !== 'undefined' && typeof this.consumer[f] === 'function') {
      var args = Array.prototype.slice.call(arguments, 1)
      this.consumer[f].apply(this.consumer, args)
    }
} 

client.prototype.onconnected = function() {
  this._callconsumer('onconnected')
}

client.prototype.ondisconnected = function() {
  this._callconsumer('ondisconnected')
}

client.prototype.init = function(exploit=false) {
  client.__wspipe__.send(this,
    {'sid': this.sid, 'command': 'init', 'exploit': exploit})
}

client.prototype.update = function(reward, state, terminal=false) {
  client.__wspipe__.send(this,
    {'sid': this.sid, 'command': 'update', 'reward': reward, 'state': state, 'terminal': terminal})
}

client.prototype.reset = function() {
  client.__wspipe__.send(this,
    {'sid': this.sid, 'command': 'reset'})
}

client.prototype.onmessage = function(data) {
  switch(data['response']) {
    case 'ready':
      this._callconsumer('onready')
      break
    case 'action':
      this._callconsumer('onaction', data['data'])
      break
    case 'done':
      this._callconsumer('onresetdone')
      break
    case 'error':
      this._callconsumer('onerror', data['message'])
      break
    default:
      log.error('Unknown server response: ', data)
      break
  }
}

client.prototype.disconnect = function() {
  client.__wspipe__.send(this,
    {'sid': this.sid, 'command': 'disconnect'})
}

module.exports = client;

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

var log = __webpack_require__(0)

function wspipe(url) {
  this.server = url
  this.socket = null
  this.isopen = false
  this.subscribers = {}
  this.init()
}

wspipe.prototype.init = function() {
  this.socket = new WebSocket(this.server)

  this.socket.onopen = () => {
    this.isopen = true
    for (var sid in this.subscribers) {
      if (this.subscribers.hasOwnProperty(sid)) {
        this.subscribers[sid].wsopen = true
        this.subscribers[sid].onconnected()
      }
    }
  }

  this.socket.onmessage = (e) => {
    // log.debug("Data received from wspipe: " + e.data)
    data = JSON.parse(e.data)
    if (this.subscribers.hasOwnProperty(data.sid)) {
      this.subscribers[data.sid].wsopen = true
      this.subscribers[data.sid].onmessage(data)
    } else {
      log.error("Data received for unidentified subscriber. Dropping that connection...")
      this.socket.send(JSON.stringify({sid:data.sid, message:'disconnect'}))
    }
  }

  this.socket.onclose = (e) => {
    this.socket = null
    this.isopen = false
    for (var sid in this.subscribers) {
      if (this.subscribers.hasOwnProperty(sid)) {
        this.subscribers[sid].wsopen = false
        this.subscribers[sid].ondisconnected()
      }
    }
    log.error("Web Socket connection closed. " + e.reason)
    log.debug("Waiting 5 sec. to try connect again...")
    setTimeout(()=>{this.init()}, 5000)
  }

  this.socket.onerror = (e) => {
    log.error("Web Socket got an error...")
  }  
}

wspipe.prototype.subscribe = function(sid, subscriber) {
  this.subscribers[sid] = subscriber
  if (this.isopen) {
    subscriber.wsopen = true
    subscriber.onconneced()
  } else {
    subscriber.wsopen = false
  }  
}

wspipe.prototype.send = function(subscriber, payload) {
  if (this.isopen && subscriber.wsopen) {
    subscriber.wsopen = false
    this.socket.send(JSON.stringify(payload))
    // log.debug("Data sent through wspipe: " + JSON.stringify(payload))
  }
}

module.exports = wspipe


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

var car = __webpack_require__(1);
var log = __webpack_require__(0)
var agent_proxy = __webpack_require__(3)

function driver(opt, world) {
    this.car = new car(world, {})
    this.options = opt

    this.world = world
    this.frequency = 15
    this.reward = 0
    this.rewardBonus = 0
    this.loaded = false

    this.loss = 0
    this.timer = 0
    this.timerFrequency = 60 / this.frequency

    if (this.options.dynamicallyLoaded !== true) {
    	this.init(null, null)
    }

    this.car.onContact = (speed) => {
    	this.rewardBonus -= Math.max(speed, 50.0)
    }
    
};

driver.prototype.init = function (actor, critic) {
    this.actions = 2
    this.car.addToWorld()
    this.agent_url = 'ws://127.0.0.1:9000'
    log.info('Connecting to Agent through Web Sockets proxy on ' + this.agent_url)
    this.agent = new agent_proxy(this.agent_url, this)
};

driver.prototype.onconnected = function() {
    log.info('Initializing agent...')
    this.agent.init()
};

driver.prototype.onready = function() {
    log.info('Agent was initialized and ready for training')
    this.step(null)
    this.loaded = true
    this.init_state = true
    this.state_sent = false
};

driver.prototype.clip_action = function(action) {
    if (action > 1.0) {
        return 1.0
    } else if (action < -1.0) {
        return 1.0
    } else {
        return action
    }
};

driver.prototype.onaction = function(action) {
    // log.info('Received action: ', action)
    action[0] = this.clip_action(action[0])
    action[1] = this.clip_action(action[1])
    // log.info('Clipped action: ', action)
    this.car.handle(action[0], action[1])
    this.state_sent = false
};

driver.prototype.onerror = function(message) {
    log.error('Received error: ' + message)
    this.stop()
};

driver.prototype.stop = function () {
    log.info('Disconnecting from the Agent')
    this.loaded = false
    this.agent.disconnect()
};

driver.prototype.step = function (dt) {
	if (!this.loaded || this.state_sent) {
		return 
	}

    this.timer++

    if (this.timer % this.timerFrequency === 0) {
        var d = this.car.updateSensors()
        var vel = this.car.chassisBody.velocity
        var speed = this.car.speed.velocity

        // v = Math.sqrt(Math.pow(vel[1], 2) + Math.pow(vel[0], 2))
        // log.info("Car v: " + v + ", speed: " + this.car.speed.velocity)

        if (this.init_state) {
            this.reward = null
            this.init_state = false
        } else {
            this.reward = Math.pow(vel[1], 2) - 0.1 * Math.pow(vel[0], 2) - this.car.contact * 10 - this.car.impact * 20
            // this.reward = v - this.car.contact * 10 - this.car.impact * 20
            if (Math.abs(speed) < 1e-2) { // punish no movement; it harms exploration
                this.reward -= 1.0 
            }
        }
        log.info('Reward: ', this.reward, ' (', this.car.contact, ', ',  this.car.impact, ')')
        state = [].slice.call(d)
        // log.info('Updating Agent with reward: ' + this.reward + ' and state: ', state)
        this.agent.update(this.reward, state, false)
        this.state_sent = true
        
        this.rewardBonus = 0.0
        this.car.impact = 0
    }
    

    return this.timer % this.timerFrequency === 0
};

driver.prototype.draw = function (context) {
};

module.exports = driver;

/***/ }),
/* 6 */
/***/ (function(module, exports) {

function keyboard() {
    this.handlers = {};
    this.subscribers = [];
    this.states = {};

    document.onkeydown = this.keydown.bind(this);
    document.addEventListener('keydown', this.keydown.bind(this), true);
    document.addEventListener('keyup', this.keyup.bind(this), true);
}

keyboard.prototype.keydown = function (e) {
    this.states[e.keyCode] = this.states[e.keyCode] !== undefined ? this.states[e.keyCode] + 1 : 1;

    if (this.handlers[e.keyCode]) {
        this.handlers[e.keyCode](true);
    }

    for (var i = 0; i < this.subscribers.length; i++) {
        this.subscribers[i](this);
    }
};

keyboard.prototype.keyup = function (e) {
    this.states[e.keyCode] = 0;

    if (this.handlers[e.keyCode]) {
        this.handlers[e.keyCode](false);
    }

    for (var i = 0; i < this.subscribers.length; i++) {
        this.subscribers[i](this);
    }
};

keyboard.prototype.listen = function (key, callback) {
    this.handlers[key] = callback;
};

keyboard.prototype.subscribe = function (callback) {
    this.subscribers.push(callback);
};

keyboard.prototype.get = function (key) {
    if (this.states[key])
        return this.states[key] > 0;

    return false;
};

keyboard.prototype.getN = function (key) {
    if (this.states[key])
        return this.states[key] > 0 ? 1 : 0;

    return 0;
};

keyboard.prototype.getD = function (key) {
    if (this.states[key])
        return this.states[key];

    return 0;
}

module.exports = keyboard;

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {var StringView = __webpack_require__(16);

function isObjLiteral(_obj) {
  var _test  = _obj;
  return (  typeof _obj !== 'object' || _obj === null ?
              false :  
              (
                (function () {
                  while (!false) {
                    if (  Object.getPrototypeOf( _test = Object.getPrototypeOf(_test)  ) === null) {
                      break;
                    }      
                  }
                  return Object.getPrototypeOf(_obj) === _test;
                })()
              )
          );
}

class BinaryWriter {

	/**
	 * Returns array buffer, which contains the binary data.
	 * @param  {array} contents
	 * @return {ArrayBuffer} 
	 */
	static write(contents) {
		var toc = [], length = 0;

		for (var i = 0; i < contents.length; i++) {
			var value = contents[i]
			var isobject = false

			if (value.constructor === Object || value.constructor === Array) {
				value = (contents[i] = JSON.stringify(value))
				isobject = true
			}

			if (typeof value === 'string') {
				toc.push({
					t: 's',
					l: value.length
				});

				if (isobject) {
					toc[toc.length - 1]['o'] = 1;
				}

				length += value.length
			}

			else if (ArrayBuffer.isView(value)) {
				toc.push({
					t: 't',
					l: value.byteLength,
					i: value.constructor.name
				})

				length += value.byteLength
			}

			else if (value instanceof ArrayBuffer) {
				toc.push({
					t: 'b',
					l: value.byteLength
				})

				length += value.byteLength
			}
 		}

		var jsonified = JSON.stringify(toc)

		length += jsonified.length + Uint32Array.BYTES_PER_ELEMENT + 1

		var writer = new BinaryWriter(length)

		writer.setUint8(BinaryWriter.validationByte) // validation byte
		writer.setUint32(jsonified.length) // table of contents length
		writer.setString(jsonified) // ToC

		for (var i = 0; i < toc.length; i++) {
			switch(toc[i].t) {
				case 's': writer.setString(contents[i]); break
				case 't': writer.setTypedArray(contents[i]); break
				case 'b': writer.setBuffer(contents[i]); break
			}
		}

		if (!writer.isAtEnd()) {
			throw "The lengths don't match up";
		}

		return writer.raw
	}


	constructor(length) {
		this.array = new Uint8Array(length)
		this.buffer = this.array.buffer
		this.dataView = new DataView(this.buffer)
		this.index = 0
	}

	setUint8(val) {
		this.dataView.setUint8(this.index, val)
		this.index += Uint8Array.BYTES_PER_ELEMENT
	}

	setUint32(val) {
		this.dataView.setUint32(this.index, val)
		this.index += Uint32Array.BYTES_PER_ELEMENT
	}

	setString(string) {
		var sv = new StringView(string);
		this.array.set(sv.rawData, this.index);
		this.index += sv.buffer.byteLength
	}

	setTypedArray(arr) {
		this.array.set(new Uint8Array(arr.buffer), this.index)
		this.index += arr.byteLength
	}

	setBuffer(buf) {
		this.array.set(new Uint8Array(buf), this.index)
		this.index += buf.byteLength
	}

	isAtEnd() {
		return this.buffer.byteLength === this.index
	}

	get raw() {
		return this.array.buffer
	}

}


class BinaryReader {

	/**
	 * Returns the contents read from the array buffer
	 * @param  {ArrayBuffer} buffer
	 * @return {array}      
	 */
	static read(buffer) {
		var reader = new BinaryReader(buffer)

		var validation = reader.getUint8()

		if (validation !== BinaryWriter.validationByte) {
			throw "validation byte doesn't match."
		}

		var tocLength = reader.getUint32()
		var tocString = reader.getString(tocLength)
		var toc = JSON.parse(tocString)
		var contents = []

		for (var i = 0; i < toc.length; i++) {
			switch (toc[i].t) {
				case 's': contents.push(reader.getString(toc[i].l)); break
				case 't': contents.push(new (typeof window !== 'undefined' ? window : global)[toc[i].i](reader.getBuffer(toc[i].l))); break
				case 'b': contents.push(reader.getBuffer(toc[i].l)); break
			}

			if (toc[i]['o'] === 1) {
				contents[i] = JSON.parse(contents[i]);
			}
		}

		return contents
	}


	constructor(buffer) {
		this.array = new Uint8Array(buffer)
		this.buffer = buffer
		this.dataView = new DataView(buffer)
		this.index = 0
	}


	getUint8() {
		var val = this.dataView.getUint8(this.index)
		this.index += Uint8Array.BYTES_PER_ELEMENT

		return val
	}

	getUint32() {
		var val = this.dataView.getUint32(this.index)
		this.index += Uint32Array.BYTES_PER_ELEMENT

		return val
	}

	getString(length) {
		var arr = this.array.subarray(this.index, this.index + length)
		var str = (new StringView(arr)).toString()

		this.index += arr.byteLength

		return str
	}

	getBuffer(byteLength) {
		var arr = this.array.slice(this.index, this.index + byteLength)
		this.index += byteLength

		return arr.buffer
	}

	isAtEnd() {
		return this.buffer.byteLength === this.index
	}

}

BinaryWriter.validationByte = 0x8F;

module.exports = {
	'Writer' : BinaryWriter,
	'Reader' : BinaryReader
};
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(9)))

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = {
	driver: __webpack_require__(5),
	car: __webpack_require__(1),
	dispatcher: __webpack_require__(10),
	keyboard: __webpack_require__(6),
	renderer: __webpack_require__(11),
	world: __webpack_require__(14),
  wspipe: __webpack_require__(4),
  client: __webpack_require__(3),
  logging: __webpack_require__(0),
  Binary: __webpack_require__(7) 
};

/***/ }),
/* 9 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

var requestAnimFrame =  window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) { window.setTimeout(callback, 1000 / 60); };
var keyboard = __webpack_require__(6);

function dispatcher(renderer, world) {
    this.renderer = renderer;
    this.world = world;
    this.running = true;
    this.interval = false;
    this.step = 0;

    this.keyboard = new keyboard();
    this.keyboard.subscribe((function (k) {
        for (var i = 0; i < this.world.drivers.length; i++) {
            this.world.drivers[i].car.handleKeyInput(k);
        }
        
        // if (k.get(189)) {
        //     this.renderer.zoom(0.9);
        // }

        // if (k.get(187)) {
        //     this.renderer.zoom(1.1);
        // }
    }).bind(this));

    this.__loop = this.loop.bind(this);
}

dispatcher.prototype.dt = function () {
    var now = Date.now(); 
    var diff = now - (this.prev || now);
    this.prev = now; 

    return diff / 1000;
};

dispatcher.prototype.loop = function () {
    if (this.running && !this.interval) {  // start next timer
        requestAnimFrame(this.__loop);
    }

    var dt = 1.0 / 60.0

    // compute phyiscs
    this.world.step(dt);
    this.step++;

    // draw everything
    if (!this.interval || this.step % 5 === 0)
        this.renderer.render();

};

dispatcher.prototype.begin = function () {
    this.running = true;

    if (this.__interval && !this.interval)
        clearInterval(this.__interval)

    if (this.interval)
        this.__interval = setInterval(this.__loop, 0)
    else
        requestAnimFrame(this.__loop)
};

dispatcher.prototype.goFast = function () {
    if (this.interval)
        return

    this.interval = true
    this.begin()
};

dispatcher.prototype.goSlow = function () {
    if (!this.__interval)
        return 

    clearInterval(this.__interval)
    this.interval = false;

    this.begin()
}

dispatcher.prototype.stop = function () {
    this.running = false;
};

module.exports = dispatcher;

/***/ }),
/* 11 */
/***/ (function(module, exports) {



function renderer(world, container) {
    this.world = world;
    this.world.p2.on("addBody", (e) => {
        this.add_body(e.body)
    });

    this.world.p2.on("removeBody", (e) => {
        this.remove_body(e.body)
    })

    if (container) {
        this.elementContainer = container
    }

    else {
        this.elementContainer = document.createElement("div");
        this.elementContainer.style.width = "100%";
        // this.elementContainer.style.height = "100%";
        document.body.appendChild(this.elementContainer)
    }

    this.pixelRatio = window.devicePixelRatio || 1;

    this.pixi = new PIXI.autoDetectRenderer(0, 0, {
        antialias: true,
        resolution: this.pixelRatio,
        transparent: true
    }, false);
    // this.pixi.backgroundColor = 0xFFFFFF;

    this.stage = new PIXI.Container()
    this.container = new PIXI.DisplayObjectContainer()

    this.stage.addChild(this.container)

    this.drawPoints = []

    this.elementContainer.addEventListener("mousedown", (function (e) {
        this.mousedown(this.mousePositionFromEvent(e)) 
    }).bind(this)); 

    this.elementContainer.addEventListener("mousemove", (function (e) {
        if(e.which !== 1)
            return 

        this.mousemove(this.mousePositionFromEvent(e)) 
    }).bind(this))

    this.elementContainer.addEventListener("mouseup", (function (e) {
        this.mouseup(this.mousePositionFromEvent(e))
    }).bind(this)); 

    this.pixi.view.style.width = "100%";
    this.pixi.view.style.height = "100%";
    this.pixi.view.style.border = "5px solid #EEE";
    this.elementContainer.appendChild(this.pixi.view);

    this.bodies = [];
    this.viewport = { scale: 35, center: [0,0], width: 0, height: 0 };

    // resize the canvas to fill browser window dynamically
    window.addEventListener('resize', this.events.resize.bind(this), false);
    this.adjustBounds();

    this.drawingGraphic = new PIXI.Graphics()
    this.container.addChild(this.drawingGraphic)
};

renderer.prototype.events = {};
renderer.prototype.events.resize = function () {
    this.adjustBounds();
    this.pixi.render(this.stage);
};

renderer.prototype.mousePositionFromEvent = function (e) {
    var rect = this.pixi.view.getBoundingClientRect()
    var x = e.clientX - rect.left
    var y = e.clientY - rect.top
    return PIXI.interaction.InteractionData.prototype.getLocalPosition(this.stage, null, new PIXI.Point(x, y))
};


renderer.prototype.adjustBounds = function () {
    var outerW = this.elementContainer.offsetWidth
    var outerH = outerW / 3 * 2

    this.viewport.width = outerW
    this.viewport.height = outerH
    this.viewport.scale = outerW / 1200 * 35

    this.offset = this.pixi.view.getBoundingClientRect()
    this.offset = {
        top: this.offset.top + document.body.scrollTop,
        left: this.offset.left + document.body.scrollLeft
    }

    this.pixi.resize(this.viewport.width, this.viewport.height)
 };

renderer.prototype.render = function () {
    for (var i = 0; i < this.bodies.length; i++) {
        this.update_body(this.bodies[i]);
    }

    this.update_stage(this.stage);
    this.pixi.render(this.stage);
};

renderer.prototype.update_stage = function (stage) {
    stage.scale.x = this.viewport.scale;
    stage.scale.y = this.viewport.scale;
    stage.position.x = this.viewport.center[0] + this.viewport.width / 2;
    stage.position.y = this.viewport.center[1] + this.viewport.height / 2;
};

renderer.prototype.update_body = function (body) {
    body.gl_sprite.position.x = body.interpolatedPosition[0]
    body.gl_sprite.position.y = body.interpolatedPosition[1]
    body.gl_sprite.rotation = body.interpolatedAngle
};

renderer.prototype.create_sprite = function (body) {

    var sprite = new PIXI.Graphics();

    this.draw_sprite(body, sprite);
    this.stage.addChild(sprite);

    if (body.gl_create) {
        body.gl_create(sprite, this);
    }

    return sprite;
};

renderer.prototype.draw_path = function (sprite, path, opt) {
    if (path.length < 2) 
        return ;

    if (typeof opt.line !== 'undefined') {
        sprite.lineStyle(opt.line.width, opt.line.color, opt.line.alpha);
    }
    
    if (typeof opt.fill !== 'undefined') {
        sprite.beginFill(opt.fill.color, opt.fill.alpha);
    }
    
    sprite.moveTo(path[0][0], path[0][1]);
    for (var i = 1; i < path.length; i++) {
        var p = path[i];
        sprite.lineTo(p[0], p[1]);
    }

    if (opt.fill !== 'undefined') {
        sprite.endFill();
    }
}

renderer.prototype.draw_rect = function (sprite, bounds, angle, opt) {
    var w = bounds.w, h = bounds.h, x = bounds.x, y = bounds.y;
    var path = [
        [w / 2, h / 2],
        [-w / 2, h / 2],
        [-w / 2, -h / 2],
        [w / 2, -h / 2],
        [w / 2, h / 2]
    ];

    // Rotate and add position
    for (var i = 0; i < path.length; i++) {
        var v = path[i];
        p2.vec2.rotate(v, v, angle);
        p2.vec2.add(v, v, [x, y]);
    }

    this.draw_path(sprite, path, opt);
}

renderer.prototype.draw_sprite = function (body, sprite) {
    sprite.clear();

    var color = body.color
    var opt = {
        line: { color: color, alpha: 1, width: 0.01 },
        fill: { color: color, alpha: 1.0 }
    }

    if(body.concavePath){
        var path = []

        for(var j=0; j!==body.concavePath.length; j++){
            var v = body.concavePath[j]
            path.push([v[0], v[1]])
        }

        this.draw_path(sprite, path, opt)

        return 
    }

    for (var i = 0; i < body.shapes.length; i++) {
        var shape = body.shapes[i],
            offset = shape.position,
            angle = shape.angle;

        var shape_opt = opt
        if (shape.color) {
            shape_opt = {
                line: { color: shape.color, alpha: 1, width: 0.01 },
                fill: { color: shape.color, alpha: 1.0 }
            }
        }

        if (shape instanceof p2.Box) {
            this.draw_rect(sprite, { w: shape.width, h: shape.height, x: offset[0], y: offset[1] }, angle, shape_opt);
        }

        else if (shape instanceof p2.Convex) {
            var path = [], v = p2.vec2.create();
            for(var j = 0; j < shape.vertices.length; j++){
                p2.vec2.rotate(v, shape.vertices[j], angle);
                path.push([v[0]+offset[0], v[1]+offset[1]]);
            }

            this.draw_path(sprite, path, shape_opt);
        }
    }
};  

renderer.prototype.add_body = function (body) {
    if (body instanceof p2.Body && body.shapes.length && !body.hidden) {
        body.gl_sprite = this.create_sprite(body);
        this.update_body(body);
        this.bodies.push(body);
    }
};

renderer.prototype.remove_body = function (body) {
    if (body.gl_sprite) {
        this.stage.removeChild(body.gl_sprite)

        for (var i = this.bodies.length; --i; ) {
            if (this.bodies[i] === body) {
                this.bodies.splice(i, 1);
            }
        }
    }
};

renderer.prototype.zoom = function (factor) {
    this.viewport.scale *= factor;
};

var sampling = 0.4
renderer.prototype.mousedown = function (pos) {
    this.drawPoints = [ [ pos.x, pos.y ] ]
};

renderer.prototype.mousemove = function (pos) {
    pos = [ pos.x, pos.y ]

    var sqdist = p2.vec2.distance(pos,this.drawPoints[this.drawPoints.length-1]);
    if (sqdist > sampling*sampling){
        this.drawPoints.push(pos)

        this.drawingGraphic.clear()
        this.draw_path(this.drawingGraphic, this.drawPoints, {
            line: {
                width: 0.02,
                color: 0xFF0000,
                alpha: 0.9
            }
        })
    }
}

renderer.prototype.mouseup = function (pos) {
    if (this.drawPoints.length > 2) {    
        this.world.addBodyFromPoints(this.drawPoints)
    }

    this.drawPoints = []
    this.drawingGraphic.clear()
};


module.exports = renderer;

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

var color = __webpack_require__(2);

function distanceSensor(car, opt) {
	this.car = car;
	this.angle = opt.angle / 180 * Math.PI;
	this.length = opt.length || 10;

	this.direction = [ Math.sin(this.angle), Math.cos(this.angle) ]
	this.start = opt.start || [ 0, 0.1 ]

    this.localNormal = p2.vec2.create()
    this.globalRay = p2.vec2.create()

    this.ray = new p2.Ray({
        mode: p2.Ray.CLOSEST,
        direction: this.direction,
        length: this.length,
        checkCollisionResponse: false,
        skipBackfaces: true
    })

    this.updateLength(this.length);

    this.castedResult = new p2.RaycastResult()
    this.hit = false
    this.setDefault()

    this.data = new Float64Array(this.dimensions);
    this.highlighted = false
}

distanceSensor.prototype.dimensions = 3

distanceSensor.prototype.updateLength = function (v) {
	this.length = v
	this.ray.length = this.length
	this.end = [ this.start[0] + this.direction[0] * this.length, this.start[1] + this.direction[1] * this.length ]
	this.rayVector = [ this.end[0] - this.start[0], this.end[1] - this.start[1] ]
};

distanceSensor.prototype.setDefault = function () {
	this.distance = 1.0
	this.entity = 0
	this.localNormal[0] = 0
	this.localNormal[1] = 0
	this.reflectionAngle = 0
};

distanceSensor.prototype.update = function () {
	var vehicleBody = this.car.chassisBody;
	if (vehicleBody.world === null)
		return ;

    vehicleBody.toWorldFrame(this.ray.from, this.start);
    vehicleBody.toWorldFrame(this.ray.to, this.end);
    
    this.ray.update();
    this.castedResult.reset();

    vehicleBody.world.raycast(this.castedResult, this.ray);

    if (this.hit = this.castedResult.hasHit()) {
    	this.distance = this.castedResult.fraction
    	this.entity = this.castedResult.shape.entity

    	vehicleBody.vectorToLocalFrame(this.localNormal, this.castedResult.normal)
    	vehicleBody.vectorToWorldFrame(this.globalRay, this.rayVector)

    	this.reflectionAngle = Math.atan2( this.castedResult.normal[1], this.castedResult.normal[0] ) - Math.atan2( this.globalRay[1], this.globalRay[0] ) // = Math.atan2( this.localNormal[1], this.localNormal[0] ) - Math.atan2( this.rayVector[1], this.rayVector[0] )	
    	if (this.reflectionAngle > Math.PI / 2) this.reflectionAngle = Math.PI - this.reflectionAngle
    	if (this.reflectionAngle < -Math.PI / 2) this.reflectionAngle = Math.PI + this.reflectionAngle
    } 

    else {
    	this.setDefault();
    }
};

distanceSensor.prototype.draw = function (g) {
	var dist = this.distance
	var c = color.rgbToHex(Math.floor((1-this.distance) * 255), Math.floor((this.distance) * 128), 128)
	g.lineStyle(this.highlighted ? 0.04 : 0.01, c, 0.5)
	g.moveTo(this.start[0], this.start[1]);
	g.lineTo(this.start[0] + this.direction[0] * this.length * dist, this.start[1] + this.direction[1] * this.length * dist);
};

distanceSensor.prototype.read = function () {
	if (this.hit) {
		this.data[0] = 1.0 - this.distance
		this.data[1] = this.reflectionAngle
		this.data[2] = this.entity === 2 ? 1.0 : 0.0 // is car?
	}

	else {
		this.data.fill(0.0)
	}

	return this.data
};



function speedSensor(car, opt) {
	this.car = car
	this.local = p2.vec2.create()
	this.data = new Float64Array(this.dimensions)
}

speedSensor.prototype.dimensions = 1

speedSensor.prototype.update = function () {
	this.car.chassisBody.vectorToLocalFrame(this.local, this.car.chassisBody.velocity)
	this.velocity = p2.vec2.len(this.car.chassisBody.velocity) * (this.local[1] > 0 ? 1.0 : -1.0)
};

speedSensor.prototype.draw = function (g) {
	if (g.__label === undefined) {
		g.__label = new PIXI.Text('0 km/h', { font: '80px Helvetica Neue' });
		g.__label.scale.x = (g.__label.scale.y = 3e-3);
		g.addChild(g.__label);
	}

	g.__label.text = Math.floor(this.velocity * 3.6) + ' km/h';
	g.__label.rotation = -this.car.chassisBody.interpolatedAngle;
};

speedSensor.prototype.read = function () {
	this.data[0] = this.velocity

	return this.data
}


function create(car, opt) {
	switch (opt.type) {
		case 'distance':
			return new distanceSensor(car, opt);

		case 'speed':
			return new speedSensor(car, opt);

		default: 
			return null;
	}
}

function build(car, config) {
	var out = [];

	if (car.dynamicForwardSensor) {
		config = config.splice(0, 0, { type: 'distance', angle: +0, length: 0 });
	}

	for (var i = 0; i < config.length; i++) {
		var sensor = create(car, config[i]);
		if (sensor !== null) {
			out.push(sensor);
		}
	}

	return out;
}


module.exports = {
	distance: distanceSensor,
	speed: speedSensor,
	build: build
};

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_RESULT__;// TinyColor v1.4.1
// https://github.com/bgrins/TinyColor
// Brian Grinstead, MIT License

(function(Math) {

var trimLeft = /^\s+/,
    trimRight = /\s+$/,
    tinyCounter = 0,
    mathRound = Math.round,
    mathMin = Math.min,
    mathMax = Math.max,
    mathRandom = Math.random;

function tinycolor (color, opts) {

    color = (color) ? color : '';
    opts = opts || { };

    // If input is already a tinycolor, return itself
    if (color instanceof tinycolor) {
       return color;
    }
    // If we are called as a function, call using new instead
    if (!(this instanceof tinycolor)) {
        return new tinycolor(color, opts);
    }

    var rgb = inputToRGB(color);
    this._originalInput = color,
    this._r = rgb.r,
    this._g = rgb.g,
    this._b = rgb.b,
    this._a = rgb.a,
    this._roundA = mathRound(100*this._a) / 100,
    this._format = opts.format || rgb.format;
    this._gradientType = opts.gradientType;

    // Don't let the range of [0,255] come back in [0,1].
    // Potentially lose a little bit of precision here, but will fix issues where
    // .5 gets interpreted as half of the total, instead of half of 1
    // If it was supposed to be 128, this was already taken care of by `inputToRgb`
    if (this._r < 1) { this._r = mathRound(this._r); }
    if (this._g < 1) { this._g = mathRound(this._g); }
    if (this._b < 1) { this._b = mathRound(this._b); }

    this._ok = rgb.ok;
    this._tc_id = tinyCounter++;
}

tinycolor.prototype = {
    isDark: function() {
        return this.getBrightness() < 128;
    },
    isLight: function() {
        return !this.isDark();
    },
    isValid: function() {
        return this._ok;
    },
    getOriginalInput: function() {
      return this._originalInput;
    },
    getFormat: function() {
        return this._format;
    },
    getAlpha: function() {
        return this._a;
    },
    getBrightness: function() {
        //http://www.w3.org/TR/AERT#color-contrast
        var rgb = this.toRgb();
        return (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    },
    getLuminance: function() {
        //http://www.w3.org/TR/2008/REC-WCAG20-20081211/#relativeluminancedef
        var rgb = this.toRgb();
        var RsRGB, GsRGB, BsRGB, R, G, B;
        RsRGB = rgb.r/255;
        GsRGB = rgb.g/255;
        BsRGB = rgb.b/255;

        if (RsRGB <= 0.03928) {R = RsRGB / 12.92;} else {R = Math.pow(((RsRGB + 0.055) / 1.055), 2.4);}
        if (GsRGB <= 0.03928) {G = GsRGB / 12.92;} else {G = Math.pow(((GsRGB + 0.055) / 1.055), 2.4);}
        if (BsRGB <= 0.03928) {B = BsRGB / 12.92;} else {B = Math.pow(((BsRGB + 0.055) / 1.055), 2.4);}
        return (0.2126 * R) + (0.7152 * G) + (0.0722 * B);
    },
    setAlpha: function(value) {
        this._a = boundAlpha(value);
        this._roundA = mathRound(100*this._a) / 100;
        return this;
    },
    toHsv: function() {
        var hsv = rgbToHsv(this._r, this._g, this._b);
        return { h: hsv.h * 360, s: hsv.s, v: hsv.v, a: this._a };
    },
    toHsvString: function() {
        var hsv = rgbToHsv(this._r, this._g, this._b);
        var h = mathRound(hsv.h * 360), s = mathRound(hsv.s * 100), v = mathRound(hsv.v * 100);
        return (this._a == 1) ?
          "hsv("  + h + ", " + s + "%, " + v + "%)" :
          "hsva(" + h + ", " + s + "%, " + v + "%, "+ this._roundA + ")";
    },
    toHsl: function() {
        var hsl = rgbToHsl(this._r, this._g, this._b);
        return { h: hsl.h * 360, s: hsl.s, l: hsl.l, a: this._a };
    },
    toHslString: function() {
        var hsl = rgbToHsl(this._r, this._g, this._b);
        var h = mathRound(hsl.h * 360), s = mathRound(hsl.s * 100), l = mathRound(hsl.l * 100);
        return (this._a == 1) ?
          "hsl("  + h + ", " + s + "%, " + l + "%)" :
          "hsla(" + h + ", " + s + "%, " + l + "%, "+ this._roundA + ")";
    },
    toHex: function(allow3Char) {
        return rgbToHex(this._r, this._g, this._b, allow3Char);
    },
    toHexString: function(allow3Char) {
        return '#' + this.toHex(allow3Char);
    },
    toHex8: function(allow4Char) {
        return rgbaToHex(this._r, this._g, this._b, this._a, allow4Char);
    },
    toHex8String: function(allow4Char) {
        return '#' + this.toHex8(allow4Char);
    },
    toRgb: function() {
        return { r: mathRound(this._r), g: mathRound(this._g), b: mathRound(this._b), a: this._a };
    },
    toRgbString: function() {
        return (this._a == 1) ?
          "rgb("  + mathRound(this._r) + ", " + mathRound(this._g) + ", " + mathRound(this._b) + ")" :
          "rgba(" + mathRound(this._r) + ", " + mathRound(this._g) + ", " + mathRound(this._b) + ", " + this._roundA + ")";
    },
    toPercentageRgb: function() {
        return { r: mathRound(bound01(this._r, 255) * 100) + "%", g: mathRound(bound01(this._g, 255) * 100) + "%", b: mathRound(bound01(this._b, 255) * 100) + "%", a: this._a };
    },
    toPercentageRgbString: function() {
        return (this._a == 1) ?
          "rgb("  + mathRound(bound01(this._r, 255) * 100) + "%, " + mathRound(bound01(this._g, 255) * 100) + "%, " + mathRound(bound01(this._b, 255) * 100) + "%)" :
          "rgba(" + mathRound(bound01(this._r, 255) * 100) + "%, " + mathRound(bound01(this._g, 255) * 100) + "%, " + mathRound(bound01(this._b, 255) * 100) + "%, " + this._roundA + ")";
    },
    toName: function() {
        if (this._a === 0) {
            return "transparent";
        }

        if (this._a < 1) {
            return false;
        }

        return hexNames[rgbToHex(this._r, this._g, this._b, true)] || false;
    },
    toFilter: function(secondColor) {
        var hex8String = '#' + rgbaToArgbHex(this._r, this._g, this._b, this._a);
        var secondHex8String = hex8String;
        var gradientType = this._gradientType ? "GradientType = 1, " : "";

        if (secondColor) {
            var s = tinycolor(secondColor);
            secondHex8String = '#' + rgbaToArgbHex(s._r, s._g, s._b, s._a);
        }

        return "progid:DXImageTransform.Microsoft.gradient("+gradientType+"startColorstr="+hex8String+",endColorstr="+secondHex8String+")";
    },
    toString: function(format) {
        var formatSet = !!format;
        format = format || this._format;

        var formattedString = false;
        var hasAlpha = this._a < 1 && this._a >= 0;
        var needsAlphaFormat = !formatSet && hasAlpha && (format === "hex" || format === "hex6" || format === "hex3" || format === "hex4" || format === "hex8" || format === "name");

        if (needsAlphaFormat) {
            // Special case for "transparent", all other non-alpha formats
            // will return rgba when there is transparency.
            if (format === "name" && this._a === 0) {
                return this.toName();
            }
            return this.toRgbString();
        }
        if (format === "rgb") {
            formattedString = this.toRgbString();
        }
        if (format === "prgb") {
            formattedString = this.toPercentageRgbString();
        }
        if (format === "hex" || format === "hex6") {
            formattedString = this.toHexString();
        }
        if (format === "hex3") {
            formattedString = this.toHexString(true);
        }
        if (format === "hex4") {
            formattedString = this.toHex8String(true);
        }
        if (format === "hex8") {
            formattedString = this.toHex8String();
        }
        if (format === "name") {
            formattedString = this.toName();
        }
        if (format === "hsl") {
            formattedString = this.toHslString();
        }
        if (format === "hsv") {
            formattedString = this.toHsvString();
        }

        return formattedString || this.toHexString();
    },
    clone: function() {
        return tinycolor(this.toString());
    },

    _applyModification: function(fn, args) {
        var color = fn.apply(null, [this].concat([].slice.call(args)));
        this._r = color._r;
        this._g = color._g;
        this._b = color._b;
        this.setAlpha(color._a);
        return this;
    },
    lighten: function() {
        return this._applyModification(lighten, arguments);
    },
    brighten: function() {
        return this._applyModification(brighten, arguments);
    },
    darken: function() {
        return this._applyModification(darken, arguments);
    },
    desaturate: function() {
        return this._applyModification(desaturate, arguments);
    },
    saturate: function() {
        return this._applyModification(saturate, arguments);
    },
    greyscale: function() {
        return this._applyModification(greyscale, arguments);
    },
    spin: function() {
        return this._applyModification(spin, arguments);
    },

    _applyCombination: function(fn, args) {
        return fn.apply(null, [this].concat([].slice.call(args)));
    },
    analogous: function() {
        return this._applyCombination(analogous, arguments);
    },
    complement: function() {
        return this._applyCombination(complement, arguments);
    },
    monochromatic: function() {
        return this._applyCombination(monochromatic, arguments);
    },
    splitcomplement: function() {
        return this._applyCombination(splitcomplement, arguments);
    },
    triad: function() {
        return this._applyCombination(triad, arguments);
    },
    tetrad: function() {
        return this._applyCombination(tetrad, arguments);
    }
};

// If input is an object, force 1 into "1.0" to handle ratios properly
// String input requires "1.0" as input, so 1 will be treated as 1
tinycolor.fromRatio = function(color, opts) {
    if (typeof color == "object") {
        var newColor = {};
        for (var i in color) {
            if (color.hasOwnProperty(i)) {
                if (i === "a") {
                    newColor[i] = color[i];
                }
                else {
                    newColor[i] = convertToPercentage(color[i]);
                }
            }
        }
        color = newColor;
    }

    return tinycolor(color, opts);
};

// Given a string or object, convert that input to RGB
// Possible string inputs:
//
//     "red"
//     "#f00" or "f00"
//     "#ff0000" or "ff0000"
//     "#ff000000" or "ff000000"
//     "rgb 255 0 0" or "rgb (255, 0, 0)"
//     "rgb 1.0 0 0" or "rgb (1, 0, 0)"
//     "rgba (255, 0, 0, 1)" or "rgba 255, 0, 0, 1"
//     "rgba (1.0, 0, 0, 1)" or "rgba 1.0, 0, 0, 1"
//     "hsl(0, 100%, 50%)" or "hsl 0 100% 50%"
//     "hsla(0, 100%, 50%, 1)" or "hsla 0 100% 50%, 1"
//     "hsv(0, 100%, 100%)" or "hsv 0 100% 100%"
//
function inputToRGB(color) {

    var rgb = { r: 0, g: 0, b: 0 };
    var a = 1;
    var s = null;
    var v = null;
    var l = null;
    var ok = false;
    var format = false;

    if (typeof color == "string") {
        color = stringInputToObject(color);
    }

    if (typeof color == "object") {
        if (isValidCSSUnit(color.r) && isValidCSSUnit(color.g) && isValidCSSUnit(color.b)) {
            rgb = rgbToRgb(color.r, color.g, color.b);
            ok = true;
            format = String(color.r).substr(-1) === "%" ? "prgb" : "rgb";
        }
        else if (isValidCSSUnit(color.h) && isValidCSSUnit(color.s) && isValidCSSUnit(color.v)) {
            s = convertToPercentage(color.s);
            v = convertToPercentage(color.v);
            rgb = hsvToRgb(color.h, s, v);
            ok = true;
            format = "hsv";
        }
        else if (isValidCSSUnit(color.h) && isValidCSSUnit(color.s) && isValidCSSUnit(color.l)) {
            s = convertToPercentage(color.s);
            l = convertToPercentage(color.l);
            rgb = hslToRgb(color.h, s, l);
            ok = true;
            format = "hsl";
        }

        if (color.hasOwnProperty("a")) {
            a = color.a;
        }
    }

    a = boundAlpha(a);

    return {
        ok: ok,
        format: color.format || format,
        r: mathMin(255, mathMax(rgb.r, 0)),
        g: mathMin(255, mathMax(rgb.g, 0)),
        b: mathMin(255, mathMax(rgb.b, 0)),
        a: a
    };
}


// Conversion Functions
// --------------------

// `rgbToHsl`, `rgbToHsv`, `hslToRgb`, `hsvToRgb` modified from:
// <http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript>

// `rgbToRgb`
// Handle bounds / percentage checking to conform to CSS color spec
// <http://www.w3.org/TR/css3-color/>
// *Assumes:* r, g, b in [0, 255] or [0, 1]
// *Returns:* { r, g, b } in [0, 255]
function rgbToRgb(r, g, b){
    return {
        r: bound01(r, 255) * 255,
        g: bound01(g, 255) * 255,
        b: bound01(b, 255) * 255
    };
}

// `rgbToHsl`
// Converts an RGB color value to HSL.
// *Assumes:* r, g, and b are contained in [0, 255] or [0, 1]
// *Returns:* { h, s, l } in [0,1]
function rgbToHsl(r, g, b) {

    r = bound01(r, 255);
    g = bound01(g, 255);
    b = bound01(b, 255);

    var max = mathMax(r, g, b), min = mathMin(r, g, b);
    var h, s, l = (max + min) / 2;

    if(max == min) {
        h = s = 0; // achromatic
    }
    else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }

        h /= 6;
    }

    return { h: h, s: s, l: l };
}

// `hslToRgb`
// Converts an HSL color value to RGB.
// *Assumes:* h is contained in [0, 1] or [0, 360] and s and l are contained [0, 1] or [0, 100]
// *Returns:* { r, g, b } in the set [0, 255]
function hslToRgb(h, s, l) {
    var r, g, b;

    h = bound01(h, 360);
    s = bound01(s, 100);
    l = bound01(l, 100);

    function hue2rgb(p, q, t) {
        if(t < 0) t += 1;
        if(t > 1) t -= 1;
        if(t < 1/6) return p + (q - p) * 6 * t;
        if(t < 1/2) return q;
        if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
    }

    if(s === 0) {
        r = g = b = l; // achromatic
    }
    else {
        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return { r: r * 255, g: g * 255, b: b * 255 };
}

// `rgbToHsv`
// Converts an RGB color value to HSV
// *Assumes:* r, g, and b are contained in the set [0, 255] or [0, 1]
// *Returns:* { h, s, v } in [0,1]
function rgbToHsv(r, g, b) {

    r = bound01(r, 255);
    g = bound01(g, 255);
    b = bound01(b, 255);

    var max = mathMax(r, g, b), min = mathMin(r, g, b);
    var h, s, v = max;

    var d = max - min;
    s = max === 0 ? 0 : d / max;

    if(max == min) {
        h = 0; // achromatic
    }
    else {
        switch(max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return { h: h, s: s, v: v };
}

// `hsvToRgb`
// Converts an HSV color value to RGB.
// *Assumes:* h is contained in [0, 1] or [0, 360] and s and v are contained in [0, 1] or [0, 100]
// *Returns:* { r, g, b } in the set [0, 255]
 function hsvToRgb(h, s, v) {

    h = bound01(h, 360) * 6;
    s = bound01(s, 100);
    v = bound01(v, 100);

    var i = Math.floor(h),
        f = h - i,
        p = v * (1 - s),
        q = v * (1 - f * s),
        t = v * (1 - (1 - f) * s),
        mod = i % 6,
        r = [v, q, p, p, t, v][mod],
        g = [t, v, v, q, p, p][mod],
        b = [p, p, t, v, v, q][mod];

    return { r: r * 255, g: g * 255, b: b * 255 };
}

// `rgbToHex`
// Converts an RGB color to hex
// Assumes r, g, and b are contained in the set [0, 255]
// Returns a 3 or 6 character hex
function rgbToHex(r, g, b, allow3Char) {

    var hex = [
        pad2(mathRound(r).toString(16)),
        pad2(mathRound(g).toString(16)),
        pad2(mathRound(b).toString(16))
    ];

    // Return a 3 character hex if possible
    if (allow3Char && hex[0].charAt(0) == hex[0].charAt(1) && hex[1].charAt(0) == hex[1].charAt(1) && hex[2].charAt(0) == hex[2].charAt(1)) {
        return hex[0].charAt(0) + hex[1].charAt(0) + hex[2].charAt(0);
    }

    return hex.join("");
}

// `rgbaToHex`
// Converts an RGBA color plus alpha transparency to hex
// Assumes r, g, b are contained in the set [0, 255] and
// a in [0, 1]. Returns a 4 or 8 character rgba hex
function rgbaToHex(r, g, b, a, allow4Char) {

    var hex = [
        pad2(mathRound(r).toString(16)),
        pad2(mathRound(g).toString(16)),
        pad2(mathRound(b).toString(16)),
        pad2(convertDecimalToHex(a))
    ];

    // Return a 4 character hex if possible
    if (allow4Char && hex[0].charAt(0) == hex[0].charAt(1) && hex[1].charAt(0) == hex[1].charAt(1) && hex[2].charAt(0) == hex[2].charAt(1) && hex[3].charAt(0) == hex[3].charAt(1)) {
        return hex[0].charAt(0) + hex[1].charAt(0) + hex[2].charAt(0) + hex[3].charAt(0);
    }

    return hex.join("");
}

// `rgbaToArgbHex`
// Converts an RGBA color to an ARGB Hex8 string
// Rarely used, but required for "toFilter()"
function rgbaToArgbHex(r, g, b, a) {

    var hex = [
        pad2(convertDecimalToHex(a)),
        pad2(mathRound(r).toString(16)),
        pad2(mathRound(g).toString(16)),
        pad2(mathRound(b).toString(16))
    ];

    return hex.join("");
}

// `equals`
// Can be called with any tinycolor input
tinycolor.equals = function (color1, color2) {
    if (!color1 || !color2) { return false; }
    return tinycolor(color1).toRgbString() == tinycolor(color2).toRgbString();
};

tinycolor.random = function() {
    return tinycolor.fromRatio({
        r: mathRandom(),
        g: mathRandom(),
        b: mathRandom()
    });
};


// Modification Functions
// ----------------------
// Thanks to less.js for some of the basics here
// <https://github.com/cloudhead/less.js/blob/master/lib/less/functions.js>

function desaturate(color, amount) {
    amount = (amount === 0) ? 0 : (amount || 10);
    var hsl = tinycolor(color).toHsl();
    hsl.s -= amount / 100;
    hsl.s = clamp01(hsl.s);
    return tinycolor(hsl);
}

function saturate(color, amount) {
    amount = (amount === 0) ? 0 : (amount || 10);
    var hsl = tinycolor(color).toHsl();
    hsl.s += amount / 100;
    hsl.s = clamp01(hsl.s);
    return tinycolor(hsl);
}

function greyscale(color) {
    return tinycolor(color).desaturate(100);
}

function lighten (color, amount) {
    amount = (amount === 0) ? 0 : (amount || 10);
    var hsl = tinycolor(color).toHsl();
    hsl.l += amount / 100;
    hsl.l = clamp01(hsl.l);
    return tinycolor(hsl);
}

function brighten(color, amount) {
    amount = (amount === 0) ? 0 : (amount || 10);
    var rgb = tinycolor(color).toRgb();
    rgb.r = mathMax(0, mathMin(255, rgb.r - mathRound(255 * - (amount / 100))));
    rgb.g = mathMax(0, mathMin(255, rgb.g - mathRound(255 * - (amount / 100))));
    rgb.b = mathMax(0, mathMin(255, rgb.b - mathRound(255 * - (amount / 100))));
    return tinycolor(rgb);
}

function darken (color, amount) {
    amount = (amount === 0) ? 0 : (amount || 10);
    var hsl = tinycolor(color).toHsl();
    hsl.l -= amount / 100;
    hsl.l = clamp01(hsl.l);
    return tinycolor(hsl);
}

// Spin takes a positive or negative amount within [-360, 360] indicating the change of hue.
// Values outside of this range will be wrapped into this range.
function spin(color, amount) {
    var hsl = tinycolor(color).toHsl();
    var hue = (hsl.h + amount) % 360;
    hsl.h = hue < 0 ? 360 + hue : hue;
    return tinycolor(hsl);
}

// Combination Functions
// ---------------------
// Thanks to jQuery xColor for some of the ideas behind these
// <https://github.com/infusion/jQuery-xcolor/blob/master/jquery.xcolor.js>

function complement(color) {
    var hsl = tinycolor(color).toHsl();
    hsl.h = (hsl.h + 180) % 360;
    return tinycolor(hsl);
}

function triad(color) {
    var hsl = tinycolor(color).toHsl();
    var h = hsl.h;
    return [
        tinycolor(color),
        tinycolor({ h: (h + 120) % 360, s: hsl.s, l: hsl.l }),
        tinycolor({ h: (h + 240) % 360, s: hsl.s, l: hsl.l })
    ];
}

function tetrad(color) {
    var hsl = tinycolor(color).toHsl();
    var h = hsl.h;
    return [
        tinycolor(color),
        tinycolor({ h: (h + 90) % 360, s: hsl.s, l: hsl.l }),
        tinycolor({ h: (h + 180) % 360, s: hsl.s, l: hsl.l }),
        tinycolor({ h: (h + 270) % 360, s: hsl.s, l: hsl.l })
    ];
}

function splitcomplement(color) {
    var hsl = tinycolor(color).toHsl();
    var h = hsl.h;
    return [
        tinycolor(color),
        tinycolor({ h: (h + 72) % 360, s: hsl.s, l: hsl.l}),
        tinycolor({ h: (h + 216) % 360, s: hsl.s, l: hsl.l})
    ];
}

function analogous(color, results, slices) {
    results = results || 6;
    slices = slices || 30;

    var hsl = tinycolor(color).toHsl();
    var part = 360 / slices;
    var ret = [tinycolor(color)];

    for (hsl.h = ((hsl.h - (part * results >> 1)) + 720) % 360; --results; ) {
        hsl.h = (hsl.h + part) % 360;
        ret.push(tinycolor(hsl));
    }
    return ret;
}

function monochromatic(color, results) {
    results = results || 6;
    var hsv = tinycolor(color).toHsv();
    var h = hsv.h, s = hsv.s, v = hsv.v;
    var ret = [];
    var modification = 1 / results;

    while (results--) {
        ret.push(tinycolor({ h: h, s: s, v: v}));
        v = (v + modification) % 1;
    }

    return ret;
}

// Utility Functions
// ---------------------

tinycolor.mix = function(color1, color2, amount) {
    amount = (amount === 0) ? 0 : (amount || 50);

    var rgb1 = tinycolor(color1).toRgb();
    var rgb2 = tinycolor(color2).toRgb();

    var p = amount / 100;

    var rgba = {
        r: ((rgb2.r - rgb1.r) * p) + rgb1.r,
        g: ((rgb2.g - rgb1.g) * p) + rgb1.g,
        b: ((rgb2.b - rgb1.b) * p) + rgb1.b,
        a: ((rgb2.a - rgb1.a) * p) + rgb1.a
    };

    return tinycolor(rgba);
};


// Readability Functions
// ---------------------
// <http://www.w3.org/TR/2008/REC-WCAG20-20081211/#contrast-ratiodef (WCAG Version 2)

// `contrast`
// Analyze the 2 colors and returns the color contrast defined by (WCAG Version 2)
tinycolor.readability = function(color1, color2) {
    var c1 = tinycolor(color1);
    var c2 = tinycolor(color2);
    return (Math.max(c1.getLuminance(),c2.getLuminance())+0.05) / (Math.min(c1.getLuminance(),c2.getLuminance())+0.05);
};

// `isReadable`
// Ensure that foreground and background color combinations meet WCAG2 guidelines.
// The third argument is an optional Object.
//      the 'level' property states 'AA' or 'AAA' - if missing or invalid, it defaults to 'AA';
//      the 'size' property states 'large' or 'small' - if missing or invalid, it defaults to 'small'.
// If the entire object is absent, isReadable defaults to {level:"AA",size:"small"}.

// *Example*
//    tinycolor.isReadable("#000", "#111") => false
//    tinycolor.isReadable("#000", "#111",{level:"AA",size:"large"}) => false
tinycolor.isReadable = function(color1, color2, wcag2) {
    var readability = tinycolor.readability(color1, color2);
    var wcag2Parms, out;

    out = false;

    wcag2Parms = validateWCAG2Parms(wcag2);
    switch (wcag2Parms.level + wcag2Parms.size) {
        case "AAsmall":
        case "AAAlarge":
            out = readability >= 4.5;
            break;
        case "AAlarge":
            out = readability >= 3;
            break;
        case "AAAsmall":
            out = readability >= 7;
            break;
    }
    return out;

};

// `mostReadable`
// Given a base color and a list of possible foreground or background
// colors for that base, returns the most readable color.
// Optionally returns Black or White if the most readable color is unreadable.
// *Example*
//    tinycolor.mostReadable(tinycolor.mostReadable("#123", ["#124", "#125"],{includeFallbackColors:false}).toHexString(); // "#112255"
//    tinycolor.mostReadable(tinycolor.mostReadable("#123", ["#124", "#125"],{includeFallbackColors:true}).toHexString();  // "#ffffff"
//    tinycolor.mostReadable("#a8015a", ["#faf3f3"],{includeFallbackColors:true,level:"AAA",size:"large"}).toHexString(); // "#faf3f3"
//    tinycolor.mostReadable("#a8015a", ["#faf3f3"],{includeFallbackColors:true,level:"AAA",size:"small"}).toHexString(); // "#ffffff"
tinycolor.mostReadable = function(baseColor, colorList, args) {
    var bestColor = null;
    var bestScore = 0;
    var readability;
    var includeFallbackColors, level, size ;
    args = args || {};
    includeFallbackColors = args.includeFallbackColors ;
    level = args.level;
    size = args.size;

    for (var i= 0; i < colorList.length ; i++) {
        readability = tinycolor.readability(baseColor, colorList[i]);
        if (readability > bestScore) {
            bestScore = readability;
            bestColor = tinycolor(colorList[i]);
        }
    }

    if (tinycolor.isReadable(baseColor, bestColor, {"level":level,"size":size}) || !includeFallbackColors) {
        return bestColor;
    }
    else {
        args.includeFallbackColors=false;
        return tinycolor.mostReadable(baseColor,["#fff", "#000"],args);
    }
};


// Big List of Colors
// ------------------
// <http://www.w3.org/TR/css3-color/#svg-color>
var names = tinycolor.names = {
    aliceblue: "f0f8ff",
    antiquewhite: "faebd7",
    aqua: "0ff",
    aquamarine: "7fffd4",
    azure: "f0ffff",
    beige: "f5f5dc",
    bisque: "ffe4c4",
    black: "000",
    blanchedalmond: "ffebcd",
    blue: "00f",
    blueviolet: "8a2be2",
    brown: "a52a2a",
    burlywood: "deb887",
    burntsienna: "ea7e5d",
    cadetblue: "5f9ea0",
    chartreuse: "7fff00",
    chocolate: "d2691e",
    coral: "ff7f50",
    cornflowerblue: "6495ed",
    cornsilk: "fff8dc",
    crimson: "dc143c",
    cyan: "0ff",
    darkblue: "00008b",
    darkcyan: "008b8b",
    darkgoldenrod: "b8860b",
    darkgray: "a9a9a9",
    darkgreen: "006400",
    darkgrey: "a9a9a9",
    darkkhaki: "bdb76b",
    darkmagenta: "8b008b",
    darkolivegreen: "556b2f",
    darkorange: "ff8c00",
    darkorchid: "9932cc",
    darkred: "8b0000",
    darksalmon: "e9967a",
    darkseagreen: "8fbc8f",
    darkslateblue: "483d8b",
    darkslategray: "2f4f4f",
    darkslategrey: "2f4f4f",
    darkturquoise: "00ced1",
    darkviolet: "9400d3",
    deeppink: "ff1493",
    deepskyblue: "00bfff",
    dimgray: "696969",
    dimgrey: "696969",
    dodgerblue: "1e90ff",
    firebrick: "b22222",
    floralwhite: "fffaf0",
    forestgreen: "228b22",
    fuchsia: "f0f",
    gainsboro: "dcdcdc",
    ghostwhite: "f8f8ff",
    gold: "ffd700",
    goldenrod: "daa520",
    gray: "808080",
    green: "008000",
    greenyellow: "adff2f",
    grey: "808080",
    honeydew: "f0fff0",
    hotpink: "ff69b4",
    indianred: "cd5c5c",
    indigo: "4b0082",
    ivory: "fffff0",
    khaki: "f0e68c",
    lavender: "e6e6fa",
    lavenderblush: "fff0f5",
    lawngreen: "7cfc00",
    lemonchiffon: "fffacd",
    lightblue: "add8e6",
    lightcoral: "f08080",
    lightcyan: "e0ffff",
    lightgoldenrodyellow: "fafad2",
    lightgray: "d3d3d3",
    lightgreen: "90ee90",
    lightgrey: "d3d3d3",
    lightpink: "ffb6c1",
    lightsalmon: "ffa07a",
    lightseagreen: "20b2aa",
    lightskyblue: "87cefa",
    lightslategray: "789",
    lightslategrey: "789",
    lightsteelblue: "b0c4de",
    lightyellow: "ffffe0",
    lime: "0f0",
    limegreen: "32cd32",
    linen: "faf0e6",
    magenta: "f0f",
    maroon: "800000",
    mediumaquamarine: "66cdaa",
    mediumblue: "0000cd",
    mediumorchid: "ba55d3",
    mediumpurple: "9370db",
    mediumseagreen: "3cb371",
    mediumslateblue: "7b68ee",
    mediumspringgreen: "00fa9a",
    mediumturquoise: "48d1cc",
    mediumvioletred: "c71585",
    midnightblue: "191970",
    mintcream: "f5fffa",
    mistyrose: "ffe4e1",
    moccasin: "ffe4b5",
    navajowhite: "ffdead",
    navy: "000080",
    oldlace: "fdf5e6",
    olive: "808000",
    olivedrab: "6b8e23",
    orange: "ffa500",
    orangered: "ff4500",
    orchid: "da70d6",
    palegoldenrod: "eee8aa",
    palegreen: "98fb98",
    paleturquoise: "afeeee",
    palevioletred: "db7093",
    papayawhip: "ffefd5",
    peachpuff: "ffdab9",
    peru: "cd853f",
    pink: "ffc0cb",
    plum: "dda0dd",
    powderblue: "b0e0e6",
    purple: "800080",
    rebeccapurple: "663399",
    red: "f00",
    rosybrown: "bc8f8f",
    royalblue: "4169e1",
    saddlebrown: "8b4513",
    salmon: "fa8072",
    sandybrown: "f4a460",
    seagreen: "2e8b57",
    seashell: "fff5ee",
    sienna: "a0522d",
    silver: "c0c0c0",
    skyblue: "87ceeb",
    slateblue: "6a5acd",
    slategray: "708090",
    slategrey: "708090",
    snow: "fffafa",
    springgreen: "00ff7f",
    steelblue: "4682b4",
    tan: "d2b48c",
    teal: "008080",
    thistle: "d8bfd8",
    tomato: "ff6347",
    turquoise: "40e0d0",
    violet: "ee82ee",
    wheat: "f5deb3",
    white: "fff",
    whitesmoke: "f5f5f5",
    yellow: "ff0",
    yellowgreen: "9acd32"
};

// Make it easy to access colors via `hexNames[hex]`
var hexNames = tinycolor.hexNames = flip(names);


// Utilities
// ---------

// `{ 'name1': 'val1' }` becomes `{ 'val1': 'name1' }`
function flip(o) {
    var flipped = { };
    for (var i in o) {
        if (o.hasOwnProperty(i)) {
            flipped[o[i]] = i;
        }
    }
    return flipped;
}

// Return a valid alpha value [0,1] with all invalid values being set to 1
function boundAlpha(a) {
    a = parseFloat(a);

    if (isNaN(a) || a < 0 || a > 1) {
        a = 1;
    }

    return a;
}

// Take input from [0, n] and return it as [0, 1]
function bound01(n, max) {
    if (isOnePointZero(n)) { n = "100%"; }

    var processPercent = isPercentage(n);
    n = mathMin(max, mathMax(0, parseFloat(n)));

    // Automatically convert percentage into number
    if (processPercent) {
        n = parseInt(n * max, 10) / 100;
    }

    // Handle floating point rounding errors
    if ((Math.abs(n - max) < 0.000001)) {
        return 1;
    }

    // Convert into [0, 1] range if it isn't already
    return (n % max) / parseFloat(max);
}

// Force a number between 0 and 1
function clamp01(val) {
    return mathMin(1, mathMax(0, val));
}

// Parse a base-16 hex value into a base-10 integer
function parseIntFromHex(val) {
    return parseInt(val, 16);
}

// Need to handle 1.0 as 100%, since once it is a number, there is no difference between it and 1
// <http://stackoverflow.com/questions/7422072/javascript-how-to-detect-number-as-a-decimal-including-1-0>
function isOnePointZero(n) {
    return typeof n == "string" && n.indexOf('.') != -1 && parseFloat(n) === 1;
}

// Check to see if string passed in is a percentage
function isPercentage(n) {
    return typeof n === "string" && n.indexOf('%') != -1;
}

// Force a hex value to have 2 characters
function pad2(c) {
    return c.length == 1 ? '0' + c : '' + c;
}

// Replace a decimal with it's percentage value
function convertToPercentage(n) {
    if (n <= 1) {
        n = (n * 100) + "%";
    }

    return n;
}

// Converts a decimal to a hex value
function convertDecimalToHex(d) {
    return Math.round(parseFloat(d) * 255).toString(16);
}
// Converts a hex value to a decimal
function convertHexToDecimal(h) {
    return (parseIntFromHex(h) / 255);
}

var matchers = (function() {

    // <http://www.w3.org/TR/css3-values/#integers>
    var CSS_INTEGER = "[-\\+]?\\d+%?";

    // <http://www.w3.org/TR/css3-values/#number-value>
    var CSS_NUMBER = "[-\\+]?\\d*\\.\\d+%?";

    // Allow positive/negative integer/number.  Don't capture the either/or, just the entire outcome.
    var CSS_UNIT = "(?:" + CSS_NUMBER + ")|(?:" + CSS_INTEGER + ")";

    // Actual matching.
    // Parentheses and commas are optional, but not required.
    // Whitespace can take the place of commas or opening paren
    var PERMISSIVE_MATCH3 = "[\\s|\\(]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")\\s*\\)?";
    var PERMISSIVE_MATCH4 = "[\\s|\\(]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")\\s*\\)?";

    return {
        CSS_UNIT: new RegExp(CSS_UNIT),
        rgb: new RegExp("rgb" + PERMISSIVE_MATCH3),
        rgba: new RegExp("rgba" + PERMISSIVE_MATCH4),
        hsl: new RegExp("hsl" + PERMISSIVE_MATCH3),
        hsla: new RegExp("hsla" + PERMISSIVE_MATCH4),
        hsv: new RegExp("hsv" + PERMISSIVE_MATCH3),
        hsva: new RegExp("hsva" + PERMISSIVE_MATCH4),
        hex3: /^#?([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
        hex6: /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,
        hex4: /^#?([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
        hex8: /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/
    };
})();

// `isValidCSSUnit`
// Take in a single string / number and check to see if it looks like a CSS unit
// (see `matchers` above for definition).
function isValidCSSUnit(color) {
    return !!matchers.CSS_UNIT.exec(color);
}

// `stringInputToObject`
// Permissive string parsing.  Take in a number of formats, and output an object
// based on detected format.  Returns `{ r, g, b }` or `{ h, s, l }` or `{ h, s, v}`
function stringInputToObject(color) {

    color = color.replace(trimLeft,'').replace(trimRight, '').toLowerCase();
    var named = false;
    if (names[color]) {
        color = names[color];
        named = true;
    }
    else if (color == 'transparent') {
        return { r: 0, g: 0, b: 0, a: 0, format: "name" };
    }

    // Try to match string input using regular expressions.
    // Keep most of the number bounding out of this function - don't worry about [0,1] or [0,100] or [0,360]
    // Just return an object and let the conversion functions handle that.
    // This way the result will be the same whether the tinycolor is initialized with string or object.
    var match;
    if ((match = matchers.rgb.exec(color))) {
        return { r: match[1], g: match[2], b: match[3] };
    }
    if ((match = matchers.rgba.exec(color))) {
        return { r: match[1], g: match[2], b: match[3], a: match[4] };
    }
    if ((match = matchers.hsl.exec(color))) {
        return { h: match[1], s: match[2], l: match[3] };
    }
    if ((match = matchers.hsla.exec(color))) {
        return { h: match[1], s: match[2], l: match[3], a: match[4] };
    }
    if ((match = matchers.hsv.exec(color))) {
        return { h: match[1], s: match[2], v: match[3] };
    }
    if ((match = matchers.hsva.exec(color))) {
        return { h: match[1], s: match[2], v: match[3], a: match[4] };
    }
    if ((match = matchers.hex8.exec(color))) {
        return {
            r: parseIntFromHex(match[1]),
            g: parseIntFromHex(match[2]),
            b: parseIntFromHex(match[3]),
            a: convertHexToDecimal(match[4]),
            format: named ? "name" : "hex8"
        };
    }
    if ((match = matchers.hex6.exec(color))) {
        return {
            r: parseIntFromHex(match[1]),
            g: parseIntFromHex(match[2]),
            b: parseIntFromHex(match[3]),
            format: named ? "name" : "hex"
        };
    }
    if ((match = matchers.hex4.exec(color))) {
        return {
            r: parseIntFromHex(match[1] + '' + match[1]),
            g: parseIntFromHex(match[2] + '' + match[2]),
            b: parseIntFromHex(match[3] + '' + match[3]),
            a: convertHexToDecimal(match[4] + '' + match[4]),
            format: named ? "name" : "hex8"
        };
    }
    if ((match = matchers.hex3.exec(color))) {
        return {
            r: parseIntFromHex(match[1] + '' + match[1]),
            g: parseIntFromHex(match[2] + '' + match[2]),
            b: parseIntFromHex(match[3] + '' + match[3]),
            format: named ? "name" : "hex"
        };
    }

    return false;
}

function validateWCAG2Parms(parms) {
    // return valid WCAG2 parms for isReadable.
    // If input parms are invalid, return {"level":"AA", "size":"small"}
    var level, size;
    parms = parms || {"level":"AA", "size":"small"};
    level = (parms.level || "AA").toUpperCase();
    size = (parms.size || "small").toLowerCase();
    if (level !== "AA" && level !== "AAA") {
        level = "AA";
    }
    if (size !== "small" && size !== "large") {
        size = "small";
    }
    return {"level":level, "size":size};
}

// Node: Export function
if (typeof module !== "undefined" && module.exports) {
    module.exports = tinycolor;
}
// AMD/requirejs: Define the module
else if (true) {
    !(__WEBPACK_AMD_DEFINE_RESULT__ = function () {return tinycolor;}.call(exports, __webpack_require__, exports, module),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
}
// Browser: Expose to window
else {
    window.tinycolor = tinycolor;
}

})(Math);

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

var wsclient = __webpack_require__(15)
var driver = __webpack_require__(5)
var color  = __webpack_require__(2)
var binary = __webpack_require__(7)

function world() {
    this.wsc = new wsclient("ws://127.0.0.1:9000")
    this.drivers = [];
    this.p2 = new p2.World({
        gravity : [0,0]
    });

    this.p2.solver.tolerance = 5e-2
    this.p2.solver.iterations = 15
    this.p2.setGlobalStiffness(1e6)
    this.p2.setGlobalRelaxation(5)

    this.age = 0.0
    this.timer = 0

    this.chartData = {}
    this.chartEphemeralData = []
    this.chartFrequency = 60
    this.chartDataPoints = 200
    this.smoothReward = 0

    this.plotRewardOnly = false

    this.obstacles = []
};

world.prototype.addBodyFromCompressedPoints = function (outline) {
    if (outline.length % 2 !== 0) {
        throw 'Invalid outline.';
    }

    var points = []
    for (var i = 0; i < (outline.length / 2); i++) {
        var x = outline[i * 2 + 0]
        var y = outline[i * 2 + 1]
        points.push([ x, y ])
    }

    this.addBodyFromPoints(points)
};

world.prototype.addBodyFromPoints = function (points) {
    var body = new p2.Body({ mass : 0.0 });
    body.color = color.randomPastelHex()

    if(!body.fromPolygon(points.slice(0), { removeCollinearPoints: 0.1 })) {
        return 
    }

    var outline = new Float64Array(points.length * 2)
    for (var i = 0; i < points.length; i++) {
        outline[i * 2 + 0] = points[i][0]
        outline[i * 2 + 1] = points[i][1]
    }

    body.outline = outline
    this.addObstacle(body)
};

world.prototype.addObstacle = function (obstacle) {
    this.p2.addBody(obstacle)
    this.obstacles.push(obstacle)
};

world.prototype.addWall = function (start, end, width) {
    var w = 0, h = 0, pos = []
    if (start[0] === end[0]) { // hor
        h = end[1] - start[1];
        w = width
        pos = [ start[0], start[1] + 0.5 * h ]
    }
    else if (start[1] === end[1]) { // ver
        w = end[0] - start[0]
        h = width
        pos = [ start[0] + 0.5 * w, start[1] ]
    }
    else 
        throw 'error'

    // Create box
    var b = new p2.Body({
        mass : 0.0,
        position : pos
    });

    var rectangleShape = new p2.Box({ width: w, height:  h });
    // rectangleShape.color = 0xFFFFFF
    b.hidden = true;
    b.addShape(rectangleShape);
    this.p2.addBody(b);

    return b;
}

world.prototype.addPolygons = function (polys) {

    for (var i = 0; i < polys.length; i++) {
        var points = polys[i]
        var b = new p2.Body({ mass : 0.0 });
        if (b.fromPolygon(points, {
            removeCollinearPoints: 0.1,
            skipSimpleCheck: true
        })) {
             this.p2.addBody(b)
        }
    }
    
}

world.prototype.init = function (renderer) {
    window.addEventListener('resize', this.resize.bind(this, renderer), false);

    var w = renderer.viewport.width / renderer.viewport.scale
    var h = renderer.viewport.height / renderer.viewport.scale
    var wx = w / 2, hx = h / 2

    this.addWall( [ -wx - 0.25, -hx ], [ -wx - 0.25, hx ], 0.5 )
    this.addWall( [ wx + 0.25, -hx ], [ wx + 0.25, hx ], 0.5 )
    this.addWall( [ -wx, -hx - 0.25 ], [ wx, -hx - 0.25 ], 0.5 )
    this.addWall( [ -wx, hx + 0.25 ], [ wx, hx + 0.25 ], 0.5 )

    this.size = { w, h }
};

world.prototype.populate = function (n) {
    for (var i = 0; i < n; i++) {
        var ag = new driver({}, this);
        this.drivers.push(ag);
    }
};

world.prototype.resize = function (renderer) {
};

world.prototype.step = function (dt) {
    if (dt >= 0.02)  dt = 0.02;

    ++this.timer

    var loss = 0.0, reward = 0.0, driverUpdate = false
    for (var i = 0; i < this.drivers.length; i++) {
        driverUpdate = this.drivers[i].step(dt);
        loss += this.drivers[i].loss
        reward += this.drivers[i].reward
    }

    if (!this.plotting && this.plotRewardOnly && 1 === this.timer % this.chartFrequency) {
        this.plotting = true
    }

    if (this.plotting) {
        this.chartEphemeralData.push({
            loss: loss / this.drivers.length, 
            reward: reward / this.drivers.length
        })

        if (this.timer % this.chartFrequency == 0) {
            this.updateChart()
            this.chartEphemeralData = []
        }
    }
    

    this.p2.step(1 / 60, dt, 10);
    this.age += dt
};

world.prototype.updateChart = function () {
    var point = { loss: 0, reward: 0 }

    if (this.chartEphemeralData.length !== this.chartFrequency) {
        throw 'error'
    }

    for (var i = 0; i < this.chartFrequency; i++) {
        var subpoint = this.chartEphemeralData[i]
        for (var key in point) {
            point[key] += subpoint[key] / this.chartFrequency
        }
    }

    if (point.reward) {
        var f = 1e-2;
        this.smoothReward = this.smoothReward * (1.0 - f) + f * point.reward;
        point.smoothReward = this.smoothReward;
    }

    var series = []
    for (var key in point) {
        if (!(key in this.chartData)) {
            this.chartData[key] = []
        }

        this.chartData[key].push(point[key])

        if (this.chartData[key].length > this.chartDataPoints) {
            this.chartData[key] = this.chartData[key].slice(-this.chartDataPoints)
        }

        if (this.plotRewardOnly && (key !== 'reward' && key !== 'smoothReward')) {
            series.push({
                name: key,
                data: []
            })
        } 

        else {
           series.push({
                name: key,
                data: this.chartData[key]
            })
        }
    }

    this.chart.update({
        series
    })
};

world.prototype.export = function () {
    var contents = []
    contents.push({
        obstacles: this.obstacles.length
    })

    for (var i = 0; i < this.obstacles.length; i++) {
        contents.push(this.obstacles[i].outline)
    }

    var drivers = []
    for (var i = 0; i < this.drivers.length; i++) {
        drivers.push({
            location: this.drivers[i].car.chassisBody.position,
            angle: this.drivers[i].car.chassisBody.angle
        })
    }

    contents.push(drivers)

    return binary.Writer.write(contents)
};

world.prototype.clearObstacles = function () {
    for (var i = 0; i < this.obstacles.length; i++) {
        this.p2.removeBody(this.obstacles[i])
    }

    this.obstacles = []
};

world.prototype.import = function (buf) {
    this.clearObstacles()

    var contents = binary.Reader.read(buf)
    var j = -1
    var meta = contents[++j]

    for (var i = 0; i < meta.obstacles; i++) {
        this.addBodyFromCompressedPoints(contents[++j])
    }

    var drivers = contents[++j]

    if (drivers.length !== this.drivers.length) {
        throw 'error';
    }

    for (var i = 0; i < drivers.length; i++) {
        this.drivers[i].car.chassisBody.position = drivers[i].location
        this.drivers[i].car.chassisBody.angle = drivers[i].angle
    }
};

module.exports = world;

/***/ }),
/* 15 */
/***/ (function(module, exports) {


function wsclient(url) {
  this.server = url
  this.socket = null
  this.isopen = false
  this.subscribers = {}
  this.init()
}

wsclient.prototype.init = function () {
   this.socket = new WebSocket(this.server)

   this.socket.onopen = () => {
      this.isopen = true
      for (var sid in this.subscribers) {
        if (this.subscribers.hasOwnProperty(sid)) {
          this.subscribers[sid].wsopen = true
        }
      }
   }

   this.socket.onmessage = (e) => {
      console.log("received: " + e.data)
      data = JSON.parse(e.data)
      if (this.subscribers.hasOwnProperty(data.id)) {
        this.subscribers[data.id].onmessage(data)
        this.subscribers[data.id].wsopen = true
      } else {
        console.log("Data received for unidentified subscriber. Dropping that connection...")
        this.send({id:data.id,message:'disconnect'})
      }
   }

   this.socket.onclose = (e) => {
      this.socket = null
      this.isopen = false
      setTimeout(()=>{this.init()},5000)
   }
}

wsclient.prototype.subscribe = function (id,subscriber) {
  this.subscribers[id] = subscriber
  subscriber.wsopen = true
}

wsclient.prototype.send = function (subscriber,payload) {
  if (this.isopen && subscriber.wsopen) {
    this.socket.send(JSON.stringify(payload))
    subscriber.wsopen = false
    console.log("Data sent: " + JSON.stringify(payload))
  }
  return (this.isopen && subscriber.wsopen)
}

module.exports = wsclient;

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/*\
|*|
|*|	:: Number.isInteger() polyfill ::
|*|
|*|	https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isInteger
|*|
\*/

if (!Number.isInteger) {
	Number.isInteger = function isInteger (nVal) {
		return typeof nVal === "number" && isFinite(nVal) && nVal > -9007199254740992 && nVal < 9007199254740992 && Math.floor(nVal) === nVal;
	};
}

/*\
|*|
|*|	StringView - Mozilla Developer Network
|*|
|*|	Revision #9, October 30, 2016
|*|
|*|	https://developer.mozilla.org/en-US/Add-ons/Code_snippets/StringView
|*|	https://developer.mozilla.org/en-US/docs/User:fusionchess
|*|	https://github.com/madmurphy/stringview.js
|*|
|*|	This framework is released under the GNU Lesser General Public License, version 3 or later.
|*|	http://www.gnu.org/licenses/lgpl-3.0.html
|*|
\*/

function StringView (vInput, sEncoding /* optional (default: UTF-8) */, nOffset /* optional */, nLength /* optional */) {

	var fTAView, aWhole, aRaw, fPutOutptCode, fGetOutptChrSize, nInptLen, nStartIdx = isFinite(nOffset) ? nOffset : 0, nTranscrType = 15;

	if (sEncoding) { this.encoding = sEncoding.toString(); }

	encSwitch: switch (this.encoding) {
		case "UTF-8":
			fPutOutptCode = StringView.putUTF8CharCode;
			fGetOutptChrSize = StringView.getUTF8CharLength;
			fTAView = Uint8Array;
			break encSwitch;
		case "UTF-16":
			fPutOutptCode = StringView.putUTF16CharCode;
			fGetOutptChrSize = StringView.getUTF16CharLength;
			fTAView = Uint16Array;
			break encSwitch;
		case "UTF-32":
			fTAView = Uint32Array;
			nTranscrType &= 14;
			break encSwitch;
		default:
			/* case "ASCII", or case "BinaryString" or unknown cases */
			fTAView = Uint8Array;
			nTranscrType &= 14;
	}

	typeSwitch: switch (typeof vInput) {
		case "string":
			/* the input argument is a primitive string: a new buffer will be created. */
			nTranscrType &= 7;
			break typeSwitch;
		case "object":
			classSwitch: switch (vInput.constructor) {
				case StringView:
					/* the input argument is a stringView: a new buffer will be created. */
					nTranscrType &= 3;
					break typeSwitch;
				case String:
					/* the input argument is an objectified string: a new buffer will be created. */
					nTranscrType &= 7;
					break typeSwitch;
				case ArrayBuffer:
					/* the input argument is an arrayBuffer: the buffer will be shared. */
					aWhole = new fTAView(vInput);
					nInptLen = this.encoding === "UTF-32" ?
							vInput.byteLength >>> 2
						: this.encoding === "UTF-16" ?
							vInput.byteLength >>> 1
						:
							vInput.byteLength;
					aRaw = nStartIdx === 0 && (!isFinite(nLength) || nLength === nInptLen) ?
						aWhole
						: new fTAView(vInput, nStartIdx, !isFinite(nLength) ? nInptLen - nStartIdx : nLength);

					break typeSwitch;
				case Uint32Array:
				case Uint16Array:
				case Uint8Array:
					/* the input argument is a typedArray: the buffer, and possibly the array itself, will be shared. */
					fTAView = vInput.constructor;
					nInptLen = vInput.length;
					aWhole = vInput.byteOffset === 0 && vInput.length === (
						fTAView === Uint32Array ?
							vInput.buffer.byteLength >>> 2
						: fTAView === Uint16Array ?
							vInput.buffer.byteLength >>> 1
						:
							vInput.buffer.byteLength
					) ? vInput : new fTAView(vInput.buffer);
					aRaw = nStartIdx === 0 && (!isFinite(nLength) || nLength === nInptLen) ?
						vInput
						: vInput.subarray(nStartIdx, isFinite(nLength) ? nStartIdx + nLength : nInptLen);

					break typeSwitch;
				default:
					/* the input argument is an array or another serializable object: a new typedArray will be created. */
					aWhole = new fTAView(vInput);
					nInptLen = aWhole.length;
					aRaw = nStartIdx === 0 && (!isFinite(nLength) || nLength === nInptLen) ?
						aWhole
						: aWhole.subarray(nStartIdx, isFinite(nLength) ? nStartIdx + nLength : nInptLen);
			}
			break typeSwitch;
		default:
			/* the input argument is a number, a boolean or a function: a new typedArray will be created. */
			aWhole = aRaw = new fTAView(Number(vInput) || 0);

	}

	if (nTranscrType < 8) {

		var vSource, nOutptLen, nCharStart, nCharEnd, nEndIdx, fGetInptChrSize, fGetInptChrCode;

		if (nTranscrType & 4) { /* input is string */

			vSource = vInput;
			nOutptLen = nInptLen = vSource.length;
			nTranscrType ^= this.encoding === "UTF-32" ? 0 : 2;
			/* ...or...: nTranscrType ^= Number(this.encoding !== "UTF-32") << 1; */
			nStartIdx = nCharStart = nOffset ? Math.max((nOutptLen + nOffset) % nOutptLen, 0) : 0;
			nEndIdx = nCharEnd = (Number.isInteger(nLength) ? Math.min(Math.max(nLength, 0) + nStartIdx, nOutptLen) : nOutptLen) - 1;

		} else { /* input is stringView */

			vSource = vInput.rawData;
			nInptLen = vInput.makeIndex();
			nStartIdx = nCharStart = nOffset ? Math.max((nInptLen + nOffset) % nInptLen, 0) : 0;
			nOutptLen = Number.isInteger(nLength) ? Math.min(Math.max(nLength, 0), nInptLen - nCharStart) : nInptLen;
			nEndIdx = nCharEnd = nOutptLen + nCharStart;

			if (vInput.encoding === "UTF-8") {
				fGetInptChrSize = StringView.getUTF8CharLength;
				fGetInptChrCode = StringView.loadUTF8CharCode;
			} else if (vInput.encoding === "UTF-16") {
				fGetInptChrSize = StringView.getUTF16CharLength;
				fGetInptChrCode = StringView.loadUTF16CharCode;
			} else {
				nTranscrType &= 1;
			}

		}

		if (nOutptLen === 0 || nTranscrType < 4 && vSource.encoding === this.encoding && nCharStart === 0 && nOutptLen === nInptLen) {

			/* the encoding is the same, the length too and the offset is 0... or the input is empty! */

			nTranscrType = 7;

		}

		conversionSwitch: switch (nTranscrType) {

			case 0:

			/* both the source and the new StringView have a fixed-length encoding... */

				aWhole = new fTAView(nOutptLen);
				for (var nOutptIdx = 0; nOutptIdx < nOutptLen; aWhole[nOutptIdx] = vSource[nStartIdx + nOutptIdx++]);
				break conversionSwitch;

			case 1:

			/* the source has a fixed-length encoding but the new StringView has a variable-length encoding... */

				/* mapping... */

				nOutptLen = 0;

				for (var nInptIdx = nStartIdx; nInptIdx < nEndIdx; nInptIdx++) {
					nOutptLen += fGetOutptChrSize(vSource[nInptIdx]);
				}

				aWhole = new fTAView(nOutptLen);

				/* transcription of the source... */

				for (var nInptIdx = nStartIdx, nOutptIdx = 0; nOutptIdx < nOutptLen; nInptIdx++) {
					nOutptIdx = fPutOutptCode(aWhole, vSource[nInptIdx], nOutptIdx);
				}

				break conversionSwitch;

			case 2:

			/* the source has a variable-length encoding but the new StringView has a fixed-length encoding... */

				/* mapping... */

				nStartIdx = 0;

				var nChrCode;

				for (nChrIdx = 0; nChrIdx < nCharStart; nChrIdx++) {
					nChrCode = fGetInptChrCode(vSource, nStartIdx);
					nStartIdx += fGetInptChrSize(nChrCode);
				}

				aWhole = new fTAView(nOutptLen);

				/* transcription of the source... */

				for (var nInptIdx = nStartIdx, nOutptIdx = 0; nOutptIdx < nOutptLen; nInptIdx += fGetInptChrSize(nChrCode), nOutptIdx++) {
					nChrCode = fGetInptChrCode(vSource, nInptIdx);
					aWhole[nOutptIdx] = nChrCode;
				}

				break conversionSwitch;

			case 3:

			/* both the source and the new StringView have a variable-length encoding... */

				/* mapping... */

				nOutptLen = 0;

				var nChrCode;

				for (var nChrIdx = 0, nInptIdx = 0; nChrIdx < nCharEnd; nInptIdx += fGetInptChrSize(nChrCode)) {
					nChrCode = fGetInptChrCode(vSource, nInptIdx);
					if (nChrIdx === nCharStart) { nStartIdx = nInptIdx; }
					if (++nChrIdx > nCharStart) { nOutptLen += fGetOutptChrSize(nChrCode); }
				}

				aWhole = new fTAView(nOutptLen);

				/* transcription... */

				for (var nInptIdx = nStartIdx, nOutptIdx = 0; nOutptIdx < nOutptLen; nInptIdx += fGetInptChrSize(nChrCode)) {
					nChrCode = fGetInptChrCode(vSource, nInptIdx);
					nOutptIdx = fPutOutptCode(aWhole, nChrCode, nOutptIdx);
				}

				break conversionSwitch;

			case 4:

			/* DOMString to ASCII or BinaryString or other unknown encodings */

				aWhole = new fTAView(nOutptLen);

				/* transcription... */

				for (var nIdx = 0; nIdx < nOutptLen; nIdx++) {
					aWhole[nIdx] = vSource.charCodeAt(nIdx) & 0xff;
				}

				break conversionSwitch;

			case 5:

			/* DOMString to UTF-8 or to UTF-16 */

				/* mapping... */

				nOutptLen = 0;

				for (var nMapIdx = 0; nMapIdx < nInptLen; nMapIdx++) {
					if (nMapIdx === nCharStart) { nStartIdx = nOutptLen; }
					nOutptLen += fGetOutptChrSize(vSource.charCodeAt(nMapIdx));
					if (nMapIdx === nCharEnd) { nEndIdx = nOutptLen; }
				}

				aWhole = new fTAView(nOutptLen);

				/* transcription... */

				for (var nOutptIdx = 0, nChrIdx = 0; nOutptIdx < nOutptLen; nChrIdx++) {
					nOutptIdx = fPutOutptCode(aWhole, vSource.charCodeAt(nChrIdx), nOutptIdx);
				}

				break conversionSwitch;

			case 6:

			/* DOMString to UTF-32 */

				aWhole = new fTAView(nOutptLen);

				/* transcription... */

				for (var nIdx = 0; nIdx < nOutptLen; nIdx++) {
					aWhole[nIdx] = vSource.charCodeAt(nIdx);
				}

				break conversionSwitch;

			case 7:

				aWhole = new fTAView(nOutptLen ? vSource : 0);
				break conversionSwitch;

		}

		aRaw = nTranscrType > 3 && (nStartIdx > 0 || nEndIdx < aWhole.length - 1) ? aWhole.subarray(nStartIdx, nEndIdx) : aWhole;

	}

	this.buffer = aWhole.buffer;
	this.bufferView = aWhole;
	this.rawData = aRaw;

	Object.freeze(this);

}

/* CONSTRUCTOR'S METHODS */

StringView.loadUTF8CharCode = function (aChars, nIdx) {

	var nLen = aChars.length, nPart = aChars[nIdx];

	return nPart > 251 && nPart < 254 && nIdx + 5 < nLen ?
			/* (nPart - 252 << 30) may be not safe in ECMAScript! So...: */
			/* six bytes */ (nPart - 252) * 1073741824 + (aChars[nIdx + 1] - 128 << 24) + (aChars[nIdx + 2] - 128 << 18) + (aChars[nIdx + 3] - 128 << 12) + (aChars[nIdx + 4] - 128 << 6) + aChars[nIdx + 5] - 128
		: nPart > 247 && nPart < 252 && nIdx + 4 < nLen ?
			/* five bytes */ (nPart - 248 << 24) + (aChars[nIdx + 1] - 128 << 18) + (aChars[nIdx + 2] - 128 << 12) + (aChars[nIdx + 3] - 128 << 6) + aChars[nIdx + 4] - 128
		: nPart > 239 && nPart < 248 && nIdx + 3 < nLen ?
			/* four bytes */(nPart - 240 << 18) + (aChars[nIdx + 1] - 128 << 12) + (aChars[nIdx + 2] - 128 << 6) + aChars[nIdx + 3] - 128
		: nPart > 223 && nPart < 240 && nIdx + 2 < nLen ?
			/* three bytes */ (nPart - 224 << 12) + (aChars[nIdx + 1] - 128 << 6) + aChars[nIdx + 2] - 128
		: nPart > 191 && nPart < 224 && nIdx + 1 < nLen ?
			/* two bytes */ (nPart - 192 << 6) + aChars[nIdx + 1] - 128
		:
			/* one byte */ nPart;

};

StringView.putUTF8CharCode = function (aTarget, nChar, nPutAt) {

	var nIdx = nPutAt;

	if (nChar < 0x80 /* 128 */) {
		/* one byte */
		aTarget[nIdx++] = nChar;
	} else if (nChar < 0x800 /* 2048 */) {
		/* two bytes */
		aTarget[nIdx++] = 0xc0 /* 192 */ + (nChar >>> 6);
		aTarget[nIdx++] = 0x80 /* 128 */ + (nChar & 0x3f /* 63 */);
	} else if (nChar < 0x10000 /* 65536 */) {
		/* three bytes */
		aTarget[nIdx++] = 0xe0 /* 224 */ + (nChar >>> 12);
		aTarget[nIdx++] = 0x80 /* 128 */ + ((nChar >>> 6) & 0x3f /* 63 */);
		aTarget[nIdx++] = 0x80 /* 128 */ + (nChar & 0x3f /* 63 */);
	} else if (nChar < 0x200000 /* 2097152 */) {
		/* four bytes */
		aTarget[nIdx++] = 0xf0 /* 240 */ + (nChar >>> 18);
		aTarget[nIdx++] = 0x80 /* 128 */ + ((nChar >>> 12) & 0x3f /* 63 */);
		aTarget[nIdx++] = 0x80 /* 128 */ + ((nChar >>> 6) & 0x3f /* 63 */);
		aTarget[nIdx++] = 0x80 /* 128 */ + (nChar & 0x3f /* 63 */);
	} else if (nChar < 0x4000000 /* 67108864 */) {
		/* five bytes */
		aTarget[nIdx++] = 0xf8 /* 248 */ + (nChar >>> 24);
		aTarget[nIdx++] = 0x80 /* 128 */ + ((nChar >>> 18) & 0x3f /* 63 */);
		aTarget[nIdx++] = 0x80 /* 128 */ + ((nChar >>> 12) & 0x3f /* 63 */);
		aTarget[nIdx++] = 0x80 /* 128 */ + ((nChar >>> 6) & 0x3f /* 63 */);
		aTarget[nIdx++] = 0x80 /* 128 */ + (nChar & 0x3f /* 63 */);
	} else /* if (nChar <= 0x7fffffff) */ { /* 2147483647 */
		/* six bytes */
		aTarget[nIdx++] = 0xfc /* 252 */ + /* (nChar >>> 30) may be not safe in ECMAScript! So...: */ (nChar / 1073741824);
		aTarget[nIdx++] = 0x80 /* 128 */ + ((nChar >>> 24) & 0x3f /* 63 */);
		aTarget[nIdx++] = 0x80 /* 128 */ + ((nChar >>> 18) & 0x3f /* 63 */);
		aTarget[nIdx++] = 0x80 /* 128 */ + ((nChar >>> 12) & 0x3f /* 63 */);
		aTarget[nIdx++] = 0x80 /* 128 */ + ((nChar >>> 6) & 0x3f /* 63 */);
		aTarget[nIdx++] = 0x80 /* 128 */ + (nChar & 0x3f /* 63 */);
	}

	return nIdx;

};

StringView.getUTF8CharLength = function (nChar) {
	return nChar < 0x80 ? 1 : nChar < 0x800 ? 2 : nChar < 0x10000 ? 3 : nChar < 0x200000 ? 4 : nChar < 0x4000000 ? 5 : 6;
};

StringView.loadUTF16CharCode = function (aChars, nIdx) {

	/* UTF-16 to DOMString decoding algorithm */
	var nFrstChr = aChars[nIdx];

	return nFrstChr > 0xD7BF /* 55231 */ && nIdx + 1 < aChars.length ?
		(nFrstChr - 0xD800 /* 55296 */ << 10) + aChars[nIdx + 1] + 0x2400 /* 9216 */
		: nFrstChr;

};

StringView.putUTF16CharCode = function (aTarget, nChar, nPutAt) {

	var nIdx = nPutAt;

	if (nChar < 0x10000 /* 65536 */) {
		/* one element */
		aTarget[nIdx++] = nChar;
	} else {
		/* two elements */
		aTarget[nIdx++] = 0xD7C0 /* 55232 */ + (nChar >>> 10);
		aTarget[nIdx++] = 0xDC00 /* 56320 */ + (nChar & 0x3FF /* 1023 */);
	}

	return nIdx;

};

StringView.getUTF16CharLength = function (nChar) {
	return nChar < 0x10000 ? 1 : 2;
};

/* Array of bytes to base64 string decoding */

StringView.b64ToUint6 = function (nChr) {

	return nChr > 64 && nChr < 91 ?
			nChr - 65
		: nChr > 96 && nChr < 123 ?
			nChr - 71
		: nChr > 47 && nChr < 58 ?
			nChr + 4
		: nChr === 43 ?
			62
		: nChr === 47 ?
			63
		:
			0;

};

StringView.uint6ToB64 = function (nUint6) {

	return nUint6 < 26 ?
			nUint6 + 65
		: nUint6 < 52 ?
			nUint6 + 71
		: nUint6 < 62 ?
			nUint6 - 4
		: nUint6 === 62 ?
			43
		: nUint6 === 63 ?
			47
		:
			65;

};

/* Base64 string to array encoding */

StringView.bytesToBase64 = function (aBytes) {

	var eqLen = (3 - (aBytes.length % 3)) % 3, sB64Enc = "";

	for (var nMod3, nLen = aBytes.length, nUint24 = 0, nIdx = 0; nIdx < nLen; nIdx++) {
		nMod3 = nIdx % 3;
		/* Uncomment the following line in order to split the output in lines 76-character long: */
		/*
		if (nIdx > 0 && (nIdx * 4 / 3) % 76 === 0) { sB64Enc += "\r\n"; }
		*/
		nUint24 |= aBytes[nIdx] << (16 >>> nMod3 & 24);
		if (nMod3 === 2 || aBytes.length - nIdx === 1) {
			sB64Enc += String.fromCharCode(StringView.uint6ToB64(nUint24 >>> 18 & 63), StringView.uint6ToB64(nUint24 >>> 12 & 63), StringView.uint6ToB64(nUint24 >>> 6 & 63), StringView.uint6ToB64(nUint24 & 63));
			nUint24 = 0;
		}
	}

	return	eqLen === 0 ?
			sB64Enc
		:
			sB64Enc.substring(0, sB64Enc.length - eqLen) + (eqLen === 1 ? "=" : "==");


};


StringView.base64ToBytes = function (sBase64, nBlockBytes) {

	var
		sB64Enc = sBase64.replace(/[^A-Za-z0-9\+\/]/g, ""), nInLen = sB64Enc.length,
		nOutLen = nBlockBytes ? Math.ceil((nInLen * 3 + 1 >>> 2) / nBlockBytes) * nBlockBytes : nInLen * 3 + 1 >>> 2, aBytes = new Uint8Array(nOutLen);

	for (var nMod3, nMod4, nUint24 = 0, nOutIdx = 0, nInIdx = 0; nInIdx < nInLen; nInIdx++) {
		nMod4 = nInIdx & 3;
		nUint24 |= StringView.b64ToUint6(sB64Enc.charCodeAt(nInIdx)) << 18 - 6 * nMod4;
		if (nMod4 === 3 || nInLen - nInIdx === 1) {
			for (nMod3 = 0; nMod3 < 3 && nOutIdx < nOutLen; nMod3++, nOutIdx++) {
				aBytes[nOutIdx] = nUint24 >>> (16 >>> nMod3 & 24) & 255;
			}
			nUint24 = 0;
		}
	}

	return aBytes;

};

StringView.makeFromBase64 = function (sB64Inpt, sEncoding, nByteOffset, nLength) {

	return new StringView(sEncoding === "UTF-16" || sEncoding === "UTF-32" ? StringView.base64ToBytes(sB64Inpt, sEncoding === "UTF-16" ? 2 : 4).buffer : StringView.base64ToBytes(sB64Inpt), sEncoding, nByteOffset, nLength);

};

/* DEFAULT VALUES */

StringView.prototype.encoding = "UTF-8"; /* Default encoding... */

/* INSTANCES' METHODS */

StringView.prototype.makeIndex = function (nChrLength, nStartFrom) {

	var

		aTarget = this.rawData, nChrEnd, nRawLength = aTarget.length,
		nStartIdx = nStartFrom || 0, nIdxEnd = nStartIdx, nStopAtChr = isNaN(nChrLength) ? Infinity : nChrLength;

	if (nChrLength + 1 > aTarget.length) { throw new RangeError("StringView.prototype.makeIndex - The offset can\'t be major than the length of the array - 1."); }

	switch (this.encoding) {

		case "UTF-8":

			var nPart;

			for (nChrEnd = 0; nIdxEnd < nRawLength && nChrEnd < nStopAtChr; nChrEnd++) {
				nPart = aTarget[nIdxEnd];
				nIdxEnd += nPart > 251 && nPart < 254 && nIdxEnd + 5 < nRawLength ? 6
					: nPart > 247 && nPart < 252 && nIdxEnd + 4 < nRawLength ? 5
					: nPart > 239 && nPart < 248 && nIdxEnd + 3 < nRawLength ? 4
					: nPart > 223 && nPart < 240 && nIdxEnd + 2 < nRawLength ? 3
					: nPart > 191 && nPart < 224 && nIdxEnd + 1 < nRawLength ? 2
					: 1;
			}

			break;

		case "UTF-16":

			for (nChrEnd = nStartIdx; nIdxEnd < nRawLength && nChrEnd < nStopAtChr; nChrEnd++) {
				nIdxEnd += aTarget[nIdxEnd] > 0xD7BF /* 55231 */ && nIdxEnd + 1 < aTarget.length ? 2 : 1;
			}

			break;

		default:

			nIdxEnd = nChrEnd = isFinite(nChrLength) ? nChrLength : nRawLength - 1;

	}

	if (nChrLength) { return nIdxEnd; }

	return nChrEnd;

};

StringView.prototype.toBase64 = function (bWholeBuffer) {

	return StringView.bytesToBase64(
		bWholeBuffer ?
			(
				this.bufferView.constructor === Uint8Array ?
					this.bufferView
				:
					new Uint8Array(this.buffer)
			)
		: this.rawData.constructor === Uint8Array ?
			this.rawData
		:
			new Uint8Array(this.buffer, this.rawData.byteOffset, this.rawData.length << (this.rawData.constructor === Uint16Array ? 1 : 2))
		);

};

StringView.prototype.subview = function (nCharOffset /* optional */, nCharLength /* optional */) {

	var

		nChrLen, nCharStart, nStrLen, bVariableLen = this.encoding === "UTF-8" || this.encoding === "UTF-16",
		nStartOffset = nCharOffset, nStringLength, nRawLen = this.rawData.length;

	if (nRawLen === 0) {
		return new StringView(this.buffer, this.encoding);
	}

	nStringLength = bVariableLen ? this.makeIndex() : nRawLen;
	nCharStart = nCharOffset ? Math.max((nStringLength + nCharOffset) % nStringLength, 0) : 0;
	nStrLen = Number.isInteger(nCharLength) ? Math.max(nCharLength, 0) + nCharStart > nStringLength ? nStringLength - nCharStart : nCharLength : nStringLength;

	if (nCharStart === 0 && nStrLen === nStringLength) { return this; }

	if (bVariableLen) {
		nStartOffset = this.makeIndex(nCharStart);
		nChrLen = this.makeIndex(nStrLen, nStartOffset) - nStartOffset;
	} else {
		nStartOffset = nCharStart;
		nChrLen = nStrLen - nCharStart;
	}

	if (this.encoding === "UTF-16") {
		nStartOffset <<= 1;
	} else if (this.encoding === "UTF-32") {
		nStartOffset <<= 2;
	}

	return new StringView(this.buffer, this.encoding, nStartOffset, nChrLen);

};

StringView.prototype.forEachChar = function (fCallback, oThat, nChrOffset, nChrLen) {

	var aSource = this.rawData, nRawEnd, nRawIdx;

	if (this.encoding === "UTF-8" || this.encoding === "UTF-16") {

		var fGetInptChrSize, fGetInptChrCode;

		if (this.encoding === "UTF-8") {
			fGetInptChrSize = StringView.getUTF8CharLength;
			fGetInptChrCode = StringView.loadUTF8CharCode;
		} else if (this.encoding === "UTF-16") {
			fGetInptChrSize = StringView.getUTF16CharLength;
			fGetInptChrCode = StringView.loadUTF16CharCode;
		}

		nRawIdx = isFinite(nChrOffset) ? this.makeIndex(nChrOffset) : 0;
		nRawEnd = isFinite(nChrLen) ? this.makeIndex(nChrLen, nRawIdx) : aSource.length;

		for (var nChrCode, nChrIdx = 0; nRawIdx < nRawEnd; nChrIdx++) {
			nChrCode = fGetInptChrCode(aSource, nRawIdx);
			fCallback.call(oThat || null, nChrCode, nChrIdx, nRawIdx, aSource);
			nRawIdx += fGetInptChrSize(nChrCode);
		}

	} else {

		nRawIdx = isFinite(nChrOffset) ? nChrOffset : 0;
		nRawEnd = isFinite(nChrLen) ? nChrLen + nRawIdx : aSource.length;

		for (nRawIdx; nRawIdx < nRawEnd; nRawIdx++) {
			fCallback.call(oThat || null, aSource[nRawIdx], nRawIdx, nRawIdx, aSource);
		}

	}

};

StringView.prototype.valueOf = StringView.prototype.toString = function () {

	if (this.encoding !== "UTF-8" && this.encoding !== "UTF-16") {
		/* ASCII, UTF-32 or BinaryString to DOMString */
		return String.fromCharCode.apply(null, this.rawData);
	}

	var fGetCode, fGetIncr, sView = "";

	if (this.encoding === "UTF-8") {
		fGetIncr = StringView.getUTF8CharLength;
		fGetCode = StringView.loadUTF8CharCode;
	} else if (this.encoding === "UTF-16") {
		fGetIncr = StringView.getUTF16CharLength;
		fGetCode = StringView.loadUTF16CharCode;
	}

	for (var nChr, nLen = this.rawData.length, nIdx = 0; nIdx < nLen; nIdx += fGetIncr(nChr)) {
		nChr = fGetCode(this.rawData, nIdx);
		sView += String.fromCharCode(nChr);
	}

	return sView;

};

module.exports = StringView;

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

var app = __webpack_require__(8);
var car = __webpack_require__(1);

function createLossChart() {
    var data = {
        series: [[], []]
    };

    return new Chartist.Line('.ct-chart', data, {
        lineSmooth: Chartist.Interpolation.none()
    });
}

function boot() {
    this.world = new app.world();
    this.renderer = new app.renderer(this.world, document.getElementById("container"));

    this.world.init(this.renderer)
    this.world.populate(4)

    this.dispatcher = new app.dispatcher(this.renderer, this.world);
    this.dispatcher.begin();

    this.world.chart = createLossChart();

    return this.dispatcher;
};

function saveAs(dv, name) {
    var a;
    if (typeof window.downloadAnchor == 'undefined') {
        a = window.downloadAnchor = document.createElement("a");
        a.style = "display: none";
        document.body.appendChild(a);
    } else {
        a = window.downloadAnchor
    }

    var blob = new Blob([dv], { type: 'application/octet-binary' }),
        tmpURL = window.URL.createObjectURL(blob);

    a.href = tmpURL;
    a.download = name;
    a.click();

    window.URL.revokeObjectURL(tmpURL);
    a.href = "";
}

function saveEnv() {
    saveAs(new DataView(window.gcd.world.export()), 'world.bin')
}

function readWorld(e) {
    var input = event.target;

    var reader = new FileReader();
    reader.onload = function(){
        var buffer = reader.result
        window.gcd.world.import(buffer)
    };

    reader.readAsArrayBuffer(input.files[0]);
}

window.infopanel = {
    age: document.getElementById('driver-age')
}

function stats() {
    var driver = window.gcd.world.drivers[0];
    window.infopanel.age.innerText = Math.floor(window.gcd.world.age) + '';
}

window.gcd = boot();
window.saveEnv = saveEnv
window.readWorld = readWorld
window.updateIfLearning = function (value) {
    for (var i = 0; i <  window.gcd.world.drivers.length; i++) {
        window.gcd.world.drivers[i].brain.learning = value
    }

    window.gcd.world.plotRewardOnly = !value
};

setInterval(stats, 100);

/***/ })
/******/ ]);