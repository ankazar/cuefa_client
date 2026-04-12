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

  private actionButtons: (Container & { onPress?: () => void; actionType?: string })[] = [];
  private isActionLocked: boolean = false;
  private selectedAction: string | null = null;

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
    
    const loadingContainer = new Container();
    loadingContainer.name = 'loadingContainer';
    loadingContainer.x = 0;
    loadingContainer.y = fieldY + 100;
    
    const loadingBg = new Graphics();
    loadingBg.rect(-150, -30, 300, 60);
    loadingBg.fill(0x2c3e50, 0.8);
    loadingBg.stroke({ width: 2, color: 0x3498db });
    loadingContainer.addChild(loadingBg);
    
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
    
    const spinner = new Graphics();
    spinner.name = 'spinner';
    spinner.circle(0, 40, 8);
    spinner.fill(0x3498db, 0.5);
    spinner.stroke({ width: 2, color: 0x3498db });
    loadingContainer.addChild(spinner);
    
    this.contentContainer.addChild(loadingContainer);
    
    let rotation = 0;
    const spinnerInterval = setInterval(() => {
      if (!spinner.destroyed) {
        rotation += 0.2;
        spinner.rotation = rotation;
      }
    }, 50);
    
    (spinner as any).intervalId = spinnerInterval;
    
    this.loadingInterval = setInterval(() => {
      if (this.loadingText && !this.loadingText.destroyed) {
        this.loadingDots = (this.loadingDots + 1) % 4;
        const dots = '.'.repeat(this.loadingDots);
        this.loadingText.text = `Загрузка${dots}`;
      }
    }, 300);
  }

  private hideLoadingIndicator(): void {
    if (this.loadingInterval) {
      clearInterval(this.loadingInterval);
      this.loadingInterval = undefined;
    }
    
    const loadingContainer = this.contentContainer.getChildByName('loadingContainer');
    if (loadingContainer) {
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
      const texture1 = Assets.cache.get('gameplay_left') as Texture;
      const texture2 = Assets.cache.get('gameplay_right') as Texture;
      
      if (!texture1 || !texture2) {
        throw new Error('Текстуры не найдены в кэше');
      }
      
      this.gameImage1 = new Sprite(texture1);
      this.gameImage2 = new Sprite(texture2);
      
    } catch (error) {
      console.error('Ошибка получения текстур из кэша:', error);
      this.gameImage1 = new Sprite(this.createFallbackTexture('🎮', 0x3498db));
      this.gameImage2 = new Sprite(this.createFallbackTexture('⚔️', 0xe74c3c));
    }
  }

  private createFallbackTexture(emoji: string, color: number): Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext('2d')!;
    
    ctx.fillStyle = '#' + color.toString(16).padStart(6, '0');
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);
    
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

    // Три круглые кнопки
    this.createRoundButtons(fieldY + imageHeight + 45);

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
    this.timerText.y = fieldY + imageHeight + 100;
    this.contentContainer.addChild(this.timerText);

    this.startTimer();
  }

  private createRoundButtons(y: number): void {
    const buttonRadius = 35;
    const buttonGap = 30;
    
    const buttonsContainer = new Container();
    buttonsContainer.x = 0;
    buttonsContainer.y = y;
    this.contentContainer.addChild(buttonsContainer);

    // Кнопка 1 (Камень)
    const rockButton = this.createRoundButton(
      '✊',
      0xe74c3c,
      -buttonRadius * 2 - buttonGap,
      0,
      buttonRadius,
      'rock'
    );
    rockButton.onPress = () => {
      if (!this.isActionLocked) {
        console.log('✊ Камень!');
        this.onRock();
      }
    };
    buttonsContainer.addChild(rockButton);
    this.actionButtons.push(rockButton);

    // Кнопка 2 (Ножницы)
    const scissorsButton = this.createRoundButton(
      '✌️',
      0x3498db,
      0,
      0,
      buttonRadius,
      'scissors'
    );
    scissorsButton.onPress = () => {
      if (!this.isActionLocked) {
        console.log('✌️ Ножницы!');
        this.onScissors();
      }
    };
    buttonsContainer.addChild(scissorsButton);
    this.actionButtons.push(scissorsButton);

    // Кнопка 3 (Бумага)
    const paperButton = this.createRoundButton(
      '🤚',
      0xf1c40f,
      buttonRadius * 2 + buttonGap,
      0,
      buttonRadius,
      'paper'
    );
    paperButton.onPress = () => {
      if (!this.isActionLocked) {
        console.log('🤚 Бумага!');
        this.onPaper();
      }
    };
    buttonsContainer.addChild(paperButton);
    this.actionButtons.push(paperButton);
  }

  private createRoundButton(
    emoji: string, 
    color: number, 
    x: number, 
    y: number, 
    radius: number,
    actionType: string
  ): Container & { onPress?: () => void; actionType?: string } {
    const button = new Container() as Container & { onPress?: () => void; actionType?: string };
    button.actionType = actionType;
    button.x = x;
    button.y = y;
    button.eventMode = 'static';
    button.cursor = 'pointer';
    
    // Тень
    const shadow = new Graphics();
    shadow.name = 'shadow';
    shadow.circle(3, 3, radius);
    shadow.fill(0x000000, 0.3);
    button.addChild(shadow);
    
    // Основной круг
    const bg = new Graphics();
    bg.name = 'bg';
    bg.circle(0, 0, radius);
    bg.fill(color);
    bg.stroke({ width: 3, color: 0xffffff });
    button.addChild(bg);
    
    // Внутренний круг (блик)
    const inner = new Graphics();
    inner.name = 'inner';
    inner.circle(-3, -3, radius - 6);
    inner.fill(0xffffff, 0.15);
    button.addChild(inner);
    
    // Эмодзи
    const label = new Text({
      text: emoji,
      style: {
        fontSize: 32,
        fontFamily: 'Arial'
      }
    });
    label.name = 'label';
    label.anchor.set(0.5);
    label.x = 0;
    label.y = 0;
    button.addChild(label);
    
    let isPressed = false;
    
    button.on('pointerover', () => {
      if (!this.isActionLocked && !isPressed) {
        const bg = button.getChildByName('bg') as Graphics;
        bg.clear();
        bg.circle(0, 0, radius);
        bg.fill(color);
        bg.stroke({ width: 4, color: 0xffd700 });
        button.scale.set(1.1);
      }
    });
    
    button.on('pointerout', () => {
      if (!this.isActionLocked && !isPressed) {
        const bg = button.getChildByName('bg') as Graphics;
        bg.clear();
        bg.circle(0, 0, radius);
        bg.fill(color);
        bg.stroke({ width: 3, color: 0xffffff });
        button.scale.set(1.0);
      }
    });
    
    button.on('pointerdown', () => {
      if (!this.isActionLocked) {
        isPressed = true;
        button.scale.set(0.95);
        const bg = button.getChildByName('bg') as Graphics;
        bg.clear();
        bg.circle(0, 0, radius);
        bg.fill(color);
        bg.stroke({ width: 3, color: 0xffd700 });
      }
    });
    
    button.on('pointerup', () => {
      if (!this.isActionLocked) {
        isPressed = false;
        button.scale.set(1.0);
        const bg = button.getChildByName('bg') as Graphics;
        bg.clear();
        bg.circle(0, 0, radius);
        bg.fill(color);
        bg.stroke({ width: 3, color: 0xffffff });
        
        if (button.onPress) {
          button.onPress();
        }
      }
    });
    
    return button;
  }

  private lockActionButtons(selectedType?: string): void {
    this.isActionLocked = true;
    this.selectedAction = selectedType || null;
    
    this.actionButtons.forEach(button => {
      button.eventMode = 'none';
      button.cursor = 'default';
      
      const bg = button.getChildByName('bg') as Graphics;
      const radius = 35;
      let color: number;
      
      if (button.actionType === selectedType) {
        color = 0x2ecc71; // Зелёный для выбранной
      } else {
        color = 0x7f8c8d; // Серый для остальных
      }
      
      bg.clear();
      bg.circle(0, 0, radius);
      bg.fill(color);
      bg.stroke({ 
        width: 3, 
        color: button.actionType === selectedType ? 0xffd700 : 0x95a5a6 
      });
      
      if (button.actionType !== selectedType) {
        button.scale.set(0.9);
        button.alpha = 0.6;
      } else {
        button.scale.set(1.05);
        button.alpha = 1.0;
      }
    });
  }

  private onRock(): void {
    console.log('✊ Выбран камень!');
    this.lockActionButtons('rock');
    this.showActionEffect('КАМЕНЬ!', 0xe74c3c);
    
    setTimeout(() => {
      this.finishTurn();
    }, 1500);
  }

  private onScissors(): void {
    console.log('✌️ Выбраны ножницы!');
    this.lockActionButtons('scissors');
    this.showActionEffect('НОЖНИЦЫ!', 0x3498db);
    
    setTimeout(() => {
      this.finishTurn();
    }, 1500);
  }

  private onPaper(): void {
    console.log('🤚 Выбрана бумага!');
    this.lockActionButtons('paper');
    this.showActionEffect('БУМАГА!', 0xf1c40f);
    
    setTimeout(() => {
      this.finishTurn();
    }, 1500);
  }

  private finishTurn(): void {
    console.log('⏰ Ход завершён!');
    this.finishMatch();
  }

  private showActionEffect(text: string, color: number): void {
    const effectText = new Text({
      text: text,
      style: {
        fill: color,
        fontSize: 36,
        fontFamily: 'Arial',
        fontWeight: 'bold',
        stroke: 0xffffff,
        strokeThickness: 3
      }
    });
    effectText.anchor.set(0.5);
    effectText.x = 0;
    effectText.y = -80;
    effectText.alpha = 1;
    this.contentContainer.addChild(effectText);
    
    let time = 0;
    const animate = setInterval(() => {
      time += 0.05;
      effectText.y -= 2;
      effectText.alpha -= 0.04;
      effectText.scale.set(1 + time * 0.3);
      
      if (effectText.alpha <= 0) {
        clearInterval(animate);
        this.contentContainer.removeChild(effectText);
        effectText.destroy();
      }
    }, 30);
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

  destroy(options?: any): void {
    this.stopTimer();
    
    if (this.loadingInterval) {
      clearInterval(this.loadingInterval);
    }
    
    super.destroy(options);
  }
}