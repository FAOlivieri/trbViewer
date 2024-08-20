import * as vscode from 'vscode';
import { exec } from 'child_process';

export function activate(context: vscode.ExtensionContext) {
    
    // Create a file system watcher for .trb files
    const trbWatcher = vscode.workspace.createFileSystemWatcher('**/*.trb');
    
    // Register the event for when a .trb file is opened or changed
    //trbWatcher.onDidChange(onTrbFileChanged);
    //trbWatcher.onDidCreate(onTrbFileChanged);

    //context.subscriptions.push(trbWatcher);

    vscode.workspace.onDidOpenTextDocument(document => {
        if (document.fileName.endsWith('.trb')) {
            const document_uri=document.uri;

            vscode.window.showTextDocument(document.uri, {preview: true, preserveFocus: false})
            .then(() => {
                return vscode.commands.executeCommand('workbench.action.closeActiveEditor');
            });
            onTrbFileChanged(document_uri);
            
        }
    });
}

function getPythonInterpreterPath(): string {
    const pythonConfig = vscode.workspace.getConfiguration('python');
    const defaultInterpreterPath = pythonConfig.get<string>('defaultInterpreterPath');
    
    // Fall back to a global default if `defaultInterpreterPath` is not set
    return defaultInterpreterPath || 'python';
}

function onTrbFileChanged(uri: vscode.Uri) {
    const filePath = uri.fsPath;  
    const pythonPath = getPythonInterpreterPath();
    const command = [pythonPath, `-m pickle`, filePath].join(' ');


    exec(command, (error, stdout, stderr) => {
        if (error) {
            displayOutput(`Error: ${stderr}`,filePath.toString());
            return;
        }
        displayOutput(stdout, filePath.toString());
    });
}

function displayOutput(output: string, filename: string) {
    vscode.workspace.openTextDocument({ content: output, language: 'plaintext' })
        .then(document => {
            return vscode.window.showTextDocument(document);
       });

}

export function deactivate() {
}