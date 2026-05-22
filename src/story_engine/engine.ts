import {
  BoxRenderable,
  CliRenderer,
  MarkdownRenderable,
  SyntaxStyle,
} from "@opentui/core";
import {
  type Section,
  tokenize,
  parse_section,
  parse_dialogue,
  dialogue,
} from "./parser";

// Re-export parser utilities so callers (including tests) can import everything from engine
export { tokenize, parse_section, parse_dialogue, dialogue };

export function render_dialogue(section: Section, renderer: CliRenderer) {
  renderer.requestLive();
  renderer.root.getChildren().forEach((c) => c.destroy());

  const dialogue_box = new BoxRenderable(renderer, {
    width: 60,
    height: 20,
    border: true,
    borderStyle: "rounded",
    alignSelf: "baseline",
    justifyContent: "center",
    alignItems: "center",
    margin: 2,
  });

  const style = SyntaxStyle.fromStyles({});

  const dialogue_text = new MarkdownRenderable(renderer, {
    content: "",
    syntaxStyle: style,
  });

  dialogue_box.add(dialogue_text);
  renderer.root.add(dialogue_box);

  async function typewriter(content: string, delayMs = 30) {
    for (let i = 0; i < content.length; i++) {
      dialogue_text.content += content[i];
      await new Promise<void>((resolve) => setTimeout(resolve, delayMs));
    }
  }

  // Collect all text tokens and animate them in
  const text = section.tokens
    .filter((t) => t.type === "text")
    .map((t) => t.value)
    .join("");

  typewriter(text);
}
