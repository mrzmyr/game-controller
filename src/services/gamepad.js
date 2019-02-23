class Gamepad {
  getState() {
    let gamepads = navigator.getGamepads();

    if([...gamepads].filter(d => d !== null).length < 1) {
      return {
        connected: false
      }
    }

    let gp = gamepads[0];

    return {
      connected: true,
      buttons: gp.buttons.map((d, i) => { 
        return { 
          index: i,
          pressed: d.pressed,
          value: d.value
        }
      }),
      axes: gp.axes
    };
  }
}

export default new Gamepad();