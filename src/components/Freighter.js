import * as StellarSdk from '@stellar/stellar-sdk';
import { isConnected, requestAccess, signTransaction } from '@stellar/freighter-api';

const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');

const checkConnection = async () => {
  const result = await isConnected();
  return result.isConnected === true || result === true;
};

const retrievePublicKey = async () => {
  const result = await requestAccess();
  if (result.error) {
    console.error("Access denied:", result.error);
    return "";
  }
  return result.address || result;
};

const getBalance = async (publicKey) => {
  try {
    const account = await server.loadAccount(publicKey);
    const nativeBalance = account.balances.find(balance => balance.asset_type === 'native');
    return nativeBalance ? nativeBalance.balance : '0';
  } catch (error) {
    console.error('Error fetching balance:', error);
    throw error;
  }
};

const userSignTransaction = async (xdr, network, signWith) => {
  const result = await signTransaction(xdr, {
      network: network,
      networkPassphrase: network === 'TESTNET' ? StellarSdk.Networks.TESTNET : StellarSdk.Networks.PUBLIC,
      accountToSign: signWith,
  });
  
  if (result.error) {
    throw new Error(result.error);
  }
  
  // Freighter v6 returns { signedTxXdr: string }, older versions returned the string directly
  return result.signedTxXdr || result;
};

const sendPayment = async (senderPublicKey, receiverPublicKey, amount) => {
  const account = await server.loadAccount(senderPublicKey);
  const fee = await server.fetchBaseFee();

  const transaction = new StellarSdk.TransactionBuilder(account, {
    fee,
    networkPassphrase: StellarSdk.Networks.TESTNET,
  })
    .addOperation(
      StellarSdk.Operation.payment({
        destination: receiverPublicKey,
        asset: StellarSdk.Asset.native(),
        amount: amount.toString(),
      })
    )
    .setTimeout(30)
    .build();

  const signedTxXdr = await userSignTransaction(transaction.toXDR(), 'TESTNET', senderPublicKey);
  
  // Submit the transaction
  const signedTx = StellarSdk.TransactionBuilder.fromXDR(signedTxXdr, StellarSdk.Networks.TESTNET);
  return await server.submitTransaction(signedTx);
};

export {
  server,
  checkConnection,
  retrievePublicKey,
  getBalance,
  userSignTransaction,
  sendPayment
};
