let hudVisible = true;

function toggleHUD() {
  const container = document.getElementById('hud-container');
  hudVisible = !hudVisible;
  container.style.opacity = hudVisible ? '1' : '0';
  container.style.pointerEvents = hudVisible ? 'auto' : 'none';
}

mp.events.add('motorista:atualizarHUD', (data) => {
  const container = document.getElementById('hud-container');
  if (!hudVisible) toggleHUD(); // garantir que aparece ao atualizar

  document.getElementById('rota').innerText = `Rota: ${data.rota}`;
  document.getElementById('voltas').innerText = `Voltas restantes: ${data.voltas}`;
  document.getElementById('embarques').innerText = `Passageiros embarcados: ${data.embarcados}`;
  document.getElementById('avaliacao').innerText = `Avaliação: ${data.avaliacao}/100`;
});

mp.events.add('motorista:fecharHUD', () => {
  document.body.innerHTML = '';
});

document.addEventListener('keydown', (e) => {
  // F9 key (keyCode 120)
  if (e.key === 'F9') {
    toggleHUD();
  }
});
