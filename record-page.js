// Import dependencies
const {
    launch,
    getStream
} = require("puppeteer-stream");
const puppeteer = require('puppeteer');
const { exec } = require("child_process");

const iPhone = puppeteer.devices['iPhone 6'];

async function record() {
    const browser = await launch({
        args: ["--headless=new", "--window-size=390,844"],
        executablePath: "/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome"
    });
    const browserPID = browser.process().pid
    const page = await browser.newPage();
    await page.emulate(iPhone);
    await page.setViewport({
        width: 0,
        height: 0
    });
    await page.goto('https://www.youtube.com/watch?v=1__JDu-5l-Q');
    console.log("Start recording...");
    const stream = await getStream(page, {
        audio: true,
        video: true,
    });

    // input is webm
    // to m3u8
    // const ffmpeg = exec(`ffmpeg -y -i - -vf "crop=1792:1018:0:0" -hls_list_size 0 output.m3u8`);
    // to mp4
    const ffmpeg = exec(`ffmpeg -y -i - -vf "crop=1792:1018:0:0" -acodec aac -vcodec libx264 -profile:v main -level 3.1 -pix_fmt:v yuv420p -movflags +faststart -vsync vfr testout.mp4`);
    ffmpeg.stderr.on("data", (chunk) => {
	console.log(chunk.toString());
    });

    stream.on("close", () => {
	console.log("stream close");
	ffmpeg.stdin.end();
    });

    stream.pipe(ffmpeg.stdin);

    setTimeout(async () => {
        await stream.destroy();
        process.kill(browserPID);
        console.log("finished");
        process.exit()
    }, 30 * 1000);
}

record();
