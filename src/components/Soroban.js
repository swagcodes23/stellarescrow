import * as StellarSdk from '@stellar/stellar-sdk';
import { userSignTransaction } from './Freighter';
import { userSignTransactionAlbedo } from './Albedo';
import { server } from './Freighter'; 

export const CONTRACT_ID = 'CDTQUZTEFN3GWEPKRCRD4ABGMYIZUQDSLEL6SF4SSO4EJGQVXTC7QXBV';
const NATIVE_CONTRACT = 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC'; 
const rpcServer = new StellarSdk.rpc.Server('https://soroban-testnet.stellar.org');

const invokeMethod = async (walletType, publicKey, method, args) => {
    try {
        const account = await server.loadAccount(publicKey);
        const contract = new StellarSdk.Contract(CONTRACT_ID);

        let tx = new StellarSdk.TransactionBuilder(account, {
            fee: "100000",
            networkPassphrase: StellarSdk.Networks.TESTNET,
        })
        .addOperation(contract.call(method, ...args))
        .setTimeout(30)
        .build();

        const simulated = await rpcServer.simulateTransaction(tx);
        if (StellarSdk.rpc.Api.isSimulationError(simulated)) {
            throw new Error(simulated.error);
        }

        tx = StellarSdk.rpc.assembleTransaction(tx, simulated).build();

        let signedXdr;
        if (walletType === 'albedo') {
            signedXdr = await userSignTransactionAlbedo(tx.toXDR(), 'TESTNET');
        } else {
            signedXdr = await userSignTransaction(tx.toXDR(), 'TESTNET', publicKey);
        }

        const signedTx = StellarSdk.TransactionBuilder.fromXDR(signedXdr, StellarSdk.Networks.TESTNET);
        let response = await rpcServer.sendTransaction(signedTx);
        let status = response.status;
        let resultTx;
        let retries = 0;
        
        while ((status === "PENDING" || status === "NOT_FOUND") && retries < 25) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            resultTx = await rpcServer.getTransaction(response.hash);
            status = resultTx.status;
            retries++;
        }

        if (status === "SUCCESS") {
            return response.hash;
        } else if (status === "NOT_FOUND" || status === "PENDING") {
            console.warn("RPC is slow to confirm, but transaction was submitted.");
            return response.hash;
        } else {
            throw new Error(`Transaction failed. Result status: ${status}`);
        }
    } catch (e) {
        throw e;
    }
};

export const depositEscrow = async (walletType, tenantPublicKey, landlordPublicKey, amountString) => {
    // Convert to stroops (1 XLM = 10,000,000 stroops)
    const stroops = Math.floor(parseFloat(amountString) * 10000000);
    const args = [
        StellarSdk.nativeToScVal(tenantPublicKey, { type: 'address' }),
        StellarSdk.nativeToScVal(landlordPublicKey, { type: 'address' }),
        StellarSdk.nativeToScVal(NATIVE_CONTRACT, { type: 'address' }),
        StellarSdk.nativeToScVal(stroops, { type: 'i128' }),
    ];
    return await invokeMethod(walletType, tenantPublicKey, 'deposit', args);
};

export const releaseEscrow = async (walletType, landlordPublicKey) => {
    const args = [
        StellarSdk.nativeToScVal(landlordPublicKey, { type: 'address' }),
        StellarSdk.nativeToScVal(NATIVE_CONTRACT, { type: 'address' }),
    ];
    return await invokeMethod(walletType, landlordPublicKey, 'release', args);
};

export const refundEscrow = async (walletType, landlordPublicKey) => {
    const args = [
        StellarSdk.nativeToScVal(landlordPublicKey, { type: 'address' }),
        StellarSdk.nativeToScVal(NATIVE_CONTRACT, { type: 'address' }),
    ];
    return await invokeMethod(walletType, landlordPublicKey, 'refund', args);
};
