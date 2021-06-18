'use babel';

export default class InspectElementView {
  constructor(serializedState) {
    // Create root element
    this.element = document.createElement('div');
    this.element.classList.add('your-name-word-count');

    // Create message element
    const message = document.createElement('div');
    message.textContent = "The YourNameWordCount package is Alive! It's ALIVE!";
    message.classList.add('message');
    this.element.appendChild(message);

    // document.addEventLister('mousemove', ({ target }) => console.log(target));
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
