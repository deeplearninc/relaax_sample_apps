var car = require('./car.js');
var log = require('../lib/logging.js')
var agent_proxy = require('../lib/client.js')

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