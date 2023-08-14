import { html, LitElement } from 'lit';
import { LivingWccellStyles } from './living-wccell-styles.js';

export class LivingWccell extends LitElement {

  static get properties() {
    return  {
      id: { type: String },
      position: { type: Object },
      diameter: { type: String },
      type: { type: Number },
      cycle: { type: Object },
      age: { type: Number },
      memory: { type: Array },
      worldLayer: { type: Object },
      modeMove: { type: String, attribute: 'mode-move', reflect: true },
      maxCellsControl: { type: Number, attribute: 'max-cells-control' },
      sterile: { type: Boolean, reflect: true },
      gender: { type: String, reflect: true },
      maxNumSons: { type: Number },
    }
  };

  static get styles() {
    return [LivingWccellStyles];
 }

  constructor() {
    super();
    this._maxWidth = 800;
    this._maxHeight = 600;
    this._maxRadius = 50;
    this.worldLayer = this.parentElement;
    this.id = `wccell-${  this.randomNum(1, 1000)  }-${  new Date().getTime()}`;
    this.position = {
      top: `${this.randomNum(this._maxRadius, this._maxHeight - this._maxRadius)}px`,
      left: `${this.randomNum(this._maxRadius, this._maxWidth - this._maxRadius)}px`
    };
    this.diameter = '10px';
    this.type = this.randomNum(0, 3);
    this.color = this.randomNum(0, 36);
    this.age = 0;
    const maxLife = 25;
    const minLife = 18;
    this.cycle = {
      life: this.randomNum(minLife, maxLife),
      reproduction: this.randomNum(minLife - 10, maxLife - 10)
    };
    this._growthTime = 1000;
    this._moveTime = 300;
    this.memory = [];

    this._deathTime = this.cycle.life * 1000;

    this._bindingMethods();

    // this.modeMove = 'vibration';
    this.moveType = {
      'vibration': this.moveMode1,
      'lineal': this.moveMode2,
    };

    this.minSpeed = 2;
    this.maxSpeed = 7;
    this.angle = parseInt(Math.random() * 360, 10);
    this.speed = Math.random() * (this.maxSpeed - this.minSpeed) + this.minSpeed;

    this.maxCellsControl = 70;
    this.sterile = false;
    this.typeGender = ['male', 'female'];
    this.gender = this.typeGender[Math.floor(Math.random() * 2)];
    this.maxNumChildren = 3;
    this.numChildren = 0;
 }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener('living-wccell_STOP', this._stopMyLife);
    document.addEventListener('living-wccell_RESTART', this._restartMyLife);
    this._startMyLife();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._stopMyLife();
    document.removeEventListener('living-wccell_STOP', this._stopMyLife);
    document.removeEventListener('living-wccell_RESTART', this._restartMyLife);
  }

  _bindingMethods() {
    this.death = this.death.bind(this);
    this.growth = this.growth.bind(this);
    this.move = this.move.bind(this);
    this._searchForACell = this._searchForACell.bind(this);
    this._stopMyLife = this._stopMyLife.bind(this);
    this._restartMyLife = this._restartMyLife.bind(this);
  }

  death() {
    this.dispatchEvent(new CustomEvent('living-wccell_i-die', { detail: this.id }));
    this.remove();
  }

  move() {
    this.moveType[this.modeMove].call(this);
  }

  moveMode1() {
    const parsedTop = parseInt(this.position.top, 10);
    const parsedLeft = parseInt(this.position.left, 10);
    const newTop = parsedTop + this.randomNum(-10, 10);
    const newLeft = parsedLeft + this.randomNum(-10, 10);
    if (newTop >= 0 && newTop <= this._maxHeight - this._maxRadius) {
      this.position.top = `${newTop}px`;
    }
    if (newLeft >= 0 && newLeft <= this._maxWidth - this._maxRadius) {
      this.position.left = `${newLeft}px`;
    }
    this._livingWccellMoveEvent();
    this._setStyles();

    if (!this.stopStatus) {
      // eslint-disable-next-line no-new
      requestAnimationFrame(this.moveMode1.bind(this));
    }
  }

  moveMode2() {
    const radians = this.angle * (Math.PI / 180);
    const dx = Math.cos(radians) * this.speed;
    const dy = Math.sin(radians) * this.speed;
    this.position.left = `${parseInt(this.position.left, 10) + dx  }`;
    this.position.top = `${parseInt(this.position.top, 10) + dy  }`;
     if (this.position.left < 0 || this.position.left > (this._maxWidth - parseInt(this.diameter, 10))) {
      this.angle = 180 - this.angle;
    }
     if (this.position.top < 0 || this.position.top > (this._maxHeight - parseInt(this.diameter, 10))) {
      this.angle = 360 - this.angle;
    }
    this.position.top += 'px';
    this.position.left += 'px';
  
    this._livingWccellMoveEvent();
    this._setStyles();
 
    if (!this.stopStatus) {
      requestAnimationFrame(this.moveMode2.bind(this));
    }
  }

  growth() {
    this.age += 1;
    if (parseInt(this.diameter, 10) < 50) {
      this.diameter = `${parseInt(this.diameter, 10) + 5}px`;
      this._setStyles();
    }
    if (this.age >= this.cycle.reproduction) {
      this.reproductionStatus = true;
    }
  }

  _livingWccellMoveEvent() {
    document.dispatchEvent(
      new CustomEvent('living-wccell_move', {
        detail: {
          id: this.id,
          position: this.position,
          diameter: this.diameter,
          age: this.age,
          reproductionStatus: this.reproductionStatus,
          sterile: this.sterile,
          gender: this.gender,
          numChildren: this.numChildren,
        }
      })
    );
  }

  _setStyles() {
    const styles = this._cellStyles;
    styles.top = `${this.position.top}`;
    styles.left = `${this.position.left}`;
    styles.width = this.diameter;
    styles.height = this.diameter;
    styles.backgroundColor = `hsl(${this.color * 10}, 100%, 50%)`;
    if (this.age === this.cycle.life - 1) {
      styles.animationName = 'death' ;
    }
    if (this.sterile) {
      styles.opacity = '0.5';
    } else {
      styles.opacity = '1';
    }
    if (this.gender === 'male') {
      styles.border = '5px solid #000';
    } else {
      styles.border = '5px dotted #000';
    }
  }

  _searchForACell(e) {
    if (e.detail.id !== this.id) {
      // console.log(this._doItFoundACell(e));
      if (this._doItFoundACell(e)) {
        this._otherCellFound(e);
      }
      // this.specimensNumber[e.detail.id] = e.detail.age;
    }
  }

  _calculateDistance(e) {
    const x = parseInt(this.position.top, 10) - parseInt(e.detail.position.top, 10);
    const y = parseInt(this.position.left, 10) - parseInt(e.detail.position.left, 10);
    // console.log(this.position, e.detail.position);
    return Math.sqrt(x * x + y * y);
  }

  _doItFoundACell(e) {
    const distance = this._calculateDistance(e);
    const sumRadius = parseInt(this.diameter, 10)/2 + parseInt(e.detail.diameter, 10)/2;
    return (distance <= sumRadius);
  }

  _otherCellFound(e) {
    if (!this.memory.includes(e.detail.id)) {
      if (document.querySelectorAll("living-wccell").length <= this.maxCellsControl/2 && this.sterile) {
        this.sterile = false;
      }
      if (this.reproductionStatus &&
          !this.sterile && 
          e.detail.reproductionStatus && 
          !e.detail.sterile && 
          this.numChildren <= this.maxNumChildren && 
          e.detail.numChildren <= this.maxNumChildren &&
          this.gender === 'female' &&
          e.detail.gender === 'male') {
        this._insertCell(e);
        this.memory.push(e.detail.id);
        this.numChildren += 1;
      }
    }
  }

  _restartMyLife() {
    this._stopMyLife();
    this._startMyLife();
    this.move();
  }

  _startMyLife() {
    this.stopStatus = false;
    this._deathTimer = setTimeout(this.death, this._deathTime);
    this.growthId = setInterval(this.growth, this._growthTime);
    document.addEventListener('living-wccell_move', this._searchForACell);
    this._searchForACell = this._searchForACell.bind(this);
  }

  _stopMyLife() {
    this.stopStatus = true;
    clearInterval(this.growthId);
    clearTimeout(this._deathTimer);
    document.removeEventListener('living-wccell_move', this._searchForACell);
  }

  addPositionCell(id) {
    const newCell = document.getElementById(id);
    if (newCell) {
      newCell.position = {
        top: this.position.top,
        left: this.position.left,
      };
    }
  }

  _insertCell(e) {
    const idParts = this.id.split('-');
    const idPartsDetail = e.detail.id.split('-');
    const id = `${idParts[0]}-${parseInt(idParts[1]+idPartsDetail[1], 10)}-${parseInt(Math.random() * 100000, 10)}`;
    // console.log(`created cell with id ${id}`);
    if (!document.getElementById(id)) {
      const sterile = (document.querySelectorAll("living-wccell").length >= this.maxCellsControl) ? ' sterile="true"': '';
      const livingWCcell = `<living-wccell id="${id}" max-cells-control="${this.maxCellsControl}" mode-move="${this.modeMove}"${sterile}></living-wccell>`;
      this.worldLayer.insertAdjacentHTML('beforeend', livingWCcell);
      setTimeout(() => {
        this.addPositionCell(id);
      }, 100);
    }
  }

  randomNum(min, max) {
    this._null = null;
    return parseInt(Math.random() * (max + 1 - min), 10) + min;
  }

  firstUpdated() {
    this._cellStyles = this.shadowRoot.querySelector('.cell').style;
    this._setStyles();
    this.move();
  }

  render() {
    return html`
      <div class="cell">${this.age}</div>
    `;
  }
}
