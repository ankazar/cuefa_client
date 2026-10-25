// src/components/ScrollContainer.ts
import { Container, Graphics } from "pixi.js";

export class ScrollContainer extends Container {
  private content: Container;
  private maskHeight: number;
  private maskWidth: number;
  private scrollbarThumb: Graphics;
  private scrollbarLine: Graphics;
  private border: Graphics;
  private maskGraphic: Graphics; // ← Переименовано
  private dragArea: Graphics; // ← Переименовано (было hitArea)
  private isDraggingThumb: boolean = false;
  private isDraggingArea: boolean = false;
  private startMouseY: number = 0;
  private startThumbY: number = 0;
  private startContentY: number = 0;
  private needsScroll: boolean = false;

  constructor(width: number, height: number) {
    super();

    this.maskWidth = width;
    this.maskHeight = height;

    this.eventMode = "static";

    // Маска (изначально скрыта)
    this.maskGraphic = new Graphics();
    this.maskGraphic.visible = false;
    this.addChild(this.maskGraphic);

    const background = new Graphics();
    background.rect(-width / 2, 0, width, height);
    background.fill(0x000000, 0.5); // 50% непрозрачности чёрного
    this.addChild(background);

    // Область для перетаскивания
    this.dragArea = new Graphics();
    this.dragArea.rect(-width / 2, 0, width, height);
    this.dragArea.fill(0x000000, 0);
    this.dragArea.eventMode = "static";
    this.addChild(this.dragArea);

    // Рамка (изначально скрыта)
    this.border = new Graphics();
    this.border.visible = false;
    this.addChild(this.border);

    // Контент
    this.content = new Container();
    this.content.x = -width / 2 + 10;
    this.content.y = 10;
    this.addChild(this.content);

    // Скролл-бар (изначально скрыт)
    this.scrollbarLine = new Graphics();
    this.scrollbarLine.visible = false;
    this.addChild(this.scrollbarLine);

    this.scrollbarThumb = new Graphics();
    this.scrollbarThumb.visible = false;
    this.addChild(this.scrollbarThumb);
  }

  private enableScroll(): void {
    this.needsScroll = true;
    this.cursor = "grab";

    // Показываем маску
    this.maskGraphic.clear();
    this.maskGraphic.rect(
      -this.maskWidth / 2,
      0,
      this.maskWidth,
      this.maskHeight,
    );
    this.maskGraphic.fill(0xffffff);
    this.maskGraphic.visible = true;
    this.mask = this.maskGraphic;

    // Показываем рамку
    this.border.clear();
    this.border.rect(-this.maskWidth / 2, 0, this.maskWidth, this.maskHeight);
    this.border.stroke({ width: 2, color: 0x555555 });
    this.border.visible = true;

    // Показываем линию скролла
    this.scrollbarLine.clear();
    this.scrollbarLine.moveTo(this.maskWidth / 2 - 14, 0);
    this.scrollbarLine.lineTo(this.maskWidth / 2 - 14, this.maskHeight);
    this.scrollbarLine.stroke({ width: 2, color: 0xffffff, alpha: 0.3 });
    this.scrollbarLine.visible = true;

    // Создаём ползунок
    this.scrollbarThumb.clear();
    this.scrollbarThumb.roundRect(this.maskWidth / 2 - 18, 0, 10, 50, 5);
    this.scrollbarThumb.fill(0x3498db);
    this.scrollbarThumb.eventMode = "static";
    this.scrollbarThumb.cursor = "grab";
    this.scrollbarThumb.visible = true;

    // Перетаскивание ползунка
    this.scrollbarThumb.on("pointerdown", (e) => {
      this.isDraggingThumb = true;
      this.startMouseY = e.globalY;
      this.startThumbY = this.scrollbarThumb.y;
      this.scrollbarThumb.cursor = "grabbing";
      e.stopPropagation();
    });

    // Перетаскивание области - используем dragArea
    this.dragArea.on("pointerdown", (e) => {
      this.isDraggingArea = true;
      this.startMouseY = e.globalY;
      this.startContentY = this.content.y;
      this.cursor = "grabbing";
      e.stopPropagation();
    });

    // Глобальные слушатели
    window.addEventListener("pointermove", (e) => {
      if (this.isDraggingArea) {
        const deltaY = e.clientY - this.startMouseY;
        const maxScroll = 10;
        const minScroll = Math.min(
          10,
          this.maskHeight - this.content.height - 10,
        );
        const newY = Math.max(
          minScroll,
          Math.min(maxScroll, this.startContentY + deltaY),
        );
        this.content.y = newY;
        this.updateThumbFromContent();
        e.preventDefault();
      }

      if (this.isDraggingThumb) {
        const deltaY = e.clientY - this.startMouseY;
        const maxThumbY = this.maskHeight - this.scrollbarThumb.height;
        const newThumbY = Math.max(
          0,
          Math.min(maxThumbY, this.startThumbY + deltaY),
        );
        this.scrollbarThumb.y = newThumbY;

        const scrollPercent = newThumbY / maxThumbY;
        const maxContentScroll = this.maskHeight - this.content.height - 10;
        this.content.y = 10 + scrollPercent * maxContentScroll;

        e.preventDefault();
      }
    });

    window.addEventListener("pointerup", () => {
      this.isDraggingArea = false;
      this.isDraggingThumb = false;
      this.cursor = "grab";
      this.scrollbarThumb.cursor = "grab";
    });

    // Колесико мыши
    this.on("wheel", (e) => {
      const maxScroll = 10;
      const minScroll = Math.min(
        10,
        this.maskHeight - this.content.height - 10,
      );
      const newY = Math.max(
        minScroll,
        Math.min(maxScroll, this.content.y - e.deltaY * 0.5),
      );
      this.content.y = newY;
      this.updateThumbFromContent();
      e.stopPropagation();
    });
  }

  private updateThumbFromContent(): void {
    if (!this.needsScroll) return;

    const totalScrollHeight = this.content.height + 30 - this.maskHeight;
    if (totalScrollHeight <= 0) return;

    const scrollPercent = (10 - this.content.y) / totalScrollHeight;
    const maxThumbY = this.maskHeight - this.scrollbarThumb.height;
    this.scrollbarThumb.y = Math.max(
      0,
      Math.min(maxThumbY, scrollPercent * maxThumbY),
    );
  }

  getContent(): Container {
    return this.content;
  }

  updateScrollbar(): void {
    this.content.getLocalBounds();

    const contentHeight = this.content.height + 30;

    if (contentHeight <= this.maskHeight) {
      this.needsScroll = false;
      this.maskGraphic.visible = false;
      this.border.visible = false;
      this.scrollbarLine.visible = false;
      this.scrollbarThumb.visible = false;
      this.cursor = "default";
      return;
    }

    if (!this.needsScroll) {
      this.enableScroll();
    }

    const visibleRatio = this.maskHeight / contentHeight;
    const thumbHeight = Math.max(30, this.maskHeight * visibleRatio);

    this.scrollbarThumb.clear();
    this.scrollbarThumb.roundRect(
      this.maskWidth / 2 - 18,
      0,
      10,
      thumbHeight,
      5,
    );
    this.scrollbarThumb.fill(0x3498db);

    this.content.y = 10;
    this.scrollbarThumb.y = 0;
  }
}
