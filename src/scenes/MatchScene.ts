import { BaseScene } from './BaseScene';
import { Graphics, Text, Container, Sprite, Assets, Texture } from 'pixi.js';

export class MatchScene extends BaseScene {
  private background!: Graphics;
  private title!: Text;
  private contentContainer!: Container;
  private gameImage1!: Sprite;
  private gameImage2!: Sprite;
  private tournamentData: any;
  private matchTimer: number = 5;
  
  // Флаги состояния
  private isLoading: boolean = true;
  private loadingText!: Text;
  private loadingDots: number = 0;
  private loadingInterval?: NodeJS.Timeout;
  private timerInterval?: NodeJS.Timeout;
  private timerText?: Text;

  // Пути к изображениям
  private readonly IMAGE_PATHS = {
    left: 'assets/images/K.jpg',
    right: 'assets/images/K.jpg'
  };

  async init(tournamentData?: any): Promise<void> {
    console.log('🎮 MatchScene init вызван с данными:', tournamentData);
    this.tournamentData = tournamentData || this.getDefaultTournamentData();
    
    this.createBackground();
    this.createTitle();
    this.createContentContainer();
    this.createPlayers();
    this.createMatchInfo();
    
    // Показываем индикатор загрузки
    this.showLoadingIndicator();
    
    // Загружаем изображения
    await this.loadGameImages();
    
    // Скрываем индикатор и показываем игровое поле
    this.hideLoadingIndicator();
    this.createGameField();
    
    this.startMatch();
  }

  private getDefaultTournamentData(): any {
    return {
      name: 'Ежедневный турнир',
      prize: '1,000 ₽',
      entry: 'Бесплатно'
    };
  }

  private createBackground(): void {
    this.background = new Graphics();
    this.background.rect(0, 0, this.app.screen.width, this.app.screen.height);
    this.background.fill(0x1a1a2e);
    this.container.addChild(this.background);
  }

  private createTitle(): void {
    this.title = new Text({
      text: 'МАТЧ',
      style: {
        fill: 0xecf0f1,
        fontSize: 36,
        fontFamily: 'Arial',
        fontWeight: 'bold',
        stroke: 0x3498db,
        strokeThickness: 3
      }
    });
    
    this.title.anchor.set(0.5);
    this.title.x = this.centerX();
    this.title.y = 80;
    this.container.addChild(this.title);
  }

  private createContentContainer(): void {
    this.contentContainer = new Container();
    this.contentContainer.x = this.centerX();
    this.contentContainer.y = 200;
    this.container.addChild(this.contentContainer);
  }

  private createPlayers(): void {
    const playersY = 0;

    // Игрок 1 (вы)
    const player1Card = this.createPlayerCard('ВЫ', '1450', -150, playersY, 0x3498db);
    this.contentContainer.addChild(player1Card);

    // VS текст
    const vsText = new Text({
      text: 'VS',
      style: {
        fill: 0xe74c3c,
        fontSize: 32,
        fontFamily: 'Arial',
        fontWeight: 'bold'
      }
    });
    vsText.anchor.set(0.5);
    vsText.x = 0;
    vsText.y = playersY + 40;
    this.contentContainer.addChild(vsText);

    // Игрок 2 (противник)
    const player2Card = this.createPlayerCard('Player_123', '1420', 150, playersY, 0xe74c3c);
    this.contentContainer.addChild(player2Card);
  }

  private createPlayerCard(name: string, rating: string, x: number, y: number, color: number): Container {
    const card = new Container();
    card.x = x;
    card.y = y;

    const cardWidth = 140;
    const cardHeight = 120;

    const bg = new Graphics();
    bg.roundRect(-cardWidth / 2, 0, cardWidth, cardHeight, 10);
    bg.fill(0x2c3e50);
    bg.stroke({ width: 3, color: color });
    card.addChild(bg);

    const nameText = new Text({
      text: name,
      style: {
        fill: 0xecf0f1,
        fontSize: 18,
        fontFamily: 'Arial',
        fontWeight: 'bold'
      }
    });
    nameText.anchor.set(0.5);
    nameText.x = 0;
    nameText.y = 30;
    card.addChild(nameText);

    const ratingText = new Text({
      text: `⭐ ${rating}`,
      style: {
        fill: 0xf1c40f,
        fontSize: 14,
        fontFamily: 'Arial'
      }
    });
    ratingText.anchor.set(0.5);
    ratingText.x = 0;
    ratingText.y = 60;
    card.addChild(ratingText);

    const statusText = new Text({
      text: 'Играет...',
      style: {
        fill: 0x2ecc71,
        fontSize: 12,
        fontFamily: 'Arial'
      }
    });
    statusText.anchor.set(0.5);
    statusText.x = 0;
    statusText.y = 85;
    card.addChild(statusText);

    return card;
  }

  private createMatchInfo(): void {
    const infoY = 140;

    const tournamentText = new Text({
      text: this.tournamentData.name,
      style: {
        fill: 0xbdc3c7,
        fontSize: 16,
        fontFamily: 'Arial'
      }
    });
    tournamentText.anchor.set(0.5);
    tournamentText.x = 0;
    tournamentText.y = infoY;
    this.contentContainer.addChild(tournamentText);

    const prizeText = new Text({
      text: `🏆 Приз: ${this.tournamentData.prize}`,
      style: {
        fill: 0xf1c40f,
        fontSize: 14,
        fontFamily: 'Arial',
        fontWeight: 'bold'
      }
    });
    prizeText.anchor.set(0.5);
    prizeText.x = 0;
    prizeText.y = infoY + 25;
    this.contentContainer.addChild(prizeText);
  }

  private showLoadingIndicator(): void {
    const fieldY = 190;
    
    // Создаём контейнер для индикатора загрузки
    const loadingContainer = new Container();
    loadingContainer.name = 'loadingContainer';
    loadingContainer.x = 0;
    loadingContainer.y = fieldY + 100;
    
    // Фон индикатора
    const loadingBg = new Graphics();
    loadingBg.rect(-150, -30, 300, 60);
    loadingBg.fill(0x2c3e50, 0.8);
    loadingBg.stroke({ width: 2, color: 0x3498db });
    loadingContainer.addChild(loadingBg);
    
    // Текст загрузки
    this.loadingText = new Text({
      text: 'Загрузка',
      style: {
        fill: 0xecf0f1,
        fontSize: 20,
        fontFamily: 'Arial',
        fontWeight: 'bold'
      }
    });
    this.loadingText.anchor.set(0.5);
    this.loadingText.x = 0;
    this.loadingText.y = 0;
    loadingContainer.addChild(this.loadingText);
    
    // Спиннер (вращающийся элемент)
    const spinner = new Graphics();
    spinner.name = 'spinner';
    spinner.circle(0, 40, 8);
    spinner.fill(0x3498db, 0.5);
    spinner.stroke({ width: 2, color: 0x3498db });
    loadingContainer.addChild(spinner);
    
    this.contentContainer.addChild(loadingContainer);
    
    // Анимация спиннера
    let rotation = 0;
    const spinnerInterval = setInterval(() => {
      if (!spinner.destroyed) {
        rotation += 0.2;
        spinner.rotation = rotation;
      }
    }, 50);
    
    // Сохраняем ID интервала для очистки
    (spinner as any).intervalId = spinnerInterval;
    
    // Анимация точек загрузки
    this.loadingInterval = setInterval(() => {
      if (this.loadingText && !this.loadingText.destroyed) {
        this.loadingDots = (this.loadingDots + 1) % 4;
        const dots = '.'.repeat(this.loadingDots);
        this.loadingText.text = `Загрузка${dots}`;
      }
    }, 300);
  }

  private hideLoadingIndicator(): void {
    // Очищаем интервал анимации точек
    if (this.loadingInterval) {
      clearInterval(this.loadingInterval);
      this.loadingInterval = undefined;
    }
    
    // Находим и удаляем контейнер загрузки
    const loadingContainer = this.contentContainer.getChildByName('loadingContainer');
    if (loadingContainer) {
      // Очищаем интервал спиннера
      const spinner = loadingContainer.getChildByName('spinner');
      if (spinner && (spinner as any).intervalId) {
        clearInterval((spinner as any).intervalId);
      }
      
      this.contentContainer.removeChild(loadingContainer);
      loadingContainer.destroy({ children: true });
    }
  }

private async loadGameImages(): Promise<void> {
    try {
        // После предзагрузки текстуры уже в кэше
        const texture1 = Assets.cache.get('gameplay_left') as Texture;
        const texture2 = Assets.cache.get('gameplay_right') as Texture;
        
        if (!texture1 || !texture2) {
            throw new Error('Текстуры не найдены в кэше');
        }
        
        this.gameImage1 = new Sprite(texture1);
        this.gameImage2 = new Sprite(texture2);
        
    } catch (error) {
        console.error('Ошибка получения текстур из кэша:', error);
        // Используем fallback
        this.gameImage1 = new Sprite(this.createFallbackTexture('🎮', 0x3498db));
        this.gameImage2 = new Sprite(this.createFallbackTexture('⚔️', 0xe74c3c));
    }
}

  private createFallbackTexture(emoji: string, color: number): Texture {
    // Создаём Canvas элемент
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext('2d')!;
    
    // Рисуем фон
    ctx.fillStyle = '#' + color.toString(16).padStart(6, '0');
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Рисуем градиент
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Рисуем рамку
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);
    
    // Рисуем эмодзи
    ctx.font = '80px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(emoji, canvas.width / 2, canvas.height / 2);
    
    return Texture.from(canvas);
  }

  private createGameField(): void {
    const fieldY = 190;
    const imageWidth = 180;
    const imageHeight = 120;
    const gap = 20;

    this.isLoading = false;

    // Настраиваем первое изображение
    this.gameImage1.anchor.set(0.5);
    this.gameImage1.width = imageWidth;
    this.gameImage1.height = imageHeight;
    this.gameImage1.x = -imageWidth / 2 - gap / 2;
    this.gameImage1.y = fieldY + imageHeight / 2;
    
    const border1 = this.createImageBorder(
      this.gameImage1.x, 
      fieldY, 
      imageWidth, 
      imageHeight,
      0x3498db
    );
    this.contentContainer.addChild(border1);
    this.contentContainer.addChild(this.gameImage1);

    // Настраиваем второе изображение
    this.gameImage2.anchor.set(0.5);
    this.gameImage2.width = imageWidth;
    this.gameImage2.height = imageHeight;
    this.gameImage2.x = imageWidth / 2 + gap / 2;
    this.gameImage2.y = fieldY + imageHeight / 2;
    
    const border2 = this.createImageBorder(
      this.gameImage2.x, 
      fieldY, 
      imageWidth, 
      imageHeight,
      0xe74c3c
    );
    this.contentContainer.addChild(border2);
    this.contentContainer.addChild(this.gameImage2);

    // Подпись под изображениями
    const labelText = new Text({
      text: '⚔️ ИДЁТ СРАЖЕНИЕ ⚔️',
      style: {
        fill: 0xe74c3c,
        fontSize: 16,
        fontFamily: 'Arial',
        fontWeight: 'bold'
      }
    });
    labelText.anchor.set(0.5);
    labelText.x = 0;
    labelText.y = fieldY + imageHeight + 25;
    this.contentContainer.addChild(labelText);

    // Таймер матча
    this.timerText = new Text({
      text: `Матч через: ${this.matchTimer} сек`,
      style: {
        fill: 0xe74c3c,
        fontSize: 16,
        fontFamily: 'Arial',
        fontWeight: 'bold'
      }
    });
    this.timerText.anchor.set(0.5);
    this.timerText.x = 0;
    this.timerText.y = fieldY + imageHeight + 50;
    this.contentContainer.addChild(this.timerText);

    // Запускаем таймер
    this.startTimer();
  }

  private createImageBorder(centerX: number, y: number, width: number, height: number, color: number): Graphics {
    const border = new Graphics();
    border.rect(centerX - width / 2, y, width, height);
    border.stroke({ width: 3, color: color });
    border.fill(0x2c3e50, 0.3);
    return border;
  }

  private startTimer(): void {
    this.timerInterval = setInterval(() => {
      this.matchTimer--;
      
      if (this.timerText && !this.timerText.destroyed) {
        this.timerText.text = `Матч через: ${this.matchTimer} сек`;
      }

      if (this.matchTimer <= 0) {
        this.stopTimer();
        //this.finishMatch();
      }
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = undefined;
    }
  }

  private startMatch(): void {
    console.log('🎮 Начало матча!');
  }

  private finishMatch(): void {
    console.log('⏰ Матч завершен!');
    
    const result = this.generateMatchResult();
    
    this.emit('change-scene', 'ResultsScene', {
      tournament: this.tournamentData,
      result: result
    });
  }

  private generateMatchResult(): any {
    const results = [
      {
        winner: 'ВЫ',
        score: '2-1',
        prize: this.tournamentData.prize,
        players: [
          { name: 'ВЫ', score: 2, isWinner: true },
          { name: 'Player_123', score: 1, isWinner: false }
        ]
      },
      {
        winner: 'Player_123',
        score: '0-2',
        prize: '0 ₽',
        players: [
          { name: 'ВЫ', score: 0, isWinner: false },
          { name: 'Player_123', score: 2, isWinner: true }
        ]
      }
    ];
    
    return results[Math.floor(Math.random() * results.length)];
  }

  resize(width: number, height: number): void {
    this.background.clear();
    this.background.rect(0, 0, width, height);
    this.background.fill(0x1a1a2e);

    this.title.x = this.centerX();
    
    if (this.contentContainer) {
      this.contentContainer.x = this.centerX();
    }
  }

  // Очистка ресурсов при уходе со сцены
  destroy(options?: any): void {
    this.stopTimer();
    
    if (this.loadingInterval) {
      clearInterval(this.loadingInterval);
    }
    
    super.destroy(options);
  }
}