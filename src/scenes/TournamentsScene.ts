import { BaseScene } from "./BaseScene";
import { Graphics, Text, Container, Texture, Assets, Sprite } from "pixi.js";
import { Button } from "../components/Button";
import { RequestsAPI } from "../core/RequestsAPI";
import { ScrollContainer } from "../components/ScrollContainer";

export class TournamentsScene extends BaseScene {
  private background!: Graphics;
  private title!: Text;
  private backButton!: Button;
  private tournamentsContainer!: ScrollContainer;

  async init(): Promise<void> {
    this.createBackground();
    this.createTitle();
    this.createBackButton();
    this.createTournamentsList();
    //this.centerTournamentsList();
  }

  private createTournamentsList(): void {
    this.tournamentsContainer = new ScrollContainer(
      this.app.screen.width * 0.9, // Чуть шире для двух карточек
      this.app.screen.height * 0.7,
    );
    this.tournamentsContainer.x = this.centerX();
    this.tournamentsContainer.y = this.app.screen.height * 0.2;
    this.container.addChild(this.tournamentsContainer);

    const tournaments = RequestsAPI.GetTournamentListForUser();

    const scrollContent = this.tournamentsContainer.getContent();

    // Настройки сетки
    const cardWidth = this.tournamentsContainer.width * 0.45; // Ширина одной карточки
    const cardHeight = this.tournamentsContainer.height * 0.8; // Высота карточки
    const gapX = this.tournamentsContainer.width * 0.05; // Отступ между карточками по горизонтали
    const gapY = this.tournamentsContainer.width * 0.05; // Отступ между рядами
    const cardsPerRow = 2; // Количество карточек в ряду

    tournaments.forEach((tournament, index) => {
      const row = Math.floor(index / cardsPerRow);
      const col = index % cardsPerRow;

      const x = col * (cardWidth + gapX);
      const y = row * (cardHeight + gapY);

      this.createCompactCard(
        tournament,
        x,
        y,
        cardWidth,
        cardHeight,
        scrollContent,
      );
    });

    this.tournamentsContainer.updateScrollbar();
  }

  private createCompactCard(
    tournament: any,
    x: number,
    y: number,
    width: number,
    height: number,
    parent: Container,
  ): void {
    const card = new Container();
    card.x = x;
    card.y = y;
    parent.addChild(card);

    // Фон
    const bg = this.createCardBackground(width, height, tournament.status);
    card.addChild(bg);

    // Иконка турнира сверху по центру
    const iconText = new Text({
      text: "🏆",
      style: {
        fontSize: 36,
        fontFamily: "Arial",
      },
    });
    iconText.anchor.set(0.5);
    iconText.x = width / 2;
    iconText.y = 35;
    card.addChild(iconText);

    // Название турнира
    const nameText = new Text({
      text: tournament.name,
      style: {
        fill: 0xecf0f1,
        fontSize: 16,
        fontFamily: "Arial",
        fontWeight: "bold",
        align: "center",
      },
    });
    nameText.anchor.set(0.5);
    nameText.x = width / 2;
    nameText.y = 70;
    card.addChild(nameText);

    // Приз
    const prizeText = new Text({
      text: `🏆 ${tournament.prize}`,
      style: {
        fill: 0xf1c40f,
        fontSize: 14,
        fontFamily: "Arial",
        fontWeight: "bold",
      },
    });
    prizeText.anchor.set(0.5);
    prizeText.x = width / 2;
    prizeText.y = 95;
    card.addChild(prizeText);

    // Участники и время
    const infoText = new Text({
      text: `👥 ${tournament.players} • ⏰ ${tournament.time}`,
      style: {
        fill: 0xbdc3c7,
        fontSize: 11,
        fontFamily: "Arial",
      },
    });
    infoText.anchor.set(0.5);
    infoText.x = width / 2;
    infoText.y = 118;
    card.addChild(infoText);

    // Статус
    const statusConfig = {
      available: { text: "✅ ДОСТУПЕН", color: 0x2ecc71 },
      ongoing: { text: "⚡ ИДЕТ", color: 0xe74c3c },
      completed: { text: "📋 ЗАВЕРШЕН", color: 0x95a5a6 },
    };

    const status = statusConfig[tournament.status as keyof typeof statusConfig];
    const statusText = new Text({
      text: status.text,
      style: {
        fill: status.color,
        fontSize: 11,
        fontFamily: "Arial",
        fontWeight: "bold",
      },
    });
    statusText.anchor.set(0.5);
    statusText.x = width / 2;
    statusText.y = 138;
    card.addChild(statusText);

    // Интерактивность
    this.setupCardInteractivity(card, bg, tournament, width, height);
  }

  private createCardBackground(
    width: number,
    height: number,
    status: string,
  ): Graphics {
    const bg = new Graphics();

    const colors = {
      available: { primary: 0x2c3e50, secondary: 0x3498db },
      ongoing: { primary: 0xc0392b, secondary: 0xe74c3c },
      completed: { primary: 0x34495e, secondary: 0x7f8c8d },
    };

    const color = colors[status as keyof typeof colors];

    bg.roundRect(0, 0, width, height, 15);
    bg.fill(color.primary);
    bg.stroke({ width: 3, color: color.secondary });

    return bg;
  }

  private addCardContent(
    card: Container,
    tournament: any,
    width: number,
    height: number,
  ): void {
    // Левая часть: название и детали
    const nameText = new Text({
      text: tournament.name,
      style: {
        fill: 0xecf0f1,
        fontSize: 20,
        fontFamily: "Arial",
        fontWeight: "bold",
      },
    });
    nameText.x = 25;
    nameText.y = 20;
    card.addChild(nameText);

    const detailsText = new Text({
      text: `👥 ${tournament.players} • ⏰ ${tournament.time}`,
      style: {
        fill: 0xbdc3c7,
        fontSize: 14,
        fontFamily: "Arial",
      },
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
        fontFamily: "Arial",
        fontWeight: "bold",
      },
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
        fontFamily: "Arial",
      },
    });
    entryText.anchor.set(1, 0);
    entryText.x = width - 25;
    entryText.y = 50;
    card.addChild(entryText);

    // Статус в центре снизу
    const statusConfig = {
      available: { text: "ℹ️ ПОДРОБНЕЕ", color: 0x2ecc71 },
      ongoing: { text: "ℹ️ ПОДРОБНЕЕ", color: 0xe74c3c },
      completed: { text: "ℹ️ ПОДРОБНЕЕ", color: 0x95a5a6 },
    };

    const status = statusConfig[tournament.status as keyof typeof statusConfig];
    const statusText = new Text({
      text: status.text,
      style: {
        fill: status.color,
        fontSize: 16,
        fontFamily: "Arial",
        fontWeight: "bold",
      },
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
    height: number,
  ): void {
    card.eventMode = "static";
    card.cursor = "pointer";

    let isPressed = false;

    card.on("pointerover", () => {
      if (!isPressed) {
        card.scale.set(1.03);
        card.alpha = 0.95;
      }
    });

    card.on("pointerout", () => {
      if (!isPressed) {
        card.scale.set(1.0);
        card.alpha = 1.0;
      }
    });

    card.on("pointerdown", () => {
      isPressed = true;
      card.scale.set(0.97);
      card.alpha = 0.9;
    });

    card.on("pointerup", () => {
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
    this.emit("change-scene", "TournamentInfoScene", tournament);
  }

  // Остальные методы остаются без изменений
  private createBackground(): void {
    const texture = Assets.cache.get("rays") as Texture;

    this.background = new Graphics();
    this.background.rect(0, 0, this.app.screen.width, this.app.screen.height);
    this.background.fill(0x004bbc);
    this.container.addChild(this.background);

    const imageBg = new Sprite(texture);
    imageBg.width = this.app.screen.width * 2;
    imageBg.height = this.app.screen.height * 2;
    imageBg.x = this.centerX();
    imageBg.y = this.centerY();
    imageBg.anchor.set(0.5);
    //imageBg.alpha = 0.3; // 30% прозрачности
    this.container.addChild(imageBg);
  }

  private createTitle(): void {
    this.title = new Text({
      text: "ТУРНИРЫ",
      style: {
        fill: 0xecf0f1,
        fontSize: Math.round(this.app.screen.height * 0.11),
        fontFamily: "Arial",
        fontWeight: "bold",
        stroke: 0x2c3e50,
        strokeThickness: 3,
      },
    });

    this.title.anchor.set(0.5);
    this.title.x = this.centerX();
    this.title.y = this.app.screen.height * 0.1;
    this.container.addChild(this.title);
  }

  private createBackButton(): void {
    this.backButton = new Button("Назад", 120, 40);
    this.backButton.x = 80;
    this.backButton.y = 50;
    this.backButton.onPress = () => {
      console.log("🔙 Возврат в меню");
      this.emit("change-scene", "MenuScene");
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
