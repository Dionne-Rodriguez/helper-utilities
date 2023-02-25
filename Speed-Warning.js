const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"
  });
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:8111/');

  const audioObj = await page.evaluateHandle(() => {
    const path = "http://127.0.0.1:8080/sounds/overspeed-warning-plane-By-Tuna.mp3"
    const audio = new Audio(path)
    return audio
  });

  await page.evaluate(async (audio) => {
    const target = document.querySelector('#state0 > li:nth-child(2)');
    const observer = new MutationObserver(async mutations => {
      for await (const mutation of mutations) {
        if (mutation.type === 'childList' && parseNumber(document.querySelector('#state0 > li:nth-child(3)').innerHTML) > 1340) {
          audio.play()
          console.log(parseNumber(document.querySelector('#state0 > li:nth-child(2)').innerHTML), "speed");
        } else {
          audio.pause()
        }
      }
    });
    observer.observe(target, { childList: true });

    function parseNumber(string) {
      var regex = /\d*\.?\d+(?:e-?\d+)?$/;
      var match = string.match(regex);
      if (match) {
        var numberString = match[0].replace(/,/g, "");
        return parseFloat(numberString);
      } else {
        return NaN;
      }
    }
  }, audioObj);
})();