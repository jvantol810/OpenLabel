//node-fetch and jsdom: works very similar to how we originally planned to fetch websites
// through a chrome extension.

const fetch = require('node-fetch');
const jsdom = require("jsdom");
const Sentiment = require('sentiment');
const sentiment = new Sentiment();
const DbService = require('./dbService');
const db = DbService.getDbServiceInstance();
const util = require('util');
const { categories } = require('./labelCategories');

const { JSDOM } = jsdom;

/**
 * @name getArticleText
 * @description returns text from webpage retrieved from URL. queryFilter is the HTML tags to filter relevant text from (i.e. "#body-text").
 * @param {string} url
 * @param {string} queryFilter
 * @returns {string} the text filtered from the webpage's body
*/
async function getArticleText(url) {
    //Fetch the article based on the url
    const response = await fetch(url);
    const body = await response.text();

    //Create a JSDOM to be able to query specific HTML tags
    const dom = new JSDOM(body);
    const bodyText = dom.window.document.querySelector("body");
    let articleText = bodyText.querySelectorAll("article");
    let compiledArticleText = "";
    //Concatenate relevant tags
    for(let i = 0; i < articleText.length; i++)
    {
        compiledArticleText += "\n" + articleText[i].textContent;
    }
    console.log(compiledArticleText);
    //Stringify the results and return them
    compiledArticleText = JSON.stringify(compiledArticleText);
    return compiledArticleText;
}

/**
 * @name generateLabelJSON
 * @param {string} text Put the article text here
 *
 * @returns {labelJSON} a JSON object describing the label data
 */
 async function generateLabelJSON(text, url, category) {
     console.log("Category: " + JSON.stringify(category));
     //Check the label category and generate the appropriate data
     if(category === categories.sentimentCategory) {
         console.log("Sentiment category detected.");
     }
    const sentimentAnalysis = sentiment.analyze(text);
    const labelJSON = {
        url: url,
        sentiment_score: sentimentAnalysis.score,
    }
    console.log(labelJSON);
    return labelJSON;
}

/**
 * @name getLabel
 * @description Checks to see if a label already exists in the database for given url. If it does, returns it in JSON. Otherwise, generate the label, post it to the db, then return it.
 * @param {string} givenUrl The url to the article.
 * 
 * @returns {JSON} Returns the JSON for the label, whether retrieved from database or constructed in the function itself.
 */
 async function getLabel(givenUrl) {
    //First, check if label exists in db.
    let getLabelRequest;
    try {
        getLabelRequest = await db.getLabel(givenUrl);
    }
    catch(err) {}
    
    //If the label was found inside db, return it.
    if(getLabelRequest?.success === true){
        console.log("Label found in database: " + JSON.stringify(getLabelRequest.labelJSON))
        return getLabelRequest.labelJSON;
    }
    //If the label was not found inside the db, post it to the db and then return it.
    else{
        console.log("Label not found in database. Generating label.")
        const articleText = await getArticleText(givenUrl);
        const labelJSON = await generateLabelJSON(articleText, givenUrl, categories.sentimentCategory);
        console.log("Label generated and being posted to database: " + JSON.stringify(labelJSON));
        db.postData(givenUrl, labelJSON);
        return labelJSON;
    }
}

module.exports = { getLabel };

