
let gIndex = 1;
let addedPlanToIndividualTaskPage = false;
const pollIntervalNotionLMHelperButtons = 5000;
let ON_FEATURE_PAGE = false;
let ON_RELEASE_PAGE = false;
//let API_URL="https://192.168.0.128:8100";  //local machine macos
let API_URL = "https://192.168.0.128:8200"; //server
let NHA_TRIGGER_WORDS = [
  "This idea task list",
  "This feature tasks list",
  "Todays Task",
  "Sub tasks",
  "Project distribution view",
];
// let BTN_GEN_MAP = {
//   "This idea task list": "Plan,Log,Done,Clear",
//   "This feature tasks list": "Plan,Log,Done,Clear",
//   "Todays Task": "Log,Done,Clear",
//   "Sub tasks": "Plan,Log,Done,Clear",
// };

$.ajaxSetup({
  type: "POST",
  timeout: 30000,
  error: function (xhr) {
    showGrowlNotification(title="Notion LM", description="API timeout error. Not reachable?", type="error",closeTimeout=0);
  },
});

waitForKeyElements(
  "div[class*=notion-focusable][style*='color: rgb(55, 53, 47);']:contains('Log hours spent on this task')",
  addNotionLogHours
);

waitForKeyElements(".notranslate:contains('Any Notes here')", addNotesHere);

//Project specific pages
waitForKeyElements(
  "div[class*=notion-focusable][style*='color: rgb(55, 53, 47);']:contains('This idea task list')",
  addNotionLMTaskHelper
);

waitForKeyElements(
  "div[class*=notion-focusable][style*='color: rgb(55, 53, 47);']:contains('This feature tasks list')",
  addNotionLMTaskHelper
);

waitForKeyElements(
  "div[class*=notion-focusable][style*='color: rgb(55, 53, 47);']:contains('Todays Task')",
  addNotionLMTaskHelper
);

waitForKeyElements(
  "div[class*=notion-focusable][style*='color: rgb(55, 53, 47);']:contains('Project distribution view')",
  addNotionLMTaskHelper
);

waitForKeyElements(
  "div[class*=notion-focusable][style*='color: rgb(55, 53, 47);']:contains('GTD Sessions')",
  autoApplyFilterToGtdSessionsView
);

waitForKeyElements(
  "div[class*=notion-focusable][style*='color: rgb(55, 53, 47);']:contains('Sub tasks')",
  addNotionLMTaskHelper
);

//waitForKeyElements (".notion-focusable:contains('Open as page')", openFullScreen);

function addNotesHere(jNode) {
  console.log(
    "Any notes here:" +
      $(jNode[0])
        .parents("div.notion-sub_sub_header-block")
        .attr("data-block-id")
  );
}

function showGrowlNotification(
  title = "Notion LM",
  description,
  type,
  closeTimeout = 45000
) {
  GrowlNotification.notify({
    title: title,
    description: description,
    type: type,
    animation: {
      open: "slide-in",
      close: "slide-out",
    },
    maxNotifications: 1,
    closeTimeout: closeTimeout,
  });
}

function onWhichPage() {
  if ($("div:contains('How does this feature help?')").is(":visible")) {
    ON_FEATURE_PAGE = true;
    console.log("On feature page");
  } else {
    ON_FEATURE_PAGE = true;
    console.log("Not on feature page");
  }

  if ($("div:contains('Overview of the release, if any')").is(":visible")) {
    ON_RELEASE_PAGE = true;
    console.log("On release page");
  } else {
    ON_RELEASE_PAGE = true;
    console.log("Not on release page");
  }
}

function dynamicNLMDivs() {
  let nhaDivs = "";
  for (let i = 0; i < NHA_TRIGGER_WORDS.length; i++) {
    //nhaDivs += "div.notion-focusable:contains('"+NHA_TRIGGER_WORDS[i]+"'),";
    nhaDivs +=
      "div[class*=notion-focusable][style*='color: rgb(55, 53, 47);']:contains('" +
      NHA_TRIGGER_WORDS[i] +
      "'),";
  }
  return nhaDivs.endsWith(",")
    ? Array.from(nhaDivs)
        .splice(0, nhaDivs.length - 1)
        .join("")
    : nhaDivs;
}

function refreshNotionLMHelperButtons(jNode, gIndex) {
  onWhichPage();
  var taskIds = [];
  var colHeader = [];
  // console.log("dynamicNLMDivs:" + dynamicNLMDivs());

  $(dynamicNLMDivs())
    .closest(".notion-collection_view-block")
    .parent()
    .parent()
    .each(function (index, value) {
      console.log("data-block-id:" + $(this).attr("data-block-id"));
      colHeader = [];
      $(this)
        .find(".notion-table-view-header-cell")
        .each(function (index, value) {
          colHeader.push($(this).text());
        });

      colHeader = Array.from(new Set(colHeader));
      // console.log(colHeader);

      if (colHeader.includes("SNH")) {
        console.log("SNH col identified at:" + colHeader.indexOf("SNH"));
        let snhHeaderColLoc =
          ":nth-child(" + (colHeader.indexOf("SNH") + 1) + ")";
        console.log(snhHeaderColLoc);

        $(this)
          .find("div.notion-collection-item")
          .each(function (index, value) {
            //console.log($( this ).children().eq(1).text());

            taskIds.push($(this).attr("data-block-id"));

            //console.log($( this ).children().eq(1).html());
            console.log(
              "Added refreshNotionLMHelperButtons:" +
                $(this).attr("data-block-id")
            );
            if (
              $("#multi-checkbox-" + $(this).attr("data-block-id")).length == 0
            ) {
              $(this).children(snhHeaderColLoc).html("");
              $(
                '<div><input type=checkbox id="multi-checkbox-' +
                  $(this).attr("data-block-id") +
                  '" data-text="' +
                  $(this).attr("data-block-id") +
                  '" class="multi-ind-checkbox" /></div>'
              ).prependTo($(this).children(snhHeaderColLoc));
            }

            //console.log("checkbox class:"+$(this).find("svg").attr('class'))
            if ($(this).find("svg").attr("class") == "check") {
              $(this).css({ textDecoration: "line-through", opacity: 0.6 });
            } else {
              $(this).css({ textDecoration: "initial", opacity: 1 });
            }
            console.log(
              "Added refreshNotionLMHelperButtons:" +
                $(this).attr("data-block-id")
            );
          });
      }
    });

  console.log(taskIds);
}

function addNotionLMTaskHelper(jNode) {
  console.log(jNode[0].textContent);
  var color = $(jNode[0]).css("color");
  console.log("color:" + color);
  //if(color === "rgb(55, 53, 47)")
  //{
  console.log("Adding notion life management task helper options");

  var notionLMButton = document.createElement("div");
  notionLMButton.classList.add("helper-btn");
  notionLMButton.id = "g" + gIndex;

  notionLMButton.innerHTML = generateButton(gIndex);

  jNode[0].parentNode.parentNode.append(notionLMButton);

  //If this is a features page, then apply filters to the tasks database to auto apply the projects, release
  if (jNode[0].textContent == "This feature tasks list") {
    autoApplyFilterToFeatureTaskList(jNode[0]);
  }

  //If this is a GTD page, then apply filters to Todays task to filter by current date
  if (jNode[0].textContent == "Todays Task") {
    autoApplyFilterToGtdTasksView(jNode[0]);
  }

  setTimeout(
    setInterval(() => {
      refreshNotionLMHelperButtons(jNode, gIndex);
    }, pollIntervalNotionLMHelperButtons),
    3000
  );

  gIndex++;
  //}
}

function autoApplyFilterToFeatureTaskList(databaseView) {
  console.log(
    "feature_tasklist_view:" +
      $(databaseView)
        .parents(".notion-collection_view-block")
        .children()
        .children(":nth-child(2)")
        .find("a")
        .attr("href")
  );
  console.log("Applying fiters to page_url:" + $(location).attr("href"));
  GrowlNotification.notify({
    title: "Notion LM Helper",
    description: "Applying filters to current features -> tasks database",
    closeTimeout: 5000,
    animation: {
      open: "slide-in",
      close: "slide-out",
    },
    type: "info",
    // showProgress: true,
  });
  $.post(API_URL + "/notionhelper/api/v1/featurestasklistfilter", {
    feature_tasklist_view: $(databaseView)
      .parents(".notion-collection_view-block")
      .children()
      .children(":nth-child(2)")
      .find("a")
      .attr("href"),
    page_url: $(location).attr("href"),
  }).done(function (result) {
    // alert("Successful set the filter for this features tasks list");
    const resultJson = JSON.parse(result);
    if (resultJson.status == "Success") {
      GrowlNotification.notify({
        title: "Notion LM Helper",
        description:
          "Successfully applied filters (Projects/Release) to current features -> tasks database",
        closeTimeout: 5000,
        animation: {
          open: "slide-in",
          close: "slide-out",
        },
        type: "success",
      });
    } else {
      GrowlNotification.notify({
        title: "Notion LM Helper",
        description:
          "Failed to apply filters (Projects/Release) to current features -> tasks database",
        closeTimeout: 5000,
        animation: {
          open: "slide-in",
          close: "slide-out",
        },
        type: "error",
      });
    }
  });
  // }
}

function autoApplyFilterToGtdTasksView(databaseView) {
  console.log(
    "collection_view:" +
      $(databaseView)
        .parents(".notion-collection_view-block")
        .children()
        .children(":nth-child(2)")
        .find("a")
        .attr("href")
  );
  console.log(
    "Applying GTD task filter to page_url:" + $(location).attr("href")
  );
  GrowlNotification.notify({
    title: "Notion LM Helper",
    description: "Applying filters to GTD tasks view",
    closeTimeout: 5000,
    animation: {
      open: "slide-in",
      close: "slide-out",
    },
    type: "info",
    // showProgress: true,
  });

  var dateYYYYMMDD = getTodayInYYYYMMDD();
  console.log("dateYYYYMMDD:" + dateYYYYMMDD);
  $.post(API_URL + "/notionhelper/api/v1/applycollectionviewfilter", {
    collection_view: $(databaseView)
      .parents(".notion-collection_view-block")
      .children()
      .children(":nth-child(2)")
      .find("a")
      .attr("href"),
    day: dateYYYYMMDD,
  }).done(function (result) {
    // alert("Successful set the filter for this features tasks list");
    const resultJson = JSON.parse(result);
    if (resultJson.status == "Success") {
      GrowlNotification.notify({
        title: "Notion LM Helper",
        description: "Successfully applied filters to GTD tasks view",
        closeTimeout: 5000,
        animation: {
          open: "slide-in",
          close: "slide-out",
        },
        type: "success",
      });
    } else {
      GrowlNotification.notify({
        title: "Notion LM Helper",
        description: "Failed to apply filters to GTD tasks view",
        closeTimeout: 5000,
        animation: {
          open: "slide-in",
          close: "slide-out",
        },
        type: "error",
      });
    }
  });
}

function getDateInYYYYMMDD(date) {
  var dateYYYYMMDD = new Date(
    new Date(date).getTime() - new Date(date).getTimezoneOffset() * 60000
  )
    .toISOString()
    .split("T")[0];
  return dateYYYYMMDD;
}

function getTodayInYYYYMMDD() {
  var dateYYYYMMDD = new Date(
    new Date().getTime() - new Date().getTimezoneOffset() * 60000
  )
    .toISOString()
    .split("T")[0];
  return dateYYYYMMDD;
}

function autoApplyFilterToGtdSessionsView(jNode) {
  var databaseView = jNode[0];
  console.log(
    "collection_view:" +
      $(databaseView)
        .parents(".notion-collection_view-block")
        .children()
        .children(":nth-child(2)")
        .find("a")
        .attr("href")
  );
  console.log(
    "Applying GTD sessions filter to page_url:" + $(location).attr("href")
  );
  GrowlNotification.notify({
    title: "Notion LM Helper",
    description: "Applying filters to GTD sessions view",
    closeTimeout: 5000,
    animation: {
      open: "slide-in",
      close: "slide-out",
    },
    type: "info",
    // showProgress: true,
  });

  var dateYYYYMMDD = new Date(
    new Date().getTime() - new Date().getTimezoneOffset() * 60000
  )
    .toISOString()
    .split("T")[0];
  console.log("dateYYYYMMDD:" + dateYYYYMMDD);
  $.post(API_URL + "/notionhelper/api/v1/applycollectionviewfilter", {
    collection_view: $(databaseView)
      .parents(".notion-collection_view-block")
      .children()
      .children(":nth-child(2)")
      .find("a")
      .attr("href"),
    day: dateYYYYMMDD,
  }).done(function (result) {
    // alert("Successful set the filter for this features tasks list");
    const resultJson = JSON.parse(result);
    if (resultJson.status == "Success") {
      GrowlNotification.notify({
        title: "Notion LM Helper",
        description: "Successfully applied filters to GTD sessions view",
        closeTimeout: 5000,
        animation: {
          open: "slide-in",
          close: "slide-out",
        },
        type: "success",
      });
    } else {
      GrowlNotification.notify({
        title: "Notion LM Helper",
        description: "Failed to apply filters to GTD sessions view",
        closeTimeout: 5000,
        animation: {
          open: "slide-in",
          close: "slide-out",
        },
        type: "error",
      });
    }
  });
}

function openFullScreen(jNode) {
  console.log("Open full screen");
  setTimeout(() => {
    if ($(".notion-peek-renderer").is(":visible")) {
      $(jNode).click();
    }
  }, 2000);
}

$(document).ready(function () {
  $("#plan-form-datepicker").datepicker({
    format: "yyyy-mm-dd",
    multidate: true,
    todayHighlight: true,
    clearBtn: true,
  }); //Listen for the change event on the input

  $("#nh-logged-hrs-worked-on-days").datepicker({
    format: "yyyy-mm-dd",
    multidate: true,
    todayHighlight: true,
    clearBtn: true,
  });

  $("#nh-done-task-completed-date").datepicker({
    format: "yyyy-mm-dd",
    multidate: false,
    todayHighlight: true,
    clearBtn: true,
  });

  $("#nh-done-task-worked-on-days").datepicker({
    format: "yyyy-mm-dd",
    multidate: true,
    todayHighlight: true,
    clearBtn: true,
  });

  $("#nh-done-task-repeat-task").datepicker({
    format: "yyyy-mm-dd",
    multidate: false,
    todayHighlight: true,
    clearBtn: true,
  });

  $("form :input").attr("autocomplete", "off");
});




function addNotionLogHours(jNode) {
  console.log("addNotionLogHours active: Adding Notion Log Hours button");
  var bottomoffset = 450;

  var tempDiv = document.createElement("div");
  //     tempDiv.innerHTML = '<div><input type=button id="loghours-btn" data-text="you clicked loghours btn!" class="loghours-btn" value="Log Hours"/><input type=button id="add-pomo-feature-btn" data-text="you clicked pomo btn!" class="add-pomos-feature" value="Pomo"/></div>';
  // tempDiv.innerHTML =
  //   '<div><input type=button id="loghours-btn" data-text="you clicked loghours btn!" class="loghours-btn" value="Log Hours"/><audio id="pomo-done-alert" src="https://pomofocus.io/audios/alarms/alarm-kitchen.mp3" preload="auto"></audio></div>';

  tempDiv.innerHTML =
    '<button type="button" class="btn btn-primary" id="logHoursBtn" data-toggle="modal" data-target="#logHours" data-whatever="@mdo" href="#">Log Hours</button>';
  bottomoffset = bottomoffset - 60;
  jNode[0].parentNode.parentNode.append(tempDiv);

  $(".loghours-btn").click(function (index, value) {
    console.log($(this).attr("data-text"));
    var taskId = $(location).attr("href").slice(-32);
    //alert(taskId);
    logged_hrs_form.dialog("open");
    $("#nh-logged-hrs-taskid").val(taskId);
  });
}

function generateButton(gIndex) {
  return `<div
    class="btn-group"
    role="group"
    aria-label="Button group with nested dropdown"
  >
    <div class="btn-group" role="group">
      <button
        id="btnGroupDrop1"
        type="button"
        class="btn btn-secondary dropdown-toggle"
        data-toggle="dropdown"
        aria-haspopup="true"
        aria-expanded="false"
      >
        NotionLM
      </button>
      <div class="dropdown-menu" aria-labelledby="btnGroupDrop1">
        <a
          class="dropdown-item"
          id="planTasksBtn"
          data-toggle="modal"
          data-target="#planTasks"
          data-whatever="@mdo"
          data-keyboard="false" 
          data-backdrop="static"
          href="#"
          >Plan</a
        >
        <a
          class="dropdown-item"
          id="logHoursBtn"
          data-toggle="modal"
          data-target="#logHours"
          data-whatever="@mdo"
          href="#"
          >Log hours</a
        >
        <a
          class="dropdown-item"
          id="markDoneBtn"
          data-toggle="modal"
          data-target="#markDone"
          data-whatever="@mdo"
          href="#"
          >Mark Done</a
        >
        <a
          class="dropdown-item"
          id="clearAllBtn"
          data-toggle="modal"
          data-target="#clearAll"
          data-whatever="@mdo"
          href="#"
          >Clear All</a
        >
      </div>
    </div>
  </div>`;
}

// Plan Task modal form
$(`<div
class="modal fade"
id="planTasks"
tabindex="-1"
role="dialog"
aria-labelledby="planTasksLabel"
aria-hidden="true"
data-keyboard="false" 
data-backdrop="static"
>
<div class="modal-dialog" role="document">
  <div class="modal-content">
    <div class="modal-header">
      <h5 class="modal-title" id="planTasksLabel">Plan Tasks!</h5>
      <button
        type="button"
        class="close"
        data-dismiss="modal"
        aria-label="Close"
      >
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <div class="modal-body">
      <form id="plan-form" title="Plan" class="needs-validation" novalidate>
        <div class="form-group">
          <label for="plan-form-taskid" class="col-form-label"
            >TaskIds</label
          >
          <input
            type="text"
            autofocus
            tabindex="0"
            name="plan-form-taskid"
            id="plan-form-taskid"
            value=""
            class="form-control" 
            required
          />
          <div class="invalid-tooltip">
              There should be task ids to plan.
            </div>
        </div>

        <div class="input-group" id="plan">
          <input
            type="text"
            class="form-control"
            name="plan-form-datepicker"
            id="plan-form-datepicker" 
            required
          />
          <div class="invalid-tooltip">
              Need plan dates
            </div>

          <div class="input-group-append has-validation">
            <select class="custom-select" name="plan" id="plan" required>
              <option value="" selected>Plan...</option>
              <option value="This day">This day</option>
              <option value="This week">This week</option>
              <option value="This month">This month</option>
            </select>
            
            <select
              class="custom-select"
              name="plan-priority"
              id="plan-priority"
              required
            >
              <option value="" selected>Priority...</option>
              <option value="P1 🔥">P1 🔥</option>
              <option value="P2">P2</option>
              <option value="P3">P3</option>
            </select>
            <div class="invalid-tooltip">
              Valid Plan/Priority required.
            </div>
          </div>
        </div>
      </form>
    </div>
    <div class="modal-footer">
      <button
        type="button"
        class="btn btn-secondary"
        data-dismiss="modal"
        id="plan-form-close"
      >
        Close
      </button>
      <button type="submit" class="btn btn-primary">Plan!</button>
    </div>
  </div>
</div>
</div>`).appendTo("body");

//Log Hours modal form code
$(`    <div
class="modal fade"
id="logHours"
tabindex="-1"
role="dialog"
aria-labelledby="logHoursLabel"
aria-hidden="true"
>
<div class="modal-dialog" role="document">
  <div class="modal-content">
    <div class="modal-header">
      <h5 class="modal-title" id="logHoursLabel">Log Hours!</h5>
      <button
        type="button"
        class="close"
        data-dismiss="modal"
        aria-label="Close"
      >
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <div class="modal-body">
      <form id="nh-logged-hrs-form" title="Log Hours" class="needs-validation" novalidate>
        <!-- Task Ids -->
        <div class="form-group">
          <label for="nh-logged-hrs-taskid" class="col-form-label"
            >TaskIds</label
          >
          <input
            type="text"
            name="nh-logged-hrs-taskid"
            id="nh-logged-hrs-taskid"
            value=""
            class="form-control"
            required
          />
          <div class="invalid-tooltip">
              There should be task ids to log hours!
            </div>
        </div>

        <!-- Title -->
        <div class="form-group">
          <div class="input-group">
            <div class="input-group-prepend">
              <span class="input-group-text" id=""
                >Title</span
              >
            </div>
            <input
              type="text"
              name="nh-logged-hrs-title"
              id="nh-logged-hrs-title"
              value="Working on Tasks"
              class="form-control"
              required
            />
            <div class="invalid-tooltip">
              Enter suitable title!
            </div>
          </div>
        </div>
        <div class="form-group">
          <div class="input-group">
            <div class="input-group-prepend">
              <span class="input-group-text" id=""
                >Worked days/hrs</span
              >
            </div>
            <input
              type="text"
              class="form-control"
              name="nh-logged-hrs-worked-on-days"
              id="nh-logged-hrs-worked-on-days"
              placeholder="Select dates"
              required
            />
            <input
              type="text"
              class="form-control"
              name="nh-logged-hrs-log-hrs"
              id="nh-logged-hrs-log-hrs"
              placeholder="Enter hrs"
              required
            />
            <div class="invalid-tooltip">
              Dates/hrs required.
            </div>
          </div>
        </div>
        
      </form>
    </div>
    <div class="modal-footer">
      <button
        type="button"
        class="btn btn-secondary"
        data-dismiss="modal"
      >
        Close
      </button>
      <button type="button" class="btn btn-primary">Log Hours!</button>
    </div>
  </div>
</div>
</div>`).appendTo("body");

//Mark done modal form code
$(`    <div
class="modal fade"
id="markDone"
tabindex="-1"
role="dialog"
aria-labelledby="markDoneLabel"
aria-hidden="true"
>
<div class="modal-dialog" role="document">
  <div class="modal-content">
    <div class="modal-header">
      <h5 class="modal-title" id="markDoneLabel">Done!</h5>
      <button
        type="button"
        class="close"
        data-dismiss="modal"
        aria-label="Close"
      >
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <div class="modal-body">
      <form id="nh-done-task-form" title="Completed Tasks" class="needs-validation" novalidate>
        <!-- Task Ids -->
        <div class="form-group">
          <label for="nh-done-task-taskid" class="col-form-label"
            >TaskIds</label
          >
          <input
            type="text"
            name="nh-done-task-taskid" id="nh-done-task-taskid"
            value=""
            class="form-control"
            required
          />
          <div class="invalid-tooltip">
              There should be task/s to mark done!
            </div>
        </div>

        <!-- Title -->
        <div class="form-group">
          <div class="input-group">
            <div class="input-group-prepend">
              <span class="input-group-text" id=""
                >Title</span
              >
            </div>
            <input
              type="text"
              name="nh-done-task-title" id="nh-done-task-title"
              value="Working on Tasks"
              class="form-control"
              required
            />
            <div class="invalid-tooltip">
              Describe your task!
            </div>
            <div class="input-group-append has-validation">
            
            
              <select
                class="custom-select"
                name="nh-done-task-plan-priority"
                id="nh-done-task-plan-priority"

              >
                <option value="" selected>Priority...</option>
                <option value="P1 🔥">P1 🔥</option>
                <option value="P2">P2</option>
                <option value="P3">P3</option>
              </select>
             
            </div>
          </div>

          
        </div>

        <!-- Completed/Worked dates -->
        <div class="form-group">
          <div class="input-group">
            <div class="input-group-prepend">
              <span class="input-group-text" id=""
                >Completed On</span
              >
            </div>
            <input
              type="text"
              class="form-control"
              name="nh-done-task-completed-date" id="nh-done-task-completed-date"
              placeholder="Select dates"
              required
            />
            <div class="invalid-tooltip">
             Which day did you complete the task/s?
            </div>
          </div>
        </div>

        <!-- Worked dates -->
        <div class="form-group">
            <div class="input-group">
              <div class="input-group-prepend">
                <span class="input-group-text" id=""
                  >Worked On</span
                >
              </div>
              
              <input
                type="text"
                class="form-control"
                name="nh-done-task-worked-on-days" 
                id="nh-done-task-worked-on-days"
                placeholder="Select dates"
              />
            </div>
          </div>

        <!-- Hours -->
        <div class="form-group">
            <div class="input-group">
              <div class="input-group-prepend">
                <span class="input-group-text" id=""
                  >Hours spent</span
                >
              </div>
              <input
                type="text"
                name="nh-done-task-log-hrs"
                value=""
                class="form-control"                
              />
            </div>
          </div>

          <!-- Repeat task -->
        <div class="form-group">
            <div class="input-group">
              <div class="input-group-prepend">
                <span class="input-group-text" id=""
                  >Repeat</span
                >
              </div>
              <input
                type="text"
                name="nh-done-task-repeat-task" id="nh-done-task-repeat-task"
                value=""
                class="form-control"
              />
            </div>
          </div>
        
      </form>
    </div>
    <div class="modal-footer">
      <button
        type="button"
        class="btn btn-secondary"
        data-dismiss="modal"
      >
        Close
      </button>
      <button type="button" class="btn btn-primary">Mark done!</button>
    </div>
  </div>
</div>
</div>`).appendTo("body");

$(document).on("keydown", "input", function (e) {
  // you can reference the event target
  console.log(e.target.id);

  // you can reference the event's current target
  console.log(e.currentTarget.value);
  if (
    e.keyCode == 37 || //handle left arrow
    e.keyCode == 38 || //handle up arrow
    e.keyCode == 39 || //handle right arrow
    e.keyCode == 40 || //handle down arrow
    e.keyCode == 8 || //handle backspace
    e.keyCode == 96 || //handle delete
    (e.ctrlKey && e.key === "a") || //handle ctrl+a - Windows
    (e.metaKey && e.key === "a") //handle cmd+a - Mac
  ) {
    e.stopPropagation();
    return true;
  }
});

function sortDates(dates) {
  return dates.split(",").sort();
}

$("#planTasks")
  .on("show.bs.modal", function (event) {
    // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
    // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
    var modal = $(this);

    // console.log("Registered click on Plan");
    var taskids = ""; //recreate tasks
    $(".multi-ind-checkbox").each(function () {
      if ($(this).prop("checked") == true) {
        taskids = taskids + $(this).attr("data-text") + ",";
      }
    });

    $("#plan-form-taskid").val(taskids);

    //   modal.find('.btn-secondary').click();
    // modal.find('.modal-body input').val(recipient)
  })
  .on("hidden.bs.modal", function (e) {
    $("#plan-form").trigger("reset");
    $("#plan-form-datepicker").datepicker("clearDates");
    $("#plan-form").get(0).classList.remove("was-validated");
  })
  .find(".btn-primary")
  .on("click", function (event) {
    var valid = true;
    if (!$("#plan-form").get(0).checkValidity()) {
      valid = false;
    }
    $("#plan-form").get(0).classList.add("was-validated");

    if (valid) {
      console.log("sorting dates before submitting");
      $("#plan-form-datepicker").val(
        sortDates($("#plan-form-datepicker").val())
      );
      var data = $("#plan-form").serialize();
      GrowlNotification.notify({
        title: "Notion LM: Plan tasks",
        description: "Posting PlanTask: " + data,
        animation: {
          open: "slide-in",
          close: "slide-out",
        },
        type: "info",
        closeTimeout: 5000,
      });

      $.post(API_URL + "/notionhelper/api/v1/plantask", data).done(function (
        result
      ) {
        const resultJson = JSON.parse(result);
        if (resultJson.status == "Success") {
          $(".multi-ind-checkbox").each(function () {
            if ($(this).prop("checked") == true) {
              $(this).prop("checked", false);
            }
          });
          // alert("Successful confirmation PlanTask: " + data);

          GrowlNotification.notify({
            title: "Notion LM: Plan tasks",
            description:
              "Successful planned tasks: " + resultJson.statusMessage,
            animation: {
              open: "slide-in",
              close: "slide-out",
            },
            type: "success",
            closeTimeout: 5000,
          });
          console.log("Now hiding the form");
          $("#planTasks").modal("hide");
        } else {
          GrowlNotification.notify({
            title: "Notion LM: Plan tasks",
            description: "Failed to plan tasks: " + resultJson.statusMessage,
            animation: {
              open: "slide-in",
              close: "slide-out",
            },
            type: "error",
            closeTimeout: 5000,
          });
        }
      });
    }
    // return valid;
  });

$("#logHours")
  .on("show.bs.modal", function (event) {
    var modal = $(this);

    console.log("Registered click on LogHours");
    var taskids = ""; //recreate tasks
    $(".multi-ind-checkbox").each(function () {
      if ($(this).prop("checked") == true) {
        taskids = taskids + $(this).attr("data-text") + ",";
      }
    });

    $("#nh-logged-hrs-taskid").val(taskids);
  })
  .on("hidden.bs.modal", function (e) {
    $("#nh-logged-hrs-form").trigger("reset");
    $("#nh-logged-hrs-worked-on-days").datepicker("clearDates");
    $("#nh-logged-hrs-form").get(0).classList.remove("was-validated");
  })
  .find(".btn-primary")
  .on("click", function () {
    var valid = true;
    if (!$("#nh-logged-hrs-form").get(0).checkValidity()) {
      valid = false;
    }
    $("#nh-logged-hrs-form").get(0).classList.add("was-validated");
    if (valid) {
      console.log("sorting dates before submitting");
      $("#nh-logged-hrs-worked-on-days").val(
        sortDates($("#nh-logged-hrs-worked-on-days").val())
      );
      var data = $("#nh-logged-hrs-form").serialize();
      // alert(data);
      GrowlNotification.notify({
        title: "Notion LM: Log Hours to tasks",
        description: "Posting LogHours: " + data,
        animation: {
          open: "slide-in",
          close: "slide-out",
        },
        type: "info",
        closeTimeout: 5000,
      });
      $.post(API_URL + "/notionhelper/api/v1/loghours", data).done(function (
        result
      ) {
        const resultJson = JSON.parse(result);
        if (resultJson.status == "Success") {
          $(".multi-ind-checkbox").each(function () {
            if ($(this).prop("checked") == true) {
              $(this).prop("checked", false);
            }
          });
          // alert("Successful confirmation: " + data);
          GrowlNotification.notify({
            title: "Notion LM: Logged Hours to tasks",
            description:
              "Successfully logged hours to tasks: " + resultJson.statusMessage,
            animation: {
              open: "slide-in",
              close: "slide-out",
            },
            type: "success",
            closeTimeout: 5000,
          });

          $("#logHours").modal("hide");
        } else {
          GrowlNotification.notify({
            title: "Notion LM: Logged Hours to tasks",
            description:
              "Error logging hours to tasks: " + resultJson.statusMessage,
            animation: {
              open: "slide-in",
              close: "slide-out",
            },
            type: "error",
            closeTimeout: 5000,
          });
        }
      });
    }
    // return valid;
  });

$("#markDone")
  .on("show.bs.modal", function (event) {
    var modal = $(this);

    console.log("Registered click on 'Mark Done'");
    var taskids = ""; //recreate tasks
    $(".multi-ind-checkbox").each(function () {
      if ($(this).prop("checked") == true) {
        taskids = taskids + $(this).attr("data-text") + ",";
      }
    });

    $("#nh-done-task-taskid").val(taskids);
  })
  .on("hidden.bs.modal", function (e) {
    $("#nh-done-task-form").trigger("reset");
    $("#nh-done-task-completed-date").datepicker("clearDates");
    $("#nh-done-task-worked-on-days").datepicker("clearDates");
    $("#nh-done-task-repeat-task").datepicker("clearDates");
    $("#nh-done-task-form").get(0).classList.remove("was-validated");
  })
  .find(".btn-primary")
  .on("click", function () {
    var valid = true;
    if (!$("#nh-done-task-form").get(0).checkValidity()) {
      valid = false;
    }
    $("#nh-done-task-form").get(0).classList.add("was-validated");
    if (valid) {
      console.log("sorting dates before submitting");
      $("#nh-done-task-worked-on-days").val(
        sortDates($("#nh-done-task-worked-on-days").val())
      );
      var data = $("#nh-done-task-form").serialize();
      // alert(data);
      GrowlNotification.notify({
        title: "Notion LM: Complete tasks",
        description: "Marking tasks to complete: " + data,
        animation: {
          open: "slide-in",
          close: "slide-out",
        },
        type: "info",
        closeTimeout: 5000,
      });
      $.post(API_URL + "/notionhelper/api/v1/completetask", data).done(
        function (result) {
          GrowlNotification.notify({
            title: "Notion LM: Complete tasks",
            description: "Marking tasks to complete: " + data,
            animation: {
              open: "slide-in",
              close: "slide-out",
            },
            type: "info",
            closeTimeout: 0,
            showButtons: true,
            buttons: {
              action: {
                text: "Ok",
                callback: function () {
                  text = "You pressed OK!";
                  $.post(
                    API_URL + "/notionhelper/api/v1/loghoursCompletedTask",
                    data
                  ).done(function (result) {
                    //read the json data
                    const resultJson = JSON.parse(result);
                    if ((resultJson.status = "Success")) {
                      $(".multi-ind-checkbox").each(function () {
                        if ($(this).prop("checked") == true) {
                          $(this).prop("checked", false);
                        }
                      });
                      // alert("Successful confirmation LogHours: " + data);
                      GrowlNotification.notify({
                        title: "Notion LM: Complete tasks",
                        description:
                          "Successfully marked tasks completed: " +
                          resultJson.statusMessage,
                        animation: {
                          open: "slide-in",
                          close: "slide-out",
                        },
                        type: "success",
                        closeTimeout: 5000,
                      });
                    } else {
                      GrowlNotification.notify({
                        title: "Notion LM: Complete tasks",
                        description:
                          "Error marking tasks completed: " +
                          resultJson.statusMessage,
                        animation: {
                          open: "slide-in",
                          close: "slide-out",
                        },
                        type: "error",
                        closeTimeout: 5000,
                      });
                    }
                  });
                }, // callback
              },
              cancel: {
                text: "Cancel",
                callback: function () {
                  text = "You canceled!";
                  $(".multi-ind-checkbox").each(function () {
                    if ($(this).prop("checked") == true) {
                      $(this).prop("checked", false);
                    }
                  });
                }, // callback
              },
            },
          });

          $("#markDone").modal("hide");
        }
      );
    }
  });

$("#clearAllBtn")
  .find(".btn-primary")
  .on("click", function () {
    $(".multi-ind-checkbox").each(function () {
      if ($(this).prop("checked") == true) {
        $(this).prop("checked", false);
      }
    });
  });

const waitFor = (...selectors) =>
  new Promise((resolve) => {
    const delay = 500;
    const f = () => {
      const elements = selectors.map((selector) =>
        document.querySelector(selector)
      );
      if (elements.every((element) => element != null)) {
        resolve(elements);
      } else {
        setTimeout(f, delay);
      }
    };
    f();
  });
