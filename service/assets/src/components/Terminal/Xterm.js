import { Terminal } from 'xterm'
import 'xterm/dist/xterm.css'
import * as fit from 'xterm/lib/addons/fit/fit';
import * as webLinks from 'xterm/dist/addons/webLinks/webLinks'

Terminal.applyAddon(fit);
Terminal.applyAddon(webLinks)

export default Terminal