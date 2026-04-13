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

  private playerChoice: string | null = null;
  private opponentChoice: string | null = null;

  private playerScore: number = 0;
  private opponentScore: number = 0;
  private currentRound: number = 1;
  private readonly WIN_SCORE: number = 2; // Победа при 2 выигранных раундах

  private player2Card!: Container;
  private player2NameText!: Text;
  private player2RatingText!: Text;
  private player2StatusText!: Text;
  private searchInterval?: NodeJS.Timeout;
  private isSearching: boolean = false;
  private opponentData: any = null;
  private border2!: Graphics;

  private roundHistory: Array<{
    round: number;
    playerChoice: string;
    opponentChoice: string;
    result: 'win' | 'lose' | 'draw';
}> = [];

private scoreText!: Text;
private roundText!: Text;

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
    this.createPlayers();        // Создаёт карточки
    
    // Показываем индикатор загрузки
    this.showLoadingIndicator();
    
    // Загружаем изображения
    await this.loadGameImages();
    
    // Скрываем индикатор
    this.hideLoadingIndicator();
    
    // СРАЗУ показываем игровое поле
    this.createGameField();
    
    // Блокируем кнопки на время поиска
    this.isActionLocked = true;
    this.setButtonsWaitingState();
    
    // Запускаем поиск соперника в фоне
    this.startSearching();
    
    // Ждём соперника (не блокируя интерфейс)
    this.waitForOpponent();
}

  private getDefaultTournamentData(): any {
    return {
      name: 'Ежедневный',
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

    // Счёт и раунд вместо VS
    this.createScoreDisplay(playersY + 40);

    // Игрок 2 (противник) - сохраняем ссылки на элементы
    this.player2Card = this.createPlayerCard('Поиск...', '???', 150, playersY, 0xe74c3c);
    this.contentContainer.addChild(this.player2Card);
    
    // Сохраняем ссылки на текстовые элементы
    this.player2NameText = this.player2Card.children.find(c => c instanceof Text && c.y === 30) as Text;
    this.player2RatingText = this.player2Card.children.find(c => c instanceof Text && c.y === 60) as Text;
    this.player2StatusText = this.player2Card.children.find(c => c instanceof Text && c.y === 85) as Text;
    
    // Запускаем поиск соперника
    this.startSearching();
}

// НОВЫЙ МЕТОД: Запуск анимации поиска в карточке
private startSearching(): void {
    this.isSearching = true;
    let dotCount = 0;
    
    // Обновляем статус в карточке
    if (this.player2StatusText) {
        this.player2StatusText.text = 'Поиск';
        this.player2StatusText.style.fill = 0xf1c40f;
    }
    
    // Анимация точек в имени соперника
    this.searchInterval = setInterval(() => {
        if (!this.isSearching) return;
        
        dotCount = (dotCount + 1) % 5;
        const dots = '.'.repeat(dotCount);
        
        if (this.player2NameText && !this.player2NameText.destroyed) {
            this.player2NameText.text = `Поиск${dots}`;
        }
    }, 400);
}

// НОВЫЙ МЕТОД: Получение данных соперника (имитация API запроса)
private async fetchOpponentData(): Promise<any> {
    console.log('📡 Запрос данных соперника...');
    
    // Имитация задержки сети
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
    
    // Имитация ответа от сервера
    const opponents = [
        { name: 'DragonSlayer', rating: 1580 },
        { name: 'ShadowMaster', rating: 1420 },
        { name: 'NightWolf', rating: 1650 },
        { name: 'StormBreaker', rating: 1350 },
        { name: 'PhoenixRider', rating: 1720 },
        { name: 'IceQueen', rating: 1480 }
    ];
    
    // Случайный выбор соперника
    const opponent = opponents[Math.floor(Math.random() * opponents.length)];
    
    console.log('✅ Данные соперника получены:', opponent);
    return opponent;
}

// НОВЫЙ МЕТОД: Обработка получения соперника
private async onOpponentFound(): Promise<void> {
    try {
        // Получаем данные соперника
        this.opponentData = await this.fetchOpponentData();
        
        // Останавливаем поиск
        this.isSearching = false;
        
        if (this.searchInterval) {
            clearInterval(this.searchInterval);
            this.searchInterval = undefined;
        }
        
        // Обновляем карточку соперника
        this.updateOpponentCard(this.opponentData);
        
        // Показываем уведомление
        this.showOpponentReadyNotification();
        
    } catch (error) {
        console.error('❌ Ошибка получения соперника:', error);
        
        // В случае ошибки используем данные по умолчанию
        this.opponentData = { name: 'Player_123', rating: 1420 };
        this.updateOpponentCard(this.opponentData);
    }
}

// НОВЫЙ МЕТОД: Уведомление о готовности соперника
private showOpponentReadyNotification(): void {
    // Текст уведомления
    const notification = new Text({
        text: '✅ СОПЕРНИК ГОТОВ!',
        style: {
            fill: 0x2ecc71,
            fontSize: 20,
            fontFamily: 'Arial',
            fontWeight: 'bold'
        }
    });
    notification.anchor.set(0.5);
    notification.x = 0;
    notification.y = -180;
    notification.alpha = 0;
    this.contentContainer.addChild(notification);
    
    // Анимация появления и исчезновения
    let alpha = 0;
    const animate = setInterval(() => {
        if (alpha < 1) {
            alpha += 0.1;
            notification.alpha = alpha;
            notification.y -= 1;
        } else {
            clearInterval(animate);
            setTimeout(() => {
                const fadeOut = setInterval(() => {
                    alpha -= 0.1;
                    notification.alpha = alpha;
                    notification.y -= 1;
                    if (alpha <= 0) {
                        clearInterval(fadeOut);
                        this.contentContainer.removeChild(notification);
                        notification.destroy();
                    }
                }, 50);
            }, 1500);
        }
    }, 50);
}

// НОВЫЙ МЕТОД: Обновление карточки соперника
private updateOpponentCard(data: { name: string; rating: number }): void {
    if (this.player2NameText) {
        this.player2NameText.text = data.name;
        this.player2NameText.style.fill = 0xecf0f1;
    }
    
    if (this.player2RatingText) {
        this.player2RatingText.text = `⭐ ${data.rating}`;
        this.player2RatingText.style.fill = 0xf1c40f;
    }
    
    if (this.player2StatusText) {
        this.player2StatusText.text = 'Готов';
        this.player2StatusText.style.fill = 0x2ecc71;
    }
    
    // Меняем цвет обводки на зелёный
    const bg = this.player2Card.children[0] as Graphics;
    if (bg) {
        bg.clear();
        bg.roundRect(-70, 0, 140, 120, 10);
        bg.fill(0x2c3e50);
        bg.stroke({ width: 3, color: 0x2ecc71 });
    }
    
    // ВОССТАНАВЛИВАЕМ НЕПРОЗРАЧНОСТЬ ПРАВОГО ИЗОБРАЖЕНИЯ И РАМКИ
    if (this.gameImage2) {
        this.gameImage2.alpha = 1.0;
    }
    
    if (this.border2) {
        this.border2.alpha = 1.0;
    }
    
    // Скрываем индикатор ожидания
    this.hideOpponentWaiting();
}

// НОВЫЙ МЕТОД: Ожидание соперника
private async waitForOpponent(): Promise<void> {
    console.log('⏳ Поиск соперника в фоне...');
    
    // Получаем соперника
    await this.onOpponentFound();
    
    // Разблокируем кнопки
    this.isActionLocked = false;
    this.setButtonsActiveState();
    
    console.log('✅ Соперник готов, кнопки активированы!');
}

// НОВЫЙ МЕТОД: Установка состояния ожидания для кнопок
private setButtonsWaitingState(): void {
    this.actionButtons.forEach(button => {
        button.eventMode = 'none';
        button.cursor = 'default';
        button.alpha = 0.5;
        
        const bg = button.getChildByName('bg') as Graphics;
        if (bg) {
            bg.clear();
            bg.circle(0, 0, 35);
            bg.fill(0x7f8c8d);
            bg.stroke({ width: 3, color: 0x95a5a6 });
        }
    });
}

// НОВЫЙ МЕТОД: Активация кнопок после нахождения соперника
private setButtonsActiveState(): void {
    const colors: Record<string, number> = {
        'rock': 0xe74c3c,
        'scissors': 0x3498db,
        'paper': 0xf1c40f
    };
    
    this.actionButtons.forEach(button => {
        button.eventMode = 'static';
        button.cursor = 'pointer';
        button.alpha = 1.0;
        
        const bg = button.getChildByName('bg') as Graphics;
        const color = colors[button.actionType as string] || 0xe74c3c;
        
        if (bg) {
            bg.clear();
            bg.circle(0, 0, 35);
            bg.fill(color);
            bg.stroke({ width: 3, color: 0xffffff });
        }
    });
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

  private readonly TEXTURE_ALIASES = {
    rock: 'rock',
    scissors: 'scissors',
    paper: 'paper'
};

 private async loadGameImages(): Promise<void> {
    try {
        // Проверяем наличие всех текстур в кэше
        const rockTexture = Assets.cache.get('rock') as Texture;
        const scissorsTexture = Assets.cache.get('scissors') as Texture;
        const paperTexture = Assets.cache.get('paper') as Texture;
        
        if (!rockTexture || !scissorsTexture || !paperTexture) {
            throw new Error('Текстуры не найдены в кэше');
        }
        
        // Изначально показываем камень для обоих
        this.gameImage1 = new Sprite(rockTexture);
        this.gameImage2 = new Sprite(rockTexture);
        
    } catch (error) {
        console.error('Ошибка получения текстур из кэша:', error);
        // Используем fallback с камнем
        this.gameImage1 = new Sprite(this.createChoiceFallbackTexture('rock'));
        this.gameImage2 = new Sprite(this.createChoiceFallbackTexture('rock'));
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

    // Настраиваем первое изображение (игрок)
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

    // Настраиваем второе изображение (соперник)
    this.gameImage2.anchor.set(0.5);
    this.gameImage2.width = imageWidth;
    this.gameImage2.height = imageHeight;
    this.gameImage2.x = imageWidth / 2 + gap / 2;
    this.gameImage2.y = fieldY + imageHeight / 2;
    
    // ДЕЛАЕМ ПРАВОЕ ИЗОБРАЖЕНИЕ ПОЛУПРОЗРАЧНЫМ
    this.gameImage2.alpha = 0.4;
    
    this.border2 = this.createImageBorder(
      this.gameImage2.x, 
      fieldY, 
      imageWidth, 
      imageHeight,
      0xe74c3c
    );
    this.border2.alpha = 0.4;
    
    this.contentContainer.addChild(this.border2);
    this.contentContainer.addChild(this.gameImage2);
   
    // Подписи под изображениями
    this.createImageLabels(fieldY + imageHeight + 5);

    // Три круглые кнопки
    this.createRoundButtons(fieldY + imageHeight + 65);

    this.startTimer();
}

private createScoreDisplay(y: number): void {
    // Контейнер для счёта и раунда
    const scoreContainer = new Container();
    scoreContainer.x = 0;
    scoreContainer.y = y;
    this.contentContainer.addChild(scoreContainer);
    
    // Фон для счёта
    const scoreBg = new Graphics();
    scoreBg.roundRect(-60, -25, 120, 50, 10);
    scoreBg.fill(0x2c3e50);
    scoreBg.stroke({ width: 2, color: 0xf1c40f });
    scoreContainer.addChild(scoreBg);
    
    // Счёт
    this.scoreText = new Text({
        text: `${this.playerScore} : ${this.opponentScore}`,
        style: {
            fill: 0xecf0f1,
            fontSize: 28,
            fontFamily: 'Arial',
            fontWeight: 'bold'
        }
    });
    this.scoreText.anchor.set(0.5);
    this.scoreText.x = 0;
    this.scoreText.y = -5;
    scoreContainer.addChild(this.scoreText);
    
    // Раунд (под счётом)
    this.roundText = new Text({
        text: `Раунд ${this.currentRound}`,
        style: {
            fill: 0xf1c40f,
            fontSize: 14,
            fontFamily: 'Arial',
            fontWeight: 'bold'
        }
    });
    this.roundText.anchor.set(0.5);
    this.roundText.x = 0;
    this.roundText.y = 18;
    scoreContainer.addChild(this.roundText);
}



private showRoundResultPopup(result: 'win' | 'lose' | 'draw'): void {
    // Затемняем фон
    const overlay = new Graphics();
    overlay.name = 'popupOverlay';
    overlay.rect(-400, -300, 800, 600);
    overlay.fill(0x000000, 0.7);
    this.contentContainer.addChild(overlay);
    
    // Контейнер popup
    const popup = new Container();
    popup.name = 'roundPopup';
    popup.x = 0;
    popup.y = 0;
    this.contentContainer.addChild(popup);
    
    // Фон popup
    const popupBg = new Graphics();
    popupBg.roundRect(-200, -150, 400, 300, 20);
    popupBg.fill(0x2c3e50);
    popupBg.stroke({ width: 3, color: 0x3498db });
    popup.addChild(popupBg);
    
    // Заголовок
    let titleText: string;
    let titleColor: number;
    
    switch (result) {
        case 'win':
            titleText = '🎉 ПОБЕДА!';
            titleColor = 0x2ecc71;
            break;
        case 'lose':
            titleText = '😢 ПОРАЖЕНИЕ';
            titleColor = 0xe74c3c;
            break;
        case 'draw':
            titleText = '🤝 НИЧЬЯ!';
            titleColor = 0xf1c40f;
            break;
    }
    
    const title = new Text({
        text: titleText,
        style: {
            fill: titleColor,
            fontSize: 32,
            fontFamily: 'Arial',
            fontWeight: 'bold'
        }
    });
    title.anchor.set(0.5);
    title.x = 0;
    title.y = -90;
    popup.addChild(title);
    
    // Выборы
    const choicesText = new Text({
        text: `${this.getChoiceEmoji(this.playerChoice!)}  VS  ${this.getChoiceEmoji(this.opponentChoice!)}`,
        style: {
            fill: 0xecf0f1,
            fontSize: 36,
            fontFamily: 'Arial'
        }
    });
    choicesText.anchor.set(0.5);
    choicesText.x = 0;
    choicesText.y = -30;
    popup.addChild(choicesText);
    
    // Текущий счёт (показываем, каким он станет после этого раунда)
    let newPlayerScore = this.playerScore;
    let newOpponentScore = this.opponentScore;
    
    if (result === 'win') {
        newPlayerScore++;
    } else if (result === 'lose') {
        newOpponentScore++;
    }
    
    const scoreText = new Text({
        text: `Счёт: ${newPlayerScore} : ${newOpponentScore}`,
        style: {
            fill: 0xecf0f1,
            fontSize: 24,
            fontFamily: 'Arial',
            fontWeight: 'bold'
        }
    });
    scoreText.anchor.set(0.5);
    scoreText.x = 0;
    scoreText.y = 20;
    popup.addChild(scoreText);
    
    // Раунд
    const roundInfo = new Text({
        text: `Раунд ${this.currentRound} завершён`,
        style: {
            fill: 0xbdc3c7,
            fontSize: 14,
            fontFamily: 'Arial'
        }
    });
    roundInfo.anchor.set(0.5);
    roundInfo.x = 0;
    roundInfo.y = 50;
    popup.addChild(roundInfo);
    
    // Кнопка "Продолжить"
    const continueButton = this.createPopupButton('ПРОДОЛЖИТЬ', 0, 100);
    continueButton.onPress = () => {
        // Закрываем popup
        this.closeRoundPopup();
        
        // Обрабатываем результат раунда
        this.processRoundResult(result);
        
        // Сбрасываем для следующего раунда
        this.resetForNextRound();
    };
    popup.addChild(continueButton);
    
    // Анимация появления
    popup.alpha = 0;
    popup.scale.set(0.8);
    
    let progress = 0;
    const animate = setInterval(() => {
        progress += 0.1;
        popup.alpha = progress;
        popup.scale.set(0.8 + 0.2 * progress);
        
        if (progress >= 1) {
            clearInterval(animate);
        }
    }, 30);
}



private createPopupButton(text: string, x: number, y: number): Container & { onPress?: () => void } {
    const button = new Container() as Container & { onPress?: () => void };
    button.x = x;
    button.y = y;
    button.eventMode = 'static';
    button.cursor = 'pointer';
    
    const bg = new Graphics();
    bg.roundRect(-90, -25, 180, 50, 25);
    bg.fill(0x3498db);
    bg.stroke({ width: 2, color: 0xffffff });
    button.addChild(bg);
    
    const label = new Text({
        text: text,
        style: {
            fill: 0xffffff,
            fontSize: 18,
            fontFamily: 'Arial',
            fontWeight: 'bold'
        }
    });
    label.anchor.set(0.5);
    label.x = 0;
    label.y = 0;
    button.addChild(label);
    
    button.on('pointerover', () => {
        bg.clear();
        bg.roundRect(-90, -25, 180, 50, 25);
        bg.fill(0x2980b9);
        bg.stroke({ width: 2, color: 0xffd700 });
        button.scale.set(1.05);
    });
    
    button.on('pointerout', () => {
        bg.clear();
        bg.roundRect(-90, -25, 180, 50, 25);
        bg.fill(0x3498db);
        bg.stroke({ width: 2, color: 0xffffff });
        button.scale.set(1.0);
    });
    
    button.on('pointerdown', () => {
        button.scale.set(0.95);
    });
    
    button.on('pointerup', () => {
        button.scale.set(1.05);
        if (button.onPress) {
            button.onPress();
        }
    });
    
    return button;
}

private closeRoundPopup(): void {
    const overlay = this.contentContainer.getChildByName('popupOverlay');
    const popup = this.contentContainer.getChildByName('roundPopup');
    
    if (overlay) {
        this.contentContainer.removeChild(overlay);
        overlay.destroy();
    }
    
    if (popup) {
        this.contentContainer.removeChild(popup);
        popup.destroy();
    }
}


private unlockActionButtons(): void {
    this.isActionLocked = false;
    this.selectedAction = null;
    
    const colors: Record<string, number> = {
        'rock': 0xe74c3c,
        'scissors': 0x3498db,
        'paper': 0xf1c40f
    };
    
    this.actionButtons.forEach(button => {
        button.eventMode = 'static';
        button.cursor = 'pointer';
        button.scale.set(1.0);
        button.alpha = 1.0;
        
        const bg = button.getChildByName('bg') as Graphics;
        const color = colors[button.actionType as string] || 0x7f8c8d;
        const radius = 35;
        
        bg.clear();
        bg.circle(0, 0, radius);
        bg.fill(color);
        bg.stroke({ width: 3, color: 0xffffff });
    });
}

private resetForNextRound(): void {
    // Разблокируем кнопки
    this.unlockActionButtons();
    
    // Сбрасываем выборы
    this.playerChoice = null;
    this.opponentChoice = null;
    
    // Убираем подсветки
    this.removePlayerHighlight();
    const opponentGlow = this.contentContainer.getChildByName('opponentGlow');
    if (opponentGlow) {
        this.contentContainer.removeChild(opponentGlow);
        opponentGlow.destroy();
    }
    
    // Возвращаем картинки к камню
    this.resetImagesToRock();
    
    // НЕ ПОКАЗЫВАЕМ ИНДИКАТОР ОЖИДАНИЯ для следующего раунда
    // так как соперник уже найден
}

// Сброс картинок к камню
private resetImagesToRock(): void {
    try {
        const rockTexture = Assets.cache.get('rock') as Texture;
        if (rockTexture) {
            this.gameImage1.texture = rockTexture;
            this.gameImage2.texture = rockTexture;
        } else {
            this.gameImage1.texture = this.createChoiceFallbackTexture('rock');
            this.gameImage2.texture = this.createChoiceFallbackTexture('rock');
        }
    } catch (error) {
        console.error('Ошибка при сбросе картинок:', error);
        this.gameImage1.texture = this.createChoiceFallbackTexture('rock');
        this.gameImage2.texture = this.createChoiceFallbackTexture('rock');
    }
}

private hideOpponentWaiting(): void {
    const waitingContainer = this.contentContainer.getChildByName('opponentWaiting');
    if (waitingContainer) {
        // Очищаем интервал анимации
        if ((waitingContainer as any).pulseInterval) {
            clearInterval((waitingContainer as any).pulseInterval);
        }
        
        this.contentContainer.removeChild(waitingContainer);
        waitingContainer.destroy({ children: true });
    }
}

private createImageLabels(y: number): void {
    // Подпись "ВЫ"
    const playerLabel = new Text({
        text: 'ВЫ',
        style: {
            fill: 0x3498db,
            fontSize: 16,
            fontFamily: 'Arial',
            fontWeight: 'bold'
        }
    });
    playerLabel.anchor.set(0.5);
    playerLabel.x = this.gameImage1.x;
    playerLabel.y = y;
    this.contentContainer.addChild(playerLabel);
    
    // Подпись "СОПЕРНИК"
    const opponentLabel = new Text({
        text: 'СОПЕРНИК',
        style: {
            fill: 0xe74c3c,
            fontSize: 16,
            fontFamily: 'Arial',
            fontWeight: 'bold'
        }
    });
    opponentLabel.anchor.set(0.5);
    opponentLabel.x = this.gameImage2.x;
    opponentLabel.y = y;
    this.contentContainer.addChild(opponentLabel);
}


private createChoiceFallbackTexture(choice: string): Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext('2d')!;
    
    // Цвета для разных выборов
    const colors: Record<string, number> = {
        'rock': 0xe74c3c,      // Красный для камня
        'scissors': 0x3498db,  // Синий для ножниц
        'paper': 0xf1c40f      // Жёлтый для бумаги
    };
    
    const emojis: Record<string, string> = {
        'rock': '✊',
        'scissors': '✌️',
        'paper': '🤚'
    };
    
    const color = colors[choice] || 0x7f8c8d;
    const emoji = emojis[choice] || '❓';
    
    // Фон
    ctx.fillStyle = '#' + color.toString(16).padStart(6, '0');
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Градиент
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Рамка
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);
    
    // Эмодзи
    ctx.font = '80px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(emoji, canvas.width / 2, canvas.height / 2);
    
    return Texture.from(canvas);
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
      0x3498db,
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
      0x3498db,
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

// Обновите метод onRock
private onRock(): void {
    console.log('✊ Выбран камень!');
    this.playerChoice = 'rock';
    this.lockActionButtons('rock');
    this.showActionEffect('КАМЕНЬ!', 0xe74c3c);
    
    // Картинка игрока уже камень, но можно добавить эффект подтверждения
    this.highlightPlayerChoice();
    
    // Ход соперника
    this.opponentTurn();
}

// Обновите метод onScissors
private onScissors(): void {
    console.log('✌️ Выбраны ножницы!');
    this.playerChoice = 'scissors';
    this.lockActionButtons('scissors');
    this.showActionEffect('НОЖНИЦЫ!', 0x3498db);
    
    // Обновляем картинку игрока
    this.updatePlayerImage('scissors');
    
    // Ход соперника
    this.opponentTurn();
}

// Обновите метод onPaper
private onPaper(): void {
    console.log('🤚 Выбрана бумага!');
    this.playerChoice = 'paper';
    this.lockActionButtons('paper');
    this.showActionEffect('БУМАГА!', 0xf1c40f);
    
    // Обновляем картинку игрока
    this.updatePlayerImage('paper');
    
    // Ход соперника
    this.opponentTurn();
}

private updatePlayerImage(choice: string): void {
    try {
        const texture = Assets.cache.get(choice) as Texture;
        if (texture) {
            this.gameImage1.texture = texture;
            // Добавляем подсветку после смены картинки
            this.highlightPlayerChoice();
        } else {
            this.gameImage1.texture = this.createChoiceFallbackTexture(choice);
            this.highlightPlayerChoice();
        }
    } catch (error) {
        console.error('Ошибка при обновлении картинки игрока:', error);
        this.gameImage1.texture = this.createChoiceFallbackTexture(choice);
        this.highlightPlayerChoice();
    }
}

private highlightPlayerChoice(): void {
    // Добавляем эффект свечения вокруг картинки игрока
    const glow = new Graphics();
    glow.name = 'playerGlow';
    glow.circle(this.gameImage1.x, this.gameImage1.y, 75);
    glow.stroke({ width: 4, color: 0xffd700 });
    glow.fill(0xffd700, 0.1);
    this.contentContainer.addChild(glow);
    
    // Анимация свечения
    let alpha = 0.1;
    let increasing = true;
    
    const glowInterval = setInterval(() => {
        if (!glow.destroyed) {
            if (increasing) {
                alpha += 0.02;
                if (alpha >= 0.3) increasing = false;
            } else {
                alpha -= 0.02;
                if (alpha <= 0.1) increasing = true;
            }
            glow.clear();
            glow.circle(this.gameImage1.x, this.gameImage1.y, 75);
            glow.stroke({ width: 4, color: 0xffd700 });
            glow.fill(0xffd700, alpha);
        }
    }, 50);
    
    (glow as any).glowInterval = glowInterval;
}

private removePlayerHighlight(): void {
    const glow = this.contentContainer.getChildByName('playerGlow');
    if (glow) {
        if ((glow as any).glowInterval) {
            clearInterval((glow as any).glowInterval);
        }
        this.contentContainer.removeChild(glow);
        glow.destroy();
    }
}

private updateOpponentImage(choice: string): void {
    try {
        const texture = Assets.cache.get(choice) as Texture;
        if (texture) {
            this.gameImage2.texture = texture;
        } else {
            this.gameImage2.texture = this.createChoiceFallbackTexture(choice);
        }
        
        // Добавляем эффект появления выбора соперника
        this.highlightOpponentChoice();
        
    } catch (error) {
        console.error('Ошибка при обновлении картинки соперника:', error);
        this.gameImage2.texture = this.createChoiceFallbackTexture(choice);
        this.highlightOpponentChoice();
    }
}

private highlightOpponentChoice(): void {
    const glow = new Graphics();
    glow.name = 'opponentGlow';
    glow.circle(this.gameImage2.x, this.gameImage2.y, 75);
    glow.stroke({ width: 4, color: 0xe74c3c });
    glow.fill(0xe74c3c, 0.1);
    this.contentContainer.addChild(glow);
    
    // Анимация
    let alpha = 0.1;
    let increasing = true;
    
    const glowInterval = setInterval(() => {
        if (!glow.destroyed) {
            if (increasing) {
                alpha += 0.03;
                if (alpha >= 0.4) increasing = false;
            } else {
                alpha -= 0.03;
                if (alpha <= 0.1) increasing = true;
            }
            glow.clear();
            glow.circle(this.gameImage2.x, this.gameImage2.y, 75);
            glow.stroke({ width: 4, color: 0xe74c3c });
            glow.fill(0xe74c3c, alpha);
        }
    }, 50);
    
    (glow as any).glowInterval = glowInterval;
    
    // Удаляем подсветку через 2 секунды
    setTimeout(() => {
        const glow = this.contentContainer.getChildByName('opponentGlow');
        if (glow) {
            if ((glow as any).glowInterval) {
                clearInterval((glow as any).glowInterval);
            }
            this.contentContainer.removeChild(glow);
            glow.destroy();
        }
    }, 2000);
}


private opponentTurn(): void {
    // Убираем подсветку игрока
    this.removePlayerHighlight();
    
    // Убираем индикатор ожидания соперника
    this.hideOpponentWaiting();
    
    // Задержка перед ходом соперника (имитация размышления)
    setTimeout(() => {
        // Генерируем случайный выбор соперника
        this.opponentChoice = this.getRandomChoice();
        console.log(`🤖 Соперник выбрал: ${this.getChoiceName(this.opponentChoice)}`);
        
        // Обновляем картинку соперника
        this.updateOpponentImage(this.opponentChoice);
        
        // Показываем выбор соперника
        this.showOpponentChoice(this.opponentChoice);
        
        // Определяем победителя
        const result = this.determineWinner(this.playerChoice!, this.opponentChoice);
        
        // Обновляем счёт для проверки
        let newPlayerScore = this.playerScore;
        let newOpponentScore = this.opponentScore;
        
        if (result === 'win') {
            newPlayerScore++;
        } else if (result === 'lose') {
            newOpponentScore++;
        }
        
        // Проверяем, будет ли это решающий раунд
        const isMatchPoint = (newPlayerScore >= this.WIN_SCORE || newOpponentScore >= this.WIN_SCORE);
        
        // Показываем результат
        setTimeout(() => {
            if (isMatchPoint) {
                // Решающий раунд - сразу обрабатываем и переходим
                this.processRoundResult(result);
            } else {
                // Обычный раунд - показываем popup
                this.showRoundResultPopup(result);
            }
        }, 1000);
        
    }, 1500);
}

// Метод генерации случайного выбора соперника
private getRandomChoice(): string {
    const choices = ['rock', 'scissors', 'paper'];
    const randomIndex = Math.floor(Math.random() * choices.length);
    return choices[randomIndex];
}

// Метод получения читаемого названия выбора
private getChoiceName(choice: string): string {
    const names: Record<string, string> = {
        'rock': 'Камень',
        'scissors': 'Ножницы',
        'paper': 'Бумага'
    };
    return names[choice] || choice;
}

// Метод получения эмодзи для выбора
private getChoiceEmoji(choice: string): string {
    const emojis: Record<string, string> = {
        'rock': '✊',
        'scissors': '✌️',
        'paper': '🤚'
    };
    return emojis[choice] || '❓';
}

// Метод определения победителя
private determineWinner(playerChoice: string, opponentChoice: string): 'win' | 'lose' | 'draw' {
    if (playerChoice === opponentChoice) {
        return 'draw';
    }
    
    const winConditions: Record<string, string> = {
        'rock': 'scissors',     // Камень побеждает ножницы
        'scissors': 'paper',    // Ножницы побеждают бумагу
        'paper': 'rock'         // Бумага побеждает камень
    };
    
    if (winConditions[playerChoice] === opponentChoice) {
        return 'win';
    } else {
        return 'lose';
    }
}

// Метод отображения выбора соперника
private showOpponentChoice(choice: string): void {
    const choiceEmoji = this.getChoiceEmoji(choice);
    const choiceName = this.getChoiceName(choice);
    
    // Текст с выбором соперника
    const opponentChoiceText = new Text({
        text: `🤖 ${choiceEmoji} ${choiceName}`,
        style: {
            fill: 0xe74c3c,
            fontSize: 24,
            fontFamily: 'Arial',
            fontWeight: 'bold'
        }
    });
    opponentChoiceText.anchor.set(0.5);
    opponentChoiceText.x = 0;
    opponentChoiceText.y = -120;
    opponentChoiceText.alpha = 0;
    this.contentContainer.addChild(opponentChoiceText);
    
    // Анимация появления
    let alpha = 0;
    const animate = setInterval(() => {
        alpha += 0.1;
        opponentChoiceText.alpha = alpha;
        opponentChoiceText.scale.set(1 + (1 - alpha) * 0.5);
        
        if (alpha >= 1) {
            clearInterval(animate);
            
            // Удаляем через 2 секунды
            setTimeout(() => {
                this.contentContainer.removeChild(opponentChoiceText);
                opponentChoiceText.destroy();
            }, 2000);
        }
    }, 50);
}

private processRoundResult(result: 'win' | 'lose' | 'draw'): void {
    // Обновляем счёт
    if (result === 'win') {
        this.playerScore++;
    } else if (result === 'lose') {
        this.opponentScore++;
    }
    
    // Сохраняем историю раунда
    this.roundHistory.push({
        round: this.currentRound,
        playerChoice: this.playerChoice!,
        opponentChoice: this.opponentChoice!,
        result: result
    });
    
    // Обновляем отображение счёта
    this.scoreText.text = `${this.playerScore} : ${this.opponentScore}`;
    
    // Проверяем, не закончился ли матч
    if (this.playerScore >= this.WIN_SCORE || this.opponentScore >= this.WIN_SCORE) {
        // Матч завершён - сразу переходим на ResultsScene
        this.stopTimer();
        this.finishMatch();
    } else {
        // Следующий раунд
        this.currentRound++;
        this.roundText.text = `Раунд ${this.currentRound}`;
    }
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
    
    const isWinner = this.playerScore > this.opponentScore;
    
    const result = {
        winner: isWinner ? 'ВЫ' : 'Player_123',
        score: `${this.playerScore}-${this.opponentScore}`,
        prize: isWinner ? this.tournamentData.prize : '0 ₽',
        players: [
            { name: 'ВЫ', score: this.playerScore, isWinner: isWinner },
            { name: 'Player_123', score: this.opponentScore, isWinner: !isWinner }
        ],
        roundHistory: this.roundHistory
    };
    
    this.emit('change-scene', 'ResultsScene', {
        tournament: this.tournamentData,
        result: result
    });
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
    
    if (this.searchInterval) {
        clearInterval(this.searchInterval);
    }
    
    super.destroy(options);
}
}