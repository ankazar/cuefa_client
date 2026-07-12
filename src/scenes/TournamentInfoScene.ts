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
  private scrollContainer!: ScrollContainer;

  async init(tournamentData?: any): Promise<void> {

    this.tournamentData = RequestsAPI.GetTournamentDataById(tournamentData.id);
    this.createBackground();
    this.createTitle();
    this.createBackButton();
    this.createContent();
    this.createActionButtons();
    //this.TestScrollContainer();
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
    this.title.y = this.app.screen.height * 0.12;
    this.container.addChild(this.title);
  }

  private createBackButton(): void {
    this.backButton = new Button('Назад', 120, 40);
    this.backButton.x = 80;
    //this.backButton.y = 50;
    this.backButton.y = this.app.screen.height * 0.85; //todo в переменную
    this.backButton.onPress = () => {
      console.log('🔙 Возврат к списку турниров');
      //this.emit('change-scene', 'TournamentsScene');
      this.emit('change-scene', 'MenuScene');
    };
    this.container.addChild(this.backButton);
  }

  private createContent(): void {

    this.scrollContainer = new ScrollContainer(this.app.screen.width * 0.85, this.app.screen.height * 0.55);
    this.scrollContainer.x = this.centerX();
    this.scrollContainer.y = this.app.screen.height * 0.2;
    this.container.addChild(this.scrollContainer);

    this.contentContainer = this.scrollContainer.getContent();

    this.createTournamentCardTemp();
    //this.createTournamentCard();
    //this.createDetailsSection();
    //this.createPrizeDistribution();

    this.scrollContainer.updateScrollbar();
  }

  private createTournamentCardTemp(): void {
    const textureCup = Assets.cache.get('cup') as Texture;

    const imageCup = new Sprite(textureCup);

    //const imageCupWidth = this.app.screen.width/2;
    //const imageCupWidth = this.app.screen.width * 0.80
    //const imageCupHeight = this.app.screen.height/2;
    const imageCupHeight = this.app.screen.height * 0.50

    //imageCup.anchor.set(0.5);
    //imageCup.width = imageCupWidth;
    imageCup.height = imageCupHeight;
    const scale = imageCupHeight / imageCup.texture.height;

    imageCup.x = this.app.screen.width * 0.80 * 0.05

    imageCup.scale.set(scale); // пропорционально уменьшит и ширину, и высоту

    this.contentContainer.addChild(imageCup);

    const title = new Text({
      text: 'CUEFACUP1',
      style: {
        fill: 0xecf0f1,
        fontSize: 36,
        fontFamily: 'Arial',
        fontWeight: 'bold',
        stroke: 0x2c3e50,
        strokeThickness: 2
      }
    });
    title.anchor.set(0.5);
    title.x = this.app.screen.width * 0.80 * 0.6;
    title.y = imageCupHeight * 0.15;
    this.contentContainer.addChild(title);

    const title2 = new Text({
      text: 'Первый открытый турнир CUEFACUP',
      style: {
        fill: 0xecf0f1,
        fontSize: 24,
        fontFamily: 'Arial',
        fontWeight: 'bold',
        stroke: 0x2c3e50,
        strokeThickness: 2
      }
    });
    title2.anchor.set(0.5);
    title2.x = this.app.screen.width * 0.80 * 0.6;
    title2.y = imageCupHeight * 0.35;
    this.contentContainer.addChild(title2);

    const title3 = new Text({
      text: '🏆 10 туров до победы',
      style: {
        fill: 0xecf0f1,
        fontSize: 24,
        fontFamily: 'Arial',
        fontWeight: 'bold',
        stroke: 0x2c3e50,
        strokeThickness: 2
      }
    });
    title3.anchor.set(0.5);
    title3.x = this.app.screen.width * 0.80 * 0.6;
    title3.y = imageCupHeight * 0.5;
    this.contentContainer.addChild(title3);

    const title4 = new Text({
      text: '⚔️ Игра на вылет до 2х побед',
      style: {
        fill: 0xecf0f1,
        fontSize: 24,
        fontFamily: 'Arial',
        fontWeight: 'bold',
        stroke: 0x2c3e50,
        strokeThickness: 2
      }
    });
    title4.anchor.set(0.5);
    title4.x = this.app.screen.width * 0.80 * 0.6;
    title4.y = imageCupHeight * 0.65;
    this.contentContainer.addChild(title4);
  }

  private createTournamentCard(): void {
    const cardWidth = 450;
    const cardHeight = 120;

    // Карточка турнира
    const card = new Graphics();
    card.roundRect(0, 0, cardWidth, cardHeight, 15);
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
    nameText.x = cardWidth / 2;
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
    statusText.x = cardWidth / 2;
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
    prizeText.x = cardWidth / 2;
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
    detailsTitle.anchor.set(0, 0.5);
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
      detailText.anchor.set(0, 0.5);
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
    prizesTitle.anchor.set(0, 0.5);
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
      prizeText.anchor.set(0, 0.5);
      prizeText.x = 0;
      prizeText.y = prizesY + 30 + (index * 25);
      this.contentContainer.addChild(prizeText);
    });
  }

  private createActionButtons(): void {
    const buttonsY = this.app.screen.height * 0.85; 

    if (this.tournamentData.status === 'available') {
      const joinButton = new Button('ПРИСОЕДИНИТЬСЯ', 200, 50);
      joinButton.x = this.centerX();
      joinButton.y = buttonsY;
      joinButton.onPress = () => {
        this.joinTournament();
      };
      this.container.addChild(joinButton);
    } else if (this.tournamentData.status === 'ongoing') {
      const spectateButton = new Button('СМОТРЕТЬ', 180, 45);
      spectateButton.x = -100;
      spectateButton.y = buttonsY;
      spectateButton.onPress = () => {
        this.spectateTournament();
      };
      this.container.addChild(spectateButton);

      const joinButton = new Button('ПРИСОЕДИНИТЬСЯ', 180, 45);
      joinButton.x = 100;
      joinButton.y = buttonsY;
      joinButton.onPress = () => {
        this.joinTournament();
      };
      this.container.addChild(joinButton);
    } else if (this.tournamentData.status === 'completed') {
      const resultsButton = new Button('РЕЗУЛЬТАТЫ', 200, 50);
      resultsButton.x = 0;
      resultsButton.y = buttonsY;
      resultsButton.onPress = () => {
        this.showResults();
      };
      this.container.addChild(resultsButton);
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