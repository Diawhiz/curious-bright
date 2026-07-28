import * as Y from 'yjs';

export interface Point {
  x: number;
  y: number;
}

export interface DrawStroke {
  id: string;
  color: string;
  width: number;
  points: Point[];
}

export class WhiteboardEngine {
  public doc: Y.Doc;
  private strokes: Y.Map<DrawStroke>;

  constructor() {
    this.doc = new Y.Doc();
    this.strokes = this.doc.getMap('strokes');
  }

  public addStroke(stroke: DrawStroke) {
    this.strokes.set(stroke.id, stroke);
  }

  public getStrokes(): DrawStroke[] {
    return Array.from(this.strokes.values());
  }

  public clear() {
    this.strokes.clear();
  }

  public applyUpdate(update: Uint8Array) {
    Y.applyUpdate(this.doc, update);
  }

  public encodeState(): Uint8Array {
    return Y.encodeStateAsUpdate(this.doc);
  }

  public onUpdate(callback: (update: Uint8Array) => void) {
    this.doc.on('update', (update) => {
      callback(update);
    });
  }
}
