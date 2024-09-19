// ==UserScript==
// @name         Jira Points
// @description  Show total amount of points per user in JIRA
// @namespace    https://github.com/mariogarridopt/
// @homepageURL  https://github.com/mariogarridopt/
// @supportURL   https://github.com/mariogarridopt/jira-score-points-script/issues
// @author       Mario Garrido
// @match        https://jira.tuigroup.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tuigroup.com
// @grant        none
// @version      1
// @downloadURL  https://github.com/mariogarridopt/jira-score-points-script/raw/master/jira.user.js
// @updateURL    https://github.com/mariogarridopt/jira-score-points-script/raw/master/jira.meta.js
// ==/UserScript==

// Github:       https://github.com/mariogarridopt/

(function(document) {
    'use strict';

    function identifyTheUsers() {
        const excludedNames = [
            "users admin [on/off boarding]",
            "notreadytostart",
            "only my issues",
            "readytostart",
            "security",
            "recently updated",
            "… show fewer"
        ];
        const filterList = document.querySelectorAll("#js-work-quickfilters > dd > a");
        var users = {}

        for (let i = 0; i < filterList.length; i++) {
            var name = filterList[i].innerText.toLowerCase();
            
            if (excludedNames.includes(name)) {
                continue;
            }

            users[name] = {
                index: i + 2,
                donepoints: 0,
                allpoints: 0
            };
        }

        return users
    }

    function displayPoints(usersData) {
        for (const name in usersData) {
            document.querySelector("#js-work-quickfilters > dd:nth-child(" + usersData[name].index + ") > a").innerHTML += " (" + usersData[name].donepoints + "/" + usersData[name].allpoints + ")";
        }
    }

    function sumDonePoints(usersData) {
        const cards = document.querySelectorAll("#ghx-pool > div.ghx-swimlane > ul > li:nth-child(4) .js-issue");

        for (let i = 0; i < cards.length; i++) {
            const points = Number(cards[i].querySelector("div.ghx-card-footer > div.ghx-end > div > aui-badge").innerText);
            const nameElem = cards[i].querySelector("div.ghx-card-footer > div.ghx-avatar > img");

            if (!nameElem || !nameElem.alt) {
                continue;
            }

            var name = nameElem.alt.replace("Assignee: ", "").toLowerCase();
            name = name.split(" ").slice(0, 1).join(" "); // extract first name

            if (typeof usersData[name] === 'undefined') {
                continue;
            }

            usersData[name].donepoints += points;
        }

        return usersData
    }

    function sumAllPoints(usersData) {
        const cards = document.querySelectorAll("#ghx-pool > div.ghx-swimlane > ul > li .js-issue");

        for (let i = 0; i < cards.length; i++) {
            const points = Number(cards[i].querySelector("div.ghx-card-footer > div.ghx-end > div > aui-badge").innerText);
            const nameElem = cards[i].querySelector("div.ghx-card-footer > div.ghx-avatar > img");

            if (!nameElem || !nameElem.alt) {
                continue;
            }

            var name = nameElem.alt.replace("Assignee: ", "").toLowerCase();
            name = name.split(" ").slice(0, 1).join(" "); // extract first name

            if (typeof usersData[name] === 'undefined') {
                console.log("404 NOT FOUND!")
                continue;
            }

            usersData[name].allpoints += points;
        }

        return usersData
    }

    function waitForCardsAndSumPoints() {
        var intervalId = setInterval(function() {
            const cards = document.querySelectorAll("#ghx-pool > div.ghx-swimlane > ul > li:nth-child(4) .js-issue");

            if (cards.length > 0) {
                clearInterval(intervalId);
                var userList = identifyTheUsers();
                userList = sumDonePoints(userList);
                userList = sumAllPoints(userList);
                if(userList){
                    displayPoints(userList);
                }
                updateOnChanges(userList);
            }
        }, 500);
    }

    function updateOnChanges(userList) {
        setInterval(function() {
            const regex = /^[A-Za-z]+ \(\d+\/\d+\)$/;
            const sample = document.querySelector("#js-work-quickfilters > dd:nth-child(3) > a").innerHTML;

            if (!regex.test(sample)) {
                userList = sumDonePoints(userList);
                userList = sumAllPoints(userList);
                if(userList){
                    displayPoints(userList);
                }
            }
        }, 1000);
    }

    waitForCardsAndSumPoints();
})(document);