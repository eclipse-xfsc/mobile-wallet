declare module "upng-js" {
  interface UPNGImage {
    width: number;
    height: number;
    depth: number;
    ctype: number;
    frames: number;
    tabs: any;
    data: ArrayBuffer;
  }

  interface UPNG {
    decode: (buffer: ArrayBuffer) => UPNGImage;
    toRGBA8: (img: UPNGImage) => Uint8Array[];
  }

  const UPNG: UPNG;
  export = UPNG;
}
