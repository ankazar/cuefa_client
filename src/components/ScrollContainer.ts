// src/components/ScrollContainer.ts
import { Container, Graphics } from 'pixi.js';

export class ScrollContainer extends Container {
    private content: Container;
    private maskHeight: number;
    private maskWidth: number;
    private scrollbarThumb: Graphics;
    private isDraggingThumb: boolean = false;
    private isDraggingArea: boolean = false;
    private startMouseY: number = 0;
    private startThumbY: number = 0;
    private startContentY: number = 0;
    
    constructor(width: number, height: number) {
        super();
        
        this.maskWidth = width;
        this.maskHeight = height;
        
        // Включаем интерактивность для всего контейнера
        this.eventMode = 'static';
        this.cursor = 'grab';
        
        // Маска
        const mask = new Graphics();
        mask.rect(-width / 2, 0, width, height);
        mask.fill(0xffffff);
        this.addChild(mask);
        this.mask = mask;
        
        // Фон области скролла (для захвата событий)
        const hitArea = new Graphics();
        hitArea.rect(-width / 2, 0, width, height);
        hitArea.fill(0x000000, 0.01); // Почти прозрачный
        hitArea.eventMode = 'static';
        this.addChild(hitArea);
        
        // Рамка
        const border = new Graphics();
        border.rect(-width / 2, 0, width, height);
        border.stroke({ width: 2, color: 0x555555 });
        this.addChild(border);
        
        // Контент
        this.content = new Container();
        this.content.x = -width / 2 + 10;
        this.content.y = 5;
        this.addChild(this.content);
        
        // Скролл-бар
        this.createScrollbar(width, height);
        
        // === ПЕРЕТАСКИВАНИЕ ПО ВСЕЙ ОБЛАСТИ ===
        hitArea.on('pointerdown', (e) => {
            this.isDraggingArea = true;
            this.startMouseY = e.globalY;
            this.startContentY = this.content.y;
            this.cursor = 'grabbing';
            e.stopPropagation();
        });
        
        // Глобальные слушатели
        window.addEventListener('pointermove', (e) => {
            if (this.isDraggingArea) {
                const deltaY = e.clientY - this.startMouseY;
                this.scrollContentTo(this.startContentY + deltaY);
                e.preventDefault();
            }
        });
        
        window.addEventListener('pointerup', () => {
            if (this.isDraggingArea) {
                this.isDraggingArea = false;
                this.cursor = 'grab';
            }
        });
        
        // Колесико мыши
        this.on('wheel', (e) => {
            this.scrollBy(e.deltaY * 0.5);
            e.stopPropagation();
        });
    }
    
    private createScrollbar(width: number, height: number): void {
        const lineWidth = 2;
        const lineX = width / 2 - 14;
        
        // === БЕЛАЯ ЛИНИЯ ВМЕСТО СЕРОЙ ПОЛОСКИ ===
        const line = new Graphics();
        line.moveTo(lineX, 0);
        line.lineTo(lineX, height);
        line.stroke({ width: lineWidth, color: 0xffffff, alpha: 0.3 });
        this.addChild(line);
        
        // Ползунок (оставляем цветным для контраста)
        this.scrollbarThumb = new Graphics();
        this.scrollbarThumb.roundRect(width / 2 - 18, 0, 10, 50, 5);
        this.scrollbarThumb.fill(0x3498db);
        this.scrollbarThumb.eventMode = 'static';
        this.scrollbarThumb.cursor = 'grab';
        this.addChild(this.scrollbarThumb);
        
        // === ПЕРЕТАСКИВАНИЕ ПОЛЗУНКА ===
        this.scrollbarThumb.on('pointerdown', (e) => {
            this.isDraggingThumb = true;
            this.startMouseY = e.globalY;
            this.startThumbY = this.scrollbarThumb.y;
            this.scrollbarThumb.cursor = 'grabbing';
            e.stopPropagation();
        });
        
        window.addEventListener('pointermove', (e) => {
            if (this.isDraggingThumb) {
                const deltaY = e.clientY - this.startMouseY;
                const maxThumbY = this.maskHeight - this.scrollbarThumb.height;
                
                let newThumbY = this.startThumbY + deltaY;
                newThumbY = Math.max(0, Math.min(maxThumbY, newThumbY));
                
                this.scrollbarThumb.y = newThumbY;
                
                const scrollPercent = newThumbY / maxThumbY;
                const maxContentScroll = this.maskHeight - this.content.height - 10;
                this.content.y = 5 + scrollPercent * maxContentScroll;
                
                e.preventDefault();
            }
        });
        
        window.addEventListener('pointerup', () => {
            if (this.isDraggingThumb) {
                this.isDraggingThumb = false;
                this.scrollbarThumb.cursor = 'grab';
            }
        });
    }
    
    private scrollContentTo(y: number): void {
        const maxScroll = 5;
        const minScroll = Math.min(5, this.maskHeight - this.content.height + 5);
        
        const newY = Math.max(minScroll, Math.min(maxScroll, y));
        this.content.y = newY;
        this.updateThumbFromContent();
    }
    
    private scrollBy(delta: number): void {
        this.scrollContentTo(this.content.y - delta);
    }
    
    private updateThumbFromContent(): void {
        if (this.content.height <= this.maskHeight) return;
        
        const scrollRange = this.content.height - this.maskHeight;
        const scrollPercent = (5 - this.content.y) / scrollRange;
        const maxThumbY = this.maskHeight - this.scrollbarThumb.height;
        this.scrollbarThumb.y = scrollPercent * maxThumbY;
    }
    
    getContent(): Container {
        return this.content;
    }
    
    updateScrollbar(): void {
        const contentHeight = this.content.height + 10;
        
        if (contentHeight <= this.maskHeight) {
            this.scrollbarThumb.visible = false;
            return;
        }
        
        this.scrollbarThumb.visible = true;
        
        const visibleRatio = this.maskHeight / contentHeight;
        const thumbHeight = Math.max(30, this.maskHeight * visibleRatio);
        
        this.scrollbarThumb.clear();
        this.scrollbarThumb.roundRect(
            this.maskWidth / 2 - 18, 
            0, 
            10, 
            thumbHeight, 
            5
        );
        this.scrollbarThumb.fill(0x3498db);
        
        this.content.y = 5;
        this.scrollbarThumb.y = 0;
    }
}