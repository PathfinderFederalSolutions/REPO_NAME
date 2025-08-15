// Modern builds (v3/v4/v5)
declare module 'pdfjs-dist' {
  const pdfjs: any;
  export = pdfjs;
}
declare module 'pdfjs-dist/build/pdf.worker.mjs' {
  const worker: any;
  export = worker;
}
declare module 'pdfjs-dist/build/pdf.worker.js' {
  const worker: any;
  export = worker;
}

// Legacy builds (v2.x)
declare module 'pdfjs-dist/legacy/build/pdf.js' {
  const pdfjs: any;
  export = pdfjs;
}
declare module 'pdfjs-dist/legacy/build/pdf.worker.js' {
  const worker: any;
  export = worker;
}