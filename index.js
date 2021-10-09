const puppeteer = require("puppeteer");
const chalk = require("chalk");
var fs = require("fs");

// make colorful console.logs for debugging
const error = chalk.bold.red;
const success = chalk.keyword("green");

(async () => {
    try {
        // open the headless browser
        var browser = await puppeteer.launch({
            headless: true
        });
        // open a new page
        var page = await browser.newPage();
        // enter url in page
        let counter = 1;
        let link = 'https://habr.com/ru/all/page'

        // check first 2 pages
        while (counter < 4) {
            await page.goto(`${link}${counter}`);

            var articles = await page.evaluate(() => {

                // get all necessary elements
                var countViews = document.querySelectorAll(`span.tm-icon-counter__value`);
                var time = document.querySelectorAll('span.tm-article-snippet__datetime-published')
                var snippet = document.querySelectorAll('span.tm-article-snippet__hubs-item');
                var author = document.querySelectorAll('a.tm-user-info__username');
                var titleNodeList = document.querySelectorAll(`a.tm-article-snippet__title-link`);

                // empty array for articles data
                var titleLinkArray = [];

                for (var i = 0; i < titleNodeList.length; i++) {
                    // check number of views
                    let views = countViews[i].innerText.trim();
                    if (views < 1000) {
                        titleLinkArray[i] = {
                            name: titleNodeList[i].innerText.trim(),
                            author: author[i].innerText.trim(),
                            time: time[i].innerText.trim(),
                            snippet: snippet[i].innerText.trim(),
                            views: views,
                            link: titleNodeList[i].getAttribute("href"),
                        };
                    }
                }
                // check if article doesn`t meet condition
                // prevent pushing null to json file
                var newArr = titleLinkArray.filter(function (el) {
                    return el.name !== null &&
                        el.views !== null,
                        el.author !== null,
                        el.time !== null,
                        el.snippet !== null,
                        el.link !== null;
                });
                return newArr;
            });
            counter++
        }

        await browser.close();

        // write data inside a json file
        fs.writeFile("hackernews.json", JSON.stringify(articles), function (err) {
            if (err) throw err;
            console.log("Saved!");
        });

    } catch (err) {
        // catch and display errors
        console.log(error(err));
        await browser.close();
        console.log(error("Browser Closed"));
    }
})();