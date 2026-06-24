import { RelatedNotesModal } from "../ui/RelatedNotesModal";

export function selectRelatedNotes(relatedNotes, app) {
  return new Promise((resolve) => {
    new RelatedNotesModal(
      app,
      relatedNotes,
      resolve,
    ).open();
  });
}