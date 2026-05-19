import {
  ASCIIFont,
  Box,
  createCliRenderer,
  SelectRenderable,
  SelectRenderableEvents
} from "@opentui/core";

import * as data from "./schema"

const renderer = await createCliRenderer({ exitOnCtrlC: true });

class Game {
  start() {
    const selector = new SelectRenderable(renderer, {
      id: "start-menu",
      width: 25,
      height: 10,
      itemSpacing: 1,
      backgroundColor: "transparent",
      focusedBackgroundColor: "transparent",
      selectedTextColor: "lime",
      selectedBackgroundColor: "transparent",
      options: [
        { name: "New Game", description: "Start a new save" },
        { name: "Load Game", description: "Load an existing save" },
        { name: "Quit", description: "Exit the game" }
      ]
    });
    
    selector.on(SelectRenderableEvents.ITEM_SELECTED, (index, option)=>{
      if (option.name == "Quit") {
        renderer.destroy();
      } else if (option.name == "New Game") {
        //
      } else if (option.name == "Load Game") {
        
      }
    })

    selector.focus();

    renderer.root.add(
      Box({alignItems: "center", justifyContent: "center", width: "100%", height: "100%"},
        Box({alignItems: "center", justifyContent: "center"},
          ASCIIFont({font: "slick", text: "Doodle Tale"})
        ),
        Box({alignItems: "center", justifyContent: "center", paddingTop: 2},
          selector
        )
      )
    )
  }
}

var game = new Game();
game.start();