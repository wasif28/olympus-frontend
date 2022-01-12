import "@testing-library/jest-dom";
import {
  clickElement,
  setupMetamask,
  connectWallet,
  selectorExists,
  waitSelectorExists,
  getSelectorTextContent,
  typeValue,
} from "../../../tests/e2e/testHelpers";
import puppeteer, { Browser, Page } from "puppeteer";
import { launch, Dappeteer } from "@chainsafe/dappeteer";

describe("bonding", () => {
  let browser: Browser;
  let metamask: Dappeteer;
  let page: Page;

  beforeEach(async () => {
    browser = await launch(puppeteer, { metamaskVersion: "v10.1.1" });

    metamask = await setupMetamask(browser, {});

    page = await browser.newPage();
    await page.goto("http://localhost:3000/#/bonds");
    await page.bringToFront();
  });

  afterEach(async () => {
    await browser.close();
  });

  test.only("cannot bond without connected wallet", async () => {
    const selector = await page.waitForSelector("#ohm_lusd_lp--bond");
    await selector?.$eval("button", i => console.log(i));
    // click bond button
    // check that button in modal says "connect wallet"

    fail();
  });

  test("connects wallet", async () => {
    // Connect button should be available
    expect(await selectorExists(page, "#wallet-button")).toBeTruthy();
    expect(await getSelectorTextContent(page, "#wallet-button")).toEqual("Connect Wallet");

    await connectWallet(page, metamask);

    // Connect button should be replaced by "Disconnect"
    expect(await waitSelectorExists(page, "#wallet-button")).toBeTruthy();
    expect(await getSelectorTextContent(page, "#wallet-button")).toEqual("Wallet");
  });

  test("select first bond row and approve", async () => {
    // select first row and click bond button
    // verify button says approve
    // click approve button
    // verify button says pending
    // verify that after approval there is mount input and bond button
    // close modal
    fail("TODO");
  });

  test("select first bond row and bond", async () => {
    // select bond in first row
    // check balance
    // click max button
    // verify amount equals balance
    // clear input
    // input bond amount
    // click bond button
    // verify button says pending
    // verify button says bond
    // verify balance decreased by bond amount
    // close modal
    // verify there is a bond in "your bonds" section
    // verify you are unable to claim bond
    fail("TODO");
  });

  test("claim single bond", async () => {
    // verify there is a bond to claim
    // click sOhm radio button
    // verify payout is in sOhm
    // click gohm radio button
    // verify payout is in gohm
    // click claim button
    // confirm transaction
    // verify button says pending
    // after transaction succeeds verify that it no longer shows in "your bonds"
    fail("TODO");
  });
});
