import { BaseScene } from './BaseScene';
import { Graphics, Text, Container } from 'pixi.js';
import { Button } from '../components/Button';

export class ResultsScene extends BaseScene {
  private background!: Graphics;
  private title!: Text;
  private contentContainer!: Container;
  private matchData: any;

  async init(matchData?: any): Promise<void> {
    this.matchData = matchData;
    console.log('this.matchData.tournamentData: ', this.matchData.tournament)
    this.createBackground();
    this.createTitle();
    this.createContent();
    this.createNavigationButtons();
  }


  private createBackground(): void {
    this.background = new Graphics();
    this.background.rect(0, 0, this.app.screen.width, this.app.screen.height);
    
    if (this.matchData.result.winner) {
      this.background.fill(0x1b5e20); // Зеленый для победы
    } else {
      this.background.fill(0xb71c1c); // Красный для поражения
    }
    
    this.container.addChild(this.background);
  }

  private createTitle(): void {
    const isWinner = this.matchData.result.winner;
    
    this.title = new Text({
      text: isWinner ? 'ПОБЕДА! 🎉' : 'ПОРАЖЕНИЕ',
      style: {
        fill: 0xffffff,
        fontSize: 48,
        fontFamily: 'Arial',
        fontWeight: 'bold',
        stroke: isWinner ? 0x4caf50 : 0xf44336,
        strokeThickness: 4
      }
    });
    
    this.title.anchor.set(0.5);
    this.title.x = this.centerX();
    this.title.y = 100;
    this.container.addChild(this.title);
  }

  private createContent(): void {
    this.contentContainer = new Container();
    this.contentContainer.x = this.centerX();
    this.contentContainer.y = 200;
    this.container.addChild(this.contentContainer);

    this.createTournamentInfo();
    this.createScoreBoard();
    this.createPrizeInfo();
  }

  private createTournamentInfo(): void {
    const infoText = new Text({
      text: this.matchData.tournament.name,
      style: {
        fill: 0xffffff,
        fontSize: 20,
        fontFamily: 'Arial',
        fontWeight: 'bold'
      }
    });
    infoText.anchor.set(0.5);
    infoText.x = 0;
    infoText.y = 0;
    this.contentContainer.addChild(infoText);
  }

  private createScoreBoard(): void {
    const scoreY = 60;
    const scoreWidth = 400;
    const scoreHeight = 120;

    // Фон таблицы счета
    const scoreBg = new Graphics();
    scoreBg.roundRect(-scoreWidth / 2, scoreY, scoreWidth, scoreHeight, 10);
    scoreBg.fill(0xffffff);
    scoreBg.stroke({ width: 2, color: 0xcccccc });
    this.contentContainer.addChild(scoreBg);

    // Заголовок
    const scoreTitle = new Text({
      text: 'РЕЗУЛЬТАТ МАТЧА',
      style: {
        fill: 0x333333,
        fontSize: 18,
        fontFamily: 'Arial',
        fontWeight: 'bold'
      }
    });
    scoreTitle.anchor.set(0.5);
    scoreTitle.x = 0;
    scoreTitle.y = scoreY + 20;
    this.contentContainer.addChild(scoreTitle);

    if(this.matchData.result.winner){
      const curTour = this.matchData.tournament.curTour;
      const lastTour = this.matchData.tournament.lastTour;
      var txt;

      if(curTour == lastTour){
        txt = 'Победа в турнире'
      }
      else{
        txt = `Вы выиграли ${curTour} тура из ${lastTour}`
        this.matchData.tournament.curTour += 1; //TODO может перенести где кнопка нажимается
      }

    const scoreTitle = new Text({
      text: txt,
      style: {
        fill: 0x333333,
        fontSize: 18,
        fontFamily: 'Arial',
        fontWeight: 'bold'
      }
    });
    scoreTitle.anchor.set(0.5);
    scoreTitle.x = 0;
    scoreTitle.y = scoreY + 40;
    this.contentContainer.addChild(scoreTitle);
    }
    else{

    }
  }

  private createPrizeInfo(): void {
    const prizeY = 220;
    const isWinner = this.matchData.result.winner;

    if (isWinner) {
      const prizeText = new Text({
        text: `🏆 ВЫ ВЫИГРАЛИ: ${this.matchData.tournament.prize}`, //TODO не определяет во втором туре
        style: {
          fill: 0xffd700,
          fontSize: 24,
          fontFamily: 'Arial',
          fontWeight: 'bold'
        }
      });
      prizeText.anchor.set(0.5);
      prizeText.x = 0;
      prizeText.y = prizeY;
      this.contentContainer.addChild(prizeText);

      // Анимация падающих монет
      this.createCoinAnimation();
    } else {
      const loseText = new Text({
        text: '😔 Вы выбыли из турнира',
        style: {
          fill: 0xffffff,
          fontSize: 20,
          fontFamily: 'Arial'
        }
      });
      loseText.anchor.set(0.5);
      loseText.x = 0;
      loseText.y = prizeY;
      this.contentContainer.addChild(loseText);
    }
  }

  private createCoinAnimation(): void {
    // Простая анимация падающих монет
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const coin = new Text({
          text: '💰',
          style: {
            fontSize: 24,
            fontFamily: 'Arial'
          }
        });
        coin.x = Math.random() * this.app.screen.width;
        coin.y = -50;
        this.container.addChild(coin);

        // Анимация падения
        const fall = setInterval(() => {
          coin.y += 3;
          if (coin.y > this.app.screen.height) {
            this.container.removeChild(coin);
            clearInterval(fall);
          }
        }, 50);
      }, i * 300);
    }
  }

  private createNavigationButtons(): void {
    const buttonsY = 350;

    const isWin = this.matchData.result.winner


    if (!isWin){
      // Кнопка "В турниры"
      const tournamentsButton = new Button('К ТУРНИРАМ', 180, 50);
      tournamentsButton.y = buttonsY;
      tournamentsButton.onPress = () => {
      this.emit('change-scene', 'TournamentsScene');
    };
    this.contentContainer.addChild(tournamentsButton);
    }
    else{
      // Кнопка "Следующий матч"
      const nextMatchButton = new Button('СЛЕДУЮЩИЙ МАТЧ', 200, 50);
      nextMatchButton.y = buttonsY;
      nextMatchButton.onPress = () => {
      // Можно вернуться к поиску матча или в меню
      this.emit('change-scene', 'MatchScene', this.matchData.tournament); //TODO переименовать в tournamentData
    };
    this.contentContainer.addChild(nextMatchButton);
    }  


  }

  resize(width: number, height: number): void {
    this.background.clear();
    this.background.rect(0, 0, width, height);
    
    if (this.matchData.result.winner) {
      this.background.fill(0x1b5e20);
    } else {
      this.background.fill(0xb71c1c);
    }

    this.title.x = this.centerX();
    
    if (this.contentContainer) {
      this.contentContainer.x = this.centerX();
    }
  }
}