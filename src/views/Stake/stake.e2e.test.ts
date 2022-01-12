import "@testing-library/jest-dom";
import {
  dapp,
  clickElement,
  connectWallet,
  selectorExists,
  waitSelectorExists,
  getSelectorTextContent,
  typeValue,
} from "../../../tests/e2e/testHelpers";

// TODO deploy contracts on temporary network
// TODO add eth to wallet
// TODO close Chromium after test case

var STAKE_AMOUNT = 0.1;

describe("staking", () => {
  test("cannot stake without connected wallet", async () => {
    const { page } = dapp;

    // Connect button should be available
    expect(await selectorExists(page, "#stake-connect-wallet")).toBeTruthy();
    // connect button on top bar should say connect too
    // stake input shouldnt be visible
    // Stake button not visible
    expect(await selectorExists(page, "#stake-button")).toBeFalsy();
  });

  test("connects wallet", async () => {
    const { page, metamask } = dapp;

    // Connect button should be available
    expect(await selectorExists(page, "#stake-connect-wallet")).toBeTruthy();

    await connectWallet(page, metamask);

    // Connect button should be replaced by "Approve"
    await page.bringToFront();
    expect(await waitSelectorExists(page, "#approve-stake-button")).toBeTruthy();
    expect(await selectorExists(page, "#stake-connect-wallet")).toBeFalsy();
  });

  test("approves staking", async () => {
    const { page, metamask } = dapp;

    await connectWallet(page, metamask);

    // NOTE: we may want to re-enable this when moving onto a single-use testnet, as the approval status won't persist
    // *** Approve the staking function
    // await page.bringToFront();
    // Stake button (named "Approve")
    // await clickElement(page, "#approve-stake-button");
    // Bring Metamask front with the transaction modal
    // await metamask.confirmTransaction();
    // Approve the transaction
    // await metamask.approve();
    // check that the button is "pending"
    // need to test approval for stake/unstake gOhm and sOhm

    // Button should be replaced by "Stake"
    expect(await waitSelectorExists(page, "#stake-button")).toBeTruthy();
    expect(await selectorExists(page, "#approve-stake-button")).toBeFalsy();
  });

  test("staking", async () => {
    const { page, metamask } = dapp;

    await connectWallet(page, metamask);
    // check that it is defaulted to stake to sOhm
    // check button says "stake to sohm"
    // toggle to gOhm
    // check that button says "stake to gOhm"

    // Perform staking
    await typeValue(page, "#amount-input", STAKE_AMOUNT.toString());
    await clickElement(page, "#stake-button");
    await metamask.confirmTransaction();
    // check that the button is "pending"

    // Staked balance should be written as 0.1 sOHM
    expect(await getSelectorTextContent(page, "#user-staked-balance")).toEqual("0.1 sOHM");
    expect(await waitSelectorExists(page, "#unstake-button")).toBeTruthy();
    expect(await selectorExists(page, "#stake-button")).toBeFalsy();
  });

  test("unstaking", async () => {
    // we need a test for the max stake/unstake button

    const { page, metamask } = dapp;

    await connectWallet(page, metamask);
    // check that it is defaulted to unstake to sOhm
    // check button says "unstake to sohm"
    // toggle to gOhm
    // check that button says "unstake to gOhm"

    // Perform staking
    await typeValue(page, "#amount-input", STAKE_AMOUNT.toString());
    await clickElement(page, "#stake-button");
    await metamask.confirmTransaction();

    // Perform unstaking
    await typeValue(page, "#amount-input", STAKE_AMOUNT.toString());
    await clickElement(page, "#unstake-button");
    await metamask.confirmTransaction();
    // check that the button is "pending"

    // Staked balance should be written as 0.0 sOHM
    expect(await getSelectorTextContent(page, "#user-staked-balance")).toEqual("0 sOHM");
    // check that ohm balance increased
    // if there is zero
  });
});
