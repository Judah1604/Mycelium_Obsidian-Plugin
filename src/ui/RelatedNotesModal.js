import { Modal, Setting } from "obsidian";

export class RelatedNotesModal extends Modal {
  constructor(app, relatedNotes, resolve) {
    super(app);

    this.relatedNotes = relatedNotes;
    this.resolve = resolve;

    // Pre-select all notes
    this.selectedNotes = new Set(relatedNotes);
  }

  onOpen() {
    const { contentEl } = this;

    contentEl.createEl("h2", {
      text: "Select Related Notes",
    });

    this.relatedNotes.forEach((note) => {
      new Setting(contentEl)
        .setName(note.file)
        .setDesc(`Score: ${note.score} • ${note.lines} lines`)
        .addToggle((toggle) =>
          toggle
            .setValue(true)
            .onChange((value) => {
              if (value) {
                this.selectedNotes.add(note);
              } else {
                this.selectedNotes.delete(note);
              }
            }),
        );
    });

    new Setting(contentEl).addButton((button) =>
      button
        .setButtonText("Analyze")
        .setCta()
        .onClick(() => {
          this.resolve([...this.selectedNotes]);
          this.close();
        }),
    );
  }

  onClose() {
    this.contentEl.empty();
  }
}