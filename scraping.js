const puppeteer = require("puppeteer");
const request = require("request");
const fs = require("fs");
const jsdom=require('jsdom');

function slack(data){
	if(process.env.SLACK_TOKEN === undefined){
		console.log('slack token is not defined');
		return;
	}
    request.post('https://slack.com/api/chat.postMessage',{
        form: {
            token: process.env.SLACK_TOKEN,
            channel: 'bot-test',
            username: 'test-bot',
            text: data
		}
　　},(error, response, body) => {
        console.log(error)
    })
    console.log('push succeed',data);
};

const submit=(async()=>{
	var text=''
	var username='s15097'
	var password='s15097'
	console.log('submit started');
	const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
	const page = await browser.newPage();
	await page.goto('http://yamashita002.je.tokyo-ct.ac.jp/reports2018_yama/4Jucom.php?',{waitUntil: "domcontentloaded"});
	await page.type('input[name="userID"]',username);
	await page.type('input[name="userPASS"]',password);
	await page.click('input[type=button]');
	await page.waitForNavigation({timeout: 60000, waitUntil: "domcontentloaded"});
	const fileInput = await page.$('input[type=file]');
	await fileInput.uploadFile('/home/sktrombone/hax/mon1ex06.txt');
	await page.click('input[id="sendfiles"]');
//	text=await page.evaluate(()=> document.body.innnerHTML);
	text=await page.evaluate(()=>{
		console.log(document.querySelectorAll('head'));
		console.log('process succeed');
	});
	//text=scraper();
	console.log('submit finished');
	browser.close();
	return text;
});

const scrape=(async(text)=>{
	const dom=new jsdom.JSDOM(text);
	if(text ===''){
		console.log('there are nothing text data');
		return;
	}else{
		console.log(text);
	}
	console.log('dom data is',dom.window.document);
});

const main=(()=>{
	console.log('start process');
	text=submit();
	slack('hello slack');
});

main()
