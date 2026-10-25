// src/components/Avatar.ts
import { Container, Sprite, Graphics, Texture, Assets } from "pixi.js";
import { RequestsAPI } from "../core/RequestsAPI";

export class Avatar extends Container {
  private avatarSprite: Sprite; // ← переименовано с sprite
  private avatarMask: Graphics; // ← переименовано с mask
  private avatarBorder?: Graphics; // ← переименовано с border
  private currentSize: number;
  private borderColor?: number;

  constructor(
    textureAlias: string = "avatar_default",
    size: number = 32,
    borderColor?: number,
  ) {
    super();

    this.currentSize = size;

    // Спрайт
    this.avatarSprite = new Sprite();
    const texture = Assets.cache.get(textureAlias) as Texture;
    if (texture) {
      this.avatarSprite.texture = texture;
    } else {
      console.warn(`Текстура ${textureAlias} не найдена`);
    }

    this.avatarSprite.anchor.set(0.5);
    this.avatarSprite.width = size;
    this.avatarSprite.height = size;

    // Маска
    this.avatarMask = new Graphics();
    this.avatarMask.circle(0, 0, size / 2);
    this.avatarMask.fill(0xffffff);

    this.avatarSprite.mask = this.avatarMask;

    this.addChild(this.avatarSprite);
    this.addChild(this.avatarMask);

    // Обводка
    if (borderColor !== undefined) {
      this.borderColor = borderColor;
      this.avatarBorder = new Graphics();
      this.avatarBorder.circle(0, 0, size / 2);
      this.avatarBorder.stroke({ width: 2, color: borderColor });
      this.addChild(this.avatarBorder);
    }
  }

  // Обновить текстуру
  updateTexture(texture: Texture): void {
    this.avatarSprite.texture = texture;
  }

  // Обновить из алиаса
  updateFromAlias(alias: string): void {
    const texture = Assets.cache.get(alias) as Texture;
    if (texture) {
      this.avatarSprite.texture = texture;
    }
  }

  // Загрузить из URL
  async loadFromUrl(url: string): Promise<void> {
    try {
      const opponent_photo = await RequestsAPI.GetImageBase64(url);
      console.log("📝 loadFromUrl: ", opponent_photo);
      const texture = await Assets.load(opponent_photo);
      this.avatarSprite.texture = texture;
    } catch (error) {
      console.error("Ошибка загрузки аватара:", error);
    }
  }

  // Загрузить из Base64
  async loadFromBase64(base64: string): Promise<void> {
    console.log("📥 loadFromBase64 вызван с:", base64);
    const texture = await Assets.load(base64);
    //const texture = Texture.from(base64);
    //Assets.cache.get(textureAlias) as Texture;
    this.avatarSprite.texture = texture;
  }

  // Обновить цвет обводки
  setBorderColor(color: number): void {
    this.borderColor = color;
    if (this.avatarBorder) {
      this.avatarBorder.clear();
      this.avatarBorder.circle(0, 0, this.currentSize / 2);
      this.avatarBorder.stroke({ width: 2, color: color });
    } else {
      this.avatarBorder = new Graphics();
      this.avatarBorder.circle(0, 0, this.currentSize / 2);
      this.avatarBorder.stroke({ width: 2, color: color });
      this.addChild(this.avatarBorder);
    }
  }

  // Удалить обводку
  removeBorder(): void {
    if (this.avatarBorder) {
      this.removeChild(this.avatarBorder);
      this.avatarBorder.destroy();
      this.avatarBorder = undefined;
      this.borderColor = undefined;
    }
  }

  // Изменить размер
  setSize(size: number): void {
    this.currentSize = size;
    this.avatarSprite.width = size;
    this.avatarSprite.height = size;

    // Обновляем маску
    this.avatarMask.clear();
    this.avatarMask.circle(0, 0, size / 2);
    this.avatarMask.fill(0xffffff);

    // Обновляем обводку если есть
    if (this.avatarBorder) {
      const color = this.borderColor;
      this.avatarBorder.clear();
      this.avatarBorder.circle(0, 0, size / 2);
      this.avatarBorder.stroke({ width: 2, color: color });
    }
  }
}
