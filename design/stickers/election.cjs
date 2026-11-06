const path=require('path'),fs=require('fs'),os=require('os')
const puppeteer=require(process.env.PUPPETEER_CORE || 'puppeteer-core')
// name, frames in the loop, the frame to keep as the still
const SET=[['voted',24,7],['vote',24,7],['stamp',24,5],['ok',26,12]]
;(async()=>{const prof=fs.mkdtempSync(path.join(os.tmpdir(),'devsa-vote-'))
const br=await puppeteer.launch({executablePath: process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:'new',userDataDir:prof,args:['--allow-file-access-from-files']})
try{const out=process.argv[2];const p=await br.newPage()
const shot=async(k,f,file,scale,gif)=>{await p.setViewport({width:320,height:320,deviceScaleFactor:scale});await p.goto('file://'+path.join(__dirname,'election.html')+`?k=${k}&f=${f}${gif?'&gif=1':''}`,{waitUntil:'networkidle0'});await p.evaluate(()=>document.fonts.ready);await p.screenshot({path:file,omitBackground:true})}
for(const [k,n,still] of SET){fs.mkdirSync(`${out}/frames/${k}`,{recursive:true})
  await shot(k,still,`${out}/devsa-${k}.png`,3,false)
  for(let f=0;f<n;f++) await shot(k,f,`${out}/frames/${k}/${String(f).padStart(2,'0')}.png`,1.5,true)}
}finally{await br.close();fs.rmSync(prof,{recursive:true,force:true})}})()
