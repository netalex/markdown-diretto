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
      if (!tab || tab.type !== 'messageCompose')
        throw new Error('Apri una finestra di composizione.');
      const details = await messenger.compose.getComposeDetails(tab.id);
      if (details.isPlainText)
        throw new Error(
          'Serve un messaggio in formato HTML. Abilita la composizione HTML nelle impostazioni dell’account.',
        );
      for (const file of ['vendor/marked.js', 'renderer.js', 'compose.js']) {
        await messenger.tabs.executeScript(tab.id, { file });
      }
      const [result] = await messenger.tabs.executeScript(tab.id, {
        code: `globalThis.MarkdownDiretto.${action}()`,
      });
      if (!result?.ok) throw new Error(result?.error || 'Operazione non completata.');
      await messenger.compose.setComposeDetails(tab.id, { isModified: true });
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
