import { BaseScene } from './BaseScene';
import { Graphics, Text, Assets } from 'pixi.js';
import { UserService } from '../core/UserService';

export class BootScene extends BaseScene {
  async init(): Promise<void> {
    // Создаем простой загрузочный экран
    const background = new Graphics();
    background.rect(0, 0, this.app.screen.width, this.app.screen.height);
    background.fill(0x1a1a1a);
    this.container.addChild(background);

    const userId = 1; //TODO получить от апи
    
    // Сохраняем в сервис
    UserService.setUserId(userId);

    // Симулируем загрузку или загружаем критические ресурсы
    await this.loadCriticalAssets();
  }

  private async loadCriticalAssets(): Promise<void> {
    this.showLoadingScreen();
    // Здесь можно загрузить самые важные ресурсы
            try {
            // Загружаем все необходимые ресурсы
            await Assets.load([
                { alias: 'rock', src: 'assets/images/K.jpg' },
                { alias: 'scissors', src: 'assets/images/N.jpg' },
                { alias: 'paper', src: 'assets/images/B.jpg' },
                // другие ресурсы...
            ]);
            
            console.log('✅ Все ресурсы загружены');
            
            // Переходим на следующую сцену
            this.emit('change-scene', 'MenuScene');
            
        } catch (error) {
            console.error('❌ Ошибка загрузки ресурсов:', error);
            this.showErrorScreen();
        }

    await new Promise(resolve => setTimeout(resolve, 1000));
  }

      private showLoadingScreen(): void {
        const loadingText = new Text({
            text: 'Загрузка...',
            style: { fill: 0xffffff, fontSize: 24 }
        });
        loadingText.anchor.set(0.5);
        loadingText.x = this.centerX();
        loadingText.y = this.centerY();
        this.container.addChild(loadingText);
    }
    
    private showErrorScreen(): void {
        const errorText = new Text({
            text: 'Ошибка загрузки.\nПроверьте подключение к интернету.',
            style: { fill: 0xff0000, fontSize: 20, align: 'center' }
        });
        errorText.anchor.set(0.5);
        errorText.x = this.centerX();
        errorText.y = this.centerY();
        this.container.addChild(errorText);
    }
}