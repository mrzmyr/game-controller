class Gamepad {
  getState() {
    let gamepads = navigator.getGamepads();

    if([...gamepads].filter(d => d !== null).length < 1) {
      return {
        connected: false
      }
    }

    let gps = [...gamepads].filter(d => d !== null).map(gp => {
      let type = gp.id.toLowerCase().includes('generic') ? 'generic' : 'xbox';
      let indexLeftX = { generic: 0, xbox: 0 }[type];
      let indexLeftY = { generic: 1, xbox: 1 }[type];
      let indexRightX = { generic: 2, xbox: 3 }[type];
      let indexRightY = { generic: 3, xbox: 4 }[type];
      let indexRightPressed = { generic: 11, xbox: 7 }[type];
      let indexLeftPressed = { generic: 10, xbox: 6 }[type];
      let indexStartPressed = { generic: 9, xbox: 8 }[type];

      return {
        index: gp.index,
        id: gp.id,
        leftStick: { x: gp.axes[indexLeftX], y: gp.axes[indexLeftY], pressed: gp.buttons[indexLeftPressed].pressed },
        rightStick: { x: gp.axes[indexRightX], y: gp.axes[indexRightY], pressed: gp.buttons[indexRightPressed].pressed },
        start: { pressed: gp.buttons[8].pressed },
      }
    })

    return {
      connected: true,
      gamepads: gps,
    };
  }
}

export default new Gamepad();