import { Router } from "express";
import * as folderController from "../controller/folder-controller.js"
import multer from "multer";

const upload = multer({dest: 'uploads/'});

const folderRouter = Router();

folderRouter.get("/{*splat}", folderController.getFolderPage);
folderRouter.post("/folder", folderController.createFolder);
folderRouter.post("/", folderController.createFolderFromHome);
folderRouter.post("/delete", folderController.deleteFolder);
folderRouter.get("/one/two/three", folderController.getFolderPage);

folderRouter.post("/file", upload.single("file"), folderController.uploadFile);
folderRouter.post("/download", folderController.downloadFile);
folderRouter.post("/deleteFile", folderController.deleteFile);

export default folderRouter;