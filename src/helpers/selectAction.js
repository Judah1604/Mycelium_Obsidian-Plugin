import { ActionSelectModal } from "../ui/ActionSelectModal";

export function selectAction(app) {
  return new Promise((resolve) => {
    new ActionSelectModal(app, resolve).open();
  });
}
