/*
【ファイル】effects/registry.js
【役割】演出の一覧をまとめる
【触ってOK】import と配列の順番
【注意】ここに登録しないと ?fx=... で呼べない
【関連】effects/*.js / script.js
【確認】/lab/ の一覧を更新して確認
*/
// ===== 調整パラメータ（ここだけ触ってOK）=====
// 登録したい演出を import して配列に入れる
// ===== ここから下は基本触らない =====
import { effect as fall } from "./fall.js";
import { effect as scroll } from "./scroll.js";
import { effect as scrollDaynight } from "./scroll-daynight.js";
import { effect as scrollWind } from "./scroll-wind.js";
import { effect as scrollParallax } from "./scroll-parallax.js";
import { effect as scrollRevealText } from "./scroll-reveal-text.js";
import { effect as scrollCloudbreak } from "./scroll-cloudbreak.js";

export const effects = [
  fall,
  scroll,
  scrollDaynight,
  scrollWind,
  scrollParallax,
  scrollRevealText,
  scrollCloudbreak,
];
