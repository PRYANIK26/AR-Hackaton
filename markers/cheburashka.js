/**
 * Модуль маркера - простое отображение GLB с анимацией
 */

class CheburashkaMarker {
    constructor(targetIndex = 0) {
        this.targetIndex = targetIndex;
        this.entity = null;
        this.model = null;
        this.isActive = false;
    }

    /**
     * Инициализация маркера
     */
    init() {
        console.log('Инициализация AR модели...');
        
        if (document.readyState !== 'complete') {
            window.addEventListener('load', () => this.init());
            return;
        }

        this.createMarkerEntity();
        this.setupEventListeners();
        
        console.log('AR модель готова!');
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
        }

        // Создаем GLB модель с анимацией
        this.createModel();
    }

    /**
     * Создание GLB модели
     */
    createModel() {
        this.model = document.createElement('a-gltf-model');
        
        // Путь к модели
        this.model.setAttribute('src', './assets/robot-zayac.glb');
        
        // Позиция и масштаб
        this.model.setAttribute('position', '0 0 0');
        this.model.setAttribute('scale', '1 1 1');
        this.model.setAttribute('rotation', '0 0 0');
        
        // Включаем проигрывание анимации зациклено
        this.model.setAttribute('animation-mixer', {
            clip: '*',           // Все анимации из GLB
            loop: 'repeat',      // Зацикленно
            timeScale: 1         // Нормальная скорость
        });
        
        // Изначально скрыто
        this.model.setAttribute('visible', 'false');
        
        // Добавляем в entity
        this.entity.appendChild(this.model);
        
        console.log('GLB модель robot-zayac.glb добавлена');
        
        // Обработчик успешной загрузки
        this.model.addEventListener('model-loaded', () => {
            console.log('✅ Модель robot-zayac.glb загружена успешно!');
        });
        
        // Обработчик ошибки загрузки
        this.model.addEventListener('model-error', (error) => {
            console.error('❌ Ошибка загрузки robot-zayac.glb:', error);
        });
    }

    /**
     * Настройка обработчиков событий
     */
    setupEventListeners() {
        this.entity.addEventListener('targetFound', () => {
            console.log('✅ Маркер найден! Показываем модель');
            this.onTargetFound();
        });

        this.entity.addEventListener('targetLost', () => {
            console.log('❌ Маркер потерян! Скрываем модель');
            this.onTargetLost();
        });
    }

    /**
     * Обработчик обнаружения маркера
     */
    onTargetFound() {
        this.isActive = true;
        
        if (this.model) {
            // Показываем модель
            this.model.setAttribute('visible', 'true');
            
            // Перезапускаем анимацию с начала
            this.model.setAttribute('animation-mixer', {
                clip: '*',
                loop: 'repeat',
                timeScale: 1
            });
        }
    }

    /**
     * Обработчик потери маркера
     */
    onTargetLost() {
        this.isActive = false;
        
        if (this.model) {
            // Скрываем модель
            this.model.setAttribute('visible', 'false');
        }
    }

    /**
     * Получение статуса
     */
    getStatus() {
        return {
            targetIndex: this.targetIndex,
            isActive: this.isActive,
            modelLoaded: this.model !== null,
            type: 'glb_model'
        };
    }

    /**
     * Очистка ресурсов
     */
    destroy() {
        if (this.entity && this.entity.parentNode) {
            this.entity.parentNode.removeChild(this.entity);
        }
        this.model = null;
        this.entity = null;
        console.log('AR модель удалена');
    }
}

// Экспорт
window.CheburashkaMarker = CheburashkaMarker;