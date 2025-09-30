/**
 * Модуль маркера Чебурашки - ДОЖДЬ АПЕЛЬСИНОВ
 * 8 апельсинов падают с высоты и отскакивают, образуя круг
 */

class CheburashkaMarker {
    constructor(targetIndex = 0) {
        this.targetIndex = targetIndex;
        this.entity = null;
        this.oranges = [];
        this.isActive = false;
        this.animationStarted = false;
        this.objectsReady = false;
    }

    /**
     * Инициализация маркера
     */
    init() {
        console.log('Инициализация дождя апельсинов...');
        
        if (document.readyState !== 'complete') {
            window.addEventListener('load', () => this.init());
            return;
        }

        this.createMarkerEntity();
        this.setupEventListeners();
        
        console.log('Дождь апельсинов готов!');
    }

    /**
     * Создание entity маркера
     */
    createMarkerEntity() {
        this.entity = document.querySelector(`[mindar-image-target][data-target-index="${this.targetIndex}"]`);
        
        if (!this.entity) {
            this.entity = document.createElement('a-entity');
            this.entity.setAttribute('mindar-image-target', `targetIndex: ${this.targetIndex}`);
            this.entity.setAttribute('data-target-index', this.targetIndex);
            
            const scene = document.querySelector('#ar-scene');
            scene.appendChild(this.entity);
            
            this.entity.addEventListener('loaded', () => {
                console.log('Entity загружен, создаем 8 апельсинов...');
                setTimeout(() => this.createOrangesWhenReady(), 100);
            });
        }
    }

    /**
     * Создание апельсинов когда entity готов
     */
    createOrangesWhenReady() {
        if (!this.entity.object3D) {
            setTimeout(() => this.createOrangesWhenReady(), 100);
            return;
        }

        this.createOrangeRain();
        this.objectsReady = true;
        console.log('8 апельсинов созданы и готовы к дождю!');
    }

    /**
     * Создание 8 апельсинов в хаотичном круговом порядке
     */
    createOrangeRain() {
        // 8 апельсинов в кругу - стартовые позиции ВЫСОКО (чтобы не видно)
        const orangeCount = 8;
        const startHeight = 2.5; // Очень высоко, за пределами видимости
        const circleRadius = 0.5; // УВЕЛИЧЕННЫЙ радиус круга приземления

        for (let i = 0; i < orangeCount; i++) {
            const angle = (i / orangeCount) * 2 * Math.PI;
            
            // Финальная позиция - круг с ХАОТИЧНОСТЬЮ
            const baseX = Math.cos(angle) * circleRadius;
            const baseZ = Math.sin(angle) * circleRadius;
            
            // Добавляем случайное смещение для хаотичности
            const randomOffsetX = (Math.random() - 0.5) * 0.3; // ±0.15
            const randomOffsetZ = (Math.random() - 0.5) * 0.3; // ±0.15
            const randomOffsetY = (Math.random() - 0.5) * 0.1; // ±0.05 высота пола
            
            const landX = baseX + randomOffsetX;
            const landZ = baseZ + randomOffsetZ;
            const landY = -0.4 + randomOffsetY; // Пол с небольшими вариациями

            // ВАЖНО: Стартовая позиция УЖЕ в правильных X,Z координатах!
            const startX = landX; // Те же X,Z что и финальные
            const startZ = landZ; // Те же X,Z что и финальные

            const orange = this.createSingleOrange(
                i,
                `${startX} ${startHeight} ${startZ}`,
                `${landX} ${landY} ${landZ}`
            );
            
            this.entity.appendChild(orange);
            this.oranges.push(orange);
        }
    }

    /**
     * Создание одного апельсина
     */
    createSingleOrange(index, startPos, landPos) {
        const orange = document.createElement('a-sphere');
        
        // Атрибуты апельсина
        orange.setAttribute('radius', '0.06'); // Чуть меньше, чтобы не мешали друг другу
        orange.setAttribute('color', '#ff6600');
        orange.setAttribute('position', startPos);
        orange.setAttribute('visible', 'false');
        orange.setAttribute('material', {
            roughness: 0.7,
            metalness: 0.1,
            emissive: '#ff3300',
            emissiveIntensity: 0.05
        });
        
        orange.id = `orange-rain-${this.targetIndex}-${index}`;
        
        // Сохраняем позицию приземления
        orange.setAttribute('data-land-position', landPos);
        orange.setAttribute('data-start-position', startPos);
        
        return orange;
    }

    /**
     * Настройка обработчиков событий
     */
    setupEventListeners() {
        this.entity.addEventListener('targetFound', () => {
            console.log('Маркер найден! Запускаем дождь апельсинов!');
            this.onTargetFound();
        });

        this.entity.addEventListener('targetLost', () => {
            console.log('Маркер потерян! Останавливаем дождь.');
            this.onTargetLost();
        });
    }

    /**
     * Обработчик обнаружения маркера - ДОЖДЬ НАЧИНАЕТСЯ!
     */
    onTargetFound() {
        this.isActive = true;
        
        if (!this.objectsReady) {
            setTimeout(() => {
                if (this.isActive) this.onTargetFound();
            }, 200);
            return;
        }

        console.log('Начинаем дождь из апельсинов!');
        
        // Показываем все апельсины сразу
        this.showAllOranges();
        
        // Через 0.5 сек начинаем дождь (успеют появиться)
        setTimeout(() => {
            if (this.isActive) {
                this.startOrangeRain();
            }
        }, 500);
    }

    /**
     * Показываем все апельсины сразу
     */
    showAllOranges() {
        this.oranges.forEach((orange, index) => {
            if (!orange || !orange.parentNode) return;
            
            // Небольшая задержка для каждого апельсина (эффект появления)
            setTimeout(() => {
                if (!this.isActive) return;
                orange.setAttribute('visible', 'true');
            }, index * 50); // Быстрое появление
        });
    }

    /**
     * Запуск дождя апельсинов с гравитацией и отскоками
     */
    startOrangeRain() {
        if (!this.isActive || this.animationStarted) return;
        
        this.animationStarted = true;
        console.log('Дождь апельсинов начался!');

        // Запускаем падение всех апельсинов с небольшими задержками
        this.oranges.forEach((orange, index) => {
            if (!orange || !orange.parentNode) return;
            
            // Задержка между падениями - чтобы не все сразу
            setTimeout(() => {
                if (!this.isActive) return;
                this.dropOrangeWithGravity(orange, index);
            }, index * 100); // Быстрые интервалы
        });
    }

    /**
     * Падение одного апельсина с гравитацией и отскоками
     */
    dropOrangeWithGravity(orange, index) {
        if (!orange || !orange.parentNode || !this.isActive) return;

        const landPosition = orange.getAttribute('data-land-position');
        const [landX, landY, landZ] = landPosition.split(' ').map(Number);
        
        const currentPos = orange.getAttribute('position');
        const startY = parseFloat(currentPos.y);
        
        console.log(`Апельсин ${index + 1} падает с Y=${startY} до Y=${landY} в позиции X=${landX}, Z=${landZ}`);
        
        // ФАЗА 1: Быстрое падение ТОЛЬКО по Y (X,Z остаются неизменными)
        orange.setAttribute('animation__fall', {
            property: 'position.y',  // ТОЛЬКО Y координата!
            from: startY,
            to: landY,
            dur: 1500, // Быстрое падение
            easing: 'easeInQuad' // Ускоряющееся падение как гравитация
        });
        
        // Вращение во время падения
        orange.setAttribute('animation__spin', {
            property: 'rotation',
            to: '720 360 180', // Много вращений
            dur: 1500,
            easing: 'linear'
        });
        
        // ФАЗА 2: Отскоки после приземления (1.5 сек спустя)
        setTimeout(() => {
            if (!this.isActive) return;
            this.bounceOrange(orange, landX, landY, landZ);
        }, 1500);
    }

    /**
     * Отскоки апельсина после приземления - БЕЗ ИЗМЕНЕНИЯ X,Z координат
     */
    bounceOrange(orange, x, y, z) {
        if (!orange || !orange.parentNode || !this.isActive) return;
        
        console.log(`Отскоки апельсина на позиции: ${x}, ${y}, ${z}`);
        
        // ВАЖНО: Устанавливаем финальную позицию ПЕРЕД отскоками
        orange.setAttribute('position', `${x} ${y} ${z}`);
        
        // Первый отскок - только по Y, X и Z не трогаем!
        setTimeout(() => {
            if (!this.isActive) return;
            orange.setAttribute('animation__bounce1', {
                property: 'position.y',
                from: y,
                to: y + 0.15, // Высокий отскок
                dur: 400,
                easing: 'easeOutQuad',
                dir: 'alternate',
                loop: 1
            });
        }, 50);
        
        // Второй отскок - средний (через 0.45 сек)
        setTimeout(() => {
            if (!this.isActive) return;
            orange.setAttribute('animation__bounce2', {
                property: 'position.y',
                from: y,
                to: y + 0.08,
                dur: 300,
                easing: 'easeOutQuad',
                dir: 'alternate',
                loop: 1
            });
        }, 450);
        
        // Третий отскок - маленький (через 0.75 сек)
        setTimeout(() => {
            if (!this.isActive) return;
            orange.setAttribute('animation__bounce3', {
                property: 'position.y',
                from: y,
                to: y + 0.03,
                dur: 200,
                easing: 'easeOutQuad',
                dir: 'alternate',
                loop: 1
            });
        }, 750);
        
        // ФИНАЛ: Устанавливаем окончательную позицию после всех отскоков
        setTimeout(() => {
            if (!this.isActive) return;
            orange.setAttribute('position', `${x} ${y} ${z}`);
            console.log(`Апельсин финально остался на: ${x}, ${y}, ${z}`);
        }, 1200);
    }

    /**
     * Обработчик потери маркера
     */
    onTargetLost() {
        this.isActive = false;
        this.resetOrangeRain();
    }

    /**
     * Сброс дождя апельсинов
     */
    resetOrangeRain() {
        this.animationStarted = false;
        console.log('Сброс дождя апельсинов...');
        
        this.oranges.forEach((orange, index) => {
            if (!orange) return;
            
            // Останавливаем все анимации
            orange.removeAttribute('animation__fall');
            orange.removeAttribute('animation__spin');
            orange.removeAttribute('animation__bounce1');
            orange.removeAttribute('animation__bounce2');
            orange.removeAttribute('animation__bounce3');
            
            // Скрываем
            orange.setAttribute('visible', 'false');
            
            // Возвращаем в стартовую позицию
            const startPos = orange.getAttribute('data-start-position');
            orange.setAttribute('position', startPos);
            orange.setAttribute('rotation', '0 0 0');
        });
    }

    /**
     * Получение статуса
     */
    getStatus() {
        return {
            targetIndex: this.targetIndex,
            isActive: this.isActive,
            animationStarted: this.animationStarted,
            objectsReady: this.objectsReady,
            orangeCount: this.oranges.length,
            type: 'orange_rain'
        };
    }

    /**
     * Очистка ресурсов
     */
    destroy() {
        if (this.entity && this.entity.parentNode) {
            this.entity.parentNode.removeChild(this.entity);
        }
        this.oranges = [];
        this.entity = null;
        this.objectsReady = false;
        console.log('Дождь апельсинов удален');
    }
}

// Экспорт
window.CheburashkaMarker = CheburashkaMarker;