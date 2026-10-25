import { BaseScene } from "./BaseScene";
import { Graphics, Text, Container } from "pixi.js";
import { Button } from "../components/Button";

export class FindOpponentScene extends BaseScene {
  private background!: Graphics;
  private title!: Text;
  private backButton!: Button;
  private contentContainer!: Container;
  private tournamentData: any;
  private searchTimer: number = 15; // Таймер поиска соперника
  private timerInterval: any;
  private dotsInterval: any;

  async init(tournamentData?: any): Promise<void> {
    console.log("🔍 FindOpponentScene init вызван с данными:", tournamentData);
    this.tournamentData = tournamentData || this.getDefaultTournamentData();
    this.createBackground();
    this.createTitle();
    this.createBackButton();
    this.createContent();
    this.startOpponentSearch();
  }

  private getDefaultTournamentData(): any {
    return {
      name: "Ежедневный турнир",
      prize: "1,000 ₽",
      entry: "Бесплатно",
    };
  }

  private createBackground(): void {
    this.background = new Graphics();
    this.background.rect(0, 0, this.app.screen.width, this.app.screen.height);
    this.background.fill(0x0f1c2e);
    this.container.addChild(this.background);
  }

  private createTitle(): void {
    this.title = new Text({
      text: "ПОИСК СОПЕРНИКА",
      style: {
        fill: 0xecf0f1,
        fontSize: 32,
        fontFamily: "Arial",
        fontWeight: "bold",
        stroke: 0x3498db,
        strokeThickness: 2,
      },
    });

    this.title.anchor.set(0.5);
    this.title.x = this.centerX();
    this.title.y = 80;
    this.container.addChild(this.title);
  }

  private createBackButton(): void {
    this.backButton = new Button("Отмена", 120, 40);
    this.backButton.x = 80;
    this.backButton.y = 50;
    this.backButton.onPress = () => {
      console.log("❌ Отмена поиска соперника");
      this.cancelSearch();
      this.emit("change-scene", "TournamentInfoScene", this.tournamentData);
    };
    this.container.addChild(this.backButton);
  }

  private createContent(): void {
    this.contentContainer = new Container();
    this.contentContainer.x = this.centerX();
    this.contentContainer.y = 180;
    this.container.addChild(this.contentContainer);

    this.createTournamentInfo();
    this.createSearchAnimation();
    this.createTimer();
    this.createPlayersInfo();
    this.createSearchStats();
  }

  private createTournamentInfo(): void {
    const infoWidth = 400;
    const infoHeight = 80;

    // Карточка информации о турнире
    const infoCard = new Graphics();
    infoCard.roundRect(-infoWidth / 2, 0, infoWidth, infoHeight, 10);
    infoCard.fill(0x1e3a5f);
    infoCard.stroke({ width: 2, color: 0x3498db });
    this.contentContainer.addChild(infoCard);

    // Название турнира
    const tournamentName = new Text({
      text: this.tournamentData.name,
      style: {
        fill: 0xecf0f1,
        fontSize: 20,
        fontFamily: "Arial",
        fontWeight: "bold",
      },
    });
    tournamentName.anchor.set(0.5);
    tournamentName.x = 0;
    tournamentName.y = 20;
    this.contentContainer.addChild(tournamentName);

    // Приз и вход
    const detailsText = new Text({
      text: `🏆 ${this.tournamentData.prize} • 🎫 ${this.tournamentData.entry}`,
      style: {
        fill: 0xbdc3c7,
        fontSize: 16,
        fontFamily: "Arial",
      },
    });
    detailsText.anchor.set(0.5);
    detailsText.x = 0;
    detailsText.y = 50;
    this.contentContainer.addChild(detailsText);
  }

  private createSearchAnimation(): void {
    const searchY = 120;

    // Анимация поиска
    const searchText = new Text({
      text: "Поиск соперника",
      style: {
        fill: 0x3498db,
        fontSize: 24,
        fontFamily: "Arial",
        fontWeight: "bold",
      },
    });
    searchText.anchor.set(0.5);
    searchText.x = 0;
    searchText.y = searchY;
    this.contentContainer.addChild(searchText);

    // Анимированные точки
    const dots = new Text({
      text: ".",
      style: {
        fill: 0x3498db,
        fontSize: 36,
        fontFamily: "Arial",
        fontWeight: "bold",
      },
    });
    dots.anchor.set(0.5);
    dots.x = 0;
    dots.y = searchY + 40;
    this.contentContainer.addChild(dots);

    // Анимация точек
    let dotCount = 0;
    this.dotsInterval = setInterval(() => {
      dotCount = (dotCount + 1) % 4;
      dots.text = ".".repeat(dotCount);
    }, 500);
  }

  private createTimer(): void {
    const timerY = 200;

    const timerText = new Text({
      text: `Ожидание: ${this.searchTimer} сек`,
      style: {
        fill: 0xf1c40f,
        fontSize: 18,
        fontFamily: "Arial",
      },
    });
    timerText.anchor.set(0.5);
    timerText.x = 0;
    timerText.y = timerY;
    this.contentContainer.addChild(timerText);

    // Обновление таймера
    this.timerInterval = setInterval(() => {
      this.searchTimer--;
      timerText.text = `Ожидание: ${this.searchTimer} сек`;

      if (this.searchTimer <= 0) {
        this.opponentFound();
      }

      // Имитация нахождения соперника через случайное время
      if (this.searchTimer === 10 && Math.random() > 0.5) {
        this.opponentFound();
      }
    }, 1000);
  }

  private createPlayersInfo(): void {
    const playersY = 250;

    // Игрок 1 (вы)
    const player1Card = this.createPlayerCard(
      "ВЫ",
      "Ожидание...",
      -120,
      playersY,
      0x2c3e50,
    );
    this.contentContainer.addChild(player1Card);

    // VS текст
    const vsText = new Text({
      text: "VS",
      style: {
        fill: 0xe74c3c,
        fontSize: 28,
        fontFamily: "Arial",
        fontWeight: "bold",
      },
    });
    vsText.anchor.set(0.5);
    vsText.x = 0;
    vsText.y = playersY + 40;
    this.contentContainer.addChild(vsText);

    // Игрок 2 (противник)
    const player2Card = this.createPlayerCard(
      "ПРОТИВНИК",
      "Поиск...",
      120,
      playersY,
      0x34495e,
    );
    this.contentContainer.addChild(player2Card);

    // Имитация найденного противника
    setTimeout(() => {
      this.updateOpponentInfo(player2Card, "Player_123", "Найден");
    }, 8000);
  }

  private createPlayerCard(
    name: string,
    status: string,
    x: number,
    y: number,
    color: number,
  ): Container {
    const card = new Container();
    card.x = x;
    card.y = y;

    const cardWidth = 180;
    const cardHeight = 100;

    // Фон карточки игрока
    const bg = new Graphics();
    bg.roundRect(-cardWidth / 2, 0, cardWidth, cardHeight, 8);
    bg.fill(color);
    bg.stroke({ width: 2, color: 0x4a6572 });
    card.addChild(bg);

    // Аватар игрока
    const avatar = new Graphics();
    avatar.circle(0, -10, 20);
    avatar.fill(0x3498db);
    card.addChild(avatar);

    // Имя игрока
    const nameText = new Text({
      text: name,
      style: {
        fill: 0xecf0f1,
        fontSize: 16,
        fontFamily: "Arial",
        fontWeight: "bold",
      },
    });
    nameText.anchor.set(0.5);
    nameText.x = 0;
    nameText.y = 25;
    card.addChild(nameText);

    // Статус игрока
    const statusText = new Text({
      text: status,
      style: {
        fill: 0x95a5a6,
        fontSize: 14,
        fontFamily: "Arial",
      },
    });
    statusText.anchor.set(0.5);
    statusText.x = 0;
    statusText.y = 60;
    card.addChild(statusText);

    return card;
  }

  private updateOpponentInfo(
    playerCard: Container,
    name: string,
    status: string,
  ): void {
    // Обновляем информацию о противнике
    const nameText = playerCard.getChildAt(2) as Text;
    const statusText = playerCard.getChildAt(3) as Text;

    nameText.text = name;
    statusText.text = status;
    statusText.style.fill = 0x2ecc71;

    // Обновляем фон карточки
    const bg = playerCard.getChildAt(0) as Graphics;
    bg.clear();
    bg.roundRect(-90, 0, 180, 100, 8);
    bg.fill(0x27ae60);
    bg.stroke({ width: 2, color: 0x2ecc71 });

    // Обновляем аватар
    const avatar = playerCard.getChildAt(1) as Graphics;
    avatar.clear();
    avatar.circle(0, -10, 20);
    avatar.fill(0xe74c3c);
  }

  private createSearchStats(): void {
    const statsY = 380;

    const statsText = new Text({
      text: "🔍 Ищем подходящего соперника по вашему рейтингу...",
      style: {
        fill: 0xbdc3c7,
        fontSize: 14,
        fontFamily: "Arial",
      },
    });
    statsText.anchor.set(0.5);
    statsText.x = 0;
    statsText.y = statsY;
    this.contentContainer.addChild(statsText);

    const queueText = new Text({
      text: "Очередь: 3 игрока • Время поиска: быстрое",
      style: {
        fill: 0x95a5a6,
        fontSize: 12,
        fontFamily: "Arial",
      },
    });
    queueText.anchor.set(0.5);
    queueText.x = 0;
    queueText.y = statsY + 25;
    this.contentContainer.addChild(queueText);
  }

  private startOpponentSearch(): void {
    console.log(
      `🔍 Начат поиск соперника для турнира: ${this.tournamentData.name}`,
    );
  }

  private opponentFound(): void {
    console.log("✅ Соперник найден! Переход к матчу...");

    // Останавливаем анимации
    this.cancelSearch();

    // Показываем сообщение о найденном сопернике
    this.showOpponentFoundMessage();
  }

  private showOpponentFoundMessage(): void {
    // Затемняем фон
    const overlay = new Graphics();
    overlay.rect(0, 0, this.app.screen.width, this.app.screen.height);
    overlay.fill({ color: 0x000000, alpha: 0.7 });
    this.container.addChild(overlay);

    // Сообщение о найденном сопернике
    const messageContainer = new Container();
    messageContainer.x = this.centerX();
    messageContainer.y = this.centerY();
    this.container.addChild(messageContainer);

    const messageBg = new Graphics();
    messageBg.roundRect(-200, -100, 400, 200, 15);
    messageBg.fill(0x27ae60);
    messageBg.stroke({ width: 3, color: 0x2ecc71 });
    messageContainer.addChild(messageBg);

    const messageText = new Text({
      text: "СОПЕРНИК НАЙДЕН!",
      style: {
        fill: 0xffffff,
        fontSize: 28,
        fontFamily: "Arial",
        fontWeight: "bold",
      },
    });
    messageText.anchor.set(0.5);
    messageText.x = 0;
    messageText.y = -40;
    messageContainer.addChild(messageText);

    const opponentText = new Text({
      text: "Player_123\nРейтинг: 1450",
      style: {
        fill: 0xffffff,
        fontSize: 16,
        fontFamily: "Arial",
        align: "center",
      },
    });
    opponentText.anchor.set(0.5);
    opponentText.x = 0;
    opponentText.y = 0;
    messageContainer.addChild(opponentText);

    const startButton = new Button("НАЧАТЬ МАТЧ", 180, 50);
    startButton.x = 0;
    startButton.y = 40;
    startButton.onPress = () => {
      this.startMatch();
    };
    messageContainer.addChild(startButton);

    // Анимация появления
    messageContainer.alpha = 0;
    messageContainer.scale.set(0.8);

    const animateIn = setInterval(() => {
      messageContainer.alpha += 0.1;
      messageContainer.scale.x += 0.02;
      messageContainer.scale.y += 0.02;

      if (messageContainer.alpha >= 1) {
        clearInterval(animateIn);
      }
    }, 50);
  }

  private startMatch(): void {
    console.log("🎮 Начало матча! Переход на MatchScene...");

    // Переходим на сцену матча
    this.emit("change-scene", "MatchScene", this.tournamentData);
  }

  private cancelSearch(): void {
    console.log("❌ Поиск соперника отменен");

    // Останавливаем все таймеры
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    if (this.dotsInterval) {
      clearInterval(this.dotsInterval);
    }
  }

  resize(width: number, height: number): void {
    this.background.clear();
    this.background.rect(0, 0, width, height);
    this.background.fill(0x0f1c2e);

    this.title.x = this.centerX();

    if (this.contentContainer) {
      this.contentContainer.x = this.centerX();
    }
  }

  destroy(): void {
    // Очищаем таймеры при уничтожении сцены
    this.cancelSearch();
    super.destroy();
  }
}
