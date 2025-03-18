// filepath: src/test/extension.test.ts
import * as assert from 'assert';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as sinon from 'sinon';

suite('Clipboard to File Path Extension Tests', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'clipboard-test-'));
  let sandbox: sinon.SinonSandbox;

  // Setup before each test
  setup(() => {
    sandbox = sinon.createSandbox();
  });

  // Teardown after each test
  teardown(() => {
    sandbox.restore();
  });

  // Clean up after all tests
  suiteTeardown(() => {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch (error) {
      console.error(`Failed to remove temp dir: ${error}`);
    }
  });

  test('Extension should be present', () => {
    assert.ok(vscode.extensions.getExtension('phin-tech.phin-tools'));
  });

  test('Command should be registered', async () => {
    const commands = await vscode.commands.getCommands();
    assert.ok(commands.includes('extension.clipboardToFilePath'));
  });

  test('Should extract filepath from markdown comment format', async () => {
    // Mock clipboard content
    const clipboardContent = '# filepath: test/example.txt\nThis is test content';
    const readTextStub = sandbox.stub(vscode.env.clipboard, 'readText').resolves(clipboardContent);
    
    // Mock file system and workspace
    const workspaceFoldersStub = sandbox.stub(vscode.workspace, 'workspaceFolders').value([
      { uri: { fsPath: tempDir }, name: 'test', index: 0 }
    ]);
    
    const existsSyncStub = sandbox.stub(fs, 'existsSync').returns(false);
    const mkdirSyncStub = sandbox.stub(fs, 'mkdirSync');
    const writeFileSyncStub = sandbox.stub(fs, 'writeFileSync');
    
    // Mock document opening
    const expectedPath = path.join(tempDir, 'test/example.txt');
    const openTextDocumentStub = sandbox.stub(vscode.workspace, 'openTextDocument').resolves({} as any);
    const showTextDocumentStub = sandbox.stub(vscode.window, 'showTextDocument').resolves();
    
    // Execute command
    await vscode.commands.executeCommand('extension.clipboardToFilePath');
    
    // Verify results
    assert.ok(readTextStub.calledOnce);
    assert.ok(existsSyncStub.calledWith(expectedPath));
    assert.ok(writeFileSyncStub.calledWith(expectedPath, clipboardContent));
    assert.ok(openTextDocumentStub.calledOnce);
    assert.ok(showTextDocumentStub.calledOnce);
  });

  test('Should extract filepath from code comment format', async () => {
    // Mock clipboard content
    const clipboardContent = '// filepath: src/utils.js\nconst add = (a, b) => a + b;';
    const readTextStub = sandbox.stub(vscode.env.clipboard, 'readText').resolves(clipboardContent);
    
    // Mock file system and workspace
    const workspaceFoldersStub = sandbox.stub(vscode.workspace, 'workspaceFolders').value([
      { uri: { fsPath: tempDir }, name: 'test', index: 0 }
    ]);
    
    const existsSyncStub = sandbox.stub(fs, 'existsSync').returns(false);
    const mkdirSyncStub = sandbox.stub(fs, 'mkdirSync');
    const writeFileSyncStub = sandbox.stub(fs, 'writeFileSync');
    
    // Mock document opening
    const expectedPath = path.join(tempDir, 'src/utils.js');
    const openTextDocumentStub = sandbox.stub(vscode.workspace, 'openTextDocument').resolves({} as any);
    const showTextDocumentStub = sandbox.stub(vscode.window, 'showTextDocument').resolves();
    
    // Execute command
    await vscode.commands.executeCommand('extension.clipboardToFilePath');
    
    // Verify results
    assert.ok(readTextStub.calledOnce);
    assert.ok(existsSyncStub.calledWith(expectedPath));
    assert.ok(writeFileSyncStub.calledWith(expectedPath, clipboardContent));
    assert.ok(openTextDocumentStub.calledOnce);
    assert.ok(showTextDocumentStub.calledOnce);
  });

  test('Should prompt for filepath when not found in clipboard', async () => {
    // Mock clipboard content without filepath
    const clipboardContent = 'This is just some text without a filepath comment';
    const readTextStub = sandbox.stub(vscode.env.clipboard, 'readText').resolves(clipboardContent);
    
    // Mock file system and workspace
    const workspaceFoldersStub = sandbox.stub(vscode.workspace, 'workspaceFolders').value([
      { uri: { fsPath: tempDir }, name: 'test', index: 0 }
    ]);
    
    // Mock QuickPick
    const showStub = sandbox.stub().returns();
    const disposeStub = sandbox.stub().returns();
    let onDidAcceptCallback: () => void;
    let onDidHideCallback: () => void;
    
    const quickPickStub = {
      placeholder: '',
      title: '',
      items: [],
      onDidChangeValue: sandbox.stub().callsFake((callback: (value: string) => void) => {
        // Store callback for later use
        return { dispose: () => {} };
      }),
      onDidAccept: sandbox.stub().callsFake((callback: () => void) => {
        onDidAcceptCallback = callback;
        return { dispose: () => {} };
      }),
      onDidHide: sandbox.stub().callsFake((callback: () => void) => {
        onDidHideCallback = callback;
        return { dispose: () => {} };
      }),
      selectedItems: [{ label: 'src', description: 'src/custom.js' }],
      value: '',
      show: showStub,
      dispose: disposeStub
    };
    
    const createQuickPickStub = sandbox.stub(vscode.window, 'createQuickPick').returns(quickPickStub as any);
    
    // Mock file operations
    const existsSyncStub = sandbox.stub(fs, 'existsSync').returns(false);
    const mkdirSyncStub = sandbox.stub(fs, 'mkdirSync');
    const writeFileSyncStub = sandbox.stub(fs, 'writeFileSync');
    
    // Mock getSuggestedDirectories
    sandbox.stub(fs.promises, 'readdir').resolves([
      { name: 'src', isDirectory: () => true },
      { name: 'test', isDirectory: () => true },
      { name: 'node_modules', isDirectory: () => true }
    ] as any[]);
    
    // Mock document opening
    const expectedPath = path.join(tempDir, 'src/custom.js');
    const openTextDocumentStub = sandbox.stub(vscode.workspace, 'openTextDocument').resolves({} as any);
    const showTextDocumentStub = sandbox.stub(vscode.window, 'showTextDocument').resolves();
    
    // Execute command
    const commandPromise = vscode.commands.executeCommand('extension.clipboardToFilePath');
    
    // Simulate user selecting an item
    if (onDidAcceptCallback) {
      onDidAcceptCallback();
    }
    
    await commandPromise;
    
    // Verify results
    assert.ok(readTextStub.calledOnce);
    assert.ok(createQuickPickStub.calledOnce);
    assert.ok(showStub.calledOnce);
    assert.ok(disposeStub.calledOnce);
    assert.ok(writeFileSyncStub.calledWith(expectedPath, clipboardContent));
    assert.ok(openTextDocumentStub.calledOnce);
    assert.ok(showTextDocumentStub.calledOnce);
  });

  test('Should handle file overwrite confirmation', async () => {
    // Mock clipboard content
    const clipboardContent = '# filepath: existing.txt\nThis will overwrite existing file';
    const readTextStub = sandbox.stub(vscode.env.clipboard, 'readText').resolves(clipboardContent);
    
    // Mock file system and workspace
    const workspaceFoldersStub = sandbox.stub(vscode.workspace, 'workspaceFolders').value([
      { uri: { fsPath: tempDir }, name: 'test', index: 0 }
    ]);
    
    // File exists
    const existsSyncStub = sandbox.stub(fs, 'existsSync').returns(true);
    const mkdirSyncStub = sandbox.stub(fs, 'mkdirSync');
    const writeFileSyncStub = sandbox.stub(fs, 'writeFileSync');
    
    // Mock confirmation dialog
    const showWarningMessageStub = sandbox.stub(vscode.window, 'showWarningMessage').resolves('Yes' as any);
    
    // Mock document opening
    const expectedPath = path.join(tempDir, 'existing.txt');
    const openTextDocumentStub = sandbox.stub(vscode.workspace, 'openTextDocument').resolves({} as any);
    const showTextDocumentStub = sandbox.stub(vscode.window, 'showTextDocument').resolves();
    
    // Execute command
    await vscode.commands.executeCommand('extension.clipboardToFilePath');
    
    // Verify results
    assert.ok(readTextStub.calledOnce);
    assert.ok(existsSyncStub.calledWith(expectedPath));
    assert.ok(showWarningMessageStub.calledOnce);
    assert.ok(writeFileSyncStub.calledWith(expectedPath, clipboardContent));
    assert.ok(openTextDocumentStub.calledOnce);
    assert.ok(showTextDocumentStub.calledOnce);
  });

  test('Should cancel operation if user declines overwrite', async () => {
    // Mock clipboard content
    const clipboardContent = '# filepath: existing.txt\nThis will try to overwrite existing file';
    const readTextStub = sandbox.stub(vscode.env.clipboard, 'readText').resolves(clipboardContent);
    
    // Mock file system and workspace
    const workspaceFoldersStub = sandbox.stub(vscode.workspace, 'workspaceFolders').value([
      { uri: { fsPath: tempDir }, name: 'test', index: 0 }
    ]);
    
    // File exists
    const existsSyncStub = sandbox.stub(fs, 'existsSync').returns(true);
    const writeFileSyncStub = sandbox.stub(fs, 'writeFileSync');
    
    // Mock confirmation dialog - user says No
    const showWarningMessageStub = sandbox.stub(vscode.window, 'showWarningMessage').resolves('No' as any);
    
    // Mock info message
    const showInfoMessageStub = sandbox.stub(vscode.window, 'showInformationMessage');
    
    // Execute command
    await vscode.commands.executeCommand('extension.clipboardToFilePath');
    
    // Verify results
    assert.ok(readTextStub.calledOnce);
    assert.ok(existsSyncStub.calledWith(path.join(tempDir, 'existing.txt')));
    assert.ok(showWarningMessageStub.calledOnce);
    assert.ok(writeFileSyncStub.notCalled);
    assert.ok(showInfoMessageStub.calledWith("Operation cancelled"));
  });

  test('Should handle empty clipboard', async () => {
    // Mock empty clipboard
    const readTextStub = sandbox.stub(vscode.env.clipboard, 'readText').resolves('');
    
    // Mock error message
    const showErrorMessageStub = sandbox.stub(vscode.window, 'showErrorMessage');
    
    // Execute command
    await vscode.commands.executeCommand('extension.clipboardToFilePath');
    
    // Verify results
    assert.ok(readTextStub.calledOnce);
    assert.ok(showErrorMessageStub.calledWith("Clipboard is empty"));
  });
});