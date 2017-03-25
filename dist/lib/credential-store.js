'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const fs_1 = require("fs");
const crypto_1 = require("crypto");
const assert_1 = require("assert");
const stream_1 = require("stream");
const algorithm = 'aes256';
function wrap(text) {
    var s = new stream_1.Readable();
    s._read = function noop() { };
    s.push(text);
    s.push(null);
    return s;
}
function validateRequest(req) {
    assert_1.ok(req.path, 'env is required');
    assert_1.ok(req.phrase, 'passphrase is required');
}
function encrypt(text, password) {
    let cipher = crypto_1.createCipher(algorithm, password);
    return wrap(text).pipe(cipher);
}
function decipher(stream, password) {
    let decipher = crypto_1.createDecipher(algorithm, password);
    return stream.pipe(decipher);
}
class CredentialStore {
    constructor(config) {
        if (!config) {
            throw new Error('Config not specified!');
        }
        this.new = false;
        let locations = [
            process.env.DBM_HOME,
            process.env.HOME,
            process.env.APPDATA,
            process.cwd()
        ];
        let valid = [];
        for (var i = 0; i < locations.length; i++) {
            var element = locations[i];
            if (element) {
                valid.push(element);
                let store = path_1.join(element, '.dbm-creds');
                if (fs_1.existsSync(store)) {
                    this.path = store;
                    break;
                }
            }
        }
        if (!this.path) {
            this.new = true;
            let location = valid[0];
            this.path = path_1.join(location, '.dbm-creds');
            fs_1.writeFileSync(this.path, '');
        }
    }
    get(req, cb) {
        validateRequest(req);
        let stream = fs_1.createReadStream(this.path, 'utf8');
        let text = decipher(stream, req.phrase).read();
        let lines = text.split('\n');
        for (var i = 0; i < lines.length; i++) {
            let line = lines[i];
            if (line.indexOf(req.path) === 0) {
                return line.substring(line.indexOf('=') + 1);
            }
        }
        return null;
    }
    set(req) {
        validateRequest(req);
        let path = req.path;
        let password = req.password;
        let line = `$path=$password`;
        let stream = fs_1.createReadStream(this.path, 'utf8');
        let clearText = decipher(stream, req.phrase);
        let newText = clearText + '\n' + line;
        let output = fs_1.createWriteStream(this.path);
        encrypt(newText, req.phrase).pipe(output);
    }
}
