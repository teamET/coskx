const puppeteer = require("puppeteer");
const request = require("request");
const fs = require("fs");
const jsdom=require('jsdom');
const {RTMClient}=require('@slack/client');
const rtm=new RTMClient(process.env.SLACK_TOKEN);

rtm.start();

var slack_id;
var account_data = fs.readFileSync('./account.json');
var account = JSON.parse(account_data);


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
	var username = account[slack_id["id"]];
	var password = account[slack_id["pass"]];
	console.log('submit started');
	const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
	const page = await browser.newPage();
	await page.goto('http://yamashita002.je.tokyo-ct.ac.jp/reports2018_yama/4Jucom.php?',{waitUntil: "domcontentloaded"});
	await page.type('input[name="userID"]',username);
	await page.type('input[name="userPASS"]',password);
	await page.click('input[type=button]');
	await page.waitForNavigation({timeout: 60000, waitUntil: "domcontentloaded"});
	process.on('unhandledRejection', console.dir);
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
	slack_id = event.user;
	if(event.text.split(' ')[0]==='.h'){
		slack('hello');
	}else if(event.text.split(' ')[0]==='.x'){
		slack('x was sent',event.text.split(' ')[1]);
	}else if(event.text.split(' ')[0]==='.entry'){
		var id = event.text.split(' ')[1];
		var pass = event.text.split(' ')[2];
		account[slack_id] = {id:id,pass:pass};
		fs.writeFile('account.json',JSON.stringify(account));
		slack("Your account has been registered.");
	}
	//if(event.text.split(' ')[0]==='.u'){ }

	if(event.subtype && event.subtype==='file_share'){
		console.log(event.file);
		file=download(event.file.title,event.file.url_private);
		if(account[slack_id] !== undefined){
			text=submit(file);
		}else{
			slack("Please register your account."); 
		}
	}
});

function download(name,url){
	let headers={Authorization: ' Bearer '+process.env.SLACK_TOKEN};
	let fname='./files/'+name;
	request({
		url:url,//file.url_private,
		headers:{'Authorization': 'Bearer '+process.env.SLACK_TOKEN}})
			.pipe(fs.createWriteStream(fname));
	console.log(fname)
	return fname;
}

