// watchAddressTx.js
process.noDeprecation = true;

const Web3 = require('web3');
const config = require('./config.json');

// =============================
// 設定
// =============================
const WS_RPC = config.wssNode; // WebSocket RPC
const TARGET = config.targetAddress.toLowerCase();         // 監視したいアドレス

// Web3 初期化
const web3 = new Web3(new Web3.providers.WebsocketProvider(WS_RPC));

// =============================
// pending TX（未確定）監視
// =============================
web3.eth.subscribe('pendingTransactions', (error) => {
  if (error) console.error("Subscribe Error:", error);
})
.on('data', async (txHash) => {
  try {
    const tx = await web3.eth.getTransaction(txHash);
    if (!tx) return;

    const from = tx.from?.toLowerCase();
    const to = tx.to?.toLowerCase();

    if (from === TARGET || to === TARGET) {
      console.log("----- Pending Transaction Detected -----");
      console.log("TX Hash:", tx.hash);
      console.log("From:", tx.from);
      console.log("To:", tx.to);
      console.log("Value:", web3.utils.fromWei(tx.value, "ether"), "ETH");
      console.log("----------------------------------------\n");
    }
  } catch (err) {
    console.error("Error fetching pending TX:", err);
  }
});

// =============================
// Confirmed TX（確定）監視
// =============================
web3.eth.subscribe('newBlockHeaders')
.on("data", async (blockHeader) => {
  try {
    const block = await web3.eth.getBlock(blockHeader.hash, true);
    if (!block || !block.transactions) return;

    for (const tx of block.transactions) {
      const from = tx.from?.toLowerCase();
      const to = tx.to?.toLowerCase();

      if (from === TARGET || to === TARGET) {
        console.log("===== Confirmed Transaction =====");
        console.log("Block:", block.number);
        console.log("TX Hash:", tx.hash);
        console.log("From:", tx.from);
        console.log("To:", tx.to);
        console.log("Value:", web3.utils.fromWei(tx.value, "ether"), "ETH");
        console.log("Timestamp:", new Date(block.timestamp * 1000).toISOString());
        console.log("=================================\n");
      }
    }
  } catch (err) {
    console.error("Block read error:", err);
  }
});

// =============================
// エラー監視
// =============================
web3.currentProvider.on('error', (err) => {
  console.error("WebSocket Error:", err);
});

web3.currentProvider.on('end', (err) => {
  console.error("WebSocket Closed:", err);
});
