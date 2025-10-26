import { BaseScene } from './BaseScene';
import { Graphics, Text } from 'pixi.js';

export class BootScene extends BaseScene {
  async init(): Promise<void> {
    // Создаем простой загрузочный экран
    const background = new Graphics();
    background.rect(0, 0, this.app.screen.width, this.app.screen.height);
    background.fill(0x1a1a1a);
    this.container.addChild(background);

    const loadingText = new Text({
      text: 'Загрузка...',
      style: {
        fill: 0xffffff,
        fontSize: 32,
        fontFamily: 'Arial'
      }
    });
    loadingText.anchor.set(0.5);
    loadingText.x = this.app.screen.width / 2;
    loadingText.y = this.app.screen.height / 2;
    this.container.addChild(loadingText);

    // Симулируем загрузку или загружаем критические ресурсы
    await this.loadCriticalAssets();
  }

  private async loadCriticalAssets(): Promise<void> {
    // Здесь можно загрузить самые важные ресурсы
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}