import { BaseScene } from "./BaseScene";
import { Graphics, Text, Assets, Sprite } from "pixi.js";
import { UserService } from "../core/UserService";
import { RequestsAPI } from "../core/RequestsAPI";
import bridge from '@vkontakte/vk-bridge';

export class BootScene extends BaseScene {
  async init(): Promise<void> {

    bridge.send('VKWebAppInit')
    .then((data) => {
      if (data.result) {
        console.log('✅ VKWebAppInit сработал корректно');
        // Здесь можно безопасно вызывать другие методы, например VKWebAppGetUserInfo
      } else {
        console.warn('⚠️ VKWebAppInit вернул result: false');
      }
    })
    .catch((error) => {
      console.error('❌ Ошибка инициализации VK Bridge:', error);
    });

    if (bridge.isWebView()) {
      console.log('✅ Запущено внутри клиента VK');
      bridge.send('VKWebAppGetUserInfo')
      .then((user) => {
      console.log('Имя:', user.first_name);
      console.log('Фамилия:', user.last_name);
      UserService.setUserData({ userName: `${user.first_name} ${user.last_name}`});
    })
      // Можно безопасно вызывать VKWebAppGetUserInfo и другие методы
    } else {
      console.log('🌐 Запущено в обычном браузере');
      UserService.setUserData({ userName: "Андрей Молотов+" });
      // Среда VK недоступна, нужна логика fallback
    }

    // Subscribes to event, sended by client
    //bridge.subscribe((e) => console.log(e));

    const userId = 1; //TODO получить от апи

    // Сохраняем в сервис
    UserService.setUserId(userId);
    

    // Симулируем загрузку или загружаем критические ресурсы
    await this.loadCriticalAssets();
  }

  private async loadCriticalAssets(): Promise<void> {
    this.showLoadingScreen();
    // Здесь можно загрузить самые важные ресурсы
    try {
      const user_photo = await RequestsAPI.GetImageBase64(
        "https://sun112-1.userapi.com/s/v1/ig2/Rzdy-gHRsLWhVFH68Sn_cmRFvOGZLUNZerqyOZzkfb7l835xNsQK1n3fQe_8RtxDDzznRtMxTTadaBnFgx5bzKNh.jpg?quality=95&crop=1066,536,805,805&as=32x32,48x48,72x72,108x108,160x160,240x240,360x360,480x480,540x540,640x640,720x720&ava=1&cs=50x50",
      );

      // Загружаем все необходимые ресурсы
      await Assets.load([
        { alias: "rock", src: "assets/images/rock.png" },
        { alias: "scissors", src: "assets/images/scissors.png" },
        { alias: "paper", src: "assets/images/papper.png" },
        { alias: "rays", src: "assets/images/rays.png" },
        { alias: "user_photo", src: user_photo },
        { alias: "search_opponent", src: "assets/images/search_opponent.png" },
        { alias: "rock_btn", src: "assets/images/rock_btn.png" },
        { alias: "scissors_btn", src: "assets/images/scissors_btn.png" },
        { alias: "paper_btn", src: "assets/images/paper_btn.png" },
        { alias: "cup", src: "assets/images/cup.png" },

        // другие ресурсы...
      ]);

      this.initVK();

      // Переходим на следующую сцену
      this.emit("change-scene", "MenuScene");
    } catch (error) {
      console.error("❌ Ошибка загрузки ресурсов:", error);
      this.showErrorScreen();
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  private async showLoadingScreen(): Promise<void> {
    const texture = await Assets.load("assets/images/load2.png");

    const background = new Graphics();
    background.rect(0, 0, this.app.screen.width, this.app.screen.height);
    background.fill(0x004bbc);
    this.container.addChild(background);

    if (texture) {
      const loadingImage = new Sprite(texture);

      const scaleX = this.app.screen.width / texture.width;
      const scaleY = this.app.screen.height / texture.height;
      const scale = Math.min(scaleX, scaleY); // Берём меньшее

      loadingImage.scale.set(scale);

      // Центрируем
      loadingImage.x = (this.app.screen.width - texture.width * scale) / 2;
      loadingImage.y = (this.app.screen.height - texture.height * scale) / 2;

      //loadingImage.anchor.set(0.5);
      //loadingImage.x = this.centerX();
      //loadingImage.y = this.centerY() - 50;
      //loadingImage.width = 100;
      //loadingImage.height = 100;
      this.container.addChild(loadingImage);
    }

    const loadingText = new Text({
      text: "Загрузка...",
      style: { fill: 0xffffff, fontSize: 24 },
    });
    loadingText.anchor.set(0.5);
    loadingText.x = this.centerX();
    loadingText.y = this.centerY();
    this.container.addChild(loadingText);
  }

  private showErrorScreen(): void {
    const errorText = new Text({
      text: "Ошибка загрузки.\nПроверьте подключение к интернету.",
      style: { fill: 0xff0000, fontSize: 20, align: "center" },
    });
    errorText.anchor.set(0.5);
    errorText.x = this.centerX();
    errorText.y = this.centerY();
    this.container.addChild(errorText);
  }

  private async initVK() {
  try {
    const data = await bridge.send('VKWebAppInit');
    if (data.result) {
      console.log('✅ VKWebAppInit сработал корректно');
    } else {
      console.warn('⚠️ VKWebAppInit вернул result: false');
    }
  } catch (error) {
    console.error('❌ Ошибка инициализации VK Bridge:', error);
    return;
  }

  // Теперь проверяем среду ПОСЛЕ инициализации
  if (bridge.isWebView()) {
    console.log('✅ Запущено внутри клиента VK');
    try {
      const user = await bridge.send('VKWebAppGetUserInfo');
      console.log('Имя:', user.first_name);
      console.log('Фамилия:', user.last_name);
      UserService.setUserData({
        userName: `${user.first_name} ${user.last_name}`
      });
    } catch (e) {
      console.error('❌ Не удалось получить данные пользователя:', e);
      UserService.setUserData({ userName: 'Гость' });
    }
  } else {
    console.log('🌐 Запущено в обычном браузере');
    UserService.setUserData({ userName: 'Андрей Молотов+' });
  }
}
}
