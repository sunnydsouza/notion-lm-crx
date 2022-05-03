# notion-lm-crx
A chrome extension which works with notion-lm-api to achieve automation in Notion workspace.


**PLEASE NOTE** - this doesnt work standalone and **WILL NEED** the [notion-lm-api](https://github.com/sunnydsouza/notion-lm-api) to be deployed on a suitable environment. 
Also, the automations with this extension, **ONLY** works on [Sunny's Notion LifeManagement(LM) templates](https://www.notion.so/Templates-a73384cbb11a45bdac0af6d04085bb62)

This is a chrome extension which works alongside the Notion LM Api (designed in Python Flask). There is also a version of this which works as a tampermonkey script. 

This is basically the improvized version over version 1. Please view the screenshots and documention below

### Installation instructions

Go to the release section to download a release as zip

```java
https://github.com/sunnydsouza/notion-lm-crx/releases/
```

Else, simply clone the project in a local directory

```java
git clone https://github.com/sunnydsouza/notion-lm-crx.git
```

**IMPORTANT NOTE**
In case you are using V1.0.0 or V2.0.0, then you need to manually specify the endpoint where [notion-lm-api](https://github.com/sunnydsouza/notion-lm-api) is deployed in the `content.bundle.js` file

```java
// Change the below url based on where you deploy notion-lm-api
let API_URL="https://192.168.0.128:8200"; 
```

Once downloaded to a local directory, open the chrome extensions menu and enable **developer mode**

Select the `Load unpacked` options and then select the directory where you cloned the project.

On successful load, you should be able to see the extension loaded as below 🥳

![extension](docs/images/v1.0.0/screenshot10.png)

### *Whats does the extension do?*

Basically, the extension dynamically adds  options (in form of buttons) on feature task pages/ Idea task list/ GTD pages sub tasks pages. The extension is basically to help manage tasks by providing the below options

### Improvements in version > V2.0.0
- All forms are now migrated from JQueryUI to Bootstrap. They are much more compact, refined and has a elegant polished look
- Automation forms now include robust validations (Check screenshots below)
- Beatiful notifications on status of automations (Growl notifications)

## How and where is the extension option shown
The extension dynamically adds a dropdown menu wherever the notion view name matches keywords like "This features task list"/"This idea task list"/ "Todays task"/"GTD Sessions"

![extension menu](docs/images/v2.0.0/screenshot1.png)

**Also** for the extension to work, you would need a checkbox property with name `SNH` as the database property

![extension menu](docs/images/v2.0.0/screenshot14.png)

You should check the required tasks before using the `Notion LM` dropdown options.

## Plan
- Ability to select multiple tasks and plan them on selected day/week/month

- Ability to priortize tasks

![Plan form validations](docs/images/v2.0.0/screenshot13.png)

![Plan form date picker](docs/images/v2.0.0/screenshot12.png)

![Plan form successful validation](docs/images/v2.0.0/screenshot11.png)

![Plan form growl notification](docs/images/v2.0.0/screenshot10.png)

## LogHours
Ability to log hours against single or multiple tasks at once. 

If multiple tasks are selected and multiple dates are selected in “Worked on dates”, then in that case, the hours are **equally** distributed across multiple tasks and dates

eg: if 2 tasks are selected and you have worked on both for 2 days, and the hours logged in “Log Hours” field is 10, then hours logged across each task would be 10/2*2=2.5/each day

![Log hours](docs/images/v2.0.0/screenshot9.png)

![Log hours](docs/images/v2.0.0/screenshot8.png)

## MarkDone
You can *ONLY* put in one “Completed Date” (obvious) but can select multiple “Worked on dates”, as you could have worked on the tasks for say, a week or so.

The principle of logged hours remains same here - if 2 tasks are selected and you have worked on both for 2 days, and the hours logged in “Log Hours” field is 10, then hours logged across each task would be 10/2*2=2.5/each day

![Mark done](docs/images/v2.0.0/screenshot7.png)

![Mark done](docs/images/v2.0.0/screenshot6.png)

Logging hours could be optional as you might just want to mark the task complete. You get an option to choose to log hours or cancel the same.
![Mark done](docs/images/v2.0.0/screenshot5.png)

![Mark done success notification](docs/images/v2.0.0/screenshot4.png)

## ClearAll
This simply unchecks all checkboxes in `SNH` column/property


- Below are the features migrated from **verison 1**
    - Ability to perform operations on multiple tasks together
    - Marking task/tasks done(which automatically adds the completed date/week/month/year properties)
    - Log hours against task/tasks or mark them completed together
    - Plan task/tasks to a date/month/week
    - Auto add filters to feature task page, so that when tasks are added to the filtered database, most mandatory fields/properties are already filled in
    



<details>
  <summary><span style="font-size: 21px">Version 1 (Old, deprecated)</span></summary>
  
### Options dynamically added on feature page, when the extension is active

![Untitled](docs/images/v1.0.0/screenshot1.png)

## Plan

Ability to select multiple tasks and plan them on day/week/month

Ability to priortize tasks

![Untitled](docs/images/v1.0.0/screenshot3.png)

## Log Hours

Ability to log hours against single or multiple tasks at once. 

If multiple tasks are selected and multiple dates are selected in “Worked on dates”, then in that case, the hours are **equally** distributed across multiple tasks and dates

eg: if 2 tasks are selected and you have worked on both for 2 days, and the hours logged in “Log Hours” field is 10, then hours logged across each task would be 10/2*2=2.5/each day
![Untitled](docs/images/v1.0.0/screenshot4.png)

![Untitled](docs/images/v1.0.0/screenshot5.png)

## Mark task/tasks as ‘Done’

You can *ONLY* put in one “Completed Date” (obvious) but can select multiple “Worked on dates”, as you could have worked on the tasks for say, a week or so.

The principle of logged hours remains same here - if 2 tasks are selected and you have worked on both for 2 days, and the hours logged in “Log Hours” field is 10, then hours logged across each task would be 10/2*2=2.5/each day

![Untitled](docs/images/v1.0.0/screenshot6.png)

</details>