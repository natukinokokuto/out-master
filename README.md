# OUT MASTER v10.13.5

## 今回の修正

- `v10.13.1` キャッシュ迷宮対策として全ファイル参照に `?v=10.13.5` を付与
- Service Worker の `skipWaiting()` / `clients.claim()` / 旧cache全削除を追加
- iPhone PWAでタップ不能になりやすい透明レイヤー対策をCSSに追加
- 非表示screenは `display:none` + `pointer-events:none` を強制
- SETTINGSに `Clear PWA cache` ボタンを追加
- BGM/SE音量調整を維持

## iPhoneでまだ古い場合

1. ホーム画面のOUT MASTERを削除
2. Safariの履歴とWebサイトデータを削除
3. Safariを完全終了
4. URLを開き直す
5. ホーム画面に追加し直す

## 注意

このZIPは、直前の完全ソースが無い状態で作った `v10.13.5 応急修正版` です。
前の細かいUIや実SEファイルを完全再現したものではなく、タップ不能・PWAキャッシュ突破を優先しています。
