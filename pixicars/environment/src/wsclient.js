
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