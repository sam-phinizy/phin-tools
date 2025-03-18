import * as assert from 'assert';

import * as vscode from 'vscode';

suite('Extension Test Suite', () => {
  vscode.window.showInformationMessage('Start all tests.');

  test('Extension should be present', () => {
    assert.ok(vscode.extensions.getExtension('publisher.tools-phin-tech'));
  });

  test('Should activate', function() {
    this.timeout(10000);
    const extension = vscode.extensions.getExtension('publisher.tools-phin-tech');
    assert.ok(extension);
    return extension?.activate().then(() => {
      assert.ok(true);
    });
  });
});
