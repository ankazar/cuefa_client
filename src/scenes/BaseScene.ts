import { Container, Application, Graphics } from "pixi.js";
import { EventEmitter } from "eventemitter3";

export abstract class BaseScene extends EventEmitter {
  public container: Container;
  public isInitialized: boolean = false;

  constructor(protected app: Application) {
    super();
    this.container = new Container();
    this.container.eventMode = "static";
  }

  abstract init(): Promise<void> | void;

  update?(delta: number): void;

  resize?(width: number, height: number): void;

  destroy(): void {
    this.container.destroy({ children: true });
    this.isInitialized = false;
    this.removeAllListeners();
  }

  protected centerX(): number {
    return this.app.screen.width / 2;
  }

  protected centerY(): number {
    return this.app.screen.height / 2;
  }

  protected createBackground(color: number = 0x000000): Graphics {
    const bg = new Graphics();
    bg.rect(0, 0, this.app.screen.width, this.app.screen.height);
    bg.fill(color);
    this.container.addChild(bg);
    return bg;
  }
}
