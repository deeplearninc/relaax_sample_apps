var app = require('./src/index.js');
var car = require('./src/car.js');

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