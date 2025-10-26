import { BaseScene } from './BaseScene';
import { Graphics, Text, Container } from 'pixi.js';
import { Button } from '../components/Button';

export class MatchScene extends BaseScene {
  private background!: Graphics;
  private title!: Text;
  private contentContainer!: Container;
  private tournamentData: any;
  private matchTimer: number = 5; // Укороченный таймер для тестирования

  async init(tournamentData?: any): Promise<void> {
    console.log('🎮 MatchScene init вызван с данными:', tournamentData);
    this.tournamentData = tournamentData || this.getDefaultTournamentData();
    this.createBackground();
    this.createTitle();
    this.createContent();
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

  private createContent(): void {
    this.contentContainer = new Container();
    this.contentContainer.x = this.centerX();
    this.contentContainer.y = 200;
    this.container.addChild(this.contentContainer);

    this.createPlayers();
    this.createMatchInfo();
    this.createGameField();
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

    // Фон карточки игрока
    const bg = new Graphics();
    bg.roundRect(-cardWidth / 2, 0, cardWidth, cardHeight, 10);
    bg.fill(0x2c3e50);
    bg.stroke({ width: 3, color: color });
    card.addChild(bg);

    // Имя игрока
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

    // Рейтинг
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

    // Статус
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

  private createGameField(): void {
    const fieldY = 190;

    // Игровое поле
    const field = new Graphics();
    field.rect(-200, fieldY, 400, 200);
    field.fill(0x34495e);
    field.stroke({ width: 2, color: 0x4a6572 });
    this.contentContainer.addChild(field);

    const fieldText = new Text({
      text: '🎮 ИГРОВОЙ ПРОЦЕСС 🎮',
      style: {
        fill: 0xecf0f1,
        fontSize: 20,
        fontFamily: 'Arial',
        fontWeight: 'bold'
      }
    });
    fieldText.anchor.set(0.5);
    fieldText.x = 0;
    fieldText.y = fieldY + 100;
    this.contentContainer.addChild(fieldText);

    // Таймер матча
    const timerText = new Text({
      text: `Матч через: ${this.matchTimer} сек`,
      style: {
        fill: 0xe74c3c,
        fontSize: 16,
        fontFamily: 'Arial',
        fontWeight: 'bold'
      }
    });
    timerText.anchor.set(0.5);
    timerText.x = 0;
    timerText.y = fieldY + 230;
    this.contentContainer.addChild(timerText);

    // Таймер матча
    const timerInterval = setInterval(() => {
      this.matchTimer--;
      timerText.text = `Матч через: ${this.matchTimer} сек`;

      if (this.matchTimer <= 0) {
        clearInterval(timerInterval);
        this.finishMatch();
      }
    }, 1000);
  }

  private startMatch(): void {
    console.log('🎮 Начало матча!');
  }

  private finishMatch(): void {
    console.log('⏰ Матч завершен!');
    
    // Генерируем случайный результат
    const result = this.generateMatchResult();
    
    // Переходим на сцену результатов
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
}