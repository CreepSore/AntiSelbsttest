let fs = require("fs");
let path = require("path");

let Jimp = require("jimp");
let QRCode = require("qrcode");

let QrCodeModel = require("../model/QrCode");

const VALID_DIR = path.resolve(__dirname, "..", "..", "img", "valid");
const INVALID_DIR = path.resolve(__dirname, "..", "..", "img", "invalid");

class ImageService {
    /**
     * @param {QrCodeModel} qrCode
     */
    static async saveImagesFromQr(qrCode) {
        if(!qrCode) return;
        let images = await ImageService.createImage(qrCode);

        await Promise.all([
            fs.promises.writeFile(path.resolve(__dirname, "..", "web", "static", `${qrCode.get("id")}.valid.png`), images.valid),
            fs.promises.writeFile(path.resolve(__dirname, "..", "web", "static", `${qrCode.get("id")}.invalid.png`), images.invalid)
        ]);
    }

    /**
     * @param {QrCodeModel} qrCode
     */
    static async createImage(qrCode) {
        /** @type {string} */
        const value = qrCode.get("value");
        const usedAt = qrCode.get("usedAt");

        if(!value || usedAt > 0) return null;

        const randomValid = await this.getRandomImage(true);
        const randomInvalid = await this.getRandomImage(false);

        const imgValid = await Jimp.read(randomValid);
        const imgInvalid = await Jimp.read(randomInvalid);

        const borderValid = this.getQrcodeBorder(imgValid);
        const borderInvalid = this.getQrcodeBorder(imgInvalid);

        imgValid.setPixelColor(Jimp.rgbaToInt(170, 194, 223, 255), borderValid.topLeft.x, borderValid.topLeft.y)
            .setPixelColor(Jimp.rgbaToInt(170, 194, 223, 255), borderValid.topRight.x, borderValid.topRight.y)
            .setPixelColor(Jimp.rgbaToInt(170, 194, 223, 255), borderValid.bottomLeft.x, borderValid.bottomLeft.y)
            .setPixelColor(Jimp.rgbaToInt(170, 194, 223, 255), borderValid.bottomRight.x, borderValid.bottomRight.y);

        imgInvalid.setPixelColor(Jimp.rgbaToInt(170, 194, 223, 255), borderInvalid.topLeft.x, borderInvalid.topLeft.y)
            .setPixelColor(Jimp.rgbaToInt(170, 194, 223, 255), borderInvalid.topRight.x, borderInvalid.topRight.y)
            .setPixelColor(Jimp.rgbaToInt(170, 194, 223, 255), borderInvalid.bottomLeft.x, borderInvalid.bottomLeft.y)
            .setPixelColor(Jimp.rgbaToInt(170, 194, 223, 255), borderInvalid.bottomRight.x, borderInvalid.bottomRight.y);

        const imgQrValid = this.preprocessQrCode(await Jimp.read(await QRCode.toBuffer(value, {
            width: borderValid.topRight.x - borderValid.topLeft.x + 1,
            margin: 1
        })));

        const imgQrInvalid = this.preprocessQrCode(await Jimp.read(await QRCode.toBuffer(value, {
            width: borderInvalid.topRight.x - borderInvalid.topLeft.x + 1,
            margin: 1
        })));

        imgValid.composite(imgQrValid, borderValid.topLeft.x, borderValid.topLeft.y);
        imgInvalid.composite(imgQrInvalid, borderInvalid.topLeft.x, borderInvalid.topLeft.y);

        this.postprocessImage(imgValid);
        this.postprocessImage(imgInvalid)

        return {
            valid: await imgValid.getBufferAsync(Jimp.MIME_PNG),
            invalid: await imgInvalid.getBufferAsync(Jimp.MIME_PNG)
        };
    }

    /**
     * @param {Jimp} jimpImg
     */
    static postprocessImage(jimpImg) {
        let degree = Math.floor(Math.random() * 20 ) - 10;
        if(degree < 0) degree = 360 - Math.abs(degree);
        jimpImg.rotate(degree, false).crop(150, 150, jimpImg.bitmap.width - 300, jimpImg.bitmap.height - 300);
    }

    /**
     * @param {Jimp} jimpImg
     * @returns {Jimp}
     */
    static preprocessQrCode(jimpImg) {
        let bitmap = jimpImg.bitmap;

        for(let y = 0; y < bitmap.height; y++) {
            for(let x = 0; x < bitmap.width; x++) {
                let {r, g, b} = Jimp.intToRGBA(jimpImg.getPixelColor(x, y));

                if(r === 255 && g === 255 && b === 255) {
                    jimpImg.setPixelColor(Jimp.rgbaToInt(255, 255, 255, 0), x, y);
                }
            }
        }

        return jimpImg.blur(1).posterize(1);
    }

    /**
     * @param {Jimp} jimpImg
     */
    static getQrcodeBorder(jimpImg) {
        let bitmap = jimpImg.bitmap;
        let topLeft, topRight, bottomLeft, bottomRight;

        for(let y = 0; y < bitmap.height; y++) {
            for(let x = 0; x < bitmap.width; x++) {
                let index = y * bitmap.width + x;
                let {r, g, b} = Jimp.intToRGBA(jimpImg.getPixelColor(x, y));

                if(r === 255 && g === 0 && b === 0) topLeft = {x, y, index};
                if(r === 0 && g === 0 && b === 255) topRight = {x, y, index};
                if(r === 125 && g === 0 && b === 125) bottomLeft = {x, y, index};
                if(r === 0 && g === 255 && b === 0) bottomRight = {x, y, index};
            }
        }

        return topLeft && topRight && bottomLeft && bottomRight ? {
            topLeft,
            topRight,
            bottomLeft,
            bottomRight
        } : null;
    }

    /**
     * @param {boolean} valid
     * @returns {Promise<string>}
     */
    static async getRandomImage(valid) {
        let searchPath = valid ? VALID_DIR : INVALID_DIR;

        let files = (await Promise.all((await fs.promises.readdir(searchPath)).map(async file => {
            let appendedPath = path.resolve(searchPath, file);
            let pathStat = await fs.promises.stat(appendedPath);
            return !pathStat.isDirectory() ? appendedPath : null;
        }))).filter(file => Boolean(file));

        return files[Math.floor(Math.random() * files.length)];
    }
}

module.exports = ImageService;
