import { BaseScene } from './BaseScene';
import { Graphics, Text, Texture, Assets, Sprite} from 'pixi.js';
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
    const texture = Assets.cache.get('rays') as Texture;

    this.background = new Graphics();
    this.background.rect(0, 0, this.app.screen.width, this.app.screen.height);
    this.background.fill(0x004bbc);
    this.container.addChild(this.background);

    const imageBg = new Sprite(texture);
    imageBg.width = this.app.screen.width*2;
    imageBg.height = this.app.screen.height*2;
    imageBg.x = this.centerX()
    imageBg.y = this.centerY() 
    imageBg.anchor.set(0.5)
    //imageBg.alpha = 0.3; // 30% прозрачности
    this.container.addChild(imageBg);
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
      //this.emit('change-scene', 'TournamentsScene');
      const tournament =       { 
        id: 1,
        name: 'Ежедневный турнир', 
        players: '128/256', 
        prize: '1,000 ₽',
        entry: 'Бесплатно',
        status: 'available',
        time: '15:00',
        duration: '2 часа',
        rules: 'Лучший из 3 раундов',
        prizeDistribution: ['1 место: 500 ₽', '2 место: 300 ₽', '3 место: 200 ₽'],
        lastTour: 2,
        curTour: 1
      }
      this.emit('change-scene', 'TournamentInfoScene', tournament)
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