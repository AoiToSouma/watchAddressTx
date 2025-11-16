# 機能概要
このツールはWeb3 v1を用いてWebSocket経由で接続し、pending トランザクションと最新ブロックを共に監視して、指定アドレスが from または to に含まれる場合にログ出力します。<br>
ChatGTPによるVibe Codingです。

## 前提
リアルタイム監視は web3.js 1.x でのみ正式サポートされています。<br>
以下はChatGTPによる解説です。
### 最新Web3.jsでsubscribe が廃止された理由（公式方針）
#### ✅ 1. Web3.js v4 は「最小・純粋な RPC クライアント」を目指すため
web3.js v4 の設計思想は以下です：
> 「EIP-1193 に従うシンプルな RPC クライアントにする」<br>
「不要な抽象化や特殊機能を排除する」

WebSocket の ```eth_subscribe``` は RPC ではありますが、RPC クライアントとしては扱うべきでない “特殊機能” と見なされました。<br>
そのためサブスクリプション系 API は削除。

#### ✅ 2. WebSocket のサポート維持コストが高すぎるため
WebSocket は実装が複雑で、
- コネクションの維持
- 自動 reconnection
- エラー処理
- サブスク破棄
- パフォーマンス問題

など、多くの部分を web3.js が「隠蔽」してきました。<br>
チームは以下の課題を挙げています：
- Node.js / browser 両対応の実装を維持するのが困難
- プラグイン依存・プロバイダ依存でバグが多かった
- 全体の保守性を悪化させていた

→ web3.js v4 は “シンクライアント” を目指すため削除。

#### ✅ 3. Alchemhy / Infura / MetaMask などの provider が独自に subscribe を提供する時代になった
最近は RPC プロバイダ側で以下のような 高機能サブスク API が提供されています。
- Alchemy：Mempool API / Notify API
- Infura：Pub/Sub
- QuickNode：持続的な mempool streaming

→ WebSocket をライブラリ側で抱える必要がなくなった。<br>
web3.js v4 は “provider に任せる” 方向に移行。

#### ✅ 4. web3.js と ethers.js の方向性が似るよう調整された
ethers.js が WebSocket を廃止したのと同じ理由です。
- ethers.js v6 も WebSocket Provider を削除
- 各 provider に任せる方針へ
両者が「RPC クライアントとして統一的な API」を目指した結果、WebSocket は削除対象となりました。

#### 📌 結論：subscribe は「重くて相性が悪い機能」だった
web3.js v4 チームの意図は次の通りです：
- ライブラリとしては RPC の薄いレイヤーに徹したい
- WebSocket は provider や別ライブラリが持つべき
- ethers.js と同じ方向へ寄せる

# 使い方
## リポジトリのクローン
```
git clone https://github.com/AoiToSouma/watchAddressTx.git
cd watchAddressTx
```
## 環境設定
```sample.config.json```をリネームして、編集してください。
```
mv sample.config.json config.json
nano config.json
```
- ```wssNode``` : WS-Nodeを指定します。
- ```targetAddress``` : 監視したいアドレス(0x)を指定します。

## 実行
```
npm install
```
```
node watchAddressTx.js
```

### 実行結果
```
=================================

----- Pending Transaction Detected -----
TX Hash: 0x123456789abcdef123456789abcdef123456789abcdef123456789abcdef1234
From: 0xfromAddress
To: 0xtoAddress
Value: 0 ETH
----------------------------------------

===== Confirmed Transaction =====
Block: 99999999
TX Hash: 0x123456789abcdef123456789abcdef123456789abcdef123456789abcdef1234
From: 0xfromAddress
To: 0xtoAddress
Value: 0 ETH
Timestamp: 2025-11-01T00:00:00.000Z
=================================
```