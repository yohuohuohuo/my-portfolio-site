export class PerformanceLog {
  private start: number;
  private tag: string;

  constructor(tag: string) {
    this.start = performance.now();
    this.tag = tag;
    console.log(`${this.tag} ==> start`);
  }

  log(tag?: string) {
    const current = performance.now();
    console.log(`${this.tag} ==> end`, tag || '', `total:${(current - this.start).toFixed(3)} ms`);
  }
}
