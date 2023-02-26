const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        executablePath: "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
        defaultViewport: null,
    });
    const page = await browser.newPage();
    await page.goto('https://discord.com/channels/987878105450414161/1059192499463278702');



    await page.waitForSelector('#app-mount > div.appAsidePanelWrapper-ev4hlp > div.notAppAsidePanel-3yzkgB > div.app-3xd6d0 > div > div > div > section > div.centeringWrapper-dGnJPQ > button.marginTop8-24uXGp.marginCenterHorz-574Oxy.linkButton-2ax8wP.button-ejjZWC.lookLink-13iF2K.lowSaturationUnderline-Z6CW6z.colorLink-34zig_.sizeMin-3Yqxk5.grow-2T4nbg')

    await page.evaluate(() => {
        document.querySelector("#app-mount > div.appAsidePanelWrapper-ev4hlp > div.notAppAsidePanel-3yzkgB > div.app-3xd6d0 > div > div > div > section > div.centeringWrapper-dGnJPQ > button.marginTop8-24uXGp.marginCenterHorz-574Oxy.linkButton-2ax8wP.button-ejjZWC.lookLink-13iF2K.lowSaturationUnderline-Z6CW6z.colorLink-34zig_.sizeMin-3Yqxk5.grow-2T4nbg").click()

    })


    await page.waitForNetworkIdle()


    await page.type("#uid_8", "dionne.r.9@gmail.com")

    await page.waitForSelector("#uid_11")
    await page.type("#uid_11", "iloveairplanes")

    await page.click("#app-mount > div.appAsidePanelWrapper-ev4hlp > div.notAppAsidePanel-3yzkgB > div.app-3xd6d0 > div > div > div > div > form > div.centeringWrapper-dGnJPQ > div > div.mainLoginContainer-wHmAjP > div.block-3uVSn4.marginTop20-2T8ZJx > button.marginBottom8-emkd0_.button-1cRKG6.button-ejjZWC.lookFilled-1H2Jvj.colorBrand-2M3O3N.sizeLarge-2xP3-w.fullWidth-3M-YBR.grow-2T4nbg")


    await page.click("#app-mount > div.appAsidePanelWrapper-ev4hlp > div.notAppAsidePanel-3yzkgB > div.app-3xd6d0 > div > div > div > form > div.centeringWrapper-dGnJPQ > div.block-3uVSn4.marginTop40-Q4o1tS > button.marginTop4-2JFJJI.linkButton-2ax8wP.button-ejjZWC.lookLink-13iF2K.lowSaturationUnderline-Z6CW6z.colorLink-34zig_.sizeMin-3Yqxk5.grow-2T4nbg")


    await page.type("#app-mount > div.appAsidePanelWrapper-ev4hlp > div.notAppAsidePanel-3yzkgB > div.app-3xd6d0 > div > div.layers-OrUESM.layers-1YQhyW > div > div > div > div.content-1SgpWY > div.chat-2ZfjoI > div.content-1jQy2l > main > form > div > div.scrollableContainer-15eg7h.webkit-QgSAqd > div > div.textArea-2CLwUE.textAreaSlate-9-y-k2.slateContainer-3x9zil > div > div.markup-eYLPri.editor-H2NA06.slateTextArea-27tjG0.fontSize16Padding-XoMpjI", "test")



    await page.evaluate(async () => {
        const discordTextBox = document.querySelectorAll('#app-mount > div.appAsidePanelWrapper-ev4hlp > div.notAppAsidePanel-3yzkgB > div.app-3xd6d0 > div > div.layers-OrUESM.layers-1YQhyW > div > div > div > div.content-1SgpWY > div.chat-2ZfjoI > div.content-1jQy2l > main > form > div > div.scrollableContainer-15eg7h.webkit-QgSAqd > div > div.textArea-2CLwUE.textAreaSlate-9-y-k2.slateContainer-3x9zil > div > div.markup-eYLPri.editor-H2NA06.slateTextArea-27tjG0.fontSize16Padding-XoMpjI');

        document.querySelector().click()


    });


})();




class Game {
    constructor(winner, loser, match, playerLog) {
        this.winner = winner;
        this.loser = loser;
        this.match = match;
        this.playerLog = playerLog;
    }
}