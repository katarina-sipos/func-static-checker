'use babel';

export default class FuncStaticCheckerView {

  constructor(serializedState) {
    // Create root element
    this.element = document.createElement('div');
    this.element.classList.add('func-static-checker');
    //this.element.classList.add('Func static-checker');

    // Create message element
    const message = document.createElement('div');
    message.textContent = 'The Func Static Checker package is Alive! It\'s ALIVE!';
    message.classList.add('message');
    this.element.appendChild(message);
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    this.element.remove();
  }

  getElement() {
    return this.element;
  }

}
