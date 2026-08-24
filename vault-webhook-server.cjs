// Express routing rule inside vault-webhook-server.cjs on Port 3050:
app.post('/webhook/:vaultName', async (req, res) => {
  const { vaultName } = req.params;
  const filename = req.query.filename || `Zettel_${Date.now()}.md`;
  const { content, append } = req.body;

  // Enforce directory isolation rules (e.g. sandbox_vault)
  const targetDir = path.join(process.cwd(), 'vaults', vaultName);
  const targetFile = path.join(targetDir, filename);

  try {
    await fs.mkdir(targetDir, { recursive: true });
    
    if (append) {
      await fs.appendFile(targetFile, `\n${content}`, 'utf-8');
      console.log(`[Synced] Appended content to local file: ${targetFile}`);
    } else {
      await fs.writeFile(targetFile, content, 'utf-8');
      console.log(`[Synced] Created/Overwrote local file: ${targetFile}`);
    }

    res.json({ success: true, file: filename });
  } catch (err) {
    console.error(`[Error] Failed to write payload: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});