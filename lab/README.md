# Misagi Animation Effect Lab

このページは、Misagi Animation の演出ストックを一覧で確認し、
デモをすぐに開けるようにするためのラボページです。

## どうやって演出を追加する？
1. `effects/` に新しい演出ファイルを追加します。
2. `effects/registry.js` に演出を登録します。
3. この `lab/index.html` のテーブルに、id / 名前 / 説明 / デモリンクを追加します。

## どのURLで確認できる？
- ラボページ: `/lab/`
- 演出デモ: `/?fx=fall` のように `?fx=演出id` を付けます。
  - 複数の場合は `/?fx=fall,scroll` のようにカンマ区切りで指定します。
