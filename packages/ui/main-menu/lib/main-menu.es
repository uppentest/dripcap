import fs from 'fs';
import { Menu, KeyBind, Theme, PubSub, Env, Profile } from 'dripcap';
import { remote } from 'electron';
let { app, MenuItem } = remote;

export default class MainMenu {
  async activate() {
    let action = name => () => {
      PubSub.emit(name);
    }

    KeyBind.bind('command+shift+n', '!menu', 'core:new-window');
    KeyBind.bind('command+shift+w', '!menu', 'core:close-window');
    KeyBind.bind('command+q', '!menu', 'core:quit');
    KeyBind.bind('command+,', '!menu', 'core:show-preferences');
    KeyBind.bind('f5', '!menu', 'core:reload-window');
    KeyBind.bind('command+shift+i', '!menu', 'core:toggle-devtools');
    KeyBind.bind('command+m', '!menu', 'core:window-minimize');
    KeyBind.bind('command+alt+ctrl+m', '!menu', 'core:window-zoom');
    KeyBind.bind('command+Plus', '!menu', 'core:zoom-in');
    KeyBind.bind('command+-', '!menu', 'core:zoom-out');

    this.fileMenu = function(menu, e) {
      if (process.platform !== 'darwin') {
        menu.append(new MenuItem({
          type: 'separator'
        }));
        menu.append(new MenuItem({
          label: 'Quit',
          accelerator: KeyBind.get('!menu', 'core:quit'),
          click: action('core:quit')
        }));
      }
      return menu;
    };

    this.editMenu = function(menu, e) {
      if (process.platform === 'darwin') {
        menu.append(new MenuItem({
          label: 'Cut',
          accelerator: 'Cmd+X',
          selector: 'cut:'
        }));
        menu.append(new MenuItem({
          label: 'Copy',
          accelerator: 'Cmd+C',
          selector: 'copy:'
        }));
        menu.append(new MenuItem({
          label: 'Paste',
          accelerator: 'Cmd+V',
          selector: 'paste:'
        }));
        menu.append(new MenuItem({
          label: 'Select All',
          accelerator: 'Cmd+A',
          selector: 'selectAll:'
        }));
      } else {
        let contents = remote.getCurrentWebContents();
        menu.append(new MenuItem({
          label: 'Cut',
          accelerator: 'Ctrl+X',
          click() {
            return contents.cut();
          }
        }));
        menu.append(new MenuItem({
          label: 'Copy',
          accelerator: 'Ctrl+C',
          click() {
            return contents.copy();
          }
        }));
        menu.append(new MenuItem({
          label: 'Paste',
          accelerator: 'Ctrl+V',
          click() {
            return contents.paste();
          }
        }));
        menu.append(new MenuItem({
          label: 'Select All',
          accelerator: 'Ctrl+A',
          click() {
            return contents.selectAll();
          }
        }));
      }
      if (process.platform !== 'darwin') {
        menu.append(new MenuItem({
          type: 'separator'
        }));
        menu.append(new MenuItem({
          label: 'Preferences',
          accelerator: KeyBind.get('!menu', 'core:show-preferences'),
          click: action('core:show-preferences')
        }));
      }
      return menu;
    };

    this.devMenu = function(menu, e) {
      menu.append(new MenuItem({
        label: 'Reload Window',
        accelerator: KeyBind.get('!menu', 'core:reload-window'),
        click: action('core:reload-window')
      }));

      let mode = Profile.getConfig('auto-reload') || 'off';
      menu.append(new MenuItem({
        label: 'Auto Reload',
        submenu: [
          {
            label: 'Off',
            type: 'radio',
            checked: mode === 'off',
            click: () => { Profile.setConfig('auto-reload', 'off'); }
          },
          {
            label: 'Window',
            type: 'radio',
            checked: mode === 'window',
            click: () => { Profile.setConfig('auto-reload', 'window'); }
          },
          {
            label: 'Package',
            type: 'radio',
            checked: mode === 'package',
            click: () => { Profile.setConfig('auto-reload', 'package'); }
          }
        ]
      }));
      menu.append(new MenuItem({
        type: 'separator'
      }));
      menu.append(new MenuItem({
        label: 'Toggle DevTools',
        accelerator: KeyBind.get('!menu', 'core:toggle-devtools'),
        click: action('core:toggle-devtools')
      }));
      menu.append(new MenuItem({
        label: 'Open User Directory',
        click: action('core:open-user-directroy')
      }));
      return menu;
    };

    this.windowMenu = function(menu, e) {
      menu.append(new MenuItem({
        label: 'Actual Size',
        click: action('core:zoom-reset')
      }));
      menu.append(new MenuItem({
        label: 'Zoom In',
        accelerator: KeyBind.get('!menu', 'core:zoom-in'),
        click: action('core:zoom-in')
      }));
      menu.append(new MenuItem({
        label: 'Zoom Out',
        accelerator: KeyBind.get('!menu', 'core:zoom-out'),
        click: action('core:zoom-out')
      }));
      menu.append(new MenuItem({
        type: 'separator'
      }));
      menu.append(new MenuItem({
        label: 'Minimize',
        accelerator: KeyBind.get('!menu', 'core:window-minimize'),
        role: 'minimize'
      }));
      if (process.platform === 'darwin') {
        menu.append(new MenuItem({
          label: 'Zoom',
          accelerator: KeyBind.get('!menu', 'core:window-zoom'),
          click: action('core:window-zoom')
        }));
        menu.append(new MenuItem({
          type: 'separator'
        }));
        menu.append(new MenuItem({
          label: 'Bring All to Front',
          accelerator: KeyBind.get('!menu', 'core:window-front'),
          role: 'front'
        }));
      }
      return menu;
    };

    this.helpMenu = function(menu, e) {
      menu.append(new MenuItem({
        label: 'Website',
        click: action('core:open-website')
      }));
      menu.append(new MenuItem({
        label: 'Documentation',
        click: action('core:open-docs')
      }));
      menu.append(new MenuItem({
        label: 'License',
        click: action('core:show-license')
      }));
      if (process.platform !== 'darwin') {
        menu.append(new MenuItem({
          type: 'separator'
        }));
        menu.append(new MenuItem({
          label: `Version ${Env.version}`,
          enabled: false
        }));
      }
      return menu;
    };

    if (process.platform === 'darwin') {
      this.appMenu = function(menu, e) {
        menu.append(new MenuItem({
          label: `Version ${Env.version}`,
          enabled: false
        }));
        menu.append(new MenuItem({
          type: 'separator'
        }));
        menu.append(new MenuItem({
          label: 'Preferences',
          accelerator: KeyBind.get('!menu', 'core:show-preferences'),
          click: action('core:show-preferences')
        }));
        return menu;
      };
      this.quitMenu = function(menu, e) {
        menu.append(new MenuItem({
          label: 'Quit',
          accelerator: KeyBind.get('!menu', 'core:quit'),
          click: action('core:quit')
        }));
        return menu;
      };
      let name = app.getName();
      Menu.registerMain(name, this.appMenu);
      Menu.registerMain(name, this.devMenu);
      Menu.registerMain(name, this.quitMenu, -999);
      Menu.setMainPriority(name, 999);
    }

    if (process.platform !== 'darwin') {
      Menu.registerMain('Developer', this.devMenu);
    }

    Menu.registerMain('File', this.fileMenu);
    Menu.registerMain('Edit', this.editMenu);
    Menu.registerMain('Window', this.windowMenu);
    Menu.registerMain('Help', this.helpMenu);
    Menu.setMainPriority('Help', -999);
    KeyBind.on('update', () => Menu.updateMainMenu());
  }

  async deactivate() {
    KeyBind.unbind('command+shift+n', '!menu', 'core:new-window');
    KeyBind.unbind('command+shift+w', '!menu', 'core:close-window');
    KeyBind.unbind('command+q', '!menu', 'core:quit');
    KeyBind.unbind('command+,', '!menu', 'core:show-preferences');
    KeyBind.unbind('f5', '!menu', 'core:reload-window');
    KeyBind.unbind('command+shift+i', '!menu', 'core:toggle-devtools');
    KeyBind.unbind('command+m', '!menu', 'core:window-minimize');
    KeyBind.unbind('command+alt+ctrl+i', '!menu', 'core:window-zoom');

    if (process.platform === 'darwin') {
      let name = app.getName();
      Menu.unregisterMain(name, this.appMenu);
      Menu.unregisterMain(name, this.devMenu);
      Menu.unregisterMain(name, this.quitMenu);
    } else {
      Menu.unregisterMain('Developer', this.devMenu);
    }

    Menu.unregisterMain('File', this.fileMenu);
    Menu.unregisterMain('Edit', this.editMenu);
    Menu.unregisterMain('Window', this.windowMenu);
    Menu.unregisterMain('Help', this.helpMenu);
  }
}
