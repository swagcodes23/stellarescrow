import albedo from '@albedo-link/intent';

export const checkConnectionAlbedo = async () => {
  // Albedo is a web-based wallet, so it does not require an extension installation check
  return true;
};

export const retrievePublicKeyAlbedo = async () => {
  try {
    const response = await albedo.publicKey();
    return response.pubkey;
  } catch (error) {
    console.error("Albedo connection rejected:", error);
    return "";
  }
};

export const userSignTransactionAlbedo = async (xdr, network) => {
  try {
    const response = await albedo.tx({
      xdr: xdr,
      network: network === 'TESTNET' ? 'testnet' : 'public',
    });
    return response.signed_envelope_xdr;
  } catch (error) {
    console.error("Albedo sign rejected:", error);
    throw error;
  }
};
