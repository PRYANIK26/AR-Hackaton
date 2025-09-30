/**
 * Простейший маркер - GLB модель с анимацией
 */

class CheburashkaMarker {
    constructor(targetIndex = 0) {
        this.targetIndex = targetIndex;
        this.entity = null;
    }

    init() {
        console.log('Инициализация AR...');
        
        if (document.readyState !== 'complete') {
            window.addEventListener('load', () => this.init());
            return;
        }

        this.createMarker();
        console.log('AR готов!');
    }

    createMarker() {
        // Находим или создаем entity для маркера
        this.entity = document.querySelector(`[mindar-image-target="targetIndex: ${this.targetIndex}"]`);
        
        if (!this.entity) {
            this.entity = document.createElement('a-entity');
            this.entity.setAttribute('mindar-image-target', `targetIndex: ${this.targetIndex}`);
            document.querySelector('#ar-scene').appendChild(this.entity);
        }

        // Создаем GLB модель ПЕРЕД маркером
        const model = document.createElement('a-gltf-model');
        model.setAttribute('src', './assets/robot-zayac.glb');
        model.setAttribute('position', '0 0 0.1');  // 0.1 метра ПЕРЕД маркером
        model.setAttribute('scale', '1 1 1');       // Подбери масштаб
        model.setAttribute('rotation', '0 0 0');
        
        // Анимация зацикленная
        model.setAttribute('animation-mixer', 'clip: *; loop: repeat');
        
        this.entity.appendChild(model);
        
        console.log('Модель добавлена перед маркером');
    }

    getStatus() {
        return { targetIndex: this.targetIndex };
    }

    destroy() {
        if (this.entity) this.entity.remove();
    }
}

window.CheburashkaMarker = CheburashkaMarker;