const puppeteer = require("puppeteer");
const request = require("request");
const fs = require("fs");
const jsdom=require('jsdom');
const {RTMClient}=require('@slack/client');
const rtm=new RTMClient(process.env.SLACK_TOKEN);

rtm.start();

function slack(data){
	if(process.env.SLACK_TOKEN === undefined){
		console.log('slack token is not defined');
		return;
	}
    request.post('https://slack.com/api/chat.postMessage',{
        form: {
            token: process.env.SLACK_TOKEN,
            channel: 'bot-test',
            username: 'coskx-uploader',
            text: data
		}
　　},(error, response, body) => {
		if (error) console.log(error);
    })
};

const submit=(async(file)=>{
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
	await fileInput.uploadFile(file);
	await page.click('input[id="sendfiles"]');
	const submittion = await page.evaluate(() => {
		const node = document.querySelectorAll("tr");
		const data = [];
		for (item of node){
			data.push(item.innerText);
		}
		return data.slice(0,data.length-3).join('\n');
	});
	console.log('submittion',submittion,typeof(submission));
	slack(submittion);
	browser.close();
	return text;
});

rtm.on('hello',(event)=>{
	console.log('start slack process');
});

rtm.on('message',(event)=>{
	if(event.text.split(' ')[0]==='.h'){
		slack('hello')
	}else if(event.text.split(' ')[0]==='.x'){
		slack('x was sent',event.text.split(' ')[1]);
	}
	//if(event.text.split(' ')[0]==='.u'){ }

	if(event.subtype && event.subtype==='file_share'){
		file=download(event.file);
		text=submit(file)
	}
});

function download(file){
	let headers={Authorization: ' Bearer '+process.env.SLACK_TOKEN};
	fname='./files/'+file.name;
	request({
		url:file.url_private,
		headers:{'Authorization': 'Bearer '+process.env.SLACK_TOKEN}})
			.pipe(fs.createWriteStream('./files/'+file.name));
	return fname;
}

