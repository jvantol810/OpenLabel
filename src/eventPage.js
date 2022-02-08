const browser = require('webextension-polyfill');

//This function simply calls the browser contextmenu API to create the contextmenu button.
function createTLContextMenu(){
    browser.contextMenus.create({
        "id": "ToggleLabel",
        "title": "ToggleLabel",
        "contexts": ["link"] //There are multiple options here, I(Noah) went with the one that only appears for link items.
    });
}

//This may be unnecessary, the goal of this listener is to initialize the context menu
//It would be helpful to have if the default method is this one.
browser.runtime.onInstalled.addListener(function() {
    createTLContextMenu();
    //Set a default value for the label display type
    browser.storage.sync.set({
        labelType: 0
    });
})

//This listener function waits to recieve word to create or destroy the context menu button.
//Potentially, we could have it check the data itself, currently it trusts that options.js tells it the right information.
browser.runtime.onMessage.addListener(function(request, sender, sendResponse){
    if(request.todo == "ToggleContextMenu"){
        console.log("Will determine if ContextMenu should exist");
        if(request.labelType == "1"){
            console.log("It should exist");
            createTLContextMenu();
        }
        else
        {
            console.log("It should not exist");
            //Should add a boolean to mark if it's removed?
            //An error is generated if the context menu button no longer exists, but does not completely halt the plugin.
            browser.contextMenus.remove("ToggleLabel");
        }
    }
})

//When we click on the context menu button, we figure out which active tab the user is in,
//and sends a message to content.js with the url of the link the context menu button was used on.
browser.contextMenus.onClicked.addListener(function(clickData){
    if(clickData.menuItemId == "ToggleLabel")
    {
        console.log("Clicked the Context Menu Item!");
        console.log(clickData.linkUrl);
        /*
        browser.tabs.query({active:true,currentWindow: true}, function(tabs){
            console.log("Sending message to active tab.")
            browser.tabs.sendMessage(tabs[0].id, {todo: "AddLabel", findthisurl: clickData.linkUrl});
        });*/
        browser.tabs.query({active:true, currentWindow: true}).then((tabs) => {
            browser.tabs.sendMessage(tabs[0].id, {todo: "AddLabel", findthisurl: clickData.linkUrl});
        }
        )
    }
})

/*
fetch('http://opener.olery.com/language-identifier')
    .then(function(response) {
        console.log("Got a response");
    })
    .catch(function(error){
        console.log("Got error: ", error);
    })
    */
//    .then(data => console.log(data));