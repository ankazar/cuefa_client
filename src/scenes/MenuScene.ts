import { BaseScene } from './BaseScene';
import { Graphics, Text } from 'pixi.js';
import { Button } from '../components/Button';

export class MenuScene extends BaseScene {
  private background!: Graphics;
  private title!: Text;
  private tournamentsButton!: Button;

  async init(): Promise<void> {
    this.createBackground();
    this.createTitle();
    this.createButtons();
  }

  private createBackground(): void {
    this.background = new Graphics();
    this.background.rect(0, 0, this.app.screen.width, this.app.screen.height);
    this.background.fill(0x004bbc);
    this.container.addChild(this.background);
  }

  private createTitle(): void {
    this.title = new Text({
      text: 'CUEFA CUP',
      style: {
        fill: 0xecf0f1,
        fontSize: 64,
        fontFamily: 'Arial',
        fontWeight: 'bold',
        stroke: 0x34495e,
        strokeThickness: 4
      }
    });
    
    this.title.anchor.set(0.5);
    this.title.x = this.centerX();
    this.title.y = 150;
    this.container.addChild(this.title);
  }

  private createButtons(): void {
    const centerX = this.centerX();
    
    // Кнопка "Турниры" (бывшая "Начать игру")
    this.tournamentsButton = new Button('Турниры');
    this.tournamentsButton.x = centerX;
    this.tournamentsButton.y = 300;
    this.tournamentsButton.onPress = () => {
      console.log('🎯 Переход к турнирам');
      // Здесь будет переход на TournamentsScene
      this.emit('change-scene', 'TournamentsScene');
    };
    this.container.addChild(this.tournamentsButton);

    //// Кнопка "Настройки"
    //const settingsButton = new Button('Настройки', 180, 45);
    //settingsButton.x = centerX;
    //settingsButton.y = 370;
    //settingsButton.onPress = () => {
    //  console.log('⚙️ Нажата кнопка "Настройки"');
    //  alert('⚙️ Настройки игры');
    //};
    //this.container.addChild(settingsButton);
  }

  resize(width: number, height: number): void {
    this.background.clear();
    this.background.rect(0, 0, width, height);
    this.background.fill(0x2c3e50);

    this.title.x = this.centerX();

    const centerX = this.centerX();
    this.tournamentsButton.x = centerX;
  }
}