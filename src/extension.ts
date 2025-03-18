// filepath: src/extension.ts
import * as fs from "fs";
import * as path from "path";

import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext): void {
  console.log("Clipboard to File Path extension is now active");

  // Key for storing the last used directory in global state
  const LAST_DIR_KEY = "clipboardToFilePath.lastUsedDirectory";

  const disposable = vscode.commands.registerCommand(
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
        let relativePath: string | undefined;

        // Check if the first line matches any of the expected formats
        // Now supporting both # filepath: and // filepath:
        const filepathMatch = firstLine.match(/^(?:#|\/\/)\s*filepath:\s*(.+)$/);
        if (filepathMatch) {
          relativePath = filepathMatch[1].trim();
        } else {
          // Get workspace folder (project root)
          const workspaceFolders = vscode.workspace.workspaceFolders;
          if (!workspaceFolders || workspaceFolders.length === 0) {
            vscode.window.showErrorMessage("No workspace folder is open");
            return;
          }
          const workspaceRoot = workspaceFolders[0].uri.fsPath;

          // Get the last used directory from context
          const lastUsedDirectory = context.globalState.get<string>(LAST_DIR_KEY) || "";

          // Create quick pick with path suggestions
          const quickPick = vscode.window.createQuickPick();
          quickPick.placeholder = "Enter the file path (relative to workspace root)";
          quickPick.title = "Save Clipboard to File";

          // Create a list of suggested directories
          const suggestedDirs = await getSuggestedDirectories(workspaceRoot, lastUsedDirectory);
          
          // Update the items when the user types
          quickPick.onDidChangeValue(async value => {
            // Try to extract the directory part from the input
            const dirPart = path.dirname(value);
            
            // If the directory part is not just '.', update suggested paths
            if (dirPart !== '.' && dirPart !== '') {
              const suggestionsFromInput = await getSuggestedDirectories(
                workspaceRoot, 
                dirPart
              );
              
              // Filter and update items based on the current input
              const items = suggestionsFromInput.map(dir => ({
                label: dir,
                description: path.basename(value) ? `${dir}/${path.basename(value)}` : dir
              }));
              
              quickPick.items = items;
            } else {
              // Use the base suggestions if no directory specified
              quickPick.items = suggestedDirs.map(dir => ({
                label: dir,
                description: path.basename(value) ? `${dir}/${path.basename(value)}` : dir
              }));
            }
          });

          // Set initial items
          quickPick.items = suggestedDirs.map(dir => ({
            label: dir,
            description: dir
          }));

          quickPick.show();

          // Wait for user selection
          const selection = await new Promise<string | undefined>(resolve => {
            quickPick.onDidAccept(() => {
              if (quickPick.selectedItems.length > 0) {
                // If user selected from the list
                if (quickPick.selectedItems[0].description) {
                  resolve(quickPick.selectedItems[0].description);
                } else {
                  resolve(quickPick.selectedItems[0].label);
                }
              } else if (quickPick.value) {
                // If user typed something but didn't select from list
                resolve(quickPick.value);
              } else {
                resolve(undefined);
              }
              quickPick.dispose();
            });
            
            quickPick.onDidHide(() => {
              resolve(undefined);
              quickPick.dispose();
            });
          });

          relativePath = selection;

          if (!relativePath) {
            vscode.window.showInformationMessage("Operation cancelled");
            return;
          }

          // Store the directory part for future use
          const dirPart = path.dirname(relativePath);
          if (dirPart !== '.') {
            await context.globalState.update(LAST_DIR_KEY, dirPart);
          }
        }

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

/**
 * Gets suggested directories based on the workspace structure
 */
async function getSuggestedDirectories(workspaceRoot: string, currentInput: string = ""): Promise<string[]> {
  const result: string[] = [];
  
  // Add the current input directory if it's not empty
  if (currentInput && currentInput !== '.') {
    result.push(currentInput);
  }

  try {
    // Function to recursively scan directories, limited to 3 levels deep
    const scanDirectory = async (dir: string, relativeDir: string, depth: number = 0): Promise<void> => {
      if (depth > 3) return; // Limit depth to avoid performance issues
      
      try {
        const entries = await fs.promises.readdir(dir, { withFileTypes: true });
        
        for (const entry of entries) {
          if (entry.isDirectory()) {
            // Skip common directories to avoid cluttering the suggestions
            if (['node_modules', '.git', 'dist', 'build', 'out'].includes(entry.name)) {
              continue;
            }
            
            const subRelativeDir = path.join(relativeDir, entry.name);
            
            // Add this directory to results
            result.push(subRelativeDir);
            
            // Recursively scan subdirectories
            await scanDirectory(path.join(dir, entry.name), subRelativeDir, depth + 1);
          }
        }
      } catch (error) {
        // Silently handle directory access errors
      }
    };

    // Start scanning from workspace root or the specified input directory
    let startDir = workspaceRoot;
    let startRelativeDir = "";
    
    if (currentInput && currentInput !== '.') {
      const inputAbsolutePath = path.isAbsolute(currentInput) 
        ? currentInput 
        : path.join(workspaceRoot, currentInput);
      
      try {
        if (fs.existsSync(inputAbsolutePath) && fs.statSync(inputAbsolutePath).isDirectory()) {
          startDir = inputAbsolutePath;
          startRelativeDir = currentInput;
        }
      } catch (error) {
        // Silently handle directory access errors
      }
    }
    
    await scanDirectory(startDir, startRelativeDir);
    
    // Sort results for better user experience
    return result.sort();
  } catch (error) {
    return [currentInput].filter(Boolean) as string[];
  }
}

export function deactivate(): void {}