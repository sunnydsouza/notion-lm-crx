var startTimer = false;
$(document).ready(function () {

  
    jQuery(document.body).on("click", "#countdown", function (index, value) {
      if (startTimer == false) {
        console.log("Start the timer");
        startTimer = true;
        countdown("countdown");
        //startPomoTimer();
        actualStartTime = new Date().valueOf();
        $("#countdown").attr(
          "data-text",
          ("0" + new Date().getHours()).slice(-2) +
            ":" +
            ("0" + new Date().getMinutes()).slice(-2)
        );
        console.log($(this).attr("data-text"));
      } else {
        console.log("Stop the timer");
        startTimer = false;
        let text =
          "Log and reset pomo timer?.\nCancel will stop the timer which can later be resumed.";
        if (confirm(text) == true) {
          text = "You pressed OK!";
          var stoppedTime = $("#countdown").val();
          $("#countdown").val("25:00");
          resetPomoTime();
          //clearInterval(interval);
          var endTime =
            ("0" + new Date().getHours()).slice(-2) +
            ":" +
            ("0" + new Date().getMinutes()).slice(-2);
          $.post(API_URL + "/notionhelper/api/v1/pomotimer", {
            taskid: $(location).attr("href").slice(-32),
            start: $(this).attr("data-text"),
            end: endTime,
            session: stoppedTime,
          }).done(function (data) {
            alert("Successful confirmation LogHours: " + data);
          });
        } else {
          text = "You canceled!";
        }
        clearInterval(interval);
      }
    });
  

  });
  let actualStartTime;
  startTimer = false;
  var interval;
var minutes;
var seconds;
var pomoMinutes;
// var player = document.createElement('audio');
// player.src = 'https://pomofocus.io/audios/alarms/alarm-kitchen.mp3';
// player.preload = 'auto';
resetPomoTime();

function resetPomoTime() {
  pomoMinutes = 25;
  //seconds=0
}

function countdown(element) {
  var minute_text = "00";
  var second_text = "00";
  actualStartTime = new Date().valueOf();
  var originalDocumentTitle = document.title;
  //requestAnimationFrame(update)

  //      $.post( "https://192.168.0.128:8200/notionpomo/api/v1/startSession", {})
  //                     .done(function( data ) {
  //                     alert( "Successful confirmation: " + data );
  //                 });
  $.ajax({
    url: API_URL + "/notionpomo/api/v1/startSession",
    type: "POST",
    cache: false,
    timeout: 0,
    error: function () {
      return true;
    },
    success: function (msg) {
      return msg;
    },
  });
  interval = setInterval(function () {
    var d = new Date().valueOf();
    // calculate time difference between now and initial time
    var diff = d - actualStartTime;
    // calculate number of minutes
    var minutes = Math.floor(diff / 1000 / 60);
    // calculate number of seconds
    var seconds = Math.floor(diff / 1000) - minutes * 60;

    //         console.log("diff"+diff);
    //console.log("minutes"+minutes);
    //console.log("seconds"+seconds);

    var el = document.getElementById(element);
    //if(seconds == 0) {
    if (minutes >= pomoMinutes) {
      //player.play();
      //document.getElementById("pomo-done-alert").play();
      var snd = new Audio(
        "https://pomofocus.io/audios/alarms/alarm-kitchen.mp3"
      );
      snd.onended = function () {
        postPomoTime();
      };
      snd.play();
      resetPomoTime();
      startTimer = false;
      //                 var endTime=new Date().getHours()+':'+new Date().getMinutes()
      //                 var stoppedTime=$("#countdown").val();
      el.value = "25:00";

      clearInterval(interval);
      return;
    } else {
      //minutes--;
      //seconds = 60;
    }
    //}
    //if(minutes > 0) {
    //minute_text = minutes + (minutes > 1 ? ' minutes' : ' minute');
    minute_text = String(minutes).padStart(2, "0");
    //} else {
    //   minute_text = '00';
    //}
    //        var second_text = seconds > 1 ? 'seconds' : 'second';
    second_text = String(seconds).padStart(2, "0");
    //el.value = minute_text + ' ' + seconds + ' ' + second_text + ' remaining';
    el.value = minute_text + ":" + second_text;
    document.title = "#" + minute_text + ":" + second_text;
    //seconds--;
  }, 1000);
}

function postPomoTime() {
  let text =
    "Log and reset pomo timer?.\nCancel will stop the timer which can later be resumed.";
  if (confirm(text) == true) {
    text = "You pressed OK!";
    var stoppedTime = $("#countdown").val();
    $("#countdown").val("25:00");
    //resetPomoTime();
    //clearInterval(interval);
    var endTime =
      ("0" + new Date().getHours()).slice(-2) +
      ":" +
      ("0" + new Date().getMinutes()).slice(-2);
    $.post(API_URL + "/notionhelper/api/v1/pomotimer", {
      taskid: $("#nh-logged-hrs-taskid").val(),
      start: $("#countdown").attr("data-text"),
      end: endTime,
      session: stoppedTime,
    }).done(function (data) {
      alert("Successful confirmation LogHours: " + data);
    });
  } else {
    text = "You canceled!";
  }
}
