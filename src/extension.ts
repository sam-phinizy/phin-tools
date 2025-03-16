// clipboard-to-filepath.ts
import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

export function activate(context: vscode.ExtensionContext) {
  console.log("Clipboard to File Path extension is now active");

  let disposable = vscode.commands.registerCommand(
    "extension.clipboardToFilePath",
    async () => {
      try {
        // Get clipboard content
        const clipboardContent = await vscode.env.clipboard.readText();
        if (!clipboardContent) {
          vscode.window.showErrorMessage("Clipboard is empty");
          return;
        }

        // Parse the first line to extract the filepath
        const lines = clipboardContent.split("\n");
        const firstLine = lines[0].trim();

        // Check if the first line matches the expected format
        const filepathMatch = firstLine.match(/^#\s*filepath:\s*(.+)$/);
        if (!filepathMatch) {
          vscode.window.showErrorMessage(
            'First line does not contain a valid filepath comment (e.g. "# filepath: path/to/file.ext")'
          );
          return;
        }

        const relativePath = filepathMatch[1].trim();

        // Get workspace folder (project root)
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
          vscode.window.showErrorMessage("No workspace folder is open");
          return;
        }

        const workspaceRoot = workspaceFolders[0].uri.fsPath;
        const absolutePath = path.join(workspaceRoot, relativePath);

        // Check if file already exists
        if (fs.existsSync(absolutePath)) {
          const answer = await vscode.window.showWarningMessage(
            `File '${relativePath}' already exists. Do you want to overwrite it?`,
            { modal: true },
            "Yes",
            "No"
          );

          if (answer !== "Yes") {
            vscode.window.showInformationMessage("Operation cancelled");
            return;
          }
        }

        // Create directories if they don't exist
        const directory = path.dirname(absolutePath);
        if (!fs.existsSync(directory)) {
          fs.mkdirSync(directory, { recursive: true });
        }

        // Write content to the file
        fs.writeFileSync(absolutePath, clipboardContent);

        vscode.window.showInformationMessage(
          `File written to: ${relativePath}`
        );

        // Open the file
        const document = await vscode.workspace.openTextDocument(absolutePath);
        await vscode.window.showTextDocument(document);
      } catch (error) {
        vscode.window.showErrorMessage(
          `Error: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
