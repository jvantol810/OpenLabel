const browser = require('webextension-polyfill');

let id_ctr = 0;

function HoverLabelling(){
    //gcards will be an array of all html elements tagged as "g-card"
    const gcards = document.getElementsByTagName("g-card")
    //newsLink will be used as an array for the links inside of each g-card.
    let newsLinks = []
    //highlightedLink is used to prevent excessive function calls.
    let highlightedLink = "No Link"
    let currentFakeNewsPanel = 0;
    let onLink = false;
    let onPanel = false;
    for(let {link, element, position} of getLabelLinks()) {//Iterate through each g-card
        newsLinks.push(link);
        const nlhref = link.href //nlhref = the url for the link
        //We add an event to each link, when the mouse enters the element
        link.parentElement.addEventListener('mouseenter', () => {
            //If the url does not match the link we already highlighted:
            if(nlhref != highlightedLink) {
                mouseEnteredLink(nlhref)
                addLabelAfter(link, element, position);
            }
            
        })
        //We add an event to each link when the mouse leaves the elemnt.
        link.parentElement.addEventListener('mouseleave', () => {
            //If the function is called on the link we currently highlighted:
            if(nlhref == highlightedLink) {
                mouseExitedLink(nlhref)
                removeElementsByClass("fakeNewsPanel")
                //The image inserted was given the id tag "hoverel", which we can simply find and remove.
            }
        })
        //console.log(newsLinks[i].href)
    }

    //Sets the highlightedlink to link (Not too important in this situation)
    function mouseEnteredLink(link){
        highlightedLink = link
        onLink = true;
        console.log("Mouse entered link.")
        //console.log("Mouse Hovering Over: " + highlightedLink)
        //window.open("popup.html", "extension_popup", "width=300,height=400,status=no,scrollbars=yes,resizable=no");
    }

    //Sets the highlightedlink to a base value (Not too important in this situation)
    function mouseExitedLink(link){
        highlightedLink = "No Link"
        onLink = false;
        console.log("Mouse exited link.")
        if(!onPanel){
            //removeElementsByClass("fakeNewsPanel")
        }
    }
    /*
    function mouseEnteredPanel(){
        onPanel = true;
        console.log("Mouse entered panel.")
    }
    
    function mouseExitedPanel(link){
        onPanel = false;
        if(!onLink){
            removeElementsByClass("fakeNewsPanel")
        }
    }
    */
}

function removeElementsByClass(className){
    var elements = document.getElementsByClassName(className);
    while(elements.length > 0){
        elements[0].parentNode.removeChild(elements[0]);
    }
}

function AutomaticLabelling(){
    for(let {link, element, position} of getLabelLinks()){
        addLabelAfter(link, element, position);
    }
}

let toggledLabels = [];

browser.runtime.onMessage.addListener(function(request, sender, sendResponse){
    if(request.todo == "AddLabel"){
        console.log("Message Received. Adding Label");
        console.log(request.findthisurl);
        let links = document.getElementsByTagName("a")
        for(let i = 0; i < links.length; i++){
            if(links[i].href == request.findthisurl){
                if(toggledLabels[request.findthisurl] == true){
                    console.log("Disabling context label");
                    let label = links[i].parentElement.parentElement.getElementsByClassName("fakeNewsPanel")
                    label[0].parentNode.removeChild(label[0]);
                    toggledLabels[request.findthisurl] = false;
                }
                else
                {
                    console.log("Adding context label");
                    addLabelAfter(links[i]);
                    toggledLabels[request.findthisurl] = true;
                }
                //console.log(toggledLabels[request.findthisurl]);
            }
        }
    }
});

function getLabelLinks() {
    let links = [];
    // Figure out which links to put labels on
    for(let gcard of document.querySelectorAll('g-card, g-inner-card')) {
        for(let link of gcard.getElementsByTagName('a')) {
            links.push({link});
        }
    }

    // Put positioning information on any links that don't have it.
    for(let link of links) {
        if(!link.position) link.position = "afterbegin";
        if(!link.element) {
            if(link.link.parentElement.getElementsByTagName("a").length == 1) {
                link.element = link.link.parentElement;
            } else {
                link.element = link.link;
            }
        }
    }

    return links;
}

function addLabelAfter(link, element = link, position = "afterbegin") {
    //element = link.getElementByTagName('div');
    console.log(element);
    let nlhref = link.href;
    let id = "fakeNewsPanel" + ++id_ctr;

    fetch('http://localhost:3000/label/' + nlhref).then(async response => {
        let json = await response.json();
        let elem = document.getElementById(id);
        if(elem) {
            elem.querySelector('.fakeNewsPanelContent').style.display = "inherit";
            elem.querySelector('.fakeNewsPanelLoading').style.display = "none";

            // Populate panel with data from label JSON

            let emotion = elem.querySelector('.fakeNewsEmotion');
            let sentimentDescription = "Neutral";
            if(json.sentiment_score < -50) {
                sentimentDescription = "Overwhelmingly Negative";
            } else if(json.sentiment_score < -10) {
                sentimentDescription = "Negative";
            } else if(json.sentiment_score > 50) {
                sentimentDescription = "Overwhelmingly Positive";
            } else if(json.sentiment_score > 10) {
                sentimentDescription = "Positive";
            }
            emotion.textContent = `${sentimentDescription} (${json.sentiment_score})`;
        }
    }).catch(err => {
        console.error(err);
        let elem = document.getElementById(id);
        if(elem) {
            elem.querySelector('.fakeNewsPanelError').style.display = "inherit";
            elem.querySelector('.fakeNewsPanelLoading').style.display = "none";
        }
    });
    
    // Insert stylesheet if it doesn't exist
    if(!document.getElementById('fakeNewsStyle')) {
        document.head.insertAdjacentHTML('beforebegin', `
        <style id="fakeNewsStyle">
        .fakeNewsPanel{
            position: relative; /* Stay in place */
            float: right;
            display: inline-block;
            z-index: 1; /* Sit on top */
            left: 0;
            top: 0;
            width: 250px; /* Full width */
            height: 50%; /* Full height */
            overflow: auto; /* Enable scroll if needed */
            border: solid 1px;
        }
        .fakeNewsPanel .articleTitle{
            margin-left: 10%;
            font-size: 2em;
        }
        .fakeNewsPanel .informationList{
            list-style-type: none;
            font-weight: bold;
        }
        .fakeNewsPanel .symbol {
            position: absolute;
            top: 1px;
            right: 10px;
            font-size: 2em;
        }
        </style>`);
    }
    //Commented out label portions:
    /*
    <h1 class="articleTitle">Article Title</h1>
            <div> <ul class="informationList">
                <li>Title:</li>
                <li>Author:</li>
    */
    element.insertAdjacentHTML(position, `
    <div class="fakeNewsPanel" id="${id}">
        <div class='fakeNewsPanelContent' style='display: none'>
            <div> <ul class="informationList">
                <li>Fact: </li>
                <li>Opinion: </li>
                <li>Emotion: <span class='fakeNewsEmotion'></span></li>
                <li>Authority: </li>
                <li>Viral: </li>
                <li>Topicality: </li>
                <li>Reading Level: </li>
                <li>Technicality: </li>
            </ul> </div>
            <p class="symbol">&#x2705;</p>
        </div>
        <div class='fakeNewsPanelLoading'>
            Loading...
        </div>
        <div class='fakeNewsPanelError' style='display:none'>
            An error has occured
        </div>
    </div>`);
}

browser.storage.sync.get('labelType').then((type) => {
    console.log(type.labelType);
    if(type.labelType == "0") {
        HoverLabelling();
    }
    else if(type.labelType == "3"){
        AutomaticLabelling();
    }
});
