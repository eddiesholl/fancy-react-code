import * as R from 'ramda';
// import R = require('ramda');
const path = require('path');
import * as vscode from 'vscode';

import { FancyReactSettings, Project, TestStructure, IIDE } from 'fancy-react-core';

export const loadConfigItems = (ide: IIDE): Project => {

  const extensionConfig = vscode.workspace.getConfiguration('fancy-react');
  
  const pathFromProject = vscode.workspace.workspaceFolders!.shift();

  if (pathFromProject === undefined) {
    throw new Error('Could not find the current project root');
  } else {
    /*const editor = atom.workspace.getActivePaneItem()
    const pathFromEditor = editor ? pathEnv.getProjectRoot(editor.getPath()) : ''*/
    const projectRoot = pathFromProject.uri.fsPath; //|| pathFromEditor

    let pkgJson = {
      fancyReact: undefined
    };

    try {
      pkgJson = require(`${projectRoot}/package.json`);
    } catch (e) {
      ide.log(`Could not load package.json from project folder '${projectRoot}'`);
    }

    const userConfigItems = {
      packagePath: extensionConfig.get<string>("packagePath"),
      sourcePath: extensionConfig.get<string>("sourcePath"),
      testPath: extensionConfig.get<string>("testPath"),
      testSuffix: extensionConfig.get<string>("testSuffix"),
      testStructure: extensionConfig.get<string>("testStructure")
    };

    // srcInsideProject: path.join('/' + configItems.packagePath, configItems.sourcePath),
    // testInsideProject: path.join('/' + configItems.packagePath, configItems.testPath),

    const mergedSettings = R.merge(userConfigItems as FancyReactSettings, pkgJson.fancyReact || {} as FancyReactSettings);

    const packagePath = mergedSettings.packagePath as string;
    const sourcePath = mergedSettings.sourcePath as string;
    const testPath = mergedSettings.testPath as string;

    const componentDetails = (componentName: string) => {
      const folderPath = `${projectRoot}/${packagePath}/${sourcePath}/components/${componentName}`;
      const componentPath = `${folderPath}/${componentName}.js`;
      const stylesPath = `${folderPath}/${componentName}.scss`;

      return {
        componentName,
        componentPath,
        folderPath,
        projectRoot,
        stylesPath
      };
    };

    return {
      componentDetails,
      packagePath,
      sourcePath,
      srcInsideProject: path.join('/' + packagePath, sourcePath),
      testPath,
      testInsideProject: path.join('/' + packagePath, testPath),
      testSuffix: mergedSettings.testSuffix as string,
      testStructure: mergedSettings.testStructure as TestStructure,
      projectRoot: projectRoot,
      pkgJson: pkgJson
    };
  }
};

