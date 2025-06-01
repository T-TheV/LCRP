import shopData from './shop_furniture.json';

let furnitureBrowser: BrowserMp | null = null;
let browserVisible = false;
let previewObject: ObjectMp | null = null;
let currentAxis: 'x' | 'y' | 'z' = 'x';
let isRotation = false;

// Tecla F2 — Alterna o cursor do mouse
mp.keys.bind(0x71, false, () => {
  const isVisible = mp.gui.cursor.visible;
  mp.gui.cursor.show(!isVisible, true);
  mp.gui.chat.activate(isVisible);
  mp.gui.chat.show(isVisible);
});

// Tecla F5 — Toggle do menu de mobílias
mp.keys.bind(0x74, false, () => {
  if (browserVisible) closeFurnitureMenu();
  else openFurnitureMenu();
});

// Tecla ESC — Fecha o menu de mobílias
mp.keys.bind(0x1B, false, () => {
  if (browserVisible) closeFurnitureMenu();
});

// Controles de edição (preview ativo)
mp.keys.bind(0x31, false, () => currentAxis = 'x'); // 1
mp.keys.bind(0x32, false, () => currentAxis = 'y'); // 2
mp.keys.bind(0x33, false, () => currentAxis = 'z'); // 3
mp.keys.bind(0x52, false, () => isRotation = !isRotation); // R
mp.keys.bind(0x25, false, () => adjustObject(-0.05)); // ←
mp.keys.bind(0x27, false, () => adjustObject(0.05));  // →

function adjustObject(amount: number) {
  if (!previewObject) return;
  const pos = previewObject.getCoords(true);
  const rot = previewObject.getRotation(2);

  if (isRotation) {
    if (currentAxis === 'x') previewObject.setRotation(rot.x + amount, rot.y, rot.z, 2, true);
    if (currentAxis === 'y') previewObject.setRotation(rot.x, rot.y + amount, rot.z, 2, true);
    if (currentAxis === 'z') previewObject.setRotation(rot.x, rot.y, rot.z + amount, 2, true);
  } else {
    if (currentAxis === 'x') previewObject.setCoords(pos.x + amount, pos.y, pos.z, true, false, false, false);
    if (currentAxis === 'y') previewObject.setCoords(pos.x, pos.y + amount, pos.z, true, false, false, false);
    if (currentAxis === 'z') previewObject.setCoords(pos.x, pos.y, pos.z + amount, true, false, false, false);
  }
}


// Evento para abrir o menu com dados
mp.events.add('cef:furniture:open', (
  propertyId: string,
  max: number,
  categoriesJson: string,
  furnituresJson: string,
  index: number,
  total: number
) => {
  if (!furnitureBrowser) {
    furnitureBrowser = mp.browsers.new('package://html/furniture.html');
    browserVisible = true;
    furnitureBrowser.execute(`
      window.dispatchEvent(new CustomEvent('shop:load', {
        detail: ${JSON.stringify(shopData)}
      }));
    `);
  }

  mp.gui.cursor.show(true, true);
  mp.gui.chat.activate(false);
  mp.gui.chat.show(false);

  const payload = JSON.stringify({
    propertyId,
    max,
    categories: JSON.parse(categoriesJson),
    furnitures: JSON.parse(furnituresJson),
    index,
    total
  });

  furnitureBrowser.execute(`
    window.dispatchEvent(new CustomEvent('furniture:data', { detail: ${payload} }));
  `);
});

// Evento de fechamento
mp.events.add('cef:furniture:close', () => {
  closeFurnitureMenu();
});

function openFurnitureMenu() {
  if (furnitureBrowser || browserVisible) return;
  furnitureBrowser = mp.browsers.new('package://html/furniture.html');
  browserVisible = true;

  mp.gui.cursor.show(true, true);
  mp.gui.chat.activate(false);
  mp.gui.chat.show(false);

  furnitureBrowser.execute(`
    window.dispatchEvent(new CustomEvent('shop:load', {
      detail: ${JSON.stringify(shopData)}
    }));
  `);
}

function closeFurnitureMenu() {
  if (!furnitureBrowser) return;

  mp.gui.cursor.show(false, false);
  mp.gui.chat.activate(true);
  mp.gui.chat.show(true);

  furnitureBrowser.destroy();
  furnitureBrowser = null;
  browserVisible = false;

  mp.events.callRemote('furniture:closeMenu');
}

// Evento de pré-visualização
mp.events.add('furniture:preview', (model: string) => {
  if (previewObject) {
    previewObject.destroy();
    previewObject = null;
  }

  const playerPos = mp.players.local.position;
  const forward = mp.game.cam.getGameplayCamRot(2);
  const offset = 1.0;

  const previewPos = new mp.Vector3(
    playerPos.x + Math.sin(forward.z * Math.PI / 180) * offset,
    playerPos.y + Math.cos(forward.z * Math.PI / 180) * offset,
    playerPos.z
  );

  const obj = mp.objects.new(mp.game.joaat(model), previewPos);
  obj.setRotation(0, 0, 0, 2, true);
  previewObject = obj;
});

// Evento de confirmação
mp.events.add('furniture:confirmPlacement', () => {
  if (!previewObject) return;

  const pos = previewObject.getCoords(true);
  const rot = previewObject.getRotation(2);
  const model = previewObject.getModel();

  mp.events.callRemote('furniture:confirmPlacement', pos, rot, model);
  previewObject.destroy();
  previewObject = null;
});
