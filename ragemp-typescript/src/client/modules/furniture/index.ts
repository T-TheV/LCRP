// client/modules/furniture/index.ts

let furnitureBrowser: BrowserMp | null = null;

// Alterna o cursor com F2 (pode ser alterado)
mp.keys.bind(0x71, false, () => {
  mp.gui.cursor.show(!mp.gui.cursor.visible, true);
});

// Atalho para teste: abre manualmente o HTML com F5
mp.keys.bind(0x74, false, () => {
  if (furnitureBrowser) return;

  mp.gui.cursor.show(true, true);
  mp.gui.chat.activate(false);
  mp.gui.chat.show(false);
  furnitureBrowser = mp.browsers.new('package://html/furniture.html');
});

// Abre o menu de mobílias com dados
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
  }

  mp.gui.cursor.show(true, true);
  mp.gui.chat.activate(false);
  mp.gui.chat.show(false);

  mp.events.call('cef:furniture:sendData', propertyId, max, categoriesJson, furnituresJson, index, total);
});

// Envia os dados ao HTML assim que ele estiver pronto
mp.events.add('cef:furniture:sendData', (
  propertyId: string,
  max: number,
  categoriesJson: string,
  furnituresJson: string,
  index: number,
  total: number
) => {
  if (!furnitureBrowser) return;

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

// Fecha o menu
mp.events.add('cef:furniture:close', () => {
  mp.gui.cursor.show(false, false);
  mp.gui.chat.activate(true);
  mp.gui.chat.show(true);

  if (furnitureBrowser) {
    furnitureBrowser.destroy();
    furnitureBrowser = null;
  }

  mp.events.callRemote('furniture:closeMenu');
});
