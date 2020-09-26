import { promises } from "fs";
import { stringify } from "querystring";
import { callbackify } from "util";
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as fs from "fs";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log("generate-exclude-cs extension is now active.");

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    "generate-exclude-cs.generateSettingsFile",
    () => {
      // The code you place here will be executed every time your command is executed
      vscode.window
        .showInputBox({
          prompt: "Generate settings.json file?",
          placeHolder: "Y/n",
          validateInput: function (
            value: string
          ): string | Thenable<string | null | undefined> | null | undefined {
            if (value.toLowerCase() === "y" || value.toLowerCase() === "n") {
              return null;
            } else {
              return "Invalid answer.";
            }
          },
        })
        .then((input) => {
          if (input?.toLowerCase() === "y") {
            generateSettingsFile()
              .then(() => {
                vscode.window.showInformationMessage(
                  "Created settings.json file!"
                );
              })
              .catch((err) => {
                vscode.window.showErrorMessage(err);
              });
          }
        });
    }
  );

  context.subscriptions.push(disposable);
}

const generateSettingsFile = () =>
  new Promise(
    (resolve: () => void, reject: (error: string) => string | void) => {
      const folders = vscode.workspace.workspaceFolders;
      if (folders === undefined) {
        reject("You need to open a folder to generate settings.json file.");
      } else {
        let rootPath = folders[0].uri.fsPath;
        fs.access(rootPath.toString(), (err) => {
          if (err) {
            reject("Error: " + err.message);
          } else {
            fs.mkdir(`${rootPath}\\.vscode\\`, (err) => {
              if (err && err.code !== "EEXIST") {
                reject("Error: " + err.code);
              } else {
                fs.access(`${rootPath}\\.vscode\\settings.json`, (err) => {
                  if (!err) {
                    reject("Error: settings.json file already exist");
                  }
                });

                let data = {
                  "files.exclude": {
                    "**/bin": true,
                    "**/obj": true,
                    "**/*.csproj": true,
                    "**/*.sln": true,
                  },
                };
                let json = JSON.stringify(data, null, "\t");

                fs.writeFile(
                  `${rootPath}\\.vscode\\settings.json`,
                  json,
                  { encoding: "utf8" },
                  (err) => {
                    if (err) {
                      reject("Error: " + err.message);
                    } else {
                      resolve();
                    }
                  }
                );
              }
            });
          }
        });
      }
    }
  );

// this method is called when your extension is deactivated
export function deactivate() {}
