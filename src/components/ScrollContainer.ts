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
        
        this.eventMode = 'static';
        this.cursor = 'grab';
        
        // Маска
        const mask = new Graphics();
        mask.rect(-width / 2, 0, width, height);
        mask.fill(0xffffff);
        this.addChild(mask);
        this.mask = mask;
        
        // Фон области скролла
        const hitArea = new Graphics();
        hitArea.rect(-width / 2, 0, width, height);
        hitArea.fill(0x000000, 0.01);
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
        this.content.y = 10; // Отступ сверху
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
        
        window.addEventListener('pointermove', (e) => {
            if (this.isDraggingArea) {
                const deltaY = e.clientY - this.startMouseY;
                const maxScroll = 10;
                const minScroll = Math.min(10, this.maskHeight - this.content.height - 10); // +30px отступ снизу
                const newY = Math.max(minScroll, Math.min(maxScroll, this.startContentY + deltaY));
                this.content.y = newY;
                this.updateThumbFromContent();
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
            const maxScroll = 10;
            const minScroll = Math.min(10, this.maskHeight - this.content.height - 10);
            const newY = Math.max(minScroll, Math.min(maxScroll, this.content.y - e.deltaY * 0.5));
            this.content.y = newY;
            this.updateThumbFromContent();
            e.stopPropagation();
        });
    }
    
    private createScrollbar(width: number, height: number): void {
        const lineWidth = 2;
        const lineX = width / 2 - 14;
        
        // Белая линия
        const line = new Graphics();
        line.moveTo(lineX, 0);
        line.lineTo(lineX, height);
        line.stroke({ width: lineWidth, color: 0xffffff, alpha: 0.3 });
        this.addChild(line);
        
        // Ползунок
        this.scrollbarThumb = new Graphics();
        this.scrollbarThumb.roundRect(width / 2 - 18, 0, 10, 50, 5);
        this.scrollbarThumb.fill(0x3498db);
        this.scrollbarThumb.eventMode = 'static';
        this.scrollbarThumb.cursor = 'grab';
        this.addChild(this.scrollbarThumb);
        
        // Перетаскивание ползунка
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
                const newThumbY = Math.max(0, Math.min(maxThumbY, this.startThumbY + deltaY));
                this.scrollbarThumb.y = newThumbY;
                
                const scrollPercent = newThumbY / maxThumbY;
                const maxContentScroll = this.maskHeight - this.content.height - 10;
                this.content.y = 10 + scrollPercent * maxContentScroll;
                
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
    
    private updateThumbFromContent(): void {
        if (this.content.height <= this.maskHeight) {
            this.scrollbarThumb.visible = false;
            return;
        }
        
        this.scrollbarThumb.visible = true;
        
        const totalScrollHeight = this.content.height + 10 - this.maskHeight; // +30 отступ
        const scrollPercent = (10 - this.content.y) / totalScrollHeight;
        const maxThumbY = this.maskHeight - this.scrollbarThumb.height;
        this.scrollbarThumb.y = Math.max(0, Math.min(maxThumbY, scrollPercent * maxThumbY));
    }
    
    getContent(): Container {
        return this.content;
    }
    
    updateScrollbar(): void {
        // Принудительно обновляем границы контента
        this.content.getLocalBounds();
        
        const contentHeight = this.content.height + 10; // +30px отступ снизу
        
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