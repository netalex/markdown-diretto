/* global messenger */
const status = document.getElementById('status');
for (const action of ['render', 'restore']) {
  document.getElementById(action).addEventListener('click', async () => {
    const buttons = [...document.querySelectorAll('button')];
    buttons.forEach((button) => {
      button.disabled = true;
    });
    try {
      const [tab] = await messenger.tabs.query({ active: true, currentWindow: true });
      if (!tab || !['mail', 'messageDisplay'].includes(tab.type)) {
        throw new Error(
          'Apri un singolo messaggio nel riquadro di lettura, in una scheda o in una finestra.',
        );
      }
      for (const file of ['vendor/marked.js', 'renderer.js', 'reader.js']) {
        await messenger.tabs.executeScript(tab.id, { file });
      }
      const [result] = await messenger.tabs.executeScript(tab.id, {
        code: `globalThis.MarkdownDirettoReader.${action}()`,
      });
      if (!result?.ok)
        throw new Error(result?.error || 'Impossibile cambiare la vista del messaggio.');
      status.textContent = result.message;
    } catch (error) {
      status.textContent = error.message;
    } finally {
      buttons.forEach((button) => {
        button.disabled = false;
      });
    }
  });
}
