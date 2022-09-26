
var devicesList = [];
var socketToServer = null;
const connectionUrl = "https://192.168.11.104:7789";

function start() {

    const startLayer = document.getElementById("startLayer");
    startLayer.style.display = "none";

    const processLayer = document.getElementById("processLayer");
    processLayer.style.display = "flex";

    getNewDevices();
}
function cancelProcessing() {

    const startLayer = document.getElementById("startLayer");
    startLayer.style.display = "flex";

    const processLayer = document.getElementById("processLayer");
    processLayer.style.display = "none";
}
function cleanDevicesList() {

    const devices = document.getElementById("devices")
    devices.innerHTML = "";

}
function listDevices(json) {
    cleanDevicesList();

    const devices = document.getElementById("devices");

    const list = JSON.parse(json);

    list.forEach(element => {
        const div = document.createElement("div");
        div.innerText = `${element.name} - ${element.address}`;
        div.rel = element.address;
        div.className = "row";

        div.addEventListener("click", () => {

            connect(element.address);

        })
        devices.appendChild(div);
    });

}

function getNewDevices() {

    Android.findDevices();
}
function setProcessingMessage(msg) {

    const processMessage = document.getElementById("processMessage");
    processMessage.innerText = msg;

}

function deviceFound(device) {
    console.log("deviceFound" + device);


    const obj = JSON.parse(device);

    if (device.name.indexOf("SMI2000-BT-") >= 0) {


        devicesList.push(obj);

        setProcessingMessage(`${devicesList.length} máquinas encontradas.`);

    }

}

function connect(device) {
    Android.connect(device);
}

function sendMessage() {
    Android.sendMessage(document.getElementById("message").value);
}

function onAndroidError(errorJson) {
    document.getElementById("content").innerHTML = errorJson + "<br><br>" + document.getElementById("content").innerHTML;
}

function onAndroidConnected() {
    document.getElementById("content").innerHTML = "CONNECTED!!!!<br><br>" + document.getElementById("content").innerHTML;
}

function onAndroidMessageReceived(message) {
    document.getElementById("content").innerHTML = message + "<br><br>" + document.getElementById("content").innerHTML;
}



// Log Console
function addZero(x, n) {
    while (x.toString().length < n) {
        x = "0" + x;
    }
    return x;
}

var logger = document.getElementById("loggerPre");
if (typeof console != "undefined")
    if (typeof console.log != 'undefined')
        console.olog = console.log;
    else
        console.olog = function () { };

console.log = function (message) {
    console.olog(message);
    var d = new Date();
    var x = document.getElementById("demo");
    var h = addZero(d.getHours(), 2);
    var m = addZero(d.getMinutes(), 2);
    var s = addZero(d.getSeconds(), 2);
    var ms = addZero(d.getMilliseconds(), 3);

    loggerPre.innerHTML = "[" + h + ":" + m + ":" + s + ":" + ms + "] " + message + "\n" + loggerPre.innerHTML;

};

console.error = console.debug = console.info = console.log;


window.addEventListener("load", () => {

    const startButton = document.getElementById("startButton");

    startButton.addEventListener("click", start);

    const cancelButton = document.getElementById("cancelButton");

    cancelButton.addEventListener("click", cancelProcessing);

    const loggerButton = document.getElementById("loggerButton");

    loggerButton.addEventListener("click", showLogger);

    const loggerCloseButton = document.getElementById("loggerCloseButton");

    loggerCloseButton.addEventListener("click", closeLogger);


});

function showLogger() {

    const logger = document.getElementById("logger");
    logger.style.display = "flex";

}

function closeLogger() {

    const logger = document.getElementById("logger");
    logger.style.display = "none";

}


function initServerConnection() {
    var socket = io.connect(connectionUrl);
    socketToServer = socket;

    socket.on("connect", function () {
        console.log("Connected to server");


    });


    socket.on("onUnregisterClient", function (id) {

        if (id == clientId) {

            showDisconnectionView();
        }

    });




    // LISTEN: DISCONNECT
    socket.on("disconnect", function () {
        console.log("Disconnected from server");
        showDisconnectionView();
    });



    // LISTEN: MONEY TO CLOUD
    socket.on(
        "onRequestTransferMoneyToCloudBankFrom",
        function (state, result, transactionId) {
            console.info(
                "onRequestTransferMoneyToCloudBankFrom",
                state,
                result,
                transactionId
            );
            if (!state) {
                console.info("No ClientId");
            }
            if (!result) {
                console.info("result false");
                $("#depositViewLoader").addClass("d-none");
                $("#depositError").removeClass("d-none");
            }
            if (state && result) {
                console.info("result true");


                refreshCurrentAmount();
                $("#mainViewAmountSpinner")
                    .addClass("text-secondary")
                    .removeClass("text-light");
                showView("mainView");


            }
        }
    );


}