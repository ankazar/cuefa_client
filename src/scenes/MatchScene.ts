import { RequestsAPI } from '../core/RequestsAPI';
import { BaseScene } from './BaseScene';
import { Graphics, Text, Container, Sprite, Assets, Texture } from 'pixi.js';
import { UserService } from '../core/UserService';
import { Avatar } from '../components/Avatar';

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
  private opponentAvatar: Avatar | null = null;

  private roundHistory: Array<{
    round: number;
    playerChoice: string;
    opponentChoice: string;
    result: 'win' | 'lose' | 'draw';
}> = [];

private tournamentToursText!: Text;
private userscore!: Text;
private opponentScoreText!: Text;
private roundText!: Text;

private sounds = {
    mah: new Audio('/assets/sounds/mah.mp3'),
    //win: new Audio('win.mp3')
};

async init(tournamentData?: any): Promise<void> {
    console.log('🎮 MatchScene init вызван с данными:', tournamentData);
    this.tournamentData = tournamentData;
    
    this.createBackground();
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

    // Три круглые кнопки
    this.createRoundButtons();
    
    // Блокируем кнопки на время поиска
    this.isActionLocked = true;
    this.setButtonsWaitingState();
    
    // Запускаем поиск соперника в фоне
    this.startSearching();
    
    // Ждём соперника (не блокируя интерфейс)
    this.waitForOpponent();

    //this.createSimpleOrbit();
}

  private createBackground(): void {
    this.background = new Graphics();
    this.background.rect(0, 0, this.app.screen.width, this.app.screen.height);
    this.background.fill(0x004bbc);
    this.container.addChild(this.background);

    const texture = Assets.cache.get('rays') as Texture;

    const imageBg = new Sprite(texture);
    imageBg.width = this.app.screen.width*2;
    imageBg.height = this.app.screen.height*2;
    imageBg.x = this.centerX()
    imageBg.y = this.centerY() 
    imageBg.anchor.set(0.5)
    //imageBg.alpha = 0.3; // 30% прозрачности
    this.container.addChild(imageBg);
  }

  private createContentContainer(): void {
    this.contentContainer = new Container();
    this.contentContainer.x = this.centerX();
    this.contentContainer.y = 0;
    this.container.addChild(this.contentContainer);
  }

  private createPlayers(): void {
    const userName = UserService.getUserData().userName;
    
    // Создаём общий контейнер для игроков
    const playersContainer = new Container();
    playersContainer.x = 0;
    playersContainer.y = 0;
    this.contentContainer.addChild(playersContainer);
    
    // Получаем ширину родительского контейнера (contentContainer находится по центру)
    // Но нам нужна ширина всего экрана
    const screenWidth = this.app.screen.width;
    
    // Фон на всю ширину экрана
    const playersBg = new Graphics();
    playersBg.rect(-this.centerX(), 0, screenWidth, this.app.screen.height * 0.15); // От левого края до правого
    playersBg.fill(0x000000, 0.4);
    //playersBg.stroke({ width: 2, color: 0x34495e });
    playersContainer.addChild(playersBg);
    
    // Позиции игроков остаются фиксированными относительно центра
    const player1X = -(screenWidth)/4;
    const player2X = (screenWidth)/4;
    
    // Игрок 1 (вы) - слева
    const player1Card = this.createPlayerCard(userName, player1X, 20, 0x3498db, true);
    playersContainer.addChild(player1Card);   

    
    // Игрок 2 (противник) - справа
    this.player2Card = this.createPlayerCard('Поиск...', player2X, 20, 0xe74c3c, false);
    playersContainer.addChild(this.player2Card);

        // Счёт и раунд - по центру
    this.createScoreDisplay(playersContainer);
    
    // Сохраняем ссылки на текстовые элементы
    this.player2NameText = this.player2Card.getChildByName('playerName') as Text;
    this.player2StatusText = this.player2Card.getChildByName('playerStatus') as Text;
    
    // Запускаем поиск соперника
    this.startSearching();
}

// НОВЫЙ МЕТОД: Запуск анимации поиска в карточке
private startSearching(): void {
    this.isSearching = true;
    let dotCount = 0;
    
    console.log('🔍 startSearching: player2NameText =', !!this.player2NameText);
    
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



// НОВЫЙ МЕТОД: Обработка получения соперника
private async onOpponentFound(): Promise<void> {
    try {
        // Получаем данные соперника
        this.opponentData = await RequestsAPI.GetMatchOpponent();
        console.log('📡 Получены данные соперника:', this.opponentData);
        
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
        // Используем тестовые данные при ошибке
        this.opponentData = { name: 'Player_123' };
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
private updateOpponentCard(data: { name: string; avatarUrl?: string; avatarBase64?: string }): void {
    console.log('📝 updateOpponentCard вызван с данными:', data);
    
    // Обновляем имя
    if (this.player2NameText) {
        this.player2NameText.text = data.name;
    }
    
    // Получаем аватар из карточки
    const avatar = this.opponentAvatar;
    
    if (avatar) {
        // Меняем цвет обводки на зелёный
        //avatar.setBorderColor(0x2ecc71);
        console.log('📝 updateOpponentCard Меняем цвет обводки на зелёный');
        
        // Обновляем текстуру
        //работают url
        if (!data.avatarBase64) {
            // Из Base64
            console.log('📥 data.avatarBase64 вызван с:', data.avatarBase64.substring(0, 50));
            avatar.loadFromBase64(data.avatarBase64);
        } else 
          if (data.avatarUrl) {
            // Из URL
            console.log('📝 updateOpponentCard Из URL');
            avatar.loadFromUrl(data.avatarUrl);
        } else {
            // Дефолтный аватар
            avatar.updateFromAlias('avatar_default');
        }
    }
  
    // Восстанавливаем непрозрачность
    if (this.gameImage2) {
        this.gameImage2.alpha = 1.0;
    }
    
    if (this.border2) {
        this.border2.alpha = 1.0;
    }
    
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

  private createPlayerCard(name: string, x: number, y: number, color: number, isPlayer: boolean): Container {
    const card = new Container();
    card.x = x;
    card.y = y;

    const cardWidth = (this.app.screen.width)/2;
    const cardHeight = this.app.screen.height * 0.15;
    const avatarSize = cardHeight * 0.8;

    // Получаем текстуру из кэша
    const avatarAlias = isPlayer ? 'user_photo' : 'search_opponent';

    const avatar = new Avatar(avatarAlias, avatarSize, color);

    // Позиционируем
    const avatarX = isPlayer ? -cardWidth /2 + avatarSize/2 + 5 : cardWidth /2 - avatarSize/2 - 5;
    avatar.x = avatarX;
    avatar.y = cardHeight / 4;


    card.addChild(avatar);

    if (!isPlayer) {
      this.opponentAvatar = avatar;
    }

    // Имя
    const nameText = new Text({
        text: name,
        style: {
            fill: 0xecf0f1,
            fontSize: Math.round(this.app.screen.height * 0.045),
            fontFamily: 'Arial',
            fontWeight: 'bold'
        }
    });
    nameText.name = 'playerName';
    nameText.anchor.set(isPlayer ? 0 : 1, 0.5);
    nameText.x = isPlayer ? avatarX + avatarSize/2 + 5 : avatarX - avatarSize/2 - 5;
    nameText.y = cardHeight / 4;
    card.addChild(nameText);

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

        this.gameImage2.scale.x = -1;
        
    } catch (error) {
        console.error('Ошибка получения текстур из кэша:', error);
        // Используем fallback с камнем
        this.gameImage1 = new Sprite(this.createChoiceFallbackTexture('rock'));
        this.gameImage2 = new Sprite(this.createChoiceFallbackTexture('rock'));
    }
}

private getPointOnRay(
    x1: number, y1: number,   // Начало линии
    x2: number, y2: number,   // Конец линии
    distance: number           // На сколько отступить ОТ x2,y2
): { x: number; y: number } {
    
    // 1. Вектор направления (от x1,y1 к x2,y2)
    const dx = x2 - x1;
    const dy = y2 - y1;
    
    // 2. Длина линии
    const length = Math.sqrt(dx * dx + dy * dy);
    
    // 3. Нормализованный вектор (единичной длины)
    const nx = dx / length;
    const ny = dy / length;
    
    // 4. Новая точка = конец линии + направление * расстояние
    return {
        x: x2 + nx * distance,
        y: y2 + ny * distance
    };
}

private createGameField(): void {
    const fieldY = this.app.screen.height/2;
    const imageWidth = this.app.screen.height/2;
    const imageHeight = this.app.screen.height/2;
    const gap = 20;

    this.isLoading = false;

    // Настраиваем первое изображение (игрок)
    this.gameImage1.anchor.set(0.5);
    this.gameImage1.width = imageWidth;
    this.gameImage1.height = imageHeight;
    this.gameImage1.x = -imageWidth / 2 //- gap / 2;
    this.gameImage1.y = fieldY; 

    const border1 = new Graphics();
    const bounds1 = this.gameImage1.getBounds();

    // Верхняя
    border1.moveTo(bounds1.x, bounds1.y);
    border1.lineTo(bounds1.x + bounds1.width, bounds1.y);
    // Правая
    border1.moveTo(bounds1.x + bounds1.width, bounds1.y);
    border1.lineTo(bounds1.x + bounds1.width, bounds1.y + bounds1.height);
    // Нижняя
    border1.moveTo(bounds1.x + bounds1.width, bounds1.y + bounds1.height);
    border1.lineTo(bounds1.x, bounds1.y + bounds1.height);
    // Левая
    border1.moveTo(bounds1.x, bounds1.y + bounds1.height);
    border1.lineTo(bounds1.x, bounds1.y);

    border1.moveTo(bounds1.x + bounds1.width/2, bounds1.y + bounds1.height/2);
    border1.lineTo(bounds1.x, bounds1.y + bounds1.height * 0.8);

    border1.stroke({ width: 2, color: 0x3498db });

    const distance1 = Math.hypot(bounds1.x - (bounds1.x + bounds1.width/2), (bounds1.y + bounds1.height * 0.8) - (bounds1.y + bounds1.height/2)) * 2;

    // Точка на продолжении
    //const extended = this.getPointOnRay(bounds.x + bounds.width/2, bounds.y + bounds.height/2, bounds.x, bounds.y + bounds.height * 0.8, distance);
    this.extended1 = this.getPointOnRay(bounds1.x + bounds1.width/2, bounds1.y + bounds1.height/2, bounds1.x, bounds1.y + bounds1.height * 0.8, distance1);

    //console.log('Старое мест')
    //console.log(this.extended)

    //console.log('distance: ', distance)

    //// Продолжение линии (пунктиром)
    border1.moveTo(bounds1.x, bounds1.y + bounds1.height * 0.8);
    border1.lineTo(this.extended1.x, this.extended1.y);
    border1.stroke({ width: 2, color: 0xe74c3c, alpha: 0.5 });
//
    //// Орбита
    //const orbit = new Graphics();
    //orbit.circle(extended.x, extended.y, distance * 1.5);
    //orbit.stroke({ width: 2, color: 0xffffff, alpha: 0.3 });
    //this.contentContainer.addChild(orbit);
    

    
    this.contentContainer.addChild(this.gameImage1);

    this.contentContainer.addChild(border1);

    //let angle = -33 * Math.PI / 180;
    //let rotation = 0;
    //let direction = -0.007;
    //let directionPositive = 0.016
    //let directionNegative = -0.007
    //const minAngle = -55 * Math.PI / 180
    //const maxAngle = -25 * Math.PI / 180   
//
    //
    //// Анимация
    //this.app.ticker.add(() => {
    //    if (!this.gameImage1 || this.gameImage1.destroyed) return;
//
    //        // Ограничение по углу
    //if (angle >= maxAngle) {
    //    //angle = maxAngle;
    //    direction = directionNegative;
    //    } else if (angle <= minAngle) {
    //        //angle = minAngle;
    //        direction = directionPositive;
    //    }
//
    //    angle += direction;
    //    rotation += direction;
//
    //    this.gameImage1.x = extended.x + Math.cos(angle) * distance * 1.5;
    //    this.gameImage1.y = extended.y + Math.sin(angle) * distance * 1.5;
    //    this.gameImage1.rotation = rotation// + Math.PI /4; // Поворот по направлению
    //});



    // Настраиваем второе изображение (соперник)
    this.gameImage2.anchor.set(0.5);
    this.gameImage2.width = imageWidth;
    this.gameImage2.height = imageHeight;
    this.gameImage2.x = imageWidth / 2 //+ gap / 2;
    this.gameImage2.y = fieldY;

    
    const border2 = new Graphics();
    const bounds2 = this.gameImage2.getBounds();

    // Верхняя
    border2.moveTo(bounds2.x, bounds2.y);
    border2.lineTo(bounds2.x + bounds2.width, bounds2.y);
    // Правая
    border2.moveTo(bounds2.x + bounds2.width, bounds2.y);
    border2.lineTo(bounds2.x + bounds2.width, bounds2.y + bounds2.height);
    // Нижняя
    border2.moveTo(bounds2.x + bounds2.width, bounds2.y + bounds2.height);
    border2.lineTo(bounds2.x, bounds2.y + bounds2.height);
    // Левая
    border2.moveTo(bounds2.x, bounds2.y + bounds2.height);
    border2.lineTo(bounds2.x, bounds2.y);

    border2.moveTo(bounds2.x + bounds2.width/2, bounds2.y + bounds2.height/2);
    //border2.moveTo(bounds2.x + bounds2.width/2, bounds2.y + bounds2.height/2);
    //border2.lineTo(bounds2.x, bounds2.y + bounds2.height * 0.8);
    border2.lineTo(bounds2.x + bounds2.width, bounds2.y + bounds2.height * 0.8);
    //border2.lineTo(0, 0);

    border2.stroke({ width: 2, color: 0x3498db });

    const distance2 = Math.hypot(bounds2.x - (bounds2.x + bounds2.width/2), (bounds2.y + bounds2.height * 0.8) - (bounds2.y + bounds2.height/2)) * 2;

    this.extended2 = this.getPointOnRay(bounds2.x + bounds2.width/2, bounds2.y + bounds2.height/2, bounds2.x + bounds2.width, bounds2.y + bounds2.height * 0.8, distance2);

        //// Продолжение линии (пунктиром)
    //border2.moveTo(bounds2.x, bounds2.y + bounds2.height * 0.8);
    border2.moveTo(bounds2.x + bounds2.width, bounds2.y + bounds2.height * 0.8);
    border2.lineTo(this.extended2.x, this.extended2.y);
    border2.stroke({ width: 2, color: 0xe74c3c, alpha: 0.5 });
    
    // ДЕЛАЕМ ПРАВОЕ ИЗОБРАЖЕНИЕ ПОЛУПРОЗРАЧНЫМ
    this.gameImage2.alpha = 0.4;
    
    this.contentContainer.addChild(this.gameImage2);

    this.contentContainer.addChild(border2);
   
    this.startTimer();
}



private createScoreDisplay(parentContainer?: Container): void {
    const targetContainer = parentContainer || this.contentContainer;
    
    // Контейнер для счёта и раунда
    const scoreContainer = new Container();
    scoreContainer.x = 0;
    scoreContainer.y = targetContainer.height/2;
    targetContainer.addChild(scoreContainer);

    const scoreBoardHeight = this.app.screen.height * 0.15;
    const scoreBoardWidth = scoreBoardHeight * 0.9;
    
    // Фон для счёта
    const scoreBg = new Graphics();
    scoreBg.roundRect(-scoreBoardWidth/2, -scoreBoardHeight/2, scoreBoardWidth, scoreBoardHeight, 0);
    scoreBg.fill('white');
    //scoreBg.stroke({ width: 2, color: 0xf1c40f });
    scoreContainer.addChild(scoreBg);
    
    // Счёт
    this.tournamentToursText = new Text({
        text: `Тур\n${this.tournamentData.curTour}/${this.tournamentData.lastTour}`,
        style: {
            fill: 'black',
            fontSize: Math.round(this.app.screen.height * 0.04),
            fontFamily: 'Arial',
            //fontWeight: 'bold',
            align: 'center'
        }
    });
    this.tournamentToursText.anchor.set(0.5);
    this.tournamentToursText.x = 0;
    this.tournamentToursText.y = -scoreBoardHeight*0.05;
    scoreContainer.addChild(this.tournamentToursText);

        this.opponentScoreText = new Text({
        text: this.opponentScore,
        style: {
            fill: 'white',
            fontSize: Math.round(this.app.screen.height * 0.09),
            fontFamily: 'Arial',
            fontWeight: 'bold'
        }
    });
    this.opponentScoreText.anchor.set(0.5);
    this.opponentScoreText.x = scoreBoardWidth * 0.8;
    this.opponentScoreText.y = -scoreBoardHeight*0.03;
    scoreContainer.addChild(this.opponentScoreText);
//
        this.userscore = new Text({
        text: this.playerScore,
        style: {
            fill: 'white',
            fontSize: Math.round(this.app.screen.height * 0.09),
            fontFamily: 'Arial',
            fontWeight: 'bold'
        }
    });
    this.userscore.anchor.set(0.5);
    this.userscore.x = -scoreBoardWidth * 0.8;
    this.userscore.y = -scoreBoardHeight*0.03;
    scoreContainer.addChild(this.userscore);
    
   const line = new Graphics();
   line.moveTo(-scoreBoardWidth*0.45, scoreBoardHeight*0.22);    // Начальная точка
   line.lineTo(scoreBoardWidth*0.45, scoreBoardHeight*0.22);   // Конечная точка
   line.stroke({ width: 1, color: 'DarkGray' });
   scoreContainer.addChild(line);

   this.roundText = new Text({
        text: `Раунд ${1}`,
        style: {
            fill: 'black',
            fontSize: Math.round(this.app.screen.height * 0.025),
            fontFamily: 'Arial',
            fontWeight: 'bold',
            align: 'center'
        }
    });
    this.roundText.anchor.set(0.5);
    this.roundText.x = 0;
    this.roundText.y = scoreBoardHeight*0.36;
    scoreContainer.addChild(this.roundText);
}



private showRoundResultPopup(result: 'win' | 'lose' | 'draw'): void {
    // Затемняем фон
    const overlay = new Graphics();
    overlay.name = 'popupOverlay';
    overlay.rect(-this.app.screen.width/2, 0, this.app.screen.width, this.app.screen.height);
    overlay.fill(0x000000, 0.7);
    this.contentContainer.addChild(overlay);
    
    // Контейнер popup
    const popup = new Container();
    popup.name = 'roundPopup';
    popup.x = 0;
    popup.y = this.app.screen.height/2;
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

  private createRoundButtons(): void {
    const buttonRadius = this.app.screen.height * 0.10;
    const buttonGap = 30;
    
    const buttonsContainer = new Container();
    buttonsContainer.x = 0;
    //buttonsContainer.y = y;
    buttonsContainer.y = this.app.screen.height * 0.85 - 5;
    this.contentContainer.addChild(buttonsContainer);

    // Кнопка 1 (Камень)
    const rockButton = this.createRoundButton(
      'rock_btn',
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
      'scissors_btn',
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
      'paper_btn',
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
    textureAlias: string,    // Алиас текстуры в кэше
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
    
    
    // Картинка из ассета
    const texture = Assets.cache.get(textureAlias) as Texture;
    if (texture) {
        const image = new Sprite(texture);
        image.name = 'buttonImage';
        image.anchor.set(0.5);
        image.x = 0;
        image.y = 0;
        image.width = radius * 2;   // Чуть больше половины радиуса
        image.height = radius * 2;
        button.addChild(image);
    } else {
        // Fallback: эмодзи если текстура не найдена
        const fallbackText = new Text({
            text: '?',
            style: {
                fontSize: radius,
                fontFamily: 'Arial'
            }
        });
        fallbackText.name = 'label';
        fallbackText.anchor.set(0.5);
        fallbackText.x = 0;
        fallbackText.y = 0;
        button.addChild(fallbackText);
    }
    
    // Внутренний блик
    const inner = new Graphics();
    inner.name = 'inner';
    inner.circle(-3, -3, radius - 6);
    inner.fill(0xffffff, 0.15);
    button.addChild(inner);
    
    // События
    let isPressed = false;
    
    button.on('pointerover', () => {
        if (!this.isActionLocked && !isPressed) {

            button.scale.set(1.1);
        }
    });
    
    button.on('pointerout', () => {
        if (!this.isActionLocked && !isPressed) {

            button.scale.set(1.0);
        }
    });
    
    button.on('pointerdown', () => {
        if (!this.isActionLocked) {
            isPressed = true;
            button.scale.set(0.95);

        }
    });
    
    button.on('pointerup', () => {
        if (!this.isActionLocked) {
            isPressed = false;
            button.scale.set(1.0);

            
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
      

      const radius = 35;
      let color: number;
      
      if (button.actionType === selectedType) {
        color = 0x2ecc71; // Зелёный для выбранной
      } else {
        color = 0x7f8c8d; // Серый для остальных
      }
      

      
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
    
    
    // Ход соперника
    this.opponentTurn();
}

// Обновите метод onScissors
private onScissors(): void {
    console.log('✌️ Выбраны ножницы!');
    this.playerChoice = 'scissors';
    this.lockActionButtons('scissors');
    this.showActionEffect('НОЖНИЦЫ!', 0x3498db);
    
    // Ход соперника
    this.opponentTurn();
}

// Обновите метод onPaper
private onPaper(): void {
    console.log('🤚 Выбрана бумага!');
    this.playerChoice = 'paper';
    this.lockActionButtons('paper');
    this.showActionEffect('БУМАГА!', 0xf1c40f);
       
    // Ход соперника
    this.opponentTurn();
}

//private playSound(url: string, volume: number = 1): void {
//    const audio = new Audio(url);
//    audio.volume = volume;
//    audio.play();
//}



private updatePlayerImage(choice: string): void {
    try {
            //исходное расположение
            const fieldY = this.app.screen.height/2;
            const imageWidth = this.app.screen.height/2;
            const imageHeight = this.app.screen.height/2;

            // Настраиваем первое изображение (игрок)
            this.gameImage1.anchor.set(0.5);
            this.gameImage1.width = imageWidth;
            this.gameImage1.height = imageHeight;
            this.gameImage1.x = -imageWidth / 2 //- gap / 2;
            this.gameImage1.y = fieldY; 
            this.gameImage1.rotation = 0;

        const texture = Assets.cache.get(choice) as Texture;
        if (texture) {
            this.gameImage1.texture = texture;
        } else {
            this.gameImage1.texture = this.createChoiceFallbackTexture(choice);
        }
    } catch (error) {
        console.error('Ошибка при обновлении картинки игрока:', error);
        this.gameImage1.texture = this.createChoiceFallbackTexture(choice);
    }
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
            const fieldY = this.app.screen.height/2;
            const imageWidth = this.app.screen.height/2;
            const imageHeight = this.app.screen.height/2;
        
            this.gameImage2.anchor.set(0.5);
            this.gameImage2.width = imageWidth;
            this.gameImage2.height = imageHeight;
            this.gameImage2.x = imageWidth / 2 //+ gap / 2;
            this.gameImage2.y = fieldY;
            this.gameImage2.rotation = 0;
        const texture = Assets.cache.get(choice) as Texture;
        if (texture) {
            this.gameImage2.texture = texture;
        } else {
            this.gameImage2.texture = this.createChoiceFallbackTexture(choice);
        }
        
    } catch (error) {
        console.error('Ошибка при обновлении картинки соперника:', error);
        this.gameImage2.texture = this.createChoiceFallbackTexture(choice);
    }
}

private shakeAnimation = (): void => {
        if (!this.gameImage1 || this.gameImage1.destroyed) {
        this.stopShakeAnimation();
        return;
    }

    //console.log('Анимация 1')

    //const bounds = this.gameImage1.getBounds();
//
    //const distance = Math.hypot(bounds.x - (bounds.x + bounds.width/2), (bounds.y + bounds.height * 0.8) - (bounds.y + bounds.height/2)) * 2;
//
    //// Точка на продолжении
    //const extended = this.getPointOnRay(bounds.x + bounds.width/2, bounds.y + bounds.height/2, bounds.x, bounds.y + bounds.height * 0.8, distance);

    //let angle = -33 * Math.PI / 180;
    //let rotation = 0;
    //let direction = -0.007;
    let directionPositive = 0.025
    //let directionPositive = 0.001
    let directionNegative = -0.007
    const minAngle = -55 * Math.PI / 180
    const maxAngle = -25 * Math.PI / 180  

                // Ограничение по углу
    if (this.angle1 >= maxAngle) {

        this.direction = directionNegative;        

    } else if (this.angle1 <= minAngle) {

        //console.log('звук')
        if(this.direction <= 0)
        {
          //this.sounds.mah.play();
          setTimeout(() => {
                this.sounds.mah.play();
            }, 200)
          //console.log(this.direction)
        }
        this.direction = directionPositive;
    }

        //console.log('Анимация 2')
        //console.log(this.angle)

        this.angle1 += this.direction;
        this.rotation1 += this.direction;

        this.angle2 += -this.direction;
        this.rotation2 += -this.direction;

        this.sumAngle += Math.abs(this.direction);
        //console.log(this.maxAngle)

        this.gameImage1.x = this.extended1.x + Math.cos(this.angle1) * this.distance1 * 1.5;
        this.gameImage1.y = this.extended1.y + Math.sin(this.angle1) * this.distance1 * 1.5;
        this.gameImage1.rotation = this.rotation1// + Math.PI /4; // Поворот по направлению

        this.gameImage2.x = this.extended2.x + Math.cos(this.angle2) * this.distance2 * 1.5;
        this.gameImage2.y = this.extended2.y + Math.sin(this.angle2) * this.distance2 * 1.5;
        this.gameImage2.rotation = this.rotation2// + Math.PI /4; // Поворот по направлению

            // Останавливаем после N полных циклов
    if (this.sumAngle >= 2.91) {
        this.stopShakeAnimation();
        this.onSwingComplete?.();
    }
}

//private shakeCount: number = 0;
//private maxSwings: number = 3;
private onSwingComplete: (() => void) | null = null;

private distance1: number = 0;
private distance2: number = 0;
private extended1 = {x: 0, y: 0} 
private extended2 = {x: 0, y: 0} 
private angle1: number = -33 * Math.PI / 180;
private angle2: number = -147 * Math.PI / 180;
private sumAngle: number = 0;
private rotation1: number = 0;
private rotation2: number = 0;
private direction: number = 0;

// Очистка
private stopShakeAnimation(): void {
    this.app.ticker.remove(this.shakeAnimation);
}

// Запуск с await
async playShakeAnimation(): Promise<void> {
    return new Promise((resolve) => {
        //this.shakeCount = 0;
        this.sumAngle = 0;
        //this.maxSwings = cycles;
        const bounds1 = this.gameImage1.getBounds();
        const bounds2 = this.gameImage2.getBounds();

        this.distance1 = Math.hypot(bounds1.x - (bounds1.x + bounds1.width/2), (bounds1.y + bounds1.height * 0.8) - (bounds1.y + bounds1.height/2)) * 2;
        this.distance2 = Math.hypot(bounds2.x - (bounds2.x + bounds2.width/2), (bounds2.y + bounds2.height * 0.8) - (bounds2.y + bounds2.height/2)) * 2;

        // Точка на продолжении
        //this.extended = this.getPointOnRay(bounds.x + bounds.width/2, bounds.y + bounds.height/2, bounds.x, bounds.y + bounds.height * 0.8, this.distance);
        console.log('Новое мест')
        //console.log(this.extended)
        this.direction = -0.007;
        //this.angle = 0;
        this.onSwingComplete = resolve;
        this.app.ticker.add(this.shakeAnimation);
    });
}

// Измените метод на async
private async opponentTurn(): Promise<void> {
    // Убираем подсветку игрока
    this.removePlayerHighlight();
    
    // Убираем индикатор ожидания соперника
    this.hideOpponentWaiting();
    
    // Задержка перед ходом соперника
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Генерируем случайный выбор соперника
    this.opponentChoice = this.getRandomChoice();
    console.log(`🤖 Соперник выбрал: ${this.getChoiceName(this.opponentChoice)}`);

    console.log('До анимации')
    // ✅ Ждём завершения анимации
    await this.playShakeAnimation();
    console.log('После анимации')
    
    // Теперь этот код выполнится ПОСЛЕ анимации
    this.updateOpponentImage(this.opponentChoice);
    this.updatePlayerImage(this.playerChoice ?? '');
    
    // Показываем выбор соперника
    this.showOpponentChoice(this.opponentChoice);
    
    // Определяем победителя
    const result = this.determineWinner(this.playerChoice!, this.opponentChoice);
    
    // Обновляем счёт
    let newPlayerScore = this.playerScore;
    let newOpponentScore = this.opponentScore;
    
    if (result === 'win') {
        newPlayerScore++;
    } else if (result === 'lose') {
        newOpponentScore++;
    }
    
    const isMatchPoint = (newPlayerScore >= this.WIN_SCORE || newOpponentScore >= this.WIN_SCORE);
    
    // Небольшая пауза перед результатом
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (isMatchPoint) {
        this.processRoundResult(result);
    } else {
        this.showRoundResultPopup(result);
    }
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
    //this.scoreText.text = `${this.playerScore} : ${this.opponentScore}`;
    this.userscore.text = this.playerScore;
    this.opponentScoreText.text = this.opponentScore;
    
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

  private createSimpleOrbit(): void {
    const centerX = this.centerX();
    const centerY = this.centerY();
    let angle = 0;
    
    // Центр
    const centerEmoji = new Text({
        text: '🎯',
        style: { fontSize: 40 }
    });
    centerEmoji.anchor.set(0.5);
    centerEmoji.x = centerX;
    centerEmoji.y = centerY;
    this.container.addChild(centerEmoji);
    
    // Орбита
    const orbit = new Graphics();
    orbit.circle(centerX, centerY, 100);
    orbit.stroke({ width: 2, color: 0xffffff, alpha: 0.3 });
    this.container.addChild(orbit);
    
    // Вращающийся эмодзи
    const rocket = new Text({
        text: '🚀',
        style: { fontSize: 30 }
    });
    rocket.anchor.set(0.5);
    this.container.addChild(rocket);
    
    // Анимация
    this.app.ticker.add(() => {
        if (!rocket || rocket.destroyed) return; //фикс перехода на другую сцену

        angle += 0.02;
        rocket.x = centerX + Math.cos(angle) * 100;
        rocket.y = centerY + Math.sin(angle) * 100;
        rocket.rotation = angle + Math.PI / 2; // Поворот по направлению
    });
}

private finishMatch(): void {
    console.log('⏰ Матч завершен!');
    
    const isWinner = this.playerScore > this.opponentScore;
    
    const result = {
        winner: isWinner,
        score: `${this.playerScore}-${this.opponentScore}`,
        //prize: isWinner ? this.tournamentData.prize : '0 ₽',
        players: [
            { name: 'ВЫ', score: this.playerScore, isWinner: isWinner },
            //{ name: 'Player_123', score: this.opponentScore, isWinner: !isWinner }
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
