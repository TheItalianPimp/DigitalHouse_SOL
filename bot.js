const { Connection, PublicKey, Keypair, sendAndConfirmTransaction } = require("@solana/web3.js");
const { Metaplex, keypairIdentity, bundlrStorage } = require("@metaplex-foundation/js");
const fetch = require('node-fetch');
const bs58 = require('bs58');
require('dotenv').config();

// Principal parameter
const RPC_URL = "https://api.mainnet-beta.solana.com"; // Devnet for tests
const connection = new Connection(RPC_URL, "confirmed");

const BOT_PRIVATE_KEY = process.env.BOT_PRIVATE_KEY;
const botWallet = Keypair.fromSecretKey(bs58.decode(BOT_PRIVATE_KEY));

const TREASURY_SOL = new PublicKey(process.env.TREASURY_SOL_ADDRESS);
const TREASURY_SPL = new PublicKey(process.env.TREASURY_SPL_ADDRESS);
const HOUSE_MINT = new PublicKey(process.env.HOUSE_MINT_ADDRESS);
const MARKETPLACE_API = "https://api.magiceden.io/v2"; 

// Metaplex
const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(botWallet))
    .use(bundlrStorage());

// payments listener
async function listenPayments() {
    console.log("Listening for payments...");

    setInterval(async () => {
        try {
            const recentTxs = await connection.getSignaturesForAddress(TREASURY_SOL, { limit: 10 });

            for (const tx of recentTxs) {
                const transactionDetails = await connection.getTransaction(tx.signature, { commitment: "confirmed" });

                if (transactionDetails && transactionDetails.meta && !transactionDetails.meta.err) {
                    const accounts = transactionDetails.transaction.message.accountKeys.map(acc => acc.pubkey.toString());

                    const buyerAddress = accounts[0];
                    const lamportsPaid = transactionDetails.meta.postBalances[1] - transactionDetails.meta.preBalances[1];

                    if (lamportsPaid > 1000000) { // > 0.001 SOL
                        console.log(`✅ Payment received in SOL: ${lamportsPaid / 1e9} SOL from ${buyerAddress}`);
                        await purchaseAndTransferAsset(buyerAddress);
                    }
                }
            }
        } catch (error) {
            console.error("Errore ascoltando pagamenti:", error);
        }
    }, 15000);
}

// Asset Buy function
async function purchaseAndTransferAsset(buyerAddress) {
    try {
        const assetToBuy = "EXAMPLE_NFT_MINT"; // Qui dovresti mappare quale asset è associato a quale pagamento

        console.log(`🔄 Buying asset ${assetToBuy} for ${buyerAddress}`);

        // API call
        // const response = await fetch(`${MARKETPLACE_API}/buy_now`, { method: "POST", body: JSON.stringify({ mintAddress: assetToBuy, buyer: botWallet.publicKey.toBase58() }) });

        // completed simulation
        await transferNFT(assetToBuy, buyerAddress);

    } catch (error) {
        console.error("Errore durante l'acquisto:", error);
    }
}

// Goods transefers
async function transferNFT(nftMintAddress, buyerAddress) {
    console.log(`🚚 Transferring NFT ${nftMintAddress} to ${buyerAddress}`);

    try {
        const mint = new PublicKey(nftMintAddress);
        const toPublicKey = new PublicKey(buyerAddress);

        const nft = await metaplex.nfts().findByMint({ mintAddress: mint });

        const { response } = await metaplex.nfts().send({
            mintAddress: nft.mintAddress,
            toOwner: toPublicKey,
        });

        console.log(`✅ NFT transferred in tx: ${response.signature}`);
    } catch (error) {
        console.error("Errore nel trasferimento NFT:", error);
    }
}

// Start Bot
listenPayments();