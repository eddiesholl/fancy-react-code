import * as R from 'ramda';
// import R = require('ramda');
const path = require('path')
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

    return {
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
// 
    // partialProject.srcInsideProject = path.join('/' + mergedSettings.packagePath, mergedSettings.sourcePath);
    // partialProject.testInsideProject = path.join('/' + mergedSettings.packagePath, mergedSettings.testPath);

    // return {
    //   ...partialProject,
    //   srcInsideProject: path.join('/' + mergedSettings.packagePath, mergedSettings.sourcePath),
    //   testInsideProject: path.join('/' + mergedSettings.packagePath, mergedSettings.testPath)
    // };
    // return buildConfig(userConfigItems, projectRoot, pkgJson.fancyReact || {} as FancyReactSettings);
  }
}

// export const buildConfig = (userConfigItems: FancyReactSettings, projectRoot: string, packageConfigItems: FancyReactSettings) => {
//   // const packageConfigItems = R.pick(fancyReactSettingsKeys, pkgJson || {});
//   const mergedConfig = R.merge(userConfigItems, packageConfigItems);
  
//   return {
//     ...mergedConfig,
//     projectRoot,
//     pkgJson
//   };
// };

// export const buildPaths = (configItems): Project => {
//   return {
//     packagePath: configItems.packagePath,
//     projectRoot: configItems.projectRoot,
//     sourcePath: configItems.sourcePath,
//     srcInsideProject: path.join('/' + configItems.packagePath, configItems.sourcePath),
//     testInsideProject: path.join('/' + configItems.packagePath, configItems.testPath),
//     testPath: configItems.testPath
//   };
// };

