// ideas to upgrade app:
// getting batch data from sensors, example: https://dev.fitbit.com/build/guides/sensors/accelerometer/

import document from "document";
import { HeartRateSensor } from "heart-rate";
import { Accelerometer } from "accelerometer";
import { outbox } from "file-transfer"
import { me } from "appbit";
import clock from "clock";
import * as fs from "fs";

const timeZone = 1;
const FILE_PATH = "/private/data/";
const RECORD_ICON_PATH = "icons/icon-record.png";
const STOP_RECORD_ICON_PATH = "icons/icon-stop-record.png";
const RECORD_BTN_VALUE = "Record";
const STOP_RECORD_BTN_VALUE = "Stop";
let fileName;
let resultString = "";
let refreshIntervalId;

// sampling at 1Hz (once per second)
const hrm = new HeartRateSensor({ frequency: 1 });
const accel = new Accelerometer({ frequency: 1 });


// app does not time out after period of inactivity
me.appTimeoutEnabled = false;

// data on screen
let timeLabel = document.getElementById("timeLabel");
let errorLabel = document.getElementById("errorLabel");
// manage button listener
let recordButton = document.getElementById("btn-record");

recordButton.onactivate = function(evt) {
  if (recordButton.text == RECORD_BTN_VALUE) {
    recordButton.text = STOP_RECORD_BTN_VALUE;
    recordButton.image = STOP_RECORD_ICON_PATH
    startSensors();
    refreshIntervalId = setInterval(recordData, 1000);
  } else {
    recordButton.text = RECORD_BTN_VALUE;
    recordButton.image = RECORD_ICON_PATH
    stopSensors();
    clearInterval(refreshIntervalId);
  }
}

const updateClock = (h, m, s) => {
  h = addTimeZone(h);
  s = Math.floor(s).toString();
  s = (s < 10) ? "0" + s : s;
  timeLabel.text = h + ":" + m + ":" + s;
}

const startSensors = () => {
  hrm.start();
  accel.start();
}

const stopSensors = () => {
  hrm.stop();
  accel.stop();
}

const sendFile = (payload) => {
  fileName = FILE_PATH + makeFileName();
  fs.writeFileSync(fileName, payload, "ascii");
  outbox
    .enqueueFile(fileName)
    .then(ft => {
      console.log(`Transfer of ${ft.name} successfully queued.`);
      fs.unlinkSync(fileName);
    })
    .catch(err => {
      errorLabel.text = "FILE SEND ERROR";
      console.log(`Failed to schedule transfer: ${err}`);
      fs.unlinkSync(fileName);
    })
}

const makeFileName = () => {
  let date = new Date(new Date().getTime() - 5 * 60000 + timeZone * 60 * 60000);
  let dateF = date.toLocaleDateString("en-CA");
  let timeF = date.toLocaleTimeString("pl-PL").replace(/:/g, '-').slice(0, -7);
  return dateF + "_" + timeF;
}
 
const round2decimals = (num) => {
  return Math.round(num * 100) / 100;
}

const addTimeZone = (hour) => {
  if(hour == "23") {
      return "00";
  }
  return (Number(hour) + timeZone).toString();
}

const addMeasureData = (data, time) => {
  let fResult = data;
  let accelString = round2decimals(accel.x) + "," + round2decimals(accel.y) + "," + round2decimals(accel.z);
  fResult += 
    time.getHours() + 
    ":" + time.getMinutes() + 
    ":" + time.getSeconds() + 
    "," + ((hrm.heartRate == null) ? "00" : hrm.heartRate) +
     "," + accelString + "\n";
  return fResult;
}

const recordData = () => {
  let time = new Date();
  resultString = addMeasureData(resultString, time);
  if (time.getMinutes() % 5 == 0 && time.getSeconds() == 0) {
    sendFile(resultString);
    resultString = "";
  }
  if (time.getMinutes() % 5 == 0 && time.getSeconds() == 1) {
    if (resultString.length > 1000) {
      sendFile(resultString);
      resultString = "";
    }
  }
}

const startClockTick = () => {
  clock.granularity = "seconds";
  clock.ontick = (evt) => {
    let [hour, minute, second] = evt.date.toTimeString().split(':')
      updateClock(hour, minute, second);
  }
}

startClockTick();