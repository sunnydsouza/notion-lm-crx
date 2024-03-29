var startTimer = false;
let gIndex = 1;
let addedPlanToIndividualTaskPage = false;
let ON_FEATURE_PAGE = false;
let ON_RELEASE_PAGE = false;
let API_URL="https://192.168.0.128:8200";  //local machine macos
// let API_URL = "https://192.168.0.109:8100";  //server
let NHA_TRIGGER_WORDS = ['This idea task list', 'This feature tasks list', 'Todays Task', 'Sub tasks'];
let BTN_GEN_MAP = {
    "This idea task list": "Plan,Log,Done,Clear",
    "This feature tasks list": "Plan,Log,Done,Clear",
    "Todays Task": "Log,Done,Clear",
    "Sub tasks": "Plan,Log,Done,Clear"
};

waitForKeyElements("div[class*=notion-focusable][style*='color: rgb(55, 53, 47);']:contains('Log hours spent on this task')", addNotionLogHours);

waitForKeyElements(".notranslate:contains('Any Notes here')", addNotesHere);

//Project specific pages
waitForKeyElements("div[class*=notion-focusable][style*='color: rgb(55, 53, 47);']:contains('This idea task list')", multiTaskHelper);

waitForKeyElements("div[class*=notion-focusable][style*='color: rgb(55, 53, 47);']:contains('This feature tasks list')", multiTaskHelper);


//waitForKeyElements ("div.notion-focusable:contains('Todays Task')", multiTaskHelper);
waitForKeyElements("div[class*=notion-focusable][style*='color: rgb(55, 53, 47);']:contains('Todays Task')", multiTaskHelper);

waitForKeyElements("div[class*=notion-focusable][style*='color: rgb(55, 53, 47);']:contains('Sub tasks')", multiTaskHelper);

//waitForKeyElements (".notion-focusable:contains('Open as page')", openFullScreen);

function addNotesHere(jNode) {
    console.log("Any notes here:" + $(jNode[0]).parents('div.notion-sub_sub_header-block').attr('data-block-id'))


}


function onWhichPage() {
    if ($("div:contains('How does this feature help?')").is(":visible")) { ON_FEATURE_PAGE = true; console.log("On feature page"); } else { ON_FEATURE_PAGE = true; console.log("Not on feature page"); }

    if ($("div:contains('Overview of the release, if any')").is(":visible")) { ON_RELEASE_PAGE = true; console.log("On release page"); } else { ON_RELEASE_PAGE = true; console.log("Not on release page"); }


}

function dynamicNHADivs() {
    let nhaDivs = "";
    for (let i = 0; i < NHA_TRIGGER_WORDS.length; i++) {
        //nhaDivs += "div.notion-focusable:contains('"+NHA_TRIGGER_WORDS[i]+"'),";
        nhaDivs += "div[class*=notion-focusable][style*='color: rgb(55, 53, 47);']:contains('" + NHA_TRIGGER_WORDS[i] + "'),";
    }
    return nhaDivs.endsWith(',') ? Array.from(nhaDivs).splice(0, nhaDivs.length - 1).join('') : nhaDivs;
}

function refreshMultiTaskHelperButtons(jNode, gIndex) {

    onWhichPage()
    var taskIds = [];
    var colHeader = [];
    console.log("dynamicNHADivs:" + dynamicNHADivs())
    //closest('.notion-table-view-header-cell')
    $(dynamicNHADivs()).closest(".notion-collection_view-block").parent().parent().each(function (index, value) {
        console.log("data-block-id:" + $(this).attr('data-block-id'));
        colHeader = [];
        $(this).find('.notion-table-view-header-cell').each(function (index, value) {
            colHeader.push($(this).text());
        })
        //console.log(colHeader);
        colHeader = Array.from(new Set(colHeader));;
        console.log(colHeader);

        if (colHeader.includes("SNH")) {
            console.log("SNH col identified at:" + colHeader.indexOf("SNH"))
            let snhHeaderColLoc = ':nth-child(' + (colHeader.indexOf("SNH") + 1) + ')'
            console.log(snhHeaderColLoc)
            //$(dynamicNHADivs()).closest(".notion-collection_view-block").parents(".notion-collection_view-block")
            //    .children("div").eq(1).find("div.notion-collection-item").each(function( index, value) {
            $(this).find("div.notion-collection-item").each(function (index, value) {
                //console.log($( this ).children().eq(1).text());

                taskIds.push($(this).attr('data-block-id'))


                //console.log($( this ).children().eq(1).html());
                console.log("Added refreshMultiTaskHelperButtons:" + $(this).attr('data-block-id'))
                if ($('#multi-checkbox-' + $(this).attr('data-block-id')).length == 0) {
                    $(this).children(snhHeaderColLoc).html("");
                    $('<div><input type=checkbox id="multi-checkbox-' + $(this).attr('data-block-id') + '" data-text="' + $(this).attr('data-block-id') + '" class="multi-ind-checkbox" /></div>')
                        .prependTo($(this).children(snhHeaderColLoc))
                }


                //console.log("checkbox class:"+$(this).find("svg").attr('class'))
                if ($(this).find("svg").attr("class") == "check") {
                    $(this).css({ 'textDecoration': 'line-through', 'opacity': 0.6 })
                } else {
                    $(this).css({ 'textDecoration': 'initial', 'opacity': 1 })
                }
                console.log("Added refreshMultiTaskHelperButtons:" + $(this).attr('data-block-id'));
            });
        }
    })

    console.log(taskIds);
}



function multiTaskHelper(jNode) {

    console.log(jNode[0].textContent);
    var color = $(jNode[0]).css("color");
    console.log("color:" + color)
    //if(color === "rgb(55, 53, 47)")
    //{
    console.log('Adding multi task helper options');

    var tempDiv = document.createElement('div');
    tempDiv.classList.add("helper-btn");
    tempDiv.id = "g" + gIndex;


    tempDiv.innerHTML = generateButton(jNode[0].textContent, gIndex)



    jNode[0].parentNode.parentNode.append(tempDiv);


    if (jNode[0].textContent == "This feature tasks list") {


        console.log("feature_tasklist_view:" + $(jNode[0]).parents(".notion-collection_view-block").children().children(":nth-child(2)").find("a").attr('href'))
        console.log("page_url:" + $(location).attr("href"))
        $.post(API_URL + "/notionhelper/api/v1/featurestasklistfilter", { feature_tasklist_view: $(jNode[0]).parents(".notion-collection_view-block").children().children(":nth-child(2)").find("a").attr('href'), page_url: $(location).attr("href") })
            .done(function (data) {

                alert("Successful set the filter for this features tasks list");
            });
    }


    setTimeout(setInterval(() => { refreshMultiTaskHelperButtons(jNode, gIndex); }, 10000), 3000);

    gIndex++;
    //}

}

function generateButton(currentPage, gIndex) {
    //console.log("BTN_GEN_MAP"+BTN_GEN_MAP[currentPage])

    var buttons = BTN_GEN_MAP[currentPage].split(",");
    //console.log("buttons",buttons);
    var buttonHtmlCode = "";
    for (let eachButton of buttons) {
        //console.log(eachButton)
        switch (eachButton) {
            case "Plan":
                buttonHtmlCode += generatePlanButton(gIndex);
                break;
            case "Log":
                buttonHtmlCode += generateLogButton(gIndex);
                break;
            case "Done":
                buttonHtmlCode += generateDoneButton(gIndex);
                break;
            case "Clear":
                buttonHtmlCode += generateClearAllButton(gIndex);
                break;
        }
    }
    return buttonHtmlCode;
}

function generatePlanButton(gIndex) {
    return '<button id="plantoday-btn-' + (gIndex) + '" data-text="g' + (gIndex) + '" class="plantoday-btn btn">Plan</button>';
}

function generateDoneButton(gIndex) {
    return '<button id="multi-done-btn-' + (gIndex) + '" data-text="g' + (gIndex) + '" class="multi-done-btn btn">Done</button>';
}

function generateLogButton(gIndex) {
    return '<button id="multi-loghours-btn-' + (gIndex) + '" data-text="g' + (gIndex) + '" class="multi-loghours-btn btn" value="Multi Log Hours">Log</button>';
}

function generateClearAllButton(gIndex) {
    return '<button id="clear-multi-btn-' + (gIndex) + '" data-text="g' + (gIndex) + '" class="clear-multi-btn btn">Clear</button>';
}


function openFullScreen(jNode) {
    console.log("Open full screen")
    setTimeout(() => {
        if ($(".notion-peek-renderer").is(":visible")) {
            $(jNode).click();
        }
    }, 2000);
}



function addPlanToMasterTaskPage(jNode) {
    console.log("Added addPlanToMasterTaskPage.Verify me!")

    var taskid = $(location).attr("href").slice(-32);
    console.log("taskid for plan master page:" + taskid);
    addCompletedTaskCheckbox();
    if (addedPlanToIndividualTaskPage == false) { addPlanButton(taskid); addedPlanToIndividualTaskPage = true; }


}



function addPlanButton(taskid) {
    $('<div><input type=button id="plantoday-btn-ind" data-text="' + taskid + '" value="Plan!"/></div>').appendTo($('div.notion-page-controls'))

}

$(document).ready(function () {

    jQuery(document.body).on('click', '#plantoday-btn-ind', function () {

        $('#plan-form-taskid').val($(this).attr('data-text'))
        plan_form.dialog("open");

        //plan_form;
    });

    jQuery(document.body).on('click', '.plantoday-btn', function () {
        console.log("Registered click on Plan")
        var taskids = "";  //recreate tasks
        $('.multi-ind-checkbox').each(function () {
            if ($(this).prop('checked') == true) {
                taskids = taskids + $(this).attr('data-text') + ","
            }
        });

        $('#plan-form-taskid').val(taskids)
        plan_form.dialog("open");

        //plan_form;
    });

    jQuery(document.body).on('click', '.multi-loghours-btn', function () {
        console.log("Registered click on Multi Hours log")
        var taskids = "";  //recreate tasks
        $('.multi-ind-checkbox').each(function () {
            if ($(this).prop('checked') == true) {
                taskids = taskids + $(this).attr('data-text') + ","
            }
        });

        $('#nh-logged-hrs-taskid').val(taskids)

        logged_hrs_form.dialog("open");

        //pomotimerButtonEventHandler();

    })

    jQuery(document.body).on('click', '.multi-done-btn', function () {
        console.log("Registered click on Multi Done button")
        var taskids = "";  //recreate tasks
        $('.multi-ind-checkbox').each(function () {
            if ($(this).prop('checked') == true) {
                taskids = taskids + $(this).attr('data-text') + ","
            }
        });

        $('#nh-done-task-taskid').val(taskids)

        dialog_nh_done_task.dialog("open");

        //pomotimerButtonEventHandler();

    })


    jQuery(document.body).on('click', '.clear-multi-btn', function () {
        console.log("Registered click on Multi Done button")
        var taskids = "";  //recreate tasks
        $('.multi-ind-checkbox').each(function () {
            if ($(this).prop('checked') == true) {
                $(this).prop('checked', false)
            }
        });
    })


    jQuery(document.body).on('click', '#countdown', function (index, value) {
        if (startTimer == false) {
            console.log("Start the timer");
            startTimer = true
            countdown('countdown');
            //startPomoTimer();
            actualStartTime = (new Date()).valueOf();
            $("#countdown").attr("data-text", ("0" + new Date().getHours()).slice(-2) + ':' + ("0" + new Date().getMinutes()).slice(-2));
            console.log($(this).attr('data-text'));
        }
        else {
            console.log("Stop the timer");
            startTimer = false;
            let text = "Log and reset pomo timer?.\nCancel will stop the timer which can later be resumed.";
            if (confirm(text) == true) {
                text = "You pressed OK!";
                var stoppedTime = $("#countdown").val();
                $("#countdown").val("25:00");
                resetPomoTime();
                //clearInterval(interval);
                var endTime = ("0" + new Date().getHours()).slice(-2) + ':' + ("0" + new Date().getMinutes()).slice(-2)
                $.post(API_URL + "/notionhelper/api/v1/pomotimer", { taskid: $(location).attr("href").slice(-32), start: $(this).attr('data-text'), end: endTime, session: stoppedTime })
                    .done(function (data) {

                        alert("Successful confirmation LogHours: " + data);
                    });

            } else {
                text = "You canceled!";
            }
            clearInterval(interval);
        }

    })

})
// showDoneTaskModalForm(this,id);

let actualStartTime;

function addNotionLogHours(jNode) {
    console.log('addNotionLogHours active: Adding Notion Log Hours button');
    var bottomoffset = 450;

    var tempDiv = document.createElement('div');
    //     tempDiv.innerHTML = '<div><input type=button id="loghours-btn" data-text="you clicked loghours btn!" class="loghours-btn" value="Log Hours"/><input type=button id="add-pomo-feature-btn" data-text="you clicked pomo btn!" class="add-pomos-feature" value="Pomo"/></div>';
    tempDiv.innerHTML = '<div><input type=button id="loghours-btn" data-text="you clicked loghours btn!" class="loghours-btn" value="Log Hours"/><audio id="pomo-done-alert" src="https://pomofocus.io/audios/alarms/alarm-kitchen.mp3" preload="auto"></audio></div>';


    bottomoffset = bottomoffset - 60;
    jNode[0].parentNode.parentNode.append(tempDiv);


    $('.loghours-btn').click(function (index, value) {

        console.log($(this).attr('data-text'));
        var taskId = $(location).attr("href").slice(-32);
        //alert(taskId);
        logged_hrs_form.dialog("open");
        $('#nh-logged-hrs-taskid').val(taskId)

    });

    startTimer = false;


    //     $('#add-pomo-feature-btn').click(function(index, value) {
    //         this.$ = this.jQuery = jQuery.noConflict(true);
    //         $("iframe[src*='https://pomofocus.io/']").each(function() {
    //             console.log("Add 'allow-modals' to the iframe");
    //             this.sandbox += ' allow-modals';
    //         });
    //         monitorStartPomo();
    //         checkPomoStatus();
    //     });

    logged_hrs_form
    //pomotimerButtonEventHandler();
}


function addDoneDate(jNode) {
    console.log('addDoneDate active: Adding Notion Completed On Date');


    console.log($(jNode).attr('role'));
    $(jNode).parent().siblings().find("svg").on("click", function () {

        console.log('click captured');
        console.log($(jNode).parent().siblings().find("svg").attr('class'));
        var id = $(this).parents('div.notion-frame').find('div.notion-page-block').attr('data-block-id');
        console.log(id);
        $('#nh-done-task-taskid').val(id)
        showDoneTaskModalForm(this, id);


    })


}


function addCompletedTaskCheckbox() {
    console.log($(".notion-focusable:contains('✅?')").parent().siblings().find("svg").attr('class'));
    $(".notion-focusable:contains('✅?')").parent().siblings().find("svg").on("click", function () {

        console.log('click captured');
        console.log($(this).attr('class'));
        var id = $(this).parents('div.notion-frame').find('div.notion-page-block').attr('data-block-id');
        console.log(id);
        $('#nh-done-task-taskid').val(id)
        showDoneTaskModalForm(this, id);


    })
}
function showDoneTaskModalForm(node, id) {
    if ($(node).attr('class') == 'checkboxSquare') {
        //validate that mandatory fields are filled in
        //var id=$( node ).closest('div.notion-collection-item').attr('data-block-id');

        dialog_nh_done_task.dialog("open");
        //$('#nh-done-task-taskid').val(id)

    }
}



/////////////////////////////// PLAN TASK ///////////////////////////////////////////

$(`                                                         \
<div id="plan-dialog" title="Plan">
<form id="plan-form">
<fieldset>
<label for="taskid">TaskId</label>
<input type="text" name="plan-form-taskid" id="plan-form-taskid" value="" class="text ui-widget-content ui-corner-all">
<label for="date">Date</label>
<input type="text" name="plan-form-datepicker" id="plan-form-datepicker">
<br/>
<label for="plan">Plan</label>
<select class="nh-select-menu" name="plan" id="plan">
<option selected="selected">This day</option>
<option>This week</option>
<option>This month</option>
</select>
<br/>
<label for="plan-priority">Priority</label>
<select class="nh-select-menu" name="plan-priority" id="plan-priority">
<option selected="selected" value="">--None--</option>
<option>P1 🔥</option>
<option>P2</option>
<option>P3</option>
</select>

<!-- Allow form submission with keyboard without duplicating the dialog button -->
<input type="submit" tabindex="-1" style="position:absolute; top:-1000px">
</fieldset>
</form>
</div>
`).appendTo('body');


/////////////////////////////// DONE TASK ///////////////////////////////////////////

$(`
<div id="nh-done-task" title="Done!">
<form id="nh-done-task-form">
<fieldset>
<label for="nh-done-task-taskid">TaskId</label>
<input type="text" name="nh-done-task-taskid" id="nh-done-task-taskid" value="null" class="text ui-widget-content ui-corner-all">
<label for="nh-done-task-title">Title</label>
<input type="text" name="nh-done-task-title" id="nh-done-task-title" value="" class="text ui-widget-content ui-corner-all">
<label for="date">Completed Date</label>
<input type="text" name="nh-done-task-completed-date" id="nh-done-task-completed-date">
<label for="worked-on-dates">Worked on dates</label>
<input type="text" name="nh-done-task-worked-on-days" id="nh-done-task-worked-on-days">
<br/>
<label for="plan-priority">Priority</label>
<select class="nh-select-menu" name="nh-done-task-plan-priority" id="nh-done-task-plan-priority">
<option selected="selected" value="">--None--</option>
<option>P1 🔥</option>
<option>P2</option>
<option>P3</option>
</select>
<label for="loghours">Log Hours</label>
<input type="text" name="nh-done-task-log-hrs">
<label for="repeat-task">Repeat Task</label>
<input type="text" name="nh-done-task-repeat-task" id="nh-done-task-repeat-task">
<!-- Allow form submission with keyboard without duplicating the dialog button -->
<input type="submit" tabindex="-1" style="position:absolute; top:-1000px">
</fieldset>
</form>
</div>
`).appendTo('body');

/////////////////////////////// LOGGED HOURS ///////////////////////////////////////////

$(`
<div id="nh-logged-hrs" title="Log Hours!">
<form id="nh-logged-hrs-form">
<fieldset>
<label for="nh-logged-hrs-taskid">TaskId</label>
<input type="text" name="nh-logged-hrs-taskid" id="nh-logged-hrs-taskid" value="null" class="text ui-widget-content ui-corner-all">
<label for="nh-logged-hrs-title">Title</label>
<input type="text" name="nh-logged-hrs-title" id="nh-logged-hrs-title" value="Working on task" class="text ui-widget-content ui-corner-all">
<label for="worked-on-dates">Worked on dates</label>
<input type="text" name="nh-logged-hrs-worked-on-days" id="nh-logged-hrs-worked-on-days">
<br/>
<label for="loghours">Log Hours</label>
<input type="text" name="nh-logged-hrs-log-hrs">
<label for="loghours-starttime">Start time (Optional)</label>
<input type="text" name="nh-logged-hrs-start-time">
<label for="loghours-endtime">End time (Optional)</label>
<input type="text" name="nh-logged-hrs-end-time">
<input type=button id="countdown" data-text="" value="25:00">
<!-- Allow form submission with keyboard without duplicating the dialog button -->
<input type="submit" tabindex="-1" style="position:absolute; top:-1000px">
</fieldset>
</form>
</div>
` ).appendTo('body');



var plan_form = $("#plan-dialog").dialog({
    autoOpen: false,
    height: 500,
    width: 350,
    modal: true,
    buttons: {
        "Plan": function plan() {
            var valid = true;
            if (valid) {
                var data = $("#plan-form").serialize();
                $.post(API_URL + "/notionhelper/api/v1/plantask", data)
                    .done(function (data) {
                        $('.multi-ind-checkbox').each(function () {
                            if ($(this).prop('checked') == true) {
                                $(this).prop('checked', false);
                            }
                        });
                        alert("Successful confirmation PlanTask: " + data);
                    });
                plan_form.dialog("close");
            }
            return valid;
        },
        Cancel: function () {
            $(':input', '#plan-dialog')
                .not(':button, :submit, :reset, :hidden')
                .val('')
            plan_form.dialog("close");
        }
    },

    close: function () {
        $(':input', '#plan-dialog')
            .not(':button, :submit, :reset, :hidden')
            .val('')
    }
});


var dialog_nh_done_task = $("#nh-done-task").dialog({
    autoOpen: false,
    height: 500,
    width: 400,
    modal: true,
    buttons: {
        "Done": function done() {
            event.preventDefault();
            var valid = true;
            if (valid) {
                var data = $("#nh-done-task-form").serialize();
                $.post(API_URL + "/notionhelper/api/v1/completetask", data)
                    .done(function (result) {
                        //alert( "Data Loaded: " + data );
                        let text = "Successful confirmation DoneTask: " + result + ". Press a button!\nEither OK or Cancel.";
                        if (confirm(text) == true) {
                            text = "You pressed OK!";
                            $.post(API_URL + "/notionhelper/api/v1/loghoursCompletedTask", data)
                                .done(function (data) {
                                    $('.multi-ind-checkbox').each(function () {
                                        if ($(this).prop('checked') == true) {
                                            $(this).prop('checked', false);
                                        }
                                    });
                                    alert("Successful confirmation LogHours: " + data);
                                });

                        } else {
                            text = "You canceled!";
                            $('.multi-ind-checkbox').each(function () {
                                if ($(this).prop('checked') == true) {
                                    $(this).prop('checked', false);
                                }
                            });
                        }
                        //alert(text);
                    });
                dialog_nh_done_task.dialog("close");
            }
            return valid;
        },
        Cancel: function () {
            $(':input', '#nh-done-task')
                .not(':button, :submit, :reset, :hidden')
                .val('')
            dialog_nh_done_task.dialog("close");
        }
    },

    close: function () {
        $(':input', '#nh-done-task')
            .not(':button, :submit, :reset, :hidden')
            .val('')

    }
});


var logged_hrs_form = $("#nh-logged-hrs").dialog({
    autoOpen: false,
    height: 400,
    width: 350,
    modal: true,
    buttons: {
        "Log": function log() {
            event.preventDefault();
            var valid = true;
            if (valid) {
                var data = $("#nh-logged-hrs-form").serialize();
                $.post(API_URL + "/notionhelper/api/v1/loghours", data)
                    .done(function (data) {
                        $('.multi-ind-checkbox').each(function () {
                            if ($(this).prop('checked') == true) {
                                $(this).prop('checked', false);
                            }
                        });
                        alert("Successful confirmation: " + data);
                    });
                logged_hrs_form.dialog("close");
            }
            return valid;
        },
        Cancel: function () {
            $(':input', '#nh-logged-hrs')
                .not(':button, :submit, :reset, :hidden')
                .val('')
            logged_hrs_form.dialog("close");
            $('#nh-logged-hrs-worked-on-days').multiDatesPicker('resetDates', 'picked');
        }
    },

    close: function () {
        $(':input', '#nh-logged-hrs')
            .not(':button, :submit, :reset, :hidden')
            .val('')
        $('#nh-logged-hrs-worked-on-days').multiDatesPicker('resetDates', 'picked');

    }
});



var datepicker = $(function () {


    $(".nh-select-menu").selectmenu();


    $("#plan-form-datepicker").datepicker({
        showOtherMonths: true,
        selectOtherMonths: true,
        dateFormat: "yy-mm-dd"
    });

    $("#nh-done-task-repeat-task").multiDatesPicker({
        showOtherMonths: true,
        selectOtherMonths: true,
        dateFormat: "yy-mm-dd",
        onSelect: function () {
            // Get the "datepicker" object.
            var datepickerObj = $(this).data("datepicker");

            // Get the "settings" object within "datepicker".
            var datepickerSettings = datepickerObj.settings;

            // Get the last date picked.
            var d = new Date();
            var dayDiff = datepickerObj.selectedDay - d.getDate();
            var monthDiff = datepickerObj.selectedMonth - d.getMonth();
            var yearDiff = datepickerObj.selectedYear - d.getFullYear();
            var pickedDate =
                "+" + dayDiff + "d +" + monthDiff + "m +" + yearDiff + "y";

            // Remove previous "defaultDate" property.
            delete datepickerSettings["defaultDate"];

            // Add a new defaultDate property : value.
            datepickerSettings.defaultDate = pickedDate;

            // Avoid having to click twice on prev/next month.
            $("#nh-done-task-repeat-task").blur();
            setTimeout(function () {
                $("#nh-done-task-repeat-task").focus();
            }, 300); // 1 millisecond delay seems to be enought!!!
        }
    });

    $("#nh-logged-hrs-title").click(function (event) {
        event.preventDefault();
        event.stopPropagation();
        //alert("The span element was clicked.");
    });

    $("#nh-done-task-completed-date").datepicker({
        showOtherMonths: true,
        selectOtherMonths: true,
        dateFormat: "yy-mm-dd"
    });

    $("#nh-done-task-worked-on-days").multiDatesPicker({
        showOtherMonths: true,
        selectOtherMonths: true,
        dateFormat: "yy-mm-dd",
        onSelect: function () {
            // Get the "datepicker" object.
            var datepickerObj = $(this).data("datepicker");

            // Get the "settings" object within "datepicker".
            var datepickerSettings = datepickerObj.settings;

            // Get the last date picked.
            var d = new Date();
            var dayDiff = datepickerObj.selectedDay - d.getDate();
            var monthDiff = datepickerObj.selectedMonth - d.getMonth();
            var yearDiff = datepickerObj.selectedYear - d.getFullYear();
            var pickedDate =
                "+" + dayDiff + "d +" + monthDiff + "m +" + yearDiff + "y";

            // Remove previous "defaultDate" property.
            delete datepickerSettings["defaultDate"];

            // Add a new defaultDate property : value.
            datepickerSettings.defaultDate = pickedDate;

            // Avoid having to click twice on prev/next month.
            $("#nh-done-task-worked-on-days").blur();
            setTimeout(function () {
                $("#nh-done-task-worked-on-days").focus();
            }, 300); // 1 millisecond delay seems to be enought!!!
        }
    });

    $("#nh-logged-hrs-worked-on-days").multiDatesPicker({
        showOtherMonths: true,
        selectOtherMonths: true,
        dateFormat: "yy-mm-dd",
        onSelect: function () {
            // Get the "datepicker" object.
            var datepickerObj = $(this).data("datepicker");

            // Get the "settings" object within "datepicker".
            var datepickerSettings = datepickerObj.settings;

            // Get the last date picked.
            var d = new Date();
            var dayDiff = datepickerObj.selectedDay - d.getDate();
            var monthDiff = datepickerObj.selectedMonth - d.getMonth();
            var yearDiff = datepickerObj.selectedYear - d.getFullYear();
            var pickedDate =
                "+" + dayDiff + "d +" + monthDiff + "m +" + yearDiff + "y";

            // Remove previous "defaultDate" property.
            delete datepickerSettings["defaultDate"];

            // Add a new defaultDate property : value.
            datepickerSettings.defaultDate = pickedDate;

            // Avoid having to click twice on prev/next month.
            $("#nh-logged-hrs-worked-on-days").blur();
            setTimeout(function () {
                $("#nh-logged-hrs-worked-on-days").focus();
            }, 300); // 1 millisecond delay seems to be enought!!!
        }
    });

});

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
    actualStartTime = (new Date()).valueOf();
    var originalDocumentTitle = document.title;
    //requestAnimationFrame(update)

    //      $.post( "https://192.168.0.128:8200/notionpomo/api/v1/startSession", {})
    //                     .done(function( data ) {
    //                     alert( "Successful confirmation: " + data );
    //                 });
    $.ajax({
        url: API_URL + "/notionpomo/api/v1/startSession",
        type: 'POST',
        cache: false,
        timeout: 0,
        error: function () {
            return true;
        },
        success: function (msg) {
            return msg
        }
    });
    interval = setInterval(function () {
        var d = (new Date()).valueOf();
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
            var snd = new Audio('https://pomofocus.io/audios/alarms/alarm-kitchen.mp3');
            snd.onended = function () { postPomoTime(); };
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
        minute_text = String(minutes).padStart(2, '0');
        //} else {
        //   minute_text = '00';
        //}
        //        var second_text = seconds > 1 ? 'seconds' : 'second';
        second_text = String(seconds).padStart(2, '0');
        //el.value = minute_text + ' ' + seconds + ' ' + second_text + ' remaining';
        el.value = minute_text + ':' + second_text;
        document.title = "#" + minute_text + ':' + second_text;
        //seconds--;
    }, 1000);
}



function postPomoTime() {
    let text = "Log and reset pomo timer?.\nCancel will stop the timer which can later be resumed.";
    if (confirm(text) == true) {
        text = "You pressed OK!";
        var stoppedTime = $("#countdown").val();
        $("#countdown").val("25:00");
        //resetPomoTime();
        //clearInterval(interval);
        var endTime = ("0" + new Date().getHours()).slice(-2) + ':' + ("0" + new Date().getMinutes()).slice(-2)
        $.post(API_URL + "/notionhelper/api/v1/pomotimer", { taskid: $("#nh-logged-hrs-taskid").val(), start: $("#countdown").attr('data-text'), end: endTime, session: stoppedTime })
            .done(function (data) {
                alert("Successful confirmation LogHours: " + data);
            });

    } else {
        text = "You canceled!";
    }
}


const waitFor = (...selectors) => new Promise(resolve => {
    const delay = 500;
    const f = () => {
        const elements = selectors.map(selector => document.querySelector(selector));
        if (elements.every(element => element != null)) {
            resolve(elements);
        } else {
            setTimeout(f, delay);
        }
    }
    f();
});





