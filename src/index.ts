import {
  ASCIIFont,
  ASCIIFontRenderable,
  Box,
  createCliRenderer,
  InputRenderable,
  InputRenderableEvents,
  RGBA,
  SelectRenderable,
  SelectRenderableEvents,
  Text,
  TextAttributes,
} from "@opentui/core";
import path from "node:path";
import { Data, new_data } from "./file_manager/data";
import { directory_vis } from "./file_manager/directory_vis";

const renderer = await createCliRenderer({ exitOnCtrlC: true });

function shutdown(err: unknown) {
  renderer.destroy();
  console.error(err);
  process.exit(1);
}

process.on("uncaughtException", shutdown);
process.on("unhandledRejection", shutdown);

class Game {
  data: Data | undefined;

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
        { name: "Quit", description: "Exit the game" },
      ],
    });

    selector.on(
      SelectRenderableEvents.ITEM_SELECTED,
      async (_index, option) => {
        if (option.name === "Quit") {
          renderer.destroy();
          process.exit(0);
        } else if (option.name === "New Game") {
          renderer.root.getChildren().forEach((c) => c.destroy());

          const nameinput = new InputRenderable(renderer, {
            id: "name_input",
            width: 21,
            maxLength: 16,
            backgroundColor: "transparent",
            focusedBackgroundColor: "transparent",
            textColor: "white",
            focusedTextColor: "white",
            placeholder: "enter your name",
          });

          const title = new ASCIIFontRenderable(renderer, {
            font: "tiny",
            text: "",
          });
          const titletwo = new ASCIIFontRenderable(renderer, {
            font: "tiny",
            text: "",
          });
          const titlethree = new ASCIIFontRenderable(renderer, {
            font: "tiny",
            text: "",
          });

          renderer.root.add(
            Box(
              {
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                height: "100%",
                flexDirection: "column",
                gap: 1,
              },
              Box(
                {
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  gap: 1,
                },
                title,
                titletwo,
                titlethree,
              ),
              Box(
                { alignItems: "center", justifyContent: "center" },
                nameinput,
              ),
            ),
          );

          nameinput.on(InputRenderableEvents.ENTER, (value) => {
            if (value.trim() === "") return;
            this.data = new_data(value);
            renderer.root.getChildren().forEach((c) => c.destroy());
            renderer.setCursorStyle({
              style: "block",
              blinking: true,
              color: RGBA.fromHex("#c32b2b"),
            });
            setTimeout(() => {
              renderer.destroy();
              process.exit(0);
            }, 2000);
          });

          nameinput.focus();

          const pattern =
            "o1o1oooo1o1ooo1111ooo1o1ooo1111ooo11oo1oo1o1o1111oo1o";
          const length = 500;
          let startIndex = 0;

          setInterval(() => {
            let result = "";
            for (let i = 0; i < length; i++) {
              const charIndex = (startIndex + i) % pattern.length;
              result += pattern[charIndex];
            }
            title.text = result;
            titletwo.text = result + "o";
            titlethree.text = result + "o1";
            startIndex = (startIndex + 1) % pattern.length;
          }, 100);
        } else if (option.name === "Load Game") {
          const savesDir = path.join(import.meta.dir, "../saves");
          const loaded_data = await directory_vis(renderer, savesDir);
          if (loaded_data != null) {
            this.data = new Data(loaded_data);
            if (!this.data.valid) {
              this.data = new_data("Player");
            }
            process.exit(0);
          } else {
            renderer.destroy();
            process.exit(0);
          }
        }
      },
    );

    selector.focus();

    renderer.root.add(
      Box(
        {
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
        },
        Box(
          { alignItems: "center", justifyContent: "center" },
          ASCIIFont({ font: "slick", text: "Doodle Tale" }),
          Text({
            content: "v0.1.5",
            attributes: TextAttributes.DIM,
            alignSelf: "flex-end",
          }),
        ),
        Box(
          { alignItems: "center", justifyContent: "center", paddingTop: 2 },
          selector,
        ),
      ),
    );
  }
}

const game = new Game();
game.start();
