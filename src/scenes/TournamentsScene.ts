import { BaseScene } from './BaseScene';
import { Graphics, Text, Container } from 'pixi.js';
import { Button } from '../components/Button';
import { RequestsAPI } from '../core/RequestsAPI';

export class TournamentsScene extends BaseScene {
  private background!: Graphics;
  private title!: Text;
  private backButton!: Button;
  private tournamentsContainer!: Container;

  async init(): Promise<void> {
    this.createBackground();
    this.createTitle();
    this.createBackButton();
    this.createTournamentsList();
    this.centerTournamentsList();
  }

  private createTournamentsList(): void {
    this.tournamentsContainer = new Container();
    this.container.addChild(this.tournamentsContainer);

    const tournaments = RequestsAPI.GetTournamentListForUser();    

    tournaments.forEach((tournament, index) => {
      this.createInteractiveCard(tournament, index);
    });
  }

  private createInteractiveCard(tournament: any, index: number): void {
    const itemY = index * 110;
    const itemWidth = 520;
    const itemHeight = 95;

    const card = new Container();
    card.y = itemY;
    this.tournamentsContainer.addChild(card);

    // Фон с градиентом
    const bg = this.createCardBackground(itemWidth, itemHeight, tournament.status);
    card.addChild(bg);

    // Контент карточки
    this.addCardContent(card, tournament, itemWidth, itemHeight);

    // Интерактивность
    this.setupCardInteractivity(card, bg, tournament, itemWidth, itemHeight);
  }

  private createCardBackground(width: number, height: number, status: string): Graphics {
    const bg = new Graphics();
    
    const colors = {
      available: { primary: 0x2c3e50, secondary: 0x3498db },
      ongoing: { primary: 0xc0392b, secondary: 0xe74c3c },
      completed: { primary: 0x34495e, secondary: 0x7f8c8d }
    };

    const color = colors[status as keyof typeof colors];
    
    bg.roundRect(0, 0, width, height, 15);
    bg.fill(color.primary);
    bg.stroke({ width: 3, color: color.secondary });

    return bg;
  }

  private addCardContent(card: Container, tournament: any, width: number, height: number): void {
    // Левая часть: название и детали
    const nameText = new Text({
      text: tournament.name,
      style: {
        fill: 0xecf0f1,
        fontSize: 20,
        fontFamily: 'Arial',
        fontWeight: 'bold'
      }
    });
    nameText.x = 25;
    nameText.y = 20;
    card.addChild(nameText);

    const detailsText = new Text({
      text: `👥 ${tournament.players} • ⏰ ${tournament.time}`,
      style: {
        fill: 0xbdc3c7,
        fontSize: 14,
        fontFamily: 'Arial'
      }
    });
    detailsText.x = 25;
    detailsText.y = 50;
    card.addChild(detailsText);

    // Правая часть: приз и вход
    const prizeText = new Text({
      text: `🏆 ${tournament.prize}`,
      style: {
        fill: 0xf1c40f,
        fontSize: 18,
        fontFamily: 'Arial',
        fontWeight: 'bold'
      }
    });
    prizeText.anchor.set(1, 0);
    prizeText.x = width - 25;
    prizeText.y = 20;
    card.addChild(prizeText);

    const entryText = new Text({
      text: `Вход: ${tournament.entry}`,
      style: {
        fill: 0x95a5a6,
        fontSize: 14,
        fontFamily: 'Arial'
      }
    });
    entryText.anchor.set(1, 0);
    entryText.x = width - 25;
    entryText.y = 50;
    card.addChild(entryText);

    // Статус в центре снизу
    const statusConfig = {
      available: { text: 'ℹ️ ПОДРОБНЕЕ', color: 0x2ecc71 },
      ongoing: { text: 'ℹ️ ПОДРОБНЕЕ', color: 0xe74c3c },
      completed: { text: 'ℹ️ ПОДРОБНЕЕ', color: 0x95a5a6 }
    };

    const status = statusConfig[tournament.status as keyof typeof statusConfig];
    const statusText = new Text({
      text: status.text,
      style: {
        fill: status.color,
        fontSize: 16,
        fontFamily: 'Arial',
        fontWeight: 'bold'
      }
    });
    statusText.anchor.set(0.5, 0);
    statusText.x = width / 2;
    statusText.y = 65;
    card.addChild(statusText);
  }

  private setupCardInteractivity(
    card: Container, 
    bg: Graphics, 
    tournament: any, 
    width: number, 
    height: number
  ): void {
    card.eventMode = 'static';
    card.cursor = 'pointer';
    
    let isPressed = false;

    card.on('pointerover', () => {
      if (!isPressed) {
        card.scale.set(1.03);
        card.alpha = 0.95;
      }
    });

    card.on('pointerout', () => {
      if (!isPressed) {
        card.scale.set(1.0);
        card.alpha = 1.0;
      }
    });

    card.on('pointerdown', () => {
      isPressed = true;
      card.scale.set(0.97);
      card.alpha = 0.9;
    });

    card.on('pointerup', () => {
      isPressed = false;
      card.scale.set(1.03);
      card.alpha = 0.95;
      setTimeout(() => {
        this.onTournamentClick(tournament);
      }, 150);
    });
  }

  private onTournamentClick(tournament: any): void {
    console.log(`🎮 Переход к информации о турнире: ${tournament.name}`);
    
    // Передаем данные о турнире в следующую сцену
    this.emit('change-scene', 'TournamentInfoScene', tournament);
  }

  // Остальные методы остаются без изменений
  private createBackground(): void {
    this.background = new Graphics();
    this.background.rect(0, 0, this.app.screen.width, this.app.screen.height);
    this.background.fill(0x34495e);
    this.container.addChild(this.background);
  }

  private createTitle(): void {
    this.title = new Text({
      text: 'ТУРНИРЫ',
      style: {
        fill: 0xecf0f1,
        fontSize: 48,
        fontFamily: 'Arial',
        fontWeight: 'bold',
        stroke: 0x2c3e50,
        strokeThickness: 3
      }
    });
    
    this.title.anchor.set(0.5);
    this.title.x = this.centerX();
    this.title.y = 100;
    this.container.addChild(this.title);
  }

  private createBackButton(): void {
    this.backButton = new Button('Назад', 120, 40);
    this.backButton.x = 80;
    this.backButton.y = 50;
    this.backButton.onPress = () => {
      console.log('🔙 Возврат в меню');
      this.emit('change-scene', 'MenuScene');
    };
    this.container.addChild(this.backButton);
  }

  private centerTournamentsList(): void {
    this.tournamentsContainer.x = this.centerX() - 260;
    const totalHeight = 4 * 110;
    const startY = (this.app.screen.height - totalHeight) / 2;
    this.tournamentsContainer.y = Math.max(150, startY);
  }

  resize(width: number, height: number): void {
    this.background.clear();
    this.background.rect(0, 0, width, height);
    this.background.fill(0x34495e);
    this.title.x = this.centerX();
    this.centerTournamentsList();
    this.backButton.x = 80;
  }
}