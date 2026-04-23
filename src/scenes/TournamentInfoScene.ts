import { BaseScene } from './BaseScene';
import { Graphics, Text, Container, Assets, Texture, Sprite } from 'pixi.js';
import { Button } from '../components/Button';
import { RequestsAPI } from '../core/RequestsAPI';
import { ScrollContainer } from '../components/ScrollContainer';

export class TournamentInfoScene extends BaseScene {
  private background!: Graphics;
  private title!: Text;
  private backButton!: Button;
  private contentContainer!: Container;
  private tournamentData: any;

  async init(tournamentData?: any): Promise<void> {

    this.tournamentData = RequestsAPI.GetTournamentDataById(tournamentData.id);
    this.createBackground();
    this.createTitle();
    this.createBackButton();
    this.createContent();
    this.TestScrollContainer();
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
    imageBg.y = this.centerY() -100
    imageBg.anchor.set(0.5)
    //imageBg.alpha = 0.3; // 30% прозрачности
    this.container.addChild(imageBg);
  }

  private createTitle(): void {
    this.title = new Text({
      text: 'ИНФОРМАЦИЯ О ТУРНИРЕ',
      style: {
        fill: 0xecf0f1,
        fontSize: 36,
        fontFamily: 'Arial',
        fontWeight: 'bold',
        stroke: 0x2c3e50,
        strokeThickness: 2
      }
    });
    
    this.title.anchor.set(0.5);
    this.title.x = this.centerX();
    this.title.y = 80;
    this.container.addChild(this.title);
  }

private TestScrollContainer(): void {
    const scroll = new ScrollContainer(400, 300);
    scroll.x = this.centerX();
    scroll.y = 400;
    
    const content = scroll.getContent();
    
    for (let i = 0; i < 25; i++) {
        const text = new Text({
            text: `Строка ${i + 1}`,
            style: { fill: 0xffffff, fontSize: 18 }
        });
        text.y = i * 35;
        content.addChild(text);
    }
    
    scroll.updateScrollbar();
    this.container.addChild(scroll);
}

  private createBackButton(): void {
    this.backButton = new Button('Назад', 120, 40);
    this.backButton.x = 80;
    this.backButton.y = 50;
    this.backButton.onPress = () => {
      console.log('🔙 Возврат к списку турниров');
      this.emit('change-scene', 'TournamentsScene');
    };
    this.container.addChild(this.backButton);
  }

  private createContent(): void {
    this.contentContainer = new Container();
    this.contentContainer.x = this.centerX();
    this.contentContainer.y = 150;
    this.container.addChild(this.contentContainer);

    this.createTournamentCard();
    this.createDetailsSection();
    this.createPrizeDistribution();
    this.createActionButtons();
  }

  private createTournamentCard(): void {
    const cardWidth = 450;
    const cardHeight = 120;

    // Карточка турнира
    const card = new Graphics();
    card.roundRect(-cardWidth / 2, 0, cardWidth, cardHeight, 15);
    card.fill(0x2c3e50);
    card.stroke({ width: 2, color: 0x3498db });
    this.contentContainer.addChild(card);

    // Название турнира
    const nameText = new Text({
      text: this.tournamentData.name,
      style: {
        fill: 0xecf0f1,
        fontSize: 24,
        fontFamily: 'Arial',
        fontWeight: 'bold'
      }
    });
    nameText.anchor.set(0.5);
    nameText.x = 0;
    nameText.y = 25;
    this.contentContainer.addChild(nameText);

    // Статус
    const statusConfig = {
      available: { text: '✅ ДОСТУПЕН', color: 0x2ecc71 },
      ongoing: { text: '⚡ ИДЕТ СЕЙЧАС', color: 0xe74c3c },
      completed: { text: '📋 ЗАВЕРШЕН', color: 0x95a5a6 }
    };

    const status = statusConfig[this.tournamentData.status as keyof typeof statusConfig];
    const statusText = new Text({
      text: status.text,
      style: {
        fill: status.color,
        fontSize: 14,
        fontFamily: 'Arial',
        fontWeight: 'bold'
      }
    });
    statusText.anchor.set(0.5);
    statusText.x = 0;
    statusText.y = 55;
    this.contentContainer.addChild(statusText);

    // Призовой фонд
    const prizeText = new Text({
      text: `🏆 ${this.tournamentData.prize}`,
      style: {
        fill: 0xf1c40f,
        fontSize: 20,
        fontFamily: 'Arial',
        fontWeight: 'bold'
      }
    });
    prizeText.anchor.set(0.5);
    prizeText.x = 0;
    prizeText.y = 85;
    this.contentContainer.addChild(prizeText);
  }

  private createDetailsSection(): void {
    const detailsY = 150;
    const detailsWidth = 400;

    // Заголовок раздела
    const detailsTitle = new Text({
      text: 'ДЕТАЛИ ТУРНИРА',
      style: {
        fill: 0x3498db,
        fontSize: 18,
        fontFamily: 'Arial',
        fontWeight: 'bold'
      }
    });
    detailsTitle.anchor.set(0.5);
    detailsTitle.x = 0;
    detailsTitle.y = detailsY;
    this.contentContainer.addChild(detailsTitle);

    // Сетка деталей
    const details = [
      { icon: '👥', text: `Участники: ${this.tournamentData.players}` },
      { icon: '⏰', text: `Время: ${this.tournamentData.time}` },
      { icon: '🕒', text: `Длительность: ${this.tournamentData.duration}` },
      { icon: '🎫', text: `Вход: ${this.tournamentData.entry}` },
      { icon: '📋', text: `Правила: ${this.tournamentData.rules}` }
    ];

    details.forEach((detail, index) => {
      const detailText = new Text({
        text: `${detail.icon} ${detail.text}`,
        style: {
          fill: 0xbdc3c7,
          fontSize: 16,
          fontFamily: 'Arial'
        }
      });
      detailText.anchor.set(0.5);
      detailText.x = 0;
      detailText.y = detailsY + 40 + (index * 30);
      this.contentContainer.addChild(detailText);
    });
  }

  private createPrizeDistribution(): void {
    const prizesY = 350;
    const prizesWidth = 400;

    // Заголовок раздела
    const prizesTitle = new Text({
      text: 'РАСПРЕДЕЛЕНИЕ ПРИЗОВ',
      style: {
        fill: 0x3498db,
        fontSize: 18,
        fontFamily: 'Arial',
        fontWeight: 'bold'
      }
    });
    prizesTitle.anchor.set(0.5);
    prizesTitle.x = 0;
    prizesTitle.y = prizesY;
    this.contentContainer.addChild(prizesTitle);

    // Список призов
    this.tournamentData.prizeDistribution.forEach((prize: string, index: number) => {
      const prizeText = new Text({
        text: prize,
        style: {
          fill: 0xecf0f1,
          fontSize: 14,
          fontFamily: 'Arial'
        }
      });
      prizeText.anchor.set(0.5);
      prizeText.x = 0;
      prizeText.y = prizesY + 30 + (index * 25);
      this.contentContainer.addChild(prizeText);
    });
  }

  private createActionButtons(): void {
    const buttonsY = 480;

    if (this.tournamentData.status === 'available') {
      const joinButton = new Button('ПРИСОЕДИНИТЬСЯ', 200, 50);
      joinButton.x = 0;
      joinButton.y = buttonsY;
      joinButton.onPress = () => {
        this.joinTournament();
      };
      this.contentContainer.addChild(joinButton);
    } else if (this.tournamentData.status === 'ongoing') {
      const spectateButton = new Button('СМОТРЕТЬ', 180, 45);
      spectateButton.x = -100;
      spectateButton.y = buttonsY;
      spectateButton.onPress = () => {
        this.spectateTournament();
      };
      this.contentContainer.addChild(spectateButton);

      const joinButton = new Button('ПРИСОЕДИНИТЬСЯ', 180, 45);
      joinButton.x = 100;
      joinButton.y = buttonsY;
      joinButton.onPress = () => {
        this.joinTournament();
      };
      this.contentContainer.addChild(joinButton);
    } else if (this.tournamentData.status === 'completed') {
      const resultsButton = new Button('РЕЗУЛЬТАТЫ', 200, 50);
      resultsButton.x = 0;
      resultsButton.y = buttonsY;
      resultsButton.onPress = () => {
        this.showResults();
      };
      this.contentContainer.addChild(resultsButton);
    }
  }

  private joinTournament(): void {
    console.log(`🎮 Присоединение к турниру: ${this.tournamentData.name}`);
    
    // Сразу переходим к поиску соперника
    console.log(`✅ Игрок присоединился к турниру: ${this.tournamentData.name}`);
  
    // Переход на сцену поиска соперника
    this.emit('change-scene', 'MatchScene', this.tournamentData);
  }

  private spectateTournament(): void {
    console.log(`👀 Просмотр турнира: ${this.tournamentData.name}`);
    // Здесь можно добавить логику перехода к просмотру
    alert(`Переход в режим наблюдения за турниром: ${this.tournamentData.name}`);
  }

  private showResults(): void {
    console.log(`📊 Показ результатов турнира: ${this.tournamentData.name}`);
    // Здесь можно добавить логику показа результатов
    alert(`Результаты турнира "${this.tournamentData.name}" будут доступны скоро!`);
  }

  resize(width: number, height: number): void {
    this.background.clear();
    this.background.rect(0, 0, width, height);
    this.background.fill(0x1a252f);

    this.title.x = this.centerX();
    
    if (this.contentContainer) {
      this.contentContainer.x = this.centerX();
    }
  }
}