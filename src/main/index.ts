import { app } from "electron";
import {
  registerHandlers,
  registerWorkspaceHandlers,
  registerUIHandlers,
} from "./ipc";
import { restoreOrCreateWindow } from "./window";
import { registerProtocol } from "./protocol";

app.on("window-all-closed", () => {
  if (process.platform === "darwin") app.quit();
});

app
  .whenReady()
  .then(registerProtocol)
  .then(restoreOrCreateWindow)
  .then((browserWindow) => {
    registerUIHandlers(browserWindow);
    registerWorkspaceHandlers();
    registerHandlers();
  })
  .catch((e) => console.error("create window failed: ", e));
