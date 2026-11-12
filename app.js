"use strict";

// きつね仮想 — v86 (WebAssembly x86 emulator) を使ったブラウザ仮想マシン
// プリセットは同梱のフリーなイメージだけ。Windows / ReactOS / Android-x86 は
// 利用者が自分のファイルを選んだときだけ、その場で読み込んで起動する。

const PRESETS = {
  linux:   { label: "Linux (Buildroot)", cdrom: { url: "images/linux.iso" },  boot_order: 0x213, memory: 32 },
  linux3:  { label: "Linux 3",           cdrom: { url: "images/linux3.iso" }, boot_order: 0x213, memory: 64 },
  kolibri: { label: "KolibriOS",         fda:   { url: "images/kolibri.img" }, boot_order: 0x231, memory: 32 },
  freedos: { label: "FreeDOS",           fda:   { url: "images/freedos722.img" }, boot_order: 0x231, memory: 32 },
};

const farm = document.getElementById("farm");
const template = document.getElementById("box-template");
let counter = 0;
const boxes = new Set();

function setStatus(box, text, running) {
  const el = box.el.querySelector(".status");
  el.textContent = text;
  el.classList.toggle("running", !!running);
}

function focusBox(box) {
  for (const other of boxes) {
    if (other.emu && typeof other.emu.keyboard_set_status === "function") {
      try { other.emu.keyboard_set_status(other === box); } catch (e) { /* older/newer API differences */ }
    }
  }
}

function startEmulator(box, extraConfig) {
  if (box.emu) return;
  const cfg = Object.assign({
    wasm_path: "lib/v86.wasm",
    memory_size: box.memoryMB * 1024 * 1024,
    vga_memory_size: 2 * 1024 * 1024,
    screen_container: box.el.querySelector(".screen_container"),
    bios: { url: "bios/seabios.bin" },
    vga_bios: { url: "bios/vgabios.bin" },
    autostart: true,
    disable_speaker: true,
  }, extraConfig);
  setStatus(box, "起動中…", true);
  try {
    box.emu = new V86(cfg);
  } catch (err) {
    setStatus(box, "起動失敗: " + err.message, false);
    box.emu = null;
    return;
  }
  if (box.emu.add_listener) {
    box.emu.add_listener("emulator-ready", () => setStatus(box, "動作中", true));
  }
  box.powerBtn.textContent = "⏻ 電源OFF";
  focusBox(box);
}

function stopEmulator(box) {
  if (!box.emu) return;
  const emu = box.emu;
  box.emu = null;
  Promise.resolve(emu.destroy ? emu.destroy() : emu.stop()).catch(() => {});
  setStatus(box, "停止中", false);
  box.powerBtn.textContent = "⏻ 電源ON";
  // 画面を初期状態に戻す
  const sc = box.el.querySelector(".screen_container");
  sc.innerHTML = '<div style="white-space: pre; font: 14px monospace; line-height: 14px"></div><canvas style="display: none"></canvas>';
}

function lockMouse(box) {
  if (box.emu && typeof box.emu.lock_mouse === "function") {
    try { box.emu.lock_mouse(); } catch (e) { /* ブラウザが拒否した場合は何もしない */ }
  }
}

async function bootPreset(box) {
  if (box.presetKey === "custom") {
    const file = document.getElementById("custom-file").files[0];
    if (!file) { setStatus(box, "イメージファイルを選んでください", false); return; }
    const type = document.getElementById("custom-type").value;
    const buffer = await file.arrayBuffer();
    const cfg = { boot_order: type === "fda" ? 0x231 : type === "cdrom" ? 0x213 : 0x132 };
    cfg[type] = { buffer };
    if (type === "hda") {
      // 自分のディスクイメージ自体がHDD。保存ボタンで書き戻せるよう参照を保持
      box.hddBuffer = buffer;
      box.el.querySelector('[data-act="hdd-save"]').disabled = false;
    }
    // 空の仮想ハードディスクを追加（CD-ROM / フロッピー接続のとき）
    const hddMB = parseInt(document.getElementById("custom-hdd").value, 10);
    if (type !== "hda" && hddMB > 0) {
      box.hddBuffer = new ArrayBuffer(hddMB * 1024 * 1024);
      cfg.hda = { buffer: box.hddBuffer };
      box.el.querySelector('[data-act="hdd-save"]').disabled = false;
    }
    box.customCfg = cfg;
    startEmulator(box, cfg);
    return;
  }
  const p = PRESETS[box.presetKey];
  const cfg = { boot_order: p.boot_order };
  for (const k of ["cdrom", "fda", "hda"]) if (p[k]) cfg[k] = p[k];
  box.presetCfg = cfg;
  startEmulator(box, cfg);
}

function createBox(presetKey, memoryMB) {
  counter += 1;
  const el = template.content.firstElementChild.cloneNode(true);
  const name = presetKey === "custom" ? "カスタムイメージ" : PRESETS[presetKey].label;
  el.querySelector(".box-title").textContent = `🦊 ${name} #${counter}（RAM ${memoryMB}MB）`;
  farm.appendChild(el);

  const box = { el, emu: null, presetKey, memoryMB, num: counter, powerBtn: el.querySelector('[data-act="power"]') };
  boxes.add(box);

  el.querySelector(".screen_container").addEventListener("mousedown", () => { focusBox(box); lockMouse(box); });
  box.powerBtn.addEventListener("click", () => { box.emu ? stopEmulator(box) : bootPreset(box); });
  el.querySelector('[data-act="mouse"]').addEventListener("click", () => lockMouse(box));
  el.querySelector('[data-act="hdd-save"]').addEventListener("click", () => {
    if (!box.hddBuffer) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([box.hddBuffer], { type: "application/octet-stream" }));
    a.download = `kitsune-hdd-${box.num}.img`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  });
  el.querySelector('[data-act="restart"]').addEventListener("click", () => { if (box.emu && box.emu.restart) box.emu.restart(); });
  el.querySelector('[data-act="cad"]').addEventListener("click", () => {
    if (box.emu && box.emu.keyboard_send_scancodes) {
      // Ctrl(0x1d) + Alt(0x38) + Del(0x53), press & release
      box.emu.keyboard_send_scancodes([0x1d, 0x38, 0x53, 0xd3, 0xb8, 0x9d]);
    }
  });
  el.querySelector('[data-act="save"]').addEventListener("click", async () => {
    if (!box.emu || !box.emu.save_state) return;
    const state = await box.emu.save_state();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([state], { type: "application/octet-stream" }));
    a.download = `kitsune-vm-${box.num}.state.bin`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  });
  el.querySelector('[data-act="restore"]').addEventListener("change", async (ev) => {
    const f = ev.target.files[0];
    if (!f) return;
    if (!box.emu) { await bootPreset(box); }
    const buf = await f.arrayBuffer();
    if (box.emu && box.emu.restore_state) { await box.emu.restore_state(buf); setStatus(box, "動作中（復元済み）", true); }
  });
  el.querySelector('[data-act="full"]').addEventListener("click", () => {
    const sc = el.querySelector(".screen_container");
    if (sc.requestFullscreen) sc.requestFullscreen();
  });
  el.querySelector('[data-act="close"]').addEventListener("click", () => {
    stopEmulator(box);
    boxes.delete(box);
    el.remove();
  });
  return box;
}

// ランチャー
const presetSel = document.getElementById("preset");
presetSel.addEventListener("change", () => {
  const custom = presetSel.value === "custom";
  document.getElementById("custom-row").hidden = !custom;
  document.getElementById("hdd-note").hidden = !custom;
});
document.getElementById("add-box").addEventListener("click", () => {
  const memoryMB = parseInt(document.getElementById("memory").value, 10);
  const box = createBox(presetSel.value, memoryMB);
  bootPreset(box);
});

// 最初に Linux を1台、起動した状態で表示する
window.addEventListener("load", () => {
  const box = createBox("linux", 64);
  bootPreset(box);
});
