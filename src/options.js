const browser = require('webextension-polyfill');

let theform;

function loadSettings() {
    theform.reset();
    browser.storage.sync.get('labelType').then((type) => {
        if(type) {
            let radio = document.getElementById("labelType" + type.labelType);
            if(radio) radio.checked = true;
        }
    })
}

function saveSettings() {
    let data = new FormData(theform);
    console.log(data.get("labelType"));
    browser.storage.sync.set({
        labelType: data.get("labelType")
    });
}

window.addEventListener("DOMContentLoaded", function(){
    theform = document.querySelector("form");
    loadSettings();
    
    document.getElementById("saveButton").addEventListener("click", () => {
        saveSettings();
    });
    document.getElementById("undoButton").addEventListener("click", () => {
        loadSettings();
    });
    document.getElementById("resetButton").addEventListener("click", () => {
        theform.reset();
        saveSettings();
    });
})

