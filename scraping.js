const puppeteer = require("puppeteer");
const request = require("request");
const fs = require("fs");
const jsdom=require('jsdom');
const {RTMClient}=require('@slack/client');
const rtm=new RTMClient(process.env.SLACK_TOKEN);

rtm.start();

var slack_id;
var account_data;
var account;
var channelname;
var check;
try {
	account_data = fs.readFileSync('./account.json');
	account = JSON.parse(account_data);
}catch(e){
	account = {
		user :{id:"id",pass:"pass"}
	};
	fs.writeFileSync('account.json',JSON.stringify(account));	
}


function slack(data){
	if(process.env.SLACK_TOKEN === undefined){
		console.log('slack token is not defined');
		return;
	}
    request.post('https://slack.com/api/chat.postMessage',{
        form: {
            token: process.env.SLACK_TOKEN,
            channel: channelname,
            username: 'coskx-uploader',
            text: data
		}
　　},(error, response, body) => {
		if (error) console.log(error);
    })
};

const submit=(async(file,check)=>{
	var text=''
	var username = account[slack_id]["id"];
	var password = account[slack_id]["pass"];
	console.log('submit started',account,username,password);
	if (username===undefined ||password===undefined){
		console.log('username or password is not defined');
		slack('username or password is not defined');
		return ;
	}
	try{
		const browser = await puppeteer.launch({
			executablePath: '/usr/bin/chromium-browser'
		});
		const page = await browser.newPage();
		await page.goto('http://yamashita002.je.tokyo-ct.ac.jp/reports2018_yama/4Jucom.php?',{waitUntil: "domcontentloaded"});
		await page.type('input[name="userID"]',username);
		await page.type('input[name="userPASS"]',password);
		await page.click('input[type=button]');
		await page.waitForNavigation({timeout: 60000, waitUntil: "domcontentloaded"});
		process.on('unhandledRejection', console.dir);
		if(check==0){
			const fileInput = await page.$('input[type=file]');
			await fileInput.uploadFile(file);
			await page.waitFor(5000);
			await page.click('input[id="sendfiles"]');
			await page.waitFor(5000);
			await page.click('input[name="reload"]');
			await page.waitForNavigation({timeout: 60000, waitUntil: "domcontentloaded"});
			const systemMessage = await page.evaluate(() => {
				const node = document.querySelectorAll('div[style="overflow-y:auto; height:90px; resize: vertical; background-color:#f0f0f0;"]');
				const data = [];
				for (item of node) {
					data.push(item.innerText);
				}
				return data[0].split('\n')[1];
			});
			console.log(systemMessage);
			slack(systemMessage);
		}
		const submittion = await page.evaluate(() => {
			const node = document.querySelectorAll("tr");
			const data = [];
			for (item of node){
				data.push(item.innerText);
			}
			return data.slice(0,data.length-3).join('\n');
		});
		console.log(submittion);
		slack(submittion);
		browser.close();
	}catch(err){
		console.log(err);
		slack(err.name+':'+err.message);
		return;
	}
	return text;
});

rtm.on('hello',(event)=>{
	console.log('start slack process');
});

rtm.on('message',(event)=>{
	slack_id = event.user;
	channelname = event.channel;
	check=0;
	if(event.text.split(' ')[0]==='.h' || event.text.split(' ')[0]==='.help'){
		slack('hello I am coskx-uploader.');
		slack('-help : .help\n-x : .x\n-h : .h\n-entry : .entry [id] [password]')
	}else if(event.text.split(' ')[0]==='.x'){
		slack('x was sent',event.text.split(' ')[1]);
	}else if(event.text.split(' ')[0]==='.entry'){
		if(event.text.split(' ').length != 3){
			slack('username or password is invalid context.\ne.g.\n.entry <username> <password>');
			return ;
		}
		var id = event.text.split(' ')[1];
		var pass = event.text.split(' ')[2];
		account[slack_id] = {"id":id,"pass":pass};
		fs.writeFileSync('account.json',JSON.stringify(account));
		slack("Your account is registered.");
	}else if(event.text.split(' ')[0]==='.c'){
		check=1;
	}else if(event.text.split(' ')[0]==='.s'){
	    exec(text.split(' ').slice(1,text.length), (err, stdout, stderr) => {
	    if (err) { console.log(err); }
		console.log(stdout);
	    });
	}
	if(check==1) text=submit("non",check);
	if(event.subtype && event.subtype==='file_share'){
		console.log("title");
		console.log(event.file);
		console.log("channel");
		console.log(event.channel);
		var dirname='./files/'+slack_id;
		console.log(slack_id);
		console.log("dirname");
		console.log(dirname);
		var fname=dirname+'/'+event.file.title;
		try{
			fs.accessSync(dirname);
		} catch(err){
			fs.mkdirSync(dirname);
			console.log(dirname);
		}
		try{
			fs.accessSync(fname);
			fs.unlink(fname);
		} catch(err){
			console.log(fname);
		}
		file=download(fname,event.file.url_private);
		if(account[slack_id] !== undefined){
			text=submit(file,check);
		}else{
			slack("Please register your account."); 
		}
	}
});

function download(fname,url){
	let headers={Authorization: ' Bearer '+process.env.SLACK_TOKEN};
	request({
		url:url,//file.url_private,
		headers:{'Authorization': 'Bearer '+process.env.SLACK_TOKEN}})
			.pipe(fs.createWriteStream(fname));
	console.log(fname)
	return fname;
}

