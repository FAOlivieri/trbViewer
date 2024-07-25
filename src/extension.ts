import * as vscode from 'vscode';
import { exec } from 'child_process';

export function activate(context: vscode.ExtensionContext) {
    // Create a file system watcher for .trb files
    const trbWatcher = vscode.workspace.createFileSystemWatcher('**/*.trb');

    // Register the event for when a .trb file is opened or changed
    trbWatcher.onDidChange(onTrbFileChanged);
    trbWatcher.onDidCreate(onTrbFileChanged);

    context.subscriptions.push(trbWatcher);


    vscode.workspace.onDidOpenTextDocument(document => {
        if (document.fileName.endsWith('.trb')) {
            onTrbFileChanged(document.uri);
        }
    });

    // Check for any already open .trb files and run the command
    vscode.workspace.textDocuments.forEach(document => {
        if (document.fileName.endsWith('.trb')) {
            onTrbFileChanged(document.uri);
        }
    });
}

function onTrbFileChanged(uri: vscode.Uri) {
    const filePath = uri.fsPath;  
    exec(`python -m pickle ${filePath}`, (error, stdout, stderr) => {
        if (error) {
            displayOutput(`Error: ${stderr}`);
            return;
        }
        displayOutput(stdout);
    });
}

function displayOutput(output: string) {
    vscode.workspace.openTextDocument({ content: output, language: 'plaintext' })
        .then(document => {
            return vscode.window.showTextDocument(document);
        })
        .then(() => {
        });

}

export function deactivate() {
}