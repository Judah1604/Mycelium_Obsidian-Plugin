// ui/ActionSelectModal.js
import { Modal, Setting } from "obsidian";

export class ActionSelectModal extends Modal {
  constructor(app, resolve) {
    super(app);
    this.resolve = resolve;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.createEl("h1", { text: "Mycelium" });
    contentEl.createEl("p", { text: "What would you like to do?" });

    new Setting(contentEl)
      .setName("Analyze this note")
      .setDesc("Identify assumptions, weak points, and questions in this note.")
      .addButton((button) =>
        button
          .setButtonText("Analyze")
          .onClick(() => {
            this.resolve("analyze");
            this.close();
          })
      );

    new Setting(contentEl)
      .setName("Compare this note")
      .setDesc("Compare this note against related notes in your vault.")
      .addButton((button) =>
        button
          .setButtonText("Compare")
          .setCta()
          .onClick(() => {
            this.resolve("compare");
            this.close();
          })
      );
    new Setting(contentEl)
      .setName("Build Analysis Cache")
      .setDesc("Build analysis cache for all notes.")
      .addButton((button) =>
        button
          .setButtonText("Run")
          .setCta()
          .onClick(() => {
            this.resolve("buildcache");
            this.close();
          })
      );
  }

  onClose() {
    this.contentEl.empty();
  }
}