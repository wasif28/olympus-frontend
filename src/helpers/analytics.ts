declare global {
  interface Window {
    analytics: {
      track: any;
      identify: any;
    };
  }
}

// Event Names
// Please use the Object/Action Framework when naming events!
export const OLYMPUS_GIVE = "Olympus Give";
export const BONDS = "Bonds";
export const STAKING = "Staking";
export const ZAP_APPROVAL_REQUEST_SUCCESS = "Zap Approval Request Success";
export const ZAP_APPROVAL_REQUEST_FAILURE = "Zap Approval Request Failure";
export const ZAP_SWAP_SUCCESS = "Zap Swap Success";
export const ZAP_SWAP_FAILURE = "Zap Swap Failure";
export const LEARN_ABOUT_OLYZAPS = "Learn more OlyZaps";
export const OLYZAPS_TOKEN_SELECTED = "OlyZaps Token Select";
export const OLYZAPS_OFFER_DISPLAY = "OlyZaps Offer Display";
export const CONNECT = "connect";
export const WRAP = "wrap";
export const UNWRAP = "unwrap";
export const REDEEM = "redeem";
export const STAKE = "stake";
export const UNSTAKE = "unstake";
export const ADD_TOKEN = "Add Token";

// IMPORTANT: Segment Integrations need to be enabled here!
export const options = {
  integrations: {
    "Google Analytics": true,
  },
};

export const track = (eventName: string, properties?: any) => {
  if (window.analytics) {
    try {
      window.analytics.track(eventName, properties, options);
    } catch (e) {}
  }
};
