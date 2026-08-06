import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind
} from "vscode-languageclient/node";

let client: LanguageClient | undefined;

export function activate(context: vscode.ExtensionContext): void {
  const serverPath = resolveServerPath(context);
  if (serverPath === undefined) {
    return;
  }

  const serverOptions: ServerOptions = {
    command: serverPath,
    transport: TransportKind.stdio
  };

  const clientOptions: LanguageClientOptions = {
    documentSelector: [{ scheme: "file", language: "loom" }],
    synchronize: {
      fileEvents: vscode.workspace.createFileSystemWatcher("**/loom-config.toml")
    }
  };

  client = new LanguageClient("loom", "Loom Language Server", serverOptions, clientOptions);
  context.subscriptions.push(client);
  void client.start();
}

export function deactivate(): Thenable<void> | undefined {
  return client?.stop();
}

function resolveServerPath(context: vscode.ExtensionContext): string | undefined {
  const configuredPath = vscode.workspace.getConfiguration("loom").get<string>("languageServerPath");
  if (configuredPath !== undefined && configuredPath.length > 0) {
    if (!fs.existsSync(configuredPath)) {
      void vscode.window.showErrorMessage(`Loom: the 'loom.languageServerPath' setting points to a file that doesn't exist: ${configuredPath}`);
      return undefined;
    }

    return configuredPath;
  }

  const executableName = process.platform === "win32" ? "Loom.LanguageServer.exe" : "Loom.LanguageServer";
  const bundledPath = path.join(context.extensionPath, "server", executableName);
  if (!fs.existsSync(bundledPath)) {
    void vscode.window.showErrorMessage(
      "Loom: no bundled language server was found for this platform. Set 'loom.languageServerPath' to a Loom.LanguageServer executable."
    );

    return undefined;
  }

  return bundledPath;
}
