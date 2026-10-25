import { Application } from "pixi.js";
import { BootScene } from "./scenes/BootScene";
import { MenuScene } from "./scenes/MenuScene";
import { TournamentsScene } from "./scenes/TournamentsScene";
import { TournamentInfoScene } from "./scenes/TournamentInfoScene";
import { FindOpponentScene } from "./scenes/FindOpponentScene";
import { MatchScene } from "./scenes/MatchScene";
import { ResultsScene } from "./scenes/ResultsScene";
import "./styles/styles.css";

class Game {
  private app: Application;
  private currentScene: any = null;
  private scenes: Map<string, any> = new Map();

  constructor() {
    this.init();
  }

  async init(): Promise<void> {
    try {
      // Инициализация PixiJS
      this.app = new Application();
      await this.app.init({
        width: 800,
        height: 600,
        backgroundColor: 0x004bbc,
        resizeTo: window,
      });

      // Добавляем canvas
      const pixiContainer = document.getElementById("pixi-container");
      if (!pixiContainer) throw new Error("Контейнер не найден");

      pixiContainer.innerHTML = "";
      pixiContainer.appendChild(this.app.canvas as HTMLCanvasElement);

      // Регистрируем сцены
      this.scenes.set("BootScene", BootScene);
      this.scenes.set("MenuScene", MenuScene);
      this.scenes.set("TournamentsScene", TournamentsScene);
      this.scenes.set("TournamentInfoScene", TournamentInfoScene);
      this.scenes.set("FindOpponentScene", FindOpponentScene);
      this.scenes.set("MatchScene", MatchScene);
      this.scenes.set("ResultsScene", ResultsScene);

      // Запускаем начальную сцену
      //await this.changeScene('MenuScene');

      // Запускаем сцену загрузки
      await this.changeScene("BootScene");

      console.log("✅ Игра запущена!");
    } catch (error) {
      console.error("❌ Ошибка:", error);
    }
  }

  private async changeScene(sceneName: string, data?: any): Promise<void> {
    // Удаляем текущую сцену
    if (this.currentScene) {
      this.currentScene.destroy();
      this.app.stage.removeChild(this.currentScene.container);
    }

    // Создаем новую сцену
    const SceneClass = this.scenes.get(sceneName);
    if (!SceneClass) {
      throw new Error(`Сцена ${sceneName} не найдена`);
    }

    this.currentScene = new SceneClass(this.app);

    // Подписываемся на событие смены сцены
    this.currentScene.on(
      "change-scene",
      (newScene: string, sceneData?: any) => {
        this.changeScene(newScene, sceneData);
      },
    );

    this.app.stage.addChild(this.currentScene.container);

    // Передаем данные в сцену, если они есть
    await this.currentScene.init(data);

    // Настраиваем обработчик ресайза
    if (this.currentScene.resize) {
      window.addEventListener("resize", () => {
        this.currentScene.resize(this.app.screen.width, this.app.screen.height);
      });
    }

    console.log(
      `🎮 Переключено на сцену: ${sceneName}`,
      data ? "с данными" : "",
    );
  }
}

// Запуск игры
new Game();
