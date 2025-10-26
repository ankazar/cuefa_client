import { Graphics, Text, Container } from 'pixi.js';

export class Button extends Container {
  private background: Graphics;
  private label: Text;

  constructor(text: string, width: number = 200, height: number = 50) {
    super();

    this.eventMode = 'static';
    this.cursor = 'pointer';

    // Фон кнопки
    this.background = new Graphics();
    this.drawBackground(0x3498db);
    this.addChild(this.background);

    // Текст кнопки
    this.label = new Text({
      text,
      style: {
        fill: 0xffffff,
        fontSize: 20,
        fontFamily: 'Arial',
        fontWeight: 'bold'
      }
    });
    this.label.anchor.set(0.5);
    this.addChild(this.label);

    // События мыши
    this.setupEvents();
  }

  private drawBackground(color: number): void {
    this.background.clear();
    this.background.roundRect(-100, -25, 200, 50, 15);
    this.background.fill(color);
  }

  private setupEvents(): void {
    this.on('pointerover', () => {
      this.drawBackground(0x2980b9);
      this.scale.set(1.05);
    });

    this.on('pointerout', () => {
      this.drawBackground(0x3498db);
      this.scale.set(1.0);
    });

    this.on('pointerdown', () => {
      this.scale.set(0.95);
    });

    this.on('pointerup', () => {
      this.scale.set(1.05);
      if (this.onPress) {
        this.onPress();
      }
    });
  }

  // Callback для нажатия кнопки
  public onPress?: () => void;
}