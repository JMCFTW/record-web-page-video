const {
    launch,
    getStream
} = require("puppeteer-stream");
const puppeteer = require('puppeteer');
const {
    spawn
} = require("child_process");

const iPhone = puppeteer.devices['iPhone XR landscape'];

async function record(url, filename) {
    return launch({
            args: ["--headless=new", "--window-size=720,1280", '--no-sandbox', "--hide-scrollbars", "--disable-dev-shm-usage", "--ozone-override-screen-size=720,1280", "--disable-gl-drawing-for-tests"],
            executablePath: "google-chrome"
        }).then(async (browser) => {
            const page = await browser.newPage();
            await page.emulate(iPhone);
            await page.setViewport({
                width: 0,
                height: 0
            });
            return await task(page, url, filename)
                .catch((err) => console.log(err))
                .finally(() => browser?.close());
        })
        .catch((err) => console.log(err));
}

async function task(page, url, filename) {
    await page.goto(url);
    await page.evaluate(() => {
        ['.Nav__NavRelativeWrapper-sc-11ie6p3-4', '.MobileBlock__MobileBlockRelativeWrapper-sc-1rhom6a-0', '.SuggestedPanel__PanelWrapper-sc-k6y6gs-0'].forEach((element) => {
            console.log(element);
            document.querySelector(element).remove();
        });
    })
    console.log("Start recording...");
    const stream = await getStream(page, {
        audio: true,
        video: true,
    });
    // input is webm
    // to m3u8
    // const ffmpeg = exec(`ffmpeg -y -i - -vf "crop=1792:1018:0:0" -hls_list_size 0 output.m3u8`);
    // to mp4
    const ffmpeg = spawn("ffmpeg", ["-y", "-i", "-", "-preset", "ultrafast", "-b:v", "1200k", "-acodec", "aac", "-vcodec", "libx264", "-profile:v", "main", "-pix_fmt:v", "yuv420p", "-movflags", "+faststart", "-vsync", "cfr", "-r", "24", `${filename}.mp4`]);

    ffmpeg.stderr.on("data", (chunk) => {
        console.log(chunk.toString());
    });

    stream.on("close", () => {
        console.log("stream close");
        ffmpeg.stdin.end()
    });

    stream.pipe(ffmpeg.stdin);

    return new Promise(resolve => setTimeout(async () => {
        await stream.destroy();
        await page.close();
        console.log("stream finished");
        resolve("success");
    }, 1000 * 60));
}

module.exports = {
    record
};
