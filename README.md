# 🦊 きつね仮想

ブラウザの中で本物のOSを起動する仮想マシンサイトです。
[BoxLinuxFarm（旧 FarmSub）](https://www.farmsub.com/) と同じ **v86（WebAssembly版 x86エミュレーター）** の仕組みを使っています。
インストール不要・登録不要で、計算はすべて訪問者のブラウザの中で行われます。

## できること

- **複数台の同時起動** — 「マシンを追加」で何台でも並べて動かせます（端末の性能によります）
- **同梱OSですぐ起動**
  - Linux（Buildroot・コンソール）… 起動確認済み（カーネルが起動してシェル `/root%` が出ます）
  - Linux 3（グラフィカル）
  - KolibriOS（軽量GUI）
  - FreeDOS
- **自分のイメージファイルから起動** — .iso / .img を選んで CD-ROM / ハードディスク / フロッピーとして接続できます
- **状態の保存・復元** — スナップショットをファイルに書き出して、次回続きから再開できます
- **仮想ハードディスク** — 自分のイメージで起動するときに空のHDD（512MB / 1GB / 2GB）を追加できます。Windows 98 / ME などのインストール先に使え、インストール後は「💽 HDDを保存」でディスクイメージをダウンロードして、次回はそれを読み込んで続きから使えます
- **マウスロック** — 画面をクリックするとマウスがロックされ、仮想マシン内のカーソルと動きが合います（解除は Esc）
- 再起動、Ctrl+Alt+Del、全画面表示

## 正直な対応表（ここ大事）

| OS | 状態 |
|---|---|
| Linux（32bit） | ◎ 同梱イメージで実際に起動します |
| FreeDOS / KolibriOS | ◎ 同梱イメージで起動します |
| Windows 98 / 2000 / XP | △ 自分の正規イメージを読み込めば起動可能（v86の実績あり）。このリポジトリにはWindowsのイメージは**含まれません** |
| Windows 10 / 11 | ✕ 64bit必須のためブラウザエミュレーションでは動きません |
| ReactOS | △ Windows互換の無料OS。公式ISOを自分で読み込んでください |
| Android | △ 実験扱い。v86公式の互換表でも「Androidはまともに動作しない（シェルが出る程度）」とされています。Android-x86の古いISOで試すことはできますが、実用は期待しないでください |

v86は32bit x86エミュレーターです。今どきの64bit OS全般は動きません。これは仕様上の限界で、このサイト側では回避できません。

## GitHub Pagesで公開する手順

1. GitHubで新しいリポジトリを作る（名前は `kitsune-kasou`、Public）
2. このフォルダの中身をすべてリポジトリ直下にアップロードする
   - gitが使える場合：
     ```bash
     git init
     git add .
     git commit -m "きつね仮想 初版"
     git branch -M main
     git remote add origin https://github.com/eb1g/kitsune-kasou.git
     git push -u origin main
     ```
3. リポジトリの **Settings → Pages** で、Source を **Deploy from a branch**、Branch を **main / (root)** にして Save
4. 数分待つと `https://eb1g.github.io/kitsune-kasou/` で公開されます

> 注意：`index.html` をダブルクリック（file://）では動きません。必ず http(s) で配信してください。ローカル確認は `python3 -m http.server 8000` で開けます。

## ファイル構成

```
index.html   画面
style.css    デザイン
app.js       仮想マシンの追加・起動・保存/復元の処理
lib/         v86エンジン（libv86.js / v86.wasm）
bios/        SeaBIOS / VGA BIOS
images/      同梱OSイメージ（フリーなものだけ）
.nojekyll    GitHub Pagesでそのまま配信するための印
```

## ライセンス・クレジット

- エミュレーター: [v86](https://github.com/copy/v86)（ライセンスは `lib/LICENSE-v86.txt`）
- 同梱イメージは v86プロジェクトがテスト用に配布しているフリーなイメージ（Buildroot Linux / FreeDOS / KolibriOS）です
- Windows / Android 等のイメージは含みません。権利のあるファイルだけを読み込んで使ってください
